from typing import Dict, Any, List
from django.conf import settings
from langchain_openai import ChatOpenAI
from bot.ai.tools import ToolRegistry
from bot.ai.utils.permissions import require_permission
from bot.ai.utils.session_context import get_user_session
from projects.models import Project, Milestone, Task, Subtask
import json
from datetime import datetime, timedelta


@ToolRegistry.register_tool(return_direct=False)
def parse_and_create_project_structure(
    project_id: str, description: str
) -> Dict[str, Any]:
    """
    Parses a project description and automatically creates milestones, tasks, and subtasks.
    Requires PROJECT_ID and DESCRIPTION. Use this when the user wants to generate a project structure
    from a description or wants to auto-create tasks from a project description.
    """
    # Check user permissions
    permission_error = require_permission(return_dict=True)
    if permission_error:
        return permission_error

    # Validate project ID
    if not project_id.isdigit():
        return {"error": "Invalid project ID format"}

    project_id = int(project_id)

    # Get user session
    user_session = get_user_session()
    user = user_session["user"]

    # Get the project with company filter
    project = Project.objects.filter(id=project_id, company=user.company).first()

    if not project:
        return {
            "error": f"Project with ID {project_id} not found or you don't have access to it."
        }

    # Initialize OpenAI LLM
    llm = ChatOpenAI(
        temperature=0.2,
        model_name="gpt-4.1",
        openai_api_key=settings.OPENAI_API_KEY,
    )

    # Create a detailed prompt for the AI to parse the project description
    system_prompt = """You are a project management expert. Your task is to analyze project descriptions 
    and break them down into structured milestones, tasks, and subtasks.
    
    For each milestone, create:
    - A clear, actionable name
    - A brief description
    - Estimated duration (in days)
    
    For each task within a milestone:
    - A specific, actionable title
    - A detailed description
    - Priority level (low, medium, high, urgent)
    - Estimated duration (in days)
    
    For each subtask within a task:
    - A clear, actionable title
    
    Return your response as a valid JSON object with the following structure:
    {
        "milestones": [
            {
                "name": "Milestone name",
                "description": "Milestone description",
                "duration_days": 14,
                "tasks": [
                    {
                        "title": "Task title",
                        "description": "Task description",
                        "priority": "medium",
                        "duration_days": 5,
                        "subtasks": [
                            {"title": "Subtask 1"},
                            {"title": "Subtask 2"}
                        ]
                    }
                ]
            }
        ]
    }
    
    Be logical and realistic in breaking down the work. Create meaningful milestones that represent 
    major phases of the project. Each task should be specific and achievable. Subtasks should be 
    concrete action items.
    """

    user_prompt = f"""Project Description:
    {description}
    
    Please analyze this project description and create a structured breakdown of milestones, tasks, 
    and subtasks. Return ONLY a valid JSON object, nothing else."""

    try:
        # Get AI response
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ]

        response = llm.invoke(messages)

        # Parse the AI response
        ai_content = response.content.strip()

        # Remove markdown code blocks if present
        if ai_content.startswith("```json"):
            ai_content = ai_content[7:]
        elif ai_content.startswith("```"):
            ai_content = ai_content[3:]

        if ai_content.endswith("```"):
            ai_content = ai_content[:-3]

        ai_content = ai_content.strip()

        # Parse JSON
        parsed_structure = json.loads(ai_content)

        # Validate structure
        if "milestones" not in parsed_structure:
            return {
                "error": "AI response did not contain valid milestone structure. Please try again."
            }

        # Create database entries
        created_milestones = []
        created_tasks = []
        created_subtasks = []

        # Track dates for sequential planning
        current_date = project.start_date or datetime.now().date()

        for idx, milestone_data in enumerate(parsed_structure["milestones"]):
            # Calculate milestone dates
            milestone_start_date = current_date
            milestone_duration = milestone_data.get("duration_days", 14)
            milestone_end_date = milestone_start_date + timedelta(
                days=milestone_duration
            )

            # Create milestone
            milestone = Milestone.objects.create(
                project=project,
                name=milestone_data.get("name", f"Milestone {idx + 1}"),
                description=milestone_data.get("description", ""),
                start_date=milestone_start_date,
                end_date=milestone_end_date,
                status="pending",
                order_index=idx,
            )
            created_milestones.append(milestone)

            # Track task dates within milestone
            task_start_date = milestone_start_date

            # Create tasks for this milestone
            tasks_data = milestone_data.get("tasks", [])
            for task_idx, task_data in enumerate(tasks_data):
                task_duration = task_data.get("duration_days", 5)
                task_end_date = task_start_date + timedelta(days=task_duration)

                # Ensure task dates don't exceed milestone dates
                if task_end_date > milestone_end_date:
                    task_end_date = milestone_end_date

                # Create task
                task = Task.objects.create(
                    milestone=milestone,
                    title=task_data.get("title", f"Task {task_idx + 1}"),
                    description=task_data.get("description", ""),
                    priority=task_data.get("priority", "medium"),
                    status="todo",
                    start_date=task_start_date,
                    due_date=task_end_date,
                    order_index=task_idx,
                    progress=0,
                )
                created_tasks.append(task)

                # Create subtasks for this task
                subtasks_data = task_data.get("subtasks", [])
                for subtask_data in subtasks_data:
                    subtask = Subtask.objects.create(
                        task=task,
                        title=subtask_data.get("title", "Subtask"),
                        completed=False,
                    )
                    created_subtasks.append(subtask)

                # Move to next task start date
                task_start_date = task_end_date

            # Move to next milestone start date
            current_date = milestone_end_date

        # Update project end date if needed
        if created_milestones and current_date > (
            project.end_date or datetime.now().date()
        ):
            project.end_date = current_date
            project.save()

        # Prepare summary response
        return {
            "success": True,
            "message": f"Successfully created project structure for '{project.name}'",
            "summary": {
                "milestones_created": len(created_milestones),
                "tasks_created": len(created_tasks),
                "subtasks_created": len(created_subtasks),
                "project_id": project.id,
                "project_name": project.name,
            },
            "details": {
                "milestones": [
                    {"id": m.id, "name": m.name, "tasks_count": m.tasks.count()}
                    for m in created_milestones
                ]
            },
        }

    except json.JSONDecodeError as e:
        return {
            "error": f"Failed to parse AI response as JSON: {str(e)}. Please try again with a clearer description."
        }
    except Exception as e:
        return {
            "error": f"An error occurred while creating project structure: {str(e)}"
        }


