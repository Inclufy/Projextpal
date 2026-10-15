from django.apps import AppConfig


class ProjectsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "projects"

    def ready(self):
        import projects.signals  # noqa: F401
        # Sprint 9 S9-01 — budget-overschrijding e-mails.
        # Importing registers the post_save(TimeEntry) receiver.
        import projects.budget_email  # noqa: F401
