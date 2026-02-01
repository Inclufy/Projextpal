# surveys/models.py
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.exceptions import ValidationError
from projects.models import Project
import uuid

User = get_user_model()


class Survey(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="surveys")
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    deadline = models.DateField(blank=True, null=True)
    recipients_emails = models.TextField(blank=True, null=True)
    recipients = models.IntegerField(default=0)
    responses = models.IntegerField(default=0)
    
    # New role-based fields
    created_by = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='created_surveys',
        null=True, blank=True  # For backward compatibility
    )
    allowed_roles = models.JSONField(
        default=list,
        help_text="List of roles that can respond to this survey. Empty = all roles"
    )
    is_anonymous = models.BooleanField(
        default=False,
        help_text="Whether responses should be anonymous"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    STATUS_CHOICES = [
        ("Draft", "Draft"),
        ("Active", "Active"),  # Changed from "Sent" to "Active"
        ("Closed", "Closed"),
    ]
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default="Draft")

    def __str__(self):
        return f"{self.name} ({self.project.name})"
    
    @property
    def is_active(self):
        """Check if survey is active and not expired"""
        if self.status != "Active":
            return False
        if self.deadline and self.deadline < timezone.now().date():
            return False
        return True
    
    def is_user_assigned(self, user):
        """Check if user is specifically assigned to this survey"""
        # Check if user's email is in recipients_emails
        if self.recipients_emails:
            email_list = [email.strip().lower() for email in self.recipients_emails.split(',') if email.strip()]
            return user.email.lower() in email_list
        
        # Check if user has an invitation
        return self.invitations.filter(user=user).exists()
    
    def can_user_respond(self, user):
        """Check if user can respond to this survey"""
        if not user.is_authenticated:
            return False
        
        # Check if survey is active
        if not self.is_active:
            return False
        
        # Check if user is in the same company as project owner
        if hasattr(self.project, 'company') and hasattr(user, 'company'):
            if self.project.company != user.company:
                return False
        
        # Check if user was specifically assigned to this survey
        if not self.is_user_assigned(user):
            return False
        
        # Check if user hasn't already responded
        if self.survey_responses.filter(user=user).exists():
            return False
        
        return True
    
    def update_response_count(self):
        """Update the responses count and recalculate analytics"""
        self.responses = self.survey_responses.filter(is_complete=True).count()
        self.save(update_fields=['responses'])
        
        # Recalculate analytics
        analytics, created = SurveyAnalytics.objects.get_or_create(survey=self)
        analytics.calculate_metrics()


class Question(models.Model):
    QUESTION_TYPES = [
        ('text', 'Short Text'),
        ('textarea', 'Long Text'),
        ('rating', 'Rating (1-5)'),
        ('multiple_choice', 'Multiple Choice'),
        ('yes_no', 'Yes/No'),
    ]
    
    survey = models.ForeignKey(Survey, on_delete=models.CASCADE, related_name="questions")
    text = models.CharField(max_length=500)
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPES, default='text')
    required = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    
    # For multiple choice questions
    choices = models.JSONField(
        blank=True, 
        null=True,
        help_text="For multiple choice: ['Option 1', 'Option 2', ...]"
    )

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f"Q: {self.text[:30]}"


# New models for user responses
class SurveyResponse(models.Model):
    """User's response to a survey"""
    survey = models.ForeignKey(
        Survey, 
        on_delete=models.CASCADE, 
        related_name='survey_responses'
    )
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE,
        related_name='survey_responses',
        null=True, blank=True  # null if anonymous
    )
    submitted_at = models.DateTimeField(auto_now_add=True)
    is_complete = models.BooleanField(default=False)
    
    # For anonymous responses, store basic info
    anonymous_email = models.EmailField(blank=True, null=True)
    anonymous_role = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        unique_together = ['survey', 'user']  # One response per user per survey
        ordering = ['-submitted_at']

    def __str__(self):
        user_identifier = self.user.email if self.user else self.anonymous_email or "Anonymous"
        return f"{user_identifier} - {self.survey.name}"
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update survey response count
        if self.is_complete:
            self.survey.update_response_count()


