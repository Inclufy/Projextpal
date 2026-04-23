#!/usr/bin/env bash
# One-shot deploy: pull latest images from GitLab registry → roll frontend+backend → restart nginx.
#
# Usage (on the prod host — Mac Studio):
#   ./deploy-from-registry.sh
#
# What it does:
#   1. Syncs repo to origin/master (so docker-compose.production.yml is current).
#   2. Pulls the current frontend + backend images from the GitLab registry.
#   3. Rolls the containers (up -d) and restarts nginx to flush its
#      cached upstream DNS (nginx caches container IPs; if we don't restart
#      it, it routes to the killed backend container for ~60s after swap).
#   4. Polls the health endpoint with auto-rollback on failure.
#
# Why not the existing safe-redeploy.sh?
#   safe-redeploy.sh only rebuilds backend. This script swaps images that
#   were built on a laptop and pushed to the registry, so no rebuild on
#   prod is needed. It's faster and works on a laptop-class laptop-builder
#   that has more RAM than the Mac Studio has free.
#
# Requires:
#   - docker logged into registry.gitlab.com with at least read_registry
#     scope (create a GitLab deploy token if needed)
#   - docker-compose.production.yml present in the repo

set -euo pipefail

REPO_DIR="${REPO_DIR:-$HOME/projextpal}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.production.yml}"
COMPOSE="docker compose -f $COMPOSE_FILE"
HEALTH_URL="${HEALTH_URL:-http://localhost:8001/api/v1/health/}"
HEALTH_TIMEOUT="${HEALTH_TIMEOUT:-60}"

err() { echo "ERROR: $*" >&2; exit 1; }
log() { echo "[$(date +%H:%M:%S)] $*"; }

# ------------------------------------------------- sanity
[[ -d "$REPO_DIR" ]] || err "repo dir $REPO_DIR not found; set REPO_DIR env var if elsewhere"
cd "$REPO_DIR"
[[ -f "$COMPOSE_FILE" ]] || err "$COMPOSE_FILE not found at $PWD"

# Make sure docker is logged in to the registry that backs the image tags.
if ! docker pull --quiet registry.gitlab.com/inclufy/projextpal/backend:latest >/dev/null 2>&1; then
    err "cannot pull from registry.gitlab.com/inclufy/projextpal/backend — run 'docker login registry.gitlab.com' with a deploy token first"
fi

# ------------------------------------------------- sync repo
log "fetching latest master"
git fetch --quiet origin
git checkout --quiet master
git pull --ff-only --quiet

# Capture current digests so we can rollback if the new ones break prod.
ROLLBACK_FRONTEND=$(docker inspect --format='{{index .RepoDigests 0}}' registry.gitlab.com/inclufy/projextpal/frontend:latest 2>/dev/null || echo "")
ROLLBACK_BACKEND=$(docker inspect --format='{{index .RepoDigests 0}}' registry.gitlab.com/inclufy/projextpal/backend:latest 2>/dev/null || echo "")
log "rollback targets: frontend=${ROLLBACK_FRONTEND:-none} backend=${ROLLBACK_BACKEND:-none}"

# ------------------------------------------------- pull new images
log "pulling latest frontend + backend"
$COMPOSE pull frontend backend

# ------------------------------------------------- swap containers
log "rolling containers"
$COMPOSE up -d frontend backend

# nginx caches container IPs; without restart it'll point at the old
# killed backend for a minute.
log "restarting nginx (flush upstream DNS cache)"
$COMPOSE restart nginx

# ------------------------------------------------- health poll
log "waiting up to ${HEALTH_TIMEOUT}s for $HEALTH_URL"
deadline=$(( $(date +%s) + HEALTH_TIMEOUT ))
while (( $(date +%s) < deadline )); do
    code=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 3 "$HEALTH_URL" || true)
    if [[ "$code" == "200" ]]; then
        log "health OK (HTTP $code)"
        $COMPOSE ps
        echo
        log "done — verify https://projextpal.com"
        exit 0
    fi
    sleep 2
done

# ------------------------------------------------- rollback
log "HEALTH CHECK FAILED — attempting rollback"
if [[ -n "$ROLLBACK_FRONTEND" && -n "$ROLLBACK_BACKEND" ]]; then
    docker tag "$ROLLBACK_FRONTEND" registry.gitlab.com/inclufy/projextpal/frontend:latest
    docker tag "$ROLLBACK_BACKEND"  registry.gitlab.com/inclufy/projextpal/backend:latest
    $COMPOSE up -d frontend backend
    $COMPOSE restart nginx
    err "deploy FAILED — rolled back to previous images. Check logs: docker compose -f $COMPOSE_FILE logs --tail 60 backend"
else
    err "deploy FAILED and no previous image digests to roll back to — manual intervention required"
fi
