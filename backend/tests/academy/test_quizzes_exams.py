"""
Academy Tests - Quizzes, Exams & Attempts
Tests each feature one by one.
"""
import pytest
from decimal import Decimal
from django.utils import timezone
from academy.models import (
    CourseCategory, CourseInstructor, Course, CourseModule, CourseLesson,
    Enrollment, QuizQuestion, QuizAnswer, QuizAttempt, Exam, ExamAttempt,
)
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.fixture
def category(db):
    return CourseCategory.objects.create(name="PM", slug="pm-quiz", order=1)


@pytest.fixture
def instructor(db):
    return CourseInstructor.objects.create(name="Quiz Instructor", title="Expert")


@pytest.fixture
def course(db, category, instructor):
    return Course.objects.create(
        title="Quiz Course", slug="quiz-course",
        description="Course with quizzes", category=category,
        instructor=instructor, status="published",
    )


@pytest.fixture
def module(db, course):
    return CourseModule.objects.create(course=course, title="Module 1", order=1)


@pytest.fixture
def lesson(db, module):
    return CourseLesson.objects.create(
        module=module, title="Quiz Lesson", lesson_type="quiz", order=1,
    )


@pytest.fixture
def enrollment(db, user, course):
    return Enrollment.objects.create(
        user=user, course=course, email=user.email,
        first_name="Test", last_name="User", status="active",
    )


@pytest.fixture
def question_mc(db, lesson):
    return QuizQuestion.objects.create(
        lesson=lesson,
        question_text="What are the triple constraints?",
        question_text_nl="Wat zijn de drie beperkingen?",
        question_type="multiple_choice",
        explanation="Time, Cost, Scope form the triple constraint.",
        order=1,
        points=2,
    )


@pytest.fixture
def question_tf(db, lesson):
    return QuizQuestion.objects.create(
        lesson=lesson,
        question_text="A Gantt chart is used for scheduling.",
        question_type="true_false",
        order=2,
        points=1,
    )


@pytest.fixture
def question_ms(db, lesson):
    return QuizQuestion.objects.create(
        lesson=lesson,
        question_text="Select all Agile methodologies:",
        question_type="multiple_select",
        order=3,
        points=3,
    )


# ── 1. Quiz Question Tests ──────────────────────────────────────────

@pytest.mark.django_db
class TestQuizQuestion:
    """Test quiz question creation and types."""

    def test_create_multiple_choice(self, question_mc):
        assert question_mc.question_type == "multiple_choice"
        assert question_mc.points == 2

    def test_create_true_false(self, question_tf):
        assert question_tf.question_type == "true_false"
        assert question_tf.points == 1

    def test_create_multiple_select(self, question_ms):
        assert question_ms.question_type == "multiple_select"
        assert question_ms.points == 3

    def test_question_bilingual(self, question_mc):
        assert "triple constraints" in question_mc.question_text
        assert "drie beperkingen" in question_mc.question_text_nl

    def test_question_explanation(self, question_mc):
        assert "triple constraint" in question_mc.explanation

    def test_question_ordering(self, question_mc, question_tf, question_ms):
        questions = list(QuizQuestion.objects.filter(lesson=question_mc.lesson))
        assert [q.order for q in questions] == [1, 2, 3]

    def test_question_str(self, question_mc):
        assert "Q1:" in str(question_mc)

    def test_question_lesson_relationship(self, question_mc, lesson):
        assert question_mc.lesson == lesson
        assert lesson.questions.count() >= 1


# ── 2. Quiz Answer Tests ────────────────────────────────────────────

