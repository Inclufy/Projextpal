#!/usr/bin/env bash
#
# Copy the patched source files from the host main-checkout into the
# running backend container, commit the image, then restart -- so we
# don't pay 3 minutes for a full rebuild.

set -euo pipefail

cd "$HOME/Projects/projextpal"

say()  { printf "\n\033[1;36m▶ %s\033[0m\n" "$*"; }
ok()   { printf "  \033[1;32m✓\033[0m %s\n" "$*"; }
die()  { printf "  \033[1;31m✗ %s\033[0m\n" "$*"; exit 1; }

HOST="$(hostname -s 2>/dev/null || hostname)"
case "$HOST" in *Studio*|*studio*) die "Refusing on production '$HOST'." ;; esac

# Files to copy: host_path:container_path
FILES=(
  # ---- Sprint 0 ----
  "backend/projects/models.py:/app/projects/models.py"
  "backend/projects/serializers.py:/app/projects/serializers.py"
  "backend/projects/admin.py:/app/projects/admin.py"
  "backend/projects/migrations/0013_yanmar_schema_batch.py:/app/projects/migrations/0013_yanmar_schema_batch.py"
  "backend/projects/management/commands/seed_yanmar_demo.py:/app/projects/management/commands/seed_yanmar_demo.py"
  "backend/prince2/models.py:/app/prince2/models.py"
  "backend/prince2/views.py:/app/prince2/views.py"
  "backend/prince2/urls.py:/app/prince2/urls.py"
  "backend/prince2/admin.py:/app/prince2/admin.py"
  "backend/prince2/exports.py:/app/prince2/exports.py"
  "backend/prince2/migrations/0006_yanmar_highlight_report_rag.py:/app/prince2/migrations/0006_yanmar_highlight_report_rag.py"
  "backend/communication/urls.py:/app/communication/urls.py"
  "backend/communication/ai_minutes.py:/app/communication/ai_minutes.py"
  "backend/communication/ai_minutes_views.py:/app/communication/ai_minutes_views.py"

  # ---- Sprint 1 ----
  "backend/projects/views.py:/app/projects/views.py"
  "backend/projects/urls.py:/app/projects/urls.py"
  "backend/projects/exports_project_plan.py:/app/projects/exports_project_plan.py"
  "backend/projects/migrations/0014_task_category.py:/app/projects/migrations/0014_task_category.py"
  "backend/projects/migrations/0015_pushback_workflow.py:/app/projects/migrations/0015_pushback_workflow.py"
  "backend/communication/models.py:/app/communication/models.py"
  "backend/communication/migrations/0004_meeting_expansion.py:/app/communication/migrations/0004_meeting_expansion.py"

  # ---- Sprint 2 ----
  "backend/accounts/models.py:/app/accounts/models.py"
  "backend/accounts/admin.py:/app/accounts/admin.py"
  "backend/accounts/migrations/0014_companyaikey.py:/app/accounts/migrations/0014_companyaikey.py"
  "backend/core/llm_keys.py:/app/core/llm_keys.py"
  "backend/projects/migrations/0016_project_signoff.py:/app/projects/migrations/0016_project_signoff.py"
  "backend/projects/migrations/0017_projectmembership.py:/app/projects/migrations/0017_projectmembership.py"

  # ---- Sprint 3 ----
  "backend/projects/ai_risk_mitigation.py:/app/projects/ai_risk_mitigation.py"
  "backend/projects/exports_project_plan.py:/app/projects/exports_project_plan.py"
  "backend/projects/export_templates/__init__.py:/app/projects/export_templates/__init__.py"
  "backend/projects/management/commands/re_encrypt_api_keys.py:/app/projects/management/commands/re_encrypt_api_keys.py"
  "backend/projects/migrations/0018_project_impact_solution_roi.py:/app/projects/migrations/0018_project_impact_solution_roi.py"
  "backend/projects/migrations/0019_communicationplan.py:/app/projects/migrations/0019_communicationplan.py"
  "backend/accounts/migrations/0015_companyaikey_encrypted.py:/app/accounts/migrations/0015_companyaikey_encrypted.py"
  "backend/accounts/migrations/0016_company_export_preference.py:/app/accounts/migrations/0016_company_export_preference.py"
  "backend/admin_portal/models.py:/app/admin_portal/models.py"
  "backend/admin_portal/migrations/0004_clientapikey_encrypted.py:/app/admin_portal/migrations/0004_clientapikey_encrypted.py"
  "backend/governance/ai_reports.py:/app/governance/ai_reports.py"
  "backend/governance/views.py:/app/governance/views.py"
  "backend/bot/ai/__init__.py:/app/bot/ai/__init__.py"
  "backend/core/secret_field.py:/app/core/secret_field.py"
  "backend/prince2/views.py:/app/prince2/views.py"
)

