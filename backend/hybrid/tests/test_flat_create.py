"""Regression tests for BUG-038 follow-up: creates on the flat (non-project-scoped)
/api/v1/hybrid/<resource>/ routes.

The BUG-038 fix marked 'project' read-only on the hybrid serializers so the
project-scoped routes (/projects/<id>/hybrid/...) stopped 400'ing. But the flat
routes have no project_id in the URL, so perform_create saved with
project_id=NULL and the NOT NULL constraint turned a fully valid request into
a 500 (IntegrityError). These tests pin the flat routes to: valid body -> 201,
missing project -> 400 (never 500), foreign project -> 403.
"""
import pytest
from rest_framework.test import APIClient

from hybrid.models import HybridConfiguration


@pytest.mark.django_db
class TestHybridFlatCreate:

    def test_flat_config_create_returns_201(self, authenticated_client, hybrid_project):
        """BUG-038 follow-up: POST /api/v1/hybrid/configs/ with a valid body 500'd."""
        response = authenticated_client.post('/api/v1/hybrid/configs/', {
            'project': hybrid_project.id,
            'primary_methodology': 'scrum',
        }, format='json')
        assert response.status_code == 201, response.content
        assert response.data['project'] == hybrid_project.id
        assert HybridConfiguration.objects.filter(project=hybrid_project).exists()

    def test_flat_config_create_without_project_returns_400(self, authenticated_client):
        """Missing project on the flat route must be a validation error, not a 500."""
        response = authenticated_client.post('/api/v1/hybrid/configs/', {
            'primary_methodology': 'scrum',
        }, format='json')
        assert response.status_code == 400
        assert 'project' in response.data

    def test_flat_config_create_on_foreign_project_returns_403(self, hybrid_project):
        """A user with no access to the target project must not be able to create."""
        from django.contrib.auth import get_user_model
        # role must be explicit: the user model defaults to 'superadmin',
        # which would legitimately bypass the project-access check.
        outsider = get_user_model().objects.create_user(
            username='outsider-bug038', email='outsider-bug038@example.com',
            password='x-not-real-1', role='member',
        )
        client = APIClient()
        client.force_authenticate(user=outsider)
        response = client.post('/api/v1/hybrid/configs/', {
            'project': hybrid_project.id,
            'primary_methodology': 'scrum',
        }, format='json')
        assert response.status_code == 403

    def test_flat_artifact_create_returns_201(self, authenticated_client, hybrid_project):
        """Same NULL-project crash path as configs — pin the artifact flat route too."""
        response = authenticated_client.post('/api/v1/hybrid/artifacts/', {
            'project': hybrid_project.id,
            'name': 'WBS',
            'source_methodology': 'waterfall',
        }, format='json')
        assert response.status_code == 201, response.content
        assert response.data['project'] == hybrid_project.id

    def test_flat_phase_methodology_create_returns_201(self, authenticated_client, hybrid_project):
        """Same NULL-project crash path as configs — pin the phase-methodology flat route."""
        response = authenticated_client.post('/api/v1/hybrid/phase-methodologies/', {
            'project': hybrid_project.id,
            'phase': 'Build',
            'methodology': 'scrum',
        }, format='json')
        assert response.status_code == 201, response.content
        assert response.data['project'] == hybrid_project.id

    def test_scoped_config_create_still_works_without_project_in_body(
            self, authenticated_client, hybrid_project):
        """The original BUG-038 guarantee: the project-scoped route needs no
        'project' in the body (and ignores a bogus one in favour of the URL)."""
        response = authenticated_client.post(
            f'/api/v1/projects/{hybrid_project.id}/hybrid/configurations/', {
                'primary_methodology': 'kanban',
            }, format='json')
        assert response.status_code == 201, response.content
        assert response.data['project'] == hybrid_project.id
