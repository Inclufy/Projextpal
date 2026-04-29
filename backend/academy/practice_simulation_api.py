"""Practice & Simulation API.

Practice assignments = longer-form exercises where the learner submits
text or a file, optionally graded by an admin. Stored in PracticeSubmission
and counted toward the certificate gate (if a course has practice items,
each must have at least one submission).

Simulations = short interactive "pick the right response" scenarios embedded
in lessons. Tracked per attempt via a SimulationAttempt row (created here
lazily as JSON in LessonProgress.watch_time-style extensions isn't worth
a new table). We log these for skill points but DO NOT gate the certificate
on them — they're micro-learning bonuses, not assessments.

Endpoints:
  POST /academy/practice/<practice_id>/submit/   → PracticeSubmission
  POST /academy/simulation/submit/               → skill-points log only
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import (
    PracticeAssignment, PracticeSubmission,
    CourseLesson, Enrollment,
    Skill, UserSkill, SkillActivity,
    LessonSkillMapping,
)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_practice(request, practice_id):
    """Submit work for a practice assignment.

    Body: {
      submission_text?: string,        # inline text response
      submission_file?: (multipart)    # optional file upload
    }

    Creates a PracticeSubmission with status='pending'. Admin reviews it
    later via the admin UI; status transitions to 'approved' | 'needs_work'.

    For the cert-eligibility gate, 'approved' is what counts. We don't
    auto-approve submissions — that would be a quality gate failure.
    """
    assignment = get_object_or_404(PracticeAssignment, id=practice_id)

    # Validate one of text or file is provided
    text = request.data.get('submission_text', '').strip()
    file_ = request.FILES.get('submission_file')
    if not text and not file_:
        return Response(
            {'error': 'submission_text or submission_file is required'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Dedupe: one pending submission per (assignment, user) — user can
    # resubmit if 'needs_work', but can't spam 'pending' submissions.
    existing_pending = PracticeSubmission.objects.filter(
        assignment=assignment, user=request.user, status='pending'
    ).first()
    if existing_pending:
        existing_pending.submission_text = text or existing_pending.submission_text
        if file_:
            existing_pending.submission_file = file_
        existing_pending.submitted_at = timezone.now()
        existing_pending.save()
        submission = existing_pending
        replaced = True
    else:
        submission = PracticeSubmission.objects.create(
            assignment=assignment,
            user=request.user,
            submission_text=text,
            submission_file=file_,
            status='pending',
        )
        replaced = False

    # Award skill points for the effort (not for the outcome — final
    # grading happens when admin reviews). LessonSkillMapping.lesson_id is a
    # CharField, not an FK, so CourseLesson has no skill_mappings reverse
    # manager — query the mapping table directly.
    if assignment.lesson:
        mappings = LessonSkillMapping.objects.filter(
            lesson_id=str(assignment.lesson.id)
        ).select_related('skill')
        for mapping in mappings:
            skill = mapping.skill
            user_skill, _ = UserSkill.objects.get_or_create(
                user=request.user, skill=skill, defaults={'points': 0}
            )
            points_earned = 10  # flat reward for submission
            user_skill.points = (user_skill.points or 0) + points_earned
            user_skill.save()
            SkillActivity.objects.create(
                user=request.user, skill=skill,
                activity_type='practice_submit',
                points=points_earned,
                description=f'Submitted: {assignment.title[:60]}',
            )

    return Response({
        'id': submission.id,
        'assignment_id': assignment.id,
        'status': submission.status,
        'submitted_at': submission.submitted_at.isoformat(),
        'replaced': replaced,
        'message': 'Submission received. An admin will review it soon.',
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_simulation(request):
    """Record a simulation attempt. Body: {
      lesson_id: <int or str>,
      scenario_id: <str>,
      selected: <str>,
      correct: bool
    }
    Simulations aren't gated; we just award skill points for a correct
    response and record a SkillActivity so the user's profile shows it.
    """
    lesson_id = request.data.get('lesson_id')
    correct = bool(request.data.get('correct', False))
    scenario_id = request.data.get('scenario_id', '')

    # Award skill points if correct and we can resolve the lesson
    awarded = 0
    skills_touched = []
    try:
        lid = int(lesson_id)
        lesson = CourseLesson.objects.filter(id=lid).first()
    except (ValueError, TypeError):
        lesson = None

    if correct and lesson:
        mappings = LessonSkillMapping.objects.filter(
            lesson_id=str(lesson.id)
        ).select_related('skill')
        for mapping in mappings:
            skill = mapping.skill
            user_skill, _ = UserSkill.objects.get_or_create(
                user=request.user, skill=skill, defaults={'points': 0}
            )
            user_skill.points = (user_skill.points or 0) + 5
            user_skill.save()
            SkillActivity.objects.create(
                user=request.user, skill=skill,
                activity_type='simulation_correct',
                points=5,
                description=f'Simulation: {scenario_id or "(unnamed)"}',
            )
            awarded += 5
            skills_touched.append(skill.id)

    return Response({
        'correct': correct,
        'points_awarded': awarded,
        'skills_touched': skills_touched,
        'lesson_id': lesson_id,
    })
