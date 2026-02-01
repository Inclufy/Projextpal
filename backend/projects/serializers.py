from rest_framework import serializers
from django.db.models import Sum
from django.contrib.auth import get_user_model
from .models import (
    Project,
    Milestone,
    Task,
    Subtask,
    Expense,
    ProjectActivity,
    ApprovalStage,
    Upload,
    Risk,
    AIMitigation,
    ManualMitigation,
    ProjectTeam,
    ProjectEvent,
    Document,
    TrainingMaterial,
    TimeEntry,
)

User = get_user_model()


class TaskSerializer(serializers.ModelSerializer):
    assigned_to_email = serializers.ReadOnlyField(source="assigned_to.email")
    assigned_to_name = serializers.SerializerMethodField()
    assigned_to_role = serializers.ReadOnlyField(source="assigned_to.role")
    raci_responsible_email = serializers.ReadOnlyField(source="raci_responsible.email")
    raci_accountable_email = serializers.ReadOnlyField(source="raci_accountable.email")
    raci_consulted_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=User.objects.all(), source="raci_consulted", required=False
    )
    raci_informed_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=User.objects.all(), source="raci_informed", required=False
    )
    project_id = serializers.ReadOnlyField(source="milestone.project_id")

    subtasks = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = [
            "id",
            "milestone",
            "title",
            "description",
            "assigned_to",
            "assigned_to_email",
            "assigned_to_name",
            "assigned_to_role",
            "start_date",
            "due_date",
            "status",
            "priority",
            "progress",
            "order_index",
            "raci_responsible",
            "raci_responsible_email",
            "raci_accountable",
            "raci_accountable_email",
            "raci_consulted_ids",
            "raci_informed_ids",
            "subtasks",
            "created_at",
            "updated_at",
            "project_id",
        ]
        read_only_fields = ["created_at", "updated_at", "project_id"]

    def get_assigned_to_name(self, obj):
        user = getattr(obj, "assigned_to", None)
        if not user:
            return None
        return getattr(user, "first_name", None) or getattr(user, "email", None)

    def get_subtasks(self, obj):
        return [
            {"id": s.id, "title": s.title, "completed": s.completed}
            for s in obj.subtasks.all()
        ]


class SubtaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subtask
        fields = ["id", "task", "title", "completed", "created_at", "updated_at"]
        read_only_fields = ["created_at", "updated_at"]


class MilestoneSerializer(serializers.ModelSerializer):
    tasks = TaskSerializer(many=True, read_only=True)

    class Meta:
        model = Milestone
        fields = [
            "id",
            "project",
            "name",
            "description",
            "start_date",
            "end_date",
            "status",
            "order_index",
            "tasks",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]


class ProjectSerializer(serializers.ModelSerializer):
    milestones = MilestoneSerializer(many=True, read_only=True)
    expenses_total = serializers.SerializerMethodField()
    expenses = serializers.SerializerMethodField()
    progress = serializers.SerializerMethodField()
    team_members_count = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            "id",
            "company",
            "name",
            "project_type",
            "methodology",
            "budget",
            "start_date",
            "end_date",
            "description",
            "project_goal",
            "status",
            "progress",
            "created_by",
            "created_at",
            "updated_at",
            "milestones",
            "expenses_total",
            "expenses",
            "team_members_count",
        ]
        read_only_fields = ["company", "created_by", "created_at", "updated_at"]

    def create(self, validated_data):
        request = self.context.get("request")
        if request and request.user and not validated_data.get("company"):
            validated_data["company"] = request.user.company
        if request and request.user and not validated_data.get("created_by"):
            validated_data["created_by"] = request.user
        return super().create(validated_data)

    def get_expenses_total(self, obj):
        total = obj.expenses.aggregate(total=Sum("amount")).get("total")
        return total or 0

    def get_expenses(self, obj):
        # lightweight list for quick UI; full CRUD via Expense endpoints
        return [
            {
                "id": e.id,
                "description": e.description,
                "category": e.category,
                "date": e.date,
                "amount": e.amount,
                "status": e.status,
            }
            for e in obj.expenses.all()[:50]
        ]

    def get_progress(self, obj):
        try:
            return obj.compute_progress_from_work()
        except Exception:
            return 0

    def get_team_members_count(self, obj):
        return obj.team_members.filter(is_active=True).count()


class ProjectListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for project lists - optimized for performance"""

    progress = serializers.SerializerMethodField()
    team_members_count = serializers.SerializerMethodField()
    expenses_total = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            "id",
            "name",
            "project_type",
            "methodology",
            "budget",
            "start_date",
            "end_date",
            "status",
            "progress",
            "team_members_count",
            "expenses_total",
            "created_at",
            "updated_at",
        ]

    def get_progress(self, obj):
        try:
            return obj.compute_progress_from_work()
        except Exception:
            return 0

    def get_team_members_count(self, obj):
        return obj.team_members.filter(is_active=True).count()

    def get_expenses_total(self, obj):
        total = obj.expenses.aggregate(total=Sum("amount")).get("total")
        return total or 0


class ExpenseSerializer(serializers.ModelSerializer):
    project_name = serializers.ReadOnlyField(source="project.name")

    class Meta:
        model = Expense
        fields = [
            "id",
            "project",
            "project_name",
            "description",
            "category",
            "date",
            "amount",
            "status",
            "created_by",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_by", "created_at", "updated_at"]


class ProjectActivitySerializer(serializers.ModelSerializer):
    project_name = serializers.ReadOnlyField(source="project.name")
    user_email = serializers.ReadOnlyField(source="user.email")
    user_display_name = serializers.SerializerMethodField()

    class Meta:
        model = ProjectActivity
        fields = [
            "id",
            "project",
            "project_name",
            "user",
            "user_email",
            "user_display_name",
            "action",
            "message",
            "created_at",
        ]
        read_only_fields = ["created_at"]

    def get_user_display_name(self, obj):
        """Return user's full name if available, otherwise email."""
        if not obj.user:
            return "Unknown User"

        # Try to get full name
        full_name = obj.user.get_full_name().strip()
        if full_name:
            return full_name

        # Fallback to first_name or username
        if obj.user.first_name:
            return obj.user.first_name

        if obj.user.username and obj.user.username != obj.user.email:
            return obj.user.username

        # Final fallback to email
        return obj.user.email


