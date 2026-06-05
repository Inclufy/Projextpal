from .models import DefinitionOfDone

from rest_framework import serializers
from django.db import models
from django.contrib.auth import get_user_model
from .models import (
    AgileTeamMember, AgileProductVision, AgileProductGoal,
    AgileUserPersona, AgileEpic, AgileBacklogItem, AgileIteration,
    AgileRelease, AgileDailyUpdate, AgileRetrospective, AgileRetroItem,
    AgileBudget, AgileBudgetItem, AgileFlowConfig, AgileDodEntry
)

User = get_user_model()


class AgileTeamMemberSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    
    class Meta:
        model = AgileTeamMember
        fields = [
            'id', 'user', 'user_name', 'user_email', 'role', 'role_display',
            'capacity_hours', 'skills', 'joined_at'
        ]
        read_only_fields = ['joined_at']


class AgileTeamMemberCreateSerializer(serializers.Serializer):
    user_email = serializers.EmailField()
    role = serializers.CharField()
    capacity_hours = serializers.IntegerField(default=40)
    skills = serializers.ListField(child=serializers.CharField(), required=False, default=list)


class AgileProductGoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = AgileProductGoal
        fields = ['id', 'title', 'description', 'priority', 'status', 'target_date', 'order']


class AgileProductVisionSerializer(serializers.ModelSerializer):
    goals = AgileProductGoalSerializer(many=True, read_only=True)
    
    class Meta:
        model = AgileProductVision
        fields = [
            'id', 'vision_statement', 'target_audience', 'problem_statement',
            'unique_value_proposition', 'success_criteria', 'goals',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class AgileUserPersonaSerializer(serializers.ModelSerializer):
    class Meta:
        model = AgileUserPersona
        fields = [
            'id', 'name', 'role', 'age_range', 'background',
            'goals', 'pain_points', 'quote', 'avatar_color', 'created_at'
        ]
        read_only_fields = ['created_at']


class AgileEpicSerializer(serializers.ModelSerializer):
    total_points = serializers.IntegerField(read_only=True)
    completed_points = serializers.IntegerField(read_only=True)
    story_count = serializers.SerializerMethodField()
    
    product_goal_title = serializers.CharField(source='product_goal.title', read_only=True, allow_null=True)

    class Meta:
        model = AgileEpic
        fields = [
            'id', 'title', 'description', 'priority', 'color', 'order',
            'product_goal', 'product_goal_title',
            'total_points', 'completed_points', 'story_count', 'created_at'
        ]
        read_only_fields = ['created_at']

    def get_story_count(self, obj):
        return obj.stories.count()


class AgileBacklogItemSerializer(serializers.ModelSerializer):
    assignee_name = serializers.CharField(source='assignee.get_full_name', read_only=True, allow_null=True)
    epic_title = serializers.CharField(source='epic.title', read_only=True, allow_null=True)
    product_goal = serializers.IntegerField(source='epic.product_goal_id', read_only=True, allow_null=True)
    product_goal_title = serializers.CharField(source='epic.product_goal.title', read_only=True, allow_null=True)
    iteration_name = serializers.CharField(source='iteration.name', read_only=True, allow_null=True)
    type_display = serializers.CharField(source='get_item_type_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    cycle_time_hours = serializers.FloatField(read_only=True, allow_null=True)
    dod_met = serializers.SerializerMethodField()

    class Meta:
        model = AgileBacklogItem
        fields = [
            'id', 'epic', 'epic_title', 'product_goal', 'product_goal_title',
            'title', 'description', 'acceptance_criteria',
            'item_type', 'type_display', 'priority', 'priority_display',
            'status', 'status_display', 'story_points', 'assignee', 'assignee_name',
            'iteration', 'iteration_name', 'order',
            'started_at', 'completed_at', 'cycle_time_hours', 'dod_met',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'started_at', 'completed_at']

    def get_dod_met(self, obj):
        all_met, _ = obj.dod_status()
        return all_met


class AgileDodEntrySerializer(serializers.ModelSerializer):
    criterion_description = serializers.CharField(source='criterion.description', read_only=True)
    criterion_category = serializers.CharField(source='criterion.category', read_only=True)
    is_required = serializers.BooleanField(source='criterion.is_required', read_only=True)
    met_by_name = serializers.CharField(source='met_by.get_full_name', read_only=True, allow_null=True)

    class Meta:
        model = AgileDodEntry
        fields = [
            'id', 'item', 'criterion', 'criterion_description', 'criterion_category',
            'is_required', 'is_met', 'met_by', 'met_by_name', 'met_at', 'created_at'
        ]
        read_only_fields = ['item', 'met_by', 'met_at', 'created_at']


class AgileFlowConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = AgileFlowConfig
        fields = ['id', 'wip_limit', 'target_cycle_time_days', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class AgileIterationSerializer(serializers.ModelSerializer):
    total_points = serializers.IntegerField(read_only=True)
    completed_points = serializers.IntegerField(read_only=True)
    days_remaining = serializers.IntegerField(read_only=True)
    item_count = serializers.SerializerMethodField()
    progress = serializers.SerializerMethodField()
    
    class Meta:
        model = AgileIteration
        fields = [
            'id', 'name', 'goal', 'start_date', 'end_date', 'status',
            'velocity_committed', 'velocity_completed', 'total_points',
            'completed_points', 'days_remaining', 'item_count', 'progress', 'created_at'
        ]
        read_only_fields = ['created_at']
    
    def get_item_count(self, obj):
        return obj.items.count()
    
    def get_progress(self, obj):
        total = obj.total_points
        if total == 0:
            return 0
        return int((obj.completed_points / total) * 100)


class AgileIterationDetailSerializer(AgileIterationSerializer):
    items = AgileBacklogItemSerializer(many=True, read_only=True)
    
    class Meta(AgileIterationSerializer.Meta):
        fields = AgileIterationSerializer.Meta.fields + ['items']


class AgileReleaseSerializer(serializers.ModelSerializer):
    progress = serializers.IntegerField(read_only=True)
    iteration_count = serializers.SerializerMethodField()
    iterations = serializers.SerializerMethodField()
    shipped_items = serializers.SerializerMethodField()
    shipped_points = serializers.SerializerMethodField()

    class Meta:
        model = AgileRelease
        fields = [
            'id', 'name', 'version', 'description', 'target_date', 'status',
            'features', 'progress', 'iteration_count', 'iterations',
            'shipped_items', 'shipped_points', 'created_at'
        ]
        read_only_fields = ['created_at']

    def get_iteration_count(self, obj):
        return obj.iterations.count()

    def get_iterations(self, obj):
        return [{'id': it.id, 'name': it.name, 'status': it.status}
                for it in obj.iterations.all()]

    def _shipped_qs(self, obj):
        # Done work delivered by this release = done items in its iterations.
        return AgileBacklogItem.objects.filter(
            iteration__in=obj.iterations.all(), status='done'
        )

    def get_shipped_items(self, obj):
        return [{'id': i.id, 'title': i.title, 'story_points': i.story_points,
                 'iteration_name': i.iteration.name if i.iteration else None}
                for i in self._shipped_qs(obj).select_related('iteration')]

    def get_shipped_points(self, obj):
        return self._shipped_qs(obj).aggregate(
            total=models.Sum('story_points'))['total'] or 0


class AgileDailyUpdateSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = AgileDailyUpdate
        fields = [
            'id', 'user', 'user_name', 'user_email', 'date',
            'yesterday', 'today', 'blockers', 'created_at'
        ]
        read_only_fields = ['created_at', 'user']


class AgileRetroItemSerializer(serializers.ModelSerializer):
    assignee_name = serializers.CharField(source='assignee.get_full_name', read_only=True, allow_null=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True, allow_null=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    
    class Meta:
        model = AgileRetroItem
        fields = [
            'id', 'category', 'category_display', 'content', 'votes',
            'assignee', 'assignee_name', 'status', 'created_by', 'created_by_name'
        ]
        read_only_fields = ['created_by']


class AgileRetrospectiveSerializer(serializers.ModelSerializer):
    items = AgileRetroItemSerializer(many=True, read_only=True)
    iteration_name = serializers.CharField(source='iteration.name', read_only=True)
    facilitator_name = serializers.CharField(source='facilitator.get_full_name', read_only=True, allow_null=True)
    
    class Meta:
        model = AgileRetrospective
        fields = [
            'id', 'iteration', 'iteration_name', 'date', 'facilitator',
            'facilitator_name', 'notes', 'items', 'created_at'
        ]
        read_only_fields = ['created_at']


class AgileBudgetItemSerializer(serializers.ModelSerializer):
    iteration_name = serializers.CharField(source='iteration.name', read_only=True, allow_null=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    variance = serializers.SerializerMethodField()
    
    class Meta:
        model = AgileBudgetItem
        fields = [
            'id', 'iteration', 'iteration_name', 'category', 'category_display',
            'description', 'planned_amount', 'actual_amount', 'variance', 'date'
        ]
    
    def get_variance(self, obj):
        return float(obj.planned_amount - obj.actual_amount)


class AgileBudgetSerializer(serializers.ModelSerializer):
    items = AgileBudgetItemSerializer(many=True, read_only=True)
    total_spent = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    remaining = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    utilization_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = AgileBudget
        fields = [
            'id', 'total_budget', 'currency', 'total_spent', 'remaining',
            'utilization_percentage', 'items', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_utilization_percentage(self, obj):
        if obj.total_budget == 0:
            return 0
        return round((obj.total_spent / obj.total_budget) * 100, 1)


# Dashboard Serializer
class AgileDashboardSerializer(serializers.Serializer):
    has_initialized = serializers.BooleanField()
    current_iteration = AgileIterationSerializer(allow_null=True)
    total_backlog_items = serializers.IntegerField()
    total_story_points = serializers.IntegerField()
    completed_story_points = serializers.IntegerField()
    team_size = serializers.IntegerField()
    average_velocity = serializers.FloatField(allow_null=True)
    velocity_history = serializers.ListField(child=serializers.DictField())
    upcoming_releases = AgileReleaseSerializer(many=True)
    recent_activity = serializers.ListField(child=serializers.DictField())

class DefinitionOfDoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = DefinitionOfDone
        fields = ['id', 'project', 'description', 'category', 'is_required', 'order', 'created_at', 'updated_at']
        read_only_fields = ['id', 'project', 'created_at', 'updated_at']
