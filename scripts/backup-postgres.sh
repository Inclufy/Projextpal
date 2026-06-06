#!/bin/bash
# ---------------------------------------------------------------------------
# Reliable ProjeXtPal Postgres backup (the safety net that recovered us on the
# 2026-06-06 containerd-corruption incident).
#
# - Dumps the LIVE prod container (projextpal-postgres-prod), gzipped.
# - VERIFIES the dump is non-trivial (>100 KB) — guards the "20-byte empty dump"
#   failure mode.
# - Copies the dump OFF-HOST to iCloud Drive (survives a full host loss).
# - Rotates: keeps the last 14 auto-dumps locally.
#
# Run from cron, e.g. every 6 hours:
#   0 */6 * * *  /Users/sami/Desktop/ProjextPal/scripts/backup-postgres.sh >> \
#                /Users/sami/Desktop/ProjextPal/logs/db-backup.log 2>&1
# ---------------------------------------------------------------------------
set -euo pipefail

DOCKER=/usr/local/bin/docker
CONTAINER=projextpal-postgres-prod
DB_USER=projextpal
DB_NAME=projextpal

COMPOSE_DIR="$HOME/Desktop/ProjextPal"
BACKUP_DIR="$COMPOSE_DIR/backups"
ICLOUD_DIR="$HOME/Library/Mobile Documents/com~apple~CloudDocs/ProjextPal-db-backups"
MIN_BYTES=102400          # 100 KB floor — anything smaller = failed dump
KEEP=14                   # how many local auto-dumps to retain

TS="$(date +%Y%m%d_%H%M%S)"
OUT="$BACKUP_DIR/projextpal_auto_${TS}.sql.gz"

mkdir -p "$BACKUP_DIR"

# NOTE: no `-t` on docker exec — a TTY corrupts the binary stream piped to gzip.
"$DOCKER" exec "$CONTAINER" pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$OUT"

SIZE="$(stat -f%z "$OUT" 2>/dev/null || echo 0)"
if [ "$SIZE" -lt "$MIN_BYTES" ]; then
  echo "$(date '+%F %T') ✗ BACKUP FAILED — only ${SIZE} bytes (<${MIN_BYTES}). Kept for inspection: $OUT" >&2
  exit 1
fi

# Off-host copy (best-effort; never fail the run on iCloud hiccup).
if mkdir -p "$ICLOUD_DIR" 2>/dev/null; then
  cp "$OUT" "$ICLOUD_DIR/" 2>/dev/null || echo "$(date '+%F %T') ! iCloud copy skipped" >&2
fi

# Rotate local auto-dumps (keep newest $KEEP).
ls -1t "$BACKUP_DIR"/projextpal_auto_*.sql.gz 2>/dev/null | tail -n +$((KEEP + 1)) | while read -r f; do rm -f "$f"; done

echo "$(date '+%F %T') ✓ backup OK — $OUT (${SIZE} bytes)"