class ApprovalStageSerializer(serializers.ModelSerializer):
    evidence_url = serializers.SerializerMethodField()

    class Meta:
        model = ApprovalStage
        fields = [
            "id",
            "project",
            "name",
            "value",
            "description",
            "order_index",
            "status",
            "approver_name",
            "approver_role",
            "approver_comments",
            "reviewed_at",
            "evidence",
            "evidence_url",
            "created_by",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_by", "created_at", "updated_at"]

    def get_evidence_url(self, obj):
        f = getattr(obj.evidence, "file", None)
        try:
            if not f:
                return None
            url = f.url
            request = self.context.get("request") if hasattr(self, "context") else None
            return request.build_absolute_uri(url) if request else url
        except Exception:
            return None


class UploadSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = Upload
        fields = ["id", "file", "url", "uploaded_by", "company", "created_at"]
        read_only_fields = ["uploaded_by", "company", "created_at"]

    def get_url(self, obj):
        try:
            url = obj.file.url
            request = self.context.get("request") if hasattr(self, "context") else None
            return request.build_absolute_uri(url) if request else url
        except Exception:
            return None


# Risk Management Serializers
class AIMitigationSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIMitigation
        fields = [
            "id",
            "strategy",
            "actions",
            "timeline",
            "cost",
            "effectiveness",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]


class ManualMitigationSerializer(serializers.ModelSerializer):
    risk = serializers.PrimaryKeyRelatedField(
        queryset=Risk.objects.all(), write_only=True, required=False
    )

    class Meta:
        model = ManualMitigation
        fields = [
            "id",
            "risk",
            "strategy",
            "actions",
            "timeline",
            "cost",
            "effectiveness",
            "notes",
            "created_by",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_by", "created_at", "updated_at"]

    def create(self, validated_data):
        request = self.context.get("request")
        if request and request.user:
            validated_data["created_by"] = request.user
        return super().create(validated_data)


class RiskSerializer(serializers.ModelSerializer):
    owner_name = serializers.SerializerMethodField()
    owner_email = serializers.ReadOnlyField(source="owner.email")
    created_by_name = serializers.SerializerMethodField()
    created_by_email = serializers.ReadOnlyField(source="created_by.email")
    ai_mitigation = AIMitigationSerializer(read_only=True)
    manual_mitigation = ManualMitigationSerializer(read_only=True)

    class Meta:
        model = Risk
        fields = [
            "id",
            "project",
            "name",
            "description",
            "category",
            "impact",
            "probability",  # integer percentage 0-100
            "level",
            "status",
            "owner",
            "owner_name",
            "owner_email",
            "created_by",
            "created_by_name",
            "created_by_email",
            "ai_mitigation",
            "manual_mitigation",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_by", "created_at", "updated_at"]

    def get_owner_name(self, obj):
        if not obj.owner:
            return None
        return obj.owner.first_name or obj.owner.email

    def get_created_by_name(self, obj):
        if not obj.created_by:
            return None
        return obj.created_by.first_name or obj.created_by.email

    def create(self, validated_data):
        request = self.context.get("request")
        if request and request.user:
            validated_data["created_by"] = request.user
        return super().create(validated_data)


class RiskListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for risk lists."""

    owner_name = serializers.SerializerMethodField()
    owner_email = serializers.ReadOnlyField(source="owner.email")
    ai_mitigation = AIMitigationSerializer(read_only=True)
    manual_mitigation = ManualMitigationSerializer(read_only=True)

    class Meta:
        model = Risk
        fields = [
            "id",
            "name",
            "description",
            "category",
            "impact",
            "probability",
            "level",
            "status",
            "owner",
            "owner_name",
            "owner_email",
            "ai_mitigation",
            "manual_mitigation",
            "created_at",
            "updated_at",
        ]

    def get_owner_name(self, obj):
        if not obj.owner:
            return None
        return obj.owner.first_name or obj.owner.email


class ProjectTeamSerializer(serializers.ModelSerializer):
    """Serializer for ProjectTeam model"""

    user_name = serializers.SerializerMethodField()
    user_email = serializers.ReadOnlyField(source="user.email")
    user_role = serializers.ReadOnlyField(source="user.role")
    added_by_name = serializers.SerializerMethodField()

    class Meta:
        model = ProjectTeam
        fields = [
            "id",
            "user",
            "user_name",
            "user_email",
            "user_role",
            "added_by",
            "added_by_name",
            "added_at",
            "is_active",
        ]
        read_only_fields = ["id", "added_at", "added_by"]

    def get_user_name(self, obj):
        """Return user's full name if available, otherwise email."""
        if not obj.user:
            return None

        # Try to get full name
        full_name = obj.user.get_full_name().strip()
        if full_name:
            return full_name

        # Fallback to first_name or username
        if obj.user.first_name:
            return obj.user.first_name

        if obj.user.username and obj.user.username != obj.user.email:
            return obj.user.username

        # Final fallback to email
        return obj.user.email

    def get_added_by_name(self, obj):
        """Return added_by user's full name if available, otherwise email."""
        if not obj.added_by:
            return None

        # Try to get full name
        full_name = obj.added_by.get_full_name().strip()
        if full_name:
            return full_name

        # Fallback to first_name or username
        if obj.added_by.first_name:
            return obj.added_by.first_name

        if obj.added_by.username and obj.added_by.username != obj.added_by.email:
            return obj.added_by.username

        # Final fallback to email
        return obj.added_by.email


class ProjectEventSerializer(serializers.ModelSerializer):
    """Serializer for calendar events"""

    project_name = serializers.ReadOnlyField(source="project.name")
    created_by_name = serializers.SerializerMethodField()
    created_by_email = serializers.ReadOnlyField(source="created_by.email")

    class Meta:
        model = ProjectEvent
        fields = [
            "id",
            "project",
            "project_name",
            "title",
            "description",
            "start_date",
            "end_date",
            "created_by",
            "created_by_name",
            "created_by_email",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_by", "created_at", "updated_at"]

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

    def validate(self, data):
        """Validate that end_date is not before start_date"""
        if data.get("end_date") and data.get("start_date"):
            if data["end_date"] < data["start_date"]:
                raise serializers.ValidationError(
                    {"end_date": "End date must be after or equal to start date."}
                )
        return data

    def create(self, validated_data):
        request = self.context.get("request")
        if request and request.user:
            validated_data["created_by"] = request.user
        return super().create(validated_data)


class DocumentSerializer(serializers.ModelSerializer):
    owner_name = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()
    file_size = serializers.ReadOnlyField()
    file_type = serializers.ReadOnlyField()
    file_url = serializers.SerializerMethodField()
    linked_milestone_names = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = [
            "id",
            "project",
            "name",
            "description",
            "category",
            "status",
            "file",
            "file_size",
            "file_type",
            "file_url",
            "linked_milestones",
            "linked_milestone_names",
            "linked_stages",
            "owner",
            "owner_name",
            "created_by",
            "created_by_name",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get("request")
        if request:
            # Make file field not required during creation since we handle it in perform_create
            if request.method == "POST":
                self.fields["file"].required = False
            # Make file and project fields not required during updates
            elif request.method in ["PUT", "PATCH"]:
                self.fields["file"].required = False
                self.fields["project"].required = False

    def get_owner_name(self, obj):
        if obj.owner:
            return obj.owner.get_full_name()
        return None

    def get_created_by_name(self, obj):
        if obj.created_by:
            return obj.created_by.get_full_name()
        return None

    def get_file_url(self, obj):
        if obj.file and obj.file.file:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.file.file.url)
        return None

    def get_linked_milestone_names(self, obj):
        return [milestone.name for milestone in obj.linked_milestones.all()]

    def create(self, validated_data):
        request = self.context.get("request")
        if request and request.user:
            validated_data["created_by"] = request.user
            if not validated_data.get("owner"):
                validated_data["owner"] = request.user
        return super().create(validated_data)


class DocumentListSerializer(serializers.ModelSerializer):
    """Simplified serializer for document lists"""

    owner_name = serializers.SerializerMethodField()
    file_size = serializers.ReadOnlyField()
    file_type = serializers.ReadOnlyField()
    file_url = serializers.SerializerMethodField()
    linked_milestone_names = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = [
            "id",
            "name",
            "description",
            "category",
            "status",
            "file_size",
            "file_type",
            "file_url",
            "linked_milestone_names",
            "linked_stages",
            "owner_name",
            "created_at",
            "updated_at",
        ]

    def get_owner_name(self, obj):
        if obj.owner:
            return obj.owner.get_full_name()
        return None

    def get_file_url(self, obj):
        if obj.file and obj.file.file:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.file.file.url)
        return None

    def get_linked_milestone_names(self, obj):
        return [milestone.name for milestone in obj.linked_milestones.all()]


class TrainingMaterialSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()
    file_size = serializers.ReadOnlyField()
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = TrainingMaterial
        fields = [
            "id",
            "project",
            "name",
            "description",
            "audience",
            "format_type",
            "status",
            "file",
            "file_size",
            "file_url",
            "created_by",
            "created_by_name",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get("request")
        if request:
            # Make file and project fields not required during updates
            if request.method in ["PUT", "PATCH"]:
                self.fields["file"].required = False
                self.fields["project"].required = False

    def get_created_by_name(self, obj):
        if obj.created_by:
            return obj.created_by.get_full_name()
        return None

    def get_file_url(self, obj):
        if obj.file and obj.file.file:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.file.file.url)
        return None

    def create(self, validated_data):
        request = self.context.get("request")
        if request and request.user:
            validated_data["created_by"] = request.user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # If file is not provided in the update data, preserve the existing file
        if "file" not in validated_data:
            # Don't update the file field, preserve the existing one
            pass
        elif validated_data.get("file") is None:
            # Explicitly setting file to None - clear the file
            instance.file = None

        return super().update(instance, validated_data)


class TrainingMaterialListSerializer(serializers.ModelSerializer):
    """Simplified serializer for training material lists"""

    created_by_name = serializers.SerializerMethodField()
    file_size = serializers.ReadOnlyField()
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = TrainingMaterial
        fields = [
            "id",
            "name",
            "description",
            "audience",
            "format_type",
            "status",
            "file",
            "file_size",
            "file_url",
            "created_by_name",
            "created_at",
            "updated_at",
        ]

    def get_created_by_name(self, obj):
        if obj.created_by:
            return obj.created_by.get_full_name()
        return None

    def get_file_url(self, obj):
        if obj.file and obj.file.file:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.file.file.url)
        return None


class TimeEntrySerializer(serializers.ModelSerializer):
    """Serializer for time tracking entries"""
    
    user_name = serializers.SerializerMethodField()
    user_email = serializers.ReadOnlyField(source="user.email")
    task_title = serializers.ReadOnlyField(source="task.title")
    milestone_name = serializers.ReadOnlyField(source="milestone.name")
    labor_cost = serializers.ReadOnlyField()
    approved_by_name = serializers.SerializerMethodField()

    class Meta:
        model = TimeEntry
        fields = [
            "id",
            "project",
            "user",
            "user_name",
            "user_email",
            "task",
            "task_title",
            "milestone",
            "milestone_name",
            "date",
            "hours",
            "description",
            "status",
            "hourly_rate_snapshot",
            "labor_cost",
            "billable",
            "approved_by",
            "approved_by_name",
            "approved_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "user",
            "hourly_rate_snapshot",
            "labor_cost",
            "approved_by",
            "approved_at",
            "created_at",
            "updated_at",
        ]

    def get_user_name(self, obj):
        if obj.user:
            full_name = obj.user.get_full_name().strip()
            if full_name:
                return full_name
            return obj.user.email
        return None

    def get_approved_by_name(self, obj):
        if obj.approved_by:
            full_name = obj.approved_by.get_full_name().strip()
            if full_name:
                return full_name
            return obj.approved_by.email
        return None

    def create(self, validated_data):
        request = self.context.get("request")
        if request and request.user:
            validated_data["user"] = request.user
            # Auto-populate hourly rate from ProjectTeam
            try:
                team_member = ProjectTeam.objects.get(
                    project=validated_data["project"], user=request.user
                )
                validated_data["hourly_rate_snapshot"] = team_member.hourly_rate
            except ProjectTeam.DoesNotExist:
                validated_data["hourly_rate_snapshot"] = 0
        return super().create(validated_data)


class TimeEntrySummarySerializer(serializers.Serializer):
    """Serializer for time entry summary/aggregations"""
    
    total_hours = serializers.DecimalField(max_digits=10, decimal_places=2)
    total_labor_cost = serializers.DecimalField(max_digits=12, decimal_places=2)
    billable_hours = serializers.DecimalField(max_digits=10, decimal_places=2)
    billable_cost = serializers.DecimalField(max_digits=12, decimal_places=2)
    entries_count = serializers.IntegerField()
    by_user = serializers.ListField(child=serializers.DictField(), required=False)
    by_status = serializers.DictField(required=False)
    by_month = serializers.ListField(child=serializers.DictField(), required=False)


class ProjectTeamWithRateSerializer(serializers.ModelSerializer):
    """Serializer for project team members with hourly rate"""
    
    user_name = serializers.SerializerMethodField()
    user_email = serializers.ReadOnlyField(source="user.email")
    user_role = serializers.ReadOnlyField(source="user.role")
    added_by_name = serializers.SerializerMethodField()

    class Meta:
        model = ProjectTeam
        fields = [
            "id",
            "project",
            "user",
            "user_name",
            "user_email",
            "user_role",
            "hourly_rate",
            "added_by",
            "added_by_name",
            "added_at",
            "is_active",
        ]
        read_only_fields = ["added_by", "added_at"]

    def get_user_name(self, obj):
        if obj.user:
            full_name = obj.user.get_full_name().strip()
            if full_name:
                return full_name
            return obj.user.email
        return None

    def get_added_by_name(self, obj):
        if obj.added_by:
            full_name = obj.added_by.get_full_name().strip()
            if full_name:
                return full_name
            return obj.added_by.email
        return None
# ========================================
# ADD THESE TO projects/serializers.py
# ========================================

from .models import BudgetCategory, BudgetItem, ProjectBudget


class BudgetCategorySerializer(serializers.ModelSerializer):
    spent = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    remaining = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = BudgetCategory
        fields = [
            'id', 'name', 'allocated', 'spent', 'remaining',
            'color', 'icon', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['company'] = self.context['request'].user.company
        return super().create(validated_data)


class BudgetItemSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True)

    class Meta:
        model = BudgetItem
        fields = [
            'id', 'project', 'project_name', 'category', 'category_name',
            'description', 'amount', 'date', 'type', 'status',
            'created_by', 'created_by_name', 'approved_by', 'approved_by_name',
            'receipt_url', 'notes', 'rejection_reason',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'approved_by', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class ProjectBudgetSerializer(serializers.ModelSerializer):
    total_spent = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)
    total_remaining = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True)

    class Meta:
        model = ProjectBudget
        fields = [
            'id', 'project', 'project_name', 'total_budget',
            'total_spent', 'total_remaining', 'currency',
            'period_start', 'period_end', 'updated_at'
        ]
        read_only_fields = ['id', 'updated_at']


class BudgetOverviewSerializer(serializers.Serializer):
    """Complete budget overview for a company"""
    total_budget = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_spent = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_remaining = serializers.DecimalField(max_digits=15, decimal_places=2)
    currency = serializers.CharField()
    categories = BudgetCategorySerializer(many=True)