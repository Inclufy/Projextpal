#!/usr/bin/env bash
# Safer redeploy: tag rollback on failure, health-check gate.
# Run on the Mac Studio (or wherever prod lives): bash safe-redeploy.sh [git_ref]
set -euo pipefail

TARGET_REF="${1:-master}"
COMPOSE="docker compose -f docker-compose.production.yml"
HEALTH_URL="http://localhost:8001/api/v1/programs/"
ROLLBACK_REF=$(git rev-parse HEAD)  # remember current, roll back to it on failure

echo "🔖 Current commit (rollback target): $ROLLBACK_REF"

cleanup_and_rollback() {
  echo "🚨 Deploy FAILED — rolling back to $ROLLBACK_REF"
  git checkout "$ROLLBACK_REF"
  $COMPOSE up -d --no-deps --force-recreate backend frontend
  sleep 8
  echo "🔎 Post-rollback status:"
  $COMPOSE ps
  exit 1
}
trap 'cleanup_and_rollback' ERR

echo "⬇️  Fetching + checking out $TARGET_REF..."
git fetch origin "$TARGET_REF"
git checkout "origin/$TARGET_REF" 2>/dev/null || git checkout "$TARGET_REF"

echo "🔨 Building backend + frontend (no-cache)..."
$COMPOSE build --no-cache backend frontend

echo "🚀 Restarting containers..."
$COMPOSE up -d --no-deps --force-recreate backend frontend

echo "🗂️  Running migrations..."
$COMPOSE exec -T backend python manage.py migrate --noinput

echo "⏳ Waiting for health (up to 30s)..."
for i in $(seq 1 30); do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL" || echo "000")
  case "$code" in
    200|401|403)
      echo "✅ Backend healthy (HTTP $code after ${i}s)"
      $COMPOSE ps
      docker image prune -f
      echo "🟢 Deploy of $TARGET_REF successful — live commit: $(git rev-parse HEAD)"
      exit 0
      ;;
  esac
  sleep 1
done

echo "❌ Backend did not become healthy in 30s"
exit 1
