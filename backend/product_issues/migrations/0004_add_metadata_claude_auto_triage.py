# Generated manually for Sprint 10 S10-02 (Claude Auto-Triage Pipeline).
# Additive-with-default — safe to apply on a live DB and tolerated by any
# older running image (the backend serializers ignore unknown JSON keys).

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("product_issues", "0003_add_comment_attachments"),
    ]

    operations = [
        migrations.AddField(
            model_name="productissue",
            name="metadata",
            field=models.JSONField(
                blank=True,
                default=dict,
                help_text=(
                    "Opaque metadata bag for the Claude auto-triage "
                    "pipeline — tracks agent id, triggered-at, PR url, "
                    "commit sha, last error, attempt count. Written by "
                    "claude_triage.ClaudeAutoTriage and the "
                    "/claude-callback/ endpoint."
                ),
            ),
        ),
    ]