@ToolRegistry.register_tool(return_direct=False)
def suggest_project_structure(description: str) -> Dict[str, Any]:
    """
    Analyzes a project description and suggests a structured breakdown of milestones, tasks, and subtasks
    WITHOUT creating them in the database. Use this when the user wants to preview or get suggestions
    before creating the actual project structure. Only requires DESCRIPTION.
    """
    # Check user permissions
    permission_error = require_permission(return_dict=True)
    if permission_error:
        return permission_error

    # Initialize OpenAI LLM
    llm = ChatOpenAI(
        temperature=0.2,
        model_name="gpt-4.1",
        openai_api_key=settings.OPENAI_API_KEY,
    )

    # Create a detailed prompt for the AI
    system_prompt = """You are a project management expert. Your task is to analyze project descriptions 
    and break them down into structured milestones, tasks, and subtasks.
    
    For each milestone, create:
    - A clear, actionable name
    - A brief description
    - Estimated duration (in days)
    
    For each task within a milestone:
    - A specific, actionable title
    - A detailed description
    - Priority level (low, medium, high, urgent)
    - Estimated duration (in days)
    
    For each subtask within a task:
    - A clear, actionable title
    
    Return your response as a valid JSON object with the following structure:
    {
        "milestones": [
            {
                "name": "Milestone name",
                "description": "Milestone description",
                "duration_days": 14,
                "tasks": [
                    {
                        "title": "Task title",
                        "description": "Task description",
                        "priority": "medium",
                        "duration_days": 5,
                        "subtasks": [
                            {"title": "Subtask 1"},
                            {"title": "Subtask 2"}
                        ]
                    }
                ]
            }
        ],
        "total_estimated_days": 60,
        "summary": "Brief summary of the project structure"
    }
    
    Be logical and realistic in breaking down the work. Create meaningful milestones that represent 
    major phases of the project.
    """

    user_prompt = f"""Project Description:
    {description}
    
    Please analyze this project description and create a suggested structured breakdown of milestones, 
    tasks, and subtasks. Return ONLY a valid JSON object, nothing else."""

    try:
        # Get AI response
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ]

        response = llm.invoke(messages)

        # Parse the AI response
        ai_content = response.content.strip()

        # Remove markdown code blocks if present
        if ai_content.startswith("```json"):
            ai_content = ai_content[7:]
        elif ai_content.startswith("```"):
            ai_content = ai_content[3:]

        if ai_content.endswith("```"):
            ai_content = ai_content[:-3]

        ai_content = ai_content.strip()

        # Parse JSON
        parsed_structure = json.loads(ai_content)

        # Validate structure
        if "milestones" not in parsed_structure:
            return {
                "error": "AI response did not contain valid milestone structure. Please try again."
            }

        # Format the response in a user-friendly way
        milestones_summary = []
        total_tasks = 0
        total_subtasks = 0

        for milestone in parsed_structure["milestones"]:
            tasks_count = len(milestone.get("tasks", []))
            total_tasks += tasks_count

            subtasks_count = sum(
                len(task.get("subtasks", [])) for task in milestone.get("tasks", [])
            )
            total_subtasks += subtasks_count

            milestones_summary.append(
                {
                    "name": milestone["name"],
                    "description": milestone.get("description", ""),
                    "duration_days": milestone.get("duration_days", 0),
                    "tasks_count": tasks_count,
                    "subtasks_count": subtasks_count,
                }
            )

        return {
            "success": True,
            "message": "Project structure suggestion generated successfully",
            "suggestion": {
                "total_milestones": len(parsed_structure["milestones"]),
                "total_tasks": total_tasks,
                "total_subtasks": total_subtasks,
                "estimated_duration_days": parsed_structure.get(
                    "total_estimated_days", 0
                ),
                "summary": parsed_structure.get("summary", ""),
                "milestones": milestones_summary,
            },
            "full_structure": parsed_structure,
        }

    except json.JSONDecodeError as e:
        return {
            "error": f"Failed to parse AI response as JSON: {str(e)}. Please try again with a clearer description."
        }
    except Exception as e:
        return {
            "error": f"An error occurred while generating project structure suggestion: {str(e)}"
        }
