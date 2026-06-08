from django.apps import AppConfig


class NotificationsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "notifications"

    def ready(self) -> None:
        # Register notification signal receivers (task/meeting-action assignment).
        # Imported here so it runs after app-loading, not at module-import time.
        from . import signals  # noqa: F401
