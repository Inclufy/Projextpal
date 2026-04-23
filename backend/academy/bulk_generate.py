"""Bulk content generation for academy courses.

After running `manage.py import_frontend_courses`, the DB has all
modules + lessons but no quizzes/exams/skills. This module wires up
admin endpoints that batch-invoke the existing AI generators
(ai_content_api) against every lesson and persist the results.

Endpoints (all require IsAdminUser):
  POST /academy/admin/bulk/quizzes/?course=<slug>
      → for each lesson in the course, call generate_quiz AI,
        create QuizQuestion + QuizAnswer rows

  POST /academy/admin/bulk/exams/?course=<slug>
      → for each course, call generate_exam AI,
        create an Exam row with a JSON `questions` field

  POST /academy/admin/bulk/skills/?course=<slug>
      → extract skills from lessons, create Skill rows + LessonSkillMapping

Each batch returns a per-lesson report so ops can see what succeeded.
Designed for idempotence: if a lesson already has questions attached
(or the course already has an Exam), we SKIP it instead of duplicating.
"""
import json
import os
import requests

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from django.utils.text import slugify

from .models import (
    Course, CourseModule, CourseLesson,
    QuizQuestion, QuizAnswer, Exam,
    Skill, SkillCategory, LessonSkillMapping,
    PracticeAssignment,
)


OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY', '')


def _call_openai(prompt, system, max_retries=2):
    """Thin wrapper around the OpenAI chat API with JSON response mode.
    Returns the parsed JSON or raises."""
    last_err = None
    for _ in range(max_retries + 1):
        try:
            r = requests.post(
                'https://api.openai.com/v1/chat/completions',
                headers={'Authorization': f'Bearer {OPENAI_API_KEY}',
                         'Content-Type': 'application/json'},
                json={
                    'model': 'gpt-4o-mini',
                    'messages': [
                        {'role': 'system', 'content': system},
                        {'role': 'user', 'content': prompt},
                    ],
                    'response_format': {'type': 'json_object'},
                    'temperature': 0.5,
                },
                timeout=90,
            )
            r.raise_for_status()
            content = r.json()['choices'][0]['message']['content']
            return json.loads(content)
        except Exception as e:
            last_err = e
    raise last_err


def _resolve_course(request):
    """Get the Course by ?course=<slug-or-uuid>."""
    ref = request.query_params.get('course') or request.data.get('course')
    if not ref:
        return None, Response({'error': 'course query param required'},
                              status=status.HTTP_400_BAD_REQUEST)
    course = Course.objects.filter(slug=ref).first()
    if not course:
        try:
            import uuid as _u; _u.UUID(str(ref))
            course = Course.objects.filter(pk=ref).first()
        except (ValueError, TypeError):
            pass
    if not course:
        return None, Response({'error': f'course {ref!r} not found'},
                              status=status.HTTP_404_NOT_FOUND)
    return course, None


# ------------------------------------------------------------ QUIZZES
@api_view(['POST'])
@permission_classes([IsAdminUser])
def bulk_generate_quizzes(request):
    """For every lesson in the course (excluding type='quiz' lessons
    themselves, which need the quiz INLINE), call AI to produce 5 MCQ
    questions + persist as QuizQuestion/QuizAnswer rows."""
    course, err = _resolve_course(request)
    if err: return err

    lessons = CourseLesson.objects.filter(module__course=course).order_by('module__order', 'order')
    report = []
    for lesson in lessons:
        if lesson.lesson_type not in ('video', 'quiz'):
            continue  # docs/exams/certificates don't need quizzes
        if lesson.questions.exists():
            report.append({'lesson_id': lesson.id, 'status': 'skip_has_questions'})
            continue

        prompt = (
            f"Create 5 multiple-choice quiz questions based on this lesson.\n\n"
            f"Course: {course.title}\n"
            f"Lesson: {lesson.title}\n"
            f"Content: {(lesson.content or '')[:2500]}\n\n"
            f"For each question provide: question text, 4 options, the index of "
            f"the correct one (0-3), a short explanation of why it's correct, "
            f"and difficulty (easy/medium/hard). Return JSON shape:\n"
            f'{{"questions":[{{"question":"…","options":["…"],"correct":0,'
            f'"explanation":"…","difficulty":"medium"}}]}}'
        )
        try:
            out = _call_openai(prompt, 'You create exam-accurate training quizzes. Return JSON only.')
        except Exception as e:
            report.append({'lesson_id': lesson.id, 'status': 'ai_failed', 'error': str(e)[:80]})
            continue

        created = 0
        for idx, q in enumerate(out.get('questions', [])):
            qq = QuizQuestion.objects.create(
                lesson=lesson,
                question_text=q.get('question', ''),
                question_type='multiple_choice',
                points=q.get('points', 10),
                order=idx,
            )
            correct_idx = q.get('correct', 0)
            for a_idx, ans in enumerate(q.get('options', [])):
                QuizAnswer.objects.create(
                    question=qq,
                    answer_text=ans,
                    is_correct=(a_idx == correct_idx),
                    order=a_idx,
                )
            created += 1
        report.append({'lesson_id': lesson.id, 'status': 'ok', 'questions_created': created})

    return Response({'course': course.slug, 'lessons_processed': len(report), 'report': report})


