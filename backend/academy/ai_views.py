import os
import json
import re
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

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
        api_key = "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"
        
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
