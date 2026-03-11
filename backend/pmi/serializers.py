from rest_framework import serializers
from .models import PMIComponent, PMIGovernanceBoard


class PMIComponentSerializer(serializers.ModelSerializer):
    dependency_count = serializers.SerializerMethodField()

    class Meta:
        model = PMIComponent
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_dependency_count(self, obj):
        return obj.depends_on.count()


class PMIGovernanceBoardSerializer(serializers.ModelSerializer):
    class Meta:
        model = PMIGovernanceBoard
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
