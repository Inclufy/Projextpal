"""
Comprehensive Tests for the Academy App
========================================

Covers:
1. Course listing (public, no auth needed)
2. Course filtering by category and difficulty
3. Course detail retrieval
4. CourseModule listing filtered by course
5. CourseLesson CRUD
6. Lesson quiz retrieval (requires auth)
7. Course model properties (is_free, discount_percent)
8. Enrollment creation and status
9. Certificate generation basics
"""

import os
import uuid
from decimal import Decimal

# Set a dummy OpenAI API key before any Django URL imports trigger
# academy.admin_api module-level OpenAI client initialisation.
os.environ.setdefault("OPENAI_API_KEY", "sk-test-dummy-key-for-testing")

import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from academy.models import (
    Certificate,
    Course,
    CourseCategory,
    CourseInstructor,
    CourseLesson,
    CourseModule,
    Enrollment,
    QuizAnswer,
    QuizQuestion,
)


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture
def api_client():
    """Unauthenticated API client."""
    return APIClient()


@pytest.fixture
def category(db):
    """Create a course category."""
    return CourseCategory.objects.create(
        name="Project Management",
        slug="project-management",
        description="PM courses",
        icon="briefcase",
        order=1,
    )


@pytest.fixture
def second_category(db):
    """Create a second course category."""
    return CourseCategory.objects.create(
        name="Agile",
        slug="agile",
        description="Agile courses",
        icon="zap",
        order=2,
    )


@pytest.fixture
def instructor(db):
    """Create a course instructor."""
    return CourseInstructor.objects.create(
        name="Jane Doe",
        title="PMP, Senior PM Consultant",
        bio="Expert project manager with 20 years of experience.",
    )


@pytest.fixture
def published_course(db, category, instructor):
    """Create a published course with typical data."""
    return Course.objects.create(
        title="Intro to PM",
        title_nl="Introductie tot PM",
        slug="intro-to-pm",
        description="An introductory course on project management.",
        category=category,
        instructor=instructor,
        price=Decimal("99.99"),
        original_price=Decimal("149.99"),
        difficulty="beginner",
        duration_hours=10,
        status="published",
        is_featured=True,
        has_certificate=True,
        rating=Decimal("4.5"),
        student_count=120,
    )


@pytest.fixture
def draft_course(db, category):
    """Create a draft course."""
    return Course.objects.create(
        title="Advanced PM",
        title_nl="Gevorderd PM",
        slug="advanced-pm",
        description="An advanced PM course.",
        category=category,
        price=Decimal("199.99"),
        difficulty="advanced",
        duration_hours=20,
        status="draft",
    )


@pytest.fixture
def free_course(db, category):
    """Create a free course."""
    return Course.objects.create(
        title="PM Basics Free",
        title_nl="PM Basis Gratis",
        slug="pm-basics-free",
        description="A free introductory course.",
        category=category,
        price=Decimal("0.00"),
        difficulty="beginner",
        duration_hours=3,
        status="published",
    )


@pytest.fixture
def intermediate_course(db, second_category):
    """Create an intermediate course in the Agile category."""
    return Course.objects.create(
        title="Agile Fundamentals",
        title_nl="Agile Fundamenten",
        slug="agile-fundamentals",
        description="Agile methodology basics.",
        category=second_category,
        price=Decimal("79.99"),
        difficulty="intermediate",
        duration_hours=8,
        status="published",
    )


@pytest.fixture
def expert_course(db, second_category):
    """Create an expert-level course in the Agile category."""
    return Course.objects.create(
        title="SAFe Expert",
        title_nl="SAFe Expert",
        slug="safe-expert",
        description="SAFe expert level course.",
        category=second_category,
        price=Decimal("299.99"),
        difficulty="expert",
        duration_hours=40,
        status="published",
    )


@pytest.fixture
def course_module(db, published_course):
    """Create a module for the published course."""
    return CourseModule.objects.create(
        course=published_course,
        title="Module 1: Foundations",
        title_nl="Module 1: Basis",
        description="The foundational module.",
        order=1,
    )


@pytest.fixture
def second_module(db, published_course):
    """Create a second module for the published course."""
    return CourseModule.objects.create(
        course=published_course,
        title="Module 2: Planning",
        title_nl="Module 2: Planning",
        description="The planning module.",
        order=2,
    )


@pytest.fixture
def lesson_video(db, course_module):
    """Create a video lesson."""
    return CourseLesson.objects.create(
        module=course_module,
        title="What is Project Management?",
        title_nl="Wat is Projectmanagement?",
        lesson_type="video",
        duration_minutes=15,
        is_free_preview=True,
        order=1,
        content="Introduction to PM concepts.",
        content_nl="Introductie tot PM concepten.",
    )


