"""
Academy Admin API - Complete Management Endpoints
CORRECTED for existing model names: CourseModule, CourseLesson, Certificate
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from openai import OpenAI
import os
import json
from datetime import datetime

# CORRECT IMPORTS - gebruik de echte model namen
from .models import (
    Course,
    CourseCategory,
    CourseModule,  # Was "Module"
    CourseLesson,  # Was "Lesson"
    Certificate    # Bestaat al!
)

# Import existing models - ExamQuestion does not exist (Exam uses JSONField for questions)
from .models import (
    Skill, SkillCategory, PracticeAssignment, PracticeSubmission,
    Exam, ExamAttempt, Certificate, LessonSkillMapping
)

def get_openai_client():
    return OpenAI(api_key=os.getenv('OPENAI_API_KEY', 'sk-placeholder'))

client = get_openai_client()

# ============================================================================
# AI COMPLETE COURSE GENERATION
# ============================================================================

@api_view(['POST'])
@permission_classes([IsAdminUser])
def generate_complete_course(request):
    """Generate a complete course with modules and lessons using AI"""
    data = request.data
    
    try:
        # Generate course structure
        prompt = f"""Generate a complete course structure for: "{data.get('topic')}"

Target Audience: {data.get('target_audience', 'General')}
Difficulty: {data.get('difficulty', 'intermediate')}
Number of Modules: {data.get('num_modules', 5)}
Lessons per Module: {data.get('lessons_per_module', 4)}

