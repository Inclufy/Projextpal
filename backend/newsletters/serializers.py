from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Newsletter,
    NewsletterTemplate,
    MailingList,
    ExternalSubscriber,
    MailingListMember,
)
from projects.models import Project

User = get_user_model()


class NewsletterSerializer(serializers.ModelSerializer):
    """Serializer for Newsletter model"""

    project_name = serializers.ReadOnlyField(source="project.name")
    created_by_name = serializers.SerializerMethodField()
    created_by_email = serializers.ReadOnlyField(source="created_by.email")
    recipient_count = serializers.SerializerMethodField()
    recipient_details = serializers.SerializerMethodField()
    custom_recipient_names = serializers.SerializerMethodField()

    class Meta:
        model = Newsletter
        fields = [
            "id",
            "project",
            "project_name",
            "subject",
            "task_update_details",
            "additional_content",
            "recipient_type",
            "mailing_lists",
            "custom_recipients",
            "execution_stakeholder_ids",
            "custom_recipient_names",
            "status",
            "sent_at",
            "created_by",
            "created_by_name",
            "created_by_email",
            "recipient_count",
            "recipient_details",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "created_by",
            "sent_at",
            "created_at",
            "updated_at",
        ]

    def get_created_by_name(self, obj):
        """Return user's full name if available, otherwise email."""
        if not obj.created_by:
            return None

        # Try to get full name
        full_name = obj.created_by.get_full_name().strip()
        if full_name:
            return full_name

        # Fallback to first_name or username
        if obj.created_by.first_name:
            return obj.created_by.first_name

        if obj.created_by.username and obj.created_by.username != obj.created_by.email:
            return obj.created_by.username

        # Final fallback to email
        return obj.created_by.email

    def get_recipient_count(self, obj):
        """Get the number of recipients"""
        return len(obj.get_recipients())

    def get_recipient_details(self, obj):
        """Get detailed recipient information"""
        return obj.get_recipient_details()

    def get_custom_recipient_names(self, obj):
        """Get names of custom recipients"""
        if obj.recipient_type == "custom":
            return [
                {
                    "id": user.id,
                    "name": user.get_full_name() or user.first_name or user.email,
                    "email": user.email,
                }
                for user in obj.custom_recipients.all()
            ]
        return []

    def create(self, validated_data):
        """Create newsletter with current user as creator"""
        request = self.context.get("request")
        if request and request.user:
            validated_data["created_by"] = request.user
        return super().create(validated_data)


class ProjectForNewsletterSerializer(serializers.ModelSerializer):
    """Serializer for projects in newsletter context - includes team members and stakeholders"""

    company_name = serializers.CharField(source="company.name", read_only=True)
    team_members = serializers.SerializerMethodField()
    stakeholders = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            "id",
            "name",
            "company_name",
            "team_members",
            "stakeholders",
        ]

    def get_team_members(self, obj):
        """Get active team members for this project"""
        team_members = []
        for team_member in obj.team_members.filter(is_active=True).select_related(
            "user"
        ):
            user = team_member.user
            name = user.get_full_name() or user.first_name or user.email
            team_members.append(
                {
                    "id": user.id,
                    "name": name,
                    "email": user.email,
                    "role": user.role,
                }
            )
        return team_members

    def get_stakeholders(self, obj):
        """Get Execution Stakeholders for this project (from execution.models.Stakeholder)"""
        stakeholders = []
        try:
            from execution.models import Stakeholder

            # Get all stakeholders for this project that have email addresses
            for stakeholder in Stakeholder.objects.filter(
                project=obj, contact__isnull=False
            ).exclude(contact=""):
                stakeholders.append(
                    {
                        "id": stakeholder.id,
                        "name": stakeholder.name,
                        "email": stakeholder.contact,
                        "role": stakeholder.role
                        or stakeholder.governance_type
                        or "Stakeholder",
                    }
                )
        except ImportError:
            # If execution app is not available, return empty list
            pass
        return stakeholders


class NewsletterListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for newsletter lists"""

    project_name = serializers.ReadOnlyField(source="project.name")
    created_by_name = serializers.SerializerMethodField()
    recipient_count = serializers.SerializerMethodField()

    class Meta:
        model = Newsletter
        fields = [
            "id",
            "project",
            "project_name",
            "subject",
            "recipient_type",
            "status",
            "sent_at",
            "created_by_name",
            "recipient_count",
            "created_at",
        ]

    def get_created_by_name(self, obj):
        """Return user's full name if available, otherwise email."""
        if not obj.created_by:
            return None

        # Try to get full name
        full_name = obj.created_by.get_full_name().strip()
        if full_name:
            return full_name

        # Fallback to first_name or username
        if obj.created_by.first_name:
            return obj.created_by.first_name

        if obj.created_by.username and obj.created_by.username != obj.created_by.email:
            return obj.created_by.username

        # Final fallback to email
        return obj.created_by.email

    def get_recipient_count(self, obj):
        """Get the number of recipients"""
        return len(obj.get_recipients())


