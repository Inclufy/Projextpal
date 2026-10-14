"""Sprint 9 Agent B — academy bulk-generate-content endpoint (S9-06).

Covers permission gate, happy path (with LLM call mocked), and
idempotence (second run against a filled course is a no-op).

Run under SQLite:
    USE_SQLITE=1 python -m pytest tests/test_s9_b_academy_bulk_content.py -v
"""
from __future__ import annotations

# langchain-create-agent shim.
try:
    from langchain.agents import create_agent  # noqa: F401
except ImportError:  # pragma: no cover
    import langchain.agents as _la
    from unittest.mock import MagicMock

    def _stub_create_agent(*_a, **_kw):
        return MagicMock()

    _la.create_agent = _stub_create_agent  # type: ignore[attr-defined]

from unittest.mock import patch

import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from academy.models import (
    Course,
    CourseCategory,
    CourseLesson,
    CourseModule,
    Exam,
    QuizQuestion,
)

User = get_user_model()


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------
@pytest.fixture
def api_client() -> APIClient:
    return APIClient()


@pytest.fixture
def superadmin(db):
    u = User.objects.create_user(
        username="super_s9b",
        email="super_s9b@projextpal.com",
        password="pw",
    )
    u.role = "superadmin"
    u.is_superuser = True
    u.save()
    return u


@pytest.fixture
def regular_user(db):
    u = User.objects.create_user(
        username="nobody_s9b",
        email="nobody_s9b@projextpal.com",
        password="pw",
    )
    u.role = "pm"
    u.save()
    return u


@pytest.fixture
def course_with_lesson(db):
    cat = CourseCategory.objects.create(name="Test Cat", slug="test-cat")
    course = Course.objects.create(
        title="Bulk Test Course",
        slug="bulk-test",
        description="x",
        category=cat,
    )
    module = CourseModule.objects.create(
        course=course,
        title="Module 1",
        order=0,
    )
    lesson = CourseLesson.objects.create(
        module=module,
        title="Lesson 1",
        lesson_type="video",
        order=0,
        content="This is some lesson content about PRINCE2.",
    )
    return course, lesson


_FAKE_QUIZ_JSON = {
    "questions": [
        {
            "question": f"Q{i+1}?",
            "options": ["a", "b", "c", "d"],
            "correct": 0,
            "explanation": "because",
            "difficulty": "medium",
        }
        for i in range(5)
    ]
}

_FAKE_EXAM_JSON = {
    "questions": [
        {
            "question": f"Final Q{i+1}?",
            "options": ["a", "b", "c", "d"],
            "correct": 1,
            "explanation": "because",
            "difficulty": "medium",
            "points": 5,
        }
        for i in range(10)
    ]
}


# ---------------------------------------------------------------------------
# Permission gate
# ---------------------------------------------------------------------------
@pytest.mark.django_db
def test_bulk_generate_requires_superadmin(api_client, regular_user, course_with_lesson):
    api_client.force_authenticate(regular_user)
    r = api_client.post(
        "/api/v1/academy/admin/bulk-generate-content/",
        {"type": "both"},
        format="json",
    )
    assert r.status_code == 403


@pytest.mark.django_db
def test_bulk_generate_rejects_bad_type(api_client, superadmin):
    api_client.force_authenticate(superadmin)
    r = api_client.post(
        "/api/v1/academy/admin/bulk-generate-content/",
        {"type": "nonsense"},
        format="json",
    )
    assert r.status_code == 400


# ---------------------------------------------------------------------------
# Happy path (LLM mocked)
# ---------------------------------------------------------------------------
@pytest.mark.django_db
def test_bulk_generate_happy_path_both(api_client, superadmin, course_with_lesson):
    course, lesson = course_with_lesson
    api_client.force_authenticate(superadmin)

    def _fake_openai(prompt, system, max_retries=2):
        # Both prompts mention "exam"; the exam prompt starts with
        # "Based on this course outline" vs the quiz "lesson content".
        if "course outline" in prompt.lower() or "certification-grade" in system.lower():
            return _FAKE_EXAM_JSON
        return _FAKE_QUIZ_JSON

    with patch("academy.bulk_generate._call_openai", side_effect=_fake_openai):
        r = api_client.post(
            "/api/v1/academy/admin/bulk-generate-content/",
            {"type": "both", "course_id": str(course.id)},
            format="json",
        )

    assert r.status_code == 200, r.content
    body = r.json()
    assert body["generated_quizzes"] == 1  # one lesson filled
    assert body["generated_exams"] == 1
    assert body["errors"] == []

    # Verify DB side effects.
    assert QuizQuestion.objects.filter(lesson=lesson).count() == 5
    exam = Exam.objects.filter(course=course).first()
    assert exam is not None
    assert len(exam.questions) == 10


@pytest.mark.django_db
def test_bulk_generate_is_idempotent(api_client, superadmin, course_with_lesson):
    """Running twice against the same course does not duplicate rows,
    and the second run reports 0 new quizzes/exams."""
    course, lesson = course_with_lesson
    api_client.force_authenticate(superadmin)

    def _fake_openai(prompt, system, max_retries=2):
        if "course outline" in prompt.lower() or "certification-grade" in system.lower():
            return _FAKE_EXAM_JSON
        return _FAKE_QUIZ_JSON

    with patch("academy.bulk_generate._call_openai", side_effect=_fake_openai):
        api_client.post(
            "/api/v1/academy/admin/bulk-generate-content/",
            {"type": "both", "course_id": str(course.id)},
            format="json",
        )
        r2 = api_client.post(
            "/api/v1/academy/admin/bulk-generate-content/",
            {"type": "both", "course_id": str(course.id)},
            format="json",
        )

    assert r2.status_code == 200
    body = r2.json()
    assert body["generated_quizzes"] == 0  # lesson already has questions
    assert body["generated_exams"] == 0    # exam already has questions
    # No duplicate rows.
    assert QuizQuestion.objects.filter(lesson=lesson).count() == 5
    assert Exam.objects.filter(course=course).count() == 1


@pytest.mark.django_db
def test_bulk_generate_fills_empty_exam_in_place(
    api_client, superadmin, course_with_lesson
):
    """A pre-existing Exam row with questions=[] is the UAT symptom —
    the endpoint must FILL it rather than skip or duplicate."""
    course, _ = course_with_lesson
    stub_exam = Exam.objects.create(
        course=course,
        title="Stub",
        questions=[],
        is_active=False,
    )
    api_client.force_authenticate(superadmin)

    with patch("academy.bulk_generate._call_openai", return_value=_FAKE_EXAM_JSON):
        r = api_client.post(
            "/api/v1/academy/admin/bulk-generate-content/",
            {"type": "exams", "course_id": str(course.id)},
            format="json",
        )
    assert r.status_code == 200
    assert r.json()["generated_exams"] == 1
    stub_exam.refresh_from_db()
    assert len(stub_exam.questions) == 10
    assert stub_exam.is_active is True
    # Still only one Exam row for the course.
    assert Exam.objects.filter(course=course).count() == 1
