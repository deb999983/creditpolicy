from django.db import transaction

from credit_policy.models import Condition
from credit_policy.models.condition import ExpressionParser
from credit_policy.serializers.condition import ConditionChildCreateSerializer, ConditionSerializer
from utils.views.generics import CreateAPIView


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
				condition.policy.mark_complete()
			except ValueError as e:
				pass

		return condition
