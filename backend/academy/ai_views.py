import os
import json
import re
import requests
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

@api_view(['POST'])
@permission_classes([AllowAny])
def ai_curate_course(request):
    print("\n" + "="*50)
    print("AI CURATE COURSE CALLED")
    print("="*50)
    
    try:
        topic = request.data.get('topic')
        available_modules = request.data.get('availableModules', [])
        
        print(f"Topic: {topic}")
        print(f"Modules: {len(available_modules)}")
        
        if not topic or not available_modules:
            print("ERROR: Missing data")
            return Response({'error': 'Topic and modules required'}, status=400)
        
        print("Getting API key...")
        api_key = os.getenv("OPENAI_API_KEY")
        
        if not api_key:
            print("ERROR: No API key!")
            return Response({'error': 'No API key'}, status=500)
        
        print(f"Key found: {api_key[:15]}...")
        
        from openai import OpenAI
        print("Creating OpenAI client...")
        client = OpenAI(api_key=api_key)
        
        print("Calling API...")
        response = client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=[
                {"role": "system", "content": "Return only valid JSON."},
                {"role": "user", "content": f"""Create course about {topic}. Return JSON:
{{"title": "Title", "subtitle": "Subtitle", "description": "Desc", "difficulty": "Intermediate", 
"methodology": "generic", "category": "project-management", "duration": "12",
"selectedModules": [{{"courseId": "{available_modules[0]['courseId']}", "moduleId": "{available_modules[0]['moduleId']}", "rationale": "Relevant"}}]}}"""}
            ],
            temperature=0.7,
            max_tokens=2000,
        )
        
        print("Got response!")
        content = response.choices[0].message.content
        print(f"Content: {content[:100]}")
        
        json_match = re.search(r'\{[\s\S]*\}', content)
        if not json_match:
            return Response({'error': 'No JSON'}, status=500)
        
        result = json.loads(json_match.group(0))
        print(f"Success: {result.get('title')}")
        return Response(result)
        
    except Exception as e:
        print(f"EXCEPTION: {e}")
        import traceback
        traceback.print_exc()
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([AllowAny])
def ai_generate_module(request):
    return Response({'error': 'Not implemented'}, status=501)


# ============================================================================
# AI COACH - Personalized learning assistant
# ============================================================================

COACH_SYSTEM_PROMPTS = {
    'explain': {
        'nl': """Je bent een deskundige AI Coach voor projectmanagement onderwijs.
Je legt concepten helder uit met praktijkvoorbeelden. Gebruik de context van de gebruiker
(sector, rol, methodologie) om je uitleg te personaliseren. Antwoord in het Nederlands.
Houd je antwoorden bondig maar informatief (max 200 woorden).""",
        'en': """You are an expert AI Coach for project management education.
You explain concepts clearly with practical examples. Use the user's context
(sector, role, methodology) to personalize your explanations. Answer in English.
Keep your responses concise but informative (max 200 words)."""
    },
    'apply': {
        'nl': """Je bent een praktische AI Coach die helpt concepten toe te passen in de praktijk.
Geef concrete, bruikbare adviezen gebaseerd op de sector en rol van de gebruiker.
Gebruik voorbeelden uit hun branche. Antwoord in het Nederlands. Max 200 woorden.""",
        'en': """You are a practical AI Coach helping apply concepts in real-world settings.
Give concrete, actionable advice based on the user's sector and role.
Use examples from their industry. Answer in English. Max 200 words."""
    },
    'reflect': {
        'nl': """Je bent een reflectieve AI Coach die helpt bij dieper nadenken over lesstof.
Stel prikkelende vragen, noem kernpunten, en help de gebruiker verbanden te leggen.
Antwoord in het Nederlands. Max 200 woorden.""",
        'en': """You are a reflective AI Coach helping students think deeper about lesson material.
Ask thought-provoking questions, highlight key insights, and help users connect concepts.
Answer in English. Max 200 words."""
    },
    'practice': {
        'nl': """Je bent een AI Coach die oefenvragen en scenario's maakt om kennis te testen.
Maak realistische, uitdagende vragen gerelateerd aan de les en de sector van de gebruiker.
Geef na het antwoord feedback. Antwoord in het Nederlands. Max 200 woorden.""",
        'en': """You are an AI Coach creating practice questions and scenarios to test knowledge.
Create realistic, challenging questions related to the lesson and the user's sector.
Provide feedback after answers. Answer in English. Max 200 words."""
    }
}


