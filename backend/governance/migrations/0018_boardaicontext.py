"""Sprint 15 — BoardAIContext: per-board uploaded documents treated as AI
background for every call that touches the board (board papers, mandate,
dossier). Decisions + Meetings inherit this via their parent board at
AI-call time, so no separate model for them.

Mirrors governance.0014_portfolioaicontext but one scope deeper. Includes
EncryptedTextField on first create (projects/portfolio needed two
migrations; we skip the plaintext stage because there are no legacy
rows to re-encrypt)."""
from django.db import migrations, models

import core.secret_field


class Migration(migrations.Migration):

    dependencies = [
        ("governance", "0017_boardmember_can_log_time_stakeholder_can_log_time"),
    ]

    operations = [
        migrations.CreateModel(
            name="BoardAIContext",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "enabled",
                    models.BooleanField(
                        default=True,
                        help_text=(
                            "If false, AI endpoints will ignore this "
                            "context even though it is stored (soft "
                            "off-switch)."
                        ),
                    ),
                ),
                (
                    "extracted_text",
                    core.secret_field.EncryptedTextField(blank=True, default=""),
                ),
                (
                    "source_files",
                    models.JSONField(
                        blank=True,
                        default=list,
                        help_text=(
                            "List of {name, size, pages, enabled} dicts for "
                            "traceability. Optional per-document ``enabled`` "
                            "flag (default True) hides a single document from "
                            "AI context without removing it."
                        ),
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "board",
                    models.OneToOneField(
                        on_delete=models.deletion.CASCADE,
                        related_name="ai_context",
                        to="governance.governanceboard",
                    ),
                ),
            ],
            options={
                "verbose_name": "Board AI Context",
            },
        ),
    ]
