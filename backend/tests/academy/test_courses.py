"""
Academy Tests - Course Categories, Courses, Modules, Lessons
Tests each feature one by one.
"""
import pytest
from decimal import Decimal
from academy.models import (
    CourseCategory, CourseInstructor, Course, CourseModule, CourseLesson,
    CourseRequirement, CourseLearningOutcome, CourseTargetAudience,
)


# ── Fixtures ─────────────────────────────────────────────────────────

@pytest.fixture
def category(db):
    return CourseCategory.objects.create(
        name="Project Management",
        slug="project-management",
        description="PM courses",
        icon="briefcase",
        order=1,
    )


@pytest.fixture
def category_agile(db):
    return CourseCategory.objects.create(
        name="Agile & Scrum",
        slug="agile-scrum",
        description="Agile methodology courses",
        icon="zap",
        order=2,
    )


@pytest.fixture
def category_leadership(db):
    return CourseCategory.objects.create(
        name="Leadership",
        slug="leadership",
        description="Leadership development courses",
        icon="users",
        order=3,
    )


@pytest.fixture
def instructor(db):
    return CourseInstructor.objects.create(
        name="Dr. Sarah Johnson",
        title="PMP, Senior PM Consultant",
        bio="20 years of PM experience",
        bio_nl="20 jaar PM ervaring",
    )


@pytest.fixture
def course(db, category, instructor):
    return Course.objects.create(
        title="Project Management Fundamentals",
        title_nl="Project Management Basis",
        slug="pm-fundamentals",
        subtitle="Learn PM from scratch",
        description="Complete PM course covering all fundamentals",
        description_nl="Complete PM cursus",
        category=category,
        instructor=instructor,
        price=Decimal("299.00"),
        original_price=Decimal("399.00"),
        difficulty="beginner",
        duration_hours=40,
        status="published",
        is_featured=True,
        has_certificate=True,
        rating=Decimal("4.5"),
        review_count=120,
        student_count=500,
    )


@pytest.fixture
def course_advanced(db, category, instructor):
    return Course.objects.create(
        title="Advanced PM Techniques",
        title_nl="Gevorderde PM Technieken",
        slug="pm-advanced",
        description="Advanced project management",
        category=category,
        instructor=instructor,
        price=Decimal("499.00"),
        difficulty="advanced",
        duration_hours=60,
        status="published",
    )


@pytest.fixture
def course_free(db, category, instructor):
    return Course.objects.create(
        title="PM Introduction",
        slug="pm-intro",
        description="Free introductory course",
        category=category,
        instructor=instructor,
        price=Decimal("0.00"),
        difficulty="beginner",
        status="published",
    )


@pytest.fixture
def course_draft(db, category, instructor):
    return Course.objects.create(
        title="Draft Course",
        slug="draft-course",
        description="Course in draft",
        category=category,
        instructor=instructor,
        status="draft",
    )


@pytest.fixture
def module1(db, course):
    return CourseModule.objects.create(
        course=course,
        title="Introduction to PM",
        title_nl="Introductie tot PM",
        description="Getting started",
        order=1,
    )


@pytest.fixture
def module2(db, course):
    return CourseModule.objects.create(
        course=course,
        title="Planning & Scheduling",
        title_nl="Planning & Scheduling",
        description="Project planning fundamentals",
        order=2,
    )


@pytest.fixture
def module3(db, course):
    return CourseModule.objects.create(
        course=course,
        title="Execution & Control",
        description="Running the project",
        order=3,
    )


@pytest.fixture
def lesson_video(db, module1):
    return CourseLesson.objects.create(
        module=module1,
        title="What is Project Management?",
        title_nl="Wat is Project Management?",
        lesson_type="video",
        duration_minutes=15,
        is_free_preview=True,
        order=1,
        video_url="https://example.com/video1",
    )


