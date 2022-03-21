from django.db import transaction
from django.db.models import Q
from rest_framework.exceptions import ValidationError
from rest_framework.generics import DestroyAPIView

from credit_policy.models import Condition
from credit_policy.models.condition import ExpressionParser
from credit_policy.serializers.condition import ConditionChildCreateSerializer, ConditionSerializer, \
	ConditionUpdateSerializer
from utils.views.generics import CreateAPIView, UpdateAPIView


class ConditionCreateView(CreateAPIView):
	queryset = Condition.objects.all()
	serializer_class = ConditionChildCreateSerializer

	def get_output_serializer_class(self):
		return ConditionSerializer

	def perform_create(self, serializer):
		condition = self.get_object()
		terminal = "t_terminal" if self.kwargs["val"] == "true" else "f_terminal"
		child = "t_child" if self.kwargs["val"] == "true" else "f_child"

		data = serializer.validated_data
		with transaction.atomic():
			terminal_value = data.get("terminal_value")
			if data.get("terminal_value"):
				setattr(condition, terminal, data.get("terminal_value"))
				if terminal_value == "REJECT":
					condition.rejected_reason = data.get("rejection_reason", condition.name + " Failed")
			else:
				ExpressionParser.validate(condition.policy, data["condition"]["expression"])
				child_condition = Condition.objects.create(**data["condition"], policy=condition.policy)
				setattr(condition, child, child_condition)

			condition.save()

			# Try to mark policy as complete, if each condition has a valid child.
			try:
				condition.policy.check_completeness()
			except ValueError as e:
				pass

		return condition


class ConditionUpdateRemoveView(UpdateAPIView, DestroyAPIView):
	queryset = Condition.objects.all()
	serializer_class = ConditionUpdateSerializer

	def get_output_serializer_class(self):
		return ConditionSerializer

	def perform_update(self, serializer):
		instance = serializer.instance
		with transaction.atomic():
			instance = super().perform_update(serializer)
			instance.policy.check_completeness()
		return instance



	def perform_destroy(self, instance: Condition):
		if instance.is_root:
			raise ValidationError("Root Condition cannot be deleted")

		parent = Condition.objects.filter(Q(t_child=instance) | Q(f_child=instance)).first()

		with transaction.atomic():
			# Remove reference of the child condition from it's parent.
			if parent.t_child == instance:
				parent.t_child = None
				parent.save()
			else:
				parent.f_child = None
				parent.save()

			# Delete main condition.
			self.delete_condition(instance)

			# Mark Policy incomplete as a condition is getting deleted
			instance.policy.check_completeness()

	def delete_condition(self, condition):
		if condition.t_child:
			t_child = condition.t_child
			condition.t_child = None
			condition.save()
			self.delete_condition(t_child)

		if condition.f_child:
			f_child = condition.f_child
			condition.f_child = None
			condition.save()
			self.delete_condition(f_child)

		# After deleting the children, delete the parent condition.
		condition.delete()
