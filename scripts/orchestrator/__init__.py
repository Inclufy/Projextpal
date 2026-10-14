"""Claude Auto-Triage external orchestrator (Sprint 11 S11-01).

Receives a signed webhook from ProjeXtPal, asks Claude for a minimal patch,
applies it, opens a PR, and reports back to the issue's claude-callback
endpoint. Deliberately tiny — no Django, no DB, no state between runs.
"""
