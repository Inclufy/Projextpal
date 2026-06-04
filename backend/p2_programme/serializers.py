from rest_framework import serializers
from .models import P2Blueprint, P2ProgrammeProject, P2ProgrammeBoardDecision


class P2BlueprintSerializer(serializers.ModelSerializer):
    project_count = serializers.SerializerMethodField()

    class Meta:
        model = P2Blueprint
        fields = '__all__'
        # `programme` injected server-side from the nested URL in perform_create.
        read_only_fields = ['id', 'programme', 'created_by', 'created_at', 'updated_at']

    def get_project_count(self, obj):
        return obj.projects.count()


class P2ProgrammeProjectSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    blueprint_name = serializers.CharField(source='blueprint.name', read_only=True)

    class Meta:
        model = P2ProgrammeProject
        fields = '__all__'
        # `programme` injected server-side from the nested URL in perform_create.
        # `status` is read-only: a constituent project changes status ONLY through
        # a recorded programme-board decision (the `decide` action), never raw PATCH.
        read_only_fields = ['id', 'programme', 'status', 'created_at', 'updated_at']


class P2ProgrammeBoardDecisionSerializer(serializers.ModelSerializer):
    decision_display = serializers.CharField(source='get_decision_display', read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True)
    decided_by_name = serializers.SerializerMethodField()

    class Meta:
        model = P2ProgrammeBoardDecision
        fields = '__all__'
        read_only_fields = ['id', 'previous_status', 'new_status', 'decided_at']

    def get_decided_by_name(self, obj):
        if obj.decided_by_id:
            return obj.decided_by.get_full_name() or obj.decided_by.email
        return None
