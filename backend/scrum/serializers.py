from rest_framework import serializers
from django.db.models import Sum
from .models import (
    ProductBacklog, BacklogItem, Sprint, SprintBurndown,
    DailyStandup, StandupUpdate, SprintReview, SprintRetrospective,
    Velocity, DefinitionOfDone, ScrumTeam
)


class BacklogItemSerializer(serializers.ModelSerializer):
    assignee_name = serializers.CharField(source='assignee.get_full_name', read_only=True)
    reporter_name = serializers.CharField(source='reporter.get_full_name', read_only=True)
    sprint_name = serializers.CharField(source='sprint.name', read_only=True)
    children_count = serializers.SerializerMethodField()
    
    class Meta:
        model = BacklogItem
        fields = '__all__'
        read_only_fields = ['backlog', 'created_at', 'updated_at']
    
    def get_children_count(self, obj):
        return obj.children.count()


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
        read_only_fields = ['sprint', 'created_at']


class SprintRetrospectiveSerializer(serializers.ModelSerializer):
    sprint_name = serializers.CharField(source='sprint.name', read_only=True)
    
    class Meta:
        model = SprintRetrospective
        fields = '__all__'
        read_only_fields = ['sprint', 'created_at']


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
        read_only_fields = ['project', 'created_at']


class ScrumTeamSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = ScrumTeam
        fields = '__all__'
        read_only_fields = ['project', 'created_at']
