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

router = DefaultRouter()
# CHANGED: Empty prefix because core/urls.py already has "api/v1/projects/"
router.register(r"analytics-dashboards", SavedAnalyticsDashboardViewSet, basename="analytics-dashboard")
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