"""
AI-powered survey generation and analysis for projects and programs.
"""
import json
from django.conf import settings
from openai import OpenAI

client = OpenAI(api_key=settings.OPENAI_API_KEY)


def generate_project_survey(project_data: dict) -> dict:
    """
    Generate survey questions based on project data including
    activities, milestones, deliverables, and KPIs.
    """
    prompt = f"""
    Based on the following project data, generate a comprehensive post-project survey 
    to gather feedback from stakeholders. The survey should cover:
    
    1. Overall project satisfaction
    2. Achievement of objectives and deliverables
    3. Team collaboration and communication
    4. Timeline and milestone adherence
    5. Budget management
    6. Risk management effectiveness
    7. Lessons learned
    8. Suggestions for improvement
    
    Project Data:
    - Name: {project_data.get('name', 'Unknown')}
    - Methodology: {project_data.get('methodology', 'Unknown')}
    - Status: {project_data.get('status', 'Unknown')}
    - Description: {project_data.get('description', '')}
    - Milestones: {json.dumps(project_data.get('milestones', []))}
    - Deliverables: {json.dumps(project_data.get('deliverables', []))}
    - KPIs: {json.dumps(project_data.get('kpis', []))}
    - Budget: {project_data.get('budget', 'N/A')}
    - Start Date: {project_data.get('start_date', 'N/A')}
    - End Date: {project_data.get('end_date', 'N/A')}
    
    Return a JSON object with the following structure:
    {{
        "title": "Survey title",
        "description": "Survey description",
        "sections": [
            {{
                "title": "Section title",
                "questions": [
                    {{
                        "id": "q1",
                        "type": "rating", // rating, multiple_choice, text, yes_no
                        "question": "Question text",
                        "options": ["Option 1", "Option 2"], // for multiple_choice
                        "required": true
                    }}
                ]
            }}
        ]
    }}
    
    Generate 15-20 questions across 5-6 sections. Make questions specific to the project.
    """
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an expert project management consultant who creates effective post-project surveys. Always respond with valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        
        result = json.loads(response.choices[0].message.content)
        return {"success": True, "survey": result}
    except Exception as e:
        return {"success": False, "error": str(e)}


def analyze_survey_results(survey_data: dict, responses: list) -> dict:
    """
    Analyze survey responses and generate insights, recommendations,
    and lessons learned.
    """
    prompt = f"""
    Analyze the following survey responses and provide a comprehensive analysis.
    
    Survey: {survey_data.get('title', 'Project Survey')}
    Total Responses: {len(responses)}
    
    Responses Summary:
    {json.dumps(responses, indent=2)}
    
    Provide analysis in the following JSON structure:
    {{
        "executive_summary": "Brief overview of survey results",
        "overall_satisfaction_score": 0-100,
        "key_findings": [
            {{
                "category": "Category name",
                "finding": "Key finding description",
                "sentiment": "positive/neutral/negative",
                "score": 0-100
            }}
        ],
        "strengths": [
            "List of project strengths based on feedback"
        ],
        "areas_for_improvement": [
            {{
                "area": "Area name",
                "issue": "Issue description",
                "priority": "high/medium/low"
            }}
        ],
        "lessons_learned": [
            {{
                "lesson": "Lesson description",
                "category": "Category (planning/execution/communication/etc)",
                "recommendation": "How to apply this lesson in future"
            }}
        ],
        "recommendations": [
            {{
                "title": "Recommendation title",
                "description": "Detailed recommendation",
                "impact": "high/medium/low",
                "effort": "high/medium/low"
            }}
        ],
        "action_items": [
            {{
                "action": "Specific action to take",
                "owner": "Suggested owner/role",
                "timeline": "Suggested timeline"
            }}
        ]
    }}
    """
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an expert project analyst who provides actionable insights from survey data. Always respond with valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        
        result = json.loads(response.choices[0].message.content)
        return {"success": True, "analysis": result}
    except Exception as e:
        return {"success": False, "error": str(e)}


def generate_questionnaire_from_activities(activities: list, milestones: list, kpis: list) -> dict:
    """
    Auto-generate questionnaire items based on project activities,
    milestones, and KPIs.
    """
    prompt = f"""
    Generate specific survey questions based on these project elements:
    
    Activities/Tasks:
    {json.dumps(activities, indent=2)}
    
    Milestones:
    {json.dumps(milestones, indent=2)}
    
    KPIs:
    {json.dumps(kpis, indent=2)}
    
    For each element, generate 1-2 relevant questions that assess:
    - Completion quality
    - Stakeholder satisfaction
    - Process effectiveness
    - Outcome achievement
    
    Return JSON:
    {{
        "activity_questions": [
            {{
                "related_to": "Activity name",
                "question": "Question text",
                "type": "rating/multiple_choice/text"
            }}
        ],
        "milestone_questions": [...],
        "kpi_questions": [...]
    }}
    """
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a project management expert. Generate relevant survey questions. Always respond with valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        
        result = json.loads(response.choices[0].message.content)
        return {"success": True, "questions": result}
    except Exception as e:
        return {"success": False, "error": str(e)}
