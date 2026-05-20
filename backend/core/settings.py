from pathlib import Path

import decouple
import os
from datetime import timedelta

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = decouple.config("SECRET_KEY")

DEBUG = decouple.config("DEBUG", default=False, cast=bool)

ALLOWED_HOSTS = decouple.config(
    "ALLOWED_HOSTS",
    default="localhost,127.0.0.1",
    cast=lambda v: [s.strip() for s in v.split(",")]
)


# =============================================================================
# Sentry (backend error tracking)
# =============================================================================
# Initialized at import time so unhandled exceptions during startup
# (e.g. broken migrations, settings errors) are also captured. Gated on
# SENTRY_DSN env var so local dev / CI without a DSN remain silent.
SENTRY_DSN = decouple.config("SENTRY_DSN", default="")
if SENTRY_DSN:
    import sentry_sdk
    from sentry_sdk.integrations.django import DjangoIntegration
    from sentry_sdk.integrations.logging import LoggingIntegration

    sentry_sdk.init(
        dsn=SENTRY_DSN,
        integrations=[
            DjangoIntegration(
                transaction_style="url",
                middleware_spans=True,
                signals_spans=True,
            ),
            LoggingIntegration(level=None, event_level=None),
        ],
        # Send 10% of traces in prod, all in dev. Tune via env var.
        traces_sample_rate=decouple.config(
            "SENTRY_TRACES_SAMPLE_RATE",
            default=(1.0 if DEBUG else 0.1),
            cast=float,
        ),
        # Tag releases for source-map / commit linking.
        release=decouple.config("SENTRY_RELEASE", default=None),
        environment=decouple.config(
            "SENTRY_ENVIRONMENT",
            default=("development" if DEBUG else "production"),
        ),
        # Default behavior: send PII (req.user.id etc) — disable if user
        # objects can contain sensitive PII you don't want shipped to Sentry.
        send_default_pii=False,
    )


# Application definition

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "corsheaders",
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "django_filters",
    "drf_spectacular",
    "channels",
    "health",
    "accounts",
    "finance",
    "projects",
    "subscriptions",
    "invoices",
    "execution",
    "charater",
    "surveys",
    "postproject",
    "communication",
    "newsletters",
    "bot",
    "workflow",
    "programs",
    "governance",
    "sixsigma",  # NEW: Lean Six Sigma DMAIC tools
    "prince2",
    'scrum',
    'kanban',
    'agile',
    'waterfall',
    'admin_portal',
    'django_otp',
    'django_otp.plugins.otp_totp',
    'academy',
    'deployment',
    'lss_green',
    'lss_black',
    'hybrid',
    'safe',
    'msp',
    'pmi',
    'p2_programme',
    'hybrid_programme',
    'cross_methodology',
    'onboarding',
    'integrations',
    'product_issues',  # NEW: user-feedback + auto-CI issue capture
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    'django_otp.middleware.OTPMiddleware',
    "core.middleware.performance.PerformanceLoggingMiddleware",
]

ROOT_URLCONF = "core.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [os.path.join(BASE_DIR, "templates")],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "core.wsgi.application"
ASGI_APPLICATION = "core.asgi.application"

# Channels configuration
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [{"address": (os.environ.get("REDIS_HOST", "redis"), int(os.environ.get("REDIS_PORT", 6379))), "password": os.environ.get("REDIS_PASSWORD")}],
        },
    },
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(days=1),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "BLACKLIST_AFTER_ROTATION": True,
}


AUTH_USER_MODEL = "accounts.CustomUser"
LOGIN_FIELD = "email"

AUTHENTICATION_BACKENDS = [
    "accounts.backends.EmailBackend",
]

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    # Per-view throttling (e.g. forgot-password) uses ScopedRateThrottle.
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.ScopedRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "forgot_password": "3/10min",
        # Public landing-page chatbot — defense-in-depth with Cloudflare WAF
        # rate-limit. Caps anonymous OpenAI calls at 20/hour per IP at the
        # Django layer (Cloudflare is plan-tier limited to 10s windows).
        "public_chat": "20/hour",
    },
}


DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": decouple.config("POSTGRES_DB", default="projextpal"),
        "USER": decouple.config("POSTGRES_USER", default="projextpal"),
        "PASSWORD": decouple.config("POSTGRES_PASSWORD", default="projextpal_password_2024"),
        "HOST": decouple.config("POSTGRES_HOST", default="localhost"),
        "PORT": decouple.config("POSTGRES_PORT", default="5432"),
    }
}