Return ONLY valid JSON (no markdown):
{{
  "course_title": "...",
  "course_description": "...",
  "modules": [
    {{
      "title": "...",
      "description": "...",
      "lessons": [
        {{
          "title": "...",
          "description": "...",
          "duration_minutes": 15,
          "lesson_type": "video"
        }}
      ]
    }}
  ]
}}"""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a professional course designer. Return ONLY valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=3000
        )
        
        content = response.choices[0].message.content.strip()
        if content.startswith('```'):
            content = content.split('```')[1]
            if content.startswith('json'):
                content = content[4:]
        content = content.strip()
        
        course_structure = json.loads(content)

        # Course.category is a non-null FK to CourseCategory. If prod hasn't been
        # seeded yet, bootstrap a default "General" category so the first
        # AI-generated course doesn't crash on an IntegrityError. Callers can
        # optionally pass `category_slug` to pick an existing one.
        from django.utils.text import slugify
        requested_slug = (data.get('category_slug') or '').strip()
        if requested_slug:
            category, _ = CourseCategory.objects.get_or_create(
                slug=requested_slug,
                defaults={'name': data.get('category_name', requested_slug.replace('-', ' ').title())}
            )
        else:
            category = CourseCategory.objects.first()
            if category is None:
                category = CourseCategory.objects.create(
                    name='General',
                    slug='general',
                    description='Default category — auto-created for the first course.',
                )

        # Course.slug is a SlugField with unique=True. Generating a unique
        # slug from the title prevents "duplicate key value violates unique
        # constraint academy_course_slug_key" (empty slugs would collide on
        # repeat calls).
        base_slug = slugify(course_structure['course_title'])[:50] or 'course'
        unique_slug = base_slug
        suffix = 2
        while Course.objects.filter(slug=unique_slug).exists():
            unique_slug = f"{base_slug}-{suffix}"
            suffix += 1

        # Create the course
        course = Course.objects.create(
            title=course_structure['course_title'],
            slug=unique_slug,
            description=course_structure['course_description'],
            difficulty=data.get('difficulty', 'intermediate'),
            status='draft',
            language='nl',
            category=category,
        )
        
        # Create modules and lessons
        for mod_idx, module_data in enumerate(course_structure['modules']):
            module = CourseModule.objects.create(  # Correct naam!
                course=course,
                title=module_data['title'],
                description=module_data.get('description', ''),
                order=mod_idx
            )
            
            for lesson_idx, lesson_data in enumerate(module_data['lessons']):
                CourseLesson.objects.create(  # Correct naam!
                    module=module,
                    title=lesson_data['title'],
                    lesson_type=lesson_data.get('lesson_type', 'video'),
                    duration_minutes=lesson_data.get('duration_minutes', 15),
                    order=lesson_idx,
                    content=lesson_data.get('description', '')
                )
        
        return Response({
            'success': True,
            'course_id': str(course.id),
            'message': f'Course "{course.title}" created with {len(course_structure["modules"])} modules'
        })
        
    except Exception as e:
        return Response({
            'error': 'Course generation failed',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============================================================================
# SKILLS MANAGEMENT
# ============================================================================

@api_view(['GET'])
@permission_classes([IsAdminUser])
def list_skills(request):
    """Get all skills"""
    skills = Skill.objects.all()
    
    category = request.query_params.get('category')
    if category and category != 'all':
        skills = skills.filter(category=category)
    
    search = request.query_params.get('search')
    if search:
        skills = skills.filter(name__icontains=search)

    data = [{
        'id': skill.id,
        'name': skill.name,
        'name_nl': skill.name_nl,
        'description': skill.description,
        'category': str(skill.category_id) if skill.category_id else None,
        'lessons_count': LessonSkillMapping.objects.filter(skill=skill).count()
    } for skill in skills]
    
    return Response(data)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def create_skill(request):
    """Create a new skill"""
    from django.db import IntegrityError
    from django.utils.text import slugify

    name = request.data.get('name')
    if not name:
        return Response({'error': 'name is required'}, status=status.HTTP_400_BAD_REQUEST)

    # Skill.category is a non-null FK. If the caller didn't pass one, or
    # passed an unknown slug, bootstrap/find a default "General" category
    # so we don't raise IntegrityError → 500.
    category_id = request.data.get('category')
    category = None
    if category_id:
        category = SkillCategory.objects.filter(id=category_id).first()
    if category is None:
        category, _ = SkillCategory.objects.get_or_create(
            id='general',
            defaults={'name': 'General', 'name_nl': 'Algemeen',
                      'icon': 'star', 'color': 'gray', 'order': 99},
        )

    # Ensure unique slug-style PK; Skill.id is a CharField primary key so
    # duplicates would IntegrityError. Auto-dedupe with numeric suffix.
    base_id = request.data.get('id') or slugify(name)[:50] or 'skill'
    skill_id = base_id
    n = 2
    while Skill.objects.filter(id=skill_id).exists():
        skill_id = f"{base_id}-{n}"
        n += 1

    try:
        skill = Skill.objects.create(
            id=skill_id,
            name=name,
            name_nl=request.data.get('name_nl', '') or name,
            description=request.data.get('description', ''),
            description_nl=request.data.get('description_nl', ''),
            category=category,
        )
    except IntegrityError as e:
        return Response({'error': f'could not create skill: {e}'},
                        status=status.HTTP_400_BAD_REQUEST)
    return Response({'id': skill.id, 'name': skill.name}, status=status.HTTP_201_CREATED)


@api_view(['PUT', 'DELETE'])
@permission_classes([IsAdminUser])
def manage_skill(request, skill_id):
    """Update or delete a skill"""
    skill = get_object_or_404(Skill, id=skill_id)
    
    if request.method == 'DELETE':
        skill.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    skill.name = request.data.get('name', skill.name)
    skill.name_nl = request.data.get('name_nl', skill.name_nl)
    skill.description = request.data.get('description', skill.description)
    skill.description_nl = request.data.get('description_nl', skill.description_nl)
    category_id = request.data.get('category')
    if category_id:
        skill.category = SkillCategory.objects.filter(id=category_id).first()
    skill.save()

    return Response({'id': skill.id, 'name': skill.name})


@api_view(['POST'])
@permission_classes([IsAdminUser])
def generate_skills_ai(request):
    """Generate skills for a course using AI"""
    course_id = request.data.get('course_id')
    course = get_object_or_404(Course, id=course_id)
    
    prompt = f"""Generate skills for: "{course.title}"
Description: {course.description}

Return ONLY JSON:
{{
  "skills": [
    {{
      "title": "...",
      "description": "...",
      "category": "technical|soft|leadership|methodology"
    }}
  ]
}}"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Return ONLY JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1000
        )
        
        content = response.choices[0].message.content.strip()
        if content.startswith('```'):
            content = content.split('```')[1]
            if content.startswith('json'):
                content = content[4:]
        content = content.strip()
        
        skills_data = json.loads(content)
        created_skills = []
        
        for skill_data in skills_data['skills']:
            skill_id = skill_data['title'].lower().replace(' ', '-')
            category = SkillCategory.objects.filter(id=skill_data.get('category', 'technical')).first()
            skill, created = Skill.objects.get_or_create(
                id=skill_id,
                defaults={
                    'name': skill_data['title'],
                    'description': skill_data.get('description', ''),
                    'category': category
                }
            )
            created_skills.append({'id': skill.id, 'name': skill.name, 'category': str(skill.category_id)})
        
        return Response({'skills': created_skills})
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============================================================================
# PRACTICE ASSIGNMENTS
# ============================================================================

