#!/bin/bash
# ---------------------------------------------------------------------------
# Docker + ProjeXtPal watchdog.
#
# On the 2026-06-06 incident the Mac Studio rebooted but the Docker ENGINE did
# not auto-start, so the whole stack stayed down for hours. This watchdog:
#   1. ensures the Docker engine is running (starts Docker Desktop if not),
#   2. ensures the ProjeXtPal stack is up (compose up -d if nginx is missing).
#
# Designed to be run every few minutes by a LaunchAgent
# (com.inclufy.docker-watchdog.plist). Idempotent + quiet when healthy.
# ---------------------------------------------------------------------------
DOCKER=/usr/local/bin/docker
COMPOSE_DIR="$HOME/Desktop/ProjextPal"
COMPOSE_FILE="docker-compose.production.yml"
LOG_TS="$(date '+%F %T')"

# 1) Engine up?
if ! "$DOCKER" info >/dev/null 2>&1; then
  echo "$LOG_TS engine down — launching Docker Desktop"
  open -a Docker
  # wait up to ~2 min for the engine to accept connections
  for _ in $(seq 1 12); do
    "$DOCKER" info >/dev/null 2>&1 && break
    sleep 10
  done
  if ! "$DOCKER" info >/dev/null 2>&1; then
    echo "$LOG_TS ✗ engine still down after wait — manual check needed"
    exit 1
  fi
  echo "$LOG_TS ✓ engine back up"
fi

# 2) ProjeXtPal stack up?
cd "$COMPOSE_DIR" 2>/dev/null || { echo "$LOG_TS ✗ compose dir missing"; exit 1; }
if ! "$DOCKER" ps --format '{{.Names}}' 2>/dev/null | grep -q '^projextpal-nginx-prod$'; then
  echo "$LOG_TS stack down — bringing ProjeXtPal up"
  "$DOCKER" compose -f "$COMPOSE_FILE" up -d
  "$DOCKER" compose -f "$COMPOSE_FILE" restart nginx
  echo "$LOG_TS ✓ stack restarted"
fi
