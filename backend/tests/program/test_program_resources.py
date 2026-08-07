"""Tests for the programme resource-allocation endpoint.

GET /api/v1/programs/<pk>/resources/ feeds the capacity-planning page
(frontend/src/pages/ProgramResources.tsx). The frontend contract is one row
per person: {id, name, role, allocation, projects}. These tests pin that
contract and the allocation arithmetic (planned Waterfall percentage first,
otherwise TimeEntry actuals over the last 28 days against a 160h window).
"""
from datetime import timedelta

import pytest
from django.utils import timezone

from programs.models import Program
from projects.models import Project, ProjectTeam, TimeEntry
from waterfall.models import WaterfallTeamMember

User = None
try:
    from django.contrib.auth import get_user_model
    User = get_user_model()
except Exception:  # pragma: no cover
    pass


def _make_program_with_projects(company, user, names):
    program = Program.objects.create(
        name='Capacity Test Program',
        company=company,
        program_manager=user,
        start_date='2024-01-01',
    )
    projects = []
    for name in names:
        project = Project.objects.create(
            name=name,
            company=company,
            created_by=user,
        )
        program.projects.add(project)
        projects.append(project)
    return program, projects


@pytest.mark.django_db
class TestProgramResources:
    def test_contract_fields_present(self, authenticated_client, company, user):
        """Each row exposes id/name/role/allocation/projects (frontend contract)."""
        program, (project,) = _make_program_with_projects(company, user, ['Alpha'])
        ProjectTeam.objects.create(project=project, user=user, added_by=user)

        response = authenticated_client.get(f'/api/v1/programs/{program.id}/resources/')
        assert response.status_code == 200
        assert len(response.data) == 1
        row = response.data[0]
        for field in ('id', 'name', 'role', 'allocation', 'projects'):
            assert field in row, f'missing contract field: {field}'
        assert row['id'] == user.id
        assert row['name'] == 'Test User'
        assert row['projects'] == ['Alpha']
        # Member without planned allocation or time entries -> honest 0.
        assert row['allocation'] == 0

    def test_planned_waterfall_allocation_summed_across_projects(
        self, authenticated_client, company, user
    ):
        """Planned allocation_percentage per project is summed per person."""
        program, (alpha, beta) = _make_program_with_projects(
            company, user, ['Alpha', 'Beta']
        )
        ProjectTeam.objects.create(project=alpha, user=user, added_by=user)
        ProjectTeam.objects.create(project=beta, user=user, added_by=user)
        WaterfallTeamMember.objects.create(
            project=alpha, user=user, allocation_percentage=60
        )
        WaterfallTeamMember.objects.create(
            project=beta, user=user, allocation_percentage=60
        )

        response = authenticated_client.get(f'/api/v1/programs/{program.id}/resources/')
        assert response.status_code == 200
        assert len(response.data) == 1
        row = response.data[0]
        assert row['allocation'] == 120  # 60 + 60 -> overallocated
        assert sorted(row['projects']) == ['Alpha', 'Beta']

    def test_time_entry_actuals_used_when_no_planned_allocation(
        self, authenticated_client, company, user
    ):
        """Without planned data, allocation derives from approved hours / 160h."""
        program, (project,) = _make_program_with_projects(company, user, ['Alpha'])
        ProjectTeam.objects.create(project=project, user=user, added_by=user)

        today = timezone.localdate()
        # 80h approved in the window -> 50% of a 160h FTE window.
        TimeEntry.objects.create(
            project=project, user=user, date=today - timedelta(days=3),
            hours=40, status='approved',
        )
        TimeEntry.objects.create(
            project=project, user=user, date=today - timedelta(days=10),
            hours=40, status='submitted',
        )
        # Draft and stale entries must not count.
        TimeEntry.objects.create(
            project=project, user=user, date=today - timedelta(days=2),
            hours=40, status='draft',
        )
        TimeEntry.objects.create(
            project=project, user=user, date=today - timedelta(days=60),
            hours=40, status='approved',
        )

        response = authenticated_client.get(f'/api/v1/programs/{program.id}/resources/')
        assert response.status_code == 200
        assert response.data[0]['allocation'] == 50

    def test_waterfall_member_without_projectteam_row_is_included(
        self, authenticated_client, company, user
    ):
        """Membership union: waterfall-only members still appear once."""
        program, (project,) = _make_program_with_projects(company, user, ['Alpha'])
        colleague = User.objects.create_user(
            username='colleague',
            email='colleague@projextpal.com',
            password='testpass123',
        )
        colleague.first_name = 'Co'
        colleague.last_name = 'Worker'
        if hasattr(colleague, 'company'):
            colleague.company = company
        colleague.save()
        WaterfallTeamMember.objects.create(
            project=project, user=colleague, allocation_percentage=100
        )

        response = authenticated_client.get(f'/api/v1/programs/{program.id}/resources/')
        assert response.status_code == 200
        ids = [row['id'] for row in response.data]
        assert colleague.id in ids
        row = next(r for r in response.data if r['id'] == colleague.id)
        assert row['allocation'] == 100
        assert row['projects'] == ['Alpha']

    def test_empty_program_returns_empty_list(self, authenticated_client, company, user):
        program, _ = _make_program_with_projects(company, user, [])
        response = authenticated_client.get(f'/api/v1/programs/{program.id}/resources/')
        assert response.status_code == 200
        assert response.data == []
