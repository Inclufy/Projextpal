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


def _find_enrollment_for_lesson(user, lesson_id):
    """Resolve the user's enrollment for the course containing this lesson.

    Accepts both numeric CourseLesson.id (DB-backed) and string IDs from
    the hardcoded frontend courses (e.g. 'p2-l5'); falls back to None
    when no matching enrollment exists (caller decides what to do).
    """
    # Try numeric (DB-backed lesson)
    try:
        lid = int(lesson_id)
        lesson = CourseLesson.objects.filter(id=lid).first()
        if lesson:
            return Enrollment.objects.filter(
                user=user, course=lesson.module.course
            ).first(), lesson
    except (ValueError, TypeError):
        pass

    # Fallback: the lesson_id is a hardcoded frontend ID like 'p2-l5'.
    # The frontend should pass its course_id too for this path, but the
    # existing endpoint signature doesn't carry that. So we return
    # (None, None) and let the caller record a "display-only" result.
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
            total = len(quiz_data['questions'])
            correct = sum(
                1 for i, q in enumerate(quiz_data['questions'])
                if i < len(answers) and answers[i] == q.get('correct')
            )
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
    correct = 0
    total = len(questions)
    for i, q in enumerate(questions):
        if i < len(answers) and answers[i] == q.get('correct'):
            correct += 1
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


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_lesson_complete(request, lesson_id):
    """Mark a lesson as completed for the current user's enrollment.

    Body (optional): {watch_time: <seconds>}
    Creates/updates a LessonProgress row AND appends the lesson to
    Enrollment.completed_lessons so progress % and eligibility update.

    Resolves lesson_id as integer (DB-backed) first; for hardcoded-course
    string IDs we can't persist (no Lesson row) so we return 202 Accepted
    with a hint so the frontend can still track locally.
    """
    try:
        lid = int(lesson_id)
        lesson = CourseLesson.objects.filter(id=lid).first()
    except (ValueError, TypeError):
        lesson = None

    if lesson is None:
        return Response({
            'persisted': False,
            'reason': 'lesson_not_in_db',
            'message': 'Lesson is from a hardcoded course; progress tracked locally only.',
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
