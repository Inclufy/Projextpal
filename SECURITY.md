# Security policy

## Reporting a vulnerability

Send a write-up to **security@inclufy.com**. Don't open a public GitHub
issue. We aim to respond within 72 hours.

For credential leaks specifically: rotate immediately on the live system,
then file the report with the rotated date so we can compare it against
the leaked commit timestamp.

## Pre-commit hooks (mandatory once per developer machine)

This repo is **public**. Every commit is in the public timeline forever.

We use [pre-commit](https://pre-commit.com/) with
[gitleaks](https://github.com/gitleaks/gitleaks) + a local regex hook to
block the most common leak shapes before they hit a push:

- API keys (`sk_live_*`, `ghp_*`, `AKIA*`, `xoxb-*`, JWTs, RSA keys, etc.)
- Custom password literals matching `Word + digits + special char` (the
  shape that bit us on 2026-05-18 — see catalog BUG-035 + PR #29)
- Merge-conflict markers committed by accident
- Files bigger than 2 MB (probably want Git LFS)

### Setup (one time per developer)

```bash
pip install pre-commit
pre-commit install                  # installs the hook in .git/hooks
pre-commit run --all-files          # one-off sweep on existing tree
```

After `install`, every `git commit` runs the hooks against the staged
files. A failed check rejects the commit; fix the issue and re-stage.

### If a hook is a false positive

For the `no-shaped-passwords` hook specifically: if you legitimately
need a string that looks like a password (e.g. example data in docs),
prefix the line with `EXAMPLE:` and the hook ignores it.

For any hook: as a last resort, `git commit --no-verify` bypasses
pre-commit, but **don't push** without running the hooks first. Better:
refine the regex in `.pre-commit-config.yaml` so the false positive
doesn't recur.

## GitHub-side hardening (enabled on this repo)

| Setting | Status | Why |
|---|---|---|
| `secret_scanning` | ✅ enabled | Detects ~120 well-known provider tokens. Auto-alerts the security tab on detection. |
| `secret_scanning_push_protection` | ✅ enabled | Blocks pushes containing those tokens before they land on GitHub. |
| `dependabot_security_updates` | ✅ enabled | Auto-opens PRs for vulnerable dependencies. |
| `secret_scanning_non_provider_patterns` | ❌ requires GHAS | Would catch custom-shaped passwords like the BUG-035 leak. Closed via the local pre-commit hook above. |
| `secret_scanning_validity_checks` | ❌ requires GHAS | Would actively probe found tokens. Out of scope today. |

If we ever buy GitHub Advanced Security, enable the bottom two and the
local pre-commit becomes belt-and-braces rather than the only line of
defense.

## Credential management

All admin credentials used by tests and agents must come from env vars,
**never** committed literals:

| Variable | Used by | Notes |
|---|---|---|
| `ADMIN_EMAIL` | `tests/e2e/common.py` and all `.claude/agents/*-tester.md` | Defaults to `sami@inclufy.com`. Email is non-secret. |
| `ADMIN_PASSWORD` | Same | Required for any authenticated E2E sweep. If unset, `tests/e2e/common.py` emits a `RuntimeWarning` at import and tests fail at login with a clear message. |

The actual password lives in the operator's password manager. Rotation
policy: rotate immediately on any suspected leak; default cadence is
quarterly.
