"""Meeting.board FK to GovernanceBoard.

Loose-end fix from the relationality work — until now, BoardDetail's Meetings
panel had to use a program-scoped query and filter client-side, because a
Meeting only had a `program` FK. Adding the explicit `board` FK lets the
panel query `/api/v1/governance/meetings/?board=<id>` directly.

The field is nullable + SET_NULL: deleting a board preserves the historical
meeting record, and existing rows resolve to NULL (the frontend keeps a
program-scoped fallback for legacy rows so nothing regresses).

`related_name='meetings_explicit'` avoids clashing with the reverse accessor
that would otherwise collide with `Meeting.program`'s `governance_meetings`.
"""
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('governance', '0005_decision_board_meeting_fks'),
    ]

    operations = [
        migrations.AddField(
            model_name='meeting',
            name='board',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='meetings_explicit',
                to='governance.governanceboard',
            ),
        ),
    ]
