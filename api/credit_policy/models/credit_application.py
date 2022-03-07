from django.db import models

from credit_policy.models import CreditPolicy


class CreditApplication(models.Model):
    applicant_name = models.CharField(max_length=255)
    applicant_mobile = models.CharField(max_length=15)

    policy = models.ForeignKey(CreditPolicy, on_delete=models.PROTECT)
    policy_data = models.JSONField()
    created_on = models.DateTimeField(auto_now_add=True)

    result = models.JSONField()
