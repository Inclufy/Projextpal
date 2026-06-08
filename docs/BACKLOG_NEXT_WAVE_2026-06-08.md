# ProjeXtPal — Next-Wave Backlog (post common-features audit)

Date: 2026-06-08 · Baseline HEAD: `c8cb8c7f` · Source: pm-feature-validator + inclufy-common-features-auditor (read-only audits, 2026-06-08) + meeting feedback.

The previous wave (`BACKLOG_NEXT_WAVE_2026-06-05.md`) is **fully shipped** — Epic 0 (Inclufy Best Practice USP), Epic 1 (Intelligence Layer IL-1/2/3), Epic 2 (Agile flow completion) are all live. This document captures the **table-stakes "common product features" layer** that landed this session, plus the logical follow-ups that build on it.

> ⚠️ Any story that adds a Django model needs a migration. Per CLAUDE.md §9 a **data-guardian backup is mandatory** before applying on Mac Studio, and migrations must **never** be run against production from the MacBook. This env has a recurring **migration-state-drift** pattern (a column/table exists physically while the migration is unrecorded) — new migrations that add columns/tables should be written **idempotent** (vendor-guarded `IF NOT EXISTS` / introspection-skip), as done for 0029 + 0030.

---

## ✅ Shipped this session (the common-features baseline)

| # | Feature | Backend | Frontend | Migration |
|---|---|---|---|---|
| 1 | **Custom fields** (tenant-defined, per entity) | `CustomFieldDefinition` + `Task.custom_fields`, `custom_field_views.py` | `CustomFieldsSettings` page, `CustomFieldsEditor`, Action Tracker form+columns | 0029 (idempotent) |
| 2 | **Saved views + search** | `SavedView` + `saved_view_views.py` | `SavedViews` dropdown, search box on Activity List | 0028 |
| 3 | **Gantt + Critical Path (CPM)** | `gantt_views.py` (forward/backward pass, slack, cycle-safe) | `ProjectGantt` page, planning nav + Timeline button | — |
| 4 | **Bulk-edit** | `TaskViewSet.bulk_update` | selection bar on Action Tracker | — |
| 5 | **Import (CSV/TSV)** | `TaskViewSet.import_tasks` (alias coercion, owner resolve, custom fields) | `ImportDialog` (inline parser, column mapping, preview) | — |
| 6 | **Recurring tasks** | `RecurringTaskRule` + `recurring_engine.py` + `generate_recurring_tasks` cron | `RecurringTasksDialog` (run-now) | 0030 (idempotent) |
| 7 | My Work / inbox | `my_work_views.py` | `MyWork` page | — |
| 8 | Command palette ⌘K | — | `CommandPalette` | — |
| 9 | Export (CSV) | pre-existing `ReportExportMenu` | — | — |

Plus earlier this session: notification centre, AI Project Doctor, collaboration layer (comments/@mentions, discussion, DM, assign-note), role-aware project/programme views + Preview-as-role.

---

## EPIC A — Finish the data layer (extend what just shipped)

These are direct extensions of the new features — high value, low risk, reuse existing code.

| ID | Story | Acceptance | Effort | Reuse / key files |
|---|---|---|---|---|
| A-1 | **Custom fields on Risks & Issues** | `CustomFieldDefinition.entity` already supports `risk`/`issue`; wire `RiskSerializer`/`IssueSerializer` to expose a `custom_fields` JSON field + render `CustomFieldsEditor` on those forms and `show_in_table` columns | M | model already multi-entity; add `custom_fields` JSON to Risk/Issue (migration) + serializer fields + reuse `CustomFieldsEditor` |
| A-2 | **Native Excel (.xlsx) import** | accept `.xlsx` in `ImportDialog` (today CSV-only; users save-as-CSV). Decide: client-side SheetJS (heavy, CVE history) **or** server-side `openpyxl` parse in `import_tasks` | M | `ImportDialog.tsx`, `import_tasks` (add multipart file branch w/ openpyxl) |
| A-3 | **Saved views: apply real filters + share** | extend `SavedView.config` beyond `{groupBy, search}` to status/priority/owner/date filters; surface `audience` (management/tenant) in the save dialog so a view can be shared | M | `SavedViews.tsx`, `saved_view_views.py` (audience already modelled) |
| A-4 | **Import for other registers** | generalise `import_tasks` to risks/issues/milestones (or a generic `/import/?entity=`) | M | `import_tasks` pattern |
| A-5 | **Recurring: fixed weekday / day-of-month** | add `weekday` (0–6) and `day_of_month` (1–31) to `RecurringTaskRule` so "every Monday" / "the 1st" is exact, not interval-from-start | S | `RecurringTaskRule.step()` + migration + dialog |

