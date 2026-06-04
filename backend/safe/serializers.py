from rest_framework import serializers
from .models import (
    AgileReleaseTrain, ARTSync, ProgramIncrement, PIObjective,
    Feature, Story, Dependency, SystemDemo, InspectAdapt,
)


class ARTSyncSerializer(serializers.ModelSerializer):
    class Meta:
        model = ARTSync
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class AgileReleaseTrainSerializer(serializers.ModelSerializer):
    syncs = ARTSyncSerializer(many=True, read_only=True)

    class Meta:
        model = AgileReleaseTrain
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class PIObjectiveSerializer(serializers.ModelSerializer):
    assigned_team_name = serializers.SerializerMethodField()

    class Meta:
        model = PIObjective
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_assigned_team_name(self, obj):
        if obj.assigned_team_id:
            user = getattr(obj.assigned_team, 'user', None)
            if user:
                return user.get_full_name() or user.email
            return str(obj.assigned_team)
        return obj.team or None


class StorySerializer(serializers.ModelSerializer):
    team_name = serializers.SerializerMethodField()
    state_display = serializers.CharField(source='get_state_display', read_only=True)

    class Meta:
        model = Story
        fields = '__all__'
        # `feature` is injected server-side from the nested route
        # (/features/<id>/stories/), so it is read-only on input.
        read_only_fields = ['id', 'feature', 'created_at', 'updated_at']

    def get_team_name(self, obj):
        if obj.team_id:
            user = getattr(obj.team, 'user', None)
            if user:
                return user.get_full_name() or user.email
            return str(obj.team)
        return None


class FeatureSerializer(serializers.ModelSerializer):
    stories = StorySerializer(many=True, read_only=True)
    wsjf = serializers.SerializerMethodField()
    cost_of_delay = serializers.SerializerMethodField()
    story_count = serializers.SerializerMethodField()
    done_story_count = serializers.SerializerMethodField()
    state_display = serializers.CharField(source='get_state_display', read_only=True)

    class Meta:
        model = Feature
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_wsjf(self, obj):
        return obj.wsjf

    def get_cost_of_delay(self, obj):
        return obj.cost_of_delay

    def get_story_count(self, obj):
        return obj.stories.count()

    def get_done_story_count(self, obj):
        return obj.stories.filter(state='done').count()


class DependencySerializer(serializers.ModelSerializer):
    source_feature_name = serializers.CharField(source='source_feature.name', read_only=True)
    target_feature_name = serializers.SerializerMethodField()
    roam_display = serializers.CharField(source='get_roam_display', read_only=True)
    owner_name = serializers.SerializerMethodField()

    class Meta:
        model = Dependency
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_target_feature_name(self, obj):
        return obj.target_feature.name if obj.target_feature_id else None

    def get_owner_name(self, obj):
        if obj.owner_id:
            return obj.owner.get_full_name() or obj.owner.email
        return None


class SystemDemoSerializer(serializers.ModelSerializer):
    feature_count = serializers.SerializerMethodField()

    class Meta:
        model = SystemDemo
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_feature_count(self, obj):
        return obj.features_demoed.count()


class InspectAdaptSerializer(serializers.ModelSerializer):
    class Meta:
        model = InspectAdapt
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class ProgramIncrementSerializer(serializers.ModelSerializer):
    objectives = PIObjectiveSerializer(many=True, read_only=True)
    objectives_count = serializers.SerializerMethodField()
    # Business-value roll-up across this PI's objectives.
    planned_business_value = serializers.SerializerMethodField()
    actual_business_value = serializers.SerializerMethodField()
    predictability = serializers.SerializerMethodField()
    feature_count = serializers.SerializerMethodField()

    class Meta:
        model = ProgramIncrement
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_objectives_count(self, obj):
        return obj.objectives.count()

    def get_planned_business_value(self, obj):
        return sum(o.business_value for o in obj.objectives.all())

    def get_actual_business_value(self, obj):
        return sum(o.actual_value for o in obj.objectives.all())

    def get_predictability(self, obj):
        planned = sum(o.business_value for o in obj.objectives.all())
        if planned <= 0:
            return None
        actual = sum(o.actual_value for o in obj.objectives.all())
        return round(actual / planned * 100)

    def get_feature_count(self, obj):
        return obj.features.count()
