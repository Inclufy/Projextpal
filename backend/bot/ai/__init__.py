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
        self.llm = ChatOpenAI(
            temperature=0.3,
            model_name="gpt-4o",
            openai_api_key=settings.OPENAI_API_KEY,
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