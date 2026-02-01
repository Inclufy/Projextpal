from rest_framework import serializers
from .models import WorkflowDiagram, WorkflowNode, WorkflowEdge


class WorkflowNodeSerializer(serializers.ModelSerializer):
    """Serializer for workflow nodes"""

    # Read-only fields for frontend compatibility
    id = serializers.CharField(source="node_id", read_only=False)
    type = serializers.CharField(source="node_type", read_only=False)
    position = serializers.SerializerMethodField()
    data = serializers.SerializerMethodField()

    class Meta:
        model = WorkflowNode
        fields = [
            "id",
            "type",
            "position",
            "data",
            "node_id",
            "node_type",
            "label",
            "position_x",
            "position_y",
            "color",
            "text_color",
            "font_size",
            "order_index",
        ]
        extra_kwargs = {
            "node_id": {"write_only": True},
            "node_type": {"write_only": True},
            "label": {"write_only": True},
            "position_x": {"write_only": True},
            "position_y": {"write_only": True},
            "color": {"write_only": True},
            "text_color": {"write_only": True},
            "font_size": {"write_only": True},
            "order_index": {"write_only": True},
        }

    def get_position(self, obj):
        """Format position for ReactFlow"""
        return {"x": obj.position_x, "y": obj.position_y}

    def get_data(self, obj):
        """Format data object for ReactFlow"""
        return {
            "label": obj.label,
            "color": obj.color,
            "textColor": obj.text_color,
            "fontSize": obj.font_size,
        }


class WorkflowEdgeSerializer(serializers.ModelSerializer):
    """Serializer for workflow edges"""

    # Read-only fields for frontend compatibility
    id = serializers.CharField(source="edge_id", read_only=False)
    source = serializers.CharField(source="source_node_id", read_only=False)
    target = serializers.CharField(source="target_node_id", read_only=False)
    sourceHandle = serializers.CharField(
        source="source_handle", required=False, allow_null=True, allow_blank=True
    )
    targetHandle = serializers.CharField(
        source="target_handle", required=False, allow_null=True, allow_blank=True
    )
    style = serializers.SerializerMethodField()
    markerEnd = serializers.SerializerMethodField()

    class Meta:
        model = WorkflowEdge
        fields = [
            "id",
            "source",
            "target",
            "sourceHandle",
            "targetHandle",
            "label",
            "animated",
            "style",
            "markerEnd",
            "edge_id",
            "source_node_id",
            "target_node_id",
            "source_handle",
            "target_handle",
            "stroke_color",
            "stroke_width",
            "marker_type",
            "marker_color",
        ]
        extra_kwargs = {
            "edge_id": {"write_only": True},
            "source_node_id": {"write_only": True},
            "target_node_id": {"write_only": True},
            "source_handle": {"write_only": True},
            "target_handle": {"write_only": True},
            "stroke_color": {"write_only": True},
            "stroke_width": {"write_only": True},
            "marker_type": {"write_only": True},
            "marker_color": {"write_only": True},
        }

    def get_style(self, obj):
        """Format style object for ReactFlow"""
        return {"stroke": obj.stroke_color, "strokeWidth": obj.stroke_width}

    def get_markerEnd(self, obj):
        """Format markerEnd object for ReactFlow"""
        return {"type": obj.marker_type, "color": obj.marker_color}


class WorkflowDiagramSerializer(serializers.ModelSerializer):
    """Main serializer for workflow diagrams with nested nodes and edges"""

    nodes = WorkflowNodeSerializer(many=True, read_only=True)
    edges = WorkflowEdgeSerializer(many=True, read_only=True)
    project_name = serializers.ReadOnlyField(source="project.name")
    created_by_email = serializers.ReadOnlyField(source="created_by.email")

    class Meta:
        model = WorkflowDiagram
        fields = [
            "id",
            "project",
            "project_name",
            "name",
            "description",
            "nodes",
            "edges",
            "created_by",
            "created_by_email",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_by", "created_at", "updated_at"]


class WorkflowDiagramCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating workflow diagrams with nodes and edges"""

    nodes = serializers.ListField(
        child=serializers.DictField(), write_only=True, required=False
    )
    edges = serializers.ListField(
        child=serializers.DictField(), write_only=True, required=False
    )

    class Meta:
        model = WorkflowDiagram
        fields = [
            "id",
            "project",
            "name",
            "description",
            "nodes",
            "edges",
        ]

    def create(self, validated_data):
        nodes_data = validated_data.pop("nodes", [])
        edges_data = validated_data.pop("edges", [])

        # Create the workflow diagram
        workflow = WorkflowDiagram.objects.create(**validated_data)

        # Create nodes
        self._create_nodes(workflow, nodes_data)

        # Create edges
        self._create_edges(workflow, edges_data)

        return workflow

    def update(self, instance, validated_data):
        nodes_data = validated_data.pop("nodes", None)
        edges_data = validated_data.pop("edges", None)

        # Update workflow diagram fields
        instance.name = validated_data.get("name", instance.name)
        instance.description = validated_data.get("description", instance.description)
        instance.save()

        # Update nodes if provided
        if nodes_data is not None:
            # Delete existing nodes (cascade will delete edges)
            instance.nodes.all().delete()
            self._create_nodes(instance, nodes_data)

        # Update edges if provided
        if edges_data is not None:
            # Delete existing edges
            instance.edges.all().delete()
            self._create_edges(instance, edges_data)

        return instance

    def _create_nodes(self, workflow, nodes_data):
        """Helper method to create nodes from data"""
        for idx, node_data in enumerate(nodes_data):
            position = node_data.get("position", {})
            data = node_data.get("data", {})

            WorkflowNode.objects.create(
                workflow=workflow,
                node_id=node_data.get("id"),
                node_type=node_data.get("type", "rectangle"),
                label=data.get("label", ""),
                position_x=position.get("x", 0),
                position_y=position.get("y", 0),
                color=data.get("color", "#1e40af"),
                text_color=data.get("textColor", "#ffffff"),
                font_size=data.get("fontSize", 12),
                order_index=idx,
            )

    def _create_edges(self, workflow, edges_data):
        """Helper method to create edges from data"""
        for edge_data in edges_data:
            style = edge_data.get("style", {})
            marker_end = edge_data.get("markerEnd", {})

            WorkflowEdge.objects.create(
                workflow=workflow,
                edge_id=edge_data.get("id"),
                source_node_id=edge_data.get("source"),
                target_node_id=edge_data.get("target"),
                source_handle=edge_data.get("sourceHandle"),
                target_handle=edge_data.get("targetHandle"),
                label=edge_data.get("label", ""),
                animated=edge_data.get("animated", False),
                stroke_color=style.get("stroke", "#374151"),
                stroke_width=style.get("strokeWidth", 2),
                marker_type=marker_end.get("type", "arrowclosed"),
                marker_color=marker_end.get("color", "#374151"),
            )
