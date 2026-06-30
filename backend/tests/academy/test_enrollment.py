"""
Academy Tests - Enrollment, Progress & Reviews
Tests each feature one by one.
"""
import pytest
from decimal import Decimal
from django.utils import timezone
from academy.models import (
    CourseCategory, CourseInstructor, Course, CourseModule, CourseLesson,
    Enrollment, LessonProgress, CourseReview,
)


@pytest.fixture
def category(db):
    return CourseCategory.objects.create(name="PM", slug="pm", order=1)


@pytest.fixture
def instructor(db):
    return CourseInstructor.objects.create(name="Instructor", title="PM Expert")


@pytest.fixture
def course(db, category, instructor):
    return Course.objects.create(
        title="PM Course",
        slug="pm-course",
        description="Test course",
        category=category,
        instructor=instructor,
        price=Decimal("199.00"),
        status="published",
    )


@pytest.fixture
def module(db, course):
    return CourseModule.objects.create(course=course, title="Module 1", order=1)


@pytest.fixture
def lesson1(db, module):
    return CourseLesson.objects.create(module=module, title="Lesson 1", order=1)


@pytest.fixture
def lesson2(db, module):
    return CourseLesson.objects.create(module=module, title="Lesson 2", order=2)


@pytest.fixture
def lesson3(db, module):
    return CourseLesson.objects.create(module=module, title="Lesson 3", order=3)


@pytest.fixture
def enrollment(db, user, course):
    return Enrollment.objects.create(
        user=user,
        course=course,
        email=user.email,
        first_name="Test",
        last_name="User",
        status="active",
        amount_paid=Decimal("199.00"),
    )


@pytest.fixture
def enrollment_pending(db, course):
    return Enrollment.objects.create(
        course=course,
        email="pending@test.com",
        first_name="Pending",
        last_name="Student",
        status="pending",
    )


# ── 1. Enrollment Tests ─────────────────────────────────────────────

@pytest.mark.django_db
class TestEnrollment:
    """Test student enrollment lifecycle."""

    def test_create_enrollment(self, enrollment):
        import uuid
        assert isinstance(enrollment.pk, uuid.UUID)
        assert enrollment.status == "active"

    def test_enrollment_with_user(self, enrollment, user):
        assert enrollment.user == user
        assert enrollment.email == user.email

    def test_enrollment_without_user(self, enrollment_pending):
        assert enrollment_pending.user is None
        assert enrollment_pending.email == "pending@test.com"

    def test_enrollment_statuses(self, db, course):
        statuses = ["pending", "active", "completed", "expired", "refunded"]
        for i, status in enumerate(statuses):
            e = Enrollment.objects.create(
                course=course,
                email=f"{status}@test.com",
                first_name="Test",
                last_name=status,
                status=status,
            )
            assert e.status == status

    def test_enrollment_payment_info(self, enrollment):
        assert enrollment.amount_paid == Decimal("199.00")

    def test_enrollment_with_coupon(self, db, user, course):
        e = Enrollment.objects.create(
            user=user,
            course=course,
            email="coupon@test.com",
            first_name="Coupon",
            last_name="User",
            coupon_code="SAVE20",
            amount_paid=Decimal("159.20"),
        )
        assert e.coupon_code == "SAVE20"

    def test_enrollment_unique_per_email_course(self, enrollment, course):
        with pytest.raises(Exception):
            Enrollment.objects.create(
                course=course,
                email=enrollment.email,
                first_name="Dup",
                last_name="User",
            )

    def test_enrollment_str(self, enrollment):
        assert enrollment.email in str(enrollment)
        assert enrollment.course.title in str(enrollment)

    def test_enrollment_timestamps(self, enrollment):
        assert enrollment.enrolled_at is not None

    def test_enrollment_ordering(self, enrollment, enrollment_pending):
        enrollments = list(Enrollment.objects.all())
        assert enrollments[0].enrolled_at >= enrollments[1].enrolled_at


