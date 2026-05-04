from django.apps import AppConfig


class ProductIssuesConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "product_issues"
    verbose_name = "Product Issues (user-feedback + auto-CI)"