---

## EPIC B — Gantt → interactive planning

The Gantt is read-only today (bars + critical path). The competitor bar (MS Project / Wrike / Asana Timeline) is interactivity.

| ID | Story | Acceptance | Effort | Key files |
|---|---|---|---|---|
| B-1 | **Drag-to-reschedule** | drag a bar to change start/due; PATCH the task; respects the due-date-change policy (revision_count) | L | `ProjectGantt.tsx`, `TaskViewSet.update` (policy already enforced) |
| B-2 | **Dependency arrows** | draw FS arrows between bars from `depends_on`; optionally draw-to-link to create a dependency | L | `ProjectGantt.tsx` (SVG overlay), `Task.depends_on` |
| B-3 | **Baseline vs actual** | capture a schedule baseline; show planned vs actual bars + slip | M | new `ProjectBaseline` model (migration) |
| B-4 | **Auto-schedule from CPM** | "schedule from dependencies" action that sets dates from ES/EF when a task has none | M | reuse `gantt_views` CPM; add a write endpoint |

---

## EPIC C — Remaining common-features gaps (from the auditor)

Lower-frequency table-stakes still missing vs Jira/Asana/Monday/ClickUp/Linear. Re-run `inclufy-common-features-auditor` to refresh coverage % after Epic A.

| ID | Story | Why | Effort |
|---|---|---|---|
| C-1 | **Saved filters as smart lists / "My open items everywhere"** | cross-project saved views (SavedView already supports `project_id_ref=null`) | S |
| C-2 | **@mention autocomplete polish + notification deep-links** | collaboration layer exists; tighten the UX (mention picker, click-through) | M |
| C-3 | **Keyboard shortcuts beyond ⌘K** | j/k nav, e to edit, c to create — power-user parity | M |
| C-4 | **Webhooks / public API surface for tasks** | `integrations/Webhook` exists; expose task + custom-field events | L |
| C-5 | **Mobile parity** for the new web features (custom fields, saved views, my-work) on the Expo app | web↔mobile parity gap flagged by the auditor | L |
| C-6 | **Audit log on the new mutations** (custom-field defs, bulk-edit, import, recurring) | enterprise compliance; bulk/import are high-blast-radius | M |

---

## Suggested sprint cut

- **Quick-win sprint (1–2 days):** A-5 (recurring weekday/day-of-month), A-3 (saved-view filters + share), C-1 (cross-project smart lists). Pure extensions, one small migration (A-5).
- **Value sprint:** A-1 (custom fields on Risks/Issues — the most-requested extension) + A-2 (xlsx import). One migration (A-1) → data-guardian gate.
- **Differentiator sprint:** Epic B (interactive Gantt) — the headline upgrade vs CSV-style competitors. B-1 + B-2 first.
- **Hardening:** C-6 (audit log) before any enterprise/tender deliverable; C-5 (mobile parity) when the web layer stabilises.

---

## Notes / observations logged this session

- **Migration-state-drift** hit twice (0029 custom_fields, 0030 recurringtaskrule). Both fixed with idempotent migrations. **Recommendation:** make idempotency the default for all future column/table-adding migrations in this repo.
- **Crontab observation (verify):** several backup jobs reference `/Users/sami/projextpal/backend/scripts/backup.sh` (lowercase `projextpal`), while the canonical working tree is `~/Desktop/ProjextPal/`. Confirm those backup scripts exist + run on that path (`tail ~/Desktop/ProjextPal/logs/db-backup.log`) — otherwise DB backups may be silently not running. Out of scope for this session; flagged for a follow-up.
- Recurring tasks cron registered: `0 6 * * *` → `generate_recurring_tasks`. Needs macOS Full Disk Access for `cron`.
