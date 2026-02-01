from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import WorkflowDiagram, WorkflowNode, WorkflowEdge


@receiver(post_save, sender=WorkflowDiagram)
def workflow_diagram_saved(sender, instance, created, **kwargs):
    """
    Signal handler for when a WorkflowDiagram is saved
    Can be used for logging, notifications, etc.
    """
    if created:
        print(
            f"New workflow diagram created: {instance.name} for project {instance.project.name}"
        )


@receiver(post_delete, sender=WorkflowDiagram)
def workflow_diagram_deleted(sender, instance, **kwargs):
    """
    Signal handler for when a WorkflowDiagram is deleted
    """
    print(
        f"Workflow diagram deleted: {instance.name} for project {instance.project.name}"
    )


@receiver(post_save, sender=WorkflowNode)
def workflow_node_saved(sender, instance, created, **kwargs):
    """
    Signal handler for when a WorkflowNode is saved
    Updates the workflow's updated_at timestamp
    """
    if instance.workflow:
        instance.workflow.save(update_fields=["updated_at"])


@receiver(post_save, sender=WorkflowEdge)
def workflow_edge_saved(sender, instance, created, **kwargs):
    """
    Signal handler for when a WorkflowEdge is saved
    Updates the workflow's updated_at timestamp
    """
    if instance.workflow:
        instance.workflow.save(update_fields=["updated_at"])
