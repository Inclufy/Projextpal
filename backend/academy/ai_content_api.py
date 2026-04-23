from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
import os
import requests
import json

OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

# ============================================================================
# ENHANCEDCOURSEBUILDER FUNCTIONS (6 new functions)
# ============================================================================

@api_view(['POST'])
@permission_classes([IsAdminUser])
def generate_content(request):
    """Generate lesson content using AI (EnhancedCourseBuilder)"""
    context = request.data.get('context', {})
    
    prompt = f"""Generate a comprehensive lesson transcript for:

Course: {context.get('courseTitle')}
Module: {context.get('moduleTitle')}
Lesson: {context.get('lessonTitle')}
Type: {context.get('lessonType', 'video')}
Duration: {context.get('duration', 15)} minutes

Create an engaging, educational transcript that:
- Explains concepts clearly with examples
- Uses a conversational teaching style
- Includes real-world applications
- Is approximately {context.get('duration', 15) * 200} words

Return ONLY the transcript content, no metadata."""

    try:
        response = requests.post(
            'https://api.openai.com/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {OPENAI_API_KEY}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'gpt-4o-mini',
                'messages': [
                    {'role': 'system', 'content': 'You are an expert course content creator.'},
                    {'role': 'user', 'content': prompt}
                ],
                'temperature': 0.7
            },
            timeout=60
        )
        
        response.raise_for_status()
        content = response.json()['choices'][0]['message']['content']
        
        return Response({'content': content})
    except Http404:
        raise
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def generate_quiz(request):
    """Generate quiz questions from lesson content (EnhancedCourseBuilder)"""
    context = request.data.get('context', {})
    num_questions = request.data.get('num_questions', 5)
    
    prompt = f"""Create {num_questions} multiple-choice quiz questions for:

Course: {context.get('courseTitle')}
Lesson: {context.get('lessonTitle')}
Content: {context.get('existingContent', '')[:2000]}

Return JSON with this exact format:
{{
  "questions": [
    {{
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Why this is correct",
      "difficulty": "medium"
    }}
  ]
}}"""

    try:
        response = requests.post(
            'https://api.openai.com/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {OPENAI_API_KEY}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'gpt-4o-mini',
                'messages': [
                    {'role': 'system', 'content': 'You create educational quiz questions. Return valid JSON only.'},
                    {'role': 'user', 'content': prompt}
                ],
                'response_format': {'type': 'json_object'},
                'temperature': 0.7
            },
            timeout=60
        )
        
        response.raise_for_status()
        data = response.json()
        questions = json.loads(data['choices'][0]['message']['content'])
        
        return Response({'questions': questions.get('questions', [])})
    except Http404:
        raise
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def generate_simulation(request):
    """Generate simulation scenario (EnhancedCourseBuilder)"""
    context = request.data.get('context', {})
    
    prompt = f"""Create an interactive simulation scenario for:

Course: {context.get('courseTitle')}
Lesson: {context.get('lessonTitle')}

Return JSON with this exact format:
{{
  "simulation": {{
    "id": "scenario_id",
    "title": "Scenario title",
    "description": "Brief description",
    "scenario": "Detailed scenario text with context and challenge",
    "options": [
      {{
        "text": "Option 1 text",
        "outcome": "What happens if chosen",
        "points": 10
      }},
      {{
        "text": "Option 2 text",
        "outcome": "What happens if chosen",
        "points": 5
      }}
    ],
    "learningPoints": ["Key takeaway 1", "Key takeaway 2"]
  }}
}}"""

    try:
        response = requests.post(
            'https://api.openai.com/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {OPENAI_API_KEY}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'gpt-4o-mini',
                'messages': [
                    {'role': 'system', 'content': 'Create realistic PM simulations. Return valid JSON only.'},
                    {'role': 'user', 'content': prompt}
                ],
                'response_format': {'type': 'json_object'},
                'temperature': 0.8
            },
            timeout=60
        )
        
        response.raise_for_status()
        data = response.json()
        simulation = json.loads(data['choices'][0]['message']['content'])
        
        return Response(simulation)
    except Http404:
        raise
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def generate_assignment(request):
    """Generate practical assignment (EnhancedCourseBuilder)"""
    context = request.data.get('context', {})
    
    prompt = f"""Create a practical assignment for:

Course: {context.get('courseTitle')}
Lesson: {context.get('lessonTitle')}

Return JSON with this exact format:
{{
  "assignment": {{
    "title": "Assignment title",
    "description": "What students will learn",
    "instructions": ["Step 1", "Step 2", "Step 3"],
    "deliverables": ["Deliverable 1", "Deliverable 2"],
    "rubric": [
      {{
        "criteria": "Criterion name",
        "points": 10,
        "description": "What to evaluate"
      }}
    ],
    "estimatedTime": 60
  }}
}}"""

    try:
        response = requests.post(
            'https://api.openai.com/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {OPENAI_API_KEY}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'gpt-4o-mini',
                'messages': [
                    {'role': 'system', 'content': 'Create practical assignments. Return valid JSON only.'},
                    {'role': 'user', 'content': prompt}
                ],
                'response_format': {'type': 'json_object'},
                'temperature': 0.7
            },
            timeout=60
        )
        
        response.raise_for_status()
        data = response.json()
        assignment = json.loads(data['choices'][0]['message']['content'])
        
        return Response(assignment)
    except Http404:
        raise
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def generate_exam(request):
    """Generate comprehensive exam (EnhancedCourseBuilder)"""
    context = request.data.get('context', {})
    num_questions = request.data.get('num_questions', 20)
    
    prompt = f"""Create a comprehensive exam with {num_questions} questions for:

Course: {context.get('courseTitle')}
Module: {context.get('moduleTitle')}

Mix of question types:
- 60% multiple choice
- 20% true/false  
- 20% short answer

Return JSON with this exact format:
{{
  "questions": [
    {{
      "type": "multiple_choice",
      "question": "Question text?",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "points": 5,
      "explanation": "Why this is correct"
    }}
  ]
}}"""

    try:
        response = requests.post(
            'https://api.openai.com/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {OPENAI_API_KEY}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'gpt-4o-mini',
                'messages': [
                    {'role': 'system', 'content': 'Create comprehensive exams. Return valid JSON only.'},
                    {'role': 'user', 'content': prompt}
                ],
                'response_format': {'type': 'json_object'},
                'temperature': 0.7
            },
            timeout=90
        )
        
        response.raise_for_status()
        data = response.json()
        exam = json.loads(data['choices'][0]['message']['content'])
        
        return Response(exam)
    except Http404:
        raise
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def extract_skills(request):
    """Extract skills from content (EnhancedCourseBuilder)"""
    content = request.data.get('content', '')
    course_title = request.data.get('course_title', '')
    
    prompt = f"""Analyze this lesson content and extract skills:

Course: {course_title}
Content: {content[:3000]}

Return JSON with this exact format:
{{
  "skills": {{
    "technical": ["Skill 1", "Skill 2"],
    "soft": ["Skill 1", "Skill 2"],
    "tools": ["Tool 1", "Tool 2"],
    "methodologies": ["Method 1", "Method 2"]
  }}
}}"""

    try:
        response = requests.post(
            'https://api.openai.com/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {OPENAI_API_KEY}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'gpt-4o-mini',
                'messages': [
                    {'role': 'system', 'content': 'Extract skills from educational content. Return valid JSON only.'},
                    {'role': 'user', 'content': prompt}
                ],
                'response_format': {'type': 'json_object'},
                'temperature': 0.5
            },
            timeout=30
        )
        
        response.raise_for_status()
        data = response.json()
        skills = json.loads(data['choices'][0]['message']['content'])
        
        return Response(skills)
    except Http404:
        raise
    except Exception as e:
        return Response({'error': str(e)}, status=500)


