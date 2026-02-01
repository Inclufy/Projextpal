from typing import Optional, List, Union
from bot.ai.utils.session_context import get_user_session


def check_user_permission(
    allowed_roles: Optional[List[str]] = None,
    error_message: str = "You are not authorized to perform this action.",
) -> Union[None, str, dict]:
    """
    Check if the current user has permission to perform an action.

    Args:
        allowed_roles: List of roles that are allowed. If None, defaults to ["superadmin", "admin", "pm"]
        error_message: Custom error message to return if unauthorized

    Returns:
        None if authorized, otherwise returns error message (string or dict based on format)
    """
    if allowed_roles is None:
        allowed_roles = ["superadmin", "admin", "pm"]

    user_session = get_user_session()

    # Check if user session exists
    if not user_session or not user_session.get("user"):
        return error_message

    # Get user role
    user = user_session.get("user")
    if not hasattr(user, "role"):
        return error_message

    user_role = user.role

    # Check if user role is in allowed roles
    if user_role not in allowed_roles:
        return error_message

    # User is authorized
    return None


def require_permission(
    allowed_roles: Optional[List[str]] = None,
    return_dict: bool = False,
) -> Union[None, str, dict]:
    """
    Simplified permission check that returns error in appropriate format.

    Args:
        allowed_roles: List of roles that are allowed. If None, defaults to ["superadmin", "admin", "pm"]
        return_dict: If True, returns error as {"error": "message"}, otherwise as string

    Returns:
        None if authorized, otherwise returns error message in requested format
    """
    if allowed_roles is None:
        allowed_roles = ["superadmin", "admin", "pm"]
    
    error_msg = "You are not authorized to perform this action."
    result = check_user_permission(allowed_roles, error_msg)

    if result and return_dict:
        return {"error": result}

    return result
