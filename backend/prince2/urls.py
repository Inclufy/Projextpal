from django.urls import path
from .views import (
    ProjectBriefViewSet, BusinessCaseViewSet, BusinessCaseBenefitViewSet,
    BusinessCaseRiskViewSet, ProjectInitiationDocumentViewSet,
    StageViewSet, StagePlanViewSet, StageGateViewSet, WorkPackageViewSet,
    ProjectBoardViewSet, ProjectBoardMemberViewSet, HighlightReportViewSet,
    EndProjectReportViewSet, LessonsLogViewSet, ProjectToleranceViewSet,
    Prince2DashboardView
)


urlpatterns = [
    # =========================================================================
    # PROJECT BRIEF
    # =========================================================================
    path(
        'projects/<int:project_id>/prince2/brief/',
        ProjectBriefViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='prince2-brief-list'
    ),
    path(
        'projects/<int:project_id>/prince2/brief/<int:pk>/',
        ProjectBriefViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='prince2-brief-detail'
    ),
    path(
        'projects/<int:project_id>/prince2/brief/<int:pk>/submit_for_review/',
        ProjectBriefViewSet.as_view({'post': 'submit_for_review'}),
        name='prince2-brief-submit'
    ),
    path(
        'projects/<int:project_id>/prince2/brief/<int:pk>/approve/',
        ProjectBriefViewSet.as_view({'post': 'approve'}),
        name='prince2-brief-approve'
    ),

    # =========================================================================
    # BUSINESS CASE
    # =========================================================================
    path(
        'projects/<int:project_id>/prince2/business-case/',
        BusinessCaseViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='prince2-bc-list'
    ),
    path(
        'projects/<int:project_id>/prince2/business-case/<int:pk>/',
        BusinessCaseViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='prince2-bc-detail'
    ),
    path(
        'projects/<int:project_id>/prince2/business-case/<int:pk>/approve/',
        BusinessCaseViewSet.as_view({'post': 'approve'}),
        name='prince2-bc-approve'
    ),
    path(
        'projects/<int:project_id>/prince2/business-case/<int:pk>/add_benefit/',
        BusinessCaseViewSet.as_view({'post': 'add_benefit'}),
        name='prince2-bc-add-benefit'
    ),
    path(
        'projects/<int:project_id>/prince2/business-case/<int:pk>/add_risk/',
        BusinessCaseViewSet.as_view({'post': 'add_risk'}),
        name='prince2-bc-add-risk'
    ),
    
    # Benefits & BC Risks direct access
    path(
        'projects/<int:project_id>/prince2/benefits/',
        BusinessCaseBenefitViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='prince2-benefits-list'
    ),
    path(
        'projects/<int:project_id>/prince2/benefits/<int:pk>/',
        BusinessCaseBenefitViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='prince2-benefits-detail'
    ),
    path(
        'projects/<int:project_id>/prince2/bc-risks/',
        BusinessCaseRiskViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='prince2-bc-risks-list'
    ),
    path(
        'projects/<int:project_id>/prince2/bc-risks/<int:pk>/',
        BusinessCaseRiskViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='prince2-bc-risks-detail'
    ),

    # =========================================================================
    # PID
    # =========================================================================
    path(
        'projects/<int:project_id>/prince2/pid/',
        ProjectInitiationDocumentViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='prince2-pid-list'
    ),
    path(
        'projects/<int:project_id>/prince2/pid/<int:pk>/',
        ProjectInitiationDocumentViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='prince2-pid-detail'
    ),
    path(
        'projects/<int:project_id>/prince2/pid/<int:pk>/baseline/',
        ProjectInitiationDocumentViewSet.as_view({'post': 'baseline'}),
        name='prince2-pid-baseline'
    ),

    # =========================================================================
    # STAGES
    # =========================================================================
    path(
        'projects/<int:project_id>/prince2/stages/',
        StageViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='prince2-stages-list'
    ),
    path(
        'projects/<int:project_id>/prince2/stages/<int:pk>/',
        StageViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='prince2-stages-detail'
    ),
    path(
        'projects/<int:project_id>/prince2/stages/<int:pk>/start/',
        StageViewSet.as_view({'post': 'start'}),
        name='prince2-stages-start'
    ),
    path(
        'projects/<int:project_id>/prince2/stages/<int:pk>/complete/',
        StageViewSet.as_view({'post': 'complete'}),
        name='prince2-stages-complete'
    ),
    path(
        'projects/<int:project_id>/prince2/stages/<int:pk>/update_progress/',
        StageViewSet.as_view({'post': 'update_progress'}),
        name='prince2-stages-progress'
    ),
    path(
        'projects/<int:project_id>/prince2/stages/initialize_stages/',
        StageViewSet.as_view({'post': 'initialize_stages'}),
        name='prince2-stages-initialize'
    ),

    # Stage Plans
    path(
        'projects/<int:project_id>/prince2/stage-plans/',
        StagePlanViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='prince2-stage-plans-list'
    ),
    path(
        'projects/<int:project_id>/prince2/stage-plans/<int:pk>/',
        StagePlanViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='prince2-stage-plans-detail'
    ),
    path(
        'projects/<int:project_id>/prince2/stage-plans/<int:pk>/approve/',
        StagePlanViewSet.as_view({'post': 'approve'}),
        name='prince2-stage-plans-approve'
    ),

    # Stage Gates
    path(
        'projects/<int:project_id>/prince2/stage-gates/',
        StageGateViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='prince2-stage-gates-list'
    ),
    path(
        'projects/<int:project_id>/prince2/stage-gates/<int:pk>/',
        StageGateViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='prince2-stage-gates-detail'
    ),
    path(
        'projects/<int:project_id>/prince2/stage-gates/<int:pk>/approve/',
        StageGateViewSet.as_view({'post': 'approve'}),
        name='prince2-stage-gates-approve'
    ),
    path(
        'projects/<int:project_id>/prince2/stage-gates/<int:pk>/reject/',
        StageGateViewSet.as_view({'post': 'reject'}),
        name='prince2-stage-gates-reject'
    ),

    # =========================================================================
    # WORK PACKAGES
    # =========================================================================
    path(
        'projects/<int:project_id>/prince2/work-packages/',
        WorkPackageViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='prince2-wp-list'
    ),
    path(
        'projects/<int:project_id>/prince2/work-packages/<int:pk>/',
        WorkPackageViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='prince2-wp-detail'
    ),
    path(
        'projects/<int:project_id>/prince2/work-packages/<int:pk>/authorize/',
        WorkPackageViewSet.as_view({'post': 'authorize'}),
        name='prince2-wp-authorize'
    ),
    path(
        'projects/<int:project_id>/prince2/work-packages/<int:pk>/start/',
        WorkPackageViewSet.as_view({'post': 'start'}),
        name='prince2-wp-start'
    ),
    path(
        'projects/<int:project_id>/prince2/work-packages/<int:pk>/complete/',
        WorkPackageViewSet.as_view({'post': 'complete'}),
        name='prince2-wp-complete'
    ),
    path(
        'projects/<int:project_id>/prince2/work-packages/<int:pk>/update_progress/',
        WorkPackageViewSet.as_view({'post': 'update_progress'}),
        name='prince2-wp-progress'
    ),

    # =========================================================================
    # PROJECT BOARD
    # =========================================================================
    path(
        'projects/<int:project_id>/prince2/board/',
        ProjectBoardViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='prince2-board-list'
    ),
    path(
        'projects/<int:project_id>/prince2/board/<int:pk>/',
        ProjectBoardViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='prince2-board-detail'
    ),
    path(
        'projects/<int:project_id>/prince2/board/<int:pk>/add_member/',
        ProjectBoardViewSet.as_view({'post': 'add_member'}),
        name='prince2-board-add-member'
    ),
    
    # Board Members
    path(
        'projects/<int:project_id>/prince2/board-members/',
        ProjectBoardMemberViewSet.as_view({'get': 'list'}),
        name='prince2-board-members-list'
    ),
    path(
        'projects/<int:project_id>/prince2/board-members/<int:pk>/',
        ProjectBoardMemberViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='prince2-board-members-detail'
    ),

    # =========================================================================
    # REPORTS
    # =========================================================================
    path(
        'projects/<int:project_id>/prince2/highlight-reports/',
        HighlightReportViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='prince2-highlight-list'
    ),
    path(
        'projects/<int:project_id>/prince2/highlight-reports/<int:pk>/',
        HighlightReportViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='prince2-highlight-detail'
    ),

    path(
        'projects/<int:project_id>/prince2/end-project-report/',
        EndProjectReportViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='prince2-end-report-list'
    ),
    path(
        'projects/<int:project_id>/prince2/end-project-report/<int:pk>/',
        EndProjectReportViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='prince2-end-report-detail'
    ),
    path(
        'projects/<int:project_id>/prince2/end-project-report/<int:pk>/approve/',
        EndProjectReportViewSet.as_view({'post': 'approve'}),
        name='prince2-end-report-approve'
    ),

    # =========================================================================
    # LESSONS & TOLERANCES
    # =========================================================================
    path(
        'projects/<int:project_id>/prince2/lessons/',
        LessonsLogViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='prince2-lessons-list'
    ),
    path(
        'projects/<int:project_id>/prince2/lessons/<int:pk>/',
        LessonsLogViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='prince2-lessons-detail'
    ),
    path(
        'projects/<int:project_id>/prince2/lessons/by_category/',
        LessonsLogViewSet.as_view({'get': 'by_category'}),
        name='prince2-lessons-by-category'
    ),

    path(
        'projects/<int:project_id>/prince2/tolerances/',
        ProjectToleranceViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='prince2-tolerances-list'
    ),
    path(
        'projects/<int:project_id>/prince2/tolerances/<int:pk>/',
        ProjectToleranceViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='prince2-tolerances-detail'
    ),
    path(
        'projects/<int:project_id>/prince2/tolerances/initialize/',
        ProjectToleranceViewSet.as_view({'post': 'initialize'}),
        name='prince2-tolerances-initialize'
    ),

    # =========================================================================
    # DASHBOARD
    # =========================================================================
    path(
        'projects/<int:project_id>/prince2/dashboard/',
        Prince2DashboardView.as_view(),
        name='prince2-dashboard'
    ),
]
