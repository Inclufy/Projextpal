from django.test import TestCase
from django.contrib.auth import get_user_model
from accounts.models import Company
from projects.models import Project
from .models import WorkflowDiagram, WorkflowNode, WorkflowEdge

User = get_user_model()


class WorkflowDiagramModelTest(TestCase):
    def setUp(self):
        self.company = Company.objects.create(name="Test Company")
        self.user = User.objects.create_user(
            email="test@example.com", password="testpass123", company=self.company
        )
        self.project = Project.objects.create(
            company=self.company, name="Test Project", created_by=self.user
        )

    def test_create_workflow_diagram(self):
        workflow = WorkflowDiagram.objects.create(
            project=self.project, name="Test Workflow", created_by=self.user
        )
        self.assertEqual(workflow.project, self.project)
        self.assertEqual(workflow.name, "Test Workflow")
        self.assertIsNotNone(workflow.created_at)

    def test_create_workflow_node(self):
        workflow = WorkflowDiagram.objects.create(
            project=self.project, created_by=self.user
        )
        node = WorkflowNode.objects.create(
            workflow=workflow,
            node_id="node_1",
            node_type="rectangle",
            label="Test Node",
            position_x=100,
            position_y=200,
        )
        self.assertEqual(node.workflow, workflow)
        self.assertEqual(node.label, "Test Node")

    def test_create_workflow_edge(self):
        workflow = WorkflowDiagram.objects.create(
            project=self.project, created_by=self.user
        )
        edge = WorkflowEdge.objects.create(
            workflow=workflow,
            edge_id="edge_1",
            source_node_id="node_1",
            target_node_id="node_2",
        )
        self.assertEqual(edge.workflow, workflow)
        self.assertEqual(edge.source_node_id, "node_1")
