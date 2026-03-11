from django.db import models
from django.conf import settings
import uuid


class AgileReleaseTrain(models.Model):
    """Agile Release Train (ART) in SAFe"""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    program = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='safe_arts')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    team_count = models.IntegerField(default=0)
    rte = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='managed_arts', help_text="Release Train Engineer")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Agile Release Train'

    def __str__(self):
        return f"{self.name} - {self.program.name}"


class ARTSync(models.Model):
    """ART Sync meetings"""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    art = models.ForeignKey(AgileReleaseTrain, on_delete=models.CASCADE, related_name='syncs')
    meeting_date = models.DateField()
    attendees = models.JSONField(default=list)
    decisions = models.JSONField(default=list)
    impediments = models.JSONField(default=list, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-meeting_date']
        verbose_name = 'ART Sync'

    def __str__(self):
        return f"Sync {self.meeting_date} - {self.art.name}"


class ProgramIncrement(models.Model):
    """Program Increment (PI) in SAFe"""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    program = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='safe_pis')
    name = models.CharField(max_length=200)
    iteration_count = models.IntegerField(default=5)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, default='planning', choices=[
        ('planning', 'Planning'),
        ('active', 'Active'),
        ('completed', 'Completed'),
    ])
    pi_planning_date = models.DateField(null=True, blank=True)
    innovation_sprint = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-start_date']
        verbose_name = 'Program Increment'

    def __str__(self):
        return f"{self.name} - {self.program.name}"


class PIObjective(models.Model):
    """PI Objectives for teams within a Program Increment"""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pi = models.ForeignKey(ProgramIncrement, on_delete=models.CASCADE, related_name='objectives')
    description = models.TextField()
    business_value = models.IntegerField(default=0, help_text="Business value 1-10")
    committed = models.BooleanField(default=True)
    achieved = models.BooleanField(default=False)
    team = models.CharField(max_length=200, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-business_value']
        verbose_name = 'PI Objective'

    def __str__(self):
        return f"BV:{self.business_value} - {self.description[:50]}"
