from django.db import transaction

from credit_policy.models import Attribute, CreditPolicy, Condition


def create_credit_policies():
    if CreditPolicy.objects.count():
        return

    with transaction.atomic():
        cp = CreditPolicy.objects.create(name="New Bank Policy")
        attributes_data = [
            {"name": "customer_income", "type": "int", "example_value": 1000, "policy": cp},
            {"name": "customer_debt", "type": "int", "example_value": 500, "policy": cp},
            {"name": "payment_remarks_12m", "type": "int", "example_value": 1, "policy": cp},
            {"name": "payment_remarks", "type": "int", "example_value": 0, "policy": cp},
            {"name": "age", "type": "int", "example_value": 18, "policy": cp}
        ]

        attributes = []
        for attribute_data in attributes_data:
            attributes.append(Attribute(**attribute_data))

        Attribute.objects.bulk_create(attributes)

        ic = Condition.objects.create(name="Income Check", is_root=True, expression="$customer_income >= 500", policy=cp, f_terminal="REJECT", rejected_reason="LOW_INCOME")
        cc = Condition.objects.create(name="Credit Check", expression="$customer_debt >= 0.5 * $customer_income", policy=cp, t_terminal="REJECT", rejected_reason="HIGH_DEBT_FOR_INCOME")
        prm_12m = Condition.objects.create(name="Payment Remarks 12m Check", expression="$payment_remarks_12m > 0", policy=cp, t_terminal="REJECT", rejected_reason="PAYMENT_REMARKS_12M")
        prm = Condition.objects.create(name="Payment Remarks Check", expression="$payment_remarks > 1", policy=cp, t_terminal="REJECT", rejected_reason="PAYMENT_REMARKS")
        age = Condition.objects.create(name="Payment Remarks Check", expression="$age >= 18", policy=cp, f_terminal="REJECT", t_terminal="ACCEPT", rejected_reason="UNDERAGE")

        ic.t_child = cc
        ic.save()

        cc.f_child = prm_12m
        cc.save()

        prm_12m.f_child = prm
        prm_12m.save()

        prm.f_child = age
        prm.save()

        cp.mark_complete()

        # Add an incomplete policy
        cp = CreditPolicy.objects.create(name="Bank Policy 101")
        attributes_data = [
            {"name": "customer_income", "type": "int", "example_value": 1000, "policy": cp},
            {"name": "customer_debt", "type": "int", "example_value": 500, "policy": cp},
            {"name": "payment_remarks_12m", "type": "int", "example_value": 1, "policy": cp},
            {"name": "payment_remarks", "type": "int", "example_value": 0, "policy": cp},
            {"name": "age", "type": "int", "example_value": 18, "policy": cp}
        ]

        attributes = []
        for attribute_data in attributes_data:
            attributes.append(Attribute(**attribute_data))

        Attribute.objects.bulk_create(attributes)
        ic = Condition.objects.create(name="Income Check", is_root=True, expression="$customer_income >= 500", policy=cp,  rejected_reason="LOW_INCOME")
