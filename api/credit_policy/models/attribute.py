from django.db import models

from credit_policy.models import CreditPolicy


class Attribute(models.Model):
	TYPE_CHOICES = (
		("int", "NUMBER"),
		("str", "STRING")
	)

	name = models.CharField(max_length=256)
	type = models.CharField(max_length=3, choices=TYPE_CHOICES)
	example_value = models.CharField(max_length=256, null=True)
	policy = models.ForeignKey(CreditPolicy, on_delete=models.CASCADE, related_name="attributes")
	created_on = models.DateTimeField(auto_now_add=True)

	class Meta:
		unique_together = ('name', 'policy',)

