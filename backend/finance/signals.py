"""Django signals for the Inclufy Finance integration.

Pushes project_code / program_code from ProjeXtPal to Inclufy Finance when
projects/programs are created or renamed. Best-effort only — failures are
logged, not raised, so the local save never fails because of an external
sync hiccup.
"""
import logging
from typing import Optional

from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver

logger = logging.getLogger(__name__)


def _push_to_finance(table: str, payload: dict) -> Optional[int]:
    """POST a project/program metadata snapshot to the Inclufy Finance Supabase
    REST API. Idempotent on (organization, code).

    Returns the HTTP status code or None when the integration is not
    configured / fails. The caller intentionally ignores the return.
    """
    if not getattr(settings, "INCLUFY_FINANCE_PUSH_ENABLED", False):
        return None
    base_url = getattr(settings, "INCLUFY_FINANCE_SUPABASE_URL", "").rstrip("/")
    service_key = getattr(settings, "INCLUFY_FINANCE_SUPABASE_SERVICE_KEY", "")
    if not base_url or not service_key:
        return None

    import requests  # local import — module-load order safety
    headers = {
        "apikey": service_key,
        "Authorization": f"Bearer {service_key}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates,return=minimal",
    }
    try:
        resp = requests.post(
            f"{base_url}/rest/v1/{table}",
            headers=headers,
            json=payload,
            timeout=10,
        )
        if resp.status_code >= 400:
            logger.warning(
                "Finance push %s failed: status=%s body=%s",
                table, resp.status_code, resp.text[:300],
            )
        return resp.status_code
    except Exception as exc:
        logger.warning("Finance push %s exception: %s", table, exc)
        return None


def _connect_signals():
    """Lazy connect to avoid import-time circular references."""
    from projects.models import Project
    from programs.models import Program

    @receiver(post_save, sender=Project, dispatch_uid="finance_push_project_code")
    def push_project_code(sender, instance: Project, created, **kwargs):
        # We push on every save where there is a project_code. The Finance
        # side dedupes via Prefer: resolution=merge-duplicates.
        if not instance.project_code:
            return
        company = getattr(instance, "company", None)
        _push_to_finance(
            "projextpal_projects",
            {
                "external_id": str(instance.id),
                "code": instance.project_code,
                "name": instance.name,
                "company_name": getattr(company, "name", None),
                "company_id": getattr(company, "id", None),
                "status": instance.status or "",
                "methodology": instance.methodology or "",
                "start_date": instance.start_date.isoformat() if instance.start_date else None,
                "end_date": instance.end_date.isoformat() if instance.end_date else None,
                "budget": float(instance.budget or 0),
                "currency": instance.currency,
            },
        )

    @receiver(post_save, sender=Program, dispatch_uid="finance_push_program_code")
    def push_program_code(sender, instance: Program, created, **kwargs):
        if not instance.program_code:
            return
        company = getattr(instance, "company", None)
        _push_to_finance(
            "projextpal_programs",
            {
                "external_id": str(instance.id),
                "code": instance.program_code,
                "name": instance.name,
                "company_name": getattr(company, "name", None),
                "company_id": getattr(company, "id", None),
                "status": instance.status or "",
                "methodology": instance.methodology or "",
                "start_date": instance.start_date.isoformat() if instance.start_date else None,
                "end_date": instance.target_end_date.isoformat() if instance.target_end_date else None,
                "budget": float(instance.total_budget or 0),
                "currency": instance.currency,
            },
        )
