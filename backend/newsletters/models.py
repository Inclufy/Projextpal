from django.db import models
from django.conf import settings
from django.contrib.auth import get_user_model

User = get_user_model()


class MailingList(models.Model):
    """Mailing list for organizing newsletter recipients"""
    
    LIST_TYPE_CHOICES = [
        ('external', 'External Subscribers'),
        ('project_team', 'Project Team'),
        ('project_stakeholders', 'Project Stakeholders'),
        ('custom', 'Custom List'),
    ]
    
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    list_type = models.CharField(max_length=50, choices=LIST_TYPE_CHOICES)
    company = models.ForeignKey(
        "accounts.Company", on_delete=models.CASCADE, related_name="mailing_lists"
    )
    project = models.ForeignKey(
        "projects.Project", on_delete=models.CASCADE, null=True, blank=True,
        related_name="mailing_lists"
    )
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_mailing_lists",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ["name"]
        indexes = [
            models.Index(fields=["company", "is_active"]),
            models.Index(fields=["company", "list_type"]),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.company.name})"
    
    def get_member_count(self):
        """Get total number of members in this mailing list"""
        return self.members.count()


class ExternalSubscriber(models.Model):
    """External subscribers who signed up for newsletters"""
    
    email = models.EmailField()
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True)
    company = models.ForeignKey(
        "accounts.Company", on_delete=models.CASCADE, related_name="external_subscribers"
    )
    is_subscribed = models.BooleanField(default=True)
    subscription_date = models.DateTimeField(auto_now_add=True)
    unsubscribed_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ["email"]
        unique_together = ("email", "company")
        indexes = [
            models.Index(fields=["company", "is_subscribed"]),
        ]
    
    def __str__(self):
        name = f"{self.first_name} {self.last_name}".strip()
        return f"{name} ({self.email})" if name else self.email


class MailingListMember(models.Model):
    """Junction table for mailing list members"""
    
    mailing_list = models.ForeignKey(
        MailingList, on_delete=models.CASCADE, related_name="members"
    )
    external_subscriber = models.ForeignKey(
        ExternalSubscriber, on_delete=models.CASCADE, null=True, blank=True,
        related_name="mailing_list_memberships"
    )
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, null=True, blank=True,
        related_name="mailing_list_memberships"
    )
    added_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = [
            ("mailing_list", "external_subscriber"),
            ("mailing_list", "user"),
        ]
        indexes = [
            models.Index(fields=["mailing_list", "added_at"]),
        ]
    
    def __str__(self):
        if self.external_subscriber:
            return f"{self.external_subscriber.email} in {self.mailing_list.name}"
        elif self.user:
            return f"{self.user.email} in {self.mailing_list.name}"
        return f"Member of {self.mailing_list.name}"


