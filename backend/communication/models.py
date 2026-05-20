from django.db import models
from django.utils import timezone
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator

class StatusReport(models.Model):
    STATUS_CHOICES = [
        ('Not Started', 'Not Started'),
        ('In Progress', 'In Progress'),
        ('Completed', 'Completed'),
    ]
    project = models.ForeignKey(
        'projects.Project', on_delete=models.CASCADE, related_name='status_reports'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Not Started')
    progress = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    last_updated = models.DateField()
    # Bijlagen: KPI-dashboards (PDF), executive summaries, screenshots
    attachments = models.ManyToManyField(
        'projects.Upload', blank=True, related_name='+'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'status_reports'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.project} - {self.status}"
    
    def save(self, *args, **kwargs):
        # Auto-update last_updated to today if not provided
        if not self.last_updated:
            self.last_updated = timezone.now().date()
        super().save(*args, **kwargs)
        
        
# Training Material Model
class TrainingMaterial(models.Model):
    STATUS_CHOICES = [
        ('Not Started', 'Not Started'),
        ('Draft', 'Draft'),
        ('In Review', 'In Review'),
        ('Completed', 'Completed'),
    ]
    FORMAT_CHOICES = [
        ('PDF', 'PDF'),
        ('MP4', 'MP4'),
        ('DOCX', 'DOCX'),
    ]
    AUDIENCE_CHOICES = [
        ('End Users', 'End Users'),
        ('Administrators', 'Administrators'),
        ('Trainers', 'Trainers'),
    ]

    project = models.ForeignKey(
        'projects.Project',
        on_delete=models.CASCADE,
        related_name='communication_training_materials',
        related_query_name='communication_training_material',
    )
    name = models.CharField(max_length=255)
    audience = models.CharField(max_length=50, choices=AUDIENCE_CHOICES, default="End Users")
    format = models.CharField(max_length=10, choices=FORMAT_CHOICES, default="PDF")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Not Started")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "training_materials"
        ordering = ["-created_at"]

    def __str__(self):
        return self.name

# Report Model
class ReportingItem(models.Model):
    FREQUENCY_CHOICES = [
        ("Weekly", "Weekly"),
        ("Bi-weekly", "Bi-weekly"),
        ("Monthly", "Monthly"),
        ("Quarterly", "Quarterly"),
        ("One-time", "One-time"),
    ]

    TYPE_CHOICES = [
        ("Steering", "Steering"),
        ("Program Board", "Program Board"),
        ("Team", "Team"),
        ("Milestone", "Milestone"),
        ("Stage", "Stage"),
    ]

    project = models.ForeignKey(
        'projects.Project', on_delete=models.CASCADE, related_name='reporting_items'
    )
    name = models.CharField(max_length=255)
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES)
    type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    start_date = models.DateField()
    view = models.BooleanField(default=True)
    document = models.FileField(upload_to='reports/', null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'reporting_items'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.project})"


# Meeting Model
class Meeting(models.Model):
    TYPE_CHOICES = [
        ("recurring", "Recurring"),
        ("onetime", "One-time"),
    ]
    FREQ_CHOICES = [
        ("weekly", "Weekly"),
        ("biweekly", "Bi-weekly"),
        ("monthly", "Monthly"),
        ("adhoc", "Ad-hoc"),
    ]
    STATUS_CHOICES = [
        ("scheduled", "Scheduled"),
        ("cancelled", "Cancelled"),
    ]

    project = models.ForeignKey(
        'projects.Project',
        on_delete=models.CASCADE,
        related_name='meetings',
        related_query_name='meeting',
    )
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES, default="recurring")
    frequency = models.CharField(max_length=10, choices=FREQ_CHOICES, default="weekly")

    # Base occurrence for recurrence expansion
    date = models.DateField()
    time = models.TimeField()

    location = models.CharField(max_length=255, blank=True)
    agenda = models.JSONField(default=list, blank=True)         # list[str]
    participants = models.JSONField(default=list, blank=True)   # list[str]

    # Bijlagen: agenda-PDF, presentaties, minutes, vergader-decks
    attachments = models.ManyToManyField(
        'projects.Upload', blank=True, related_name='+'
    )

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="scheduled")
    # Sprint 1 — Yanmar Meeting Minutes template expansion.
    reason = models.TextField(blank=True, default="")
    discussion_notes = models.TextField(blank=True, default="")
    conclusions = models.TextField(blank=True, default="")
    previous_meeting = models.ForeignKey(
        "self", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="follow_up_meetings",
        help_text="Link to the prior meeting. Used to carry forward open actions.",
    )
    customer_supplier = models.CharField(max_length=200, blank=True, default="")
    yanmar_meeting_room = models.CharField(max_length=200, blank=True, default="")
    prepared_by = models.CharField(max_length=200, blank=True, default="")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'meetings'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.project})"


