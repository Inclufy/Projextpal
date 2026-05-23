"""Decision FKs to GovernanceBoard + Meeting.

Audit fix #5 (relationality-audit-2026-05-23) — adds the linkage that makes
the BoardDetail "Decisions taken by this board" panel meaningful, and lets a
Decision be tied to the specific Meeting in which it was taken.

Both FKs are nullable + SET_NULL: deleting a board or meeting preserves the
historical decision record. Migration is purely additive — safe to apply on
production volumes that already contain Decision rows (they resolve to NULL).
"""
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('governance', '0004_meeting_decision_program_nullable'),
    ]

    operations = [
        migrations.AddField(
            model_name='decision',
            name='board',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='decisions',
                to='governance.governanceboard',
            ),
        ),
        migrations.AddField(
            model_name='decision',
            name='meeting',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='decisions',
                to='governance.meeting',
            ),
        ),
    ]