class NewsletterTemplateSerializer(serializers.ModelSerializer):
    """Serializer for NewsletterTemplate model"""

    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = NewsletterTemplate
        fields = [
            "id",
            "name",
            "subject_template",
            "task_update_template",
            "additional_content_template",
            "is_default",
            "created_by",
            "created_by_name",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "created_by",
            "created_at",
            "updated_at",
        ]

    def get_created_by_name(self, obj):
        """Return user's full name if available, otherwise email."""
        if not obj.created_by:
            return None

        # Try to get full name
        full_name = obj.created_by.get_full_name().strip()
        if full_name:
            return full_name

        # Fallback to first_name or username
        if obj.created_by.first_name:
            return obj.created_by.first_name

        if obj.created_by.username and obj.created_by.username != obj.created_by.email:
            return obj.created_by.username

        # Final fallback to email
        return obj.created_by.email

    def create(self, validated_data):
        """Create template with current user as creator"""
        request = self.context.get("request")
        if request and request.user:
            validated_data["created_by"] = request.user
        return super().create(validated_data)


class ProjectForNewsletterSerializer(serializers.ModelSerializer):
    """Serializer for projects in newsletter context - includes team members and stakeholders"""

    company_name = serializers.CharField(source="company.name", read_only=True)
    team_members = serializers.SerializerMethodField()
    stakeholders = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            "id",
            "name",
            "company_name",
            "team_members",
            "stakeholders",
        ]

    def get_team_members(self, obj):
        """Get active team members for this project"""
        team_members = []
        for team_member in obj.team_members.filter(is_active=True).select_related(
            "user"
        ):
            user = team_member.user
            name = user.get_full_name() or user.first_name or user.email
            team_members.append(
                {
                    "id": user.id,
                    "name": name,
                    "email": user.email,
                    "role": user.role,
                }
            )
        return team_members

    def get_stakeholders(self, obj):
        """Get Execution Stakeholders for this project (from execution.models.Stakeholder)"""
        stakeholders = []
        try:
            from execution.models import Stakeholder

            # Get all stakeholders for this project that have email addresses
            for stakeholder in Stakeholder.objects.filter(
                project=obj, contact__isnull=False
            ).exclude(contact=""):
                stakeholders.append(
                    {
                        "id": stakeholder.id,
                        "name": stakeholder.name,
                        "email": stakeholder.contact,
                        "role": stakeholder.role
                        or stakeholder.governance_type
                        or "Stakeholder",
                    }
                )
        except ImportError:
            # If execution app is not available, return empty list
            pass
        return stakeholders


class NewsletterSendSerializer(serializers.Serializer):
    """Serializer for sending newsletters"""

    test_email = serializers.EmailField(required=False, allow_blank=True)


class NewsletterPreviewSerializer(serializers.Serializer):
    """Serializer for newsletter preview"""

    subject = serializers.CharField(max_length=255)
    task_update_details = serializers.CharField(required=False, allow_blank=True)
    additional_content = serializers.CharField(required=False, allow_blank=True)
    recipient_type = serializers.ChoiceField(choices=Newsletter.RECIPIENT_TYPE_CHOICES)
    project_id = serializers.IntegerField()

    def validate_project_id(self, value):
        """Validate that project exists and belongs to user's company"""
        try:
            from projects.models import Project

            project = Project.objects.get(id=value)
            # Check if project belongs to user's company
            request = self.context.get("request")
            if request and request.user:
                if project.company != request.user.company:
                    raise serializers.ValidationError(
                        "Project not found or access denied"
                    )
            return value
        except Project.DoesNotExist:
            raise serializers.ValidationError("Project not found")


class MailingListSerializer(serializers.ModelSerializer):
    """Serializer for MailingList model"""

    project_name = serializers.ReadOnlyField(source="project.name")
    created_by_name = serializers.SerializerMethodField()
    member_count = serializers.SerializerMethodField()

    class Meta:
        model = MailingList
        fields = [
            "id",
            "name",
            "description",
            "list_type",
            "company",
            "project",
            "project_name",
            "is_active",
            "created_by",
            "created_by_name",
            "member_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "company",
            "created_by",
            "created_at",
            "updated_at",
        ]

    def get_created_by_name(self, obj):
        """Return user's full name if available, otherwise email."""
        if not obj.created_by:
            return None

        full_name = obj.created_by.get_full_name().strip()
        if full_name:
            return full_name

        if obj.created_by.first_name:
            return obj.created_by.first_name

        if obj.created_by.username and obj.created_by.username != obj.created_by.email:
            return obj.created_by.username

        return obj.created_by.email

    def get_member_count(self, obj):
        """Get the number of members in this mailing list"""
        return obj.get_member_count()

    def create(self, validated_data):
        """Create mailing list with current user's company and creator"""
        request = self.context.get("request")
        if request and request.user:
            validated_data["company"] = request.user.company
            validated_data["created_by"] = request.user
        return super().create(validated_data)