# Password validation
# https://docs.djangoproject.com/en/5.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.2/topics/i18n/

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True

STATIC_URL = "static/"
STATIC_ROOT = os.path.join(BASE_DIR, "static")
MEDIA_URL = "/media/"
MEDIA_ROOT = os.path.join(BASE_DIR, "media")

APPEND_SLASH = False

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

EMAIL_BACKEND = decouple.config("EMAIL_BACKEND")
EMAIL_HOST = decouple.config("EMAIL_HOST")
EMAIL_PORT = int(decouple.config("EMAIL_PORT"))
EMAIL_USE_TLS = decouple.config("EMAIL_USE_TLS", default=True, cast=bool)
EMAIL_HOST_USER = decouple.config("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = decouple.config("EMAIL_HOST_PASSWORD")
DEFAULT_FROM_EMAIL = decouple.config("DEFAULT_FROM_EMAIL")

# Comma-separated list of email addresses to notify when ProductIssues are
# created, transition status, or get resolved. See product_issues/signals.py.
# Falls back to sami@inclufy.com if unset.
PRODUCT_ISSUE_ADMIN_NOTIFY_EMAILS = decouple.config(
    "PRODUCT_ISSUE_ADMIN_NOTIFY_EMAILS",
    default="sami@inclufy.com",
)

FRONTEND_URL = decouple.config("FRONTEND_URL")
BASE_URL = decouple.config("BASE_URL")

STRIPE_SECRET_KEY = decouple.config("STRIPE_SECRET_KEY")
STRIPE_PUBLIC_KEY = decouple.config("STRIPE_PUBLIC_KEY")
STRIPE_WEBHOOK_SECRET = decouple.config("STRIPE_WEBHOOK_SECRET")

OPENAI_API_KEY = decouple.config("OPENAI_API_KEY")
ANTHROPIC_API_KEY = decouple.config("ANTHROPIC_API_KEY", default="")
FIELD_ENCRYPTION_KEY = decouple.config("FIELD_ENCRYPTION_KEY", default="")
FIELD_ENCRYPTION_KEYS = decouple.config("FIELD_ENCRYPTION_KEYS", default="")

# drf-spectacular settings
SPECTACULAR_SETTINGS = {
    'TITLE': 'ProjExpal API',
    'DESCRIPTION': 'Project Management API',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'COMPONENT_SPLIT_REQUEST': True,
    'SCHEMA_PATH_PREFIX': '/api/v1/',
}

# ============================================================
# CLOUD STORAGE BACKEND CONFIGURATION
# ============================================================
# Default: local file storage. When a cloud provider is enabled via
# admin settings, the storage backend can be switched dynamically.
# Supported via django-storages: AWS S3, Azure Blob, GCS, DigitalOcean Spaces

# AWS S3 settings (used when AWS storage is enabled)
AWS_ACCESS_KEY_ID = decouple.config('AWS_ACCESS_KEY_ID', default='')
AWS_SECRET_ACCESS_KEY = decouple.config('AWS_SECRET_ACCESS_KEY', default='')
AWS_STORAGE_BUCKET_NAME = decouple.config('AWS_STORAGE_BUCKET_NAME', default='')
AWS_S3_REGION_NAME = decouple.config('AWS_S3_REGION_NAME', default='eu-west-1')
AWS_S3_CUSTOM_DOMAIN = decouple.config('AWS_S3_CUSTOM_DOMAIN', default='')
AWS_S3_FILE_OVERWRITE = False
AWS_DEFAULT_ACL = None
AWS_QUERYSTRING_AUTH = True

# Azure Blob Storage settings (used when Azure storage is enabled)
AZURE_ACCOUNT_NAME = decouple.config('AZURE_ACCOUNT_NAME', default='')
AZURE_ACCOUNT_KEY = decouple.config('AZURE_ACCOUNT_KEY', default='')
AZURE_CONTAINER = decouple.config('AZURE_CONTAINER', default='media')

# GCP Cloud Storage settings (used when GCP storage is enabled)
GS_BUCKET_NAME = decouple.config('GS_BUCKET_NAME', default='')
GS_PROJECT_ID = decouple.config('GS_PROJECT_ID', default='')

# DigitalOcean Spaces settings (S3-compatible)
DO_SPACES_ACCESS_KEY_ID = decouple.config('DO_SPACES_ACCESS_KEY_ID', default='')
DO_SPACES_SECRET_ACCESS_KEY = decouple.config('DO_SPACES_SECRET_ACCESS_KEY', default='')
DO_SPACES_BUCKET_NAME = decouple.config('DO_SPACES_BUCKET_NAME', default='')
DO_SPACES_REGION = decouple.config('DO_SPACES_REGION', default='ams3')
DO_SPACES_ENDPOINT_URL = decouple.config('DO_SPACES_ENDPOINT_URL', default='')

# Storage backend selection (default = local filesystem)
# Can be overridden to 'storages.backends.s3boto3.S3Boto3Storage',
# 'storages.backends.azure_storage.AzureStorage',
# 'storages.backends.gcloud.GoogleCloudStorage'
CLOUD_STORAGE_BACKEND = decouple.config('CLOUD_STORAGE_BACKEND', default='')
if CLOUD_STORAGE_BACKEND:
    DEFAULT_FILE_STORAGE = CLOUD_STORAGE_BACKEND

# AWS SES email backend (used when AWS email is enabled)
AWS_SES_REGION_NAME = decouple.config('AWS_SES_REGION_NAME', default='eu-west-1')
AWS_SES_REGION_ENDPOINT = decouple.config(
    'AWS_SES_REGION_ENDPOINT',
    default=f'email.{decouple.config("AWS_SES_REGION_NAME", default="eu-west-1")}.amazonaws.com'
)

MOBILE_DEEP_LINK = "projextpal://"
# Use SQLite for testing (faster and no Docker needed)
import sys
if 'test' in sys.argv or 'pytest' in sys.modules:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': ':memory:',
        }
    }