@pytest.fixture
def lesson_text(db, module1):
    return CourseLesson.objects.create(
        module=module1,
        title="PM History & Evolution",
        lesson_type="text",
        duration_minutes=10,
        order=2,
        content="Project management has evolved over decades...",
    )


@pytest.fixture
def lesson_quiz(db, module1):
    return CourseLesson.objects.create(
        module=module1,
        title="Module 1 Quiz",
        lesson_type="quiz",
        duration_minutes=5,
        order=3,
    )


@pytest.fixture
def lesson_assignment(db, module2):
    return CourseLesson.objects.create(
        module=module2,
        title="Create a Project Charter",
        lesson_type="assignment",
        duration_minutes=45,
        order=1,
    )


@pytest.fixture
def lesson_download(db, module2):
    return CourseLesson.objects.create(
        module=module2,
        title="PM Templates Pack",
        lesson_type="download",
        duration_minutes=0,
        order=2,
    )


# ── 1. Course Category Tests ────────────────────────────────────────

@pytest.mark.django_db
class TestCourseCategory:
    """Test course category CRUD and properties."""

    def test_create_category(self, category):
        assert category.pk is not None
        assert category.name == "Project Management"
        assert category.slug == "project-management"

    def test_category_ordering(self, category, category_agile, category_leadership):
        cats = list(CourseCategory.objects.all())
        assert cats[0].order <= cats[1].order <= cats[2].order

    def test_category_str(self, category):
        assert str(category) == "Project Management"

    def test_multiple_categories(self, category, category_agile, category_leadership):
        assert CourseCategory.objects.count() == 3

    def test_category_icon(self, category):
        assert category.icon == "briefcase"


# ── 2. Course Instructor Tests ──────────────────────────────────────

@pytest.mark.django_db
class TestCourseInstructor:
    """Test instructor profiles."""

    def test_create_instructor(self, instructor):
        assert instructor.pk is not None
        assert instructor.name == "Dr. Sarah Johnson"
        assert instructor.title == "PMP, Senior PM Consultant"

    def test_instructor_str(self, instructor):
        assert str(instructor) == "Dr. Sarah Johnson"

    def test_instructor_bilingual_bio(self, instructor):
        assert instructor.bio == "20 years of PM experience"
        assert instructor.bio_nl == "20 jaar PM ervaring"

    def test_instructor_without_user(self, instructor):
        assert instructor.user is None


# ── 3. Course Tests ─────────────────────────────────────────────────

@pytest.mark.django_db
class TestCourse:
    """Test course creation, properties, and queries."""

    def test_create_course(self, course):
        assert course.pk is not None
        assert course.title == "Project Management Fundamentals"

    def test_course_uuid_primary_key(self, course):
        import uuid
        assert isinstance(course.pk, uuid.UUID)

    def test_course_bilingual_content(self, course):
        assert course.title_nl == "Project Management Basis"
        assert course.description_nl == "Complete PM cursus"

    def test_course_pricing(self, course):
        assert course.price == Decimal("299.00")
        assert course.original_price == Decimal("399.00")

    def test_course_discount_percent(self, course):
        expected = int((1 - 299 / 399) * 100)
        assert course.discount_percent == expected

    def test_course_no_discount(self, course_advanced):
        assert course_advanced.discount_percent == 0

    def test_course_is_free(self, course_free):
        assert course_free.is_free is True

    def test_course_is_not_free(self, course):
        assert course.is_free is False

    def test_course_difficulty_levels(self, course, course_advanced):
        assert course.difficulty == "beginner"
        assert course_advanced.difficulty == "advanced"

    def test_course_status_draft(self, course_draft):
        assert course_draft.status == "draft"

    def test_course_status_published(self, course):
        assert course.status == "published"

    def test_course_featured_flag(self, course):
        assert course.is_featured is True

    def test_course_certificate_flag(self, course):
        assert course.has_certificate is True

    def test_course_stats(self, course):
        assert course.rating == Decimal("4.5")
        assert course.review_count == 120
        assert course.student_count == 500

    def test_course_duration(self, course):
        assert course.duration_hours == 40

    def test_course_category_relationship(self, course, category):
        assert course.category == category
        assert course in category.courses.all()

    def test_course_instructor_relationship(self, course, instructor):
        assert course.instructor == instructor
        assert course in instructor.courses.all()

    def test_course_str(self, course):
        assert str(course) == "Project Management Fundamentals"

    def test_course_ordering_featured_first(self, course, course_advanced):
        courses = list(Course.objects.all())
        # Featured course should appear first
        assert courses[0].is_featured is True

    def test_multiple_courses_in_category(self, course, course_advanced, course_free, category):
        assert category.courses.count() == 3


