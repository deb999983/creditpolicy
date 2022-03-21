from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from credit_policy.models import Condition


class ConditionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Condition
        fields = ('name', 'expression',)

    def validate_expression(self, expression):
        return expression


class ConditionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Condition
        fields = '__all__'


class ConditionTreeSerializer(serializers.Serializer):
    class Meta:
        model = Condition
        exclude = ('policy',)

    def to_representation(self, condition):
        condition_data = ConditionSerializer(condition).data
        if condition.t_child:
            condition_data['t_child'] = self.to_representation(condition.t_child)

        if condition.f_child:
            condition_data['f_child'] = self.to_representation(condition.f_child)

        return condition_data


class ConditionChildCreateSerializer(serializers.Serializer):
    terminal_value = serializers.CharField(required=False)
    condition = ConditionCreateSerializer(required=False)
    rejection_reason = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        terminal_value, condition, rejection_reason = attrs.get('terminal_value'), attrs.get('condition'), attrs.get('rejection_reason')
        val = self.context["view"].kwargs.get('val')

        if not (bool(terminal_value) ^ bool(condition)):
            raise ValidationError("{0} child can have one of 3 possible values [ACCEPT, REJECT or a CONDITION, please provide.".format(val))

        if terminal_value == "REJECT" and not rejection_reason:
            raise ValidationError("Please set a rejection reason, for the condition")

        return attrs


class ConditionUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        fields = ('name', 'expression', 'rejected_reason', 't_terminal', 'f_terminal',)
        model = Condition