CT="projectpal-backend"

say "Stopping backend (image stays, container halts)"
docker compose stop backend >/dev/null 2>&1 || true
docker start "$CT" >/dev/null 2>&1 || docker compose up -d backend >/dev/null
sleep 2
ok "Container alive"

say "Copying patched files into container"
for entry in "${FILES[@]}"; do
  src="${entry%%:*}"
  dst="${entry##*:}"
  if [ ! -f "$src" ]; then
    die "Missing host file: $src"
  fi
  # Ensure target dir exists in the container
  dst_dir="$(dirname "$dst")"
  docker exec "$CT" mkdir -p "$dst_dir" 2>/dev/null || true
  docker cp "$src" "$CT:$dst"
  ok "$src"
done

say "Committing image so the patches persist across restarts"
docker commit "$CT" projextpal-backend:latest >/dev/null
ok "Image updated"

say "Restarting backend"
docker compose restart backend

say "Waiting for backend to boot cleanly"
for i in {1..90}; do
  STATE="$(docker inspect -f '{{.State.Status}}' "$CT" 2>/dev/null || true)"
  if [ "$STATE" = "running" ] && \
     docker compose exec -T backend python manage.py check >/dev/null 2>&1; then
    ok "Backend stable (${i}s)"
    break
  fi
  sleep 1
  [ "$i" = "90" ] && die "Backend still not stable. See: docker compose logs backend --tail 60"
done

say "Running migrations"
docker compose exec -T backend python manage.py migrate

say "Seeding Yanmar demo"
docker compose exec -T backend python manage.py seed_yanmar_demo

say "Verifying"
docker compose exec -T backend python manage.py shell <<'PY'
from projects.models import Project, Task, TaskDueDateChangeRequest
from prince2.models import HighlightReport
from communication.models import Meeting, MeetingAttendee, MeetingActionItem
p = Project.objects.filter(name='Renovation Phase 2').first()
hr = HighlightReport.objects.filter(project__name='Renovation Phase 2').first()
if not p:
    raise SystemExit("Demo project NOT found")
print(f"  project id     : {p.id}")
print(f"  budget total   : EUR {p.project_budget.total_budget}")
print(f"  budget ETC     : EUR {p.project_budget.etc}")
print(f"  budget cont.   : EUR {p.project_budget.contingency}")
print(f"  budget variance: EUR {p.project_budget.variance:.0f}")
print(f"  risks          : {p.risks.count()}")
print(f"  stages         : {p.prince2_stages.count()}")
print(f"  highlight id   : {hr.id if hr else 'NONE'}")
print(f"  4-axis RAG     : B={hr.rag_budget} P={hr.rag_planning} R={hr.rag_resources} O={hr.overall_status}")
print()
print("Sprint 1 models:")
print(f"  Task.category exists: {'category' in [f.name for f in Task._meta.get_fields()]}")
print(f"  Task.revision_count exists: {'revision_count' in [f.name for f in Task._meta.get_fields()]}")
print(f"  TaskDueDateChangeRequest table: {TaskDueDateChangeRequest.objects.count()} rows")
print(f"  MeetingAttendee table: {MeetingAttendee.objects.count()} rows")
print(f"  MeetingActionItem table: {MeetingActionItem.objects.count()} rows")
PY

echo
ok "Sprint 0 + Sprint 1 demo ready."
echo
echo "  Backend : http://localhost:8001"
echo
echo "  Sprint 1 endpoints:"
echo "    GET  /api/v1/projects/<pid>/task-kpi/"
echo "    GET  /api/v1/projects/<pid>/export/project-plan.docx"
echo "    GET  /api/v1/projects/tasks/category-subtotals/?project=<pid>"
echo "    GET  /api/v1/projects/task-due-change-requests/?status=pending&project=<pid>"
echo "    POST /api/v1/projects/task-due-change-requests/<id>/approve/"
echo "    POST /api/v1/projects/task-due-change-requests/<id>/reject/"
