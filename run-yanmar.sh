#!/usr/bin/env bash
#
# Fast Yanmar Sprint 0 bootstrap against the main checkout.
# Skips the full --build (which reinstalls all of langchain etc.) by
# installing only the 3 new deps into the running backend container.

set -euo pipefail

cd "$HOME/Projects/projextpal"

say()  { printf "\n\033[1;36m▶ %s\033[0m\n" "$*"; }
ok()   { printf "  \033[1;32m✓\033[0m %s\n" "$*"; }
die()  { printf "  \033[1;31m✗ %s\033[0m\n" "$*"; exit 1; }

# Host safety
HOST="$(hostname -s 2>/dev/null || hostname)"
case "$HOST" in
  *Studio*|*studio*) die "Refusing to run on '$HOST' (production)." ;;
esac

docker info >/dev/null 2>&1 || die "Docker daemon not reachable. Start Docker Desktop and re-run."

say "Stopping any in-progress backend build"
docker compose stop backend >/dev/null 2>&1 || true
ok "Stopped"

say "Starting postgres, redis, backend (no --build)"
docker compose up -d postgres redis backend
ok "Containers up"

say "Waiting for backend container to be responsive"
for i in {1..60}; do
  if docker compose exec -T backend python -c "import django" >/dev/null 2>&1; then
    ok "Backend container ready (${i}s)"
    break
  fi
  sleep 1
  [ "$i" = "60" ] && die "Backend didn't come up in 60s. Check 'docker compose logs backend'"
done

say "Installing the 3 new Sprint 0 deps into the running container"
docker compose exec -T backend pip install --quiet \
  "python-pptx==1.0.2" "python-docx==1.2.0" "anthropic==0.42.0"
ok "Deps installed"

say "Running migrations"
docker compose exec -T backend python manage.py migrate

say "Seeding Yanmar demo project"
docker compose exec -T backend python manage.py seed_yanmar_demo

say "Verifying"
docker compose exec -T backend python manage.py shell <<'PY'
from projects.models import Project
from prince2.models import HighlightReport
p = Project.objects.filter(name='Renovation Phase 2').first()
hr = HighlightReport.objects.filter(project__name='Renovation Phase 2').first()
if not p:
    raise SystemExit("Demo project NOT found")
print(f"  project id     : {p.id}")
print(f"  scope_in (chars): {len(p.scope_in or '')}")
print(f"  target impl.   : {p.target_implementation_date}")
print(f"  budget total   : EUR {p.project_budget.total_budget}")
print(f"  budget ETC     : EUR {p.project_budget.etc}")
print(f"  budget cont.   : EUR {p.project_budget.contingency}")
print(f"  budget variance: EUR {p.project_budget.variance:.0f}")
print(f"  tasks          : {sum(m.tasks.count() for m in p.milestones.all())}")
print(f"  risks          : {p.risks.count()}")
print(f"  stages         : {p.prince2_stages.count()}")
print(f"  highlight id   : {hr.id if hr else 'NONE'}")
print(f"  4-axis RAG     : B={hr.rag_budget} P={hr.rag_planning} R={hr.rag_resources} O={hr.overall_status}")
PY

echo
ok "Sprint 0 demo ready."
echo
echo "  Backend          : http://localhost:8001"
echo "  PPTX export URL  : http://localhost:8001/api/v1/prince2/projects/<PID>/prince2/highlight-reports/<HRID>/export/pptx/"
echo "  AI minutes URL   : http://localhost:8001/api/v1/communication/projects/<PID>/meetings/ai-minutes/  (POST, body: {transcript: '...'})"
