import builtins
import random
import re
import string

from django.core.validators import RegexValidator
from django.db import models
from rest_framework.exceptions import ValidationError

from credit_policy.models import Attribute
from credit_policy.models.credit_policy import CreditPolicy


def id_generator(size=6, chars=string.ascii_uppercase + string.digits):
	return ''.join(random.choice(chars) for _ in range(size))


def generate_code():
	return "CO-{}".format(id_generator(8))


class Condition(models.Model):
	name = models.CharField(max_length=256, default=generate_code)
	expression = models.CharField(max_length=500)

	policy = models.ForeignKey(CreditPolicy, related_name="conditions", on_delete=models.PROTECT)
	is_root = models.BooleanField(default=False)

	t_child = models.ForeignKey("self", null=True, related_name="+", on_delete=models.PROTECT)
	f_child = models.ForeignKey("self", null=True, related_name="+", on_delete=models.PROTECT)

	t_terminal = models.CharField(max_length=6, validators=[RegexValidator(regex="ACCEPT|REJECT")], null=True)
	f_terminal = models.CharField(max_length=6, validators=[RegexValidator(regex="ACCEPT|REJECT")], null=True)

	rejected_reason = models.CharField(max_length=256, null=True)
	created_on = models.DateTimeField(auto_now_add=True)

	def validate_expression(self):
		return ExpressionParser.validate(self.policy, self.expression)

	def validate_root(self):
		policy_root_condition = self.policy.root_condition
		if self.is_root and policy_root_condition != self:
			raise ValueError("Policy can have only one root condition")
		return policy_root_condition

	def check_terminal_validity(self):
		if self.t_child is None and not self.t_terminal:
			raise ValueError("Terminal value for True condition not set for condition {0}".format(self.id))

		if self.f_child is None and not self.f_terminal:
			raise ValueError("Terminal value for False condition not set for condition {0}".format(self.id))

	def check_validity(self):
		self.validate_expression()
		self.validate_root()
		self.check_terminal_validity()

	def evaluate(self, data):
		self.check_validity()
		expression = string.Template(self.expression)
		expression = expression.safe_substitute(data)
		r = eval(expression)
		if r:
			return self.t_terminal if self.t_terminal else self.t_child
		else:
			return self.f_terminal if self.f_terminal else self.f_child


class ExpressionParser:
	attributes_regex = re.compile("\$[a-zA-Z_][a-zA-Z_\d]+")

	@classmethod
	def validate(cls, policy, expression):
		condition_attributes = set(re.findall(cls.attributes_regex, expression))
		policy_attributes = Attribute.objects.filter(policy=policy)
		policy_attribute_names = set(map(lambda attr: "$" + attr.name, policy_attributes))

		missing_policy_attributes = condition_attributes - policy_attribute_names
		if missing_policy_attributes:
			raise ValidationError("Attributes missing {0} in policy".format(",".join(missing_policy_attributes)))

		test_data = {attr.name: getattr(builtins, attr.type)(attr.example_value) for attr in policy_attributes}
		try:
			eval(string.Template(expression).safe_substitute(test_data))
		except Exception as e:
			raise ValidationError("Invalid Expression: {0}".format(e))
