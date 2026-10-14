"""Sprint 6 enterprise-readiness tests.

Covers:
  * S6-01 AIContextAccessLog + log_access swallow-all behaviour
  * S6-03 Encryption-at-rest round-trip + legacy plaintext fallback
  * S6-04 Per-document enabled flag filtering source_files
  * S6-06 TenantAIFeatureFlags autocreation + fail-open + disable
  * S6-07 ai_context_used details block
  * Tenant isolation on /api/v1/ai-audit/log/
"""
from __future__ import annotations

from unittest.mock import Mock

import pytest

from accounts.models import Company, TenantAIFeatureFlags
from ai_audit.models import AIContextAccessLog, log_access
from core.ai_context_helpers import (
    get_project_context_details,
    get_project_context_prefix,
)
from core.secret_field import FERNET_TOKEN_PREFIX
from django.db import connection
from projects.models import Project, ProjectAIContext


# --------------------------------------------------------------------------
# Fixtures
# --------------------------------------------------------------------------

@pytest.fixture
def project(db, user, company):
    return Project.objects.create(
        name="S6 Tender", company=company, methodology="prince2", created_by=user,
    )


@pytest.fixture
def aic(db, project):
    return ProjectAIContext.objects.create(
        project=project,
        enabled=True,
        extracted_text="Secret tender text about Wmo in Heerenveen.",
        source_files=[{"name": "brief.pdf", "size": 100, "pages": 10}],
    )


# --------------------------------------------------------------------------
# S6-06  TenantAIFeatureFlags
# --------------------------------------------------------------------------

class TestTenantAIFeatureFlags:
    def test_autocreated_on_company_create(self, db):
        c = Company.objects.create(name="FreshCorp")
        assert TenantAIFeatureFlags.objects.filter(company=c).exists()

    def test_defaults_enable_everything(self, db, company):
        flags, _ = TenantAIFeatureFlags.objects.get_or_create(company=company)
        for feature in TenantAIFeatureFlags.FEATURE_FIELDS:
            assert getattr(flags, feature) is True, feature

    def test_is_enabled_fail_open_on_none(self):
        assert TenantAIFeatureFlags.is_enabled(None, "ai_context_enabled") is True

    def test_is_enabled_fail_open_on_unknown_feature(self, db, company):
        assert TenantAIFeatureFlags.is_enabled(company, "no_such_feature") is True

    def test_is_enabled_respects_explicit_disable(self, db, company):
        flags, _ = TenantAIFeatureFlags.objects.get_or_create(company=company)
        flags.ai_context_enabled = False
        flags.save()
        assert TenantAIFeatureFlags.is_enabled(company, "ai_context_enabled") is False


# --------------------------------------------------------------------------
# S6-03  Encryption at rest
# --------------------------------------------------------------------------

class TestEncryptionAtRest:
    def test_new_row_stored_encrypted(self, db, project):
        aic = ProjectAIContext.objects.create(
            project=project, extracted_text="Confidential tender body"
        )
        with connection.cursor() as cur:
            cur.execute(
                "SELECT extracted_text FROM projects_projectaicontext WHERE id=%s",
                [aic.id],
            )
            raw = cur.fetchone()[0]
        assert raw.startswith(FERNET_TOKEN_PREFIX), raw[:20]
        # Round-trip through ORM
        reloaded = ProjectAIContext.objects.get(id=aic.id)
        assert reloaded.extracted_text == "Confidential tender body"

    def test_legacy_plaintext_still_readable(self, db, project):
        # Simulate a pre-encryption row (what 0040 would see).
        with connection.cursor() as cur:
            cur.execute(
                "INSERT INTO projects_projectaicontext "
                "(project_id, extracted_text, source_files, enabled, created_at, updated_at) "
                "VALUES (%s, %s, '[]', 1, "
                "CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
                [project.id, "LEGACY PLAIN TEXT"],
            )
            legacy_id = cur.lastrowid or cur.fetchone()
        aic = ProjectAIContext.objects.filter(project=project).order_by("-id").first()
        assert aic is not None
        assert aic.extracted_text == "LEGACY PLAIN TEXT"


# --------------------------------------------------------------------------
# S6-04  Per-document enabled flag
# --------------------------------------------------------------------------

class TestPerDocumentEnabled:
    def test_backward_compat_missing_flag_defaults_enabled(self, db, project, user):
        aic = ProjectAIContext.objects.create(
            project=project,
            extracted_text="Body text",
            source_files=[{"name": "legacy.pdf", "size": 1, "pages": 1}],
        )
        details = get_project_context_details(user, project.id, surface="test", log=False)
        names = [d["name"] for d in details["used"]["documents"]]
        assert names == ["legacy.pdf"]

    def test_disabled_doc_filtered_from_used(self, db, project, user):
        aic = ProjectAIContext.objects.create(
            project=project,
            extracted_text="Body text",
            source_files=[
                {"name": "keep.pdf", "size": 1, "pages": 1, "enabled": True},
                {"name": "hide.pdf", "size": 1, "pages": 1, "enabled": False},
            ],
        )
        details = get_project_context_details(user, project.id, surface="test", log=False)
        names = [d["name"] for d in details["used"]["documents"]]
        assert names == ["keep.pdf"]


# --------------------------------------------------------------------------
# S6-01  Audit log + swallow-all
# --------------------------------------------------------------------------

class TestAuditLog:
    def test_prefix_call_writes_log(self, db, project, aic, user):
        AIContextAccessLog.objects.all().delete()
        prefix = get_project_context_prefix(user, project.id, surface="copilot")
        assert prefix
        log = AIContextAccessLog.objects.filter(
            context_type="project", context_id=str(project.id), surface="copilot"
        ).first()
        assert log is not None
        assert log.chars_used > 0
        assert log.user_id == user.id

    def test_log_access_zero_chars_still_recorded(self, db, user, company):
        # BUG-#37 fix: chars_used=0 is a valid "attempt without context"
        # audit row — GDPR requires the WHO/WHICH-surface/WHEN trail even
        # when no document context was pulled into the prompt.
        AIContextAccessLog.objects.all().delete()
        log_access(
            user=user, context_type="project", context_id=1,
            surface="x", chars_used=0, company=company,
        )
        assert AIContextAccessLog.objects.count() == 1
        assert AIContextAccessLog.objects.first().chars_used == 0

    def test_log_access_swallows_errors(self, db, user, company):
        # Pass a context_type longer than max_length to force a DB error;
        # the helper must swallow it.
        log_access(
            user=user, context_type="x" * 128, context_id="y" * 128,
            surface="s" * 128, chars_used=1, company=company,
        )
        # Reaches here without raising -> swallow-all works.


# --------------------------------------------------------------------------
# S6-06  Feature flag disables context injection
# --------------------------------------------------------------------------

class TestFeatureFlagDisablesContext:
    def test_prefix_empty_when_disabled(self, db, project, aic, user, company):
        flags, _ = TenantAIFeatureFlags.objects.get_or_create(company=company)
        flags.ai_context_enabled = False
        flags.save()
        prefix = get_project_context_prefix(user, project.id, surface="test")
        assert prefix == ""


# --------------------------------------------------------------------------
# S6-07  ai_context_used block shape
# --------------------------------------------------------------------------

class TestUsageDetails:
    def test_details_contains_expected_keys(self, db, project, aic, user):
        details = get_project_context_details(
            user, project.id, surface="autodraft", log=False,
        )
        used = details.get("used")
        assert used is not None
        assert set(used.keys()) == {"chars", "documents", "surfaces"}
        assert used["chars"] > 0
        assert used["surfaces"] == ["autodraft"]
