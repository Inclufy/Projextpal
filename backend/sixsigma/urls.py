from django.urls import path
from .views import (
    # Define
    SIPOCDiagramViewSet, SIPOCItemViewSet, VoiceOfCustomerViewSet, ProjectCharterViewSet,
    # Measure
    DataCollectionPlanViewSet, DataCollectionMetricViewSet, MSAResultViewSet, BaselineMetricViewSet,
    # Analyze
    FishboneDiagramViewSet, FishboneCauseViewSet,
    ParetoAnalysisViewSet, ParetoCategoryViewSet, HypothesisTestViewSet,
    # Improve
    SolutionViewSet, PilotPlanViewSet, FMEAViewSet, ImplementationPlanViewSet,
    # Control
    ControlPlanViewSet, ControlPlanItemViewSet,
    ControlChartViewSet, ControlChartDataViewSet,
    TollgateReviewViewSet, ProjectClosureViewSet,
    # Dashboard
    SixSigmaDashboardView,
)


urlpatterns = [
    # =========================================================================
    # DEFINE PHASE
    # =========================================================================
    
    # SIPOC Diagram
    path(
        'projects/<int:project_id>/sixsigma/sipoc/',
        SIPOCDiagramViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='sixsigma-sipoc-list'
    ),
    path(
        'projects/<int:project_id>/sixsigma/sipoc/<int:pk>/',
        SIPOCDiagramViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='sixsigma-sipoc-detail'
    ),
    path(
        'projects/<int:project_id>/sixsigma/sipoc/<int:pk>/add_item/',
        SIPOCDiagramViewSet.as_view({'post': 'add_item'}),
        name='sixsigma-sipoc-add-item'
    ),
    path(
        'projects/<int:project_id>/sixsigma/sipoc/<int:pk>/bulk_update_items/',
        SIPOCDiagramViewSet.as_view({'post': 'bulk_update_items'}),
        name='sixsigma-sipoc-bulk-update'
    ),
    
    # SIPOC Items
    path(
        'projects/<int:project_id>/sixsigma/sipoc-items/',
        SIPOCItemViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='sixsigma-sipoc-items-list'
    ),
    path(
        'projects/<int:project_id>/sixsigma/sipoc-items/<int:pk>/',
        SIPOCItemViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='sixsigma-sipoc-items-detail'
    ),
    
    # Voice of Customer
    path(
        'projects/<int:project_id>/sixsigma/voc/',
        VoiceOfCustomerViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='sixsigma-voc-list'
    ),
    path(
        'projects/<int:project_id>/sixsigma/voc/<int:pk>/',
        VoiceOfCustomerViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='sixsigma-voc-detail'
    ),
    path(
        'projects/<int:project_id>/sixsigma/voc/by_priority/',
        VoiceOfCustomerViewSet.as_view({'get': 'by_priority'}),
        name='sixsigma-voc-by-priority'
    ),
    
    # Project Charter
    path(
        'projects/<int:project_id>/sixsigma/charter/',
        ProjectCharterViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='sixsigma-charter-list'
    ),
    path(
        'projects/<int:project_id>/sixsigma/charter/<int:pk>/',
        ProjectCharterViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='sixsigma-charter-detail'
    ),
    path(
        'projects/<int:project_id>/sixsigma/charter/<int:pk>/approve/',
        ProjectCharterViewSet.as_view({'post': 'approve'}),
        name='sixsigma-charter-approve'
    ),
    
    # =========================================================================
    # MEASURE PHASE
    # =========================================================================
    
    # Data Collection Plan
    path(
        'projects/<int:project_id>/sixsigma/data-collection/',
        DataCollectionPlanViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='sixsigma-data-collection-list'
    ),
    path(
        'projects/<int:project_id>/sixsigma/data-collection/<int:pk>/',
        DataCollectionPlanViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='sixsigma-data-collection-detail'
    ),
    
    # Data Collection Metrics
    path(
        'projects/<int:project_id>/sixsigma/metrics/',
        DataCollectionMetricViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='sixsigma-metrics-list'
    ),
    path(
        'projects/<int:project_id>/sixsigma/metrics/<int:pk>/',
        DataCollectionMetricViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='sixsigma-metrics-detail'
    ),
    path(
        'projects/<int:project_id>/sixsigma/metrics/<int:pk>/update_collected/',
        DataCollectionMetricViewSet.as_view({'post': 'update_collected'}),
        name='sixsigma-metrics-update-collected'
    ),
    
    # MSA Results
    path(
        'projects/<int:project_id>/sixsigma/msa/',
        MSAResultViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='sixsigma-msa-list'
    ),
    path(
        'projects/<int:project_id>/sixsigma/msa/<int:pk>/',
        MSAResultViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='sixsigma-msa-detail'
    ),
    
    # Baseline Metrics
    path(
        'projects/<int:project_id>/sixsigma/baseline/',
        BaselineMetricViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='sixsigma-baseline-list'
    ),
    path(
        'projects/<int:project_id>/sixsigma/baseline/<int:pk>/',
        BaselineMetricViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='sixsigma-baseline-detail'
    ),
    path(
        'projects/<int:project_id>/sixsigma/baseline/<int:pk>/update_current/',
        BaselineMetricViewSet.as_view({'post': 'update_current'}),
        name='sixsigma-baseline-update-current'
    ),
    
    # =========================================================================
    # ANALYZE PHASE
    # =========================================================================
    
    # Fishbone Diagram
    path(
        'projects/<int:project_id>/sixsigma/fishbone/',
        FishboneDiagramViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='sixsigma-fishbone-list'
    ),
    path(
        'projects/<int:project_id>/sixsigma/fishbone/<int:pk>/',
        FishboneDiagramViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='sixsigma-fishbone-detail'
    ),
    
    # Fishbone Causes
    path(
        'projects/<int:project_id>/sixsigma/causes/',
        FishboneCauseViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='sixsigma-causes-list'
    ),
    path(
        'projects/<int:project_id>/sixsigma/causes/<int:pk>/',
        FishboneCauseViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='sixsigma-causes-detail'
    ),
    path(
        'projects/<int:project_id>/sixsigma/causes/<int:pk>/vote/',
        FishboneCauseViewSet.as_view({'post': 'vote'}),
        name='sixsigma-causes-vote'
    ),
    path(
        'projects/<int:project_id>/sixsigma/causes/<int:pk>/toggle_root_cause/',
        FishboneCauseViewSet.as_view({'post': 'toggle_root_cause'}),
        name='sixsigma-causes-toggle-root'
    ),
    path(
        'projects/<int:project_id>/sixsigma/causes/<int:pk>/verify/',
        FishboneCauseViewSet.as_view({'post': 'verify'}),
        name='sixsigma-causes-verify'
    ),
    
    # Pareto Analysis
    path(
        'projects/<int:project_id>/sixsigma/pareto/',
        ParetoAnalysisViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='sixsigma-pareto-list'
    ),
    path(
        'projects/<int:project_id>/sixsigma/pareto/<int:pk>/',
        ParetoAnalysisViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='sixsigma-pareto-detail'
    ),
    
    # Pareto Categories
    path(
        'projects/<int:project_id>/sixsigma/pareto-categories/',
        ParetoCategoryViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='sixsigma-pareto-categories-list'
    ),
    path(
        'projects/<int:project_id>/sixsigma/pareto-categories/<int:pk>/',
        ParetoCategoryViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='sixsigma-pareto-categories-detail'
    ),
    
    # Hypothesis Tests
    path(
        'projects/<int:project_id>/sixsigma/hypothesis/',
        HypothesisTestViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='sixsigma-hypothesis-list'
    ),
    path(
        'projects/<int:project_id>/sixsigma/hypothesis/<int:pk>/',
        HypothesisTestViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='sixsigma-hypothesis-detail'
    ),
    path(
        'projects/<int:project_id>/sixsigma/hypothesis/<int:pk>/record_results/',
        HypothesisTestViewSet.as_view({'post': 'record_results'}),
        name='sixsigma-hypothesis-record-results'
    ),
    
    # =========================================================================
    # IMPROVE PHASE
    # =========================================================================
    
    # Solutions
    path(
        'projects/<int:project_id>/sixsigma/solutions/',
        SolutionViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='sixsigma-solutions-list'
    ),
    path(
        'projects/<int:project_id>/sixsigma/solutions/<int:pk>/',
        SolutionViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='sixsigma-solutions-detail'
    ),
    path(
        'projects/<int:project_id>/sixsigma/solutions/priority_matrix/',
        SolutionViewSet.as_view({'get': 'priority_matrix'}),
        name='sixsigma-solutions-priority-matrix'
    ),
    path(
        'projects/<int:project_id>/sixsigma/solutions/<int:pk>/update_status/',
        SolutionViewSet.as_view({'post': 'update_status'}),
        name='sixsigma-solutions-update-status'
    ),
    
    # Pilot Plans
    path(
        'projects/<int:project_id>/sixsigma/pilots/',
        PilotPlanViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='sixsigma-pilots-list'
    ),
    path(
        'projects/<int:project_id>/sixsigma/pilots/<int:pk>/',
        PilotPlanViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='sixsigma-pilots-detail'
    ),
    path(
        'projects/<int:project_id>/sixsigma/pilots/<int:pk>/record_results/',
        PilotPlanViewSet.as_view({'post': 'record_results'}),
        name='sixsigma-pilots-record-results'
    ),
    
    # FMEA
    path(
        'projects/<int:project_id>/sixsigma/fmea/',
        FMEAViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='sixsigma-fmea-list'
    ),
    path(
        'projects/<int:project_id>/sixsigma/fmea/<int:pk>/',
        FMEAViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='sixsigma-fmea-detail'
    ),
    path(
        'projects/<int:project_id>/sixsigma/fmea/high_rpn/',
        FMEAViewSet.as_view({'get': 'high_rpn'}),
        name='sixsigma-fmea-high-rpn'
    ),
    path(
        'projects/<int:project_id>/sixsigma/fmea/<int:pk>/record_action/',
        FMEAViewSet.as_view({'post': 'record_action'}),
        name='sixsigma-fmea-record-action'
    ),
    
    # Implementation Plans
    path(
        'projects/<int:project_id>/sixsigma/implementation/',
        ImplementationPlanViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='sixsigma-implementation-list'
    ),
    path(
        'projects/<int:project_id>/sixsigma/implementation/<int:pk>/',
        ImplementationPlanViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='sixsigma-implementation-detail'
    ),
    path(
        'projects/<int:project_id>/sixsigma/implementation/<int:pk>/update_progress/',
        ImplementationPlanViewSet.as_view({'post': 'update_progress'}),
        name='sixsigma-implementation-update-progress'
    ),
    
    # =========================================================================
    # CONTROL PHASE
    # =========================================================================
    
    # Control Plan
    path(
        'projects/<int:project_id>/sixsigma/control-plan/',
        ControlPlanViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='sixsigma-control-plan-list'
    ),
    path(
        'projects/<int:project_id>/sixsigma/control-plan/<int:pk>/',
        ControlPlanViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='sixsigma-control-plan-detail'
    ),
    path(
        'projects/<int:project_id>/sixsigma/control-plan/<int:pk>/new_revision/',
        ControlPlanViewSet.as_view({'post': 'new_revision'}),
        name='sixsigma-control-plan-new-revision'
    ),
    
    # Control Plan Items
    path(
        'projects/<int:project_id>/sixsigma/control-plan-items/',
        ControlPlanItemViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='sixsigma-control-plan-items-list'
    ),
    path(
        'projects/<int:project_id>/sixsigma/control-plan-items/<int:pk>/',
        ControlPlanItemViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='sixsigma-control-plan-items-detail'
    ),
    
    # Control Charts
    path(
        'projects/<int:project_id>/sixsigma/control-charts/',
        ControlChartViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='sixsigma-control-charts-list'
    ),
    path(
        'projects/<int:project_id>/sixsigma/control-charts/<int:pk>/',
        ControlChartViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='sixsigma-control-charts-detail'
    ),
    path(
        'projects/<int:project_id>/sixsigma/control-charts/<int:pk>/add_data_point/',
        ControlChartViewSet.as_view({'post': 'add_data_point'}),
        name='sixsigma-control-charts-add-data'
    ),
    path(
        'projects/<int:project_id>/sixsigma/control-charts/<int:pk>/violations/',
        ControlChartViewSet.as_view({'get': 'violations'}),
        name='sixsigma-control-charts-violations'
    ),
    path(
        'projects/<int:project_id>/sixsigma/control-charts/<int:pk>/recalculate_limits/',
        ControlChartViewSet.as_view({'post': 'recalculate_limits'}),
        name='sixsigma-control-charts-recalculate'
    ),
    
    # Control Chart Data
    path(
        'projects/<int:project_id>/sixsigma/chart-data/',
        ControlChartDataViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='sixsigma-chart-data-list'
    ),
    path(
        'projects/<int:project_id>/sixsigma/chart-data/<int:pk>/',
        ControlChartDataViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='sixsigma-chart-data-detail'
    ),
    
    # Tollgate Reviews
    path(
        'projects/<int:project_id>/sixsigma/tollgates/',
        TollgateReviewViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='sixsigma-tollgates-list'
    ),
    path(
        'projects/<int:project_id>/sixsigma/tollgates/<int:pk>/',
        TollgateReviewViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='sixsigma-tollgates-detail'
    ),
    path(
        'projects/<int:project_id>/sixsigma/tollgates/<int:pk>/approve/',
        TollgateReviewViewSet.as_view({'post': 'approve'}),
        name='sixsigma-tollgates-approve'
    ),
    path(
        'projects/<int:project_id>/sixsigma/tollgates/<int:pk>/reject/',
        TollgateReviewViewSet.as_view({'post': 'reject'}),
        name='sixsigma-tollgates-reject'
    ),
    path(
        'projects/<int:project_id>/sixsigma/tollgates/initialize/',
        TollgateReviewViewSet.as_view({'post': 'initialize'}),
        name='sixsigma-tollgates-initialize'
    ),
    
    # Project Closure
    path(
        'projects/<int:project_id>/sixsigma/closure/',
        ProjectClosureViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='sixsigma-closure-list'
    ),
    path(
        'projects/<int:project_id>/sixsigma/closure/<int:pk>/',
        ProjectClosureViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
        name='sixsigma-closure-detail'
    ),
    path(
        'projects/<int:project_id>/sixsigma/closure/<int:pk>/approve/',
        ProjectClosureViewSet.as_view({'post': 'approve'}),
        name='sixsigma-closure-approve'
    ),
    
    # =========================================================================
    # DASHBOARD
    # =========================================================================
    path(
        'projects/<int:project_id>/sixsigma/dashboard/',
        SixSigmaDashboardView.as_view(),
        name='sixsigma-dashboard'
    ),
]