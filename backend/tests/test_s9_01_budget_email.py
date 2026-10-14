"""Sprint 9 S9-01 — budget-overschrijding emails.

The signal fires from ``projects/budget_email.py`` on every TimeEntry
post_save. Covers:

  * Happy path: new entry pushes cumulative hours > budget → emails are
    constructed for owner + admin (and locmail outbox captures them).
  * No email when the user's cumulative hours stay under budget.

Both tests use ``locmem`` as the email backend (set at test-config time by
Django's default when SECRET_KEY=test; see ``tests/conftest.py``) and
force synchronous sending by patching the module's threading helper so the
mails show up in ``mail.outbox`` before we assert.

Run under SQLite:
    USE_SQLITE=1 SECRET_KEY=test python -m pytest tests/test_s9_01_budget_email.py -v
"""
from __future__ import annotations

# Keep the same langchain shim as test_s7_timesheet_budget — otherwise
# URL resolution dies on `bot.ai` import at module-load.
try:
    from langchain.agents import create_agent  # noqa: F401
except ImportError:  # pragma: no cover
    import langchain.agents as _la
    from unittest.mock import MagicMock

    def _stub_create_agent(*_a, **_kw):
        return MagicMock()

    _la.create_agent = _stub_create_agent  # type: ignore[attr-defined]

from datetime import date
from decimal import Decimal
from unittest.mock import patch

import pytest
from django.contrib.auth import get_user_model
from django.core import mail

from accounts.models import Company
from projects.models import Project, ProjectTeam, TimeEntry

User = get_user_model()


# ---------------------------------------------------------------------------
# Helpers — force the daemon-thread sender to run inline so mail.outbox
# captures the message before the test asserts.
# ---------------------------------------------------------------------------

class _InlineThread:
    """Shim that mimics threading.Thread but runs the target in-process."""

    def __init__(self, *, target, daemon=False, name=None, args=None, kwargs=None):
        self._target = target
        self._args = args or ()
        self._kwargs = kwargs or {}

    def start(self):
        self._target(*self._args, **self._kwargs)


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture
def tenant(db):
    return Company.objects.create(name="S9 Tenant")


@pytest.fixture
def owner(db, tenant):
    u = User.objects.create_user(
        username="s9_owner", email="owner@example.com", password="pw",
    )
    u.company = tenant
    u.role = "pm"
    u.save()
    return u


@pytest.fixture
def admin_user(db, tenant):
    u = User.objects.create_user(
        username="s9_admin", email="admin@example.com", password="pw",
    )
    u.company = tenant
    u.role = "admin"
    u.save()
    return u


@pytest.fixture
def worker(db, tenant):
    u = User.objects.create_user(
        username="s9_worker",
        email="worker@example.com",
        password="pw",
        first_name="Jan",
        last_name="Jansen",
    )
    u.company = tenant
    u.role = "contributor"
    u.save()
    return u


@pytest.fixture
def project(db, tenant, owner):
    return Project.objects.create(
        company=tenant, name="S9 Budget Project", created_by=owner,
    )


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

@pytest.mark.django_db
def test_budget_overrun_sends_email_to_owner_and_admin(
    project, owner, admin_user, worker,
):
    """Worker logs 6h on a 5h budget → owner + admin get an email."""
    ProjectTeam.objects.create(
        project=project, user=worker, added_by=owner,
        budgeted_hours=Decimal("5.00"),
    )
    mail.outbox = []
    with patch("projects.budget_email.threading.Thread", _InlineThread):
        TimeEntry.objects.create(
            project=project, user=worker, date=date.today(),
            hours=Decimal("6.00"), description="worked over",
        )

    # Each recipient gets their own message (owner + admin = 2).
    assert len(mail.outbox) == 2, [
        (m.subject, m.to) for m in mail.outbox
    ]
    recipients = sorted(addr for m in mail.outbox for addr in m.to)
    assert recipients == ["admin@example.com", "owner@example.com"]

    # Subject + body both mention the project and the overrun pct.
    for msg in mail.outbox:
        assert "S9 Budget Project" in msg.subject
        text_body = msg.body
        # Jan Jansen is the worker; cumulative = 6 vs budget 5 → 120%.
        assert "Jan Jansen" in text_body
        assert "120" in text_body  # pct appears somewhere


@pytest.mark.django_db
def test_no_email_when_under_budget(project, owner, admin_user, worker):
    """Cumulative stays ≤ budget → no mail dispatched."""
    ProjectTeam.objects.create(
        project=project, user=worker, added_by=owner,
        budgeted_hours=Decimal("40.00"),
    )
    mail.outbox = []
    with patch("projects.budget_email.threading.Thread", _InlineThread):
        TimeEntry.objects.create(
            project=project, user=worker, date=date.today(),
            hours=Decimal("2.00"), description="normal day",
        )
    assert mail.outbox == []


@pytest.mark.django_db
def test_no_email_when_budget_unset(project, owner, admin_user, worker):
    """A ProjectTeam row with no budgeted_hours is not watched."""
    ProjectTeam.objects.create(
        project=project, user=worker, added_by=owner,
        budgeted_hours=None,
    )
    mail.outbox = []
    with patch("projects.budget_email.threading.Thread", _InlineThread):
        TimeEntry.objects.create(
            project=project, user=worker, date=date.today(),
            hours=Decimal("99.00"), description="no cap",
        )
    assert mail.outbox == []


@pytest.mark.django_db
def test_timesave_succeeds_when_email_errors(project, owner, worker):
    """A broken email handler must NOT fail the TimeEntry.save."""
    ProjectTeam.objects.create(
        project=project, user=worker, added_by=owner,
        budgeted_hours=Decimal("1.00"),
    )

    # Make _notify_budget_overrun blow up and verify the save still
    # succeeds (the signal receiver's try/except swallows the error).
    with patch(
        "projects.budget_email._notify_budget_overrun",
        side_effect=RuntimeError("boom"),
    ):
        te = TimeEntry.objects.create(
            project=project, user=worker, date=date.today(),
            hours=Decimal("10.00"), description="boom",
        )
    te.refresh_from_db()
    assert te.pk is not None
    assert te.hours == Decimal("10.00")
