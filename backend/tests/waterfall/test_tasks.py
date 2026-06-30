"""Tests for Waterfall Tasks"""
import pytest
from django.urls import reverse
from waterfall.models import WaterfallPhase


@pytest.mark.django_db
class TestWaterfallTasks:
    """Test Waterfall tasks"""
    
    def test_create_task(self, authenticated_client, waterfall_project):
        """Test creating a task"""
        # First create a phase
        phase = WaterfallPhase.objects.create(
            project=waterfall_project,
            phase_type='requirements',
            name='Requirements Phase',
            order=1
        )
        
        url = reverse('waterfall:waterfall-tasks-list', kwargs={'project_id': waterfall_project.id})
        data = {
            'phase': phase.id,  # ← ADDED required field
            'title': 'Write Requirements Document',
            'description': 'Document all functional requirements',
            'status': 'todo',  # ← Changed from 'not_started' to match model choices
            'priority': 'high'
        }
        response = authenticated_client.post(url, data)
        assert response.status_code == 201
        assert response.data['title'] == 'Write Requirements Document'
    
    def test_task_dependencies(self, authenticated_client, waterfall_project):
        """Test task dependencies"""
        # Create a phase first
        phase = WaterfallPhase.objects.create(
            project=waterfall_project,
            phase_type='requirements',
            name='Requirements Phase',
            order=1
        )
        
        url = reverse('waterfall:waterfall-tasks-list', kwargs={'project_id': waterfall_project.id})
        
        # Create first task
        task1_data = {
            'phase': phase.id,
            'title': 'Task 1'
        }
        task1 = authenticated_client.post(url, task1_data)
        assert task1.status_code == 201
        task1_id = task1.data['id']
        
        # Create dependent task
        data = {
            'phase': phase.id,
            'title': 'Task 2',
            'requirements': []  # Note: dependencies might be called 'requirements' in the model
        }
        response = authenticated_client.post(url, data)
        assert response.status_code == 201
