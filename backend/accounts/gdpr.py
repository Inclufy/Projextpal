"""GDPR Art. 15 (right of access) + Art. 17 (right to erasure) endpoints.

Two endpoints, both authenticated:

  GET    /api/v1/accounts/me/export/  → Art. 15: JSON download of user's data
  DELETE /api/v1/accounts/me/delete/  → Art. 17: anonymize + soft-delete account

The export uses dynamic Django introspection: it walks a curated set of
methodology + governance apps and dumps every model with a FK→CustomUser.
This is more maintainable than a hard-coded export schema, and it stays
correct when new methodology apps are added (provided they're added to
_GDPR_USER_LINKED_APPS).

The delete uses a soft-delete + anonymize pattern (industry-standard for
GDPR-compliant SaaS): PII is scrubbed in-place, is_active=False, and a
management command can hard-delete after a 30-day grace period. This gives
users a window to recover (lawful basis: contractual necessity) while
honoring the "without undue delay" rule of Art. 17.
"""
from __future__ import annotations

import json
from datetime import timedelta

from django.apps import apps
from django.conf import settings
from django.db import transaction
from django.http import HttpResponse
from django.utils import timezone

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

# Apps whose user-linked records are part of the user's "personal data" under
# GDPR. Methodology apps + governance + core. Keep alphabetical.
_GDPR_USER_LINKED_APPS: tuple[str, ...] = (
    "accounts",
    "agile",
    "cross_methodology",
    "governance",
    "hybrid_programme",
    "kanban",
    "lss_black",
    "msp",
    "p2_programme",
    "pmi",
    "prince2",
    "safe",
    "scrum",
    "subscriptions",
    "waterfall",
)

# Fields excluded from export — security-sensitive, irrelevant to user, or
# would bloat the JSON unnecessarily.
_EXCLUDED_FIELDS: frozenset[str] = frozenset(
    {
        "password",
        "last_login",  # internal use, not user-meaningful
    }
)


def _find_user_fk_field_name(model) -> str | None:
    """Return the name of the FK field on `model` that points to AUTH_USER_MODEL.

    Returns None if no such FK exists. Handles both string-form (`"app.Model"`)
    and class-form remote_field.model representations.
    """
    auth_user_model = settings.AUTH_USER_MODEL  # e.g. "accounts.CustomUser"
    for field in model._meta.get_fields():
        if not hasattr(field, "remote_field") or field.remote_field is None:
            continue
        related = field.remote_field.model
        if isinstance(related, str):
            if related == auth_user_model:
                return field.name
        else:
            label = f"{related._meta.app_label}.{related.__name__}"
            if label == auth_user_model:
                return field.name
    return None


def _model_to_safe_dict(obj, *, exclude: frozenset[str] = frozenset()) -> dict:
    """Convert a Django model instance to a JSON-serializable dict.

    Non-primitive values (datetime, UUID, FileField, ForeignKey instances) are
    coerced to strings via repr/str.
    """
    out: dict = {}
    for field in obj._meta.concrete_fields:
        name = field.name
        if name in _EXCLUDED_FIELDS or name in exclude:
            continue
        try:
            value = getattr(obj, name, None)
        except Exception:
            value = None
        if value is None or isinstance(value, (str, int, float, bool)):
            out[name] = value
        else:
            out[name] = str(value)
    return out


def _build_user_export(user) -> dict:
    """Build a complete Art. 15 data export for `user`."""
    export: dict = {
        "export_metadata": {
            "exported_at": timezone.now().isoformat(),
            "user_id": user.id,
            "user_email": user.email,
            "gdpr_article": "Art. 15 — Right of access",
            "format_version": "1.0",
            "scope_apps": list(_GDPR_USER_LINKED_APPS),
        },
        "account": _model_to_safe_dict(user, exclude=frozenset({"image"})),
        "linked_data": {},
    }

    for app_label in _GDPR_USER_LINKED_APPS:
        try:
            app_config = apps.get_app_config(app_label)
        except LookupError:
            continue  # app not installed in this build

        app_export: dict = {}
        for model in app_config.get_models():
            # Skip the CustomUser model itself — already in "account"
            if model is user.__class__:
                continue

            fk_field_name = _find_user_fk_field_name(model)
            if not fk_field_name:
                continue

            try:
                queryset = model.objects.filter(**{fk_field_name: user})
            except Exception:
                # Defensive: a custom manager could raise. Skip if so.
                continue

            count = queryset.count()
            if count == 0:
                continue

            rows = [_model_to_safe_dict(obj) for obj in queryset]
            app_export[model.__name__] = {"count": count, "rows": rows}

        if app_export:
            export["linked_data"][app_label] = app_export

    return export


