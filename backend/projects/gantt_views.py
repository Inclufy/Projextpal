"""Gantt + Critical Path (CPM) for a project's tasks.

Returns every task with its real calendar bar (start/due) PLUS a classic
Critical Path Method analysis computed from task durations + the depends_on
DAG: earliest/latest start+finish, slack, and an is_critical flag. The bars are
positioned by real dates in the UI; CPM tells you which tasks have zero slack.
Cycle-safe (a cyclic depends_on graph falls back to no-CPM rather than hang).
"""
from datetime import timedelta

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Task, Project
from .views import accessible_project_ids


def _duration_days(t):
    start = t.start_date
    end = t.revised_due_date or t.due_date
    if start and end and end >= start:
        return max(1, (end - start).days + 1)
    return 1


def _topo_order(nodes, preds):
    """Kahn topological sort. Returns (order, has_cycle)."""
    from collections import deque
    indeg = {n: 0 for n in nodes}
    for n in nodes:
        for _p in preds.get(n, ()):  # edge pred -> n
            indeg[n] += 1
    q = deque([n for n in nodes if indeg[n] == 0])
    order = []
    while q:
        n = q.popleft()
        order.append(n)
        for m in nodes:
            if n in preds.get(m, ()):
                indeg[m] -= 1
                if indeg[m] == 0:
                    q.append(m)
    return order, (len(order) != len(nodes))


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def project_gantt(request, project_id):
    if int(project_id) not in set(accessible_project_ids(request.user)):
        return Response({"detail": "Project not found or not accessible."}, status=404)
    try:
        project = Project.objects.get(id=project_id)
    except Project.DoesNotExist:
        return Response({"detail": "Project not found."}, status=404)

    tasks = list(
        Task.objects.filter(milestone__project_id=project_id)
        .select_related("assigned_to", "milestone")
        .prefetch_related("depends_on")
    )
    by_id = {t.id: t for t in tasks}
    ids = [t.id for t in tasks]
    # Predecessors limited to tasks within this project.
    preds = {t.id: [d.id for d in t.depends_on.all() if d.id in by_id] for t in tasks}
    dur = {t.id: _duration_days(t) for t in tasks}

    order, has_cycle = _topo_order(ids, preds)
    es, ef, ls, lf = {}, {}, {}, {}
    critical_ids = []

    if not has_cycle and ids:
        # Forward pass
        for n in order:
            es[n] = max((ef[p] for p in preds[n]), default=0)
            ef[n] = es[n] + dur[n]
        project_finish = max(ef.values(), default=0)
        # Successors
        succ = {n: [] for n in ids}
        for n in ids:
            for p in preds[n]:
                succ[p].append(n)
        # Backward pass
        for n in reversed(order):
            lf[n] = min((ls[s] for s in succ[n]), default=project_finish)
            ls[n] = lf[n] - dur[n]
        critical_ids = sorted((n for n in ids if (ls[n] - es[n]) == 0), key=lambda n: es[n])

    def row(t):
        nid = t.id
        slack = (ls.get(nid, 0) - es.get(nid, 0)) if not has_cycle else None
        return {
            "id": nid,
            "title": t.title,
            "milestone_name": t.milestone.name if t.milestone_id else None,
            "assigned_to_name": (getattr(t.assigned_to, "get_full_name", lambda: "")() or getattr(t.assigned_to, "email", None)) if t.assigned_to_id else None,
            "status": t.status,
            "progress": t.progress,
            "start_date": t.start_date.isoformat() if t.start_date else None,
            "due_date": (t.revised_due_date or t.due_date).isoformat() if (t.revised_due_date or t.due_date) else None,
            "duration_days": dur[nid],
            "depends_on": preds[nid],
            "es": es.get(nid), "ef": ef.get(nid), "ls": ls.get(nid), "lf": lf.get(nid),
            "slack": slack,
            "is_critical": (not has_cycle) and (nid in critical_ids),
        }

    rows = [row(t) for t in tasks]
    dated = [r for r in rows if r["start_date"] or r["due_date"]]
    starts = [r["start_date"] for r in dated if r["start_date"]]
    ends = [r["due_date"] for r in dated if r["due_date"]]
    return Response({
        "project": {"id": project.id, "name": project.name},
        "tasks": rows,
        "critical_path": critical_ids,
        "has_cycle": has_cycle,
        "window": {
            "start": min(starts) if starts else None,
            "end": max(ends) if ends else None,
        },
        "counts": {
            "total": len(rows),
            "dated": len(dated),
            "critical": len(critical_ids),
            "undated": len(rows) - len(dated),
        },
    })
