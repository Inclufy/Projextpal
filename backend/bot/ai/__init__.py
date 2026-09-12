from django.conf import settings
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import SystemMessage
from langchain.agents import create_agent

from bot.agent_antwoord import _naar_berichten, _antwoord_uit_result
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from typing import List, Dict, Any, TypedDict, Annotated, Sequence
import json
import logging
from bot.ai.tools import FORM_TOOLS_LIST

logger = logging.getLogger("bot.ai")

SYSTEM_PROMPT = """
You are ProjeXtPal Assistant, an AI support agent for the ProjeXtPal project and program management platform.

=== CRITICAL LANGUAGE RULE ===
**ALWAYS respond in the SAME language as the user's message.**
- If the user writes in Dutch (Nederlands) → respond ENTIRELY in Dutch
- If the user writes in English → respond ENTIRELY in English
- If the user writes in German → respond ENTIRELY in German
- This rule is MANDATORY and overrides all other formatting rules
- When you see "[BELANGRIJK: Antwoord volledig in het Nederlands]" → respond in Dutch
- When you see "[IMPORTANT: Respond entirely in English]" → respond in English

Examples:
- User: "Geef een overzicht van mijn projecten" → Respond in Dutch
- User: "Give me an overview of my projects" → Respond in English
- User: "Maak een nieuw project aan" → Respond in Dutch
- User: "Create a new project" → Respond in English

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


class AgentState(TypedDict):
    messages: Annotated[Sequence[Any], "The messages in the conversation"]
    next: Annotated[str, "The next step to take"]


class ERPAIAgent:
    def __init__(self, tools: List = None, user=None):
        # BYO key resolver — uses the user's company key if configured,
        # falls back to settings.OPENAI_API_KEY.
        from core.llm_keys import get_langchain_openai_kwargs
        company = getattr(user, "company", None) if user else None
        llm_kwargs = get_langchain_openai_kwargs(company)
        if not llm_kwargs:
            llm_kwargs = {"openai_api_key": settings.OPENAI_API_KEY}
        self.llm = ChatOpenAI(
            temperature=0.3,
            model_name="gpt-4o",
            **llm_kwargs,
        )

        self.user = user
        self.tools = tools
        if not self.tools:
            logger.warning("No tools provided to AIAgent")

        # Zie bot/agent.py: langchain 1.x kent AgentExecutor en
        # create_openai_functions_agent niet meer. create_agent levert een LangGraph-agent.
        self.agent_executor = create_agent(
            model=self.llm,
            tools=self.tools,
            system_prompt=SYSTEM_PROMPT,
        )

    def process_message(self, message: str, chat_history: List[Dict] = None) -> str:
        try:
            # langchain 1.x: berichten in, berichten uit. Zelfde contract naar de UI,
            # andere plek waar de tool-uitvoer vandaan komt -- zie bot/agent_antwoord.py.
            berichten = _naar_berichten(chat_history, message)
            result = self.agent_executor.invoke({"messages": berichten})
            return _antwoord_uit_result(result)

        except Exception as e:
            logger.error(f"Error processing message: {str(e)}", exc_info=True)
            return f"I encountered an error processing your request: {str(e)}"

    def get_tools_info(self) -> List[Dict]:
        return [
            {"name": tool.name, "description": tool.description} for tool in self.tools
        ]