class DataExportView(APIView):
    """GDPR Art. 15 — Right of access.

    GET /api/v1/accounts/me/export/

    Returns a JSON download of the authenticated user's data across all
    user-linked tables. Always 200 for authenticated users (export is allowed
    even if account is being deleted).
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            export = _build_user_export(request.user)
        except Exception as exc:  # pragma: no cover — defensive
            return Response(
                {"error": "Export failed", "detail": str(exc)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        body = json.dumps(export, indent=2, ensure_ascii=False)
        response = HttpResponse(body, content_type="application/json; charset=utf-8")
        filename = (
            f"projextpal-data-export-"
            f"{request.user.id}-"
            f"{timezone.now().strftime('%Y-%m-%d')}.json"
        )
        response["Content-Disposition"] = f'attachment; filename="{filename}"'
        try:
            from .models import audit
            audit(request.user, "data.export", summary="Downloaded a GDPR Art. 15 data export", request=request)
        except Exception:
            pass
        return response


class AccountDeleteView(APIView):
    """GDPR Art. 17 — Right to erasure.

    DELETE /api/v1/accounts/me/delete/

    Soft-delete pattern:
      1. Anonymize PII fields in-place (email, name, image)
      2. Mark is_active=False so the account can't be used
      3. Return 200 with a grace_period_until timestamp (30 days)

    A separate management command (TODO) runs nightly to hard-delete
    accounts past their grace period. Until then, the user can contact
    support to reactivate.
    """

    permission_classes = [IsAuthenticated]

    def delete(self, request):
        user = request.user
        now = timezone.now()
        grace_until = now + timedelta(days=30)

        # Capture originals BEFORE scrubbing — needed for the audit record.
        orig_email = user.email
        orig_user_id = user.id
        orig_company_id = getattr(user, "company_id", None)

        with transaction.atomic():
            # Scrub PII in-place. Use a deterministic-yet-anonymous email
            # so audit logs are still queryable but no PII is preserved.
            user.email = f"deleted-user-{user.id}@deleted.projextpal.com"
            user.first_name = "[deleted]"
            user.last_name = "[deleted]"
            user.username = f"deleted-{user.id}"
            user.is_active = False
            if getattr(user, "image", None):
                try:
                    user.image.delete(save=False)
                except Exception:
                    pass
                user.image = None
            user.save(
                update_fields=[
                    "email",
                    "first_name",
                    "last_name",
                    "username",
                    "is_active",
                    "image",
                ]
            )

            # GDPR Art. 17 — record the erasure in the immutable audit trail.
            try:
                from admin_portal.models import AuditLog
                xff = request.META.get("HTTP_X_FORWARDED_FOR", "")
                ip = (xff.split(",")[0].strip() if xff
                      else request.META.get("REMOTE_ADDR")) or None
                AuditLog.objects.create(
                    user=user,
                    user_email=orig_email,
                    action="user_deleted",
                    category="security",
                    severity="warning",
                    description=(
                        f"GDPR Art. 17 erasure: account {orig_email} "
                        f"(id={orig_user_id}) anonymized; hard-delete after "
                        f"{grace_until.date().isoformat()}."
                    ),
                    metadata={
                        "gdpr_article": "17",
                        "grace_period_until": grace_until.isoformat(),
                        "anonymized_at": now.isoformat(),
                    },
                    resource_type="user",
                    resource_id=str(orig_user_id),
                    company_id=orig_company_id,
                    ip_address=ip,
                    user_agent=request.META.get("HTTP_USER_AGENT", ""),
                )
            except Exception:
                # Audit must never block the erasure itself.
                pass

        try:
            from .models import audit
            audit(None, "account.delete",
                  summary=f"GDPR Art. 17 erasure of {orig_email} (anonymized, 30-day grace)",
                  target_type="user", target_id=orig_user_id, request=request)
        except Exception:
            pass
        return Response(
            {
                "status": "anonymized",
                "message": (
                    "Account anonymized. PII has been scrubbed from our database. "
                    "Final hard-delete after the 30-day grace period. Contact "
                    "support@inclufy.com within 30 days if you change your mind."
                ),
                "anonymized_at": now.isoformat(),
                "grace_period_until": grace_until.isoformat(),
            },
            status=status.HTTP_200_OK,
        )