# ── 4. Course Module Tests ──────────────────────────────────────────

@pytest.mark.django_db
class TestCourseModule:
    """Test course modules/chapters."""

    def test_create_module(self, module1):
        assert module1.pk is not None
        assert module1.title == "Introduction to PM"

    def test_module_ordering(self, module1, module2, module3):
        modules = list(CourseModule.objects.filter(course=module1.course))
        assert [m.order for m in modules] == [1, 2, 3]

    def test_module_bilingual(self, module1):
        assert module1.title_nl == "Introductie tot PM"

    def test_module_course_relationship(self, module1, course):
        assert module1.course == course
        assert module1 in course.modules.all()

    def test_module_str(self, module1, course):
        assert course.title in str(module1)

    def test_multiple_modules(self, module1, module2, module3, course):
        assert course.modules.count() == 3


# ── 5. Course Lesson Tests ──────────────────────────────────────────

@pytest.mark.django_db
class TestCourseLesson:
    """Test individual lessons within modules."""

    def test_create_video_lesson(self, lesson_video):
        assert lesson_video.lesson_type == "video"
        assert lesson_video.duration_minutes == 15
        assert lesson_video.video_url == "https://example.com/video1"

    def test_create_text_lesson(self, lesson_text):
        assert lesson_text.lesson_type == "text"
        assert "evolved" in lesson_text.content

    def test_create_quiz_lesson(self, lesson_quiz):
        assert lesson_quiz.lesson_type == "quiz"

    def test_create_assignment_lesson(self, lesson_assignment):
        assert lesson_assignment.lesson_type == "assignment"
        assert lesson_assignment.duration_minutes == 45

    def test_create_download_lesson(self, lesson_download):
        assert lesson_download.lesson_type == "download"

    def test_lesson_free_preview(self, lesson_video, lesson_text):
        assert lesson_video.is_free_preview is True
        assert lesson_text.is_free_preview is False

    def test_lesson_ordering(self, lesson_video, lesson_text, lesson_quiz):
        lessons = list(CourseLesson.objects.filter(module=lesson_video.module))
        assert [l.order for l in lessons] == [1, 2, 3]

    def test_lesson_bilingual(self, lesson_video):
        assert lesson_video.title_nl == "Wat is Project Management?"

    def test_lesson_module_relationship(self, lesson_video, module1):
        assert lesson_video.module == module1
        assert lesson_video in module1.lessons.all()

    def test_lesson_visual_type_default(self, lesson_video):
        assert lesson_video.visual_type == "auto"

    def test_lesson_visual_type_choices(self, module1):
        lesson = CourseLesson.objects.create(
            module=module1, title="Risk Lesson",
            visual_type="risk", order=10,
        )
        assert lesson.visual_type == "risk"

    def test_lesson_visual_data_json(self, module1):
        lesson = CourseLesson.objects.create(
            module=module1, title="Visual Lesson",
            visual_type="triple_constraint",
            visual_data={"labels": ["Time", "Cost", "Scope"]},
            order=11,
        )
        assert lesson.visual_data["labels"] == ["Time", "Cost", "Scope"]

    def test_lesson_ai_fields(self, module1):
        lesson = CourseLesson.objects.create(
            module=module1, title="AI Lesson",
            ai_profile={"model": "gpt-4"},
            simulation_id="sim-001",
            practice_set_id="ps-001",
            order=12,
        )
        assert lesson.ai_profile["model"] == "gpt-4"
        assert lesson.simulation_id == "sim-001"

    def test_lesson_str(self, lesson_video):
        assert str(lesson_video) == "What is Project Management?"