@api_view(['POST'])
@permission_classes([AllowAny])
def ai_coach_message(request):
    """AI Coach endpoint - personalized learning assistant for academy lessons"""
    try:
        lesson_id = request.data.get('lessonId', '')
        course_id = request.data.get('courseId', '')
        message = request.data.get('message', '')
        mode = request.data.get('mode', 'explain')
        context = request.data.get('context', {})
        history = request.data.get('history', [])
        language = request.data.get('language', 'nl')

        if not message:
            return Response({'error': 'Message is required'}, status=400)

        api_key = OPENAI_API_KEY
        if not api_key:
            return Response({'error': 'AI service not configured'}, status=503)

        # Build system prompt based on mode and language
        lang_key = 'nl' if language == 'nl' else 'en'
        system_prompt = COACH_SYSTEM_PROMPTS.get(mode, COACH_SYSTEM_PROMPTS['explain']).get(lang_key)

        # Add user context to system prompt
        context_parts = []
        if context.get('sector'):
            context_parts.append(f"Sector: {context['sector']}")
        if context.get('role'):
            context_parts.append(f"Role: {context['role']}")
        if context.get('methodology'):
            context_parts.append(f"Methodology: {context['methodology']}")
        if context.get('lessonTitle'):
            context_parts.append(f"Current lesson: {context['lessonTitle']}")
        if context.get('courseTitle'):
            context_parts.append(f"Course: {context['courseTitle']}")

        if context_parts:
            system_prompt += "\n\nUser context:\n" + "\n".join(context_parts)

        # Build messages array with conversation history
        messages = [{'role': 'system', 'content': system_prompt}]

        # Add recent conversation history (max 10 messages to keep context manageable)
        for msg in history[-10:]:
            role = 'user' if msg.get('role') == 'user' else 'assistant'
            messages.append({'role': role, 'content': msg.get('content', '')})

        # Add current message
        messages.append({'role': 'user', 'content': message})

        response = requests.post(
            'https://api.openai.com/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'gpt-4o-mini',
                'messages': messages,
                'temperature': 0.7,
                'max_tokens': 500
            },
            timeout=30
        )

        response.raise_for_status()
        data = response.json()
        ai_response = data['choices'][0]['message']['content']

        return Response({
            'message': ai_response,
            'mode': mode,
            'lessonId': lesson_id,
            'courseId': course_id
        })

    except requests.exceptions.Timeout:
        return Response({'error': 'AI service timeout, please try again'}, status=504)
    except requests.exceptions.RequestException as e:
        return Response({'error': f'AI service error: {str(e)}'}, status=502)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


# ============================================================================
# AI PRACTICE ASSIGNMENT - Personalized by sector & role
# ============================================================================

PRACTICE_SYSTEM_PROMPTS = {
    'nl': """Je bent een expert AI Coach die praktijkopdrachten maakt voor projectmanagement onderwijs.
Je genereert realistische, sector-specifieke opdrachten die studenten helpen de lesstof direct toe te passen.
De opdracht moet relevant zijn voor de sector en functie van de student.
Antwoord ALLEEN in geldig JSON formaat. Antwoord in het Nederlands.""",
    'en': """You are an expert AI Coach creating practice assignments for project management education.
You generate realistic, sector-specific assignments that help students directly apply lesson material.
The assignment must be relevant to the student's sector and role.
Answer ONLY in valid JSON format. Answer in English."""
}


