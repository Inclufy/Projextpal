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
    CourseModule,  # Was "Module" 
    CourseLesson,  # Was "Lesson"
    Certificate    # Bestaat al!
)

# Deze models moeten nog toegevoegd worden aan models.py
try:
    from .models import Skill, PracticeAssignment, PracticeSubmission, Exam, ExamQuestion, ExamAttempt
except ImportError:
    # Models bestaan nog niet, ze worden toegevoegd via migrations
    Skill = None
    PracticeAssignment = None
    Exam = None

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
        
        # Create the course
        course = Course.objects.create(
            title=course_structure['course_title'],
            description=course_structure['course_description'],
            difficulty=data.get('difficulty', 'intermediate'),
            status='draft',
            language='nl'
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
    if Skill is None:
        return Response({
            'error': 'Skill model not yet migrated. Run migrations first.',
            'skills': []
        })
    
    skills = Skill.objects.all()
    
    category = request.query_params.get('category')
    if category and category != 'all':
        skills = skills.filter(category=category)
    
    search = request.query_params.get('search')
    if search:
        skills = skills.filter(title__icontains=search)
    
    data = [{
        'id': skill.id,
        'title': skill.title,
        'description': skill.description,
        'category': skill.category,
        'courses_count': skill.courses.count() if hasattr(skill, 'courses') else 0
    } for skill in skills]
    
    return Response(data)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def create_skill(request):
    """Create a new skill"""
    if Skill is None:
        return Response({'error': 'Run migrations first'}, status=status.HTTP_400_BAD_REQUEST)
    
    skill = Skill.objects.create(
        title=request.data['title'],
        description=request.data.get('description', ''),
        category=request.data.get('category', 'technical')
    )
    return Response({'id': skill.id, 'title': skill.title}, status=status.HTTP_201_CREATED)


@api_view(['PUT', 'DELETE'])
@permission_classes([IsAdminUser])
def manage_skill(request, skill_id):
    """Update or delete a skill"""
    if Skill is None:
        return Response({'error': 'Run migrations first'}, status=status.HTTP_400_BAD_REQUEST)
    
    skill = get_object_or_404(Skill, id=skill_id)
    
    if request.method == 'DELETE':
        skill.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    skill.title = request.data.get('title', skill.title)
    skill.description = request.data.get('description', skill.description)
    skill.category = request.data.get('category', skill.category)
    skill.save()
    
    return Response({'id': skill.id, 'title': skill.title})


@api_view(['POST'])
@permission_classes([IsAdminUser])
def generate_skills_ai(request):
    """Generate skills for a course using AI"""
    if Skill is None:
        return Response({'error': 'Run migrations first'}, status=status.HTTP_400_BAD_REQUEST)
    
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
            skill, created = Skill.objects.get_or_create(
                title=skill_data['title'],
                defaults={
                    'description': skill_data.get('description', ''),
                    'category': skill_data.get('category', 'technical')
                }
            )
            created_skills.append({'id': skill.id, 'title': skill.title, 'category': skill.category})
        
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
    if PracticeAssignment is None:
        return Response({'error': 'Run migrations first', 'assignments': []})
    
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
    if PracticeAssignment is None:
        return Response({'error': 'Run migrations first'}, status=status.HTTP_400_BAD_REQUEST)
    
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
    if Exam is None:
        return Response({'error': 'Run migrations first', 'exams': []})
    
    exams = Exam.objects.all()
    
    data = [{
        'id': exam.id,
        'title': exam.title,
        'num_questions': exam.questions.count() if hasattr(exam, 'questions') else 0,
        'time_limit': exam.time_limit_minutes,
        'passing_score': exam.passing_score,
        'attempts_count': exam.attempts.count() if hasattr(exam, 'attempts') else 0,
    } for exam in exams]
    
    return Response(data)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def create_exam(request):
    """Create a new exam"""
    if Exam is None:
        return Response({'error': 'Run migrations first'}, status=status.HTTP_400_BAD_REQUEST)
    
    exam = Exam.objects.create(
        title=request.data['title'],
        time_limit_minutes=request.data.get('time_limit', 60),
        passing_score=request.data.get('passing_score', 70)
    )
    return Response({'id': exam.id, 'title': exam.title}, status=status.HTTP_201_CREATED)


# ============================================================================
# CERTIFICATES
# ============================================================================

@api_view(['GET'])
@permission_classes([IsAdminUser])
def list_certificates(request):
    """Get all certificates"""
    certificates = Certificate.objects.select_related('user', 'course').all()
    
    course_id = request.query_params.get('course')
    if course_id and course_id != 'all':
        certificates = certificates.filter(course_id=course_id)
    
    data = [{
        'id': str(certificate.id),
        'user_name': certificate.user.get_full_name() if hasattr(certificate.user, 'get_full_name') else certificate.user.email,
        'user_email': certificate.user.email,
        'course': certificate.course.title,
        'certificate_number': getattr(certificate, 'certificate_number', 'N/A'),
        'issued_at': certificate.created_at.isoformat() if hasattr(certificate, 'created_at') else None,
        'verification_code': getattr(certificate, 'verification_code', 'N/A')
    } for certificate in certificates]
    
    return Response(data)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def certificate_stats(request):
    """Get certificate statistics"""
    total = Certificate.objects.count()
    this_month = Certificate.objects.filter(
        created_at__month=datetime.now().month
    ).count() if hasattr(Certificate, 'created_at') else 0
    
    return Response({
        'total': total,
        'this_month': this_month,
        'downloads': 0
    })