# ------------------------------------------------------------ EXAMS
@api_view(['POST'])
@permission_classes([IsAdminUser])
def bulk_generate_exams(request):
    """Create one comprehensive final Exam per course (20 questions)."""
    course, err = _resolve_course(request)
    if err: return err

    if Exam.objects.filter(course=course).exists():
        return Response({'course': course.slug, 'status': 'skip_has_exam'})

    # Build context from all lessons
    lessons = CourseLesson.objects.filter(module__course=course).order_by('module__order', 'order')
    outline = '\n'.join(f"- Module {l.module.order+1}: {l.title}" for l in lessons[:40])

    prompt = (
        f"Create a final exam for the course '{course.title}'. This is the "
        f"certification gate — learners must pass to get the certificate.\n\n"
        f"Course outline:\n{outline}\n\n"
        f"Produce 20 multiple-choice questions covering breadth of the course. "
        f"Each question: question text, 4 options, index of the correct one "
        f"(0-3), an explanation. Return JSON shape:\n"
        f'{{"questions":[{{"question":"…","options":["…"],"correct":0,'
        f'"explanation":"…","difficulty":"medium","points":5}}]}}'
    )
    try:
        out = _call_openai(prompt, 'You create certification-grade exam questions. Return JSON only.')
    except Exception as e:
        return Response({'error': 'ai_failed', 'detail': str(e)[:200]},
                        status=status.HTTP_502_BAD_GATEWAY)

    questions = out.get('questions', [])
    if not questions:
        return Response({'error': 'empty_exam'}, status=status.HTTP_502_BAD_GATEWAY)

    exam = Exam.objects.create(
        course=course,
        title=f'{course.title} — Final Exam',
        title_nl=f'{course.title_nl or course.title} — Eindexamen',
        description='Pass this exam to earn your certificate.',
        passing_score=80,
        time_limit=45,  # minutes
        max_attempts=3,
        questions=questions,  # JSONField
        is_active=True,
    )
    return Response({
        'course': course.slug, 'exam_id': exam.id,
        'questions_count': len(questions), 'passing_score': exam.passing_score,
    })


# ------------------------------------------------------------ SKILLS
@api_view(['POST'])
@permission_classes([IsAdminUser])
def bulk_generate_skills(request):
    """Extract 5–10 skills from the course and create LessonSkillMapping
    rows linking each lesson to 1–3 skills."""
    course, err = _resolve_course(request)
    if err: return err

    # Default category if none exists
    category, _ = SkillCategory.objects.get_or_create(
        id=slugify(course.slug)[:50],
        defaults={
            'name': course.title[:100],
            'name_nl': (course.title_nl or course.title)[:100],
            'icon': course.icon or 'Target',
            'color': course.color or 'gray',
            'order': 99,
        },
    )

    lessons = list(CourseLesson.objects.filter(module__course=course).order_by('module__order', 'order'))
    outline = '\n'.join(f"{i}: {l.title}" for i, l in enumerate(lessons))

    prompt = (
        f"Extract 5-10 core skills taught by the course '{course.title}'. "
        f"For each skill, identify which lessons (by index number) teach it. "
        f"Lessons:\n{outline}\n\n"
        f"Return JSON shape:\n"
        f'{{"skills":[{{"name":"…","description":"…","lesson_indices":[0,1,3]}}]}}'
    )
    try:
        out = _call_openai(prompt, 'You design professional skill taxonomies. Return JSON only.')
    except Exception as e:
        return Response({'error': 'ai_failed', 'detail': str(e)[:200]},
                        status=status.HTTP_502_BAD_GATEWAY)

    report = []
    for sd in out.get('skills', []):
        name = sd.get('name', '').strip()
        if not name:
            continue
        skill_id = slugify(name)[:50] or 'skill'
        # Dedupe
        n = 2
        while Skill.objects.filter(id=skill_id).exists():
            skill_id = f'{slugify(name)[:40]}-{n}'; n += 1
        skill = Skill.objects.create(
            id=skill_id,
            category=category,
            name=name,
            name_nl=name,
            description=sd.get('description', ''),
        )
        mapped = 0
        for idx in sd.get('lesson_indices', []):
            try: lesson = lessons[idx]
            except (IndexError, TypeError): continue
            LessonSkillMapping.objects.get_or_create(lesson=lesson, skill=skill)
            mapped += 1
        report.append({'skill_id': skill.id, 'name': name, 'lessons_mapped': mapped})

    return Response({'course': course.slug, 'skills_created': len(report), 'report': report})


