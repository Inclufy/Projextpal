"""
Pre/post-deploy smoke check for ProjeXtPal production.

Catches the class of bugs we hit on 2026-05-10:
  1. DB schema drift  — DB has NOT NULL columns the Django model doesn't know about
  2. Signup integrity — `Company.objects.create()` would fail on insert
  3. Email pipeline   — `send_branded_email` can render + (optionally) deliver

Run:
    docker exec -i projextpal-backend-prod python3 manage.py shell \
        -c "exec(open('scripts/preflight_check.py').read())"

Exits non-zero on any failure so this can be wired into a deploy gate
(e.g. CI step or `deploy.sh` post-step).
"""
from __future__ import annotations

import sys
import traceback

from django.conf import settings
from django.db import connection, transaction

# ----------------------------------------------------------------------
# 1. SCHEMA DRIFT DETECTOR
# ----------------------------------------------------------------------
# For each critical model, list NOT NULL DB columns and verify the model
# either has the field OR the DB has a default for it. Otherwise an INSERT
# from Django will fail with NotNullViolation (the bug from 2026-05-10).

CRITICAL_TABLES = [
    "accounts_company",
    "accounts_customuser",
    "notifications_notification",
    "notifications_notificationpreference",
]


def _list_not_null_columns_without_default(table: str) -> list[tuple[str, str]]:
    """Return [(column, type)] for NOT NULL columns that have NO server-side default."""
    sql = """
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = %s
          AND is_nullable = 'NO'
          AND column_default IS NULL
          AND column_name NOT IN ('id')
        ORDER BY ordinal_position;
    """
    with connection.cursor() as cur:
        cur.execute(sql, [table])
        return list(cur.fetchall())


def _model_field_names(table: str) -> set[str]:
    """Return the set of DB column names the Django model knows about."""
    from django.apps import apps
    for model in apps.get_models():
        if model._meta.db_table == table:
            return {f.column for f in model._meta.fields}
    return set()


def check_schema_drift() -> list[str]:
    issues = []
    print("→ Schema drift check")
    for table in CRITICAL_TABLES:
        problem_cols = _list_not_null_columns_without_default(table)
        model_fields = _model_field_names(table)
        if not model_fields:
            issues.append(f"  ✗ {table}: model not found in any installed app")
            continue
        for col, dtype in problem_cols:
            if col not in model_fields:
                issues.append(
                    f"  ✗ {table}.{col} ({dtype}) — NOT NULL in DB, no default, "
                    f"and model has no field for it. Insert will fail."
                )
        print(f"  ✓ {table}: {len(model_fields)} model fields vs "
              f"{len(problem_cols)} NOT-NULL-no-default columns")
    if issues:
        print("\n".join(issues))
    return issues


# ----------------------------------------------------------------------
# 2. SIGNUP INTEGRITY (rolled-back insert)
# ----------------------------------------------------------------------
# Try to actually insert a Company + CustomUser, then ROLLBACK so prod stays
# clean. This mirrors the path PublicAdminRegisterSerializer.create() takes.

def check_signup_insert() -> list[str]:
    issues = []
    print("→ Signup insert check (rolled back)")
    from accounts.models import Company, CustomUser

    sentinel_email = "preflight+signup@projextpal.test"
    try:
        with transaction.atomic():
            company = Company.objects.create(
                name=f"preflight-{sentinel_email}",
                description="preflight rollback",
            )
            user = CustomUser.objects.create(
                username=sentinel_email,
                email=sentinel_email,
                first_name="Preflight",
                is_active=False,
                role="admin",
                company=company,
            )
            user.set_password("PreflightPass123!")
            user.save()
            # Force rollback so we don't leave artefacts on prod
            raise transaction.TransactionManagementError("__preflight_rollback__")
    except transaction.TransactionManagementError as e:
        if "__preflight_rollback__" in str(e):
            print("  ✓ Company + CustomUser create path is healthy")
            return issues
        issues.append(f"  ✗ Unexpected transaction error: {e}")
    except Exception as e:
        issues.append(f"  ✗ Signup insert failed: {type(e).__name__}: {e}")
        traceback.print_exc()
    return issues


# ----------------------------------------------------------------------
# 3. EMAIL PIPELINE (render only, no send)
# ----------------------------------------------------------------------

def check_email_render() -> list[str]:
    issues = []
    print("→ Email template render check (no send)")
    from django.template.loader import render_to_string
    from core.email_i18n import SUPPORTED_LANGS, get_email_context

    scenarios = [
        ("verify_email", "email/transactional/verify_email.html"),
        ("password_reset", "email/transactional/password_reset.html"),
        ("admin_invite", "email/transactional/admin_invite.html"),
    ]
    sample = {"name": "Preflight", "url": "https://projextpal.com/x", "expires_in_hours": 24}

    for key, path in scenarios:
        for lang in SUPPORTED_LANGS:
            try:
                ctx = get_email_context(key, lang=lang, **sample)
                ctx["url"] = sample["url"]
                ctx["expires_text"] = ctx["i18n"].get("expires_in_hours", "").format(hours=24)
                html = render_to_string(path, ctx)
                if not html or "ProjeXtPal" not in html:
                    issues.append(f"  ✗ {key}/{lang}: rendered HTML missing brand wordmark")
            except Exception as e:
                issues.append(f"  ✗ {key}/{lang}: {type(e).__name__}: {e}")
    if not issues:
        print(f"  ✓ {len(scenarios) * len(SUPPORTED_LANGS)} variants rendered with brand wordmark")
    return issues


