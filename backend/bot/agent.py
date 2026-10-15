from django.conf import settings
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import SystemMessage
from langchain.agents import create_agent
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from typing import List, Dict, Any, TypedDict, Annotated, Sequence
import json
import logging
from bot.ai.tools import FORM_TOOLS_LIST

from bot.agent_antwoord import _naar_berichten, _antwoord_uit_result

logger = logging.getLogger("bot.ai")


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

        # langchain 1.x: create_openai_functions_agent en AgentExecutor bestaan niet meer.
        # create_agent levert een LangGraph-agent (CompiledStateGraph). Het prompt-sjabloon
        # met {input}/{chat_history}/{agent_scratchpad} vervalt: de geschiedenis gaat nu als
        # échte berichten mee in plaats van als in de prompt geplakte tekst, en het
        # scratchpad beheert de graaf zelf.
        self.agent_executor = create_agent(
            model=self.llm,
            tools=self.tools,
            system_prompt=SYSTEM_PROMPT,
        )

    def process_message(self, message: str, chat_history: List[Dict] = None) -> str:
        try:
            chat_history_str = ""
            if chat_history:
                for msg in chat_history[-10:]:
                    role = msg.get("role", "user")
                    content = msg.get("content", "")
                    chat_history_str += f"{role}: {content}\n"

            # langchain 1.x neemt en geeft berichten, geen {"input"}/{"output"}-woordenboek.
            # De geschiedenis gaat als echte Human/AI-berichten mee; chat_history_str blijft
            # hieronder alleen bestaan voor de modules die 'm nog als tekst doorgeven.
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