# ============================================================================
# ADMIN PORTAL FUNCTIONS (4 old functions for backward compatibility)
# ============================================================================

from django.http import Http404


@api_view(['POST'])
@permission_classes([IsAdminUser])
def analyze_lesson_content(request, lesson_id):
    """Analyze lesson content and suggest improvements (Admin Portal)"""
    try:
        from .models import CourseLesson
        from django.shortcuts import get_object_or_404
        lesson = get_object_or_404(CourseLesson, id=lesson_id)
        
        prompt = f"""Analyze this lesson and provide improvement suggestions:

Lesson: {lesson.title}
Content: {lesson.content[:2000] if lesson.content else 'No content yet'}

Return JSON with this exact format:
{{
  "analysis": {{
    "suggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3"],
    "readability_score": 75,
    "estimated_duration": 15,
    "key_concepts": ["Concept 1", "Concept 2", "Concept 3"]
  }}
}}"""

        response = requests.post(
            'https://api.openai.com/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {OPENAI_API_KEY}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'gpt-4o-mini',
                'messages': [
                    {'role': 'system', 'content': 'You are an educational content analyst. Return valid JSON only.'},
                    {'role': 'user', 'content': prompt}
                ],
                'response_format': {'type': 'json_object'},
                'temperature': 0.7
            },
            timeout=60
        )
        
        response.raise_for_status()
        data = response.json()
        result = json.loads(data['choices'][0]['message']['content'])
        
        return Response(result)
    except Http404:
        raise
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def auto_assign_skills(request, lesson_id):
    """Auto-assign skills to a lesson based on content (Admin Portal)"""
    try:
        from .models import CourseLesson
        from django.shortcuts import get_object_or_404
        lesson = get_object_or_404(CourseLesson, id=lesson_id)
        
        prompt = f"""Identify relevant skills for this lesson:

Lesson: {lesson.title}
Content: {lesson.content[:2000] if lesson.content else 'No content'}

Return JSON with this exact format:
{{
  "skills": [
    {{
      "name": "Skill name",
      "category": "technical",
      "proficiency_level": "intermediate"
    }}
  ]
}}"""

        response = requests.post(
            'https://api.openai.com/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {OPENAI_API_KEY}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'gpt-4o-mini',
                'messages': [
                    {'role': 'system', 'content': 'You identify skills from educational content. Return valid JSON only.'},
                    {'role': 'user', 'content': prompt}
                ],
                'response_format': {'type': 'json_object'},
                'temperature': 0.5
            },
            timeout=60
        )
        
        response.raise_for_status()
        data = response.json()
        skills_data = json.loads(data['choices'][0]['message']['content'])
        
        return Response(skills_data)
    except Http404:
        raise
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def generate_visual(request, lesson_id, visual_type):
    """Generate visual content suggestion for a lesson (Admin Portal)"""
    try:
        from .models import CourseLesson
        from django.shortcuts import get_object_or_404
        lesson = get_object_or_404(CourseLesson, id=lesson_id)
        
        prompt = f"""Suggest a {visual_type} visual for this lesson:

Lesson: {lesson.title}
Content: {lesson.content[:1500] if lesson.content else 'No content'}

Return JSON with this exact format:
{{
  "visual": {{
    "visual_type": "{visual_type}",
    "title": "Visual title",
    "description": "What to show",
    "elements": ["Element 1", "Element 2"],
    "colors": ["#8B5CF6", "#D946EF"],
    "style": "minimalist"
  }}
}}"""

        response = requests.post(
            'https://api.openai.com/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {OPENAI_API_KEY}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'gpt-4o-mini',
                'messages': [
                    {'role': 'system', 'content': 'You suggest educational visuals. Return valid JSON only.'},
                    {'role': 'user', 'content': prompt}
                ],
                'response_format': {'type': 'json_object'},
                'temperature': 0.8
            },
            timeout=60
        )
        
        response.raise_for_status()
        data = response.json()
        visual = json.loads(data['choices'][0]['message']['content'])
        
        return Response(visual)
    except Http404:
        raise
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def batch_analyze_course(request, course_id):
    """Batch analyze all lessons in a course (Admin Portal)"""
    try:
        from .models import Course, CourseLesson
        course = Course.objects.get(id=course_id)
        lessons = CourseLesson.objects.filter(module__course=course)
        
        results = []
        for lesson in lessons[:10]:  # Limit to first 10 to avoid timeout
            prompt = f"""Quick quality analysis:

Title: {lesson.title}
Content length: {len(lesson.content or '')} characters

Return JSON: {{"quality_score": 85, "needs_improvement": false, "priority": "medium"}}"""

            try:
                response = requests.post(
                    'https://api.openai.com/v1/chat/completions',
                    headers={
                        'Authorization': f'Bearer {OPENAI_API_KEY}',
                        'Content-Type': 'application/json'
                    },
                    json={
                        'model': 'gpt-4o-mini',
                        'messages': [
                            {'role': 'system', 'content': 'Quick lesson quality analysis. Return valid JSON only.'},
                            {'role': 'user', 'content': prompt}
                        ],
                        'response_format': {'type': 'json_object'},
                        'temperature': 0.5
                    },
                    timeout=30
                )
                
                response.raise_for_status()
                data = response.json()
                analysis = json.loads(data['choices'][0]['message']['content'])
                
                results.append({
                    'lesson_id': lesson.id,
                    'lesson_title': lesson.title,
                    'analysis': analysis
                })
            except Exception as e:
                results.append({
                    'lesson_id': lesson.id,
                    'lesson_title': lesson.title,
                    'error': str(e)
                })
        
        return Response({
            'course_id': str(course_id),
            'total_lessons': lessons.count(),
            'analyzed': len(results),
            'results': results
        })
    except Http404:
        raise
    except Exception as e:
        return Response({'error': str(e)}, status=500)