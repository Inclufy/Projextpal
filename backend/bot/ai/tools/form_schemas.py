"""
Form schemas for AI chat CRUD operations.
"""

PROJECT_FORM_SCHEMA = {
    "form_type": "project_creation",
    "title": "Create New Project",
    "fields": [
        {"name": "name", "label": "Project Name", "type": "text", "required": True, "placeholder": "Enter project name"},
        {"name": "description", "label": "Description", "type": "textarea", "required": False, "placeholder": "Project description"},
        {"name": "methodology", "label": "Methodology", "type": "select", "required": True,
         "options": [{"value": "waterfall", "label": "Waterfall"}, {"value": "agile", "label": "Agile"},
                     {"value": "scrum", "label": "Scrum"}, {"value": "kanban", "label": "Kanban"},
                     {"value": "hybrid", "label": "Hybrid"}], "default": "agile"},
        {"name": "start_date", "label": "Start Date", "type": "date", "required": True},
        {"name": "end_date", "label": "End Date", "type": "date", "required": True},
        {"name": "budget", "label": "Budget", "type": "number", "required": False, "placeholder": "0.00"}
    ]
}

PROJECT_UPDATE_SCHEMA = {
    "form_type": "project_update",
    "title": "Update Project",
    "fields": PROJECT_FORM_SCHEMA["fields"] + [
        {"name": "status", "label": "Status", "type": "select", "required": True,
         "options": [{"value": "planning", "label": "Planning"}, {"value": "in_progress", "label": "In Progress"},
                     {"value": "on_hold", "label": "On Hold"}, {"value": "completed", "label": "Completed"},
                     {"value": "cancelled", "label": "Cancelled"}]}
    ]
}

TASK_FORM_SCHEMA = {
    "form_type": "task_creation",
    "title": "Create New Task",
    "fields": [
        {"name": "title", "label": "Task Title", "type": "text", "required": True, "placeholder": "Enter task title"},
        {"name": "description", "label": "Description", "type": "textarea", "required": False, "placeholder": "Task description"},
        {"name": "milestone_id", "label": "Milestone", "type": "select_dynamic", "required": True,
         "endpoint": "/api/v1/milestones/", "labelField": "name", "valueField": "id"},
        {"name": "assigned_to", "label": "Assign To", "type": "select_dynamic", "required": False,
         "endpoint": "/api/v1/users/team/", "labelField": "full_name", "valueField": "id"},
        {"name": "priority", "label": "Priority", "type": "select", "required": True,
         "options": [{"value": "low", "label": "Low"}, {"value": "medium", "label": "Medium"},
                     {"value": "high", "label": "High"}, {"value": "urgent", "label": "Urgent"}], "default": "medium"},
        {"name": "start_date", "label": "Start Date", "type": "date", "required": False},
        {"name": "due_date", "label": "Due Date", "type": "date", "required": True}
    ]
}

TASK_UPDATE_SCHEMA = {
    "form_type": "task_update",
    "title": "Update Task",
    "fields": TASK_FORM_SCHEMA["fields"] + [
        {"name": "status", "label": "Status", "type": "select", "required": True,
         "options": [{"value": "todo", "label": "To Do"}, {"value": "in_progress", "label": "In Progress"},
                     {"value": "blocked", "label": "Blocked"}, {"value": "done", "label": "Done"}]}
    ]
}

MILESTONE_FORM_SCHEMA = {
    "form_type": "milestone_creation",
    "title": "Create New Milestone",
    "fields": [
        {"name": "name", "label": "Milestone Name", "type": "text", "required": True, "placeholder": "Enter milestone name"},
        {"name": "description", "label": "Description", "type": "textarea", "required": False, "placeholder": "Milestone description"},
        {"name": "project_id", "label": "Project", "type": "select_dynamic", "required": True,
         "endpoint": "/api/v1/projects/", "labelField": "name", "valueField": "id"},
        {"name": "start_date", "label": "Start Date", "type": "date", "required": True},
        {"name": "end_date", "label": "End Date", "type": "date", "required": True}
    ]
}

MILESTONE_UPDATE_SCHEMA = {
    "form_type": "milestone_update",
    "title": "Update Milestone",
    "fields": MILESTONE_FORM_SCHEMA["fields"] + [
        {"name": "status", "label": "Status", "type": "select", "required": True,
         "options": [{"value": "pending", "label": "Pending"}, {"value": "in_progress", "label": "In Progress"},
                     {"value": "completed", "label": "Completed"}]}
    ]
}

PROGRAM_FORM_SCHEMA = {
    "form_type": "program_creation",
    "title": "Create New Program",
    "fields": [
        {"name": "name", "label": "Program Name", "type": "text", "required": True, "placeholder": "Enter program name"},
        {"name": "description", "label": "Description", "type": "textarea", "required": False, "placeholder": "Program description"},
        {"name": "strategic_objective", "label": "Strategic Objective", "type": "textarea", "required": False, "placeholder": "Strategic objective"},
        {"name": "methodology", "label": "Methodology", "type": "select", "required": False,
         "options": [{"value": "waterfall", "label": "Waterfall"}, {"value": "agile", "label": "Agile"},
                     {"value": "hybrid", "label": "Hybrid"}], "default": "agile"},
        {"name": "start_date", "label": "Start Date", "type": "date", "required": True},
        {"name": "target_end_date", "label": "Target End Date", "type": "date", "required": True},
        {"name": "total_budget", "label": "Total Budget", "type": "number", "required": False, "placeholder": "0.00"}
    ]
}

FORM_SCHEMAS = {
    "project_creation": PROJECT_FORM_SCHEMA,
    "project_update": PROJECT_UPDATE_SCHEMA,
    "task_creation": TASK_FORM_SCHEMA,
    "task_update": TASK_UPDATE_SCHEMA,
    "milestone_creation": MILESTONE_FORM_SCHEMA,
    "milestone_update": MILESTONE_UPDATE_SCHEMA,
    "program_creation": PROGRAM_FORM_SCHEMA,
}
