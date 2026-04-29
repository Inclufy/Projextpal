from django.apps import AppConfig


class FinanceConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "finance"
    verbose_name = "Finance — vendors, invoices, cost tracking"

    def ready(self):
        # Wire up the Inclufy Finance push-back signals lazily (avoid
        # circular imports at app-registry load time).
        from . import signals
        signals._connect_signals()
