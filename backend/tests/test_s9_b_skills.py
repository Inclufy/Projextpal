"""Sprint 9 Agent B — Member-skills DB (S9-05).

Covers CRUD of the catalog, user-skills, verifies tenant isolation on
cross-user reads, and exercises the match endpoint.

Run under SQLite:
    USE_SQLITE=1 python -m pytest tests/test_s9_b_skills.py -v
"""
from __future__ import annotations

# langchain-create-agent shim (same reason as every other test file in
# this repo): bot/ai/__init__.py would otherwise break URL resolution.
try:
    from langchain.agents import create_agent  # noqa: F401
except ImportError:  # pragma: no cover
    import langchain.agents as _la
    from unittest.mock import MagicMock

    def _stub_create_agent(*_a, **_kw):
        return MagicMock()

    _la.create_agent = _stub_create_agent  # type: ignore[attr-defined]

import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient

from accounts.models import Company, Skill, UserSkill

User = get_user_model()


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------
@pytest.fixture
def api_client() -> APIClient:
    return APIClient()


@pytest.fixture
def company_a(db) -> Company:
    return Company.objects.create(name="Alpha Co")


@pytest.fixture
def company_b(db) -> Company:
    return Company.objects.create(name="Beta Co")


@pytest.fixture
def admin_user(db, company_a):
    u = User.objects.create_user(
        username="admin_s9b",
        email="admin_s9b@projextpal.com",
        password="pw",
        is_staff=True,
    )
    u.company = company_a
    u.role = "admin"
    u.save()
    return u


@pytest.fixture
def plain_user(db, company_a):
    u = User.objects.create_user(
        username="alice_s9b",
        email="alice_s9b@projextpal.com",
        password="pw",
    )
    u.company = company_a
    u.role = "pm"
    u.save()
    return u


@pytest.fixture
def peer_user(db, company_a):
    u = User.objects.create_user(
        username="bob_s9b",
        email="bob_s9b@projextpal.com",
        password="pw",
    )
    u.company = company_a
    u.role = "contributor"
    u.save()
    return u


@pytest.fixture
def outsider(db, company_b):
    u = User.objects.create_user(
        username="eve_s9b",
        email="eve_s9b@other.com",
        password="pw",
    )
    u.company = company_b
    u.role = "pm"
    u.save()
    return u


@pytest.fixture
def seeded_catalog(db) -> list[Skill]:
    """A small catalog so match/me/users tests have something to attach."""
    return [
        Skill.objects.create(code="prince2", name="PRINCE2", category="methodology"),
        Skill.objects.create(code="agile", name="Agile", category="methodology"),
        Skill.objects.create(code="python", name="Python", category="technical"),
    ]


# ---------------------------------------------------------------------------
# Catalog
# ---------------------------------------------------------------------------
@pytest.mark.django_db
def test_catalog_list_requires_auth(api_client):
    r = api_client.get("/api/v1/skills/catalog/")
    assert r.status_code in (401, 403)


@pytest.mark.django_db
def test_catalog_list_returns_seeded_skills(api_client, plain_user, seeded_catalog):
    api_client.force_authenticate(plain_user)
    r = api_client.get("/api/v1/skills/catalog/")
    assert r.status_code == 200
    codes = {row["code"] for row in r.json()}
    assert {"prince2", "agile", "python"}.issubset(codes)


@pytest.mark.django_db
def test_catalog_create_requires_admin(api_client, plain_user):
    api_client.force_authenticate(plain_user)
    r = api_client.post(
        "/api/v1/skills/catalog/",
        {"code": "forbidden", "name": "Forbidden"},
        format="json",
    )
    assert r.status_code == 403
    assert not Skill.objects.filter(code="forbidden").exists()


@pytest.mark.django_db
def test_catalog_create_admin_happy_path(api_client, admin_user):
    api_client.force_authenticate(admin_user)
    r = api_client.post(
        "/api/v1/skills/catalog/",
        {
            "code": "safe",
            "name": "SAFe",
            "name_nl": "SAFe",
            "category": "methodology",
        },
        format="json",
    )
    assert r.status_code == 201, r.content
    assert Skill.objects.filter(code="safe").exists()


# ---------------------------------------------------------------------------
# My skills
# ---------------------------------------------------------------------------
@pytest.mark.django_db
def test_me_add_and_list_skill(api_client, plain_user, seeded_catalog):
    api_client.force_authenticate(plain_user)
    r = api_client.post(
        "/api/v1/skills/me/",
        {"skill_code": "prince2", "level": "expert", "years_experience": 5},
        format="json",
    )
    assert r.status_code == 201, r.content

    r = api_client.get("/api/v1/skills/me/")
    assert r.status_code == 200
    rows = r.json()
    assert len(rows) == 1
    assert rows[0]["skill"]["code"] == "prince2"
    assert rows[0]["level"] == "expert"
    assert rows[0]["years_experience"] == 5


