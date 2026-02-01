from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator


class WorkflowDiagram(models.Model):
    """
    Stores a workflow diagram for a project.
    Each project can have one workflow diagram with nodes and edges.
    """

    project = models.OneToOneField(
        "projects.Project",
        on_delete=models.CASCADE,
        related_name="workflow_diagram",
        help_text="The project this workflow diagram belongs to",
    )
    name = models.CharField(
        max_length=255,
        default="Project Workflow",
        help_text="Name of the workflow diagram",
    )
    description = models.TextField(blank=True, help_text="Description of the workflow")
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_workflows",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]
        verbose_name = "Workflow Diagram"
        verbose_name_plural = "Workflow Diagrams"

    def __str__(self):
        return f"{self.name} - {self.project.name}"


class WorkflowNode(models.Model):
    """
    Represents a single node in the workflow diagram.
    Stores position, type, label, and styling information.
    """

    NODE_TYPE_CHOICES = [
        ("rectangle", "Rectangle"),
        ("snipRectangle", "Snip Rectangle"),
        ("roundedRectangle", "Rounded Rectangle"),
        ("diamond", "Diamond"),
        ("circle", "Circle"),
        ("parallelogram", "Parallelogram"),
        ("pentagon", "Pentagon"),
        ("hexagon", "Hexagon"),
        ("octagon", "Octagon"),
        ("decagon", "Decagon"),
        ("triangle", "Triangle"),
        ("equilateralTriangle", "Equilateral Triangle"),
        ("star", "5-Point Star"),
        ("sixStar", "6-Point Star"),
        ("fourStar", "4-Point Star"),
        ("sixteenStar", "16-Point Star"),
        ("thirtyTwoStar", "32-Point Star"),
        ("noSymbol", "No Symbol"),
        ("can", "Can/Cylinder"),
        ("arrow", "Arrow"),
        ("cylinder", "Database/Cylinder"),
        ("document", "Document"),
    ]

    workflow = models.ForeignKey(
        WorkflowDiagram, on_delete=models.CASCADE, related_name="nodes"
    )
    node_id = models.CharField(
        max_length=100, help_text="Unique identifier for this node within the workflow"
    )
    node_type = models.CharField(
        max_length=50, choices=NODE_TYPE_CHOICES, default="rectangle"
    )
    label = models.CharField(
        max_length=255, help_text="Text label displayed on the node"
    )
    position_x = models.FloatField(default=0, help_text="X coordinate position")
    position_y = models.FloatField(default=0, help_text="Y coordinate position")
    color = models.CharField(
        max_length=50, default="#1e40af", help_text="Background color (hex code)"
    )
    text_color = models.CharField(
        max_length=50, default="#ffffff", help_text="Text color (hex code)"
    )
    font_size = models.IntegerField(
        default=12, validators=[MinValueValidator(8)], help_text="Font size in pixels"
    )
    order_index = models.IntegerField(default=0, help_text="Order of creation/display")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["workflow", "order_index"]
        unique_together = ["workflow", "node_id"]
        verbose_name = "Workflow Node"
        verbose_name_plural = "Workflow Nodes"

    def __str__(self):
        return f"{self.label} ({self.node_type})"


class WorkflowEdge(models.Model):
    """
    Represents a connection/edge between two nodes in the workflow.
    """

    MARKER_TYPE_CHOICES = [
        ("arrowclosed", "Arrow Closed"),
        ("arrow", "Arrow Open"),
    ]

    workflow = models.ForeignKey(
        WorkflowDiagram, on_delete=models.CASCADE, related_name="edges"
    )
    edge_id = models.CharField(
        max_length=100, help_text="Unique identifier for this edge within the workflow"
    )
    source_node_id = models.CharField(max_length=100, help_text="ID of the source node")
    target_node_id = models.CharField(max_length=100, help_text="ID of the target node")
    source_handle = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text="Source handle position (e.g., 'bottom', 'right')",
    )
    target_handle = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text="Target handle position (e.g., 'top', 'left')",
    )
    label = models.CharField(
        max_length=100, blank=True, help_text="Label text on the edge"
    )
    animated = models.BooleanField(
        default=False, help_text="Whether the edge should be animated"
    )
    stroke_color = models.CharField(
        max_length=50, default="#374151", help_text="Edge stroke color (hex code)"
    )
    stroke_width = models.IntegerField(
        default=2,
        validators=[MinValueValidator(1)],
        help_text="Edge stroke width in pixels",
    )
    marker_type = models.CharField(
        max_length=50, choices=MARKER_TYPE_CHOICES, default="arrowclosed"
    )
    marker_color = models.CharField(
        max_length=50, default="#374151", help_text="Marker/arrow color (hex code)"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["workflow", "created_at"]
        unique_together = ["workflow", "edge_id"]
        verbose_name = "Workflow Edge"
        verbose_name_plural = "Workflow Edges"

    def __str__(self):
        label_str = f" ({self.label})" if self.label else ""
        return f"{self.source_node_id} → {self.target_node_id}{label_str}"
