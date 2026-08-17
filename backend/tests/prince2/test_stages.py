"""Tests for PRINCE2 Stages"""
import pytest
from django.urls import reverse


@pytest.mark.django_db
class TestPRINCE2Stages:
    """Test PRINCE2 project stages"""
    
    def test_create_stage(self, authenticated_client, prince2_project):
        """Test creating a PRINCE2 stage"""
        url = reverse('prince2:prince2-stages-list', kwargs={'project_id': prince2_project.id})
        data = {
            'name': 'Initiation Stage',
            'description': 'Project initiation',
            'order': 1,
            'start_date': '2026-02-01',
            'end_date': '2026-02-28'
        }
        response = authenticated_client.post(url, data)
        assert response.status_code == 201
    
    def test_stage_gate(self, authenticated_client, user, prince2_project):
        """Test stage gate review"""
        # Gate-approval is een Project Board-besluit (PRINCE2 separation of
        # duties): alleen de Project Owner mag goedkeuren. Vroeger slaagde dit
        # doordat de fixture-user impliciet superadmin was; nu expliciet als
        # Owner van dit project.
        from projects.models import ProjectMembership
        ProjectMembership.objects.create(
            project=prince2_project, user=user, role='project_owner',
        )
        # Create stage
        stage_url = reverse('prince2:prince2-stages-list', kwargs={'project_id': prince2_project.id})
        stage = authenticated_client.post(stage_url, {'name': 'Test Stage'})
        
        # Create stage gate
        gate_list_url = reverse('prince2:prince2-stage-gates-list', kwargs={'project_id': prince2_project.id})
        gate = authenticated_client.post(gate_list_url, {
            'stage': stage.data['id'],
            'gate_type': 'stage_boundary',
            'scheduled_date': '2024-12-31'
        })
        
        # Approve stage gate
        gate_approve_url = reverse('prince2:prince2-stage-gates-approve', 
                                  kwargs={'project_id': prince2_project.id, 'pk': gate.data['id']})
        response = authenticated_client.post(gate_approve_url, {
            'approved': True,
            'decision': 'approved',
            'comments': 'Gate approved'
        })
        assert response.status_code == 200
