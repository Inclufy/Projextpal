"""
Public chatbot for landing page visitors — no authentication required.

Rate limiting (defense in depth — both layers are intentional):

1. Cloudflare WAF rate-limit rule on /api/v1/bot/public/
   (3 req / 10s / IP — caught at the edge before reaching origin).

2. DRF ScopedRateThrottle in this view (20 req / hour / IP — caught at
   the Django layer, plan-independent, survives even if Cloudflare is
   bypassed or the WAF rule is accidentally deleted).

Both protect the OpenAI API key from being drained by abusive clients.
"""
import json

from django.conf import settings
from openai import OpenAI
from rest_framework.decorators import (
    api_view,
    permission_classes,
    throttle_classes,
)
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle

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


@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([ScopedRateThrottle])
def public_chat(request):
    """
    Landing-page chatbot endpoint.

    Auth: AllowAny — by design, this serves anonymous prospects on the
    marketing site.

    Throttle: scope='public_chat', configured in core.settings
    DEFAULT_THROTTLE_RATES['public_chat'] = '20/hour'. Per-IP, tracked
    in the DRF cache backend.
    """
    public_chat.throttle_scope = "public_chat"  # consumed by ScopedRateThrottle

    try:
        message = (request.data.get("message") or "").strip()
        history = request.data.get("history", [])

        if not message:
            return Response({"error": "Message is required"}, status=400)

        if len(message) > 500:
            return Response({"error": "Message too long"}, status=400)

        messages = [{"role": "system", "content": SYSTEM_PROMPT}]

        for msg in history[-6:]:
            messages.append({
                "role": msg.get("role", "user"),
                "content": msg.get("content", ""),
            })

        messages.append({"role": "user", "content": message})

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            temperature=0.7,
            max_tokens=300,
        )

        reply = response.choices[0].message.content

        return Response({"reply": reply, "success": True})

    except json.JSONDecodeError:
        return Response({"error": "Invalid JSON"}, status=400)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


# DRF reads `throttle_scope` from the view function. With function-based
# views the attribute must live on the function object itself.
public_chat.throttle_scope = "public_chat"