@pytest.fixture
def lesson_text(db, course_module):
    """Create a text lesson."""
    return CourseLesson.objects.create(
        module=course_module,
        title="PM Methodologies Overview",
        title_nl="PM Methodologieen Overzicht",
        lesson_type="text",
        duration_minutes=10,
        is_free_preview=False,
        order=2,
        content="Overview of various PM methodologies.",
        content_nl="Overzicht van diverse PM methodologieen.",
    )


@pytest.fixture
def lesson_quiz(db, course_module):
    """Create a quiz lesson."""
    return CourseLesson.objects.create(
        module=course_module,
        title="Module 1 Quiz",
        title_nl="Module 1 Quiz",
        lesson_type="quiz",
        duration_minutes=5,
        is_free_preview=False,
        order=3,
    )


@pytest.fixture
def quiz_question(db, lesson_quiz):
    """Create a quiz question with answers."""
    question = QuizQuestion.objects.create(
        lesson=lesson_quiz,
        question_text="What is a project?",
        question_text_nl="Wat is een project?",
        question_type="multiple_choice",
        points=2,
        order=1,
    )
    QuizAnswer.objects.create(
        question=question,
        answer_text="A temporary endeavor",
        answer_text_nl="Een tijdelijke inspanning",
        is_correct=True,
        order=1,
    )
    QuizAnswer.objects.create(
        question=question,
        answer_text="A permanent operation",
        answer_text_nl="Een permanente operatie",
        is_correct=False,
        order=2,
    )
    return question


@pytest.fixture
def second_quiz_question(db, lesson_quiz):
    """Create a second quiz question (true/false)."""
    question = QuizQuestion.objects.create(
        lesson=lesson_quiz,
        question_text="Projects always have a defined start and end.",
        question_type="true_false",
        points=1,
        order=2,
    )
    QuizAnswer.objects.create(
        question=question,
        answer_text="True",
        is_correct=True,
        order=1,
    )
    QuizAnswer.objects.create(
        question=question,
        answer_text="False",
        is_correct=False,
        order=2,
    )
    return question


@pytest.fixture
def enrollment(db, published_course, user):
    """Create an enrollment for the test user."""
    return Enrollment.objects.create(
        user=user,
        course=published_course,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        status="active",
        progress=50,
        amount_paid=Decimal("99.99"),
    )


@pytest.fixture
def completed_enrollment(db, published_course):
    """Create a completed enrollment for a non-registered user."""
    return Enrollment.objects.create(
        course=published_course,
        email="student@example.com",
        first_name="Student",
        last_name="Example",
        status="completed",
        progress=100,
        amount_paid=Decimal("99.99"),
    )


# ===========================================================================
# 1. Course Listing (public, no auth needed)
# ===========================================================================


@pytest.mark.django_db
class TestCourseListPublic:
    """Public course listing -- no authentication required."""

    def test_list_courses_returns_200(self, api_client, published_course):
        """Anyone can list courses without authentication."""
        url = reverse("course-list")
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK

    def test_list_courses_returns_published_courses(
        self, api_client, published_course, draft_course
    ):
        """The listing endpoint returns all courses (including draft)
        because the viewset uses Course.objects.all()."""
        url = reverse("course-list")
        response = api_client.get(url)
        slugs = [c["slug"] for c in response.data]
        assert published_course.slug in slugs

    def test_list_courses_contains_expected_fields(self, api_client, published_course):
        """Each course in the listing should expose key fields."""
        url = reverse("course-list")
        response = api_client.get(url)
        course_data = response.data[0]
        expected_fields = [
            "id",
            "title",
            "slug",
            "description",
            "price",
            "difficulty",
            "duration_hours",
            "is_featured",
            "status",
            "category",
            "category_name",
            "rating",
            "student_count",
            "modules",
        ]
        for field in expected_fields:
            assert field in course_data, f"Missing field: {field}"

    def test_list_courses_includes_category_name(
        self, api_client, published_course, category
    ):
        """Course listing should include the human-readable category name."""
        url = reverse("course-list")
        response = api_client.get(url)
        course_data = next(
            c for c in response.data if c["slug"] == published_course.slug
        )
        assert course_data["category_name"] == category.name

    def test_list_courses_unauthenticated(self, published_course):
        """Explicitly verify an unauthenticated client gets 200."""
        client = APIClient()
        url = reverse("course-list")
        response = client.get(url)
        assert response.status_code == status.HTTP_200_OK

    def test_list_multiple_courses(
        self, api_client, published_course, free_course, intermediate_course
    ):
        """Multiple courses are returned in the listing."""
        url = reverse("course-list")
        response = api_client.get(url)
        assert len(response.data) >= 3


# ===========================================================================
# 2. Course Filtering by Category and Difficulty
# ===========================================================================


