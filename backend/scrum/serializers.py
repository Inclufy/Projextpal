from rest_framework import serializers
from django.db.models import Sum
from .models import (
    ProductBacklog, BacklogItem, Sprint, SprintBurndown,
    DailyStandup, StandupUpdate, SprintReview, SprintRetrospective,
    Velocity, DefinitionOfDone, ScrumTeam,
    SprintGoal, SprintPlanning, Increment, DoDChecklistCompletion,
    DoDChecklistEntry,
)


class BacklogItemSerializer(serializers.ModelSerializer):
    assignee_name = serializers.CharField(source='assignee.get_full_name', read_only=True)
    reporter_name = serializers.CharField(source='reporter.get_full_name', read_only=True)
    sprint_name = serializers.CharField(source='sprint.name', read_only=True)
    children_count = serializers.SerializerMethodField()
    children = serializers.SerializerMethodField()  # ✅ ADD THIS LINE
    
    class Meta:
        model = BacklogItem
        fields = '__all__'
        read_only_fields = ['backlog', 'created_at', 'updated_at']
    
    def get_children_count(self, obj):
        return obj.children.count()
    
    # ✅ ADD THIS METHOD
    def get_children(self, obj):
        """Return child tasks/subtasks"""
        children = obj.children.all()
        if not self.context.get('skip_children'):
            return BacklogItemSerializer(children, many=True, context={'skip_children': True}).data
        return []


class ProductBacklogSerializer(serializers.ModelSerializer):
    items = BacklogItemSerializer(many=True, read_only=True)
    total_items = serializers.SerializerMethodField()
    total_story_points = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductBacklog
        fields = '__all__'
        read_only_fields = ['project', 'created_at', 'updated_at']
    
    def get_total_items(self, obj):
        return obj.items.count()
    
    def get_total_story_points(self, obj):
        return obj.items.aggregate(total=Sum('story_points'))['total'] or 0


class SprintBurndownSerializer(serializers.ModelSerializer):
    class Meta:
        model = SprintBurndown
        fields = '__all__'
        read_only_fields = ['sprint']


class SprintSerializer(serializers.ModelSerializer):
    total_story_points = serializers.IntegerField(read_only=True)
    completed_story_points = serializers.IntegerField(read_only=True)
    items_count = serializers.SerializerMethodField()
    progress_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = Sprint
        fields = '__all__'
        read_only_fields = ['project', 'created_at', 'updated_at']
    
    def get_items_count(self, obj):
        return obj.items.count()
    
    def get_progress_percentage(self, obj):
        total = obj.total_story_points
        if total > 0:
            return round((obj.completed_story_points / total) * 100)
        return 0


class SprintDetailSerializer(SprintSerializer):
    items = BacklogItemSerializer(many=True, read_only=True)
    burndown_data = SprintBurndownSerializer(many=True, read_only=True)


class StandupUpdateSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = StandupUpdate
        fields = '__all__'
        read_only_fields = ['standup']


class DailyStandupSerializer(serializers.ModelSerializer):
    updates = StandupUpdateSerializer(many=True, read_only=True)
    
    class Meta:
        model = DailyStandup
        fields = '__all__'
        read_only_fields = ['sprint', 'created_at']


class SprintReviewSerializer(serializers.ModelSerializer):
    sprint_name = serializers.CharField(source='sprint.name', read_only=True)
    
    class Meta:
        model = SprintReview
        fields = '__all__'
        read_only_fields = ['created_at']


class SprintRetrospectiveSerializer(serializers.ModelSerializer):
    sprint_name = serializers.CharField(source='sprint.name', read_only=True)
    
    class Meta:
        model = SprintRetrospective
        fields = '__all__'
        read_only_fields = ['created_at']


class VelocitySerializer(serializers.ModelSerializer):
    sprint_name = serializers.CharField(source='sprint.name', read_only=True)
    sprint_number = serializers.IntegerField(source='sprint.number', read_only=True)
    completion_rate = serializers.FloatField(read_only=True)
    
    class Meta:
        model = Velocity
        fields = '__all__'
        read_only_fields = ['project', 'sprint']


class DefinitionOfDoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = DefinitionOfDone
        fields = '__all__'
        read_only_fields = ['project', 'created_at', 'updated_at', 'created_by']  # ✅ ADD updated_at, created_by
    
    # ✅ ADD THIS METHOD
    def create(self, validated_data):
        """Auto-set created_by"""
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class ScrumTeamSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = ScrumTeam
        fields = '__all__'
        read_only_fields = ['project', 'created_at']

# ==================== NEW SERIALIZERS FOR BUG FIXES ====================

class SprintGoalSerializer(serializers.ModelSerializer):
    sprint_name = serializers.CharField(source='sprint.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = SprintGoal
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'created_by']
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class SprintPlanningSerializer(serializers.ModelSerializer):
    sprint_name = serializers.CharField(source='sprint.name', read_only=True)
    attendee_names = serializers.SerializerMethodField()
    facilitator_name = serializers.CharField(source='facilitator.get_full_name', read_only=True)
    
    class Meta:
        model = SprintPlanning
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']
    
    def get_attendee_names(self, obj):
        return [u.get_full_name() or u.username for u in obj.attendees.all()]


class IncrementSerializer(serializers.ModelSerializer):
    sprint_name = serializers.CharField(source='sprint.name', read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True)
    completed_tasks_count = serializers.SerializerMethodField()
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = Increment
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'created_by']
    
    def get_completed_tasks_count(self, obj):
        return obj.completed_tasks.count()
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class DoDChecklistCompletionSerializer(serializers.ModelSerializer):
    dod_name = serializers.CharField(source='definition_of_done.name', read_only=True)
    completed_by_name = serializers.CharField(source='completed_by.get_full_name', read_only=True)

    class Meta:
        model = DoDChecklistCompletion
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'completed_by']


class DoDChecklistEntrySerializer(serializers.ModelSerializer):
    """Per-sprint, per-DoD-criterion tick used to gate 'Done'."""
    dod_item_text = serializers.CharField(source='dod_item.item', read_only=True)
    dod_item_order = serializers.IntegerField(source='dod_item.order', read_only=True)
    completed_by_name = serializers.CharField(source='completed_by.get_full_name', read_only=True)

    class Meta:
        model = DoDChecklistEntry
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'completed_by', 'completed_at']