@api_view(['GET'])
@permission_classes([IsAdminUser])
def list_practice_assignments(request):
    """Get all practice assignments"""
    assignments = PracticeAssignment.objects.select_related('course').all()
    
    course_id = request.query_params.get('course')
    if course_id and course_id != 'all':
        assignments = assignments.filter(course_id=course_id)
    
    data = [{
        'id': assignment.id,
        'title': assignment.title,
        'description': assignment.description,
        'course': assignment.course.title if assignment.course else None,
        'duration_minutes': assignment.duration_minutes,
        'points': assignment.points,
        'submissions_count': assignment.submissions.count() if hasattr(assignment, 'submissions') else 0
    } for assignment in assignments]
    
    return Response(data)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def create_practice_assignment(request):
    """Create a new practice assignment"""
    assignment = PracticeAssignment.objects.create(
        title=request.data['title'],
        description=request.data.get('description', ''),
        course_id=request.data.get('course_id'),
        duration_minutes=request.data.get('duration_minutes', 60),
        points=request.data.get('points', 10)
    )
    return Response({'id': assignment.id, 'title': assignment.title}, status=status.HTTP_201_CREATED)


# ============================================================================
# EXAMS
# ============================================================================

@api_view(['GET'])
@permission_classes([IsAdminUser])
def list_exams(request):
    """Get all exams"""
    exams = Exam.objects.all()
    
    data = [{
        'id': exam.id,
        'title': exam.title,
        'num_questions': len(exam.questions) if exam.questions else 0,
        'time_limit': exam.time_limit,
        'passing_score': exam.passing_score,
        'attempts_count': exam.attempts.count() if hasattr(exam, 'attempts') else 0,
    } for exam in exams]
    
    return Response(data)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def create_exam(request):
    """Create a new exam"""
    # Exam.questions is a JSONField with no default and no null=True, so
    # calling .create() without it raises IntegrityError → bare 500.
    # Default to empty list + handle duration_minutes alias the frontend
    # sometimes sends instead of time_limit.
    title = request.data.get('title')
    if not title:
        return Response({'error': 'title is required'},
                        status=status.HTTP_400_BAD_REQUEST)
    time_limit = request.data.get('time_limit',
                                   request.data.get('duration_minutes', 60))
    from django.db import IntegrityError
    try:
        exam = Exam.objects.create(
            title=title,
            description=request.data.get('description', ''),
            time_limit=time_limit,
            passing_score=request.data.get('passing_score', 80),
            max_attempts=request.data.get('max_attempts', 3),
            questions=request.data.get('questions', []),
            course_id=request.data.get('course_id'),
            module_id=request.data.get('module_id'),
        )
    except IntegrityError as e:
        return Response({'error': f'could not create exam: {e}'},
                        status=status.HTTP_400_BAD_REQUEST)
    return Response({'id': exam.id, 'title': exam.title}, status=status.HTTP_201_CREATED)


# ============================================================================
# CERTIFICATES
# ============================================================================

@api_view(['GET'])
@permission_classes([IsAdminUser])
def list_certificates(request):
    """Get all certificates"""
    certificates = Certificate.objects.select_related('enrollment__user', 'enrollment__course').all()

    course_id = request.query_params.get('course')
    if course_id and course_id != 'all':
        certificates = certificates.filter(enrollment__course_id=course_id)

    data = [{
        'id': str(certificate.id),
        'user_name': (certificate.enrollment.user.get_full_name()
                      if certificate.enrollment.user
                      else certificate.enrollment.first_name or 'N/A'),
        'user_email': (certificate.enrollment.user.email
                       if certificate.enrollment.user
                       else certificate.enrollment.email),
        'course': certificate.enrollment.course.title,
        'certificate_number': certificate.certificate_number or 'N/A',
        'issued_at': certificate.issued_at.isoformat() if certificate.issued_at else None,
        'verification_code': certificate.verification_code or 'N/A'
    } for certificate in certificates]
    
    return Response(data)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def certificate_stats(request):
    """Get certificate statistics"""
    total = Certificate.objects.count()
    this_month = Certificate.objects.filter(
        issued_at__month=datetime.now().month,
        issued_at__year=datetime.now().year
    ).count()
    
    return Response({
        'total': total,
        'this_month': this_month,
        'downloads': 0
    })
