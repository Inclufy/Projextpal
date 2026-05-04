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
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'meetings'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.project})"
