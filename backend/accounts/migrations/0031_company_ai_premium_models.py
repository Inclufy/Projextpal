"""Model-tier C: Enterprise opt-in for premium (Opus) models.

Adds Company.ai_premium_models BooleanField(default=False).

Default False means every tenant gets the Sonnet-first (heavy) /
Haiku-first (light) ladder, which keeps our bruto marge on pool pricing
healthy (~80% vs the ~23% we had when every surface used Opus).

True (opt-in, usually at Enterprise plan or on request) escalates the
heavy draft ladder to Opus-first and light draft ladder to Sonnet-first,
for tenants that prioritise maximum output quality over cost.
"""
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0030_company_ai_token_caps"),
    ]

    operations = [
        migrations.AddField(
            model_name="company",
            name="ai_premium_models",
            field=models.BooleanField(
                default=False,
                help_text=(
                    "Grant this tenant access to premium (Opus) models for "
                    "heavy auto-drafts. Default False = Sonnet-first ladder "
                    "(~80% bruto marge). True = Opus-first ladder, higher "
                    "inkoop but Enterprise-tier quality guarantee."
                ),
            ),
        ),
    ]