# CORS allowed origins for frontend
# Note: FRONTEND_URL is already set via decouple.config() above
# Production hosts (https only in prod via Cloudflare's Always-Use-HTTPS):
CORS_ALLOWED_ORIGINS = [
    "https://projextpal.com",
    "https://www.projextpal.com",
    "https://inclufy.co",
    "https://app.inclufy.co",
]

# Development hosts (localhost dev servers + insecure http fallbacks) only when DEBUG=True.
# Production must never accept localhost origins — they don't exist there and
# would only be exploitable in attacks that forge the Origin header.
if DEBUG:
    CORS_ALLOWED_ORIGINS += [
        "http://localhost:8083",
        "http://localhost:5173",
        "http://projextpal.com",
        "http://www.projextpal.com",
        "http://inclufy.co",
        "http://app.inclufy.co",
    ]

CORS_ALLOW_CREDENTIALS = True

# Logging configuration
LOG_DIR = os.path.join(BASE_DIR, "logs")
os.makedirs(LOG_DIR, exist_ok=True)

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "%(asctime)s [%(levelname)s] %(name)s (%(module)s:%(lineno)d): %(message)s",
            "datefmt": "%Y-%m-%d %H:%M:%S",
        },
        "json": {
            "format": '{"time":"%(asctime)s","level":"%(levelname)s","logger":"%(name)s","module":"%(module)s","line":%(lineno)d,"message":"%(message)s"}',
            "datefmt": "%Y-%m-%dT%H:%M:%S",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "verbose",
        },
        "app_file": {
            "class": "logging.handlers.RotatingFileHandler",
            "filename": os.path.join(LOG_DIR, "application.log"),
            "maxBytes": 10 * 1024 * 1024,  # 10MB
            "backupCount": 5,
            "formatter": "json",
        },
        "error_file": {
            "class": "logging.handlers.RotatingFileHandler",
            "filename": os.path.join(LOG_DIR, "error.log"),
            "maxBytes": 10 * 1024 * 1024,
            "backupCount": 5,
            "formatter": "json",
            "level": "ERROR",
        },
        "security_file": {
            "class": "logging.handlers.RotatingFileHandler",
            "filename": os.path.join(LOG_DIR, "security.log"),
            "maxBytes": 10 * 1024 * 1024,
            "backupCount": 5,
            "formatter": "json",
        },
        "performance_file": {
            "class": "logging.handlers.RotatingFileHandler",
            "filename": os.path.join(LOG_DIR, "performance.log"),
            "maxBytes": 10 * 1024 * 1024,
            "backupCount": 5,
            "formatter": "json",
        },
    },
    "loggers": {
        "django": {
            "handlers": ["console", "app_file"],
            "level": "INFO",
            "propagate": False,
        },
        "django.request": {
            "handlers": ["console", "error_file"],
            "level": "ERROR",
            "propagate": False,
        },
        "django.security": {
            "handlers": ["console", "security_file"],
            "level": "WARNING",
            "propagate": False,
        },
        "core.middleware.performance": {
            "handlers": ["performance_file"],
            "level": "INFO",
            "propagate": False,
        },
        "bot": {
            "handlers": ["console", "app_file"],
            "level": "INFO",
            "propagate": False,
        },
        "subscriptions": {
            "handlers": ["console", "app_file", "error_file"],
            "level": "INFO",
            "propagate": False,
        },
    },
    "root": {
        "handlers": ["console", "app_file", "error_file"],
        "level": "INFO",
    },
}