class MeetingAttendee(models.Model):
    """
    Per-meeting attendee row matching Yanmar Meeting Minutes template
    (Invited / Attendees / Absent). One row per (meeting, person).

    `user` is optional -- guests / customer-supplier attendees who don't
    have a system account are stored via name_text / position / contact.
    """

    PRESENCE_CHOICES = [
        ("invited", "Invited"),
        ("attended", "Attended"),
        ("absent", "Absent"),
    ]

    meeting = models.ForeignKey(
        Meeting, on_delete=models.CASCADE, related_name="attendees",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL, null=True, blank=True,
        related_name="meeting_attendances",
    )
    name_text = models.CharField(max_length=200, blank=True, default="")
    position = models.CharField(max_length=200, blank=True, default="")
    contact_info = models.CharField(max_length=255, blank=True, default="")
    presence = models.CharField(
        max_length=20, choices=PRESENCE_CHOICES, default="invited",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "meeting_attendees"
        ordering = ["presence", "id"]
        indexes = [
            models.Index(fields=["meeting", "presence"]),
        ]

    def __str__(self):
        return f"{self.name_text or self.user_id} -> {self.meeting_id} ({self.presence})"


class MeetingActionItem(models.Model):
    """
    Action item produced by a meeting (the "Agreed New Actions" table in
    Yanmar's Meeting Minutes template). Open items are carried forward
    into the next meeting's "Previous Actions" via
    `Meeting.previous_meeting`.
    """

    STATUS_CHOICES = [
        ("open", "Open"),
        ("closed", "Closed"),
        ("cancelled", "Cancelled"),
    ]

    meeting = models.ForeignKey(
        Meeting, on_delete=models.CASCADE, related_name="action_items",
    )
    source_meeting = models.ForeignKey(
        Meeting, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="originated_actions",
        help_text="If this action was first recorded in an earlier meeting.",
    )
    no = models.PositiveIntegerField(default=0)
    subject = models.CharField(max_length=500)
    pic_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL, null=True, blank=True,
        related_name="meeting_actions_pic",
    )
    pic_text = models.CharField(
        max_length=200, blank=True, default="",
        help_text="Person In Charge as free text (when no system user).",
    )
    action_due = models.CharField(
        max_length=120, blank=True, default="",
        help_text="Free-text due date (preserves phrasing like 'next Friday').",
    )
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="open",
    )
    notes = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "meeting_action_items"
        ordering = ["no", "id"]
        indexes = [
            models.Index(fields=["meeting", "status"]),
            models.Index(fields=["source_meeting"]),
        ]

    def __str__(self):
        return f"#{self.no} {self.subject[:40]} ({self.status})"

    def carry_forward_to(self, new_meeting: "Meeting") -> "MeetingActionItem":
        """Clone an open action into a follow-up meeting (preserves source)."""
        return MeetingActionItem.objects.create(
            meeting=new_meeting,
            source_meeting=self.source_meeting or self.meeting,
            no=self.no,
            subject=self.subject,
            pic_user=self.pic_user,
            pic_text=self.pic_text,
            action_due=self.action_due,
            status="open",
            notes=self.notes,
        )
