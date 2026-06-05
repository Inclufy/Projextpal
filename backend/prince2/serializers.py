from rest_framework import serializers
from .models import (
    Product,
    ProjectBrief, BusinessCase, BusinessCaseBenefit, BusinessCaseRisk,
    ProjectInitiationDocument, Stage, StagePlan, StageGate, WorkPackage,
    ProjectBoard, ProjectBoardMember, HighlightReport, CheckpointReport,
    EndProjectReport, LessonsLog, ProjectTolerance,
    Prince2Risk, Prince2Issue, Prince2ExceptionReport,
    ManagementApproach, QualityRegisterEntry, DailyLog, ExceptionPlan,
    Prince2LessonsReport, Prince2ConfigItem,
)


class ProjectBriefSerializer(serializers.ModelSerializer):
    # Backward-compat alias: clients (frontend, mobile) may still send/expect
    # `project_definition`. We map it onto the renamed `background` column.
    project_definition = serializers.CharField(
        source='background', required=False, allow_blank=True
    )

    class Meta:
        model = ProjectBrief
        fields = [
            'id', 'project',
            'background', 'project_definition',  # both exposed
            'project_approach', 'outline_business_case',
            'project_objectives', 'project_scope', 'project_team_structure',
            'constraints', 'assumptions',
            'dependencies', 'customer_quality_expectations', 'acceptance_criteria',
            'status', 'version', 'created_at', 'updated_at',
        ]
        read_only_fields = ['project', 'created_at', 'updated_at']
        extra_kwargs = {
            'background': {'required': False, 'allow_blank': True},
            'project_approach': {'required': False, 'allow_blank': True},
            'outline_business_case': {'required': False, 'allow_blank': True},
        }

    def to_internal_value(self, data):
        # Accept either field name on input. If only the legacy alias is
        # present, copy it onto `background` so validation/save stays clean.
        if isinstance(data, dict) and 'project_definition' in data and 'background' not in data:
            data = dict(data)
            data['background'] = data['project_definition']
        return super().to_internal_value(data)


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
    depends_on_titles = serializers.SerializerMethodField()
    task_count = serializers.SerializerMethodField()

    class Meta:
        model = WorkPackage
        fields = '__all__'
        read_only_fields = ['project', 'created_at', 'updated_at']

    def get_depends_on_titles(self, obj):
        return [{'id': wp.id, 'title': wp.title or wp.reference} for wp in obj.depends_on.all()]

    def get_task_count(self, obj):
        return obj.tasks.count()


class Prince2RiskSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.get_full_name', read_only=True, allow_null=True)
    work_package_title = serializers.CharField(source='work_package.title', read_only=True, allow_null=True)

    class Meta:
        model = Prince2Risk
        fields = '__all__'
        read_only_fields = ['project', 'created_at', 'updated_at']


class Prince2IssueSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.get_full_name', read_only=True, allow_null=True)
    related_risk_title = serializers.CharField(source='related_risk.title', read_only=True, allow_null=True)
    change_authority_name = serializers.CharField(source='change_authority.get_full_name', read_only=True, allow_null=True)

    class Meta:
        model = Prince2Issue
        fields = '__all__'
        read_only_fields = [
            'project', 'created_at', 'updated_at',
            'change_authority', 'change_authority_date',
        ]


class Prince2ExceptionReportSerializer(serializers.ModelSerializer):
    stage_name = serializers.CharField(source='stage.name', read_only=True, allow_null=True)
    tolerance_type = serializers.CharField(source='breaching_tolerance.tolerance_type', read_only=True, allow_null=True)
    raised_by_name = serializers.CharField(source='raised_by.get_full_name', read_only=True, allow_null=True)

    class Meta:
        model = Prince2ExceptionReport
        fields = '__all__'
        read_only_fields = ['project', 'auto_generated', 'created_at', 'updated_at']


class ManagementApproachSerializer(serializers.ModelSerializer):
    approach_type_display = serializers.CharField(source='get_approach_type_display', read_only=True)

    class Meta:
        model = ManagementApproach
        fields = '__all__'
        read_only_fields = ['project', 'created_at', 'updated_at']

    def validate(self, attrs):
        # Clean 400 on the (project, approach_type) unique constraint at create.
        if self.instance is None:
            project = self.context.get('project')
            approach_type = attrs.get('approach_type')
            if project is not None and approach_type and ManagementApproach.objects.filter(
                project=project, approach_type=approach_type
            ).exists():
                raise serializers.ValidationError({
                    'approach_type': (
                        f"A '{approach_type}' approach already exists for this "
                        f"project. Edit the existing one instead."
                    )
                })
        return attrs


