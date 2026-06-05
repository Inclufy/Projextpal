app_name = "agile"

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AgileDashboardViewSet,
    AgileTeamViewSet,
    AgileProductVisionViewSet,
    AgileProductGoalViewSet,
    AgileUserPersonaViewSet,
    AgileEpicViewSet,
    AgileBacklogItemViewSet,
    AgileIterationViewSet,
    AgileReleaseViewSet,
    AgileDailyUpdateViewSet,
    AgileRetrospectiveViewSet,
    AgileRetroItemViewSet,
    AgileBudgetViewSet,
    AgileBudgetItemViewSet,
    DefinitionOfDoneViewSet,
    AgileFlowConfigViewSet,
    AgileFlowMetricsViewSet,
    StakeholderFeedbackViewSet,
    AgileSeedDemoView,
    AgileClearDemoView,
)

# Create a router for viewsets
router = DefaultRouter()

# Project-specific routes (nested under /projects/{project_id}/agile/)
urlpatterns = [
    # Dashboard
    path(
        'projects/<int:project_id>/agile/dashboard/',
        AgileDashboardViewSet.as_view({'get': 'retrieve'}),
        name='agile-dashboard'
    ),
    path(
        'projects/<int:project_id>/agile/initialize/',
        AgileDashboardViewSet.as_view({'post': 'initialize'}),
        name='agile-initialize'
    ),
    path(
        'projects/<int:project_id>/agile/seed-demo/',
        AgileSeedDemoView.as_view({'post': 'create'}),
        name='agile-seed-demo'
    ),
    path(
        'projects/<int:project_id>/agile/clear-demo/',
        AgileClearDemoView.as_view({'post': 'create'}),
        name='agile-clear-demo'
    ),

    # Team
    path(
        'projects/<int:project_id>/agile/team/',
        AgileTeamViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='agile-team-list'
    ),
    path(
        'projects/<int:project_id>/agile/team/<int:pk>/',
        AgileTeamViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='agile-team-detail'
    ),
    
    # Vision
    path(
        'projects/<int:project_id>/agile/vision/',
        AgileProductVisionViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'update'}),
        name='agile-vision'
    ),
    
    # Goals
    path(
        'projects/<int:project_id>/agile/goals/',
        AgileProductGoalViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='agile-goals-list'
    ),
    path(
        'projects/<int:project_id>/agile/goals/<int:pk>/',
        AgileProductGoalViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='agile-goals-detail'
    ),
    
    # Personas
    path(
        'projects/<int:project_id>/agile/personas/',
        AgileUserPersonaViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='agile-personas-list'
    ),
    path(
        'projects/<int:project_id>/agile/personas/<int:pk>/',
        AgileUserPersonaViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='agile-personas-detail'
    ),
    
    # Epics
    path(
        'projects/<int:project_id>/agile/epics/',
        AgileEpicViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='agile-epics-list'
    ),
    path(
        'projects/<int:project_id>/agile/epics/<int:pk>/',
        AgileEpicViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='agile-epics-detail'
    ),
    path(
        'projects/<int:project_id>/agile/epics/reorder/',
        AgileEpicViewSet.as_view({'post': 'reorder'}),
        name='agile-epics-reorder'
    ),
    
    # Backlog Items
    path(
        'projects/<int:project_id>/agile/backlog/',
        AgileBacklogItemViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='agile-backlog-list'
    ),
    path(
        'projects/<int:project_id>/agile/backlog/<int:pk>/',
        AgileBacklogItemViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='agile-backlog-detail'
    ),
    path(
        'projects/<int:project_id>/agile/backlog/<int:pk>/move-to-iteration/',
        AgileBacklogItemViewSet.as_view({'post': 'move_to_iteration'}),
        name='agile-backlog-move'
    ),
    path(
        'projects/<int:project_id>/agile/backlog/<int:pk>/transition/',
        AgileBacklogItemViewSet.as_view({'post': 'transition'}),
        name='agile-backlog-transition'
    ),
    path(
        'projects/<int:project_id>/agile/backlog/<int:pk>/assign/',
        AgileBacklogItemViewSet.as_view({'post': 'assign'}),
        name='agile-backlog-assign'
    ),
    path(
        'projects/<int:project_id>/agile/backlog/<int:pk>/dod/',
        AgileBacklogItemViewSet.as_view({'get': 'dod', 'post': 'dod'}),
        name='agile-backlog-dod'
    ),
    path(
        'projects/<int:project_id>/agile/backlog/reorder/',
        AgileBacklogItemViewSet.as_view({'post': 'reorder'}),
        name='agile-backlog-reorder'
    ),
    
    # Iterations
    path(
        'projects/<int:project_id>/agile/iterations/',
        AgileIterationViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='agile-iterations-list'
    ),
    path(
        'projects/<int:project_id>/agile/iterations/active/',
        AgileIterationViewSet.as_view({'get': 'active'}),
        name='agile-iterations-active'
    ),
    path(
        'projects/<int:project_id>/agile/iterations/<int:pk>/',
        AgileIterationViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='agile-iterations-detail'
    ),
    path(
        'projects/<int:project_id>/agile/iterations/<int:pk>/start/',
        AgileIterationViewSet.as_view({'post': 'start'}),
        name='agile-iterations-start'
    ),
    path(
        'projects/<int:project_id>/agile/iterations/<int:pk>/complete/',
        AgileIterationViewSet.as_view({'post': 'complete'}),
        name='agile-iterations-complete'
    ),
    
    # Releases
    path(
        'projects/<int:project_id>/agile/releases/',
        AgileReleaseViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='agile-releases-list'
    ),
    path(
        'projects/<int:project_id>/agile/releases/<int:pk>/',
        AgileReleaseViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='agile-releases-detail'
    ),
    path(
        'projects/<int:project_id>/agile/releases/<int:pk>/add-iteration/',
        AgileReleaseViewSet.as_view({'post': 'add_iteration'}),
        name='agile-releases-add-iteration'
    ),
    
    # Daily Updates
    path(
        'projects/<int:project_id>/agile/daily-updates/',
        AgileDailyUpdateViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='agile-daily-updates-list'
    ),
    path(
        'projects/<int:project_id>/agile/daily-updates/<int:pk>/',
        AgileDailyUpdateViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='agile-daily-updates-detail'
    ),
    
    # Retrospectives
    path(
        'projects/<int:project_id>/agile/retrospectives/action-items/',
        AgileRetrospectiveViewSet.as_view({'get': 'action_items'}),
        name='agile-retrospectives-action-items'
    ),
    path(
        'projects/<int:project_id>/agile/retrospectives/',
        AgileRetrospectiveViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='agile-retrospectives-list'
    ),
    path(
        'projects/<int:project_id>/agile/retrospectives/<int:pk>/',
        AgileRetrospectiveViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='agile-retrospectives-detail'
    ),
    path(
        'projects/<int:project_id>/agile/retrospectives/<int:pk>/add-item/',
        AgileRetrospectiveViewSet.as_view({'post': 'add_item'}),
        name='agile-retrospectives-add-item'
    ),
    
    # Retro Items
    path(
        'agile/retro-items/<int:pk>/',
        AgileRetroItemViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='agile-retro-items-detail'
    ),
    path(
        'agile/retro-items/<int:pk>/vote/',
        AgileRetroItemViewSet.as_view({'post': 'vote'}),
        name='agile-retro-items-vote'
    ),
    
    # Budget
    path(
        'projects/<int:project_id>/agile/budget/',
        AgileBudgetViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'update'}),
        name='agile-budget'
    ),
    path(
        'projects/<int:project_id>/agile/budget/items/',
        AgileBudgetItemViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='agile-budget-items-list'
    ),
    path(
        'projects/<int:project_id>/agile/budget/items/<int:pk>/',
        AgileBudgetItemViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='agile-budget-items-detail'
    ),
    # =========================================================================
    # DEFINITION OF DONE
    # =========================================================================
    path(
        "projects/<int:project_id>/agile/definition-of-done/",
        DefinitionOfDoneViewSet.as_view({"get": "list", "post": "create"}),
        name="agile-definition-of-done-list"
    ),
    path(
        "projects/<int:project_id>/agile/definition-of-done/<int:pk>/",
        DefinitionOfDoneViewSet.as_view({"get": "retrieve", "put": "update", "patch": "partial_update", "delete": "destroy"}),
        name="agile-definition-of-done-detail"
    ),
    # =========================================================================
    # STAKEHOLDER FEEDBACK (per-iteration review of shipped work) — AG-3
    # =========================================================================
    path(
        'projects/<int:project_id>/agile/stakeholder-feedback/',
        StakeholderFeedbackViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='agile-stakeholder-feedback-list'
    ),
    path(
        'projects/<int:project_id>/agile/stakeholder-feedback/<int:pk>/',
        StakeholderFeedbackViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='agile-stakeholder-feedback-detail'
    ),
    # =========================================================================
    # FLOW (continuous-flow cadence config + outcome metrics)
    # =========================================================================
    path(
        'projects/<int:project_id>/agile/flow-config/',
        AgileFlowConfigViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'update'}),
        name='agile-flow-config'
    ),
    path(
        'projects/<int:project_id>/agile/flow-metrics/',
        AgileFlowMetricsViewSet.as_view({'get': 'retrieve'}),
        name='agile-flow-metrics'
    ),
]

