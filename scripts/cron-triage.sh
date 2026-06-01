#!/usr/bin/env bash
# 30-minute cron entry — runs the auto-triage management command inside
# the production backend container. See scripts/cron-triage.README.md for
# install instructions and how to inspect logs.
set -euo pipefail

cd /Users/sami/Desktop/ProjextPal
mkdir -p logs

docker exec projextpal-backend-prod python manage.py triage_product_issues --limit 25 \
    >> logs/triage.log 2>&1
