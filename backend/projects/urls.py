from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProjectViewSet,
    MilestoneViewSet,
    TaskViewSet,
    SubtaskViewSet,
    ExpenseViewSet,
    ProjectActivityViewSet,
    ProjectFinancialsViewSet,
    ApprovalStageViewSet,
    UploadViewSet,
    RiskViewSet,
    ManualMitigationViewSet,
    ProjectEventViewSet,
    TimeEntryViewSet,
    ProjectTeamRateViewSet,
    # Budget views
    BudgetCategoryViewSet,
    BudgetItemViewSet,
    BudgetOverviewViewSet,
)

# Methodology views
from .views_methodology import MethodologyListView, MethodologyDetailView, MethodologyTemplateView

router = DefaultRouter()
# CHANGED: Empty prefix because core/urls.py already has "api/v1/projects/"
router.register(r"milestones", MilestoneViewSet, basename="milestone")
router.register(r"tasks", TaskViewSet, basename="task")
router.register(r"subtasks", SubtaskViewSet, basename="subtask")
router.register(r"expenses", ExpenseViewSet, basename="expense")
router.register(r"activities", ProjectActivityViewSet, basename="activity")
router.register(r"project-financials", ProjectFinancialsViewSet, basename="project-financials")
router.register(r"approval-stages", ApprovalStageViewSet, basename="approval-stage")
router.register(r"uploads", UploadViewSet, basename="upload")
router.register(r"risks", RiskViewSet, basename="risk")
router.register(r"manual-mitigations", ManualMitigationViewSet, basename="manual-mitigation")
router.register(r"events", ProjectEventViewSet, basename="event")
router.register(r"time-entries", TimeEntryViewSet, basename="time-entry")
router.register(r"team-rates", ProjectTeamRateViewSet, basename="team-rate")

# Budget routes
router.register(r'budget-categories', BudgetCategoryViewSet, basename='budget-category')
router.register(r'budget-items', BudgetItemViewSet, basename='budget-item')

# Register ProjectViewSet LAST (empty prefix acts as catch-all)
router.register(r"", ProjectViewSet, basename="project")  # ← MOVED TO END

urlpatterns = [
    path("", include(router.urls)),
    path("", include("projects.document_urls")),
    path("", include("projects.training_material_urls")),
    
    # Budget overview (custom route)
    path('budget/overview/', BudgetOverviewViewSet.as_view({'get': 'list'}), name='budget-overview'),
    
    # Methodology URLs
    path('methodologies/', MethodologyListView.as_view(), name='methodology-list'),
    path('methodologies/<str:code>/', MethodologyDetailView.as_view(), name='methodology-detail'),
    path('methodologies-templates/', MethodologyTemplateView.as_view(), name='methodology-templates'),
]