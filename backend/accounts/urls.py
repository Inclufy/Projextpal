from django.urls import path
from rest_framework.routers import DefaultRouter
from accounts.views import (
    MyTokenObtainPairView,
    LogoutView,
    VerifyEmailView,
    ResendVerificationEmailView,
    ForgotPasswordView,
    ResetPasswordView,
    CurrentUserView,
    PublicAdminRegisterView,
    AdminCreateUserView,
    CompanyUsersView,
    AdminUpdateUserView,
    AdminResetUserPasswordView,
    UpdateOwnProfileView,
    ChangePasswordView,
    CrmApiKeyViewSet,
    ApproveRegistrationView,
    DeactivateUserView,
    ActivateUserView,
    UserFeaturesView,
    SubscriptionManagementView,
    UserSubscriptionDetailView,
    SubscriptionTiersView,
    RegistrationsView,
    AdminStatsView,
    admin_users_list,
    update_subscription_status,  # ← ADD THIS
    CompanyApiKeysView,
)
from .two_factor import (
    Setup2FAView,
    Verify2FASetupView,
    Validate2FAView,
    Disable2FAView,
    Check2FAStatusView,
    LoginWith2FAView,
    RecoveryCodesView,
)
from .biometric import (
    BiometricRegisterOptionsView,
    BiometricRegisterCompleteView,
    BiometricLoginOptionsView,
    BiometricLoginCompleteView,
    BiometricCredentialListView,
    BiometricStatusView,
)
from rest_framework_simplejwt.views import TokenRefreshView
from accounts.views import save_registration_intent

from .audit_views import AuditLogViewSet
from .sessions_views import SessionsView, RevokeSessionView
from .sso_views import sso_config, azure_login, azure_callback

router = DefaultRouter()
router.register(r"crm-api-keys", CrmApiKeyViewSet, basename="crm-api-key")
router.register(r"audit-logs", AuditLogViewSet, basename="audit-log")

from notifications.views import DeviceRegisterView

from accounts.onboarding_views import onboarding_status, start_proeftuin

