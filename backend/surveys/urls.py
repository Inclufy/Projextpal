# surveys/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SurveyViewSet, 
    QuestionViewSet, 
    ArchivedLessonViewSet,
    SurveyResponseViewSet,
    CompanyUsersAPIView
)

router = DefaultRouter()
router.register(r"survey", SurveyViewSet, basename="survey")
router.register(r"questions", QuestionViewSet, basename="questions")
router.register(r"archived-lessons", ArchivedLessonViewSet, basename="archived-lessons")
router.register(r"responses", SurveyResponseViewSet, basename="survey-responses")

urlpatterns = [
    path("", include(router.urls)),
    
    # Additional endpoints
    path("company-users/", CompanyUsersAPIView.as_view(), name="company-users"),
    
    
]
# AI Survey endpoints
from .ai_views import generate_survey_for_project, generate_survey_generic, analyze_survey, generate_questionnaire

urlpatterns += [
    path('ai/generate/<int:project_id>/', generate_survey_for_project, name='ai-generate-survey'),
    path('ai/generate/', generate_survey_generic, name='ai-generate-survey-generic'),
    path('ai/analyze/<int:survey_id>/', analyze_survey, name='ai-analyze-survey'),
    path('ai/questionnaire/', generate_questionnaire, name='ai-generate-questionnaire'),
]
