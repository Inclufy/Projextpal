# ============================================================
# ADMIN PORTAL - URLS
# URL routing for admin portal API endpoints
# ============================================================

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CurrentUserView,
    DashboardStatsView,
    AdminUserViewSet,
    AdminCompanyViewSet,
    AdminPlanViewSet,
    AuditLogViewSet,
    SystemSettingsView,
    ClientApiKeyListView,
    ClientApiKeyDetailView,
    CloudProviderConfigListView,
    CloudProviderConfigDetailView,
    CloudProviderTestConnectionView,
    ProjectImportView,
    CourseImportView,
    TimesheetExportView,
    TimesheetApiView,
)

# Import registration views
from accounts.views import RegistrationsView

# Import invoice views from invoices app
from invoices.views import CompanyInvoiceViewSet, InvoiceSettingsViewSet

# Import academy views
from academy import views as academy_views

# Create router for viewsets
router = DefaultRouter()
router.register('users', AdminUserViewSet, basename='admin-users')
router.register('tenants', AdminCompanyViewSet, basename='admin-tenants')
router.register('plans', AdminPlanViewSet, basename='admin-plans')
router.register('logs', AuditLogViewSet, basename='admin-logs')
router.register('invoices', CompanyInvoiceViewSet, basename='admin-invoices')
router.register('invoice-settings', InvoiceSettingsViewSet, basename='admin-invoice-settings')

urlpatterns = [
    # Dashboard stats
    path('stats/', DashboardStatsView.as_view(), name='admin-stats'),
    
    # System settings
    path('settings/', SystemSettingsView.as_view(), name='admin-settings'),

    # Client API keys (per company)
    path('api-keys/', ClientApiKeyListView.as_view(), name='admin-api-keys'),
    path('api-keys/<uuid:pk>/', ClientApiKeyDetailView.as_view(), name='admin-api-key-detail'),

    # Cloud provider configuration (AWS, Azure, GCP, DigitalOcean)
    path('cloud-providers/', CloudProviderConfigListView.as_view(), name='admin-cloud-providers'),
    path('cloud-providers/<uuid:pk>/', CloudProviderConfigDetailView.as_view(), name='admin-cloud-provider-detail'),
    path('cloud-providers/<uuid:pk>/test/', CloudProviderTestConnectionView.as_view(), name='admin-cloud-provider-test'),
    
    # ============================================
    # ACADEMY / TRAINING MANAGEMENT
    # ============================================
    # Course import (must be before <str:course_id> to avoid being shadowed)
    path('training/courses/import/', CourseImportView.as_view(), name='admin-training-courses-import'),

    # Courses
    path('training/courses/', academy_views.admin_get_courses, name='admin-training-courses'),
    path('training/courses/<str:course_id>/', academy_views.admin_get_course, name='admin-training-course-detail'),
    path('training/courses/<str:course_id>/update/', academy_views.admin_update_course, name='admin-training-course-update'),

    # Enrollments
    path('training/enrollments/', academy_views.admin_get_enrollments, name='admin-training-enrollments'),
    path('training/enrollments/<str:enrollment_id>/', academy_views.admin_get_enrollment, name='admin-training-enrollment-detail'),
    path('training/enrollments/<str:enrollment_id>/update/', academy_views.admin_update_enrollment, name='admin-training-enrollment-update'),

    # Quotes
    path('training/quotes/', academy_views.admin_get_quotes, name='admin-training-quotes'),
    path('training/quotes/<str:quote_id>/', academy_views.admin_get_quote, name='admin-training-quote-detail'),
    path('training/quotes/<str:quote_id>/update/', academy_views.admin_update_quote, name='admin-training-quote-update'),
    path('training/quotes/<str:quote_id>/mark-contacted/', academy_views.admin_quote_mark_contacted, name='admin-training-quote-contacted'),
    path('training/quotes/<str:quote_id>/send/', academy_views.admin_quote_send, name='admin-training-quote-send'),

    # Analytics
    path('training/analytics/', academy_views.admin_get_analytics, name='admin-training-analytics'),

    # Project import
    path('projects/import/', ProjectImportView.as_view(), name='admin-projects-import'),

    # Timesheet export (admin/superadmin only)
    path('timesheets/export/', TimesheetExportView.as_view(), name='admin-timesheets-export'),

    # Timesheet API (API key or token auth for integrations)
    path('timesheets/api/', TimesheetApiView.as_view(), name='admin-timesheets-api'),

    # Include router URLs
    path('', include(router.urls)),
]
