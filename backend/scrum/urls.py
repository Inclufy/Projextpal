from django.urls import path
from .views import (
    ProductBacklogViewSet, BacklogItemViewSet, SprintViewSet,
    DailyStandupViewSet, SprintReviewViewSet, SprintRetrospectiveViewSet,
    VelocityViewSet, DefinitionOfDoneViewSet, ScrumTeamViewSet,
    ScrumDashboardView
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
    # DASHBOARD
    # =========================================================================
    path(
        'projects/<int:project_id>/scrum/dashboard/',
        ScrumDashboardView.as_view(),
        name='scrum-dashboard'
    ),
]
