from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProjectViewSet,
    MilestoneViewSet,
    TaskViewSet,
    TaskDueDateChangeRequestViewSet,
    SubtaskViewSet,
    ExpenseViewSet,
    ProjectActivityViewSet,
    ProjectFinancialsViewSet,
    ApprovalStageViewSet,
    UploadViewSet,
    RiskViewSet,
    IssueViewSet,
    AssumptionViewSet,
    LessonLearnedViewSet,
    RiskForecastViewSet,
    ManualMitigationViewSet,
    ProjectEventViewSet,
    TimeEntryViewSet,
    ProjectTeamRateViewSet,
    ProjectMembershipViewSet,
    PlanEventViewSet,
    # Budget views
    BudgetCategoryViewSet,
    BudgetItemViewSet,
    BudgetOverviewViewSet,
    # Status-report auto-draft
    status_report_auto_draft,
)

# Methodology views
from .views_methodology import MethodologyListView, MethodologyDetailView, MethodologyTemplateView
from .analytics_views import analytics_overview, SavedAnalyticsDashboardViewSet
from .saved_view_views import SavedViewViewSet
from .custom_field_views import CustomFieldDefinitionViewSet
from .recurring_views import RecurringTaskRuleViewSet
from .doctor_views import project_diagnose, project_doctor_apply
from .role_views import my_project_role
from .my_work_views import my_work
from .gantt_views import project_gantt
from .tailoring_views import intake_analyze, intake_scenarios, project_tailoring, methodology_profile, methodology_course
from .coach_views import project_coach
from .ai_plan_views import project_ai_plan, project_ai_plan_apply
from .ai_from_doc import plan_from_documents
from .ai_context_views import project_ai_context
from .methodology_autodraft_views import (
    prince2_business_case_auto_draft,
    prince2_project_brief_auto_draft,
    scrum_auto_draft,
    kanban_suggest_swimlanes,
    lss_define_auto_draft,
    waterfall_suggest_phases,
)

router = DefaultRouter()
# CHANGED: Empty prefix because core/urls.py already has "api/v1/projects/"
router.register(r"analytics-dashboards", SavedAnalyticsDashboardViewSet, basename="analytics-dashboard")
router.register(r"saved-views", SavedViewViewSet, basename="saved-view")
router.register(r"custom-fields", CustomFieldDefinitionViewSet, basename="custom-field")
router.register(r"recurring-tasks", RecurringTaskRuleViewSet, basename="recurring-task")
router.register(r"milestones", MilestoneViewSet, basename="milestone")
router.register(r"tasks", TaskViewSet, basename="task")
router.register(r"task-due-change-requests", TaskDueDateChangeRequestViewSet, basename="task-due-change-request")
router.register(r"subtasks", SubtaskViewSet, basename="subtask")
router.register(r"expenses", ExpenseViewSet, basename="expense")
router.register(r"activities", ProjectActivityViewSet, basename="activity")
router.register(r"project-financials", ProjectFinancialsViewSet, basename="project-financials")
router.register(r"approval-stages", ApprovalStageViewSet, basename="approval-stage")
router.register(r"uploads", UploadViewSet, basename="upload")
router.register(r"risks", RiskViewSet, basename="risk")
router.register(r"issues", IssueViewSet, basename="issue")
router.register(r"assumptions", AssumptionViewSet, basename="assumption")
router.register(r"lessons", LessonLearnedViewSet, basename="lesson")
router.register(r"risk-forecasts", RiskForecastViewSet, basename="risk-forecast")
router.register(r"manual-mitigations", ManualMitigationViewSet, basename="manual-mitigation")
router.register(r"events", ProjectEventViewSet, basename="event")
router.register(r"time-entries", TimeEntryViewSet, basename="time-entry")
router.register(r"team-rates", ProjectTeamRateViewSet, basename="team-rate")
router.register(r"memberships", ProjectMembershipViewSet, basename="membership")
router.register(r"plan-events", PlanEventViewSet, basename="plan-event")

