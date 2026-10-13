from django.conf import settings
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import SystemMessage
from langchain.agents import AgentExecutor
from langchain.agents.openai_functions_agent.base import create_openai_functions_agent
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
- For topics completely unrelated to project/program management, politely redirect

=== ACTIONS: BE A GUIDE *AND* AN EXECUTOR ===
Never announce an action without carrying it out. If a user asks you to
create, update, or delete something, you MUST either (a) call a tool that
actually performs it, or (b) ask for the missing details first — never both,
and never neither.

Tool preference for CREATE actions:
- Prefer the DIRECT create tools (``create_milestone``, ``create_task``,
  ``parse_and_create_project_structure``) whenever the user has given you
  enough information to act. Confirm success by including the returned id
  and a one-line recap in your reply.
- Only fall back to the form tools (``get_milestone_form``,
  ``get_task_form``, ``get_project_form``) when the user explicitly asks
  for a form, or when the required context is still ambiguous *and* a
  single clarifying question would not resolve it.

Required slots before you may call a create tool:
- ``create_milestone`` → ``project_id`` + ``name``
- ``create_task`` → ``milestone_id`` + ``title``
- ``parse_and_create_project_structure`` → ``project_id`` + a free-text
  description of what to generate

If any of those slots is missing, ask ONE targeted question that would
fill all of them at once (e.g. "On which project should I create this,
and what should the milestone be called?"). Do NOT invent ids. Do NOT
pretend to have created something.

When bulk-generating (e.g. "make 5 tasks for milestone 42"), call
``create_task`` once per task — each tool call returns its own id, and
your reply should list them.

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

        self.agent = create_openai_functions_agent(
            llm=self.llm,
            tools=self.tools,
            prompt=ChatPromptTemplate.from_messages(
                [
                    SystemMessage(content=SYSTEM_PROMPT),
                    ("human", "{input}"),
                    ("ai", "I'll help you with that."),
                    ("human", "{chat_history}"),
                    ("ai", "{agent_scratchpad}"),
                ]
            ),
        )

        self.agent_executor = AgentExecutor(
            agent=self.agent,
            tools=self.tools,
            verbose=True,
            handle_parsing_errors=True,
            return_intermediate_steps=True,
            max_iterations=5,
        )

    def process_message(self, message: str, chat_history: List[Dict] = None) -> str:
        try:
            chat_history_str = ""
            if chat_history:
                for msg in chat_history[-10:]:
                    role = msg.get("role", "user")
                    content = msg.get("content", "")
                    chat_history_str += f"{role}: {content}\n"

            result = self.agent_executor.invoke(
                {"input": message, "chat_history": chat_history_str}
            )

            output = result.get("output", "")

            if not output and result.get("intermediate_steps"):
                last_step = result["intermediate_steps"][-1]
                if len(last_step) > 1:
                    tool_output = last_step[1]
                    if isinstance(tool_output, dict):
                        if "form_type" in tool_output:
                            return json.dumps(tool_output)
                        elif "error" in tool_output:
                            return tool_output["error"]
                        elif "message" in tool_output:
                            return tool_output["message"]
                        elif "success" in tool_output:
                            return json.dumps(tool_output)
                    return str(tool_output)

            if isinstance(output, dict):
                if "form_type" in output:
                    return json.dumps(output)
                return json.dumps(output)

            return output

        except Exception as e:
            logger.error(f"Error processing message: {str(e)}", exc_info=True)
            return f"I encountered an error processing your request: {str(e)}"

    def get_tools_info(self) -> List[Dict]:
        return [
            {"name": tool.name, "description": tool.description} for tool in self.tools
        ]