import random
import string

from django.db import models


def id_generator(size=6, chars=string.ascii_uppercase + string.digits):
	return ''.join(random.choice(chars) for _ in range(size))


def generate_code():
	return "CP-{}".format(id_generator(4))


class CreditPolicy(models.Model):
	name = models.CharField(max_length=256)
	code = models.CharField(max_length=7, default=generate_code, unique=True)
	created_on = models.DateTimeField(auto_now_add=True)
	is_complete = models.BooleanField(default=False)

	@property
	def root_condition(self):
		return self.conditions.filter(is_root=True).first()

	def validate(self, condition=None):
		condition = condition or self.root_condition

		condition.check_validity()

		condition.t_child and self.validate(condition.t_child)
		condition.f_child and self.validate(condition.f_child)

	def evaluate(self, data, condition=None):
		condition = condition or self.root_condition
		result = condition.evaluate(data)
		if result == "ACCEPT":
			return result, None

		if result == "REJECT":
			return result, condition.rejected_reason

		result, rejected_condition = self.evaluate(data, result)
		return result, rejected_condition
