# Auto-triage cron — install + operate

Runs `python manage.py triage_product_issues` every 30 minutes against the
production backend container on the Mac Studio. Each run:

1. **Phase A (catalog cross-match)** — reads
   `tests/regression/known_issues.json` and resolves any open `ProductIssue`
   that matches a `fixed_verified` / `fix_pending_deploy` entry. No LLM
   call needed.
2. **Phase B (Anthropic LLM)** — sends remaining unmatched issues to
   Sonnet for classification (bug / duplicate / feature / needs-info /
   wontfix) + priority (P0..P3).
3. **Digest email** — one summary mail to the admin watchlist at the end
   (per-issue emails are suppressed during the run).

## One-time install (Mac Studio)

```bash
# 1. After pulling, make the wrapper executable
chmod +x /Users/sami/Desktop/ProjextPal/scripts/cron-triage.sh

# 2. Edit the crontab
crontab -e

# 3. Add this line (runs at :00 and :30 every hour)
*/30 * * * * /Users/sami/Desktop/ProjextPal/scripts/cron-triage.sh
```

Save + exit. macOS will prompt the first time for "Full Disk Access" for
`cron` — grant it in System Settings → Privacy & Security → Full Disk
Access (otherwise the docker exec fails silently).

## Required env

The backend container reads `ANTHROPIC_API_KEY` from `/Users/sami/Desktop/ProjextPal/.env`
(loaded by `docker-compose.production.yml`). Confirm it's set BEFORE the
first cron run:

```bash
docker exec projextpal-backend-prod \
    python -c "from django.conf import settings; print('ANTHROPIC_API_KEY set:', bool(getattr(settings, 'ANTHROPIC_API_KEY', '')))"
```

Expected: `ANTHROPIC_API_KEY set: True`. If False, add the key to
`.env` and `docker compose -f docker-compose.production.yml up -d backend`.

The Yanmar sprint also wired BYO keys via `admin_portal.ClientApiKey` and
`accounts.CompanyAIKey` — those take precedence per company. The
platform-wide `settings.ANTHROPIC_API_KEY` is the cross-company fallback
the cron will hit when no per-company BYO key is configured.

## Inspect logs

```bash
# Tail live
tail -f /Users/sami/Desktop/ProjextPal/logs/triage.log

# Last 200 lines
tail -200 /Users/sami/Desktop/ProjextPal/logs/triage.log

# Errors only
grep -E "WARNING|ERROR|! #|errors$" /Users/sami/Desktop/ProjextPal/logs/triage.log
```

Each run ends with a line like:

```
INFO: triaged 7 issues — 4 by catalog, 2 by LLM, 1 needing info, 0 errors
```

## Pause / resume

Pause by commenting the cron line:

```bash
crontab -e
# */30 * * * * /Users/sami/Desktop/ProjextPal/scripts/cron-triage.sh
```

Resume by uncommenting + save. No restart needed.

## Manual smoke-test

```bash
# Dry-run — no DB writes, no LLM call
docker exec projextpal-backend-prod python manage.py triage_product_issues --dry-run

# One specific issue
docker exec projextpal-backend-prod python manage.py triage_product_issues --issue-id 42

# Small live batch
docker exec projextpal-backend-prod python manage.py triage_product_issues --limit 5
```

## Idempotency

Triage comments start with `[auto-triage-YYYY-MM-DD] #<issue-id>`. A second
run on the same calendar day **skips** any issue that already has such a
comment, so the cron is safe to fire multiple times.

## What it can't do (yet)

- No real attempt at reproduction — the agent classifies based on text only.
  For the "did the bug actually go away" check, the existing
  `regression-tester` agent still runs separately.
- No automatic linking of duplicates back to the canonical bug — Phase B
  flags `classification = 'duplicate'` but doesn't set `duplicate_of` FK
  (would need a vector-search step we haven't built).
- No retry-with-backoff on LLM transient errors — failures get a "will
  retry next cycle" comment and the issue stays at `status='new'`.
