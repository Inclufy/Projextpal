from django.db import models
from projects.models import Project


class ProgramCharter(models.Model):
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="charters"
    )
    name = models.CharField(max_length=255)
    description = models.TextField(default="No description provided")
    version = models.PositiveIntegerField(default=1)

    project_orchestrator = models.CharField(
        max_length=255, default="Unknown Orchestrator"
    )
    project_manager = models.CharField(max_length=255, default="Unknown Manager")
    goal_objective = models.TextField(default="No goal provided")
    locked = models.BooleanField(default=False)  # Add this line
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-version"]
        unique_together = ["project", "version"]  # Ensure unique versions per project

    def save(self, *args, **kwargs):
        force_new_version = kwargs.pop("force_new_version", False)

        # If editing existing charter and force_new_version is True
        if self.pk and force_new_version:
            # Store old ID for copying related objects
            old_charter_id = self.pk
            # Reset primary key to create new instance
            self.pk = None
            self.id = None
            # Auto-increment version will happen below

            # Save new version first
            self._auto_increment_version()
            super().save(*args, **kwargs)

            # Copy all related objects from old version
            self._copy_related_objects(old_charter_id)
            return

        # Auto-increment version only when creating a new charter
        if not self.pk:
            self._auto_increment_version()

        super().save(*args, **kwargs)

    def _auto_increment_version(self):
        """Helper method to auto-increment version"""
        last_charter = (
            ProgramCharter.objects.filter(project=self.project)
            .order_by("-version")
            .first()
        )
        if last_charter:
            self.version = last_charter.version + 1
        else:
            self.version = 1

    def _copy_related_objects(self, old_charter_id):
        """Copy all related objects from old version to new version"""
        try:
            old_charter = ProgramCharter.objects.get(id=old_charter_id)

            # Import models dynamically to avoid circular import issues
            from django.apps import apps

            # Get model classes dynamically
            ScopeCapability = apps.get_model("charater", "ScopeCapability")
            CriticalInterdependency = apps.get_model(
                "charater", "CriticalInterdependency"
            )
            KeyRisk = apps.get_model("charater", "KeyRisk")
            KeyDeliverable = apps.get_model("charater", "KeyDeliverable")
            Resource = apps.get_model("charater", "Resource")

            # Copy Scopes/Capabilities
            for scope in old_charter.scopes.all():
                ScopeCapability.objects.create(
                    charter=self,
                    capabilities=scope.capabilities,
                    description=scope.description,
                    end_game=scope.end_game,
                )

            # Copy Critical Interdependencies
            for interdep in old_charter.interdependencies.all():
                CriticalInterdependency.objects.create(
                    charter=self, item=interdep.item, description=interdep.description
                )

            # Copy Key Risks
            for risk in old_charter.risks.all():
                KeyRisk.objects.create(
                    charter=self, risk=risk.risk, description=risk.description
                )

            # Copy Key Deliverables
            for deliverable in old_charter.deliverables.all():
                KeyDeliverable.objects.create(
                    charter=self,
                    deliverable=deliverable.deliverable,
                    description=deliverable.description,
                    date=deliverable.date,
                )

            # Copy Resources
            for resource in old_charter.resources.all():
                Resource.objects.create(
                    charter=self,
                    name=resource.name,
                    role=resource.role,
                    required=resource.required,
                    fte=resource.fte,
                )

        except ProgramCharter.DoesNotExist:
            pass  # Old charter doesn't exist, skip copying
        except Exception as e:
            # Log any other errors but don't crash the save process
            import logging

            logger = logging.getLogger(__name__)
            logger.error(f"Error copying related objects: {e}")

    def create_new_version(self, **updated_fields):
        """
        Create a new version with updated fields
        Usage: new_charter = old_charter.create_new_version(name="New Name", description="New Desc")
        """
        # Update fields with provided values
        for field, value in updated_fields.items():
            if hasattr(self, field):
                setattr(self, field, value)
        # Ensure new version is unlocked
        self.locked = False
        # Save as new version
        self.save(force_new_version=True)
        return self

    def get_latest_version(self):
        """Get the latest version of this charter for the same project"""
        return (
            ProgramCharter.objects.filter(project=self.project)
            .order_by("-version")
            .first()
        )

    def get_all_versions(self):
        """Get all versions of this charter for the same project"""
        return ProgramCharter.objects.filter(project=self.project).order_by("-version")

    def __str__(self):
        return f"{self.project} - v{self.version}"


