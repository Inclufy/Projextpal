from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProgramViewSet,
    ProgramBenefitViewSet,
    ProgramRiskViewSet,
    ProgramMilestoneViewSet,
    ProgramBudgetViewSet,
    ProgramBudgetCategoryViewSet,
    ProgramBudgetItemViewSet,
    ProgramBudgetOverviewViewSet,
    ProgramSeedDemoView,
    ProgramClearDemoView,
)

# Router
# IMPORTANT: specific prefixes (budget, budget-categories, budget-items) MUST be
# registered BEFORE the empty prefix for ProgramViewSet — otherwise DRF's
# DefaultRouter places the program detail pattern `^(?P<pk>[^/.]+)/$` ahead of
# the more specific ones, causing POST /budget-categories/ to resolve to the
# program detail route (which has no POST handler) and return 405.
router = DefaultRouter()
router.register(r'budget', ProgramBudgetViewSet, basename='program-budget')
router.register(r'budget-categories', ProgramBudgetCategoryViewSet, basename='program-budget-category')
router.register(r'budget-items', ProgramBudgetItemViewSet, basename='program-budget-item')
router.register(r'', ProgramViewSet, basename='program')

urlpatterns = [
    # Explicit URL patterns for custom actions (before router to ensure priority)
    path('<int:pk>/add_project/',
         ProgramViewSet.as_view({'post': 'add_project'}),
         name='program-add-project-explicit'),
    path('<int:pk>/projects/',
         ProgramViewSet.as_view({'get': 'projects'}),
         name='program-projects-explicit'),

    # Budget overview (custom route) — must come BEFORE the router include
    # so the program detail pattern doesn't swallow it.
    path('<int:pk>/budget/overview/',
         ProgramBudgetOverviewViewSet.as_view({'get': 'retrieve'}),
         name='program-budget-overview'),

    # Demo seed/clear (admins, PMs, programme managers only)
    path('<int:pk>/seed-demo/', ProgramSeedDemoView.as_view(), name='program-seed-demo'),
    path('<int:pk>/clear-demo/', ProgramClearDemoView.as_view(), name='program-clear-demo'),

    # Nested routes for benefits
    path('<int:program_pk>/benefits/',
         ProgramBenefitViewSet.as_view({'get': 'list', 'post': 'create'}),
         name='program-benefits-list'),
    path('<int:program_pk>/benefits/<int:pk>/',
         ProgramBenefitViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
         name='program-benefits-detail'),

    # Nested routes for risks
    path('<int:program_pk>/risks/',
         ProgramRiskViewSet.as_view({'get': 'list', 'post': 'create'}),
         name='program-risks-list'),
    path('<int:program_pk>/risks/<int:pk>/',
         ProgramRiskViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
         name='program-risks-detail'),

    # Nested routes for milestones
    path('<int:program_pk>/milestones/',
         ProgramMilestoneViewSet.as_view({'get': 'list', 'post': 'create'}),
         name='program-milestones-list'),
    path('<int:program_pk>/milestones/<int:pk>/',
         ProgramMilestoneViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
         name='program-milestones-detail'),

    # Router include LAST so explicit paths above take priority
    path('', include(router.urls)),
]
# AI Insights endpoints
urlpatterns += [
]