# ------------------------------------------------------------ PRACTICE
@api_view(['POST'])
@permission_classes([IsAdminUser])
def bulk_generate_practice(request):
    """For each video lesson in the course, generate 1 practice assignment
    (scenario-based, ~60 minutes of work). Skips lessons that already have
    a practice assignment attached."""
    course, err = _resolve_course(request)
    if err: return err

    lessons = CourseLesson.objects.filter(module__course=course).order_by('module__order', 'order')
    report = []
    for lesson in lessons:
        if lesson.lesson_type not in ('video', 'practice'):
            continue
        if lesson.practice_assignments.exists():
            report.append({'lesson_id': lesson.id, 'status': 'skip_has_practice'})
            continue

        prompt = (
            f"Design a real-world practice assignment that a learner does "
            f"AFTER this lesson to consolidate it. Output should be "
            f"sector-neutral and executable in ~60 minutes of work.\n\n"
            f"Course: {course.title}\n"
            f"Lesson: {lesson.title}\n"
            f"Content summary: {(lesson.content or '')[:2000]}\n\n"
            f"Return JSON shape:\n"
            f'{{"title":"…","description":"…","acceptance_criteria":["…"],'
            f'"deliverables":["…"],"estimated_duration_minutes":60,'
            f'"difficulty":"medium"}}'
        )
        try:
            out = _call_openai(
                prompt,
                'You design professional-grade practice assignments that require '
                'applied thinking, not recall. Return JSON only.'
            )
        except Exception as e:
            report.append({'lesson_id': lesson.id, 'status': 'ai_failed', 'error': str(e)[:80]})
            continue

        # Criteria JSON stores acceptance + deliverables — grader will
        # review submissions against this.
        criteria = {
            'acceptance_criteria': out.get('acceptance_criteria', []),
            'deliverables': out.get('deliverables', []),
            'difficulty': out.get('difficulty', 'medium'),
        }
        pa = PracticeAssignment.objects.create(
            course=course,
            lesson=lesson,
            title=out.get('title', f'Practice: {lesson.title}')[:200],
            description=out.get('description', '')[:5000],
            duration_minutes=out.get('estimated_duration_minutes', 60),
            points=20,
            criteria=criteria,
        )
        report.append({
            'lesson_id': lesson.id,
            'status': 'ok',
            'practice_id': pa.id,
            'title': pa.title,
        })

    return Response({'course': course.slug, 'lessons_processed': len(report), 'report': report})


# ------------------------------------------------------------ SIMULATIONS
@api_view(['POST'])
@permission_classes([IsAdminUser])
def bulk_generate_simulations(request):
    """For each video lesson, generate 3 simulation scenarios (short 'what
    would you do' prompts with a correct answer). Stored in the lesson's
    visual_data JSONField since we don't have a dedicated Simulation model
    and they're lightweight micro-learning nuggets, not full assessments.

    If lesson.visual_data already contains simulations, skip.
    """
    course, err = _resolve_course(request)
    if err: return err

    lessons = CourseLesson.objects.filter(module__course=course).order_by('module__order', 'order')
    report = []
    for lesson in lessons:
        if lesson.lesson_type not in ('video', 'simulation'):
            continue
        vd = lesson.visual_data if isinstance(lesson.visual_data, dict) else {}
        if vd.get('simulations'):
            report.append({'lesson_id': lesson.id, 'status': 'skip_has_sims'})
            continue

        prompt = (
            f"Design 3 short simulation scenarios for this lesson. Each is "
            f"a ~30-second 'what would you do?' with 4 response options, "
            f"one clearly best. Cover breadth of the lesson.\n\n"
            f"Course: {course.title}\n"
            f"Lesson: {lesson.title}\n"
            f"Content: {(lesson.content or '')[:1800]}\n\n"
            f"Return JSON shape:\n"
            f'{{"simulations":[{{"id":"sim-1","scenario":"…","options":['
            f'"…","…","…","…"],"correct":0,"rationale":"…"}}]}}'
        )
        try:
            out = _call_openai(
                prompt,
                'You design bite-sized "what would you do" scenarios used as '
                'micro-learning in a PM training platform. Return JSON only.'
            )
        except Exception as e:
            report.append({'lesson_id': lesson.id, 'status': 'ai_failed', 'error': str(e)[:80]})
            continue

        vd['simulations'] = out.get('simulations', [])
        lesson.visual_data = vd
        lesson.save(update_fields=['visual_data'])
        report.append({
            'lesson_id': lesson.id,
            'status': 'ok',
            'simulation_count': len(vd['simulations']),
        })

    return Response({'course': course.slug, 'lessons_processed': len(report), 'report': report})
