from django.db import transaction
from rest_framework import serializers
from rest_framework.serializers import ModelSerializer

from credit_policy.models import CreditPolicy, Condition, Attribute
from credit_policy.models.condition import ExpressionParser
from credit_policy.serializers import ConditionTreeSerializer, ConditionCreateSerializer


class AttributeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attribute
        exclude = ('policy',)


class CreditPolicySerializer(serializers.ModelSerializer):
    condition_tree = ConditionTreeSerializer(source="root_condition")
    attributes = AttributeSerializer(many=True)

    class Meta:
        model = CreditPolicy
        fields = '__all__'


class CreditPolicyCreateSerializer(ModelSerializer):
    root_condition = ConditionCreateSerializer()
    attributes = AttributeSerializer(many=True)

    class Meta:
        model = CreditPolicy
        exclude = ('created_on', 'is_complete', 'code',)

    def create(self, validated_data):
        attributes_data = validated_data.pop('attributes')
        root_condition = validated_data.pop('root_condition')

        with transaction.atomic():
            credit_policy = super().create(validated_data)

            attributes = []
            for attribute_data in attributes_data:
                attribute_data["policy"] = credit_policy
                attributes.append(Attribute(**attribute_data))
            Attribute.objects.bulk_create(attributes)

            # Validate Expression.
            ExpressionParser.validate(credit_policy, root_condition["expression"])

            root_condition['policy'] = credit_policy
            root_condition['is_root'] = True
            Condition.objects.create(**root_condition)

            # If credit policy is complete then mark it as complete too.
            try:
                credit_policy.mark_complete()
            except Exception as e:
                pass

        return credit_policy