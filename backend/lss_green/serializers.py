from rest_framework import serializers

from projects.models import Project
from .models import DMAICPhase, LSSGreenMetric, LSSGreenMeasurement, LSSGreenTask


class DMAICPhaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = DMAICPhase
        fields = '__all__'
        read_only_fields = ['id', 'project', 'created_at', 'updated_at']


class LSSGreenMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = LSSGreenMetric
        fields = '__all__'
        read_only_fields = ['id', 'project', 'created_at', 'updated_at']


class LSSGreenMeasurementSerializer(serializers.ModelSerializer):
    class Meta:
        model = LSSGreenMeasurement
        fields = '__all__'
        read_only_fields = ['id', 'project', 'created_at', 'updated_at']


class LSSGreenTaskSerializer(serializers.ModelSerializer):
    project = serializers.PrimaryKeyRelatedField(
        queryset=Project.objects.all(), required=False
    )

    def validate_project(self, value):
        # Immutable after create: a task cannot move to another project.
        if self.instance is not None and value != self.instance.project:
            raise serializers.ValidationError('project cannot be changed after creation.')
        return value
    assignee_name = serializers.SerializerMethodField()

    class Meta:
        model = LSSGreenTask
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'assignee_name']

    def get_assignee_name(self, obj):
        user = obj.assignee
        if not user:
            return None
        full = (getattr(user, 'get_full_name', lambda: '')() or '').strip()
        return full or getattr(user, 'username', None) or getattr(user, 'email', None)
