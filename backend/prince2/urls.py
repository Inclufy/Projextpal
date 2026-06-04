from django.urls import path

app_name = "prince2"

from .views import (
    ProductViewSet,
    ProjectBriefViewSet, BusinessCaseViewSet, BusinessCaseBenefitViewSet,
    BusinessCaseRiskViewSet, ProjectInitiationDocumentViewSet,
    StageViewSet, StagePlanViewSet, StageGateViewSet, WorkPackageViewSet,
    ProjectBoardViewSet, ProjectBoardMemberViewSet, HighlightReportViewSet,
    CheckpointReportViewSet,
    EndProjectReportViewSet, LessonsLogViewSet, ProjectToleranceViewSet,
    Prince2RiskViewSet, Prince2IssueViewSet, Prince2ExceptionReportViewSet,
    ManagementApproachViewSet, QualityRegisterViewSet, DailyLogViewSet,
    ExceptionPlanViewSet, ProductStatusAccountView,
    Prince2LessonsReportViewSet, Prince2ConfigItemViewSet,
    Prince2DashboardView,
    ProjectBriefComputedView, ProjectClosureComputedView,
    Prince2SeedDemoView, Prince2ClearDemoView,
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
        'projects/<int:project_id>/prince2/work-packages/<int:pk>/accept/',
        WorkPackageViewSet.as_view({'post': 'accept'}),
        name='prince2-wp-accept'
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
    # =========================================================================
    # RISK REGISTER
    # =========================================================================
    path(
        'projects/<int:project_id>/prince2/risks/',
        Prince2RiskViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='prince2-risk-list'
    ),
    path(
        'projects/<int:project_id>/prince2/risks/<int:pk>/',
        Prince2RiskViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='prince2-risk-detail'
    ),
    # =========================================================================
    # ISSUE REGISTER
    # =========================================================================
    path(
        'projects/<int:project_id>/prince2/issues/',
        Prince2IssueViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='prince2-issue-list'
    ),
    path(
        'projects/<int:project_id>/prince2/issues/<int:pk>/',
        Prince2IssueViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='prince2-issue-detail'
    ),
    path(
        'projects/<int:project_id>/prince2/issues/<int:pk>/change-authority-decision/',
        Prince2IssueViewSet.as_view({'post': 'change_authority_decision'}),
        name='prince2-issue-ca-decision'
    ),
    path(
        'projects/<int:project_id>/prince2/work-packages/<int:pk>/update_progress/',
        WorkPackageViewSet.as_view({'post': 'update_progress'}),
        name='prince2-wp-progress'
    ),

    # =========================================================================
    # EXCEPTION REPORTS (Manage by Exception)
    # =========================================================================
    path(
        'projects/<int:project_id>/prince2/exception-reports/',
        Prince2ExceptionReportViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='prince2-exception-report-list'
    ),
    path(
        'projects/<int:project_id>/prince2/exception-reports/<int:pk>/',
        Prince2ExceptionReportViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='prince2-exception-report-detail'
    ),
    path(
        'projects/<int:project_id>/prince2/exception-reports/<int:pk>/request_exception_plan/',
        Prince2ExceptionReportViewSet.as_view({'post': 'request_exception_plan'}),
        name='prince2-exception-report-request-plan'
    ),

    # =========================================================================
    # EXCEPTION PLANS (Manage by Exception — Board response)
    # =========================================================================
    path(
        'projects/<int:project_id>/prince2/exception-plans/',
        ExceptionPlanViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='prince2-exception-plan-list'
    ),
    path(
        'projects/<int:project_id>/prince2/exception-plans/<int:pk>/',
        ExceptionPlanViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='prince2-exception-plan-detail'
    ),
    path(
        'projects/<int:project_id>/prince2/exception-plans/<int:pk>/approve/',
        ExceptionPlanViewSet.as_view({'post': 'approve'}),
        name='prince2-exception-plan-approve'
    ),

    # =========================================================================
    # MANAGEMENT APPROACHES (Risk / Quality / Communication / Change Control)
    # =========================================================================
    path(
        'projects/<int:project_id>/prince2/approaches/',
        ManagementApproachViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='prince2-approaches-list'
    ),
    path(
        'projects/<int:project_id>/prince2/approaches/initialize/',
        ManagementApproachViewSet.as_view({'post': 'initialize'}),
        name='prince2-approaches-initialize'
    ),
    path(
        'projects/<int:project_id>/prince2/approaches/<int:pk>/',
        ManagementApproachViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='prince2-approaches-detail'
    ),

    # =========================================================================
    # QUALITY REGISTER
    # =========================================================================
    path(
        'projects/<int:project_id>/prince2/quality-register/',
        QualityRegisterViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='prince2-quality-register-list'
    ),
    path(
        'projects/<int:project_id>/prince2/quality-register/<int:pk>/',
        QualityRegisterViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='prince2-quality-register-detail'
    ),

    # =========================================================================
    # DAILY LOG
    # =========================================================================
    path(
        'projects/<int:project_id>/prince2/daily-log/',
        DailyLogViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='prince2-daily-log-list'
    ),
    path(
        'projects/<int:project_id>/prince2/daily-log/<int:pk>/',
        DailyLogViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='prince2-daily-log-detail'
    ),

    # =========================================================================
    # PRODUCT STATUS ACCOUNT (computed, read-only)
    # =========================================================================
    path(
        'projects/<int:project_id>/prince2/product-status/',
        ProductStatusAccountView.as_view(),
        name='prince2-product-status'
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
        'projects/<int:project_id>/prince2/highlight-reports/auto_draft/',
        HighlightReportViewSet.as_view({'post': 'auto_draft'}),
        name='prince2-highlight-auto-draft'
    ),
    path(
        'projects/<int:project_id>/prince2/highlight-reports/<int:pk>/',
        HighlightReportViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='prince2-highlight-detail'
    ),
    path(
        'projects/<int:project_id>/prince2/highlight-reports/<int:pk>/generate/',
        HighlightReportViewSet.as_view({'post': 'generate'}),
        name='prince2-highlight-generate'
    ),
    path(
        'projects/<int:project_id>/prince2/highlight-reports/<int:pk>/export/pptx/',
        HighlightReportViewSet.as_view({'get': 'export_pptx'}),
        name='prince2-highlight-export-pptx'
    ),

    # =========================================================================
    # CHECKPOINT REPORTS (PRINCE2 6th Ed §A.3)
    # =========================================================================
    path(
        'projects/<int:project_id>/prince2/checkpoint-reports/',
        CheckpointReportViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='prince2-checkpoint-list'
    ),
    path(
        'projects/<int:project_id>/prince2/checkpoint-reports/<int:pk>/',
        CheckpointReportViewSet.as_view({
            'get': 'retrieve', 'put': 'update',
            'patch': 'partial_update', 'delete': 'destroy',
        }),
        name='prince2-checkpoint-detail'
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
        'projects/<int:project_id>/prince2/lessons/compile_report/',
        LessonsLogViewSet.as_view({'post': 'compile_report'}),
        name='prince2-lessons-compile-report'
    ),
    path(
        'projects/<int:project_id>/prince2/lessons/prior_lessons/',
        LessonsLogViewSet.as_view({'get': 'prior_lessons'}),
        name='prince2-lessons-prior'
    ),

    # Lessons Report (compiled management product)
    path(
        'projects/<int:project_id>/prince2/lessons-reports/',
        Prince2LessonsReportViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='prince2-lessons-reports-list'
    ),
    path(
        'projects/<int:project_id>/prince2/lessons-reports/<int:pk>/',
        Prince2LessonsReportViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='prince2-lessons-reports-detail'
    ),

    # Configuration Item Records
    path(
        'projects/<int:project_id>/prince2/config-items/',
        Prince2ConfigItemViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='prince2-config-items-list'
    ),
    path(
        'projects/<int:project_id>/prince2/config-items/<int:pk>/',
        Prince2ConfigItemViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='prince2-config-items-detail'
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
    path(
        'projects/<int:project_id>/prince2/tolerances/check-cost-tolerance/',
        ProjectToleranceViewSet.as_view({'post': 'check_cost_tolerance'}),
        name='prince2-tolerances-check-cost'
    ),


    # =========================================================================
    # PRODUCTS
    # =========================================================================
    path(
        'projects/<int:project_id>/prince2/products/',
        ProductViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='prince2-products-list'
    ),
    path(
        'projects/<int:project_id>/prince2/products/<int:pk>/',
        ProductViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='prince2-products-detail'
    ),
    path(
        'projects/<int:project_id>/prince2/products/<int:pk>/approve/',
        ProductViewSet.as_view({'post': 'approve'}),
        name='prince2-products-approve'
    ),
    path(
        'projects/<int:project_id>/prince2/products/<int:pk>/reject/',
        ProductViewSet.as_view({'post': 'reject'}),
        name='prince2-products-reject'
    ),

    # =========================================================================
    # PRODUCT DESCRIPTIONS (alias for products/)
    # =========================================================================
    path(
        'projects/<int:project_id>/prince2/product-descriptions/',
        ProductViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='prince2-product-descriptions-list'
    ),
    path(
        'projects/<int:project_id>/prince2/product-descriptions/<int:pk>/',
        ProductViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='prince2-product-descriptions-detail'
    ),

    # =========================================================================
    # PROJECT BRIEF (computed, read-only)
    # =========================================================================
    path(
        'projects/<int:project_id>/prince2/project-brief/',
        ProjectBriefComputedView.as_view(),
        name='prince2-project-brief-computed'
    ),

    # =========================================================================
    # PROJECT CLOSURE (computed, read-only)
    # =========================================================================
    path(
        'projects/<int:project_id>/prince2/project-closure/',
        ProjectClosureComputedView.as_view(),
        name='prince2-project-closure-computed'
    ),

    # =========================================================================
    # DASHBOARD
    # =========================================================================
    path(
        'projects/<int:project_id>/prince2/dashboard/',
        Prince2DashboardView.as_view(),
        name='prince2-dashboard'
    ),
    path(
        'projects/<int:project_id>/prince2/seed-demo/',
        Prince2SeedDemoView.as_view(),
        name='prince2-seed-demo'
    ),
    path(
        'projects/<int:project_id>/prince2/clear-demo/',
        Prince2ClearDemoView.as_view(),
        name='prince2-clear-demo'
    ),
]
