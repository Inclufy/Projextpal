"""Tests for Program Management"""
import pytest
from programs.models import Program


@pytest.mark.django_db
class TestPrograms:
    """Test Program Management functionality"""
    
    def test_create_program(self, authenticated_client, company, user):
        """Test creating a program"""
        url = '/api/v1/programs/'
        data = {
            'name': 'Digital Transformation Program',
            'description': 'Company-wide digital transformation',
            'start_date': '2024-01-01',
            'target_end_date': '2025-12-31',
            'program_manager': user.id
        }
        response = authenticated_client.post(url, data)
        assert response.status_code == 201
        assert response.data['name'] == 'Digital Transformation Program'
    
    def test_add_program_benefit(self, authenticated_client, user, company):
        """Test adding benefit to program"""
        # Create program first
        program = Program.objects.create(
            name='Test Program',
            company=company,
            program_manager=user,
            start_date='2024-01-01'
        )
        
        url = f'/api/v1/programs/{program.id}/benefits/'
        data = {
            'name': 'Increased Revenue',
            'description': '20% revenue increase',
            'category': 'financial',
            'target_value': '1000000',
            'measurement_unit': 'EUR'
        }
        response = authenticated_client.post(url, data)
        assert response.status_code == 201
        assert response.data['name'] == 'Increased Revenue'
    
    def test_add_program_risk(self, authenticated_client, user, company):
        """Test adding risk to program"""
        program = Program.objects.create(
            name='Test Program',
            company=company,
            program_manager=user,
            start_date='2024-01-01'
        )
        
        url = f'/api/v1/programs/{program.id}/risks/'
        data = {
            'name': 'Resource Shortage',
            'description': 'Potential lack of skilled resources',
            'probability': 'medium',
            'impact': 'high',
            'mitigation_plan': 'External recruitment'
        }
        response = authenticated_client.post(url, data)
        assert response.status_code == 201
        assert response.data['name'] == 'Resource Shortage'
    
    def test_program_milestone(self, authenticated_client, user, company):
        """Test creating program milestone"""
        program = Program.objects.create(
            name='Test Program',
            company=company,
            program_manager=user,
            start_date='2024-01-01'
        )
        
        url = f'/api/v1/programs/{program.id}/milestones/'
        data = {
            'name': 'Phase 1 Complete',
            'description': 'First phase completion',
            'target_date': '2024-06-30'
        }
        response = authenticated_client.post(url, data)
        assert response.status_code == 201
        assert response.data['name'] == 'Phase 1 Complete'
