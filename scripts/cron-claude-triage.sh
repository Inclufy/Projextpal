#!/usr/bin/env bash
# 15-minute cron entry — runs the Claude auto-triage management command
# inside the production backend container. Companion to cron-triage.sh
# (which runs the AI-classification triage every 30 min). See
# cron-triage.README.md for install instructions and log inspection.
#
# NOTE: This is an opt-in pipeline. The command no-ops unless BOTH
#   CLAUDE_AUTO_TRIAGE_ENABLED=true
#   CLAUDE_FIX_AGENT_WEBHOOK=<orchestrator webhook url>
# are set on the backend container. Default = disabled.
set -euo pipefail

cd /Users/sami/Desktop/ProjextPal
mkdir -p logs

docker exec projextpal-backend-prod \
    python manage.py claude_auto_triage --limit 5 \
    >> logs/claude-triage.log 2>&1
