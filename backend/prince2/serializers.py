from rest_framework import serializers
from .models import (
    ProjectBrief, BusinessCase, BusinessCaseBenefit, BusinessCaseRisk,
    ProjectInitiationDocument, Stage, StagePlan, StageGate, WorkPackage,
    ProjectBoard, ProjectBoardMember, HighlightReport, EndProjectReport,
    LessonsLog, ProjectTolerance
)


class ProjectBriefSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectBrief
        fields = '__all__'
        read_only_fields = ['project', 'created_at', 'updated_at']
        extra_kwargs = {
            'project_definition': {'required': False, 'allow_blank': True},
            'project_approach': {'required': False, 'allow_blank': True},
            'outline_business_case': {'required': False, 'allow_blank': True},
        }


class BusinessCaseBenefitSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusinessCaseBenefit
        fields = '__all__'
        read_only_fields = ['business_case']


class BusinessCaseRiskSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusinessCaseRisk
        fields = '__all__'
        read_only_fields = ['business_case']


class BusinessCaseSerializer(serializers.ModelSerializer):
    benefits = BusinessCaseBenefitSerializer(many=True, read_only=True)
    risks = BusinessCaseRiskSerializer(many=True, read_only=True)
    total_costs = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)
    
    class Meta:
        model = BusinessCase
        fields = '__all__'
        read_only_fields = ['project', 'created_at', 'updated_at']
        extra_kwargs = {
            'executive_summary': {'required': False, 'allow_blank': True},
            'reasons': {'required': False, 'allow_blank': True},
            'expected_benefits': {'required': False, 'allow_blank': True},
            'development_costs': {'required': False},
            'ongoing_costs': {'required': False},
        }


class ProjectInitiationDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectInitiationDocument
        fields = '__all__'
        read_only_fields = ['project', 'created_at', 'updated_at']
        extra_kwargs = {
            'project_definition': {'required': False, 'allow_blank': True},
            'project_approach': {'required': False, 'allow_blank': True},
            'quality_management_approach': {'required': False, 'allow_blank': True},
            'risk_management_approach': {'required': False, 'allow_blank': True},
            'change_control_approach': {'required': False, 'allow_blank': True},
            'communication_management_approach': {'required': False, 'allow_blank': True},
        }


class StageSerializer(serializers.ModelSerializer):
    work_packages_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Stage
        fields = '__all__'
        read_only_fields = ['project', 'created_at', 'updated_at']
    
    def get_work_packages_count(self, obj):
        return obj.work_packages.count()


class StagePlanSerializer(serializers.ModelSerializer):
    stage_name = serializers.CharField(source='stage.name', read_only=True)
    
    class Meta:
        model = StagePlan
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class StageGateSerializer(serializers.ModelSerializer):
    stage_name = serializers.CharField(source='stage.name', read_only=True)
    reviewer_name = serializers.CharField(source='reviewer.get_full_name', read_only=True)
    
    class Meta:
        model = StageGate
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class WorkPackageSerializer(serializers.ModelSerializer):
    stage_name = serializers.CharField(source='stage.name', read_only=True)
    team_manager_name = serializers.CharField(source='team_manager.get_full_name', read_only=True)
    
    class Meta:
        model = WorkPackage
        fields = '__all__'
        read_only_fields = ['project', 'created_at', 'updated_at']


class ProjectBoardMemberSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = ProjectBoardMember
        fields = '__all__'
        read_only_fields = ['board', 'created_at']


class ProjectBoardSerializer(serializers.ModelSerializer):
    members = ProjectBoardMemberSerializer(many=True, read_only=True)
    
    class Meta:
        model = ProjectBoard
        fields = '__all__'
        read_only_fields = ['project', 'created_at', 'updated_at']


class HighlightReportSerializer(serializers.ModelSerializer):
    stage_name = serializers.CharField(source='stage.name', read_only=True)
    
    class Meta:
        model = HighlightReport
        fields = '__all__'
        read_only_fields = ['project', 'created_at', 'updated_at']


class EndProjectReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = EndProjectReport
        fields = '__all__'
        read_only_fields = ['project', 'created_at', 'updated_at']
        extra_kwargs = {
            'achievements_summary': {'required': False, 'allow_blank': True},
            'performance_against_plan': {'required': False, 'allow_blank': True},
        }


class LessonsLogSerializer(serializers.ModelSerializer):
    logged_by_name = serializers.CharField(source='logged_by.get_full_name', read_only=True)
    
    class Meta:
        model = LessonsLog
        fields = '__all__'
        read_only_fields = ['project', 'logged_by', 'date_logged', 'created_at', 'updated_at']


class ProjectToleranceSerializer(serializers.ModelSerializer):
    tolerance_type_display = serializers.CharField(source='get_tolerance_type_display', read_only=True)
    
    class Meta:
        model = ProjectTolerance
        fields = '__all__'
        read_only_fields = ['project', 'created_at', 'updated_at']