@api_view(['POST'])
@permission_classes([AllowAny])
def ai_generate_practice(request):
    """Generate a personalized practice assignment based on sector and role"""
    try:
        lesson_title = request.data.get('lessonTitle', '')
        course_title = request.data.get('courseTitle', '')
        lesson_content = request.data.get('lessonContent', '')
        sector = request.data.get('sector', '')
        role = request.data.get('role', '')
        methodology = request.data.get('methodology', '')
        language = request.data.get('language', 'nl')

        if not lesson_title:
            return Response({'error': 'lessonTitle is required'}, status=400)

        api_key = OPENAI_API_KEY
        if not api_key:
            return Response({'error': 'AI service not configured'}, status=503)

        lang_key = 'nl' if language == 'nl' else 'en'
        system_prompt = PRACTICE_SYSTEM_PROMPTS[lang_key]

        sector_context = f"\nSector: {sector}" if sector else ""
        role_context = f"\nFunctie/Rol: {role}" if role else ""
        methodology_context = f"\nMethodologie: {methodology}" if methodology else ""
        content_snippet = f"\nLesinhoud (samenvatting): {lesson_content[:1500]}" if lesson_content else ""

        if lang_key == 'nl':
            user_prompt = f"""Maak een praktijkopdracht voor deze les:

Cursus: {course_title}
Les: {lesson_title}{sector_context}{role_context}{methodology_context}{content_snippet}

De opdracht moet:
- Direct toepasbaar zijn in de sector van de student{f' ({sector})' if sector else ''}
- Relevant zijn voor de rol{f' van {role}' if role else ''}
- De kernconcepten uit de les toetsen
- Realistisch en uitdagend zijn

Return JSON:
{{
  "assignment": {{
    "title": "Titel van de opdracht",
    "scenario": "Beschrijving van een realistisch scenario uit de sector van de student (3-4 zinnen)",
    "instructions": ["Stap 1: ...", "Stap 2: ...", "Stap 3: ...", "Stap 4: ..."],
    "deliverables": ["Oplevering 1", "Oplevering 2"],
    "rubric": [
      {{"criteria": "Criterium", "points": 10, "description": "Wat wordt beoordeeld"}},
      {{"criteria": "Criterium", "points": 10, "description": "Wat wordt beoordeeld"}}
    ],
    "tips": ["Praktische tip 1", "Praktische tip 2"],
    "estimatedTime": 45
  }}
}}"""
        else:
            user_prompt = f"""Create a practice assignment for this lesson:

Course: {course_title}
Lesson: {lesson_title}{sector_context}{role_context}{methodology_context}{content_snippet}

The assignment must:
- Be directly applicable in the student's sector{f' ({sector})' if sector else ''}
- Be relevant for the role{f' of {role}' if role else ''}
- Test the core concepts from the lesson
- Be realistic and challenging

Return JSON:
{{
  "assignment": {{
    "title": "Assignment title",
    "scenario": "Description of a realistic scenario from the student's sector (3-4 sentences)",
    "instructions": ["Step 1: ...", "Step 2: ...", "Step 3: ...", "Step 4: ..."],
    "deliverables": ["Deliverable 1", "Deliverable 2"],
    "rubric": [
      {{"criteria": "Criterion", "points": 10, "description": "What is evaluated"}},
      {{"criteria": "Criterion", "points": 10, "description": "What is evaluated"}}
    ],
    "tips": ["Practical tip 1", "Practical tip 2"],
    "estimatedTime": 45
  }}
}}"""

        response = requests.post(
            'https://api.openai.com/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'gpt-4o-mini',
                'messages': [
                    {'role': 'system', 'content': system_prompt},
                    {'role': 'user', 'content': user_prompt}
                ],
                'response_format': {'type': 'json_object'},
                'temperature': 0.8,
                'max_tokens': 1000
            },
            timeout=30
        )

        response.raise_for_status()
        data = response.json()
        result = json.loads(data['choices'][0]['message']['content'])

        return Response(result)

    except requests.exceptions.Timeout:
        return Response({'error': 'AI service timeout, please try again'}, status=504)
    except requests.exceptions.RequestException as e:
        return Response({'error': f'AI service error: {str(e)}'}, status=502)
    except Exception as e:
        return Response({'error': str(e)}, status=500)