# =============================================================================
# Production security hardening
# =============================================================================
# These settings address Django's `manage.py check --deploy` warnings
# (security.W004 / W008 / W012 / W016). They are gated behind DEBUG=False
# so local dev (HTTP, no TLS) keeps working.
#
# W009 (weak SECRET_KEY) is enforced at startup below — in production we
# fail fast rather than booting with a placeholder key.
if not DEBUG:
    # W004 — HTTP Strict Transport Security: 1 year, with subdomains + preload.
    # Override with SECURE_HSTS_SECONDS=0 in env if you need to roll back.
    SECURE_HSTS_SECONDS = decouple.config("SECURE_HSTS_SECONDS", default=31536000, cast=int)
    SECURE_HSTS_INCLUDE_SUBDOMAINS = decouple.config(
        "SECURE_HSTS_INCLUDE_SUBDOMAINS", default=True, cast=bool
    )
    SECURE_HSTS_PRELOAD = decouple.config("SECURE_HSTS_PRELOAD", default=True, cast=bool)

    # W008 — redirect all HTTP to HTTPS at the Django layer (belt-and-suspenders;
    # the load balancer should also do this).
    SECURE_SSL_REDIRECT = decouple.config("SECURE_SSL_REDIRECT", default=True, cast=bool)
    # When behind a reverse proxy (Caddy, nginx, ALB) that terminates TLS,
    # trust the X-Forwarded-Proto header so SECURE_SSL_REDIRECT works correctly.
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

    # W012 / W016 — cookies only over HTTPS.
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True

    # Hardening defaults that the deploy-check doesn't flag but are best practice.
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_REFERRER_POLICY = "same-origin"
    X_FRAME_OPTIONS = "DENY"

    # W009 — fail fast on weak keys in production. Django's check uses the same
    # rule; surfacing it as an ImproperlyConfigured prevents accidental
    # deploys with a dev placeholder.
    from django.core.exceptions import ImproperlyConfigured

    if (
        SECRET_KEY.startswith("django-insecure-")
        or len(SECRET_KEY) < 50
        or len(set(SECRET_KEY)) < 5
    ):
        raise ImproperlyConfigured(
            "SECRET_KEY is weak (django-insecure- prefix, <50 chars, or <5 "
            "unique chars). Generate a strong key: "
            "`python -c 'from django.core.management.utils import "
            "get_random_secret_key; print(get_random_secret_key())'`"
        )


# =============================================================================
# Inclufy Finance integration
# =============================================================================
# When configured, ProjeXtPal can:
#   - PULL suppliers/invoices/bookings from Inclufy Finance via Supabase REST
#     (management command: `python manage.py sync_inclufy_finance`)
#   - RECEIVE pushes from Inclufy Finance via the webhook endpoint
#     (POST /api/v1/finance/webhooks/inclufy/ — auth via X-Inclufy-Signature
#     HMAC or X-Inclufy-Webhook-Token shared secret)
INCLUFY_FINANCE_SUPABASE_URL = os.environ.get("INCLUFY_FINANCE_SUPABASE_URL", "")
INCLUFY_FINANCE_SUPABASE_SERVICE_KEY = os.environ.get("INCLUFY_FINANCE_SUPABASE_SERVICE_KEY", "")
# Shared secret used by Inclufy Finance to sign webhook payloads.
INCLUFY_FINANCE_WEBHOOK_SECRET = os.environ.get("INCLUFY_FINANCE_WEBHOOK_SECRET", "")
# Optional: when ProjeXtPal pushes project_code updates back to Finance.
INCLUFY_FINANCE_PUSH_ENABLED = (
    os.environ.get("INCLUFY_FINANCE_PUSH_ENABLED", "false").lower() == "true"
)
