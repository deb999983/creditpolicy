# Generated by Django 4.0.3 on 2022-03-05 16:35

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('credit_policy', '0004_alter_condition_f_terminal_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='creditpolicy',
            name='is_complete',
            field=models.BooleanField(default=False),
        ),
    ]