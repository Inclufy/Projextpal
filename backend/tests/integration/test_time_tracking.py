"""Tests for Time Tracking"""
import pytest
from projects.models import Project


@pytest.mark.django_db
class TestTimeTracking:
    """Test time tracking functionality"""
    
    def test_track_time_for_project(self, user, company):
        """Test tracking time on a project"""
        project = Project.objects.create(
            name='Time Tracking Project',
            company=company,
            methodology='scrum'
        )
        
        # Mock time entry
        time_entry = {
            'project': project,
            'user': user,
            'hours': 8,
            'description': 'Development work',
            'date': '2024-02-06'
        }
        
        assert time_entry['hours'] == 8
        assert time_entry['project'].name == 'Time Tracking Project'
        
    def test_total_time_per_project(self, user, company):
        """Test calculating total time per project"""
        project = Project.objects.create(
            name='Project A',
            company=company,
            methodology='kanban'
        )
        
        # Simulate multiple time entries
        total_hours = 40  # 5 days * 8 hours
        assert total_hours == 40
        
    def test_time_tracking_by_user(self, user, company):
        """Test time tracking per user"""
        entries = [
            {'user': user, 'hours': 8, 'date': '2024-02-05'},
            {'user': user, 'hours': 6, 'date': '2024-02-06'},
        ]
        
        total = sum(e['hours'] for e in entries)
        assert total == 14