# ── 2. Progress Tracking Tests ──────────────────────────────────────

@pytest.mark.django_db
class TestLessonProgress:
    """Test lesson-by-lesson progress tracking."""

    def test_create_lesson_progress(self, enrollment, lesson1):
        progress = LessonProgress.objects.create(
            enrollment=enrollment,
            lesson=lesson1,
            is_completed=True,
            watch_time=600,
            completed_at=timezone.now(),
        )
        assert progress.is_completed is True
        assert progress.watch_time == 600

    def test_progress_not_completed(self, enrollment, lesson1):
        progress = LessonProgress.objects.create(
            enrollment=enrollment,
            lesson=lesson1,
            is_completed=False,
            watch_time=120,
        )
        assert progress.is_completed is False
        assert progress.completed_at is None

    def test_progress_unique_per_enrollment_lesson(self, enrollment, lesson1):
        LessonProgress.objects.create(
            enrollment=enrollment, lesson=lesson1, is_completed=True,
        )
        with pytest.raises(Exception):
            LessonProgress.objects.create(
                enrollment=enrollment, lesson=lesson1, is_completed=False,
            )

    def test_calculate_progress_zero(self, enrollment, lesson1, lesson2, lesson3):
        assert enrollment.calculate_progress() == 0

    def test_calculate_progress_partial(self, enrollment, lesson1, lesson2, lesson3):
        enrollment.completed_lessons.add(lesson1)
        progress = enrollment.calculate_progress()
        assert progress == 33  # 1/3 = 33%

    def test_calculate_progress_complete(self, enrollment, lesson1, lesson2, lesson3):
        enrollment.completed_lessons.add(lesson1, lesson2, lesson3)
        progress = enrollment.calculate_progress()
        assert progress == 100

    def test_calculate_progress_two_thirds(self, enrollment, lesson1, lesson2, lesson3):
        enrollment.completed_lessons.add(lesson1, lesson2)
        progress = enrollment.calculate_progress()
        assert progress == 66  # 2/3 = 66%


# ── 3. Course Review Tests ──────────────────────────────────────────

@pytest.mark.django_db
class TestCourseReview:
    """Test course reviews and ratings."""

    def test_create_review(self, enrollment, course):
        review = CourseReview.objects.create(
            course=course,
            enrollment=enrollment,
            rating=5,
            title="Excellent course!",
            text="Very thorough and practical.",
        )
        assert review.rating == 5
        assert review.is_verified is True

    def test_review_rating_range(self, enrollment, course):
        review = CourseReview.objects.create(
            course=course,
            enrollment=enrollment,
            rating=3,
            text="Average course",
        )
        assert 1 <= review.rating <= 5

    def test_review_featured(self, enrollment, course):
        review = CourseReview.objects.create(
            course=course,
            enrollment=enrollment,
            rating=5,
            text="Best PM course!",
            is_featured=True,
        )
        assert review.is_featured is True

    def test_review_one_per_enrollment(self, enrollment, course):
        CourseReview.objects.create(
            course=course, enrollment=enrollment,
            rating=4, text="Good course",
        )
        with pytest.raises(Exception):
            CourseReview.objects.create(
                course=course, enrollment=enrollment,
                rating=5, text="Duplicate",
            )

    def test_review_ordering(self, db, course, category, instructor):
        c2 = Course.objects.create(
            title="C2", slug="c2", description="C2",
            category=category, instructor=instructor,
        )
        e1 = Enrollment.objects.create(
            course=course, email="r1@test.com", first_name="R", last_name="1",
        )
        e2 = Enrollment.objects.create(
            course=c2, email="r2@test.com", first_name="R", last_name="2",
        )
        CourseReview.objects.create(course=course, enrollment=e1, rating=4, text="First")
        CourseReview.objects.create(course=c2, enrollment=e2, rating=5, text="Second")
        reviews = list(CourseReview.objects.all())
        assert reviews[0].created_at >= reviews[1].created_at
