"""Sprint 9 S9-03 — certificate counts come from eligibility, not placeholders.

Before this change the certificate was created with hardcoded counts
(85/24/20/1/15/10) regardless of what the learner actually completed.
Those numbers appeared on PDF certificates verbatim, which made the
credential dishonest ("20 quizzes passed" even if the course only had 2).

The fix maps ``Certificate.*`` to the ``eligibility`` dict returned by
``Enrollment.certificate_eligibility()``; keys that aren't present in
the dict fall back to 0 — a safe "unknown" rather than a fake 85.

Run under SQLite:
    USE_SQLITE=1 SECRET_KEY=test python -m pytest tests/test_s9_03_certificate_counts.py -v
"""
from __future__ import annotations

from decimal import Decimal
from unittest.mock import patch

import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from academy.models import (
    Course, CourseCategory, CourseInstructor, CourseLesson, CourseModule,
    Enrollment, Certificate,
)

User = get_user_model()


@pytest.fixture
def learner(db):
    return User.objects.create_user(
        username="s9c_learner", email="learner@example.com", password="pw",
    )


@pytest.fixture
def enrollment(db, learner):
    category = CourseCategory.objects.create(name="PM", slug="pm-s9", order=1)
    instructor = CourseInstructor.objects.create(name="Inst", title="PM")
    course = Course.objects.create(
        title="S9 Cert Course", slug="s9-cert-course",
        description="d", category=category, instructor=instructor,
        price=Decimal("0.00"), status="published",
    )
    module = CourseModule.objects.create(course=course, title="M1", order=1)
    CourseLesson.objects.create(module=module, title="L1", order=1)
    return Enrollment.objects.create(
        user=learner, course=course, email=learner.email,
        first_name="Lear", last_name="Ner", status="completed",
        amount_paid=Decimal("0.00"),
    )


@pytest.mark.django_db
def test_generate_certificate_uses_real_counts_not_placeholders(
    enrollment, learner,
):
    """When ``generate_certificate`` is called with a passing eligibility
    dict, the Certificate row must reflect the REAL counts from that dict,
    not the pre-fix placeholders 85/24/20/1/15/10.
    """
    fake_elig = {
        "eligible": True,
        "reason": "eligible",
        "progress_percent": 72,
        "lessons_total": 3,
        "lessons_completed": 3,
        "quizzes_total": 2,
        "quizzes_passed": 2,
        "exam_required": True,
        "exam_passed": True,
        "practice_total": 1,
        "practice_approved": 1,
    }
    client = APIClient()
    client.force_authenticate(learner)

    with patch.object(
        Enrollment, "certificate_eligibility", return_value=fake_elig,
    ):
        r = client.post(f"/api/v1/academy/certificate/generate/{enrollment.id}/")

    assert r.status_code == 200, r.content
    body = r.json()
    assert body.get("success") is True

    cert = Certificate.objects.get(id=body["certificate_id"])

    # Real counts from the eligibility dict (mapped from the actual
    # eligibility key names: exam_passed/practice_approved/progress_percent).
    assert cert.lessons_completed == 3
    assert cert.quizzes_passed == 2
    # exam_passed=True → 1
    assert cert.exams_passed == 1
    # practice_approved=1 submission → 1
    assert cert.practice_submitted == 1
    # progress_percent=72 is persisted as total_score
    assert cert.total_score == 72
    # simulations_completed isn't tracked in eligibility → always 0
    assert cert.simulations_completed == 0

    # None of the pre-fix placeholders may leak through — if the fix was
    # reverted these would be 24/20/1/15/10/85 respectively.
    assert cert.lessons_completed != 24
    assert cert.quizzes_passed != 20
    assert cert.simulations_completed != 15
    assert cert.practice_submitted != 10
    assert cert.total_score != 85
