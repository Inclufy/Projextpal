from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProgramViewSet,
    ProgramBenefitViewSet,
    ProgramRiskViewSet,
    ProgramMilestoneViewSet,
)

# Simple router (use this if you don't have drf-nested-routers installed)
router = DefaultRouter()
router.register(r'programs', ProgramViewSet, basename='program')

urlpatterns = [
    path('', include(router.urls)),
    
    # Manual nested routes for benefits, risks, milestones
    path('programs/<int:program_pk>/benefits/', 
         ProgramBenefitViewSet.as_view({'get': 'list', 'post': 'create'}), 
         name='program-benefits-list'),
    path('programs/<int:program_pk>/benefits/<int:pk>/', 
         ProgramBenefitViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), 
         name='program-benefits-detail'),
    
    path('programs/<int:program_pk>/risks/', 
         ProgramRiskViewSet.as_view({'get': 'list', 'post': 'create'}), 
         name='program-risks-list'),
    path('programs/<int:program_pk>/risks/<int:pk>/', 
         ProgramRiskViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), 
         name='program-risks-detail'),
    
    path('programs/<int:program_pk>/milestones/', 
         ProgramMilestoneViewSet.as_view({'get': 'list', 'post': 'create'}), 
         name='program-milestones-list'),
    path('programs/<int:program_pk>/milestones/<int:pk>/', 
         ProgramMilestoneViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), 
         name='program-milestones-detail'),
]