# Budget routes
router.register(r'budget-categories', BudgetCategoryViewSet, basename='budget-category')
router.register(r'budget-items', BudgetItemViewSet, basename='budget-item')

# Register ProjectViewSet LAST (empty prefix acts as catch-all)
router.register(r"", ProjectViewSet, basename="project")  # ← MOVED TO END

urlpatterns = [
    # Project Plan DOCX — the router only generates the trailing-slash route;
    # this makes the natural file-download URL (…/project-plan.docx) resolve too.
    path(
        "<int:pk>/export/project-plan.docx",
        ProjectViewSet.as_view({"get": "export_project_plan"}),
        name="project-export-project-plan-file",
    ),
    # Unified analytics overview (org / programme / project scope) for the
    # Reports & Analytics dashboards. Placed before the router so the literal
    # "analytics/" segment is never captured by a <pk> detail route.
    path("analytics/overview/", analytics_overview, name="analytics-overview"),
    path("my-work/", my_work, name="my-work"),
    path("<int:project_id>/gantt/", project_gantt, name="project-gantt"),
    path("<int:pk>/doctor/diagnose/", project_diagnose, name="project-diagnose"),
    path("<int:pk>/doctor/apply/", project_doctor_apply, name="project-doctor-apply"),
    path("<int:pk>/my-role/", my_project_role, name="project-my-role"),
    # Tailoring + AI intake (literal segments before the <pk> router routes)
    path("intake/scenarios/", intake_scenarios, name="project-intake-scenarios"),
    path("intake/analyze/", intake_analyze, name="project-intake-analyze"),
    path("methodology-profile/", methodology_profile, name="methodology-profile"),
    path("methodology-course/", methodology_course, name="methodology-course"),
    path("<int:pk>/tailoring/", project_tailoring, name="project-tailoring"),
    path("<int:pk>/coach/", project_coach, name="project-coach"),
    path("<int:pk>/ai-plan/", project_ai_plan, name="project-ai-plan"),
    path("plan-from-documents/", plan_from_documents, name="project-plan-from-documents"),
    path("<int:pk>/ai-context/", project_ai_context, name="project-ai-context"),
    path("<int:pk>/ai-plan/apply/", project_ai_plan_apply, name="project-ai-plan-apply"),

    # Sprint 4 — methodology auto-drafts from project documents (S4-01..S4-06).
    path("<int:pk>/prince2/business-case/auto-draft/",
         prince2_business_case_auto_draft, name="project-prince2-bc-auto-draft"),
    path("<int:pk>/prince2/project-brief/auto-draft/",
         prince2_project_brief_auto_draft, name="project-prince2-brief-auto-draft"),
    path("<int:pk>/scrum/auto-draft/",
         scrum_auto_draft, name="project-scrum-auto-draft"),
    path("<int:pk>/kanban/suggest-swimlanes/",
         kanban_suggest_swimlanes, name="project-kanban-suggest-swimlanes"),
    path("<int:pk>/lss/define/auto-draft/",
         lss_define_auto_draft, name="project-lss-define-auto-draft"),
    path("<int:pk>/waterfall/suggest-phases/",
         waterfall_suggest_phases, name="project-waterfall-suggest-phases"),
    path("", include(router.urls)),
    path("", include("projects.document_urls")),
    path("", include("projects.training_material_urls")),
    
    # Budget overview (custom route)
    path('budget/overview/', BudgetOverviewViewSet.as_view({'get': 'list'}), name='budget-overview'),
    
    # Methodology URLs
    path('methodologies/', MethodologyListView.as_view(), name='methodology-list'),
    path('methodologies/<str:code>/', MethodologyDetailView.as_view(), name='methodology-detail'),
    path('methodologies-templates/', MethodologyTemplateView.as_view(), name='methodology-templates'),

    # Status-report auto-draft (returns a fresh draft, NOT persisted)
    path(
        '<int:project_id>/status-reports/auto-draft/',
        status_report_auto_draft,
        name='status-report-auto-draft',
    ),
]