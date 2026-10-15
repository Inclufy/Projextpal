# bot/ai/utils/session_context.py
import contextvars

# Context variable for user session (token + user details)
user_session_ctx = contextvars.ContextVar("user_session", default=None)

# The project the copilot session was opened from. When a chat is started inside
# a project, tools default to this project so the user can say "close this
# project" / "complete all tasks" without repeating the id.
active_project_ctx = contextvars.ContextVar("active_project", default=None)

# The programme the copilot session was opened from. Mirrors active_project so
# the user can say "close this programme" / "complete all projects" without
# repeating the id.
active_program_ctx = contextvars.ContextVar("active_program", default=None)


def set_user_session(token, user_details):
    user_session_ctx.set({"token": token, "user": user_details})


def get_user_session():
    return user_session_ctx.get()


def clear_user_session():
    user_session_ctx.set(None)
    active_project_ctx.set(None)
    active_program_ctx.set(None)


def set_active_project(project_id):
    """Record the project the current copilot turn is scoped to (or None)."""
    active_project_ctx.set(str(project_id) if project_id not in (None, "") else None)


def get_active_project():
    """The active project id (str) for this turn, or None."""
    return active_project_ctx.get()


def set_active_program(program_id):
    """Record the programme the current copilot turn is scoped to (or None)."""
    active_program_ctx.set(str(program_id) if program_id not in (None, "") else None)


def get_active_program():
    """The active programme id (str) for this turn, or None."""
    return active_program_ctx.get()