urlpatterns = [
    path("onboarding/status/", onboarding_status, name="onboarding-status"),
    path("onboarding/start-proeftuin/", start_proeftuin, name="onboarding-start-proeftuin"),
    path("devices/register/", DeviceRegisterView.as_view(), name="device_register"),
    path("login/", MyTokenObtainPairView.as_view(), name="login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("verify-email/<str:token>/", VerifyEmailView.as_view(), name="verify_email"),
    path("resend-verification/", ResendVerificationEmailView.as_view(), name="resend_verification"),
    path("approve-registration/<int:registration_id>/", ApproveRegistrationView.as_view(), name="approve_registration"),
    path("deactivate-user/<int:registration_id>/", DeactivateUserView.as_view(), name="deactivate_user"),
    path("activate-user/<int:registration_id>/", ActivateUserView.as_view(), name="activate_user"),
    path("user-features/", UserFeaturesView.as_view(), name="user_features"),
    path("forgot-password/", ForgotPasswordView.as_view(), name="forgot_password"),
    path("reset-password/<str:token>/", ResetPasswordView.as_view(), name="reset_password"),
    path("user/", CurrentUserView.as_view(), name="current_user"),
    path("company-users/", CompanyUsersView.as_view(), name="company_users"),
    path("company-users/members/", CompanyUsersView.as_view(), name="company_users_members"),
    path("user/update/", UpdateOwnProfileView.as_view(), name="update_own_profile"),
    path("user/change-password/", ChangePasswordView.as_view(), name="change_password"),
    path("register/", PublicAdminRegisterView.as_view(), name="register"),
    path("admin/create-user/", AdminCreateUserView.as_view(), name="admin_create_user"),
    path("admin/users/<int:pk>/", AdminUpdateUserView.as_view(), name="admin_update_user"),
    path("admin/users/<int:pk>/reset-password/", AdminResetUserPasswordView.as_view(), name="admin_reset_user_password"),
    path('2fa/setup/', Setup2FAView.as_view(), name='2fa-setup'),
    path('2fa/verify-setup/', Verify2FASetupView.as_view(), name='2fa-verify-setup'),
    path('2fa/validate/', Validate2FAView.as_view(), name='2fa-validate'),
    path('2fa/disable/', Disable2FAView.as_view(), name='2fa-disable'),
    path('2fa/status/', Check2FAStatusView.as_view(), name='2fa-status'),
    path('2fa/recovery-codes/', RecoveryCodesView.as_view(), name='2fa-recovery-codes'),
    path('sessions/', SessionsView.as_view(), name='sessions'),
    path('sessions/revoke/', RevokeSessionView.as_view(), name='sessions-revoke'),
    # Azure / Entra ID SSO (inert unless AZURE_SSO_* env vars are configured)
    path('sso/config/', sso_config, name='sso-config'),
    path('sso/azure/login/', azure_login, name='sso-azure-login'),
    path('sso/azure/callback/', azure_callback, name='sso-azure-callback'),
    # Canonical aliases used by the admin portal & mobile clients
    path('2fa/enable/', Setup2FAView.as_view(), name='2fa-enable'),
    path('2fa/qr/', Setup2FAView.as_view(), name='2fa-qr'),
    path('2fa/verify/', Verify2FASetupView.as_view(), name='2fa-verify'),
    path('2fa/backup-codes/', Setup2FAView.as_view(), name='2fa-backup-codes'),
    path('login-2fa/', LoginWith2FAView.as_view(), name='login-2fa'),

    # Biometric Authentication (Face ID / Fingerprint)
    path('biometric/register/options/', BiometricRegisterOptionsView.as_view(), name='biometric-register-options'),
    path('biometric/register/complete/', BiometricRegisterCompleteView.as_view(), name='biometric-register-complete'),
    path('biometric/login/options/', BiometricLoginOptionsView.as_view(), name='biometric-login-options'),
    path('biometric/login/complete/', BiometricLoginCompleteView.as_view(), name='biometric-login-complete'),
    path('biometric/credentials/', BiometricCredentialListView.as_view(), name='biometric-credentials'),
    path('biometric/status/', BiometricStatusView.as_view(), name='biometric-status'),
    path('registration-intent/', save_registration_intent, name='registration-intent'),
    
    # Admin endpoints
    path("admin/stats/", AdminStatsView.as_view(), name="admin_stats"),
    path("registrations/", RegistrationsView.as_view(), name="registrations"),
    path("admin/users/", admin_users_list, name="admin_users"),
    
    # Subscription Management
    path("subscriptions/", SubscriptionManagementView.as_view(), name="subscriptions"),
    path("subscriptions/user/<int:user_id>/", UserSubscriptionDetailView.as_view(), name="user_subscription"),
    path("subscriptions/tiers/", SubscriptionTiersView.as_view(), name="subscription_tiers"),
    
    # Subscription Status Update (NEW)
    path("registrations/<int:user_id>/subscription/",
         update_subscription_status,
         name="update_subscription_status"),  # ← ADD THIS

    # Company API Keys (client-facing, admin roles)
    path("company-api-keys/", CompanyApiKeysView.as_view(), name="company_api_keys"),
    path("company-api-keys/<str:provider>/", CompanyApiKeysView.as_view(), name="company_api_key_detail"),
]

# GDPR endpoints (Art. 15 + Art. 17) — see accounts/gdpr.py for design notes.
from .gdpr import DataExportView, AccountDeleteView  # noqa: E402
urlpatterns += [
    path("me/export/", DataExportView.as_view(), name="gdpr_data_export"),
    path("me/delete/", AccountDeleteView.as_view(), name="gdpr_account_delete"),
]

urlpatterns += router.urls
# Team Invitations
from .invitation_views import CreateInvitationView, AcceptInvitationView, ListInvitationsView
urlpatterns += [
    path("invitations/", ListInvitationsView.as_view(), name="list_invitations"),
    path("invitations/create/", CreateInvitationView.as_view(), name="create_invitation"),
    path("invitations/accept/<str:token>/", AcceptInvitationView.as_view(), name="accept_invitation"),
]
