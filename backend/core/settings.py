from pathlib import Path
import decouple
import os
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = decouple.config("SECRET_KEY")
DEBUG = True
ALLOWED_HOSTS = ["*"]

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
    "deployment",
    "newsletters",
    "bot",
    "workflow",
    "programs",
    "sixsigma",
    "prince2",
    'scrum',
    'kanban',
    'agile',
    'waterfall',
    'admin_portal',
    'django_otp',
    'django_otp.plugins.otp_totp',
    'academy',
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

CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

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

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

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

SPECTACULAR_SETTINGS = {
    'TITLE': 'ProjExtPal API',
    'DESCRIPTION': 'Project Management API',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'COMPONENT_SPLIT_REQUEST': True,
}

MOBILE_DEEP_LINK = "projextpal://"
