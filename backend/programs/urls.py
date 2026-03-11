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
)

# Router
router = DefaultRouter()
router.register(r'', ProgramViewSet, basename='program')
router.register(r'budget', ProgramBudgetViewSet, basename='program-budget')
router.register(r'budget-categories', ProgramBudgetCategoryViewSet, basename='program-budget-category')
router.register(r'budget-items', ProgramBudgetItemViewSet, basename='program-budget-item')

urlpatterns = [
    # Explicit URL patterns for custom actions (before router to ensure priority)
    path('<int:pk>/add_project/',
         ProgramViewSet.as_view({'post': 'add_project'}),
         name='program-add-project-explicit'),
    path('<int:pk>/projects/',
         ProgramViewSet.as_view({'get': 'projects'}),
         name='program-projects-explicit'),

    path('', include(router.urls)),

    # Budget overview (custom route)
    path('programs/<int:pk>/budget/overview/', 
         ProgramBudgetOverviewViewSet.as_view({'get': 'retrieve'}), 
         name='program-budget-overview'),
    
    # Nested routes for benefits
    path('programs/<int:program_pk>/benefits/', 
         ProgramBenefitViewSet.as_view({'get': 'list', 'post': 'create'}), 
         name='program-benefits-list'),
    path('programs/<int:program_pk>/benefits/<int:pk>/', 
         ProgramBenefitViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), 
         name='program-benefits-detail'),
    
    # Nested routes for risks
    path('programs/<int:program_pk>/risks/', 
         ProgramRiskViewSet.as_view({'get': 'list', 'post': 'create'}), 
         name='program-risks-list'),
    path('programs/<int:program_pk>/risks/<int:pk>/', 
         ProgramRiskViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), 
         name='program-risks-detail'),
    
    # Nested routes for milestones
    path('programs/<int:program_pk>/milestones/', 
         ProgramMilestoneViewSet.as_view({'get': 'list', 'post': 'create'}), 
         name='program-milestones-list'),
    path('programs/<int:program_pk>/milestones/<int:pk>/', 
         ProgramMilestoneViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), 
         name='program-milestones-detail'),
]
# AI Insights endpoints
urlpatterns += [
]