class ProjectForNewsletterSerializer(serializers.ModelSerializer):
    """Serializer for projects in newsletter context - includes team members and stakeholders"""

    company_name = serializers.CharField(source="company.name", read_only=True)
    team_members = serializers.SerializerMethodField()
    stakeholders = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            "id",
            "name",
            "company_name",
            "team_members",
            "stakeholders",
        ]

    def get_team_members(self, obj):
        """Get active team members for this project"""
        team_members = []
        for team_member in obj.team_members.filter(is_active=True).select_related(
            "user"
        ):
            user = team_member.user
            name = user.get_full_name() or user.first_name or user.email
            team_members.append(
                {
                    "id": user.id,
                    "name": name,
                    "email": user.email,
                    "role": user.role,
                }
            )
        return team_members

    def get_stakeholders(self, obj):
        """Get Execution Stakeholders for this project (from execution.models.Stakeholder)"""
        stakeholders = []
        try:
            from execution.models import Stakeholder

            # Get all stakeholders for this project that have email addresses
            for stakeholder in Stakeholder.objects.filter(
                project=obj, contact__isnull=False
            ).exclude(contact=""):
                stakeholders.append(
                    {
                        "id": stakeholder.id,
                        "name": stakeholder.name,
                        "email": stakeholder.contact,
                        "role": stakeholder.role
                        or stakeholder.governance_type
                        or "Stakeholder",
                    }
                )
        except ImportError:
            # If execution app is not available, return empty list
            pass
        return stakeholders


class MailingListMemberSerializer(serializers.ModelSerializer):
    """Serializer for MailingListMember model"""

    member_name = serializers.SerializerMethodField()
    member_email = serializers.SerializerMethodField()
    member_type = serializers.SerializerMethodField()

    class Meta:
        model = MailingListMember
        fields = [
            "id",
            "mailing_list",
            "external_subscriber",
            "user",
            "member_name",
            "member_email",
            "member_type",
            "added_at",
        ]
        read_only_fields = ["added_at"]

    def get_member_name(self, obj):
        """Get member name"""
        if obj.external_subscriber:
            name = f"{obj.external_subscriber.first_name} {obj.external_subscriber.last_name}".strip()
            return name or obj.external_subscriber.email
        elif obj.user:
            return obj.user.get_full_name() or obj.user.email
        return "Unknown"

    def get_member_email(self, obj):
        """Get member email"""
        if obj.external_subscriber:
            return obj.external_subscriber.email
        elif obj.user:
            return obj.user.email
        return ""

    def get_member_type(self, obj):
        """Get member type"""
        if obj.external_subscriber:
            return "external"
        elif obj.user:
            return "user"
        return "unknown"


class ExternalSubscriberSerializer(serializers.ModelSerializer):
    """Serializer for ExternalSubscriber model"""

    class Meta:
        model = ExternalSubscriber
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "company",
            "is_subscribed",
            "subscription_date",
            "unsubscribed_date",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "company",
            "subscription_date",
            "unsubscribed_date",
            "created_at",
            "updated_at",
        ]

    def create(self, validated_data):
        """Create external subscriber with current user's company"""
        request = self.context.get("request")
        if request and request.user:
            validated_data["company"] = request.user.company
        return super().create(validated_data)


class ProjectForNewsletterSerializer(serializers.ModelSerializer):
    """Serializer for projects in newsletter context - includes team members and stakeholders"""

    company_name = serializers.CharField(source="company.name", read_only=True)
    team_members = serializers.SerializerMethodField()
    stakeholders = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            "id",
            "name",
            "company_name",
            "team_members",
            "stakeholders",
        ]

    def get_team_members(self, obj):
        """Get active team members for this project"""
        team_members = []
        for team_member in obj.team_members.filter(is_active=True).select_related(
            "user"
        ):
            user = team_member.user
            name = user.get_full_name() or user.first_name or user.email
            team_members.append(
                {
                    "id": user.id,
                    "name": name,
                    "email": user.email,
                    "role": user.role,
                }
            )
        return team_members

    def get_stakeholders(self, obj):
        """Get Execution Stakeholders for this project (from execution.models.Stakeholder)"""
        stakeholders = []
        try:
            from execution.models import Stakeholder

            # Get all stakeholders for this project that have email addresses
            for stakeholder in Stakeholder.objects.filter(
                project=obj, contact__isnull=False
            ).exclude(contact=""):
                stakeholders.append(
                    {
                        "id": stakeholder.id,
                        "name": stakeholder.name,
                        "email": stakeholder.contact,
                        "role": stakeholder.role
                        or stakeholder.governance_type
                        or "Stakeholder",
                    }
                )
        except ImportError:
            # If execution app is not available, return empty list
            pass
        return stakeholders