# ── 6. Course Requirements ──────────────────────────────────────────

@pytest.mark.django_db
class TestCourseRequirement:
    """Test course prerequisites."""

    def test_create_requirement(self, course):
        req = CourseRequirement.objects.create(
            course=course,
            text="Basic computer skills",
            text_nl="Basis computervaardigheden",
            order=1,
        )
        assert req.pk is not None
        assert req.text_nl == "Basis computervaardigheden"

    def test_multiple_requirements(self, course):
        CourseRequirement.objects.create(course=course, text="Req 1", order=1)
        CourseRequirement.objects.create(course=course, text="Req 2", order=2)
        CourseRequirement.objects.create(course=course, text="Req 3", order=3)
        assert course.requirements.count() == 3


# ── 7. Course Learning Outcomes ─────────────────────────────────────

@pytest.mark.django_db
class TestCourseLearningOutcome:
    """Test course learning goals."""

    def test_create_outcome(self, course):
        outcome = CourseLearningOutcome.objects.create(
            course=course,
            text="Understand project lifecycle",
            text_nl="Begrijp project levenscyclus",
            order=1,
        )
        assert outcome.pk is not None

    def test_multiple_outcomes(self, course):
        CourseLearningOutcome.objects.create(course=course, text="Outcome 1", order=1)
        CourseLearningOutcome.objects.create(course=course, text="Outcome 2", order=2)
        assert course.learning_outcomes.count() == 2


# ── 8. Course Target Audience ───────────────────────────────────────

@pytest.mark.django_db
class TestCourseTargetAudience:
    """Test target audience descriptions."""

    def test_create_audience(self, course):
        audience = CourseTargetAudience.objects.create(
            course=course,
            text="Aspiring project managers",
            text_nl="Aspirant projectmanagers",
            order=1,
        )
        assert audience.pk is not None

    def test_multiple_audiences(self, course):
        CourseTargetAudience.objects.create(course=course, text="PM", order=1)
        CourseTargetAudience.objects.create(course=course, text="Team leads", order=2)
        CourseTargetAudience.objects.create(course=course, text="Developers", order=3)
        assert course.target_audience.count() == 3


# ── 9. API Endpoint Tests ───────────────────────────────────────────

@pytest.mark.django_db
class TestCourseAPI:
    """Test course API endpoints."""

    def test_list_courses(self, authenticated_client, course):
        response = authenticated_client.get("/api/v1/academy/courses/")
        assert response.status_code == 200
        data = response.json()
        results = data if isinstance(data, list) else data.get("results", [])
        assert len(results) >= 1

    def test_retrieve_course(self, authenticated_client, course):
        response = authenticated_client.get(f"/api/v1/academy/courses/{course.pk}/")
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Project Management Fundamentals"

    def test_list_modules(self, authenticated_client, module1, module2):
        response = authenticated_client.get(
            f"/api/v1/academy/modules/?course={module1.course.pk}"
        )
        assert response.status_code == 200

    def test_list_lessons(self, authenticated_client, lesson_video, lesson_text):
        response = authenticated_client.get(
            f"/api/v1/academy/lessons/?module={lesson_video.module.pk}"
        )
        assert response.status_code == 200

    def test_skills_categories_endpoint(self, authenticated_client):
        response = authenticated_client.get("/api/v1/academy/skills/categories/")
        assert response.status_code == 200

    def test_skills_endpoint(self, authenticated_client):
        response = authenticated_client.get("/api/v1/academy/skills/skills/")
        assert response.status_code == 200
