from django.urls import path
from .views import (
    KanbanBoardViewSet, KanbanColumnViewSet, KanbanSwimlaneViewSet,
    KanbanCardViewSet, CardCommentViewSet, CardChecklistViewSet,
    KanbanMetricsViewSet, KanbanDashboardView
)


urlpatterns = [
    # =========================================================================
    # KANBAN BOARD
    # =========================================================================
    path(
        'projects/<int:project_id>/kanban/board/',
        KanbanBoardViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='kanban-board-list'
    ),
    path(
        'projects/<int:project_id>/kanban/board/<int:pk>/',
        KanbanBoardViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='kanban-board-detail'
    ),
    path(
        'projects/<int:project_id>/kanban/board/initialize/',
        KanbanBoardViewSet.as_view({'post': 'initialize'}),
        name='kanban-board-initialize'
    ),

    # =========================================================================
    # COLUMNS
    # =========================================================================
    path(
        'projects/<int:project_id>/kanban/columns/',
        KanbanColumnViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='kanban-columns-list'
    ),
    path(
        'projects/<int:project_id>/kanban/columns/<int:pk>/',
        KanbanColumnViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='kanban-columns-detail'
    ),
    path(
        'projects/<int:project_id>/kanban/columns/reorder/',
        KanbanColumnViewSet.as_view({'post': 'reorder'}),
        name='kanban-columns-reorder'
    ),

    # =========================================================================
    # SWIMLANES
    # =========================================================================
    path(
        'projects/<int:project_id>/kanban/swimlanes/',
        KanbanSwimlaneViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='kanban-swimlanes-list'
    ),
    path(
        'projects/<int:project_id>/kanban/swimlanes/<int:pk>/',
        KanbanSwimlaneViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='kanban-swimlanes-detail'
    ),

    # =========================================================================
    # CARDS
    # =========================================================================
    path(
        'projects/<int:project_id>/kanban/cards/',
        KanbanCardViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='kanban-cards-list'
    ),
    path(
        'projects/<int:project_id>/kanban/cards/<int:pk>/',
        KanbanCardViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='kanban-cards-detail'
    ),
    path(
        'projects/<int:project_id>/kanban/cards/<int:pk>/move/',
        KanbanCardViewSet.as_view({'post': 'move'}),
        name='kanban-cards-move'
    ),
    path(
        'projects/<int:project_id>/kanban/cards/<int:pk>/toggle_blocked/',
        KanbanCardViewSet.as_view({'post': 'toggle_blocked'}),
        name='kanban-cards-toggle-blocked'
    ),
    path(
        'projects/<int:project_id>/kanban/cards/<int:pk>/add_comment/',
        KanbanCardViewSet.as_view({'post': 'add_comment'}),
        name='kanban-cards-add-comment'
    ),
    path(
        'projects/<int:project_id>/kanban/cards/<int:pk>/add_checklist/',
        KanbanCardViewSet.as_view({'post': 'add_checklist'}),
        name='kanban-cards-add-checklist'
    ),
    path(
        'projects/<int:project_id>/kanban/cards/reorder/',
        KanbanCardViewSet.as_view({'post': 'reorder'}),
        name='kanban-cards-reorder'
    ),

    # =========================================================================
    # COMMENTS & CHECKLISTS
    # =========================================================================
    path(
        'projects/<int:project_id>/kanban/comments/',
        CardCommentViewSet.as_view({'get': 'list'}),
        name='kanban-comments-list'
    ),
    path(
        'projects/<int:project_id>/kanban/comments/<int:pk>/',
        CardCommentViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='kanban-comments-detail'
    ),
    path(
        'projects/<int:project_id>/kanban/checklists/',
        CardChecklistViewSet.as_view({'get': 'list'}),
        name='kanban-checklists-list'
    ),
    path(
        'projects/<int:project_id>/kanban/checklists/<int:pk>/',
        CardChecklistViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='kanban-checklists-detail'
    ),
    path(
        'projects/<int:project_id>/kanban/checklists/<int:pk>/add_item/',
        CardChecklistViewSet.as_view({'post': 'add_item'}),
        name='kanban-checklists-add-item'
    ),
    path(
        'projects/<int:project_id>/kanban/checklists/<int:pk>/toggle_item/',
        CardChecklistViewSet.as_view({'post': 'toggle_item'}),
        name='kanban-checklists-toggle-item'
    ),

    # =========================================================================
    # METRICS
    # =========================================================================
    path(
        'projects/<int:project_id>/kanban/metrics/',
        KanbanMetricsViewSet.as_view({'get': 'list'}),
        name='kanban-metrics-list'
    ),
    path(
        'projects/<int:project_id>/kanban/metrics/record_daily/',
        KanbanMetricsViewSet.as_view({'post': 'record_daily'}),
        name='kanban-metrics-record'
    ),
    path(
        'projects/<int:project_id>/kanban/metrics/cfd/',
        KanbanMetricsViewSet.as_view({'get': 'cfd'}),
        name='kanban-metrics-cfd'
    ),
    path(
        'projects/<int:project_id>/kanban/metrics/throughput/',
        KanbanMetricsViewSet.as_view({'get': 'throughput'}),
        name='kanban-metrics-throughput'
    ),

    # =========================================================================
    # DASHBOARD
    # =========================================================================
    path(
        'projects/<int:project_id>/kanban/dashboard/',
        KanbanDashboardView.as_view(),
        name='kanban-dashboard'
    ),
]