@pytest.mark.django_db
class TestQuizAnswer:
    """Test quiz answer options."""

    def test_create_correct_answer(self, question_mc):
        answer = QuizAnswer.objects.create(
            question=question_mc,
            answer_text="Time, Cost, Scope",
            answer_text_nl="Tijd, Kosten, Scope",
            is_correct=True,
            order=1,
        )
        assert answer.is_correct is True

    def test_create_incorrect_answer(self, question_mc):
        answer = QuizAnswer.objects.create(
            question=question_mc,
            answer_text="Time, Budget, Quality",
            is_correct=False,
            order=2,
        )
        assert answer.is_correct is False

    def test_multiple_answers(self, question_mc):
        QuizAnswer.objects.create(
            question=question_mc, answer_text="A", is_correct=True, order=1,
        )
        QuizAnswer.objects.create(
            question=question_mc, answer_text="B", is_correct=False, order=2,
        )
        QuizAnswer.objects.create(
            question=question_mc, answer_text="C", is_correct=False, order=3,
        )
        QuizAnswer.objects.create(
            question=question_mc, answer_text="D", is_correct=False, order=4,
        )
        assert question_mc.answers.count() == 4
        assert question_mc.answers.filter(is_correct=True).count() == 1

    def test_true_false_answers(self, question_tf):
        QuizAnswer.objects.create(
            question=question_tf, answer_text="True", is_correct=True, order=1,
        )
        QuizAnswer.objects.create(
            question=question_tf, answer_text="False", is_correct=False, order=2,
        )
        assert question_tf.answers.count() == 2

    def test_multiple_select_answers(self, question_ms):
        QuizAnswer.objects.create(
            question=question_ms, answer_text="Scrum", is_correct=True, order=1,
        )
        QuizAnswer.objects.create(
            question=question_ms, answer_text="Kanban", is_correct=True, order=2,
        )
        QuizAnswer.objects.create(
            question=question_ms, answer_text="Waterfall", is_correct=False, order=3,
        )
        correct = question_ms.answers.filter(is_correct=True)
        assert correct.count() == 2

    def test_answer_str(self, question_mc):
        a = QuizAnswer.objects.create(
            question=question_mc, answer_text="Correct!", is_correct=True, order=1,
        )
        assert "[V]" in str(a)

    def test_answer_str_incorrect(self, question_mc):
        a = QuizAnswer.objects.create(
            question=question_mc, answer_text="Wrong!", is_correct=False, order=2,
        )
        assert "[ ]" in str(a)


# ── 3. Quiz Attempt Tests ───────────────────────────────────────────

@pytest.mark.django_db
class TestQuizAttempt:
    """Test quiz attempt tracking and scoring."""

    def test_create_attempt_passed(self, enrollment, lesson):
        attempt = QuizAttempt.objects.create(
            enrollment=enrollment,
            lesson=lesson,
            score=8,
            max_score=10,
            passed=True,
            answers={"1": [1], "2": [3]},
            completed_at=timezone.now(),
        )
        assert attempt.passed is True
        assert attempt.score == 8

    def test_create_attempt_failed(self, enrollment, lesson):
        attempt = QuizAttempt.objects.create(
            enrollment=enrollment,
            lesson=lesson,
            score=3,
            max_score=10,
            passed=False,
            answers={"1": [2]},
        )
        assert attempt.passed is False

    def test_attempt_percentage(self, enrollment, lesson):
        attempt = QuizAttempt.objects.create(
            enrollment=enrollment, lesson=lesson,
            score=7, max_score=10, answers={},
        )
        assert attempt.percentage == 70

    def test_attempt_percentage_zero_max(self, enrollment, lesson):
        attempt = QuizAttempt.objects.create(
            enrollment=enrollment, lesson=lesson,
            score=0, max_score=0, answers={},
        )
        assert attempt.percentage == 0

    def test_attempt_percentage_perfect(self, enrollment, lesson):
        attempt = QuizAttempt.objects.create(
            enrollment=enrollment, lesson=lesson,
            score=10, max_score=10, passed=True, answers={},
        )
        assert attempt.percentage == 100

    def test_multiple_attempts(self, enrollment, lesson):
        QuizAttempt.objects.create(
            enrollment=enrollment, lesson=lesson, score=5, max_score=10, answers={},
        )
        QuizAttempt.objects.create(
            enrollment=enrollment, lesson=lesson, score=8, max_score=10, answers={},
        )
        assert enrollment.quiz_attempts.count() == 2

    def test_attempt_answers_json(self, enrollment, lesson):
        answers = {"q1": [1, 2], "q2": [3], "q3": [4]}
        attempt = QuizAttempt.objects.create(
            enrollment=enrollment, lesson=lesson,
            score=6, max_score=9, answers=answers,
        )
        assert attempt.answers == answers


# ── 4. Exam Tests ────────────────────────────────────────────────────

