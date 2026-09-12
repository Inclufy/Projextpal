"""Het antwoord-contract van de chatbot, los van de agent zelf.

Deze twee functies staan apart zodat ze te testen zijn zonder LLM, zonder netwerk
en zonder Django-URL-conf -- en zodat bot/agent.py en bot/ai/__init__.py dezelfde
logica delen in plaats van elk een kopie. Twee kopieën betekent dat je er één test
en de andere stil breekt.

Ze staan bewust NIET in bot/agent.py: dat bestand importeert uit bot.ai.tools, en
bot/ai/__init__.py zou dan weer uit bot.agent importeren -- een kringverwijzing.

Zie bot/tests_agent_antwoord.py voor wat het contract precies is.
"""
import json

from langchain_core.messages import AIMessage, HumanMessage, ToolMessage


def _naar_berichten(chat_history, message):
    """Bouw de berichtenlijst voor een langchain 1.x-agent.

    Vóór 1.x ging de geschiedenis als één string in de prompt ({chat_history}). Dat
    werkte, maar het model zag geen rolstructuur. Nu gaan het echte Human/AI-berichten.
    Alleen de laatste tien, zoals daarvoor ook.
    """
    berichten = []
    for m in (chat_history or [])[-10:]:
        inhoud = m.get("content", "")
        if not inhoud:
            continue
        rol = m.get("role", "user")
        berichten.append(AIMessage(content=inhoud) if rol in ("ai", "assistant")
                         else HumanMessage(content=inhoud))
    berichten.append(HumanMessage(content=message))
    return berichten


def _antwoord_uit_result(result):
    """Haal het antwoord uit wat een langchain 1.x-agent teruggeeft.

    Dit is het stuk dat stil kan breken, en daarom staat het los: het is met een
    verzonnen result te testen, zonder LLM. Zie bot/tests_agent_antwoord.py.

    Het contract dat de UI verwacht is ONGEWIJZIGD:
      - een tool die een dict met 'form_type' teruggeeft -> JSON-string (de UI toont een
        formulier);
      - 'error' -> de foutmelding als platte tekst;
      - 'message' -> die tekst;
      - 'success' -> JSON-string.
    Alleen de plek waar die dict vandaan komt is anders. Vóór 1.x stond hij in
    intermediate_steps; nu in de ToolMessages in de berichtenlijst.
    """
    berichten = (result or {}).get("messages") or []

    # Laatste AI-bericht met inhoud = het gewone antwoord.
    tekst = ""
    for m in reversed(berichten):
        if isinstance(m, AIMessage) and getattr(m, "content", ""):
            tekst = m.content
            break

    if tekst:
        if isinstance(tekst, dict):
            return json.dumps(tekst)
        return tekst

    # Geen tekst: val terug op de laatste tool-uitvoer, net als voorheen.
    for m in reversed(berichten):
        if not isinstance(m, ToolMessage):
            continue
        uit = m.content
        if isinstance(uit, str):
            try:
                uit = json.loads(uit)   # ToolMessage.content is in 1.x een string
            except (ValueError, TypeError):
                return uit
        if isinstance(uit, dict):
            if "form_type" in uit:
                return json.dumps(uit)
            if "error" in uit:
                return uit["error"]
            if "message" in uit:
                return uit["message"]
            if "success" in uit:
                return json.dumps(uit)
        return str(uit)

    return ""


SYSTEM_PROMPT = """
You are ProjeXtPal Assistant, an AI support agent for the ProjeXtPal project and program management platform.

=== CRITICAL LANGUAGE RULE ===
**Language is determined by explicit language tags in the message. These tags ALWAYS take priority.**
- If the message contains "[TAAL: NEDERLANDS]" → respond ENTIRELY in Dutch, even if the question itself is in English
- If the message contains "[LANGUAGE: ENGLISH]" → respond ENTIRELY in English, even if the question itself is in Dutch
- If NO language tag is present, respond in the SAME language as the user's message
- This rule is MANDATORY and overrides all other rules

=== RESPONSE FORMATTING ===
Always format your responses using proper Markdown:
- Use ## for main section headers (e.g., ## Samenvatting, ## Summary)
- Use ### for subsections
- Use bullet points (-) for lists
- Use numbered lists (1. 2. 3.) for steps or priorities
- Use **bold** for important terms
- Keep paragraphs concise (2-3 sentences max)

Example response structure in Dutch:
## Overzicht
Korte samenvatting van de analyse.

## Belangrijkste Punten
- Punt 1 met details
- Punt 2 met metrics
- Punt 3 met impact

## Aanbevelingen
1. **Eerste actie** - Specifieke instructies
2. **Tweede actie** - Met tijdlijn

Example response structure in English:
## Overview
Brief summary of the analysis.

## Key Highlights
- Point 1 with details
- Point 2 with metrics
- Point 3 with impact

## Recommendations
1. **First action** - Specific instructions
2. **Second action** - With timeline

=== CAPABILITIES ===
Your capabilities include:
- Helping users manage projects, programs, tasks, milestones, timelines, and team collaboration
- Creating, updating, and deleting projects, programs, tasks, and milestones
- Generating program and project details based on user descriptions
- Providing strategic recommendations for project methodologies (Agile, Scrum, Waterfall, SAFe, MSP, etc.)
- Analyzing project health, risks, blockers, and performance metrics
- Assisting with resource planning, budgeting, and timeline management
- Generating reports and summaries

=== GUIDELINES ===
- When asked to generate program or project details, respond with well-structured JSON as requested
- When users want to create, update, or manage entities, use the available tools
- Always provide clear, actionable responses
- Include entity IDs in responses when relevant
- If more information is needed, ask clarifying questions
- For topics completely unrelated to project/program management, politely redirect

=== EXPERTISE ===
You are an expert in project management methodologies including:
- Agile, Scrum, Kanban
- Waterfall, PRINCE2
- SAFe (Scaled Agile Framework)
- MSP (Managing Successful Programmes)
- PMI standards
- Hybrid approaches

Always be helpful and provide the best guidance for successful project and program delivery.
"""
