from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    """Sprint 1 — Meeting expansion: attendees + action items + carry-forward."""

    dependencies = [
        ("communication", "0003_meeting_attachments_statusreport_attachments"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        # ------------------- Meeting field additions -------------------
        migrations.AddField(
            model_name="meeting",
            name="reason",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="meeting",
            name="discussion_notes",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="meeting",
            name="conclusions",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="meeting",
            name="previous_meeting",
            field=models.ForeignKey(
                blank=True, null=True,
                on_delete=models.deletion.SET_NULL,
                related_name="follow_up_meetings",
                to="communication.meeting",
                help_text=(
                    "Link to the prior meeting. Used to carry forward open "
                    "actions."
                ),
            ),
        ),
        migrations.AddField(
            model_name="meeting",
            name="customer_supplier",
            field=models.CharField(blank=True, default="", max_length=200),
        ),
        migrations.AddField(
            model_name="meeting",
            name="yanmar_meeting_room",
            field=models.CharField(blank=True, default="", max_length=200),
        ),
        migrations.AddField(
            model_name="meeting",
            name="prepared_by",
            field=models.CharField(blank=True, default="", max_length=200),
        ),

        # ------------------- MeetingAttendee -------------------
        migrations.CreateModel(
            name="MeetingAttendee",
            fields=[
                ("id", models.AutoField(
                    auto_created=True, primary_key=True, serialize=False, verbose_name="ID",
                )),
                ("name_text", models.CharField(blank=True, default="", max_length=200)),
                ("position", models.CharField(blank=True, default="", max_length=200)),
                ("contact_info", models.CharField(blank=True, default="", max_length=255)),
                ("presence", models.CharField(
                    choices=[
                        ("invited", "Invited"),
                        ("attended", "Attended"),
                        ("absent", "Absent"),
                    ],
                    default="invited", max_length=20,
                )),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("meeting", models.ForeignKey(
                    on_delete=models.deletion.CASCADE,
                    related_name="attendees",
                    to="communication.meeting",
                )),
                ("user", models.ForeignKey(
                    blank=True, null=True,
                    on_delete=models.deletion.SET_NULL,
                    related_name="meeting_attendances",
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={
                "db_table": "meeting_attendees",
                "ordering": ["presence", "id"],
                "indexes": [
                    models.Index(
                        fields=["meeting", "presence"],
                        name="meeting_atte_meeting_presence_idx",
                    ),
                ],
            },
        ),

        # ------------------- MeetingActionItem -------------------
        migrations.CreateModel(
            name="MeetingActionItem",
            fields=[
                ("id", models.AutoField(
                    auto_created=True, primary_key=True, serialize=False, verbose_name="ID",
                )),
                ("no", models.PositiveIntegerField(default=0)),
                ("subject", models.CharField(max_length=500)),
                ("pic_text", models.CharField(
                    blank=True, default="", max_length=200,
                    help_text=(
                        "Person In Charge as free text (when no system user)."
                    ),
                )),
                ("action_due", models.CharField(
                    blank=True, default="", max_length=120,
                    help_text=(
                        "Free-text due date (preserves phrasing like "
                        "'next Friday')."
                    ),
                )),
                ("status", models.CharField(
                    choices=[
                        ("open", "Open"),
                        ("closed", "Closed"),
                        ("cancelled", "Cancelled"),
                    ],
                    default="open", max_length=20,
                )),
                ("notes", models.TextField(blank=True, default="")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("meeting", models.ForeignKey(
                    on_delete=models.deletion.CASCADE,
                    related_name="action_items",
                    to="communication.meeting",
                )),
                ("pic_user", models.ForeignKey(
                    blank=True, null=True,
                    on_delete=models.deletion.SET_NULL,
                    related_name="meeting_actions_pic",
                    to=settings.AUTH_USER_MODEL,
                )),
                ("source_meeting", models.ForeignKey(
                    blank=True, null=True,
                    on_delete=models.deletion.SET_NULL,
                    related_name="originated_actions",
                    to="communication.meeting",
                    help_text=(
                        "If this action was first recorded in an earlier "
                        "meeting."
                    ),
                )),
            ],
            options={
                "db_table": "meeting_action_items",
                "ordering": ["no", "id"],
                "indexes": [
                    models.Index(
                        fields=["meeting", "status"],
                        name="meeting_acti_meeting_status_idx",
                    ),
                    models.Index(
                        fields=["source_meeting"],
                        name="meeting_acti_source_idx",
                    ),
                ],
            },
        ),
    ]
