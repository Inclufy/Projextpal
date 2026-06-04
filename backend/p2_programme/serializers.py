from rest_framework import serializers
from .models import P2Blueprint, P2ProgrammeProject


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
    class Meta:
        model = P2ProgrammeProject
        fields = '__all__'
        # `programme` injected server-side from the nested URL in perform_create.
        read_only_fields = ['id', 'programme', 'created_at', 'updated_at']
