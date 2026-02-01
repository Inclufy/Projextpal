from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from accounts.views import (
    MyTokenObtainPairView,
    LogoutView,
    VerifyEmailView,
    ForgotPasswordView,
    ResetPasswordView,
    CurrentUserView,
    PublicAdminRegisterView,
    AdminCreateUserView,
    CompanyUsersView,
    AdminUpdateUserView,
    UpdateOwnProfileView,
    ChangePasswordView,
    CrmApiKeyViewSet,
    CompanyListView,
    CompanyDetailView,
    CompanyUsersListView,
    AdminStatsView,
    PlanViewSet,
    upload_profile_image,  # ← Function-based view
)

from .two_factor import (
    Setup2FAView, 
    Verify2FASetupView, 
    Validate2FAView, 
    Disable2FAView,
    Check2FAStatusView,
    LoginWith2FAView,
)

# Router for viewsets
router = DefaultRouter()
router.register(r"crm-api-keys", CrmApiKeyViewSet, basename="crm-api-key")
router.register(r"plans", PlanViewSet, basename="plan")

urlpatterns = [
    # Authentication
    path("login/", MyTokenObtainPairView.as_view(), name="login"),
    path("login-2fa/", LoginWith2FAView.as_view(), name="login-2fa"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("logout/", LogoutView.as_view(), name="logout"),
    
    # Registration & Email Verification
    path("register/", PublicAdminRegisterView.as_view(), name="register"),
    path("verify-email/<str:token>/", VerifyEmailView.as_view(), name="verify_email"),
    
    # Password Management
    path("forgot-password/", ForgotPasswordView.as_view(), name="forgot_password"),
    path("reset-password/<str:token>/", ResetPasswordView.as_view(), name="reset_password"),
    path("user/change-password/", ChangePasswordView.as_view(), name="change_password"),
    
    # User Profile
    path("user/", CurrentUserView.as_view(), name="current_user"),
    path("user/update/", UpdateOwnProfileView.as_view(), name="update_own_profile"),
    path("user/image/", upload_profile_image, name="upload-profile-image"),
    
    # 2FA
    path("2fa/setup/", Setup2FAView.as_view(), name="2fa-setup"),
    path("2fa/verify-setup/", Verify2FASetupView.as_view(), name="2fa-verify-setup"),
    path("2fa/validate/", Validate2FAView.as_view(), name="2fa-validate"),
    path("2fa/disable/", Disable2FAView.as_view(), name="2fa-disable"),
    path("2fa/status/", Check2FAStatusView.as_view(), name="2fa-status"),
    
    # Company Users
    path("company-users/", CompanyUsersView.as_view(), name="company_users"),
    
    # Admin - User Management
    path("admin/create-user/", AdminCreateUserView.as_view(), name="admin_create_user"),
    path("admin/users/<int:pk>/", AdminUpdateUserView.as_view(), name="admin_update_user"),
    
    # Admin - Company/Tenant Management
    path("admin/stats/", AdminStatsView.as_view(), name="admin_stats"),
    path("companies/", CompanyListView.as_view(), name="company_list"),
    path("companies/<int:pk>/", CompanyDetailView.as_view(), name="company_detail"),
    path("companies/<int:pk>/users/", CompanyUsersListView.as_view(), name="company_users_list"),
]

# Add router URLs
urlpatterns += router.urls