from django.db import models
from django.conf import settings
from projects.models import Project


class StatusReport(models.Model):
    """Status reports for projects"""
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='status_reports')
    title = models.CharField(max_length=200)
    content = models.TextField()
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title


class Meeting(models.Model):
    """Project meetings"""
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='meetings')
    title = models.CharField(max_length=200)
    date = models.DateTimeField()
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title


class ReportingItem(models.Model):
    """Reporting items"""
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='reporting_items')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title
