from django.contrib import admin
from .models import (
    ProjectBrief, BusinessCase, BusinessCaseBenefit, BusinessCaseRisk,
    ProjectInitiationDocument, Stage, StagePlan, StageGate, WorkPackage,
    ProjectBoard, ProjectBoardMember, HighlightReport, EndProjectReport,
    LessonsLog, ProjectTolerance
)


@admin.register(ProjectBrief)
class ProjectBriefAdmin(admin.ModelAdmin):
    list_display = ['project', 'status', 'version', 'created_at']
    list_filter = ['status']
    search_fields = ['project__name']


@admin.register(BusinessCase)
class BusinessCaseAdmin(admin.ModelAdmin):
    list_display = ['project', 'status', 'development_costs', 'ongoing_costs', 'version']
    list_filter = ['status']


@admin.register(BusinessCaseBenefit)
class BusinessCaseBenefitAdmin(admin.ModelAdmin):
    list_display = ['business_case', 'benefit_type', 'description']
    list_filter = ['benefit_type']


@admin.register(BusinessCaseRisk)
class BusinessCaseRiskAdmin(admin.ModelAdmin):
    list_display = ['business_case', 'probability', 'impact', 'description']
    list_filter = ['probability', 'impact']


@admin.register(ProjectInitiationDocument)
class ProjectInitiationDocumentAdmin(admin.ModelAdmin):
    list_display = ['project', 'status', 'version', 'baseline_date']
    list_filter = ['status']


@admin.register(Stage)
class StageAdmin(admin.ModelAdmin):
    list_display = ['project', 'name', 'order', 'status', 'progress_percentage']
    list_filter = ['status']
    ordering = ['project', 'order']


@admin.register(StagePlan)
class StagePlanAdmin(admin.ModelAdmin):
    list_display = ['stage', 'status', 'budget', 'version']
    list_filter = ['status']


@admin.register(StageGate)
class StageGateAdmin(admin.ModelAdmin):
    list_display = ['stage', 'outcome', 'review_date', 'reviewer']
    list_filter = ['outcome']


@admin.register(WorkPackage)
class WorkPackageAdmin(admin.ModelAdmin):
    list_display = ['reference', 'title', 'project', 'stage', 'status', 'priority']
    list_filter = ['status', 'priority']
    search_fields = ['title', 'reference']


@admin.register(ProjectBoard)
class ProjectBoardAdmin(admin.ModelAdmin):
    list_display = ['project', 'meeting_frequency', 'next_meeting_date']


@admin.register(ProjectBoardMember)
class ProjectBoardMemberAdmin(admin.ModelAdmin):
    list_display = ['board', 'user', 'role']
    list_filter = ['role']


@admin.register(HighlightReport)
class HighlightReportAdmin(admin.ModelAdmin):
    list_display = ['project', 'stage', 'report_date', 'overall_status']
    list_filter = ['overall_status']
    ordering = ['-report_date']


@admin.register(EndProjectReport)
class EndProjectReportAdmin(admin.ModelAdmin):
    list_display = ['project', 'status', 'report_date', 'final_cost']
    list_filter = ['status']


@admin.register(LessonsLog)
class LessonsLogAdmin(admin.ModelAdmin):
    list_display = ['project', 'title', 'lesson_type', 'category', 'date_logged']
    list_filter = ['lesson_type', 'category']


@admin.register(ProjectTolerance)
class ProjectToleranceAdmin(admin.ModelAdmin):
    list_display = ['project', 'tolerance_type', 'plus_tolerance', 'minus_tolerance', 'is_exceeded']
    list_filter = ['tolerance_type', 'is_exceeded']