class SurveyAnswer(models.Model):
    """Individual answer to a survey question"""
    response = models.ForeignKey(
        SurveyResponse, 
        on_delete=models.CASCADE, 
        related_name='answers'
    )
    question = models.ForeignKey(
        Question, 
        on_delete=models.CASCADE,
        related_name='answers'
    )
    
    # Different answer types
    answer_text = models.TextField(blank=True, null=True)
    answer_rating = models.PositiveIntegerField(blank=True, null=True)
    answer_choice = models.CharField(max_length=255, blank=True, null=True)
    answer_boolean = models.BooleanField(blank=True, null=True)

    class Meta:
        unique_together = ['response', 'question']

    def __str__(self):
        return f"Answer to: {self.question.text[:30]}"
    
    def clean(self):
        """Validate answer based on question type"""
        question_type = self.question.question_type
        
        if question_type == 'rating' and self.answer_rating:
            if not (1 <= self.answer_rating <= 5):
                raise ValidationError("Rating must be between 1 and 5")
        
        if question_type == 'multiple_choice' and self.answer_choice:
            if (self.question.choices and 
                self.answer_choice not in self.question.choices):
                raise ValidationError("Invalid choice selected")

    @property
    def display_answer(self):
        """Get the answer in display format"""
        question_type = self.question.question_type
        
        if question_type == 'text' or question_type == 'textarea':
            return self.answer_text
        elif question_type == 'rating':
            return f"{self.answer_rating}/5" if self.answer_rating else None
        elif question_type == 'multiple_choice':
            return self.answer_choice
        elif question_type == 'yes_no':
            return "Yes" if self.answer_boolean else "No" if self.answer_boolean is not None else None
        
        return None


class SurveyInvitation(models.Model):
    """Track who was invited to a survey"""
    survey = models.ForeignKey(
        Survey, 
        on_delete=models.CASCADE, 
        related_name='invitations'
    )
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE,
        related_name='survey_invitations'
    )
    invited_at = models.DateTimeField(auto_now_add=True)
    reminder_sent = models.BooleanField(default=False)
    reminder_sent_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ['survey', 'user']

    def __str__(self):
        return f"{self.user.email} invited to {self.survey.name}"


class ArchivedLesson(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="archived_lessons")
    date = models.DateField()
    insights = models.TextField(help_text="Comma-separated insights")
    
    # New fields for better tracking
    created_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, blank=True,
        related_name='created_lessons'
    )
    survey = models.ForeignKey(
        Survey, 
        on_delete=models.SET_NULL, 
        null=True, blank=True,
        help_text="Survey this lesson was derived from"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date', '-created_at']

    def insights_list(self):
        return [ins.strip() for ins in self.insights.split(",") if ins.strip()]

    def __str__(self):
        return f"Archived Lesson - {self.project.name}"


# Survey Analytics Model for reporting
class SurveyAnalytics(models.Model):
    """Store calculated analytics for surveys"""
    survey = models.OneToOneField(
        Survey,
        on_delete=models.CASCADE,
        related_name='analytics'
    )
    total_invited = models.PositiveIntegerField(default=0)
    total_responses = models.PositiveIntegerField(default=0)
    response_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True)
    completion_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    last_calculated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Analytics for {self.survey.name}"

    def calculate_metrics(self):
        """Recalculate all metrics"""
        survey = self.survey
        
        # Calculate total invited - use recipients_emails count if available, otherwise invitations
        if survey.recipients_emails:
            email_list = [email.strip() for email in survey.recipients_emails.split(',') if email.strip()]
            self.total_invited = len(email_list)
        else:
            self.total_invited = survey.invitations.count()
        
        # If no specific recipients, use the recipients field as fallback
        if self.total_invited == 0:
            self.total_invited = survey.recipients
        
        # Calculate total responses
        self.total_responses = survey.survey_responses.filter(is_complete=True).count()
        
        # Calculate response rate
        if self.total_invited > 0:
            self.response_rate = (self.total_responses / self.total_invited) * 100
        else:
            self.response_rate = 0

        # Calculate average rating for rating questions
        rating_answers = SurveyAnswer.objects.filter(
            response__survey=survey,
            question__question_type='rating',
            answer_rating__isnull=False
        )

        if rating_answers.exists():
            total_rating = sum(answer.answer_rating for answer in rating_answers)
            self.average_rating = total_rating / rating_answers.count()
        else:
            self.average_rating = None

        # Calculate completion rate (responses that are complete)
        total_responses = survey.survey_responses.count()
        if total_responses > 0:
            self.completion_rate = (self.total_responses / total_responses) * 100
        else:
            self.completion_rate = 0

        self.save()