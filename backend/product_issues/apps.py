from django.apps import AppConfig


class ProductIssuesConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "product_issues"
    verbose_name = "Product Issues (user-feedback + auto-CI)"

    def ready(self) -> None:
        # Register lifecycle email notifications. Signals must be imported
        # AFTER Django finishes app-loading, so this is the canonical place
        # — not at module-import time. See product_issues/signals.py for
        # the three receivers (new issue → admins; status change → reporter
        # + admins; resolved → reporter "your ticket is closed" email).
        from . import signals  # noqa: F401
