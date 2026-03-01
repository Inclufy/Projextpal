from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from admin_portal.views import CurrentUserView
from subscriptions.public_api import PublicPlansView
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("health/", include("health.urls")),
    
    # Auth
    path("api/v1/auth/", include("accounts.urls")),
    
    # Specific app paths - EACH NEEDS A UNIQUE PREFIX
    path("api/v1/projects/", include("projects.urls")),
    path("api/v1/programs/", include("programs.urls")),
    path("api/v1/governance/", include("governance.urls")),
    path("api/v1/execution/", include("execution.urls")),
    path("api/v1/sixsigma/", include("sixsigma.urls")),
    
    # ✅ MOVE ACADEMY HERE - BEFORE the broad api/v1/ patterns!
    path("api/v1/academy/", include("academy.urls")),
    
    path("api/v1/", include("prince2.urls")),
    path("api/v1/", include("scrum.urls")),
    path("api/v1/", include("kanban.urls")),
    
    # Other specific paths
    path("api/v1/charter/", include("charater.urls")),
    path("api/v1/subscriptions/", include("subscriptions.urls")),
    path("api/v1/surveys/", include("surveys.urls")),
    path("api/v1/postproject/", include("postproject.urls")),
    path("api/v1/communication/", include("communication.urls")),
    path("api/v1/newsletters/", include("newsletters.urls")),
    path("api/v1/bot/", include("bot.urls")),
    path("api/v1/workflow/", include("workflow.urls")),
    path("api/v1/admin/", include("admin_portal.urls")),
    
    # Methodologies
    path("api/v1/", include("agile.urls")),
    path("api/v1/", include("waterfall.urls")),

    # New methodology modules
    path("api/v1/lss-green/", include("lss_green.urls")),
    path("api/v1/lss-black/", include("lss_black.urls")),
    path("api/v1/hybrid/", include("hybrid.urls")),
    path("api/v1/safe/", include("safe.urls")),
    path("api/v1/msp/", include("msp.urls")),
    path("api/v1/pmi/", include("pmi.urls")),
    path("api/v1/p2-programme/", include("p2_programme.urls")),
    path("api/v1/hybrid-programme/", include("hybrid_programme.urls")),
    path("api/v1/cross-methodology/", include("cross_methodology.urls")),

    # Single endpoint views
    path("api/v1/users/me/", CurrentUserView.as_view(), name="current-user"),
    path("api/v1/public/plans/", PublicPlansView.as_view(), name="public-plans"),

    # API Documentation
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
# Public invitation acceptance (no auth required)
from accounts.invitation_views import AcceptInvitationView
urlpatterns += [
    path("invite/<str:token>/", AcceptInvitationView.as_view(), name="public_accept_invitation"),
]
