# academy/urls.py
"""
Academy URL Configuration
"""

from django.urls import path
from . import views, ai_views

app_name = 'academy'

urlpatterns = [
    # ============================================
    # PUBLIC ENDPOINTS - Stripe & Checkout
    # ============================================
    path('checkout/create-session/', views.create_checkout_session, name='create_checkout_session'),
    path('checkout/verify/', views.verify_payment, name='verify_payment'),
    path('webhook/stripe/', views.stripe_webhook, name='stripe_webhook'),
    path('coupon/validate/', views.validate_coupon, name='validate_coupon'),
    path('quote/request/', views.request_quote, name='request_quote'),
    
    # ============================================
    # ADMIN ENDPOINTS - Courses
    # ============================================
    path('courses/', views.admin_get_courses, name='admin_courses'),
    path('courses/<str:course_id>/', views.admin_get_course, name='admin_course_detail'),
    path('courses/<str:course_id>/update/', views.admin_update_course, name='admin_course_update'),
    
    # ============================================
    # ADMIN ENDPOINTS - Enrollments
    # ============================================
    path('enrollments/', views.admin_get_enrollments, name='admin_enrollments'),
    path('enrollments/<str:enrollment_id>/', views.admin_get_enrollment, name='admin_enrollment_detail'),
    path('enrollments/<str:enrollment_id>/update/', views.admin_update_enrollment, name='admin_enrollment_update'),
    
    # ============================================
    # ADMIN ENDPOINTS - Quotes
    # ============================================
    path('quotes/', views.admin_get_quotes, name='admin_quotes'),
    path('quotes/<str:quote_id>/', views.admin_get_quote, name='admin_quote_detail'),
    path('quotes/<str:quote_id>/update/', views.admin_update_quote, name='admin_quote_update'),
    path('quotes/<str:quote_id>/mark-contacted/', views.admin_quote_mark_contacted, name='admin_quote_mark_contacted'),
    path('quotes/<str:quote_id>/send/', views.admin_quote_send, name='admin_quote_send'),
    
    # ============================================
    # ADMIN ENDPOINTS - Analytics & Dashboard
    # ============================================
    path('analytics/', views.admin_get_analytics, name='admin_analytics'),
    path('dashboard/', views.admin_dashboard_summary, name='admin_dashboard'),

    # Modules
    path('courses/<str:course_id>/modules/', views.admin_get_modules, name='admin_get_modules'),
    path('courses/<str:course_id>/modules/create/', views.admin_create_module, name='admin_create_module'),
    path('modules/<int:module_id>/update/', views.admin_update_module, name='admin_update_module'),
    path('modules/<int:module_id>/delete/', views.admin_delete_module, name='admin_delete_module'),
    
    # Lessons
    path('modules/<int:module_id>/lessons/', views.admin_get_lessons, name='admin_get_lessons'),
    path('modules/<int:module_id>/lessons/create/', views.admin_create_lesson, name='admin_create_lesson'),
    path('lessons/<int:lesson_id>/', views.admin_get_lesson, name='admin_get_lesson'),
    path('lessons/<int:lesson_id>/update/', views.admin_update_lesson, name='admin_update_lesson'),
    path('lessons/<int:lesson_id>/delete/', views.admin_delete_lesson, name='admin_delete_lesson'),
    
    # Content API for IQ Helix
    path('content/courses/', views.api_content_courses, name='api_content_courses'),
    path('content/courses/<str:course_id>/', views.api_content_course_structure, name='api_content_course_structure'),

    # Content Upload
    path('lessons/<int:lesson_id>/content/', views.get_lesson_content, name='get_lesson_content'),
    path('lessons/<int:lesson_id>/content/upload/', views.upload_lesson_content, name='upload_lesson_content'),
    path('content/<int:content_id>/delete/', views.delete_lesson_content, name='delete_lesson_content'),

    # Admin endpoints
    path('admin/courses/', views.admin_get_courses, name='admin-get-courses'),
    path('admin/courses/create/', views.admin_create_course, name='admin-create-course'),
    path('admin/courses/<uuid:course_id>/', views.admin_delete_course, name='admin-delete-course'),

    # AI endpoints
    path('ai/curate-course/', ai_views.ai_curate_course, name='ai-curate-course'),
    path('ai/generate-module/', ai_views.ai_generate_module, name='ai-generate-module'),
]