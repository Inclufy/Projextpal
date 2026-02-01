from django.db import models
from accounts.models import Company
# Create your models here.
class PostProject(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="post_projects")
    projectname = models.CharField(max_length=200)
    lessons_learned = models.TextField()
    achieved_results= models.TextField()
    roi= models.IntegerField()
    savings= models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.projectname