@pytest.mark.django_db
class TestCourseFiltering:
    """Filtering courses by query parameters.

    Note: The default ReadOnlyModelViewSet does not provide built-in
    filtering.  These tests verify the data so that filters can be
    applied client-side or validate future server-side additions.
    """

    def test_courses_have_category_field(
        self, api_client, published_course, intermediate_course
    ):
        """Each course exposes its category id for client-side filtering."""
        url = reverse("course-list")
        response = api_client.get(url)
        for course in response.data:
            assert "category" in course

    def test_courses_have_difficulty_field(
        self, api_client, published_course, intermediate_course, expert_course
    ):
        """Each course exposes its difficulty for client-side filtering."""
        url = reverse("course-list")
        response = api_client.get(url)
        difficulties = {c["difficulty"] for c in response.data}
        assert "beginner" in difficulties
        assert "intermediate" in difficulties
        assert "expert" in difficulties

    def test_filter_courses_by_category_client_side(
        self,
        api_client,
        published_course,
        intermediate_course,
        category,
        second_category,
    ):
        """Verify data correctness for client-side category filtering."""
        url = reverse("course-list")
        response = api_client.get(url)
        pm_courses = [
            c for c in response.data if c["category"] == category.pk
        ]
        agile_courses = [
            c for c in response.data if c["category"] == second_category.pk
        ]
        assert len(pm_courses) >= 1
        assert len(agile_courses) >= 1

    def test_filter_courses_by_difficulty_client_side(
        self, api_client, published_course, expert_course
    ):
        """Verify data correctness for client-side difficulty filtering."""
        url = reverse("course-list")
        response = api_client.get(url)
        beginners = [c for c in response.data if c["difficulty"] == "beginner"]
        experts = [c for c in response.data if c["difficulty"] == "expert"]
        assert len(beginners) >= 1
        assert len(experts) >= 1

    def test_multiple_categories_in_listing(
        self,
        api_client,
        published_course,
        intermediate_course,
        category,
        second_category,
    ):
        """Both categories appear in the listing."""
        url = reverse("course-list")
        response = api_client.get(url)
        category_names = {c["category_name"] for c in response.data}
        assert category.name in category_names
        assert second_category.name in category_names


# ===========================================================================
# 3. Course Detail Retrieval
# ===========================================================================


@pytest.mark.django_db
class TestCourseDetail:
    """Retrieving a single course by its UUID."""

    def test_get_course_detail_returns_200(self, api_client, published_course):
        """Fetching a valid course should return 200."""
        url = reverse("course-detail", kwargs={"pk": str(published_course.pk)})
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK

    def test_course_detail_contains_all_fields(self, api_client, published_course):
        """The detail response includes every expected field."""
        url = reverse("course-detail", kwargs={"pk": str(published_course.pk)})
        response = api_client.get(url)
        data = response.data
        assert data["title"] == published_course.title
        assert data["slug"] == published_course.slug
        assert Decimal(data["price"]) == published_course.price
        assert data["difficulty"] == published_course.difficulty
        assert data["is_featured"] == published_course.is_featured

    def test_course_detail_includes_modules(
        self, api_client, published_course, course_module, second_module
    ):
        """The detail response nests course modules."""
        url = reverse("course-detail", kwargs={"pk": str(published_course.pk)})
        response = api_client.get(url)
        assert len(response.data["modules"]) == 2

    def test_course_detail_modules_contain_lessons(
        self, api_client, published_course, course_module, lesson_video, lesson_text
    ):
        """Modules nested in the detail response include their lessons."""
        url = reverse("course-detail", kwargs={"pk": str(published_course.pk)})
        response = api_client.get(url)
        module_data = response.data["modules"][0]
        assert "lessons" in module_data
        assert len(module_data["lessons"]) == 2

    def test_course_detail_nonexistent_returns_404(self, api_client):
        """A random UUID should yield 404."""
        fake_uuid = str(uuid.uuid4())
        url = reverse("course-detail", kwargs={"pk": fake_uuid})
        response = api_client.get(url)
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_course_detail_instructor_name(
        self, api_client, published_course, instructor
    ):
        """The instructor name is included in the detail response."""
        url = reverse("course-detail", kwargs={"pk": str(published_course.pk)})
        response = api_client.get(url)
        assert response.data["instructor_name"] == instructor.name

    def test_course_detail_no_auth_required(self, published_course):
        """Course detail is publicly accessible."""
        client = APIClient()
        url = reverse("course-detail", kwargs={"pk": str(published_course.pk)})
        response = client.get(url)
        assert response.status_code == status.HTTP_200_OK


# ===========================================================================
# 4. CourseModule Listing Filtered by Course
# ===========================================================================


