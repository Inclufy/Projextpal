"""Inclufy Finance integratie-API — server-kant van het pull/push-contract.

Inclufy Finance (Supabase edge function `projextpal-sync`) is de client:

    GET  /api/v1/integration/documents/{time-expense|project-actuals|
         milestone-progress}?since=&limit=
         → {"documents": [{external_id, external_name, payload, updated_at}],
            "cursor": <iso-timestamp|null>}

    POST /api/v1/integration/documents/{cost-centers|budgets}
         {"documents": [{external_id, external_name?, payload}]}
         → {"accepted": n, "rejected": m,
            "results": [{external_id, status, message?}]}

Authenticatie: `Authorization: Bearer pxp_live_…` — sleutels via
`python manage.py create_finance_api_key`; alleen de sha256-hash staat in
de database. Belangrijk voor time-expense: documenten bevatten de actuele
goedkeuringsstatus, óók als die is teruggedraaid — Finance materialiseert
alleen `approved` en ruimt de rest zelf op.
"""

import hashlib
import json

from django.http import JsonResponse
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from projects.models import Milestone, Project, TimeEntry

from .models import FinanceInboundDocument, FinanceIntegrationApiKey

PULL_ENTITIES = {"time-expense", "project-actuals", "milestone-progress"}
PUSH_ENTITIES = {"cost-centers", "budgets"}
MAX_LIMIT = 500
DEFAULT_LIMIT = 100


def _authenticate(request):
    """Bearer pxp_live_… → actieve sleutel, of None."""
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None
    token = auth[len("Bearer "):].strip()
    if not token.startswith("pxp_live_"):
        return None
    digest = hashlib.sha256(token.encode("utf-8")).hexdigest()
    key = (
        FinanceIntegrationApiKey.objects.select_related("company")
        .filter(key_hash=digest, is_active=True)
        .first()
    )
    if key:
        key.last_used_at = timezone.now()
        key.save(update_fields=["last_used_at"])
    return key


def _parse_since(request):
    raw = request.GET.get("since")
    if not raw:
        return None
    return parse_datetime(raw)


def _parse_limit(request):
    try:
        limit = int(request.GET.get("limit", DEFAULT_LIMIT))
    except (TypeError, ValueError):
        limit = DEFAULT_LIMIT
    return max(1, min(limit, MAX_LIMIT))


def _iso(dt):
    return dt.isoformat() if dt else None


def _num(value):
    return float(value) if value is not None else None


# ─── Pull-documentbouwers ────────────────────────────────────────────────────

def _time_expense_docs(company, since, limit):
    qs = (
        TimeEntry.objects.select_related("project", "user", "task")
        .filter(project__company=company)
        .order_by("updated_at", "id")
    )
    if since:
        qs = qs.filter(updated_at__gt=since)
    docs = []
    for e in qs[:limit]:
        user_name = e.user.get_full_name() or e.user.username
        docs.append({
            "external_id": f"te-{e.id}",
            "external_name": f"{user_name} · {e.date.isoformat()} · {e.hours}u",
            "updated_at": _iso(e.updated_at),
            "payload": {
                "project_id": str(e.project_id),
                "project_external_id": str(e.project_id),
                "project_name": e.project.name,
                "project_code": e.project.project_code or None,
                "date": e.date.isoformat(),
                "hours": _num(e.hours),
                "description": e.description or None,
                "task": str(e.task) if e.task_id else None,
                "user_name": user_name,
                "billable": e.billable,
                "cost_rate": _num(e.hourly_rate_snapshot),
                "billable_rate": _num(e.hourly_rate_snapshot),
                # Actuele status meesturen — Finance materialiseert alleen
                # 'approved' en verwijdert eerdere materialisatie bij een
                # teruggedraaide goedkeuring.
                "status": e.status,
                "approved": e.status == "approved",
                "approved_at": _iso(e.approved_at),
            },
        })
    return docs


def _project_actuals_docs(company, since, limit):
    # Projecten zijn een kleine, langzaam muterende set: we leveren ze
    # integraal (geen since-filter); de Finance-kant upsert idempotent.
    docs = []
    for p in Project.objects.filter(company=company).order_by("id")[:limit]:
        approved = p.time_entries.filter(status="approved")
        hours = sum((_num(e.hours) or 0) for e in approved)
        labor = sum(
            (_num(e.hours) or 0) * (_num(e.hourly_rate_snapshot) or 0)
            for e in approved
        )
        docs.append({
            "external_id": f"proj-{p.id}",
            "external_name": p.name,
            "updated_at": _iso(timezone.now()),
            "payload": {
                "project_id": str(p.id),
                "name": p.name,
                "project_code": p.project_code or None,
                "budget": _num(p.budget),
                "currency": p.currency,
                "start_date": _iso(p.start_date),
                "end_date": _iso(p.end_date),
                "approved_hours": round(hours, 2),
                "approved_labor_cost": round(labor, 2),
            },
        })
    return docs


def _milestone_progress_docs(company, since, limit):
    qs = (
        Milestone.objects.select_related("project")
        .filter(project__company=company)
        .order_by("updated_at", "id")
    )
    if since:
        qs = qs.filter(updated_at__gt=since)
    docs = []
    for m in qs[:limit]:
        docs.append({
            "external_id": f"ms-{m.id}",
            "external_name": f"{m.project.name} · {m.name}",
            "updated_at": _iso(m.updated_at),
            "payload": {
                "project_id": str(m.project_id),
                "project_name": m.project.name,
                "name": m.name,
                "description": m.description or None,
                "start_date": _iso(m.start_date),
                "end_date": _iso(m.end_date),
                "status": m.status,
                "order_index": m.order_index,
            },
        })
    return docs


_PULL_BUILDERS = {
    "time-expense": _time_expense_docs,
    "project-actuals": _project_actuals_docs,
    "milestone-progress": _milestone_progress_docs,
}


# ─── Views ───────────────────────────────────────────────────────────────────

@csrf_exempt
@require_http_methods(["GET", "POST"])
def documents_view(request, entity_type):
    key = _authenticate(request)
    if key is None:
        return JsonResponse({"error": "invalid_api_key"}, status=401)

    if request.method == "GET":
        if entity_type not in PULL_ENTITIES:
            return JsonResponse({"error": "unknown_entity_type"}, status=404)
        since = _parse_since(request)
        limit = _parse_limit(request)
        docs = _PULL_BUILDERS[entity_type](key.company, since, limit)
        cursor = max(
            (d["updated_at"] for d in docs if d.get("updated_at")),
            default=None,
        )
        return JsonResponse({"documents": docs, "cursor": cursor})

    # POST — masterdata-push vanuit Finance
    if entity_type not in PUSH_ENTITIES:
        return JsonResponse({"error": "unknown_entity_type"}, status=404)
    try:
        body = json.loads(request.body.decode("utf-8") or "{}")
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse({"error": "invalid_json"}, status=400)

    results = []
    accepted = rejected = 0
    for doc in body.get("documents", []) or []:
        external_id = str(doc.get("external_id") or "").strip()
        if not external_id:
            rejected += 1
            results.append({
                "external_id": "",
                "status": "rejected",
                "message": "external_id ontbreekt",
            })
            continue
        FinanceInboundDocument.objects.update_or_create(
            company=key.company,
            entity_type=entity_type,
            external_id=external_id,
            defaults={
                "external_name": str(doc.get("external_name") or "")[:255],
                "payload": doc.get("payload") or {},
            },
        )
        accepted += 1
        results.append({"external_id": external_id, "status": "accepted"})

    return JsonResponse({
        "accepted": accepted,
        "rejected": rejected,
        "results": results,
    })
