from django.apps import AppConfig


class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounts'

    def ready(self):
        # Sprint 6: auto-create TenantAIFeatureFlags on Company create.
        try:
            from . import signals  # noqa: F401
        except Exception:
            # Signals import failure must not break app startup; the helper
            # ``TenantAIFeatureFlags.is_enabled`` fails open anyway.
            pass