@pytest.mark.django_db
class TestCourseModuleListing:
    """CourseModule list endpoint, optionally filtered by course."""

    def test_list_modules_returns_200(self, api_client, course_module):
        """Module listing endpoint returns 200."""
        url = reverse("module-list")
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK

    def test_list_modules_filter_by_course(
        self, api_client, published_course, course_module, second_module
    ):
        """Filtering modules by ?course=<id> returns only that course's modules."""
        url = reverse("module-list")
        response = api_client.get(url, {"course": str(published_course.pk)})
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 2
        for module in response.data:
            assert str(module["course"]) == str(published_course.pk)

    def test_list_modules_filter_excludes_other_courses(
        self, api_client, published_course, course_module, second_category
    ):
        """Modules from other courses are excluded when filtering."""
        other_course = Course.objects.create(
            title="Other Course",
            slug="other-course",
            description="Another course.",
            category=second_category,
            price=Decimal("50.00"),
        )
        CourseModule.objects.create(
            course=other_course, title="Other Module", order=1
        )
        url = reverse("module-list")
        response = api_client.get(url, {"course": str(published_course.pk)})
        for module in response.data:
            assert str(module["course"]) == str(published_course.pk)

    def test_list_modules_without_filter_returns_all(
        self, api_client, published_course, course_module, second_module, second_category
    ):
        """Without a course filter, all modules are returned."""
        other_course = Course.objects.create(
            title="Other Course 2",
            slug="other-course-2",
            description="Another course.",
            category=second_category,
            price=Decimal("50.00"),
        )
        CourseModule.objects.create(
            course=other_course, title="Other Module 2", order=1
        )
        url = reverse("module-list")
        response = api_client.get(url)
        assert len(response.data) >= 3

    def test_modules_ordered_by_order_field(
        self, api_client, published_course, course_module, second_module
    ):
        """Modules are returned in order."""
        url = reverse("module-list")
        response = api_client.get(url, {"course": str(published_course.pk)})
        orders = [m["order"] for m in response.data]
        assert orders == sorted(orders)

    def test_module_includes_lessons(
        self, api_client, course_module, lesson_video, lesson_text
    ):
        """Each module includes its nested lessons."""
        url = reverse("module-list")
        response = api_client.get(url)
        module_data = next(
            m for m in response.data if m["id"] == course_module.pk
        )
        assert "lessons" in module_data
        assert len(module_data["lessons"]) == 2


# ===========================================================================
# 5. CourseLesson CRUD
# ===========================================================================


