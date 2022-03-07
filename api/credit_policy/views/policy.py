from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from rest_framework.generics import RetrieveAPIView
from rest_framework.response import Response

from credit_policy.models import CreditPolicy, Attribute
from credit_policy.serializers import CreditPolicySerializer, CreditPolicyCreateSerializer
from credit_policy.serializers.policy import AttributeSerializer
from utils.views.generics import ListCreateAPIView, CreateAPIView, UpdateAPIView


class PolicyListCreateView(ListCreateAPIView):

    queryset = CreditPolicy.objects.all()
    serializer_class = CreditPolicyCreateSerializer

    def get_serializer_class(self):
        return CreditPolicySerializer if self.request.method == "GET" else self.serializer_class

    def get_output_serializer_class(self):
        return CreditPolicySerializer

    def perform_create(self, serializer):
        incomplete_policy = CreditPolicy.objects.filter(is_complete=False).first()
        if incomplete_policy:
            raise ValidationError(
                "You have left CreditPolicy {0} incomplete, please complete it before creating a new one".format(incomplete_policy.id)
            )
        return super().perform_create(serializer)


class PolicyDetailView(RetrieveAPIView):
    queryset = CreditPolicy.objects.all()
    serializer_class = CreditPolicySerializer


class PolicyCompleteView(CreateAPIView):
    class EmptySerializer(serializers.Serializer):
        pass

    queryset = CreditPolicy.objects.all()
    serializer_class = EmptySerializer

    def get_output_serializer_class(self):
        return CreditPolicySerializer

    def perform_create(self, serializer):
        credit_policy: CreditPolicy = self.get_object()
        try:
            credit_policy.mark_complete()
        except ValueError as e:
            raise ValidationError(e)
        return credit_policy


class PolicyAttributesUpdateView(UpdateAPIView):

    queryset = CreditPolicy.objects.all()
    serializer_class = AttributeSerializer

    def get_serializer(self, *args, **kwargs):
        kwargs["many"] = True
        return super().get_serializer(*args, **kwargs)

    def get_output_serializer_class(self):
        return CreditPolicySerializer

    def perform_update(self, serializer):
        policy = self.get_object()
        policy.attributes.all().delete()

        attributes = []
        for attribute_data in serializer.validated_data:
            attribute_data["policy"] = policy
            attributes.append(Attribute(**attribute_data))
        Attribute.objects.bulk_create(attributes)
        return policy


class ApplyForCreditView(CreateAPIView):
    class ApplyForCreditSerializer(serializers.Serializer):
        policy_data = serializers.JSONField()

    queryset = CreditPolicy.objects.all()
    serializer_class = ApplyForCreditSerializer

    def perform_create(self, serializer):
        credit_policy = self.get_object()
        if not credit_policy.is_complete:
            raise ValidationError("Credit policy is not complete")

        result, rejection_reason = credit_policy.evaluate(serializer.validated_data["policy_data"])
        return Response(data={"result": result, "rejection_reason": rejection_reason}, status=201 if not rejection_reason else 400)
