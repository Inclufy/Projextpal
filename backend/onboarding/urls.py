from django.urls import path
from .views import (
    AnalyzeCompanyView,
    SuggestSetupView,
    SaveOnboardingView,
    OnboardingStatusView,
)

urlpatterns = [
    path('analyze-company/', AnalyzeCompanyView.as_view(), name='onboarding-analyze'),
    path('suggest-setup/', SuggestSetupView.as_view(), name='onboarding-suggest'),
    path('complete/', SaveOnboardingView.as_view(), name='onboarding-complete'),
    path('status/', OnboardingStatusView.as_view(), name='onboarding-status'),
]
