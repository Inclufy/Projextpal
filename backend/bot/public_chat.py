"""
Public chatbot for landing page visitors - no authentication required.
"""
import json
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from openai import OpenAI

client = OpenAI(api_key=settings.OPENAI_API_KEY)

SYSTEM_PROMPT = """Je bent de ProjeXtPal AI Assistent, een vriendelijke en behulpzame chatbot op de website van ProjeXtPal.

ProjeXtPal is een AI-powered platform voor programma- en projectmanagement. 

Belangrijke informatie over ProjeXtPal:
- AI-gestuurde projectplanning en tijdlijnen
- Risicoanalyse en mitigatie
- Statusrapporten en dashboards
- Team capaciteitsplanning
- Tijdregistratie
- Surveys en feedback
- Post-project evaluaties
- Learning Academy met trainingen

Prijzen:
- Basic: 25 euro/maand - 5 gebruikers, 10 projecten
- Professional: 75 euro/maand - 25 gebruikers, 50 projecten (meest populair)
- Enterprise: 200 euro/maand - Onbeperkt, inclusief Learning Academy
- Custom+: Op offerte - Voor grote organisaties

Learning Academy add-on: 15 euro/maand (gratis bij Enterprise)

Jouw taken:
1. Beantwoord vragen over ProjeXtPal en de functies
2. Help bezoekers de juiste pricing te kiezen
3. Beantwoord algemene vragen over projectmanagement
4. Moedig bezoekers aan om zich aan te melden of een demo aan te vragen

Houd antwoorden kort en vriendelijk. Maximaal 2-3 zinnen tenzij meer detail nodig is.
Antwoord in dezelfde taal als de vraag (Nederlands of Engels).
"""

@csrf_exempt
@require_http_methods(["POST"])
def public_chat(request):
    try:
        data = json.loads(request.body)
        message = data.get('message', '').strip()
        history = data.get('history', [])
        
        if not message:
            return JsonResponse({'error': 'Message is required'}, status=400)
        
        if len(message) > 500:
            return JsonResponse({'error': 'Message too long'}, status=400)
        
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        
        for msg in history[-6:]:
            messages.append({
                "role": msg.get('role', 'user'),
                "content": msg.get('content', '')
            })
        
        messages.append({"role": "user", "content": message})
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            temperature=0.7,
            max_tokens=300
        )
        
        reply = response.choices[0].message.content
        
        return JsonResponse({
            'reply': reply,
            'success': True
        })
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
