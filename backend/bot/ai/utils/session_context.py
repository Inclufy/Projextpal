# bot/ai/utils/session_context.py
import contextvars

# Context variable for user session (token + user details)
user_session_ctx = contextvars.ContextVar("user_session", default=None)


def set_user_session(token, user_details):
    user_session_ctx.set({"token": token, "user": user_details})


def get_user_session():
    return user_session_ctx.get()


def clear_user_session():
    user_session_ctx.set(None)
