"""Decision.risk FK to projects.Risk.

Audit bonus finding — Decisions are often taken specifically in response to a
Risk (mitigation approved, owner reassigned, escalation closed). Until now,
the link was at best implicit via free-text. Adds an explicit FK so the
Decisions UI can offer a Risk picker and render a clickable Risk badge on
each decision card.

Cross-app FK uses the string reference 'projects.Risk' so the migration graph
is independent of import order. SET_NULL preserves the historical decision
record if the risk row is later removed.

The field is nullable + additive — safe on production volumes that already
contain Decision rows; they resolve to NULL.
"""
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('governance', '0006_meeting_board_fk'),
        # The Risk model lives in projects; we don't pin a specific projects
        # migration here because Risk has existed since the initial schema.
        # Django will resolve the FK against whatever the latest projects
        # migration is at apply time.
        ('projects', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='decision',
            name='risk',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='governance_decisions',
                to='projects.risk',
            ),
        ),
    ]