class QualityRegisterEntrySerializer(serializers.ModelSerializer):
    product_title = serializers.CharField(source='product.title', read_only=True, allow_null=True)
    work_package_title = serializers.CharField(source='work_package.title', read_only=True, allow_null=True)
    reviewer_name = serializers.CharField(source='reviewer.get_full_name', read_only=True, allow_null=True)

    class Meta:
        model = QualityRegisterEntry
        fields = '__all__'
        read_only_fields = ['project', 'created_at', 'updated_at']


class DailyLogSerializer(serializers.ModelSerializer):
    responsible_name = serializers.CharField(source='responsible.get_full_name', read_only=True, allow_null=True)

    class Meta:
        model = DailyLog
        fields = '__all__'
        read_only_fields = ['project', 'created_at', 'updated_at']


class ExceptionPlanSerializer(serializers.ModelSerializer):
    stage_name = serializers.CharField(source='stage.name', read_only=True, allow_null=True)
    exception_report_title = serializers.CharField(source='exception_report.title', read_only=True, allow_null=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True, allow_null=True)

    class Meta:
        model = ExceptionPlan
        fields = '__all__'
        read_only_fields = ['project', 'approved_by', 'created_at', 'updated_at']


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

    def to_representation(self, instance):
        # Yanmar SC-05 — hide money figures from non-finance roles.
        data = super().to_representation(instance)
        from projects.permissions import can_view_costs
        request = self.context.get("request")
        if not can_view_costs(getattr(request, "user", None)):
            data.pop("budget_spent", None)
            data.pop("budget_forecast", None)
        return data


class CheckpointReportSerializer(serializers.ModelSerializer):
    work_package_title = serializers.CharField(
        source='work_package.title', read_only=True, allow_null=True,
    )
    team_manager_name = serializers.CharField(
        source='team_manager.get_full_name', read_only=True, allow_null=True,
    )

    class Meta:
        model = CheckpointReport
        fields = [
            'id', 'project', 'work_package', 'work_package_title',
            'period_start', 'period_end', 'status',
            'products_completed', 'products_planned', 'risks_issues_summary',
            'team_manager', 'team_manager_name',
            'created_at', 'updated_at',
        ]
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

    def validate(self, attrs):
        """
        Clean 400 instead of DB-level IntegrityError 500 when a tolerance
        of the same (project, tolerance_type) already exists. Also tolerate
        clients that send no tolerance_type (default 'cost') — surface a
        helpful validation error rather than crashing on unique_together.
        """
        # Only enforce on create
        if self.instance is None:
            project = self.context.get('project')
            tolerance_type = attrs.get('tolerance_type') or 'cost'
            if project is not None and ProjectTolerance.objects.filter(
                project=project, tolerance_type=tolerance_type
            ).exists():
                raise serializers.ValidationError({
                    'tolerance_type': (
                        f"A tolerance of type '{tolerance_type}' already exists "
                        f"for this project. Update the existing one instead."
                    )
                })
        return attrs


class ProductSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.get_full_name', read_only=True)
    quality_responsibility_name = serializers.CharField(source='quality_responsibility.get_full_name', read_only=True)

    class Meta:
        model = Product
        fields = '__all__'
        read_only_fields = ['project', 'created_at', 'updated_at']


class Prince2LessonsReportSerializer(serializers.ModelSerializer):
    compiled_by_name = serializers.CharField(source='compiled_by.get_full_name', read_only=True, allow_null=True)

    class Meta:
        model = Prince2LessonsReport
        fields = '__all__'
        read_only_fields = ['project', 'compiled_by', 'created_at', 'updated_at']


class Prince2ConfigItemSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.get_full_name', read_only=True, allow_null=True)
    product_title = serializers.CharField(source='product.title', read_only=True, allow_null=True)

    class Meta:
        model = Prince2ConfigItem
        fields = '__all__'
        read_only_fields = ['project', 'created_at', 'updated_at']
