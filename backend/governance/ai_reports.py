"""
AI-powered report generation using OpenAI GPT.
"""
import json
import logging
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from django.conf import settings

from core.llm_keys import get_langchain_openai_kwargs

logger = logging.getLogger(__name__)

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


def generate_report(report_id, context_data, company=None):
    """Generate an AI report based on report type and context data."""
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

        prompt = ChatPromptTemplate.from_messages([
            ("system", prompt_config["system"]),
            ("human", prompt_config["human"]),
        ])

        formatted = prompt.format_messages(**context_data)
        response = llm.invoke(formatted)
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