@pytest.mark.django_db
class TestCourseLessonCRUD:
    """Full CRUD operations on the CourseLesson endpoint."""

    def test_list_lessons_returns_200(self, api_client, lesson_video):
        """Lesson listing returns 200."""
        url = reverse("lesson-list")
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK

    def test_list_lessons_filter_by_module(
        self, api_client, course_module, second_module, lesson_video, lesson_text
    ):
        """Lessons can be filtered by ?module=<id>."""
        # Create a lesson in the second module
        CourseLesson.objects.create(
            module=second_module,
            title="Planning Basics",
            lesson_type="text",
            order=1,
        )
        url = reverse("lesson-list")
        response = api_client.get(url, {"module": course_module.pk})
        assert response.status_code == status.HTTP_200_OK
        for lesson in response.data:
            assert lesson["module"] == course_module.pk

    def test_retrieve_lesson_detail(self, api_client, lesson_video):
        """Retrieve a single lesson by pk."""
        url = reverse("lesson-detail", kwargs={"pk": lesson_video.pk})
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["title"] == lesson_video.title

    def test_create_lesson(self, api_client, course_module):
        """Create a new lesson via POST."""
        url = reverse("lesson-list")
        data = {
            "module": course_module.pk,
            "title": "New Lesson",
            "title_nl": "Nieuwe Les",
            "lesson_type": "text",
            "duration_minutes": 20,
            "is_free_preview": False,
            "order": 10,
            "content": "Some content here.",
            "content_nl": "Wat inhoud hier.",
        }
        response = api_client.post(url, data, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["title"] == "New Lesson"
        assert CourseLesson.objects.filter(title="New Lesson").exists()

    def test_update_lesson(self, api_client, lesson_video):
        """Full update (PUT) a lesson."""
        url = reverse("lesson-detail", kwargs={"pk": lesson_video.pk})
        data = {
            "module": lesson_video.module.pk,
            "title": "Updated Title",
            "title_nl": lesson_video.title_nl,
            "lesson_type": lesson_video.lesson_type,
            "duration_minutes": 25,
            "is_free_preview": lesson_video.is_free_preview,
            "order": lesson_video.order,
            "content": lesson_video.content,
            "content_nl": lesson_video.content_nl,
        }
        response = api_client.put(url, data, format="json")
        assert response.status_code == status.HTTP_200_OK
        lesson_video.refresh_from_db()
        assert lesson_video.title == "Updated Title"
        assert lesson_video.duration_minutes == 25

    def test_partial_update_lesson(self, api_client, lesson_video):
        """Partial update (PATCH) a lesson."""
        url = reverse("lesson-detail", kwargs={"pk": lesson_video.pk})
        response = api_client.patch(
            url, {"duration_minutes": 30}, format="json"
        )
        assert response.status_code == status.HTTP_200_OK
        lesson_video.refresh_from_db()
        assert lesson_video.duration_minutes == 30

    def test_delete_lesson(self, api_client, lesson_video):
        """Delete a lesson."""
        url = reverse("lesson-detail", kwargs={"pk": lesson_video.pk})
        response = api_client.delete(url)
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not CourseLesson.objects.filter(pk=lesson_video.pk).exists()

    def test_create_lesson_missing_required_fields(self, api_client):
        """Creating a lesson without required fields should fail."""
        url = reverse("lesson-list")
        response = api_client.post(url, {}, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_lessons_ordered_by_order_field(
        self, api_client, course_module, lesson_video, lesson_text
    ):
        """Lessons are returned ordered by their 'order' field."""
        url = reverse("lesson-list")
        response = api_client.get(url, {"module": course_module.pk})
        orders = [l["order"] for l in response.data]
        assert orders == sorted(orders)

    def test_lesson_contains_visual_fields(self, api_client, lesson_video):
        """Lesson response includes visual_type and visual_data fields."""
        url = reverse("lesson-detail", kwargs={"pk": lesson_video.pk})
        response = api_client.get(url)
        assert "visual_type" in response.data
        assert "visual_data" in response.data


# ===========================================================================
# 6. Lesson Quiz Retrieval (requires auth)
# ===========================================================================


@pytest.mark.django_db
class TestLessonQuizRetrieval:
    """Quiz retrieval action on the lesson endpoint -- requires auth."""

    def test_quiz_requires_authentication(self, api_client, lesson_quiz):
        """Unauthenticated request to quiz action should return 401 or 403."""
        url = reverse("lesson-quiz", kwargs={"pk": lesson_quiz.pk})
        response = api_client.get(url)
        assert response.status_code in (
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_403_FORBIDDEN,
        )

    def test_quiz_returns_200_for_authenticated_user(
        self,
        authenticated_client,
        lesson_quiz,
        quiz_question,
    ):
        """Authenticated user can retrieve quiz data."""
        url = reverse("lesson-quiz", kwargs={"pk": lesson_quiz.pk})
        response = authenticated_client.get(url)
        assert response.status_code == status.HTTP_200_OK

    def test_quiz_response_contains_questions(
        self,
        authenticated_client,
        lesson_quiz,
        quiz_question,
        second_quiz_question,
    ):
        """Quiz response contains all questions."""
        url = reverse("lesson-quiz", kwargs={"pk": lesson_quiz.pk})
        response = authenticated_client.get(url)
        assert "questions" in response.data
        assert len(response.data["questions"]) == 2

    def test_quiz_response_contains_total_points(
        self,
        authenticated_client,
        lesson_quiz,
        quiz_question,
        second_quiz_question,
    ):
        """Quiz response includes total_points."""
        url = reverse("lesson-quiz", kwargs={"pk": lesson_quiz.pk})
        response = authenticated_client.get(url)
        assert "total_points" in response.data
        # quiz_question has 2 points, second_quiz_question has 1 point
        assert response.data["total_points"] == 3

    def test_quiz_question_structure(
        self, authenticated_client, lesson_quiz, quiz_question
    ):
        """Each question has the expected keys."""
        url = reverse("lesson-quiz", kwargs={"pk": lesson_quiz.pk})
        response = authenticated_client.get(url)
        q = response.data["questions"][0]
        assert "id" in q
        assert "question" in q
        assert "type" in q
        assert "points" in q
        assert "answers" in q

    def test_quiz_answer_structure(
        self, authenticated_client, lesson_quiz, quiz_question
    ):
        """Each answer within a question has the expected keys."""
        url = reverse("lesson-quiz", kwargs={"pk": lesson_quiz.pk})
        response = authenticated_client.get(url)
        answer = response.data["questions"][0]["answers"][0]
        assert "id" in answer
        assert "text" in answer
        assert "order" in answer

    def test_quiz_answers_do_not_expose_correctness(
        self, authenticated_client, lesson_quiz, quiz_question
    ):
        """The quiz endpoint should NOT reveal which answer is correct."""
        url = reverse("lesson-quiz", kwargs={"pk": lesson_quiz.pk})
        response = authenticated_client.get(url)
        answer = response.data["questions"][0]["answers"][0]
        assert "is_correct" not in answer

    def test_quiz_for_non_quiz_lesson_returns_400(
        self, authenticated_client, lesson_video
    ):
        """Attempting to fetch quiz on a non-quiz lesson returns 400."""
        url = reverse("lesson-quiz", kwargs={"pk": lesson_video.pk})
        response = authenticated_client.get(url)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "error" in response.data

    def test_quiz_nl_language_support(
        self, authenticated_client, lesson_quiz, quiz_question
    ):
        """When lang=nl, question text and answer text use Dutch content."""
        url = reverse("lesson-quiz", kwargs={"pk": lesson_quiz.pk})
        response = authenticated_client.get(url, {"lang": "nl"})
        q = response.data["questions"][0]
        # quiz_question has question_text_nl="Wat is een project?"
        assert q["question"] == "Wat is een project?"

    def test_quiz_en_language_default(
        self, authenticated_client, lesson_quiz, quiz_question
    ):
        """Default language returns English question text."""
        url = reverse("lesson-quiz", kwargs={"pk": lesson_quiz.pk})
        response = authenticated_client.get(url)
        q = response.data["questions"][0]
        assert q["question"] == "What is a project?"


# ===========================================================================
# 7. Course Model Properties (is_free, discount_percent)
# ===========================================================================


@pytest.mark.django_db
class TestCourseModelProperties:
    """Unit tests for Course model computed properties."""

    def test_is_free_when_price_zero(self, free_course):
        """A course with price 0 is free."""
        assert free_course.is_free is True

    def test_is_not_free_when_price_nonzero(self, published_course):
        """A course with a non-zero price is not free."""
        assert published_course.is_free is False

    def test_discount_percent_with_original_price(self, published_course):
        """Discount is calculated when original_price > price."""
        # price=99.99, original_price=149.99
        expected = int((1 - Decimal("99.99") / Decimal("149.99")) * 100)
        assert published_course.discount_percent == expected

    def test_discount_percent_zero_when_no_original_price(self, free_course):
        """Discount is 0 when original_price is None."""
        assert free_course.discount_percent == 0

    def test_discount_percent_zero_when_original_equals_price(self, db, category):
        """Discount is 0 when original_price equals price."""
        course = Course.objects.create(
            title="Same Price",
            slug="same-price",
            description="Price equals original.",
            category=category,
            price=Decimal("100.00"),
            original_price=Decimal("100.00"),
        )
        assert course.discount_percent == 0

    def test_discount_percent_zero_when_original_less_than_price(
        self, db, category
    ):
        """Discount is 0 when original_price < price (no negative discount)."""
        course = Course.objects.create(
            title="Negative Test",
            slug="negative-test",
            description="Original is less.",
            category=category,
            price=Decimal("150.00"),
            original_price=Decimal("100.00"),
        )
        assert course.discount_percent == 0

    def test_is_free_boundary_zero(self, db, category):
        """Edge case: price is exactly Decimal('0.00')."""
        course = Course.objects.create(
            title="Zero Course",
            slug="zero-course",
            description="Free boundary.",
            category=category,
            price=Decimal("0.00"),
        )
        assert course.is_free is True

    def test_is_free_boundary_one_cent(self, db, category):
        """Edge case: price is 0.01 -- not free."""
        course = Course.objects.create(
            title="One Cent",
            slug="one-cent",
            description="Costs a cent.",
            category=category,
            price=Decimal("0.01"),
        )
        assert course.is_free is False

    def test_course_str_representation(self, published_course):
        """Course __str__ returns its title."""
        assert str(published_course) == published_course.title

    def test_category_str_representation(self, category):
        """CourseCategory __str__ returns its name."""
        assert str(category) == category.name

    def test_module_str_representation(self, course_module, published_course):
        """CourseModule __str__ includes course title and module title."""
        expected = f"{published_course.title} - {course_module.title}"
        assert str(course_module) == expected

    def test_lesson_str_representation(self, lesson_video):
        """CourseLesson __str__ returns its title."""
        assert str(lesson_video) == lesson_video.title


# ===========================================================================
# 8. Enrollment Creation and Status
# ===========================================================================


@pytest.mark.django_db
class TestEnrollment:
    """Enrollment model creation, status transitions, and constraints."""

    def test_enrollment_creation(self, enrollment, published_course, user):
        """An enrollment links a user to a course."""
        assert enrollment.user == user
        assert enrollment.course == published_course
        assert enrollment.status == "active"

    def test_enrollment_default_status_is_pending(self, db, published_course):
        """Default enrollment status is 'pending'."""
        enrollment = Enrollment.objects.create(
            course=published_course,
            email="new@example.com",
            first_name="New",
            last_name="Student",
        )
        assert enrollment.status == "pending"

    def test_enrollment_progress_default_zero(self, db, published_course):
        """Default progress is 0."""
        enrollment = Enrollment.objects.create(
            course=published_course,
            email="zero@example.com",
            first_name="Zero",
            last_name="Progress",
        )
        assert enrollment.progress == 0

    def test_enrollment_status_values(self, enrollment):
        """Enrollment status can be changed to any valid choice."""
        valid_statuses = ["pending", "active", "completed", "expired", "refunded"]
        for s in valid_statuses:
            enrollment.status = s
            enrollment.save()
            enrollment.refresh_from_db()
            assert enrollment.status == s

    def test_enrollment_str_representation(self, enrollment):
        """Enrollment __str__ shows email and course title."""
        expected = f"{enrollment.email} - {enrollment.course.title}"
        assert str(enrollment) == expected

    def test_enrollment_unique_together_email_course(
        self, db, published_course
    ):
        """The same email cannot be enrolled in the same course twice."""
        Enrollment.objects.create(
            course=published_course,
            email="dup@example.com",
            first_name="First",
            last_name="Enrollment",
        )
        from django.db import IntegrityError

        with pytest.raises(IntegrityError):
            Enrollment.objects.create(
                course=published_course,
                email="dup@example.com",
                first_name="Second",
                last_name="Enrollment",
            )

    def test_enrollment_without_user(self, db, published_course):
        """Enrollment can be created without a registered user (guest)."""
        enrollment = Enrollment.objects.create(
            course=published_course,
            email="guest@example.com",
            first_name="Guest",
            last_name="User",
            amount_paid=Decimal("99.99"),
        )
        assert enrollment.user is None
        assert enrollment.email == "guest@example.com"

    def test_enrollment_amount_paid(self, enrollment):
        """Amount paid is stored correctly."""
        assert enrollment.amount_paid == Decimal("99.99")

    def test_enrollment_calculate_progress_no_lessons(
        self, db, published_course
    ):
        """Calculate progress returns 0 when there are no lessons."""
        enrollment = Enrollment.objects.create(
            course=published_course,
            email="noprogress@example.com",
            first_name="No",
            last_name="Lessons",
        )
        assert enrollment.calculate_progress() == 0

    def test_enrollment_calculate_progress_with_completed_lessons(
        self,
        db,
        published_course,
        course_module,
        lesson_video,
        lesson_text,
        lesson_quiz,
    ):
        """Calculate progress based on completed lessons."""
        enrollment = Enrollment.objects.create(
            course=published_course,
            email="progress@example.com",
            first_name="Progress",
            last_name="Test",
        )
        # Complete 1 out of 3 lessons
        enrollment.completed_lessons.add(lesson_video)
        progress = enrollment.calculate_progress()
        assert progress == 33  # 1/3 = 33%

    def test_enrollment_calculate_progress_all_completed(
        self,
        db,
        published_course,
        course_module,
        lesson_video,
        lesson_text,
    ):
        """Progress is 100% when all lessons are completed."""
        enrollment = Enrollment.objects.create(
            course=published_course,
            email="complete@example.com",
            first_name="Complete",
            last_name="All",
        )
        enrollment.completed_lessons.add(lesson_video, lesson_text)
        progress = enrollment.calculate_progress()
        assert progress == 100

    def test_completed_enrollment_status(self, completed_enrollment):
        """A completed enrollment has status 'completed' and 100% progress."""
        assert completed_enrollment.status == "completed"
        assert completed_enrollment.progress == 100

    def test_enrollment_enrolled_at_auto_set(self, enrollment):
        """enrolled_at is automatically set on creation."""
        assert enrollment.enrolled_at is not None


# ===========================================================================
# 9. Certificate Generation Basics
# ===========================================================================


@pytest.mark.django_db
class TestCertificateBasics:
    """Certificate model creation, number generation, and verification code."""

    def test_certificate_creation(self, completed_enrollment):
        """A certificate can be created for a completed enrollment."""
        cert = Certificate.objects.create(
            enrollment=completed_enrollment,
            certificate_number="PM-2026-000001",
            verification_code="ABC123XYZ456",
        )
        assert cert.enrollment == completed_enrollment
        assert cert.certificate_number == "PM-2026-000001"

    def test_certificate_number_unique(self, completed_enrollment, db, category):
        """Certificate numbers must be unique."""
        Certificate.objects.create(
            enrollment=completed_enrollment,
            certificate_number="PM-2026-000001",
            verification_code="CODE1",
        )
        # Create another enrollment for a different course
        other_course = Course.objects.create(
            title="Other Cert Course",
            slug="other-cert-course",
            description="For cert test.",
            category=category,
            price=Decimal("50.00"),
        )
        other_enrollment = Enrollment.objects.create(
            course=other_course,
            email="other@example.com",
            first_name="Other",
            last_name="Student",
            status="completed",
        )
        from django.db import IntegrityError

        with pytest.raises(IntegrityError):
            Certificate.objects.create(
                enrollment=other_enrollment,
                certificate_number="PM-2026-000001",  # duplicate
                verification_code="CODE2",
            )

    def test_verification_code_unique(self, completed_enrollment, db, category):
        """Verification codes must be unique."""
        Certificate.objects.create(
            enrollment=completed_enrollment,
            certificate_number="PM-2026-000001",
            verification_code="SAMECODE",
        )
        other_course = Course.objects.create(
            title="Cert Unique Test",
            slug="cert-unique-test",
            description="For verification test.",
            category=category,
            price=Decimal("50.00"),
        )
        other_enrollment = Enrollment.objects.create(
            course=other_course,
            email="unique@example.com",
            first_name="Unique",
            last_name="Code",
            status="completed",
        )
        from django.db import IntegrityError

        with pytest.raises(IntegrityError):
            Certificate.objects.create(
                enrollment=other_enrollment,
                certificate_number="PM-2026-000002",
                verification_code="SAMECODE",  # duplicate
            )

    def test_certificate_one_to_one_enrollment(self, completed_enrollment):
        """Only one certificate can be linked to an enrollment."""
        Certificate.objects.create(
            enrollment=completed_enrollment,
            certificate_number="PM-2026-000010",
            verification_code="UNQ1",
        )
        from django.db import IntegrityError

        with pytest.raises(IntegrityError):
            Certificate.objects.create(
                enrollment=completed_enrollment,
                certificate_number="PM-2026-000011",
                verification_code="UNQ2",
            )

    def test_generate_certificate_number(self, completed_enrollment):
        """The generate_certificate_number method produces a formatted string."""
        cert = Certificate(enrollment=completed_enrollment)
        number = cert.generate_certificate_number()
        # Format: XX-YYYY-NNNNNN  (2-char course prefix, 4-digit year, 6-digit seq)
        parts = number.split("-")
        assert len(parts) == 3
        assert len(parts[0]) == 2
        assert parts[0] == parts[0].upper()
        assert parts[1].isdigit() and len(parts[1]) == 4
        assert parts[2].isdigit() and len(parts[2]) == 6

    def test_generate_verification_code(self, completed_enrollment):
        """The generate_verification_code method produces a 12-character string."""
        cert = Certificate(enrollment=completed_enrollment)
        code = cert.generate_verification_code()
        assert len(code) == 12
        assert code == code.upper()

    def test_generate_verification_code_uniqueness(self, completed_enrollment):
        """Two calls to generate_verification_code produce different codes."""
        cert = Certificate(enrollment=completed_enrollment)
        code1 = cert.generate_verification_code()
        code2 = cert.generate_verification_code()
        # While not strictly guaranteed, the probability of collision is negligible
        # with a 12-char URL-safe token.  This test will very rarely fail.
        assert code1 != code2

    def test_certificate_str_representation(self, completed_enrollment):
        """Certificate __str__ shows number and course title."""
        cert = Certificate.objects.create(
            enrollment=completed_enrollment,
            certificate_number="PM-2026-000099",
            verification_code="STRTEST12345",
        )
        expected = f"PM-2026-000099 - {completed_enrollment.course.title}"
        assert str(cert) == expected

    def test_certificate_issued_at_auto_set(self, completed_enrollment):
        """issued_at is automatically set on creation."""
        cert = Certificate.objects.create(
            enrollment=completed_enrollment,
            certificate_number="PM-2026-000100",
            verification_code="ISSUEDAT1234",
        )
        assert cert.issued_at is not None

    def test_certificate_default_scores(self, completed_enrollment):
        """Default score fields are zero."""
        cert = Certificate.objects.create(
            enrollment=completed_enrollment,
            certificate_number="PM-2026-000200",
            verification_code="DEFAULTS1234",
        )
        assert cert.total_score == 0
        assert cert.lessons_completed == 0
        assert cert.quizzes_passed == 0
        assert cert.exams_passed == 0
        assert cert.simulations_completed == 0
        assert cert.practice_submitted == 0

    def test_certificate_skills_data_default_empty(self, completed_enrollment):
        """skills_data defaults to an empty dict."""
        cert = Certificate.objects.create(
            enrollment=completed_enrollment,
            certificate_number="PM-2026-000300",
            verification_code="SKILLSDATA12",
        )
        assert cert.skills_data == {}

    def test_certificate_with_scores(self, completed_enrollment):
        """Certificate can store completion statistics."""
        cert = Certificate.objects.create(
            enrollment=completed_enrollment,
            certificate_number="PM-2026-000400",
            verification_code="WITHSCORES12",
            total_score=92,
            lessons_completed=15,
            quizzes_passed=5,
            exams_passed=2,
            simulations_completed=3,
            practice_submitted=4,
            skills_data={
                "project_planning": {"level": 4, "points": 650},
                "risk_management": {"level": 3, "points": 320},
            },
        )
        assert cert.total_score == 92
        assert cert.lessons_completed == 15
        assert cert.skills_data["project_planning"]["level"] == 4
