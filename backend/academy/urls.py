from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import api_views, views, test_view, quiz_exam_api, ai_content_api, certificate_api, admin_api, ai_views
from .views import SkillViewSet, SkillCategoryViewSet, UserSkillViewSet, SkillGoalViewSet, SkillActivityViewSet

router = DefaultRouter()
router.register(r'courses', api_views.CourseViewSet, basename='course')
router.register(r'modules', api_views.CourseModuleViewSet, basename='module')
router.register(r'lessons', api_views.CourseLessonViewSet, basename='lesson')

skills_router = DefaultRouter()
skills_router.register(r'skills', SkillViewSet, basename='skill')
skills_router.register(r'categories', SkillCategoryViewSet, basename='skill-category')
skills_router.register(r'user-skills', UserSkillViewSet, basename='user-skill')
skills_router.register(r'goals', SkillGoalViewSet, basename='skill-goal')
skills_router.register(r'activities', SkillActivityViewSet, basename='skill-activity')

urlpatterns = [
    path('', include(router.urls)),
    path('skills/', include(skills_router.urls)),
    path('visuals/', include('academy.urls_visual')),

    # ===== EnhancedCourseBuilder CRUD endpoints =====
    path('courses/<str:pk>/update/', api_views.course_update, name='course-update'),
    path('courses/<str:pk>/delete/', api_views.course_delete, name='course-delete'),
    path('courses/<str:pk>/modules/create/', api_views.course_create_module, name='course-create-module'),
    path('modules/<int:pk>/update/', api_views.module_update, name='module-update'),
    path('modules/<int:pk>/delete/', api_views.module_delete, name='module-delete'),
    path('modules/<int:pk>/lessons/create/', api_views.module_create_lesson, name='module-create-lesson'),
    path('lessons/<int:pk>/update/', api_views.lesson_update, name='lesson-update'),
    path('lessons/<int:pk>/delete/', api_views.lesson_delete, name='lesson-delete'),

    # Visual Selection AI endpoint
    path('analyze-lesson/', api_views.analyze_lesson_for_visual, name='analyze-lesson-visual'),
    
    # Quiz/Exam endpoints
    path('quiz/<str:lesson_id>/', quiz_exam_api.get_quiz, name='get-quiz'),
    path('quiz/<str:lesson_id>/submit/', quiz_exam_api.submit_quiz, name='submit-quiz'),
    
    # AI Content Generation endpoints
    path('ai/analyze-lesson/<int:lesson_id>/', ai_content_api.analyze_lesson_content, name='ai-analyze-lesson'),
    path('ai/assign-skills/<int:lesson_id>/', ai_content_api.auto_assign_skills, name='ai-assign-skills'),
    path('ai/generate-visual/<int:lesson_id>/<str:visual_type>/', ai_content_api.generate_visual, name='ai-generate-visual'),
    path('ai/batch-analyze/<uuid:course_id>/', ai_content_api.batch_analyze_course, name='ai-batch-analyze'),
    
    # EnhancedCourseBuilder AI endpoints
    path('ai/generate-content/', ai_content_api.generate_content, name='ai-generate-content'),
    path('ai/generate-quiz/', ai_content_api.generate_quiz, name='ai-generate-quiz'),
    path('ai/generate-simulation/', ai_content_api.generate_simulation, name='ai-generate-simulation'),
    path('ai/generate-assignment/', ai_content_api.generate_assignment, name='ai-generate-assignment'),
    path('ai/generate-exam/', ai_content_api.generate_exam, name='ai-generate-exam'),
    path('ai/extract-skills/', ai_content_api.extract_skills, name='ai-extract-skills'),
    
    # AI Coach endpoint
    path('ai/coach/message/', ai_views.ai_coach_message, name='ai-coach-message'),

    # AI Practice Assignment generator (personalized by sector & role)
    path('ai/generate-practice/', ai_views.ai_generate_practice, name='ai-generate-practice'),

    # Certificate Generation
    path('certificate/generate/<uuid:enrollment_id>/', certificate_api.generate_certificate),
    path('certificate/<uuid:certificate_id>/download/', certificate_api.download_certificate),
    path('certificate/verify/<str:verification_code>/', certificate_api.verify_certificate),
    
    # ===== ADMIN VISUAL CONFIG =====
    path('admin/lessons/<int:lesson_id>/visual/', views.admin_update_lesson_visual, name='admin-lesson-visual'),

    # ===== NEW ADMIN API =====
    path('admin/ai/generate-course/', admin_api.generate_complete_course, name='admin-ai-generate-course'),
    path('admin/skills/', admin_api.list_skills, name='admin-list-skills'),
    path('admin/skills/create/', admin_api.create_skill, name='admin-create-skill'),
    path('admin/skills/<int:skill_id>/', admin_api.manage_skill, name='admin-manage-skill'),
    path('admin/skills/generate/', admin_api.generate_skills_ai, name='admin-generate-skills'),
    path('admin/practice/', admin_api.list_practice_assignments, name='admin-list-practice'),
    path('admin/practice/create/', admin_api.create_practice_assignment, name='admin-create-practice'),
    path('admin/exams/', admin_api.list_exams, name='admin-list-exams'),
    path('admin/exams/create/', admin_api.create_exam, name='admin-create-exam'),
    path('admin/certificates/', admin_api.list_certificates, name='admin-list-certificates'),
    path('admin/certificates/stats/', admin_api.certificate_stats, name='admin-certificate-stats'),
    
    # Test endpoints
    path('test/<uuid:course_id>/', test_view.test_course_detail),
]