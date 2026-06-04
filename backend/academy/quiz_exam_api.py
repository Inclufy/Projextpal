"""Quiz & Exam API — Phase 2 gated LMS.

Key fix vs v1: submission now persists a QuizAttempt / ExamAttempt record
so that Enrollment.certificate_eligibility() can actually find passed
attempts. Without persistence the score/passed returned here was purely
display-only and the cert gate could never open.
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import (
    CourseLesson, CourseModule, Course,
    QuizAttempt, Exam, ExamAttempt, Enrollment, LessonProgress,
)
import json
import os


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_quiz(request, lesson_id):
    """Get quiz questions for a lesson.

    Two sources, in order:
      1. JSON fixture at /app/academy/data/quizzes/<lesson_id>.json (legacy)
      2. Related QuizQuestion rows on the CourseLesson (preferred; populated
         by AI generate-quiz or manually via admin)
    Returns 404 only if neither source has content.
    """
    # 1. Try JSON fixture first (keeps backward compat with demo content)
    quiz_file = f'/app/academy/data/quizzes/{lesson_id}.json'
    if os.path.exists(quiz_file):
        try:
            with open(quiz_file, 'r') as f:
                return Response(json.load(f))
        except Exception:
            pass

    # 2. Try DB-backed questions (the path we'll use going forward)
    try:
        lesson = CourseLesson.objects.filter(id=lesson_id).first()
    except (ValueError, TypeError):
        lesson = None
    if lesson is None:
        return Response({'error': 'Lesson not found'}, status=status.HTTP_404_NOT_FOUND)
    questions = list(
        lesson.questions.prefetch_related('answers').all()
        if hasattr(lesson, 'questions') else []
    )
    if not questions:
        return Response({'error': 'Quiz not available'}, status=status.HTTP_404_NOT_FOUND)
    return Response({
        'lessonId': lesson_id,
        'passingScore': 70,
        'questions': [
            {
                'id': q.id,
                'question': q.question_text,
                'type': q.question_type,
                'answers': [
                    {'id': a.id, 'text': a.answer_text}
                    for a in q.answers.all()
                ],
            }
            for q in questions
        ],
    })


def _score_fixture(answers, questions):
    """Score submitted answers against fixture questions.

    Supports two payload shapes:
      - dict keyed by question id -> [selected_index, ...]   (QuizEngine / ExamEngine)
      - positional list of selected indices                  (legacy fixtures)
    Each fixture question carries a scalar `correct` = the correct option index.
    Returns (correct_count, total).
    """
    total = len(questions)
    correct = 0
    for i, q in enumerate(questions):
        expected = q.get('correct')
        sel = None
        if isinstance(answers, dict):
            qid = q.get('id')
            raw = answers.get(str(qid))
            if raw is None and qid is not None:
                raw = answers.get(qid)
            sel = raw[0] if isinstance(raw, list) and raw else raw
        elif isinstance(answers, list) and i < len(answers):
            raw = answers[i]
            sel = raw[0] if isinstance(raw, list) and raw else raw
        if sel is not None and sel == expected:
            correct += 1
    return correct, total


def _resolve_lesson(lesson_id):
    """Resolve a CourseLesson from either a numeric DB id or the frontend
    string id (e.g. 'p2-l5') stored in CourseLesson.external_id."""
    # Numeric DB id
    try:
        lid = int(lesson_id)
        lesson = CourseLesson.objects.filter(id=lid).first()
        if lesson:
            return lesson
    except (ValueError, TypeError):
        pass
    # Frontend string id, mapped via external_id (populated on import).
    return CourseLesson.objects.filter(external_id=str(lesson_id)).first()


def _find_enrollment_for_lesson(user, lesson_id):
    """Resolve the user's enrollment for the course containing this lesson.

    Accepts both numeric CourseLesson.id (DB-backed) and string IDs from
    the hardcoded frontend courses (e.g. 'p2-l5'). The string IDs resolve via
    CourseLesson.external_id, which the importer populates from the frontend
    lesson id — this is what lets quiz attempts on static courses persist and
    count toward Enrollment.certificate_eligibility(). Returns (None, None)
    when no matching lesson/enrollment exists (caller records display-only).
    """
    lesson = _resolve_lesson(lesson_id)
    if lesson:
        enrollment = Enrollment.objects.filter(
            user=user, course=lesson.module.course
        ).first()
        return enrollment, lesson
    return None, None


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_quiz(request, lesson_id):
    """Submit quiz answers, score them, and persist a QuizAttempt.

    Accepts either:
      - JSON fixture path (score vs quiz_data['questions'])
      - answers[{question_id, selected_answer_ids}] against DB questions
    Returns {score, passed, correct, total}.

    If a matching Enrollment exists, we persist a QuizAttempt so that the
    cert-eligibility gate can see it.
    """
    try:
        answers = request.data.get('answers', [])
        passing_score = request.data.get('passingScore', 70)
        quiz_file = f'/app/academy/data/quizzes/{lesson_id}.json'

        score = 0
        correct = 0
        total = 0

        # Prefer JSON fixture (legacy) if present
        if os.path.exists(quiz_file):
            with open(quiz_file, 'r') as f:
                quiz_data = json.load(f)
            passing_score = quiz_data.get('passingScore', passing_score)
            correct, total = _score_fixture(answers, quiz_data['questions'])
            score = int((correct / total) * 100) if total else 0
        else:
            # DB-backed path
            try:
                lid = int(lesson_id)
                lesson = CourseLesson.objects.filter(id=lid).first()
            except (ValueError, TypeError):
                lesson = None
            if lesson and hasattr(lesson, 'questions'):
                qs = list(lesson.questions.prefetch_related('answers').all())
                total = len(qs)
                for q in qs:
                    correct_ids = set(q.answers.filter(is_correct=True).values_list('id', flat=True))
                    # Answer payload shape: {question_id, selected_answer_ids: [..]}
                    submitted = next(
                        (a for a in answers
                         if a.get('question_id') == q.id),
                        None,
                    )
                    if submitted:
                        selected = set(submitted.get('selected_answer_ids', []))
                        if selected == correct_ids:
                            correct += 1
                score = int((correct / total) * 100) if total else 0

        passed = total > 0 and score >= passing_score

        # === persist QuizAttempt when we can tie it to an enrollment ===
        enrollment, lesson_obj = _find_enrollment_for_lesson(request.user, lesson_id)
        if enrollment and lesson_obj:
            QuizAttempt.objects.create(
                enrollment=enrollment,
                lesson=lesson_obj,
                score=correct,
                max_score=total,
                passed=passed,
                answers={'submitted': answers},
                completed_at=timezone.now(),
            )

        return Response({
            'score': score,
            'passed': passed,
            'correct': correct,
            'total': total,
            'persisted': bool(enrollment and lesson_obj),
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_exam(request, exam_id):
    """Submit an exam attempt and persist an ExamAttempt.

    Body: {answers: [...], time_taken: <seconds>}
    Returns {score, passed, attempt_number}.
    The cert-eligibility gate checks for any ExamAttempt with passed=True,
    so this endpoint is what unlocks the final certificate.
    """
    exam = get_object_or_404(Exam, id=exam_id)
    answers = request.data.get('answers', [])
    time_taken = request.data.get('time_taken', 0)

    # Score against exam.questions (JSONField with {id, correct, ...} shape)
    questions = exam.questions or []
    correct, total = _score_fixture(answers, questions)
    score = int((correct / total) * 100) if total else 0
    passed = total > 0 and score >= (exam.passing_score or 80)

    attempt_number = ExamAttempt.objects.filter(
        user=request.user, exam=exam
    ).count() + 1

    ExamAttempt.objects.create(
        user=request.user,
        exam=exam,
        score=score,
        passed=passed,
        answers={'submitted': answers},
        time_taken=time_taken,
        attempt_number=attempt_number,
        started_at=timezone.now(),
    )

    return Response({
        'score': score,
        'passed': passed,
        'correct': correct,
        'total': total,
        'attempt_number': attempt_number,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_exam(request, lesson_id):
    """Serve exam questions for an exam lesson.

    Source order (mirrors get_quiz):
      1. JSON fixture at /app/academy/data/exams/<lesson_id>.json
         (keyed by the frontend lesson id, e.g. 'safe-l19').
      2. DB Exam row when lesson_id is a numeric Exam.id.
    Returns 404 only if neither source has content. Without this route the
    ExamEngine fell back to hardcoded sample questions.
    """
    exam_file = f'/app/academy/data/exams/{lesson_id}.json'
    if os.path.exists(exam_file):
        try:
            with open(exam_file, 'r') as f:
                return Response(json.load(f))
        except Exception:
            pass
    try:
        eid = int(lesson_id)
        exam = Exam.objects.filter(id=eid).first()
    except (ValueError, TypeError):
        exam = None
    if exam is None:
        return Response({'error': 'Exam not available'}, status=status.HTTP_404_NOT_FOUND)
    return Response({
        'id': exam.id,
        'title': exam.title,
        'titleNL': exam.title_nl,
        'passingScore': exam.passing_score,
        'timeLimit': exam.time_limit,
        'maxAttempts': exam.max_attempts,
        'questions': exam.questions or [],
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_exam_by_lesson(request, lesson_id):
    """Submit an exam identified by the frontend lesson id (string).

    Scores against the JSON fixture at /app/academy/data/exams/<lesson_id>.json
    and, when a matching DB Exam can be resolved for the same course, persists
    an ExamAttempt so the certificate-eligibility gate can see the pass.
    Otherwise returns a display-only result (persisted=False).
    """
    answers = request.data.get('answers', [])
    time_taken = request.data.get('time_taken', 0)
    exam_file = f'/app/academy/data/exams/{lesson_id}.json'
    if not os.path.exists(exam_file):
        return Response({'error': 'Exam not found'}, status=status.HTTP_404_NOT_FOUND)
    try:
        with open(exam_file, 'r') as f:
            data = json.load(f)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    questions = data.get('questions', [])
    passing_score = data.get('passingScore', 70)
    correct, total = _score_fixture(answers, questions)
    score = int((correct / total) * 100) if total else 0
    passed = total > 0 and score >= passing_score

    # Best-effort persistence so the cert gate can see a passed exam attempt.
    persisted = False
    course_id = data.get('courseId')
    exam = None
    if course_id:
        try:
            exam = (Exam.objects.filter(course__slug=course_id).first()
                    or Exam.objects.filter(course__id=course_id).first())
        except Exception:
            exam = None
    if exam is not None:
        try:
            attempt_number = ExamAttempt.objects.filter(
                user=request.user, exam=exam
            ).count() + 1
            ExamAttempt.objects.create(
                user=request.user, exam=exam, score=score, passed=passed,
                answers={'submitted': answers}, time_taken=time_taken,
                attempt_number=attempt_number, started_at=timezone.now(),
            )
            persisted = True
        except Exception:
            persisted = False

    return Response({
        'score': score,
        'percentage': score,
        'passed': passed,
        'correct': correct,
        'total': total,
        'persisted': persisted,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_lesson_complete(request, lesson_id):
    """Mark a lesson as completed for the current user's enrollment.

    Body (optional): {watch_time: <seconds>}
    Creates/updates a LessonProgress row AND appends the lesson to
    Enrollment.completed_lessons so progress % and eligibility update.

    Resolves lesson_id as a numeric DB id first, then via CourseLesson.external_id
    for hardcoded-course string IDs (e.g. 'p2-l5'). Only when neither resolves
    (course not imported) do we return 202 Accepted with a local-tracking hint.
    """
    lesson = _resolve_lesson(lesson_id)

    if lesson is None:
        return Response({
            'persisted': False,
            'reason': 'lesson_not_in_db',
            'message': 'Lesson is from a course not yet imported; progress tracked locally only.',
        }, status=status.HTTP_202_ACCEPTED)

    # Find the user's enrollment for this course
    enrollment = Enrollment.objects.filter(
        user=request.user, course=lesson.module.course
    ).first()
    if enrollment is None:
        return Response({
            'error': 'not_enrolled',
            'message': 'Enroll in the course before marking lessons complete.',
        }, status=status.HTTP_400_BAD_REQUEST)

    progress, _ = LessonProgress.objects.update_or_create(
        enrollment=enrollment, lesson=lesson,
        defaults={
            'is_completed': True,
            'watch_time': request.data.get('watch_time', 0),
            'completed_at': timezone.now(),
        },
    )
    enrollment.completed_lessons.add(lesson)
    # Recompute Enrollment.progress percent
    enrollment.progress = enrollment.calculate_progress()
    if enrollment.progress >= 100 and not enrollment.completed_at:
        enrollment.completed_at = timezone.now()
        enrollment.status = 'completed'
    enrollment.save(update_fields=['progress', 'status', 'completed_at'])

    return Response({
        'persisted': True,
        'lesson_id': lesson.id,
        'enrollment_progress': enrollment.progress,
        'status': enrollment.status,
    })