class ScopeCapability(models.Model):
    charter = models.ForeignKey(
        ProgramCharter, on_delete=models.CASCADE, related_name="scopes"
    )
    capabilities = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField()
    end_game = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Scope / Capability"
        verbose_name_plural = "Scopes / Capabilities"

    def __str__(self):
        return f"Scope - {self.charter.name}"


class CriticalInterdependency(models.Model):
    charter = models.ForeignKey(
        ProgramCharter, on_delete=models.CASCADE, related_name="interdependencies"
    )
    item = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField()

    class Meta:
        verbose_name = "Critical Interdependency"
        verbose_name_plural = "Critical Interdependencies"

    def __str__(self):
        return f"Interdependency - {self.charter.name}"


class KeyRisk(models.Model):
    charter = models.ForeignKey(
        ProgramCharter, on_delete=models.CASCADE, related_name="risks"
    )
    risk = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField()

    class Meta:
        verbose_name = "Key Risk"
        verbose_name_plural = "Key Risks"

    def __str__(self):
        return f"Risk - {self.charter.name}"


class KeyDeliverable(models.Model):
    charter = models.ForeignKey(
        ProgramCharter, on_delete=models.CASCADE, related_name="deliverables"
    )
    deliverable = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField()
    date = models.DateField(blank=True, null=True)

    class Meta:
        verbose_name = "Key Deliverable"
        verbose_name_plural = "Key Deliverables"
        ordering = ["date"]

    def __str__(self):
        return f"Deliverable - {self.charter.name}"


class Resource(models.Model):
    charter = models.ForeignKey(
        ProgramCharter, on_delete=models.CASCADE, related_name="resources"
    )
    name = models.CharField(max_length=255)  # e.g. "Sami Loukile"
    role = models.CharField(max_length=255)  # e.g. "Project Manager"
    required = models.CharField(max_length=50)  # e.g. "Yes" or "No"
    fte = models.CharField(max_length=20, blank=True, null=True)  # e.g. "0.2"
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Resource"
        verbose_name_plural = "Resources"

    def __str__(self):
        return f"Resource - {self.name} ({self.role})"


class Dependency(models.Model):
    TASK = "Task"
    APPROVAL = "Approval"
    RESOURCE = "Resource"
    EXTERNAL = "External"

    TYPE_CHOICES = [
        (TASK, "Task"),
        (APPROVAL, "Approval"),
        (RESOURCE, "Resource"),
        (EXTERNAL, "External"),
    ]

    NOT_STARTED = "Not Started"
    IN_PROGRESS = "In Progress"
    APPROVED = "Approved"
    SCHEDULED = "Scheduled"
    PENDING = "Pending"
    COMPLETED = "Completed"

    STATUS_CHOICES = [
        (NOT_STARTED, "Not Started"),
        (IN_PROGRESS, "In Progress"),
        (APPROVED, "Approved"),
        (SCHEDULED, "Scheduled"),
        (PENDING, "Pending"),
        (COMPLETED, "Completed"),
    ]

    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="dependencies"
    )
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    description = models.TextField(blank=True, null=True)
    status = models.CharField(
        max_length=50, choices=STATUS_CHOICES, default=NOT_STARTED
    )

    def __str__(self):
        return f"{self.name} ({self.type}) - Project: {self.project.name}"
