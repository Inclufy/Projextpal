"""
AI-powered report generation using OpenAI GPT.
"""
import json
import logging
from datetime import date
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from django.conf import settings

from core.llm_keys import get_langchain_openai_kwargs

logger = logging.getLogger(__name__)

# Dutch month names so the "Vandaag is …" directive reads correctly for NL
# tenants without pulling in Babel/strftime-locale machinery.
_NL_MONTHS = (
    "januari", "februari", "maart", "april", "mei", "juni",
    "juli", "augustus", "september", "oktober", "november", "december",
)


def _today_directive() -> str:
    """Return a short bilingual system-prompt line stating today's date.

    The LLM has no notion of "now", so without this it hallucinates dates
    (observed: a governance report dated "24 oktober 2023" generated in
    2026).  We inject the real date in both ISO form (unambiguous) and
    NL long form (matches the Dutch headings the model otherwise fabricates).
    """
    today = date.today()
    nl_long = f"{today.day} {_NL_MONTHS[today.month - 1]} {today.year}"
    return (
        f"[CURRENT DATE — AUTHORITATIVE] Today is {today.isoformat()} "
        f"({nl_long}). Use this date verbatim wherever the report asks for "
        f"\"Current date\" or similar; never fabricate another date."
    )

REPORT_PROMPTS = {
    "portfolio-analysis": {
        "system": """You are a senior portfolio management consultant. Analyze the portfolio data and provide a comprehensive strategic analysis report.
Structure your response as a JSON object:
{{
    "title": "Portfolio Analysis Report",
    "date": "Current date",
    "executive_summary": "2-3 paragraph executive summary",
    "sections": [
        {{"heading": "Section Title", "content": "Detailed content with insights"}},
        ...
    ],
    "recommendations": ["Recommendation 1", "Recommendation 2", ...],
    "risk_highlights": ["Risk 1", "Risk 2", ...],
    "kpis": [{{"name": "KPI Name", "value": "Value", "trend": "up|down|stable"}}]
}}""",
        "human": """Generate a Portfolio Analysis Report based on this data:

Portfolios: {portfolios}
Total Programs: {program_count}
Total Projects: {project_count}
Active Projects: {active_projects}

Company: {company_name}
"""
    },
    "executive-summary": {
        "system": """You are a C-level executive advisor. Create a concise executive summary report.
Structure your response as a JSON object:
{{
    "title": "Executive Summary",
    "date": "Current date",
    "executive_summary": "High-level overview paragraph",
    "sections": [
        {{"heading": "Portfolio Health", "content": "Overview of portfolio status"}},
        {{"heading": "Key Metrics", "content": "Important numbers and trends"}},
        {{"heading": "Strategic Alignment", "content": "How projects align with strategy"}},
        {{"heading": "Action Items", "content": "Immediate actions needed"}}
    ],
    "recommendations": ["Recommendation 1", ...],
    "risk_highlights": ["Risk 1", ...],
    "kpis": [{{"name": "KPI", "value": "Value", "trend": "up|down|stable"}}]
}}""",
        "human": """Create an Executive Summary based on:

Portfolios: {portfolios}
Programs: {program_count}
Projects: {project_count}
Active: {active_projects}
Company: {company_name}
Boards: {board_count}
Stakeholders: {stakeholder_count}
"""
    },
    "financial-overview": {
        "system": """You are a financial controller for project portfolios. Create a financial overview report.
Structure as JSON:
{{
    "title": "Financial Overview Report",
    "date": "Current date",
    "executive_summary": "Financial health summary",
    "sections": [
        {{"heading": "Budget Overview", "content": "Budget allocation and utilization"}},
        {{"heading": "Spending Trends", "content": "Analysis of spending patterns"}},
        {{"heading": "Forecasts", "content": "Financial projections"}},
        {{"heading": "Cost Optimization", "content": "Areas for cost savings"}}
    ],
    "recommendations": [...],
    "risk_highlights": [...],
    "kpis": [...]
}}""",
        "human": """Financial Overview for:
Portfolios: {portfolios}
Projects: {project_count}
Company: {company_name}
"""
    },
    "program-performance": {
        "system": """You are a program management expert. Create a program performance report.
Structure as JSON with title, date, executive_summary, sections, recommendations, risk_highlights, kpis.""",
        "human": """Program Performance Report:
Programs: {program_count}
Projects: {project_count}
Active: {active_projects}
Company: {company_name}
"""
    },
    "project-status": {
        "system": """You are a project management professional. Create a project status report.
Structure as JSON with title, date, executive_summary, sections, recommendations, risk_highlights, kpis.""",
        "human": """Project Status Report:
Projects: {project_count}
Active: {active_projects}
Company: {company_name}
"""
    },
    "team-performance": {
        "system": """You are an HR and team performance analyst. Create a team performance report.
Structure as JSON with title, date, executive_summary, sections, recommendations, risk_highlights, kpis.""",
        "human": """Team Performance Report:
Team Size: {team_count}
Projects: {project_count}
Company: {company_name}
"""
    },
    "risk-analysis": {
        "system": """You are a risk management specialist. Create a comprehensive risk analysis report.
Structure as JSON with title, date, executive_summary, sections, recommendations, risk_highlights, kpis.""",
        "human": """Risk Analysis Report:
Projects: {project_count}
Active: {active_projects}
Company: {company_name}
"""
    },
    "budget-analysis": {
        "system": """You are a project budget analyst. Create a budget analysis report.
Structure as JSON with title, date, executive_summary, sections, recommendations, risk_highlights, kpis.""",
        "human": """Budget Analysis:
Projects: {project_count}
Company: {company_name}
"""
    },
    "benefits-realization": {
        "system": """You are a benefits realization expert. Create a benefits tracking report.
Structure as JSON with title, date, executive_summary, sections, recommendations, risk_highlights, kpis.""",
        "human": """Benefits Realization:
Programs: {program_count}
Portfolios: {portfolios}
Company: {company_name}
"""
    },
    "personal-performance": {
        "system": """You are a personal performance coach. Create a personal performance report.
Structure as JSON with title, date, executive_summary, sections, recommendations, risk_highlights, kpis.""",
        "human": """Personal Performance for {user_name}:
Role: {user_role}
Company: {company_name}
"""
    },
    "weekly-summary": {
        "system": """You are a project office coordinator. Create a weekly summary report.
Structure as JSON with title, date, executive_summary, sections, recommendations, risk_highlights, kpis.""",
        "human": """Weekly Summary:
Projects: {project_count}
Active: {active_projects}
Company: {company_name}
"""
    },
    "governance-report": {
        "system": """You are a governance specialist. Create a governance status report.
Structure as JSON with title, date, executive_summary, sections, recommendations, risk_highlights, kpis.""",
        "human": """Governance Report:
Portfolios: {portfolios}
Boards: {board_count}
Stakeholders: {stakeholder_count}
Company: {company_name}
"""
    },
    "time-tracking": {
        "system": """You are a time management analyst. Create a time tracking report.
Structure as JSON with title, date, executive_summary, sections, recommendations, risk_highlights, kpis.""",
        "human": """Time Tracking for {user_name}:
Role: {user_role}
Company: {company_name}
"""
    },
}


