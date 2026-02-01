"""
AI-powered risk mitigation generation using OpenAI GPT.
"""

import logging
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from django.conf import settings

logger = logging.getLogger(__name__)


def generate_ai_mitigation(risk_data):
    """
    Generate AI-powered mitigation plan for a given risk.

    Args:
        risk_data: Dictionary containing risk information:
            - name: Risk name
            - description: Risk description
            - category: Risk category (Technical, Schedule, Financial, etc.)
            - impact: Impact level (High, Medium, Low)
            - probability: Probability percentage (0-100)
            - level: Risk level (High, Medium, Low)
            - project_name: Name of the project (optional)
            - project_description: Description of the project (optional)

    Returns:
        Dictionary containing:
            - strategy: Mitigation strategy description
            - actions: List of action items
            - timeline: Suggested timeline
            - cost: Cost estimate (Low, Medium, High)
            - effectiveness: Effectiveness percentage
    """
    try:
        # Initialize OpenAI LLM
        llm = ChatOpenAI(
            temperature=0.7,
            model_name="gpt-4o",
            openai_api_key=settings.OPENAI_API_KEY,
        )

        # Create the prompt template
        prompt_template = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    """You are an expert project risk management consultant with extensive experience 
in developing effective mitigation strategies across various industries and project types.

Your task is to analyze the provided risk and create a comprehensive, actionable mitigation plan.
The plan should be specific, realistic, and tailored to the risk's characteristics.

Respond ONLY with a valid JSON object in the following format:
{{
    "strategy": "A clear, concise mitigation strategy (2-3 sentences)",
    "actions": ["Action item 1", "Action item 2", "Action item 3", "Action item 4"],
    "timeline": "Estimated timeline (e.g., '2-4 weeks', '1-2 months')",
    "cost": "Low|Medium|High",
    "effectiveness": "Expected effectiveness percentage (e.g., '75%', '85%')"
}}

Important guidelines:
- Provide 3-5 specific, actionable items
- Timeline should be realistic based on the risk category and level
- Cost should consider the risk impact and typical mitigation resources
- Effectiveness should be realistic (typically 60-95% for good mitigation plans)
- Strategy should address root causes, not just symptoms""",
                ),
                (
                    "human",
                    """Please analyze this risk and provide a comprehensive mitigation plan:

Risk Name: {name}
Description: {description}
Category: {category}
Impact: {impact}
Probability: {probability}%
Risk Level: {level}

{project_context}

Generate a detailed, actionable mitigation plan.""",
                ),
            ]
        )

        # Build project context if available
        project_context = ""
        if risk_data.get("project_name") or risk_data.get("project_description"):
            project_context = "Project Context:\n"
            if risk_data.get("project_name"):
                project_context += f"- Project: {risk_data['project_name']}\n"
            if risk_data.get("project_description"):
                project_context += (
                    f"- Description: {risk_data['project_description']}\n"
                )

        # Format the prompt
        formatted_prompt = prompt_template.format_messages(
            name=risk_data.get("name", "Unknown Risk"),
            description=risk_data.get("description", "No description provided"),
            category=risk_data.get("category", "Unknown"),
            impact=risk_data.get("impact", "Unknown"),
            probability=risk_data.get("probability", 50),
            level=risk_data.get("level", "Medium"),
            project_context=project_context,
        )

        # Get AI response
        response = llm.invoke(formatted_prompt)
        response_text = response.content.strip()

        # Parse JSON response
        import json

        # Try to extract JSON if wrapped in markdown code blocks
        if response_text.startswith("```"):
            # Remove markdown code blocks
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]
            response_text = response_text.strip()

        mitigation_plan = json.loads(response_text)

        # Validate the response structure
        required_fields = ["strategy", "actions", "timeline", "cost", "effectiveness"]
        for field in required_fields:
            if field not in mitigation_plan:
                raise ValueError(f"Missing required field: {field}")

        # Ensure actions is a list
        if not isinstance(mitigation_plan["actions"], list):
            mitigation_plan["actions"] = [mitigation_plan["actions"]]

        # Ensure cost is valid
        valid_costs = ["Low", "Medium", "High"]
        if mitigation_plan["cost"] not in valid_costs:
            # Try to map common variations
            cost_lower = mitigation_plan["cost"].lower()
            if "low" in cost_lower:
                mitigation_plan["cost"] = "Low"
            elif "high" in cost_lower:
                mitigation_plan["cost"] = "High"
            else:
                mitigation_plan["cost"] = "Medium"

        return mitigation_plan

    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse AI response as JSON: {e}")
        logger.error(f"Response text: {response_text}")
        # Return a fallback mitigation plan
        return _get_fallback_mitigation(risk_data)

    except Exception as e:
        logger.error(f"Error generating AI mitigation: {e}", exc_info=True)
        return _get_fallback_mitigation(risk_data)


def _get_fallback_mitigation(risk_data):
    """
    Provide a basic fallback mitigation plan if AI generation fails.
    """
    category = risk_data.get("category", "Unknown")
    impact = risk_data.get("impact", "Medium")

    # Generic fallback strategies based on category
    strategies = {
        "Technical": "Implement technical controls and monitoring to reduce technical risk exposure.",
        "Schedule": "Develop buffer time and parallel workstreams to mitigate schedule delays.",
        "Financial": "Establish financial controls and contingency reserves to manage cost overruns.",
        "Operational": "Improve operational processes and add redundancy to critical operations.",
        "Strategic": "Align strategic initiatives and maintain flexibility in execution approach.",
        "Compliance": "Strengthen compliance monitoring and ensure regulatory requirements are met.",
    }

    strategy = strategies.get(
        category, "Develop comprehensive risk mitigation approach."
    )

    # Generic actions
    actions = [
        f"Conduct detailed {category.lower()} risk assessment",
        "Identify and engage key stakeholders",
        "Develop and document mitigation procedures",
        "Implement monitoring and early warning systems",
        "Schedule regular risk review meetings",
    ]

    # Timeline based on impact
    timeline_map = {"High": "1-2 weeks", "Medium": "2-4 weeks", "Low": "1-2 months"}
    timeline = timeline_map.get(impact, "2-4 weeks")

    # Cost based on impact
    cost_map = {"High": "High", "Medium": "Medium", "Low": "Low"}
    cost = cost_map.get(impact, "Medium")

    return {
        "strategy": strategy,
        "actions": actions,
        "timeline": timeline,
        "cost": cost,
        "effectiveness": "70%",
    }
