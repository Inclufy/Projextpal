"""Rename the historic 'contibuter' role spelling to 'contributor'.

Historic typo across backend/frontend. We now canonicalise on 'contributor':
  * ROLE_CHOICES: ('contibuter', 'Contibuter') → ('contributor', 'Contributor')
  * CustomUser.role data rows updated via RunPython
  * TeamInvitation.role likewise

Non-destructive, additive-with-default: any pre-existing 'contibuter' row is
rewritten in place; the field keeps same column type (CharField). An older
backend image rolled back after this migration still accepts 'contributor'
reads (ChoiceField tolerance), so rollback-safety is preserved.
"""
from django.db import migrations


def rename_role(apps, schema_editor):
    CustomUser = apps.get_model("accounts", "CustomUser")
    CustomUser.objects.filter(role="contibuter").update(role="contributor")
    try:
        TeamInvitation = apps.get_model("accounts", "TeamInvitation")
        TeamInvitation.objects.filter(role="contibuter").update(role="contributor")
    except LookupError:
        pass


def rename_role_back(apps, schema_editor):
    CustomUser = apps.get_model("accounts", "CustomUser")
    CustomUser.objects.filter(role="contributor").update(role="contibuter")
    try:
        TeamInvitation = apps.get_model("accounts", "TeamInvitation")
        TeamInvitation.objects.filter(role="contributor").update(role="contibuter")
    except LookupError:
        pass


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0026_s7_cost_planner_base"),
    ]

    operations = [
        migrations.RunPython(rename_role, rename_role_back),
    ]
