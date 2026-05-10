#!/usr/bin/env bash
# =====================================================================
# ProjeXtPal production database backup
# =====================================================================
#
# Run via host cron — NOT inside the backend container.
# Stores compressed pg_dump snapshots with grandfather-father-son rotation:
#   - 7 daily backups (last 7 days)
#   - 4 weekly backups (Sunday at 4am)
#   - 12 monthly backups (1st of the month)
#
# Usage:
#   ./backup.sh           # daily backup
#   ./backup.sh --weekly  # promotes today's daily to a weekly slot
#   ./backup.sh --monthly # promotes today's daily to a monthly slot
#   ./backup.sh --verify  # restores latest into a test DB to validate
#
# Cron suggestion (paste with `crontab -e` on the Mac Studio host):
#   0 3 * * *   /Users/sami/projextpal/backend/scripts/backup.sh
#   0 4 * * 0   /Users/sami/projextpal/backend/scripts/backup.sh --weekly
#   0 5 1 * *   /Users/sami/projextpal/backend/scripts/backup.sh --monthly
#   0 6 1 * *   /Users/sami/projextpal/backend/scripts/backup.sh --verify
#
# =====================================================================
set -euo pipefail

CONTAINER="projextpal-postgres-prod"
DB_USER="projextpal"
DB_NAME="projextpal"
BACKUP_ROOT="${HOME}/projextpal-backups"
DAILY_DIR="${BACKUP_ROOT}/daily"
WEEKLY_DIR="${BACKUP_ROOT}/weekly"
MONTHLY_DIR="${BACKUP_ROOT}/monthly"
LOG_FILE="${BACKUP_ROOT}/backup.log"

DAILY_KEEP=7
WEEKLY_KEEP=4
MONTHLY_KEEP=12

mkdir -p "$DAILY_DIR" "$WEEKLY_DIR" "$MONTHLY_DIR"
touch "$LOG_FILE"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

fail() {
    log "FAIL: $*"
    exit 1
}

# ---------------------------------------------------------------------
# Verify mode: restore latest daily into a sandbox DB and run sanity checks
# ---------------------------------------------------------------------
if [[ "${1:-}" == "--verify" ]]; then
    LATEST=$(ls -t "$DAILY_DIR"/*.sql.gz 2>/dev/null | head -1) || true
    [[ -z "${LATEST:-}" ]] && fail "no daily backup found to verify"
    log "Verifying restore from: $LATEST"

    SANDBOX="projextpal_verify_$(date +%s)"
    docker exec -i "$CONTAINER" psql -U "$DB_USER" -d postgres -c \
        "CREATE DATABASE $SANDBOX;" >/dev/null

    if gunzip -c "$LATEST" | docker exec -i "$CONTAINER" psql -U "$DB_USER" -d "$SANDBOX" >/dev/null 2>&1; then
        ROW_COUNT=$(docker exec -i "$CONTAINER" psql -U "$DB_USER" -d "$SANDBOX" \
            -tAc "SELECT COUNT(*) FROM accounts_company;")
        log "Verify OK — restored sandbox $SANDBOX has $ROW_COUNT companies"
    else
        log "FAIL: restore into $SANDBOX errored"
        docker exec -i "$CONTAINER" psql -U "$DB_USER" -d postgres -c \
            "DROP DATABASE IF EXISTS $SANDBOX;" >/dev/null 2>&1 || true
        exit 1
    fi
    docker exec -i "$CONTAINER" psql -U "$DB_USER" -d postgres -c \
        "DROP DATABASE $SANDBOX;" >/dev/null
    exit 0
fi

# ---------------------------------------------------------------------
# Daily backup (default) — gzipped pg_dump
# ---------------------------------------------------------------------
TIMESTAMP=$(date +%Y%m%d-%H%M)
TARGET="${DAILY_DIR}/projextpal-${TIMESTAMP}.sql.gz"

log "Starting daily backup → $TARGET"

if ! docker exec "$CONTAINER" pg_dump -U "$DB_USER" "$DB_NAME" 2>>"$LOG_FILE" | gzip > "$TARGET"; then
    fail "pg_dump failed"
fi

SIZE=$(du -h "$TARGET" | cut -f1)
log "Daily backup written: $TARGET ($SIZE)"

# ---------------------------------------------------------------------
# Promote to weekly / monthly if requested
# ---------------------------------------------------------------------
if [[ "${1:-}" == "--weekly" ]]; then
    cp "$TARGET" "${WEEKLY_DIR}/projextpal-${TIMESTAMP}.sql.gz"
    log "Promoted to weekly slot"
fi

if [[ "${1:-}" == "--monthly" ]]; then
    cp "$TARGET" "${MONTHLY_DIR}/projextpal-${TIMESTAMP}.sql.gz"
    log "Promoted to monthly slot"
fi

# ---------------------------------------------------------------------
# Rotate — keep N most recent in each tier
# ---------------------------------------------------------------------
rotate() {
    local dir=$1
    local keep=$2
    local count
    count=$(ls -t "$dir"/*.sql.gz 2>/dev/null | wc -l | tr -d ' ')
    if (( count > keep )); then
        ls -t "$dir"/*.sql.gz | tail -n +$((keep + 1)) | xargs -r rm -f
        log "Rotated $dir — kept $keep, removed $((count - keep))"
    fi
}

rotate "$DAILY_DIR" "$DAILY_KEEP"
rotate "$WEEKLY_DIR" "$WEEKLY_KEEP"
rotate "$MONTHLY_DIR" "$MONTHLY_KEEP"

# ---------------------------------------------------------------------
# Optional: copy to off-site location
# (Uncomment ONE of the options below after you've configured it.)
# ---------------------------------------------------------------------
#
# Option A — iCloud Drive (zero setup if iCloud Drive is enabled):
# OFFSITE="${HOME}/Library/Mobile Documents/com~apple~CloudDocs/projextpal-backups"
# mkdir -p "$OFFSITE/daily" && cp "$TARGET" "$OFFSITE/daily/" && log "Copied to iCloud"
#
# Option B — rclone to S3 / B2 / GDrive (requires `brew install rclone` + config):
# rclone copy "$TARGET" "remote:projextpal-backups/daily/" && log "Synced to remote"
#
# Option C — external drive (only when mounted):
# if [[ -d /Volumes/Backup/projextpal ]]; then
#     cp "$TARGET" /Volumes/Backup/projextpal/daily/ && log "Copied to external drive"
# fi

log "Backup completed successfully"
