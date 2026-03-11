from rest_framework import serializers
from .models import AgileReleaseTrain, ARTSync, ProgramIncrement, PIObjective


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
    class Meta:
        model = PIObjective
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class ProgramIncrementSerializer(serializers.ModelSerializer):
    objectives = PIObjectiveSerializer(many=True, read_only=True)
    objectives_count = serializers.SerializerMethodField()

    class Meta:
        model = ProgramIncrement
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_objectives_count(self, obj):
        return obj.objectives.count()