def generate_report(
    report_id,
    context_data,
    company=None,
    language="nl",
    *,
    user=None,
    portfolio_id=None,
    board_id=None,
    program_id=None,
    project_id=None,
    surface: str = "governance-report",
):
    """Generate an AI report based on report type and context data.

    ``language`` is a 2-letter UI language code (nl/en/fr) that forces the
    LLM to answer in the user's chosen language. Falls back to Dutch.

    When any of ``portfolio_id`` / ``board_id`` / ``program_id`` /
    ``project_id`` are passed we stack their uploaded-document context on
    top of the system prompt so the report reflects the actual papers of
    the scope it covers — not just whatever ChatGPT knows about the
    tenant. Scopes with no uploaded context contribute nothing (empty
    string), so this is additive and safe for ecosystem-wide reports.
    """
    from core.i18n_ai import prepend_language

    prompt_config = REPORT_PROMPTS.get(report_id)
    if not prompt_config:
        return {"error": f"Unknown report type: {report_id}"}

    try:
        # BYO key resolver — falls back to settings.OPENAI_API_KEY.
        llm_kwargs = get_langchain_openai_kwargs(company)
        if not llm_kwargs:
            return {
                "error": (
                    "No OpenAI key configured. Configure one in "
                    "Settings → API Keys (admin)."
                ),
            }
        llm = ChatOpenAI(
            temperature=0.7,
            model_name="gpt-4o",
            **llm_kwargs,
        )

        # Prepend the UI-language directive to the EN-hardcoded templates
        # so the model answers in the user's language without rewriting all
        # 14 REPORT_PROMPTS entries.  Also inject today's real date — the
        # templates say "date: Current date" but gpt-4o has no clock and
        # will otherwise invent one (observed hallucination: "24 oktober 2023"
        # on a 2026 report).
        system_prompt = prepend_language(prompt_config["system"], language)
        system_prompt = f"{_today_directive()}\n\n{system_prompt}"

        # Stack uploaded-document context from every scope the caller
        # passed in. Order matters: portfolio (broadest) → programme →
        # board → project (narrowest) so the LLM sees the hierarchy
        # from top to bottom and the narrower doc wins when they conflict.
        # Each prefix is "" when the scope has no uploaded context.
        try:
            from core.ai_context_helpers import (
                get_portfolio_context_prefix,
                get_program_context_prefix,
                get_board_context_prefix,
                get_project_context_prefix,
            )
            prefixes = []
            if portfolio_id:
                p = get_portfolio_context_prefix(user, portfolio_id, language=language, surface=surface)
                if p:
                    prefixes.append(p)
            if program_id:
                p = get_program_context_prefix(user, program_id, language=language, surface=surface)
                if p:
                    prefixes.append(p)
            if board_id:
                p = get_board_context_prefix(user, board_id, language=language, surface=surface)
                if p:
                    prefixes.append(p)
            if project_id:
                p = get_project_context_prefix(user, project_id, language=language, surface=surface)
                if p:
                    prefixes.append(p)
            if prefixes:
                system_prompt = "\n\n".join(prefixes) + "\n\n" + system_prompt
        except Exception:  # context stacking must never crash the report
            pass
        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", prompt_config["human"]),
        ])

        formatted = prompt.format_messages(**context_data)
        response = llm.invoke(formatted)
        try:
            from core.ai_usage import record as _record_usage, tokens_from_langchain_message
            _record_usage(getattr(company, "id", None),
                          tokens_from_langchain_message(response), provider="openai")
        except Exception:
            pass
        text = response.content.strip()

        # Parse JSON from response
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
            text = text.strip()

        report = json.loads(text)
        return report

    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse report JSON: {e}")
        return _fallback_report(report_id)
    except Exception as e:
        logger.error(f"Report generation error: {e}", exc_info=True)
        return _fallback_report(report_id)


def _fallback_report(report_id):
    return {
        "title": f"Report: {report_id.replace('-', ' ').title()}",
        "date": "Generated",
        "executive_summary": "Report generation encountered an issue. Please try again.",
        "sections": [{"heading": "Notice", "content": "AI service temporarily unavailable. Please retry."}],
        "recommendations": ["Retry report generation"],
        "risk_highlights": [],
        "kpis": [],
    }
