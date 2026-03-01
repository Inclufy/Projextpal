from pathlib import Path

import decouple
import os
from datetime import timedelta

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = decouple.config("SECRET_KEY")

DEBUG = True  # Temporary debug

ALLOWED_HOSTS = ["*"]


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
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django_otp.middleware.OTPMiddleware', 
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
            "hosts": [("127.0.0.1", 6379)],
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

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
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

FRONTEND_URL = decouple.config("FRONTEND_URL")
BASE_URL = decouple.config("BASE_URL")

STRIPE_SECRET_KEY = decouple.config("STRIPE_SECRET_KEY")
STRIPE_PUBLIC_KEY = decouple.config("STRIPE_PUBLIC_KEY")
STRIPE_WEBHOOK_SECRET = decouple.config("STRIPE_WEBHOOK_SECRET")

OPENAI_API_KEY = decouple.config("OPENAI_API_KEY")

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

# Frontend URL for invitation links
FRONTEND_URL = os.getenv('FRONTEND_URL', 'https://projextpal.com')
CORS_ALLOWED_ORIGINS = [
    "http://localhost:8083",
    "http://localhost:5173",
    "http://projextpal.com",
    "https://projextpal.com",
    "http://www.projextpal.com",
    "https://www.projextpal.com",
]
CORS_ALLOW_CREDENTIALS = True