class ExternalSubscriberSubscribeSerializer(serializers.Serializer):
    """Serializer for external subscription"""

    email = serializers.EmailField()
    first_name = serializers.CharField(max_length=100, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=100, required=False, allow_blank=True)
    company_id = serializers.IntegerField(required=False, default=1)

    def validate_email(self, value):
        """Validate email uniqueness per company"""
        company_id = self.initial_data.get("company_id", 1)
        if (
            company_id
            and ExternalSubscriber.objects.filter(
                email=value, company_id=company_id
            ).exists()
        ):
            raise serializers.ValidationError(
                "Email already subscribed for this company"
            )
        return value


class NewsletterGlobalSerializer(serializers.ModelSerializer):
    """Serializer for global newsletters (company-wide)"""

    project_name = serializers.ReadOnlyField(source="project.name")
    created_by_name = serializers.SerializerMethodField()
    created_by_email = serializers.ReadOnlyField(source="created_by.email")
    recipient_count = serializers.SerializerMethodField()
    mailing_list_names = serializers.SerializerMethodField()

    class Meta:
        model = Newsletter
        fields = [
            "id",
            "project",
            "project_name",
            "subject",
            "task_update_details",
            "additional_content",
            "recipient_type",
            "mailing_lists",
            "mailing_list_names",
            "crm_users",
            "project_recipients",
            "status",
            "sent_at",
            "created_by",
            "created_by_name",
            "created_by_email",
            "recipient_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "created_by",
            "sent_at",
            "created_at",
            "updated_at",
        ]

    def get_created_by_name(self, obj):
        """Return user's full name if available, otherwise email."""
        if not obj.created_by:
            return None

        full_name = obj.created_by.get_full_name().strip()
        if full_name:
            return full_name

        if obj.created_by.first_name:
            return obj.created_by.first_name

        if obj.created_by.username and obj.created_by.username != obj.created_by.email:
            return obj.created_by.username

        return obj.created_by.email

    def get_recipient_count(self, obj):
        """Get the number of recipients"""
        return len(obj.get_recipient_emails())

    def get_mailing_list_names(self, obj):
        """Get names of selected mailing lists"""
        return [{"id": ml.id, "name": ml.name} for ml in obj.mailing_lists.all()]

    def create(self, validated_data):
        """Create newsletter with current user as creator"""
        request = self.context.get("request")
        if request and request.user:
            validated_data["created_by"] = request.user
        return super().create(validated_data)


class ProjectForNewsletterSerializer(serializers.ModelSerializer):
    """Serializer for projects in newsletter context - includes team members and stakeholders"""

    company_name = serializers.CharField(source="company.name", read_only=True)
    team_members = serializers.SerializerMethodField()
    stakeholders = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            "id",
            "name",
            "company_name",
            "team_members",
            "stakeholders",
        ]

    def get_team_members(self, obj):
        """Get active team members for this project"""
        team_members = []
        for team_member in obj.team_members.filter(is_active=True).select_related(
            "user"
        ):
            user = team_member.user
            name = user.get_full_name() or user.first_name or user.email
            team_members.append(
                {
                    "id": user.id,
                    "name": name,
                    "email": user.email,
                    "role": user.role,
                }
            )
        return team_members

    def get_stakeholders(self, obj):
        """Get Execution Stakeholders for this project (from execution.models.Stakeholder)"""
        stakeholders = []
        try:
            from execution.models import Stakeholder

            # Get all stakeholders for this project that have email addresses
            for stakeholder in Stakeholder.objects.filter(
                project=obj, contact__isnull=False
            ).exclude(contact=""):
                stakeholders.append(
                    {
                        "id": stakeholder.id,
                        "name": stakeholder.name,
                        "email": stakeholder.contact,
                        "role": stakeholder.role
                        or stakeholder.governance_type
                        or "Stakeholder",
                    }
                )
        except ImportError:
            # If execution app is not available, return empty list
            pass
        return stakeholders