@pytest.mark.django_db
class TestExam:
    """Test exam creation and configuration."""

    def test_create_course_exam(self, course):
        exam = Exam.objects.create(
            course=course,
            title="Final Exam",
            title_nl="Eindexamen",
            description="Comprehensive final exam",
            passing_score=80,
            time_limit=60,
            max_attempts=3,
            questions=[
                {"type": "mc", "text": "Q1", "options": ["A", "B", "C"], "answer": 0},
                {"type": "tf", "text": "Q2", "answer": True},
            ],
        )
        assert exam.passing_score == 80
        assert exam.time_limit == 60
        assert len(exam.questions) == 2

    def test_create_module_exam(self, module):
        exam = Exam.objects.create(
            module=module,
            title="Module 1 Exam",
            passing_score=70,
            time_limit=30,
            max_attempts=5,
            questions=[{"type": "mc", "text": "Q1", "options": ["A", "B"], "answer": 0}],
        )
        assert exam.module == module
        assert exam.max_attempts == 5

    def test_exam_active_default(self, course):
        exam = Exam.objects.create(
            course=course, title="Active Exam",
            questions=[], passing_score=80, time_limit=45,
        )
        assert exam.is_active is True

    def test_exam_bilingual(self, course):
        exam = Exam.objects.create(
            course=course, title="PM Exam", title_nl="PM Examen",
            description="English desc", description_nl="Nederlandse beschrijving",
            questions=[], passing_score=80, time_limit=45,
        )
        assert exam.title_nl == "PM Examen"

    def test_exam_str(self, course):
        exam = Exam.objects.create(
            course=course, title="Test Exam",
            questions=[], passing_score=80, time_limit=45,
        )
        assert str(exam) == "Test Exam"


# ── 5. Exam Attempt Tests ───────────────────────────────────────────

@pytest.mark.django_db
class TestExamAttempt:
    """Test exam attempt tracking."""

    def test_create_exam_attempt_passed(self, user, course):
        exam = Exam.objects.create(
            course=course, title="Exam", passing_score=70,
            time_limit=45, questions=[],
        )
        attempt = ExamAttempt.objects.create(
            user=user, exam=exam, score=85, passed=True,
            answers={"q1": "A"}, time_taken=1800,
            attempt_number=1, started_at=timezone.now(),
        )
        assert attempt.passed is True
        assert attempt.score == 85

    def test_create_exam_attempt_failed(self, user, course):
        exam = Exam.objects.create(
            course=course, title="Exam", passing_score=70,
            time_limit=45, questions=[],
        )
        attempt = ExamAttempt.objects.create(
            user=user, exam=exam, score=55, passed=False,
            answers={}, time_taken=2400,
            attempt_number=1, started_at=timezone.now(),
        )
        assert attempt.passed is False

    def test_multiple_exam_attempts(self, user, course):
        exam = Exam.objects.create(
            course=course, title="Exam", passing_score=70,
            time_limit=45, max_attempts=3, questions=[],
        )
        for i in range(3):
            ExamAttempt.objects.create(
                user=user, exam=exam, score=50 + i * 20,
                passed=(50 + i * 20) >= 70,
                answers={}, time_taken=1800,
                attempt_number=i + 1, started_at=timezone.now(),
            )
        assert exam.attempts.count() == 3
        assert exam.attempts.filter(passed=True).count() == 2  # 70, 90

    def test_exam_attempt_time_tracking(self, user, course):
        exam = Exam.objects.create(
            course=course, title="Timed Exam",
            passing_score=70, time_limit=30, questions=[],
        )
        attempt = ExamAttempt.objects.create(
            user=user, exam=exam, score=80, passed=True,
            answers={}, time_taken=1500,  # 25 minutes
            attempt_number=1, started_at=timezone.now(),
        )
        assert attempt.time_taken == 1500  # within time limit

    def test_exam_attempt_str(self, user, course):
        exam = Exam.objects.create(
            course=course, title="PM Final",
            passing_score=70, time_limit=45, questions=[],
        )
        attempt = ExamAttempt.objects.create(
            user=user, exam=exam, score=92, passed=True,
            answers={}, time_taken=2000,
            attempt_number=1, started_at=timezone.now(),
        )
        s = str(attempt)
        assert "PM Final" in s
        assert "92" in s