@pytest.mark.django_db
def test_me_patch_level(api_client, plain_user, seeded_catalog):
    api_client.force_authenticate(plain_user)
    api_client.post(
        "/api/v1/skills/me/",
        {"skill_code": "python", "level": "intermediate"},
        format="json",
    )
    us = UserSkill.objects.get(user=plain_user, skill__code="python")
    r = api_client.patch(
        f"/api/v1/skills/me/{us.id}/",
        {"level": "expert", "years_experience": 7},
        format="json",
    )
    assert r.status_code == 200
    us.refresh_from_db()
    assert us.level == "expert"
    assert us.years_experience == 7


@pytest.mark.django_db
def test_me_delete_skill(api_client, plain_user, seeded_catalog):
    api_client.force_authenticate(plain_user)
    api_client.post(
        "/api/v1/skills/me/",
        {"skill_code": "python"},
        format="json",
    )
    us_id = UserSkill.objects.get(user=plain_user, skill__code="python").id
    r = api_client.delete(f"/api/v1/skills/me/{us_id}/")
    assert r.status_code == 204
    assert not UserSkill.objects.filter(id=us_id).exists()


@pytest.mark.django_db
def test_me_cannot_delete_someone_elses_skill(
    api_client, plain_user, peer_user, seeded_catalog
):
    peer_skill = UserSkill.objects.create(
        user=peer_user,
        skill=seeded_catalog[0],
        level="expert",
    )
    api_client.force_authenticate(plain_user)
    r = api_client.delete(f"/api/v1/skills/me/{peer_skill.id}/")
    assert r.status_code == 404
    assert UserSkill.objects.filter(id=peer_skill.id).exists()


# ---------------------------------------------------------------------------
# Cross-user — tenant isolation
# ---------------------------------------------------------------------------
@pytest.mark.django_db
def test_user_skills_same_tenant_ok(
    api_client, plain_user, peer_user, seeded_catalog
):
    UserSkill.objects.create(
        user=peer_user, skill=seeded_catalog[0], level="expert"
    )
    api_client.force_authenticate(plain_user)
    r = api_client.get(f"/api/v1/skills/users/{peer_user.id}/")
    assert r.status_code == 200
    assert len(r.json()) == 1


@pytest.mark.django_db
def test_user_skills_cross_tenant_forbidden(
    api_client, plain_user, outsider, seeded_catalog
):
    UserSkill.objects.create(
        user=outsider, skill=seeded_catalog[0], level="expert"
    )
    api_client.force_authenticate(plain_user)
    r = api_client.get(f"/api/v1/skills/users/{outsider.id}/")
    assert r.status_code == 403


# ---------------------------------------------------------------------------
# Match
# ---------------------------------------------------------------------------
@pytest.mark.django_db
def test_match_ranks_by_coverage_and_level(
    api_client, plain_user, peer_user, seeded_catalog
):
    # peer: expert prince2 + expert agile  → covers 2 of 2
    UserSkill.objects.create(
        user=peer_user, skill=seeded_catalog[0], level="expert"
    )
    UserSkill.objects.create(
        user=peer_user, skill=seeded_catalog[1], level="expert"
    )
    # plain: only prince2, intermediate  → covers 1 of 2
    UserSkill.objects.create(
        user=plain_user, skill=seeded_catalog[0], level="intermediate"
    )

    api_client.force_authenticate(plain_user)
    r = api_client.post(
        "/api/v1/skills/match/",
        {"required_skill_codes": ["prince2", "agile"], "project_id": 10},
        format="json",
    )
    assert r.status_code == 200
    body = r.json()
    assert body["project_id"] == 10
    results = body["results"]
    assert len(results) == 2
    # peer must rank first (more matches + higher levels)
    assert results[0]["user_id"] == peer_user.id
    assert set(results[0]["matched"]) == {"prince2", "agile"}
    assert results[1]["user_id"] == plain_user.id


@pytest.mark.django_db
def test_match_excludes_other_tenants(
    api_client, plain_user, outsider, seeded_catalog
):
    UserSkill.objects.create(
        user=outsider, skill=seeded_catalog[0], level="expert"
    )
    api_client.force_authenticate(plain_user)
    r = api_client.post(
        "/api/v1/skills/match/",
        {"required_skill_codes": ["prince2"]},
        format="json",
    )
    assert r.status_code == 200
    results = r.json()["results"]
    assert all(row["user_id"] != outsider.id for row in results)


@pytest.mark.django_db
def test_match_rejects_empty_payload(api_client, plain_user):
    api_client.force_authenticate(plain_user)
    r = api_client.post(
        "/api/v1/skills/match/",
        {"required_skill_codes": []},
        format="json",
    )
    assert r.status_code == 400


@pytest.mark.django_db
def test_match_verified_edges_above_unverified(
    api_client, plain_user, peer_user, seeded_catalog
):
    # Same level, but peer's row is verified → should outrank plain.
    UserSkill.objects.create(
        user=plain_user,
        skill=seeded_catalog[2],
        level="intermediate",
    )
    UserSkill.objects.create(
        user=peer_user,
        skill=seeded_catalog[2],
        level="intermediate",
        verified_at=timezone.now(),
        verified_by=plain_user,
    )
    api_client.force_authenticate(plain_user)
    r = api_client.post(
        "/api/v1/skills/match/",
        {"required_skill_codes": ["python"]},
        format="json",
    )
    assert r.status_code == 200
    results = r.json()["results"]
    assert results[0]["user_id"] == peer_user.id
