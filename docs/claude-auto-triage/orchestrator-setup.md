# Claude Auto-Triage — External Orchestrator Setup

**Sprint 11 S11-01.** Sibling doc to Sprint 10-B's pipeline design.

This is the receive side of the Claude Auto-Triage pipeline. The ProjeXtPal
backend fires a webhook when an eligible `ProductIssue` lands; this
orchestrator takes it from there — call Claude, open PR, callback.

```
ProjeXtPal signals/cron (claude_triage.py)
   └─ POST /repos/Inclufy/Projextpal/dispatches  (GitHub API, HMAC-signed)
          │
          ▼
   .github/workflows/claude-auto-triage.yml
   (repository_dispatch, type=claude-auto-triage)
          │
          ▼
   scripts/orchestrator/run_fix.py
     ├─ anthropic Messages API (Claude 5 Sonnet)
     ├─ git branch + commit + push
     ├─ gh pr create
     └─ POST (HMAC-signed) /api/v1/product-issues/<id>/claude-callback/
```

## 1. GitHub repository secrets

Set in **Settings → Secrets and variables → Actions**:

| Name | Value | Notes |
|---|---|---|
| `ANTHROPIC_API_KEY` | `sk-ant-...` | Claude 5 Sonnet access (`claude-sonnet-5-20260101`). Keep budget alerts on this key — one failed PR run can burn 15k input + 8k output tokens. |
| `PROJEXTPAL_WEBHOOK_SECRET` | shared HMAC secret | Must equal the ProjeXtPal env `CLAUDE_FIX_AGENT_WEBHOOK_SECRET`. 64 hex chars from `openssl rand -hex 32`. |
| `PROJEXTPAL_CALLBACK_URL` | `https://projextpal.com/api/v1/product-issues/<id>/claude-callback/` | The `<id>` and `{issue_id}` placeholders are both substituted by `run_fix.py`. The direct `api.projextpal.com` host 404s at the edge — use `projextpal.com/api` (see CLAUDE.md §6c). |

`GITHUB_TOKEN` is provided automatically to the workflow; it has `contents:
write` + `pull-requests: write` from the workflow's `permissions:` block.

## 2. ProjeXtPal production env vars

Add to `backend/.env` on Hetzner (and Mac Studio staging):

```ini
CLAUDE_AUTO_TRIAGE_ENABLED=true
CLAUDE_FIX_AGENT_WEBHOOK=https://api.github.com/repos/Inclufy/Projextpal/dispatches
CLAUDE_FIX_AGENT_WEBHOOK_AUTH=Bearer ghp_...            # PAT with repo + workflow scopes
CLAUDE_FIX_AGENT_WEBHOOK_SECRET=<same hex secret as GitHub side>
PROJEXTPAL_PUBLIC_URL=https://projextpal.com            # for the callback URL baked into the payload
```

The URL auto-detector in `claude_triage.py::_post_webhook` sees
`api.github.com/.../dispatches` and switches to the GitHub
`repository_dispatch` shape (`{event_type, client_payload}`) with the
`Authorization` + `Accept: application/vnd.github+json` headers. For a
self-hosted orchestrator (no GitHub Actions), point
`CLAUDE_FIX_AGENT_WEBHOOK` elsewhere and leave `_WEBHOOK_AUTH` blank —
the HMAC header stays the auth mechanism.

### GitHub PAT scopes

The token in `CLAUDE_FIX_AGENT_WEBHOOK_AUTH` needs the **classic** PAT
scopes `repo` + `workflow` (fine-grained tokens cannot fire
`repository_dispatch` as of 2026-10). Mint it on the `Inclufy/Projextpal`
repo only — never a user-scoped token.

## 3. Cron registration (Mac Studio)

The signal path dispatches immediately; the cron catches issues that were
created when the webhook was down or when the AI classifier set them to
`agent-scan` out of hours.

```bash
# `crontab -e` on sami@MacStudovanSami:
*/15 * * * * /Users/sami/Desktop/ProjextPal/scripts/cron-claude-triage.sh
```

The script runs `python manage.py claude_auto_triage --limit 5` inside
`projextpal-backend-prod`; it no-ops when `CLAUDE_AUTO_TRIAGE_ENABLED` is
unset.

## 4. Smoke-test flow

**End-to-end**, without touching production state:

1. In **GitHub → Actions → Claude Auto-Triage → Run workflow**, paste a
   small payload into `issue_payload`:
   ```json
   {
     "issue_id": 999999,
     "title": "docs: fix typo in README",
     "description": "There is a typo on line 42 of docs/README.md",
     "files_hint": ["docs/README.md"],
     "repo_branch": "master",
     "worktree_name": "smoke-test"
   }
   ```
2. Watch the job logs for `callback <url> -> 2xx`. On success, a PR appears
   under `auto/claude-999999-smoke-test`; the callback is signed but the
   backend will likely return 404 for a fake issue id — that's expected
   (the fail path still exercised the HMAC + gh CLI wiring).
3. For a real end-to-end run, create a tiny `agent-scan`/P2/UI issue in
   staging and let the signal fire the webhook.

## 5. Security model

| Hop | Auth | What stops a forgery |
|---|---|---|
| ProjeXtPal → GitHub dispatch | Bearer PAT (`CLAUDE_FIX_AGENT_WEBHOOK_AUTH`) + HMAC header | PAT scope-limited to this one repo; HMAC is belt-and-braces so a leaked PAT alone can't inject a fake payload the orchestrator trusts. |
| GitHub Actions runner → repo | `GITHUB_TOKEN` with the two permissions the workflow declares | Minimum permissions; token's lifetime is one job. |
| run_fix.py → ProjeXtPal callback | `X-ProjeXtPal-Signature: sha256=…` HMAC over the body | The callback view (`ProductIssueClaudeCallbackView`) rejects on signature mismatch. |

### What Claude may touch

The orchestrator enforces, independently of the model's response:

- **Forbidden files** — hard reject on `backend/projects/permissions.py`,
  `backend/projects/views.py`, `backend/execution/views.py`. These govern
  cross-tenant isolation; humans only.
- **Path safety** — rejects absolute paths and `..` traversal.
- **Blast radius** — one PR touches at most `MAX_PATCH_FILES=15` files.
- **Smoke check** — every touched `.py` must `ast.parse()` cleanly.
- **No secrets exfiltration path** — the runner reads `files_hint`,
  cannot access `.env` on prod (the workflow runs on a GitHub-managed
  Ubuntu runner, not Mac Studio or Hetzner).

The pipeline **never** merges the PR — a human still owns the merge gate.

## 6. Operational caveats

- **Cost ceiling**: each Claude call is ~5k input tokens (per hinted file
  × up to 10 files) + up to 8k output tokens. At the Oct-2026 Claude 5
  Sonnet pricing (`$3 / M input`, `$15 / M output`) that is roughly
  **$0.07 – $0.15 per fix**. A runaway cron (5 issues × 96 ticks/day) is
  capped at ~$72/day; monitor the Anthropic console.
- **Rate limits**: GitHub `repository_dispatch` is capped at ~1500/hr;
  the backend's own `claude_auto_triage` command already caps at
  `--limit 5` per 15-min cron, so the backend side cannot approach that.
- **Not covered this sprint** (Sprint 12 backlog): multi-turn
  conversation, grep/semantic context selection, auto-merge after CI
  pass, daily token budget, rollback on bad fix.
