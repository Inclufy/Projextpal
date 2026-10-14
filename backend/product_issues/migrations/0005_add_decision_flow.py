# Sprint 12 — decision-request flow in auto-fix pipeline.
# Additive schema: new 'needs-decision' status + 4 fields (3 JSON + 1 timestamp).
# All existing rows take defaults (empty list/dict, NULL timestamp).

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        # 0004_add_metadata_claude_auto_triage already landed on prod ahead
        # of this branch (origin/master was behind). Depend on it so the
        # DAG stays linear instead of forking.
        ('product_issues', '0004_add_metadata_claude_auto_triage'),
    ]

    operations = [
        migrations.AlterField(
            model_name='productissue',
            name='status',
            field=models.CharField(
                choices=[
                    ('new', 'New'),
                    ('triaging', 'Triaging (agent running)'),
                    ('needs-info', 'Needs more info from reporter'),
                    ('needs-decision', 'Needs decision from reporter / tenant admin'),
                    ('accepted', 'Accepted'),
                    ('in-progress', 'In progress'),
                    ('resolved', 'Resolved'),
                    ('wont-fix', "Won't fix"),
                    ('duplicate', 'Duplicate'),
                    ('closed', 'Closed'),
                ],
                db_index=True,
                default='new',
                max_length=24,
            ),
        ),
        migrations.AddField(
            model_name='productissue',
            name='decision_questions',
            field=models.JSONField(
                blank=True,
                default=list,
                help_text=(
                    'List of 2–5 {id, text, type, choices?} objects posed by the '
                    "worker. type is one of 'single_choice' / 'multi_choice' / 'text'."
                ),
            ),
        ),
        migrations.AddField(
            model_name='productissue',
            name='decision_answers',
            field=models.JSONField(
                blank=True,
                default=dict,
                help_text=(
                    'Mapping of question_id → answer value. Cleared when a new round '
                    'of questions is issued; previous answers live in decision_history.'
                ),
            ),
        ),
        migrations.AddField(
            model_name='productissue',
            name='decision_history',
            field=models.JSONField(
                blank=True,
                default=list,
                help_text=(
                    'Append-only audit trail of each decision round: '
                    '{questions, answers, requested_at, answered_at, answered_by, '
                    'worker_run_id, outcome}. Preserved across reruns.'
                ),
            ),
        ),
        migrations.AddField(
            model_name='productissue',
            name='decision_last_requested_at',
            field=models.DateTimeField(
                blank=True,
                null=True,
                help_text=(
                    'When the current needs-decision round was opened. Used to '
                    'throttle email reminders and to compute time-to-answer.'
                ),
            ),
        ),
    ]