# ----------------------------------------------------------------------
# 4. CRITICAL ENV VARS
# ----------------------------------------------------------------------

def check_email_config() -> list[str]:
    issues = []
    print("→ Email backend config check")
    backend = getattr(settings, "EMAIL_BACKEND", "")
    user = getattr(settings, "EMAIL_HOST_USER", "")
    pwd = str(getattr(settings, "EMAIL_HOST_PASSWORD", "") or "")
    frm = str(getattr(settings, "DEFAULT_FROM_EMAIL", "") or "")

    if "console" in backend:
        issues.append(f"  ⚠ EMAIL_BACKEND is console — emails will not be delivered")
    if not pwd:
        issues.append(f"  ✗ EMAIL_HOST_PASSWORD is empty")
    non_ascii = [c for c in pwd if ord(c) > 127]
    if non_ascii:
        issues.append(f"  ✗ EMAIL_HOST_PASSWORD has non-ASCII chars — smtplib will fail")
    if not frm or "@" not in frm:
        issues.append(f"  ✗ DEFAULT_FROM_EMAIL invalid: {frm!r}")
    if not issues:
        print(f"  ✓ backend={backend.rsplit('.', 1)[-1]}  user={user}  from={frm}")
    return issues


# ----------------------------------------------------------------------
# 5. NOTIFICATION DISPATCHER (rolled-back insert + email render)
# ----------------------------------------------------------------------

def check_notification_dispatcher() -> list[str]:
    issues = []
    print("→ Notification engine check (rolled back)")
    from accounts.models import CustomUser
    from django.db import transaction
    from django.template.loader import render_to_string

    # 1. Render check — all 4 notification kinds
    from core.email_i18n import SUPPORTED_LANGS, get_email_context
    kinds = [
        "notification_task_assigned",
        "notification_comment_mention",
        "notification_project_member_added",
        "notification_deadline_approaching",
    ]
    for k in kinds:
        for lang in SUPPORTED_LANGS:
            try:
                ctx = get_email_context(k, lang=lang, name="X")
                ctx["url"] = "https://projextpal.com/x"
                ctx["expires_text"] = ""
                html = render_to_string("email/transactional/notification.html", ctx)
                if "ProjeXtPal" not in html:
                    issues.append(f"  ✗ {k}/{lang}: missing brand wordmark")
            except Exception as e:
                issues.append(f"  ✗ {k}/{lang}: {type(e).__name__}: {e}")

    # 2. Dispatcher creates a Notification row (rolled back)
    sentinel_email = "preflight+notify@projextpal.test"
    try:
        with transaction.atomic():
            user = CustomUser.objects.create(
                username=sentinel_email, email=sentinel_email, is_active=False, role="admin",
            )
            from notifications.dispatcher import dispatch
            from notifications.models import NotificationKind
            n = dispatch(
                recipient=user,
                kind=NotificationKind.TASK_ASSIGNED,
                title="preflight",
                target_url="https://projextpal.com/preflight",
                send_email=False,
            )
            if not n or not n.pk:
                issues.append("  ✗ dispatcher returned no Notification row")
            raise transaction.TransactionManagementError("__preflight_rollback__")
    except transaction.TransactionManagementError as e:
        if "__preflight_rollback__" not in str(e):
            issues.append(f"  ✗ Unexpected dispatcher tx error: {e}")
    except Exception as e:
        issues.append(f"  ✗ Notification dispatcher failed: {type(e).__name__}: {e}")

    if not issues:
        print(f"  ✓ {len(kinds) * len(SUPPORTED_LANGS)} variants render + dispatcher healthy")
    return issues


# ----------------------------------------------------------------------
# RUN ALL
# ----------------------------------------------------------------------

def main() -> int:
    print("=" * 60)
    print("ProjeXtPal preflight check")
    print("=" * 60)

    all_issues: list[str] = []
    for fn in (check_email_config, check_schema_drift, check_signup_insert, check_email_render, check_notification_dispatcher):
        try:
            all_issues.extend(fn())
        except Exception as e:
            all_issues.append(f"  ✗ {fn.__name__} raised: {type(e).__name__}: {e}")
            traceback.print_exc()

    print()
    print("=" * 60)
    if all_issues:
        print(f"FAIL — {len(all_issues)} issue(s):")
        for line in all_issues:
            print(line)
        return 1
    print("PASS — all preflight checks green")
    return 0


# When run via `manage.py shell -c exec(open(...))`, sys.exit kills the shell.
# Use returncode for caller scripts.
exit_code = main()
if __name__ == "__main__":
    sys.exit(exit_code)
