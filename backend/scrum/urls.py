from django.urls import path

app_name = "scrum"

from .views import (
    ProductBacklogViewSet, BacklogItemViewSet, SprintViewSet,
    DailyStandupViewSet, SprintReviewViewSet, SprintRetrospectiveViewSet,
    VelocityViewSet, DefinitionOfDoneViewSet, ScrumTeamViewSet,
    ScrumDashboardView, ScrumBoardView, SprintGoalViewSet,
    SprintPlanningViewSet,
    IncrementViewSet,
    DoDChecklistCompletionViewSet,
    ScrumSeedDemoView,
)


urlpatterns = [
    # =========================================================================
    # PRODUCT BACKLOG
    # =========================================================================
    path(
        'projects/<int:project_id>/scrum/backlog/',
        ProductBacklogViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='scrum-backlog-list'
    ),
    path(
        'projects/<int:project_id>/scrum/backlog/<int:pk>/',
        ProductBacklogViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='scrum-backlog-detail'
    ),
    path(
        'projects/<int:project_id>/scrum/backlog/initialize/',
        ProductBacklogViewSet.as_view({'post': 'initialize'}),
        name='scrum-backlog-initialize'
    ),

    # =========================================================================
    # BACKLOG ITEMS
    # =========================================================================
    path(
        'projects/<int:project_id>/scrum/items/',
        BacklogItemViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='scrum-items-list'
    ),
    path(
        'projects/<int:project_id>/scrum/items/<int:pk>/',
        BacklogItemViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='scrum-items-detail'
    ),
    path(
        'projects/<int:project_id>/scrum/items/<int:pk>/assign_to_sprint/',
        BacklogItemViewSet.as_view({'post': 'assign_to_sprint'}),
        name='scrum-items-assign-sprint'
    ),
    path(
        'projects/<int:project_id>/scrum/items/<int:pk>/update_status/',
        BacklogItemViewSet.as_view({'post': 'update_status'}),
        name='scrum-items-update-status'
    ),
    path(
        'projects/<int:project_id>/scrum/items/reorder/',
        BacklogItemViewSet.as_view({'post': 'reorder'}),
        name='scrum-items-reorder'
    ),
    path(
        'projects/<int:project_id>/scrum/items/<int:pk>/create_subtask/',
        BacklogItemViewSet.as_view({'post': 'create_subtask'}),
        name='scrum-items-create-subtask'
    ),

    # =========================================================================
    # SPRINTS
    # =========================================================================
    path(
        'projects/<int:project_id>/scrum/sprints/',
        SprintViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='scrum-sprints-list'
    ),
    path(
        'projects/<int:project_id>/scrum/sprints/<int:pk>/',
        SprintViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='scrum-sprints-detail'
    ),
    path(
        'projects/<int:project_id>/scrum/sprints/<int:pk>/start/',
        SprintViewSet.as_view({'post': 'start'}),
        name='scrum-sprints-start'
    ),
    path(
        'projects/<int:project_id>/scrum/sprints/<int:pk>/complete/',
        SprintViewSet.as_view({'post': 'complete'}),
        name='scrum-sprints-complete'
    ),
    path(
        'projects/<int:project_id>/scrum/sprints/<int:pk>/record_burndown/',
        SprintViewSet.as_view({'post': 'record_burndown'}),
        name='scrum-sprints-burndown'
    ),
    path(
        'projects/<int:project_id>/scrum/sprints/active/',
        SprintViewSet.as_view({'get': 'active'}),
        name='scrum-sprints-active'
    ),

    # =========================================================================
    # DAILY STANDUP
    # =========================================================================
    path(
        'projects/<int:project_id>/scrum/standups/',
        DailyStandupViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='scrum-standups-list'
    ),
    path(
        'projects/<int:project_id>/scrum/standups/<int:pk>/',
        DailyStandupViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='scrum-standups-detail'
    ),
    path(
        'projects/<int:project_id>/scrum/standups/<int:pk>/add_update/',
        DailyStandupViewSet.as_view({'post': 'add_update'}),
        name='scrum-standups-add-update'
    ),

    # =========================================================================
    # SPRINT REVIEW & RETROSPECTIVE
    # =========================================================================
    path(
        'projects/<int:project_id>/scrum/reviews/',
        SprintReviewViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='scrum-reviews-list'
    ),
    path(
        'projects/<int:project_id>/scrum/reviews/<int:pk>/',
        SprintReviewViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='scrum-reviews-detail'
    ),
    path(
        'projects/<int:project_id>/scrum/retrospectives/',
        SprintRetrospectiveViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='scrum-retros-list'
    ),
    path(
        'projects/<int:project_id>/scrum/retrospectives/<int:pk>/',
        SprintRetrospectiveViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='scrum-retros-detail'
    ),

    # =========================================================================
    # VELOCITY & DOD
    # =========================================================================
    path(
        'projects/<int:project_id>/scrum/velocity/',
        VelocityViewSet.as_view({'get': 'list'}),
        name='scrum-velocity-list'
    ),
    path(
        'projects/<int:project_id>/scrum/velocity/average/',
        VelocityViewSet.as_view({'get': 'average'}),
        name='scrum-velocity-average'
    ),
    path(
        'projects/<int:project_id>/scrum/dod/',
        DefinitionOfDoneViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='scrum-dod-list'
    ),
    path(
        'projects/<int:project_id>/scrum/dod/<int:pk>/',
        DefinitionOfDoneViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='scrum-dod-detail'
    ),
    path(
        'projects/<int:project_id>/scrum/dod/initialize_defaults/',
        DefinitionOfDoneViewSet.as_view({'post': 'initialize_defaults'}),
        name='scrum-dod-initialize'
    ),

    # =========================================================================
    # SCRUM TEAM
    # =========================================================================
    path(
        'projects/<int:project_id>/scrum/team/',
        ScrumTeamViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='scrum-team-list'
    ),
    path(
        'projects/<int:project_id>/scrum/team/<int:pk>/',
        ScrumTeamViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='scrum-team-detail'
    ),

    # =========================================================================
    # SPRINT GOALS (NEW)
    # =========================================================================
    path(
        'projects/<int:project_id>/scrum/sprint-goals/',
        SprintGoalViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='scrum-sprint-goals-list'
    ),
    path(
        'projects/<int:project_id>/scrum/sprint-goals/<int:pk>/',
        SprintGoalViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='scrum-sprint-goals-detail'
    ),

    # =========================================================================
    # SPRINT PLANNING (NEW)
    # =========================================================================
    path(
        'projects/<int:project_id>/scrum/sprint-planning/',
        SprintPlanningViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='scrum-planning-list'
    ),
    path(
        'projects/<int:project_id>/scrum/sprint-planning/<int:pk>/',
        SprintPlanningViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='scrum-planning-detail'
    ),
    path(
        'projects/<int:project_id>/scrum/sprint-planning/<int:pk>/start_meeting/',
        SprintPlanningViewSet.as_view({'post': 'start_meeting'}),
        name='scrum-planning-start'
    ),
    path(
        'projects/<int:project_id>/scrum/sprint-planning/<int:pk>/complete_meeting/',
        SprintPlanningViewSet.as_view({'post': 'complete_meeting'}),
        name='scrum-planning-complete'
    ),

    # =========================================================================
    # INCREMENTS (NEW)
    # =========================================================================
    path(
        'projects/<int:project_id>/scrum/increments/',
        IncrementViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='scrum-increments-list'
    ),
    path(
        'projects/<int:project_id>/scrum/increments/<int:pk>/',
        IncrementViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='scrum-increments-detail'
    ),
    path(
        'projects/<int:project_id>/scrum/increments/<int:pk>/release/',
        IncrementViewSet.as_view({'post': 'release'}),
        name='scrum-increments-release'
    ),

    # =========================================================================
    # DOD CHECKLIST COMPLETION (NEW)
    # =========================================================================
    path(
        'projects/<int:project_id>/scrum/dod-completion/',
        DoDChecklistCompletionViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='scrum-dod-completion-list'
    ),
    path(
        'projects/<int:project_id>/scrum/dod-completion/<int:pk>/',
        DoDChecklistCompletionViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='scrum-dod-completion-detail'
    ),

    # =========================================================================
    # DASHBOARD
    # =========================================================================
    path(
        'projects/<int:project_id>/scrum/dashboard/',
        ScrumDashboardView.as_view(),
        name='scrum-dashboard'
    ),

    # =========================================================================
    # BOARD (kanban view, read-only)
    # =========================================================================
    path(
        'projects/<int:project_id>/scrum/board/',
        ScrumBoardView.as_view(),
        name='scrum-board'
    ),
    path(
        'projects/<int:project_id>/scrum/seed-demo/',
        ScrumSeedDemoView.as_view(),
        name='scrum-seed-demo'
    ),
]