class Newsletter(models.Model):
    """Newsletter model for project updates"""

    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("sent", "Sent"),
        ("failed", "Failed"),
    ]

    RECIPIENT_TYPE_CHOICES = [
        ("project_team", "Project Team"),
        ("stakeholders", "All Stakeholders"),
        ("steering_committee", "Steering Committee"),
        ("custom", "Custom Recipients"),
        ("mailing_list", "Mailing Lists"),
    ]

    project = models.ForeignKey(
        "projects.Project", on_delete=models.CASCADE, null=True, blank=True,
        related_name="newsletters"
    )
    subject = models.CharField(max_length=255)
    task_update_details = models.TextField(blank=True)
    additional_content = models.TextField(blank=True)
    recipient_type = models.CharField(
        max_length=50, choices=RECIPIENT_TYPE_CHOICES, default="project_team"
    )
    mailing_lists = models.ManyToManyField(
        MailingList, blank=True, related_name="newsletters"
    )
    custom_recipients = models.ManyToManyField(
        User, blank=True, related_name="newsletters_received"
    )
    execution_stakeholder_ids = models.JSONField(
        default=list, blank=True, help_text="List of execution stakeholder IDs"
    )
    crm_users = models.JSONField(
        default=list, blank=True, help_text="List of CRM users (from external API) with email, first_name, last_name"
    )
    project_recipients = models.JSONField(
        default=list, blank=True, help_text="List of project recipients in format [{'project_id': 1, 'type': 'team'}, {'project_id': 1, 'type': 'stakeholders'}]"
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")
    sent_at = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="newsletters_created",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["project", "status"]),
            models.Index(fields=["project", "created_at"]),
        ]

    def __str__(self):
        project_name = self.project.name if self.project else "Company-wide"
        return f"{self.subject} - {project_name}"

    def get_recipients(self):
        """Get the list of recipients based on recipient_type"""
        if self.recipient_type == "mailing_list":
            # Get recipients from selected mailing lists
            recipient_ids = []
            for mailing_list in self.mailing_lists.all():
                # Get external subscribers
                external_ids = mailing_list.members.filter(
                    external_subscriber__isnull=False,
                    external_subscriber__is_subscribed=True
                ).values_list('external_subscriber__id', flat=True)
                
                # Get users
                user_ids = mailing_list.members.filter(
                    user__isnull=False
                ).values_list('user__id', flat=True)
                
                recipient_ids.extend(user_ids)
            
            return recipient_ids
        
        elif self.recipient_type == "project_team":
            # Get project team members
            if self.project:
                return self.project.team_members.filter(is_active=True).values_list(
                    "user", flat=True
                )
        elif self.recipient_type == "stakeholders":
            # Get Execution Stakeholder IDs for this project
            if self.project:
                try:
                    from execution.models import Stakeholder
                    return Stakeholder.objects.filter(
                        project=self.project,
                        contact__isnull=False
                    ).exclude(contact='').values_list("id", flat=True)
                except ImportError:
                    return []
        elif self.recipient_type == "steering_committee":
            # Get users with admin or pm role in the same company
            if self.project:
                return User.objects.filter(
                    company=self.project.company, role__in=["admin", "pm"]
                ).values_list("id", flat=True)
        elif self.recipient_type == "custom":
            # Get custom recipients
            return self.custom_recipients.values_list("id", flat=True)
        return []

    def get_recipient_emails(self):
        """Get the list of recipient emails"""
        emails = []

        if self.recipient_type == "mailing_list":
            # Get emails from mailing lists
            for mailing_list in self.mailing_lists.all():
                # Get external subscriber emails
                external_emails = mailing_list.members.filter(
                    external_subscriber__isnull=False,
                    external_subscriber__is_subscribed=True
                ).values_list('external_subscriber__email', flat=True)
                emails.extend(external_emails)
                
                # Get user emails
                user_emails = mailing_list.members.filter(
                    user__isnull=False
                ).values_list('user__email', flat=True)
                emails.extend(user_emails)
        elif self.recipient_type == "stakeholders":
            # Get emails from Execution Stakeholders
            if self.project:
                try:
                    from execution.models import Stakeholder
                    stakeholder_emails = Stakeholder.objects.filter(
                        project=self.project,
                        contact__isnull=False
                    ).exclude(contact='').values_list('contact', flat=True)
                    emails.extend(stakeholder_emails)
                except ImportError:
                    pass
        else:
            # Get emails from regular users
            recipient_ids = self.get_recipients()
            user_emails = User.objects.filter(id__in=recipient_ids).values_list(
                "email", flat=True
            )
            emails.extend(user_emails)

        # Get emails from execution stakeholders
        if self.execution_stakeholder_ids:
            try:
                from execution.models import Stakeholder

                stakeholder_emails = Stakeholder.objects.filter(
                    id__in=self.execution_stakeholder_ids
                ).values_list("contact", flat=True)
                emails.extend([email for email in stakeholder_emails if email])
            except ImportError:
                pass

        # Get emails from CRM users
        if self.crm_users:
            for crm_user in self.crm_users:
                if isinstance(crm_user, dict) and crm_user.get("email"):
                    emails.append(crm_user["email"])

        # Get emails from project recipients
        if self.project_recipients:
            from projects.models import Project
            for project_recipient in self.project_recipients:
                if isinstance(project_recipient, dict):
                    project_id = project_recipient.get("project_id")
                    recipient_type = project_recipient.get("type")  # 'team' or 'stakeholders'
                    
                    if project_id and recipient_type:
                        try:
                            project = Project.objects.get(id=project_id)
                            if recipient_type == 'team':
                                # Get project team members
                                team_emails = project.team_members.filter(is_active=True).select_related('user').values_list('user__email', flat=True)
                                emails.extend(team_emails)
                            elif recipient_type == 'stakeholders':
                                # Get Execution Stakeholders for this project (from execution.models.Stakeholder)
                                try:
                                    from execution.models import Stakeholder
                                    stakeholder_emails = Stakeholder.objects.filter(
                                        project=project,
                                        contact__isnull=False
                                    ).exclude(contact='').values_list('contact', flat=True)
                                    emails.extend(stakeholder_emails)
                                except ImportError:
                                    pass
                        except Project.DoesNotExist:
                            pass

        return list(set(emails))  # Remove duplicates

    def get_recipient_details(self):
        """Get detailed recipient information"""
        result = []

        if self.recipient_type == "mailing_list":
            # Get details from mailing lists
            for mailing_list in self.mailing_lists.all():
                # Get external subscribers
                external_members = mailing_list.members.filter(
                    external_subscriber__isnull=False,
                    external_subscriber__is_subscribed=True
                ).select_related('external_subscriber')
                
                for member in external_members:
                    subscriber = member.external_subscriber
                    name = f"{subscriber.first_name} {subscriber.last_name}".strip()
                    result.append({
                        "id": f"external_{subscriber.id}",
                        "name": name or subscriber.email,
                        "email": subscriber.email,
                        "role": "External Subscriber",
                    })
                
                # Get users
                user_members = mailing_list.members.filter(
                    user__isnull=False
                ).select_related('user')
                
                for member in user_members:
                    user = member.user
                    name = user.get_full_name() or user.email
                    result.append({
                        "id": user.id,
                        "name": name,
                        "email": user.email,
                        "role": user.role,
                    })
        elif self.recipient_type == "stakeholders":
            # Get Execution Stakeholders for this project
            if self.project:
                try:
                    from execution.models import Stakeholder
                    stakeholders = Stakeholder.objects.filter(
                        project=self.project,
                        contact__isnull=False
                    ).exclude(contact='')
                    
                    for stakeholder in stakeholders:
                        result.append({
                            "id": f"stakeholder_{stakeholder.id}",
                            "name": stakeholder.name,
                            "email": stakeholder.contact,
                            "role": stakeholder.role or stakeholder.governance_type or "Stakeholder",
                        })
                except ImportError:
                    pass
        else:
            # Get regular users
            recipient_ids = self.get_recipients()
            recipients = User.objects.filter(id__in=recipient_ids).values(
                "id", "email", "first_name", "last_name", "role"
            )

            for recipient in recipients:
                name = recipient.get("first_name") or recipient.get("email", "")
                if recipient.get("last_name"):
                    name = f"{recipient.get('first_name', '')} {recipient.get('last_name', '')}".strip()

                result.append(
                    {
                        "id": recipient["id"],
                        "name": name,
                        "email": recipient["email"],
                        "role": recipient["role"],
                    }
                )

        # Get execution stakeholders
        if self.execution_stakeholder_ids:
            try:
                from execution.models import Stakeholder

                stakeholders = Stakeholder.objects.filter(
                    id__in=self.execution_stakeholder_ids
                ).values("id", "name", "contact", "role", "governance_type")

                for stakeholder in stakeholders:
                    if stakeholder["contact"]:  # Only include stakeholders with email
                        result.append(
                            {
                                "id": f"stakeholder_{stakeholder['id']}",
                                "name": stakeholder["name"],
                                "email": stakeholder["contact"],
                                "role": stakeholder["role"]
                                or stakeholder["governance_type"],
                            }
                        )
            except ImportError:
                pass

        # Get project recipients
        if self.project_recipients:
            from projects.models import Project
            for project_recipient in self.project_recipients:
                if isinstance(project_recipient, dict):
                    project_id = project_recipient.get("project_id")
                    recipient_type = project_recipient.get("type")
                    
                    if project_id and recipient_type:
                        try:
                            project = Project.objects.get(id=project_id)
                            if recipient_type == 'team':
                                # Get project team members
                                for team_member in project.team_members.filter(is_active=True).select_related('user'):
                                    user = team_member.user
                                    name = user.get_full_name() or user.first_name or user.email
                                    result.append({
                                        "id": user.id,
                                        "name": name,
                                        "email": user.email,
                                        "role": user.role or "Project Team Member",
                                    })
                            elif recipient_type == 'stakeholders':
                                # Get Execution Stakeholders for this project (from execution.models.Stakeholder)
                                try:
                                    from execution.models import Stakeholder
                                    for stakeholder in Stakeholder.objects.filter(
                                        project=project,
                                        contact__isnull=False
                                    ).exclude(contact=''):
                                        result.append({
                                            "id": f"stakeholder_{stakeholder.id}",
                                            "name": stakeholder.name,
                                            "email": stakeholder.contact,
                                            "role": stakeholder.role or stakeholder.governance_type or "Stakeholder",
                                        })
                                except ImportError:
                                    pass
                        except Project.DoesNotExist:
                            pass

        return result


class NewsletterTemplate(models.Model):
    """Predefined newsletter templates"""

    name = models.CharField(max_length=100)
    subject_template = models.CharField(max_length=255)
    task_update_template = models.TextField(blank=True)
    additional_content_template = models.TextField(blank=True)
    is_default = models.BooleanField(default=False)
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        # Ensure only one default template exists
        if self.is_default:
            NewsletterTemplate.objects.filter(is_default=True).update(is_default=False)
        super().save(*args, **kwargs)
