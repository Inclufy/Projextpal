from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    WaterfallDashboardViewSet,
    WaterfallPhaseViewSet,
    WaterfallTeamViewSet,
    WaterfallRequirementViewSet,
    WaterfallDesignDocumentViewSet,
    WaterfallTaskViewSet,
    WaterfallTestCaseViewSet,
    WaterfallMilestoneViewSet,
    WaterfallGanttTaskViewSet,
    WaterfallChangeRequestViewSet,
    WaterfallDeploymentChecklistViewSet,
    WaterfallMaintenanceItemViewSet,
    WaterfallBudgetViewSet,
    WaterfallBudgetItemViewSet,
)

# Project-specific routes (nested under /projects/{project_id}/waterfall/)
urlpatterns = [
    # Dashboard
    path(
        'projects/<int:project_id>/waterfall/dashboard/',
        WaterfallDashboardViewSet.as_view({'get': 'retrieve'}),
        name='waterfall-dashboard'
    ),
    path(
        'projects/<int:project_id>/waterfall/initialize/',
        WaterfallDashboardViewSet.as_view({'post': 'initialize'}),
        name='waterfall-initialize'
    ),
    
    # Phases
    path(
        'projects/<int:project_id>/waterfall/phases/',
        WaterfallPhaseViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='waterfall-phases-list'
    ),
    path(
        'projects/<int:project_id>/waterfall/phases/<int:pk>/',
        WaterfallPhaseViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='waterfall-phases-detail'
    ),
    path(
        'projects/<int:project_id>/waterfall/phases/<int:pk>/start/',
        WaterfallPhaseViewSet.as_view({'post': 'start'}),
        name='waterfall-phases-start'
    ),
    path(
        'projects/<int:project_id>/waterfall/phases/<int:pk>/complete/',
        WaterfallPhaseViewSet.as_view({'post': 'complete'}),
        name='waterfall-phases-complete'
    ),
    path(
        'projects/<int:project_id>/waterfall/phases/<int:pk>/sign-off/',
        WaterfallPhaseViewSet.as_view({'post': 'sign_off'}),
        name='waterfall-phases-sign-off'
    ),
    
    # Team
    path(
        'projects/<int:project_id>/waterfall/team/',
        WaterfallTeamViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='waterfall-team-list'
    ),
    path(
        'projects/<int:project_id>/waterfall/team/<int:pk>/',
        WaterfallTeamViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='waterfall-team-detail'
    ),
    
    # Requirements
    path(
        'projects/<int:project_id>/waterfall/requirements/',
        WaterfallRequirementViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='waterfall-requirements-list'
    ),
    path(
        'projects/<int:project_id>/waterfall/requirements/<int:pk>/',
        WaterfallRequirementViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='waterfall-requirements-detail'
    ),
    path(
        'projects/<int:project_id>/waterfall/requirements/<int:pk>/approve/',
        WaterfallRequirementViewSet.as_view({'post': 'approve'}),
        name='waterfall-requirements-approve'
    ),
    
    # Design Documents
    path(
        'projects/<int:project_id>/waterfall/designs/',
        WaterfallDesignDocumentViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='waterfall-designs-list'
    ),
    path(
        'projects/<int:project_id>/waterfall/designs/<int:pk>/',
        WaterfallDesignDocumentViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='waterfall-designs-detail'
    ),
    path(
        'projects/<int:project_id>/waterfall/designs/<int:pk>/approve/',
        WaterfallDesignDocumentViewSet.as_view({'post': 'approve'}),
        name='waterfall-designs-approve'
    ),
    
    # Tasks
    path(
        'projects/<int:project_id>/waterfall/tasks/',
        WaterfallTaskViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='waterfall-tasks-list'
    ),
    path(
        'projects/<int:project_id>/waterfall/tasks/<int:pk>/',
        WaterfallTaskViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='waterfall-tasks-detail'
    ),
    path(
        'projects/<int:project_id>/waterfall/tasks/<int:pk>/complete/',
        WaterfallTaskViewSet.as_view({'post': 'complete'}),
        name='waterfall-tasks-complete'
    ),
    
    # Test Cases
    path(
        'projects/<int:project_id>/waterfall/test-cases/',
        WaterfallTestCaseViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='waterfall-test-cases-list'
    ),
    path(
        'projects/<int:project_id>/waterfall/test-cases/stats/',
        WaterfallTestCaseViewSet.as_view({'get': 'stats'}),
        name='waterfall-test-cases-stats'
    ),
    path(
        'projects/<int:project_id>/waterfall/test-cases/<int:pk>/',
        WaterfallTestCaseViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='waterfall-test-cases-detail'
    ),
    path(
        'projects/<int:project_id>/waterfall/test-cases/<int:pk>/execute/',
        WaterfallTestCaseViewSet.as_view({'post': 'execute'}),
        name='waterfall-test-cases-execute'
    ),
    
    # Milestones
    path(
        'projects/<int:project_id>/waterfall/milestones/',
        WaterfallMilestoneViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='waterfall-milestones-list'
    ),
    path(
        'projects/<int:project_id>/waterfall/milestones/<int:pk>/',
        WaterfallMilestoneViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='waterfall-milestones-detail'
    ),
    path(
        'projects/<int:project_id>/waterfall/milestones/<int:pk>/complete/',
        WaterfallMilestoneViewSet.as_view({'post': 'complete'}),
        name='waterfall-milestones-complete'
    ),
    
    # Gantt Tasks
    path(
        'projects/<int:project_id>/waterfall/gantt/',
        WaterfallGanttTaskViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='waterfall-gantt-list'
    ),
    path(
        'projects/<int:project_id>/waterfall/gantt/<int:pk>/',
        WaterfallGanttTaskViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='waterfall-gantt-detail'
    ),
    path(
        'projects/<int:project_id>/waterfall/gantt/<int:pk>/update-progress/',
        WaterfallGanttTaskViewSet.as_view({'post': 'update_progress'}),
        name='waterfall-gantt-update-progress'
    ),
    path(
        'projects/<int:project_id>/waterfall/gantt/<int:pk>/update-dates/',
        WaterfallGanttTaskViewSet.as_view({'post': 'update_dates'}),
        name='waterfall-gantt-update-dates'
    ),
    
    # Change Requests
    path(
        'projects/<int:project_id>/waterfall/change-requests/',
        WaterfallChangeRequestViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='waterfall-change-requests-list'
    ),
    path(
        'projects/<int:project_id>/waterfall/change-requests/<int:pk>/',
        WaterfallChangeRequestViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='waterfall-change-requests-detail'
    ),
    path(
        'projects/<int:project_id>/waterfall/change-requests/<int:pk>/approve/',
        WaterfallChangeRequestViewSet.as_view({'post': 'approve'}),
        name='waterfall-change-requests-approve'
    ),
    path(
        'projects/<int:project_id>/waterfall/change-requests/<int:pk>/reject/',
        WaterfallChangeRequestViewSet.as_view({'post': 'reject'}),
        name='waterfall-change-requests-reject'
    ),
    
    # Deployment Checklist
    path(
        'projects/<int:project_id>/waterfall/deployment/',
        WaterfallDeploymentChecklistViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='waterfall-deployment-list'
    ),
    path(
        'projects/<int:project_id>/waterfall/deployment/initialize/',
        WaterfallDeploymentChecklistViewSet.as_view({'post': 'initialize_defaults'}),
        name='waterfall-deployment-initialize'
    ),
    path(
        'projects/<int:project_id>/waterfall/deployment/<int:pk>/',
        WaterfallDeploymentChecklistViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='waterfall-deployment-detail'
    ),
    path(
        'projects/<int:project_id>/waterfall/deployment/<int:pk>/toggle/',
        WaterfallDeploymentChecklistViewSet.as_view({'post': 'toggle'}),
        name='waterfall-deployment-toggle'
    ),
    
    # Maintenance
    path(
        'projects/<int:project_id>/waterfall/maintenance/',
        WaterfallMaintenanceItemViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='waterfall-maintenance-list'
    ),
    path(
        'projects/<int:project_id>/waterfall/maintenance/<int:pk>/',
        WaterfallMaintenanceItemViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='waterfall-maintenance-detail'
    ),
    path(
        'projects/<int:project_id>/waterfall/maintenance/<int:pk>/resolve/',
        WaterfallMaintenanceItemViewSet.as_view({'post': 'resolve'}),
        name='waterfall-maintenance-resolve'
    ),
    
    # Budget
    path(
        'projects/<int:project_id>/waterfall/budget/',
        WaterfallBudgetViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'update'}),
        name='waterfall-budget'
    ),
    path(
        'projects/<int:project_id>/waterfall/budget/items/',
        WaterfallBudgetItemViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='waterfall-budget-items-list'
    ),
    path(
        'projects/<int:project_id>/waterfall/budget/items/<int:pk>/',
        WaterfallBudgetItemViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='waterfall-budget-items-detail'
    ),
]
