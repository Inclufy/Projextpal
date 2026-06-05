# Yanmar Requirements — Implementation Status

**Date:** 2026-06-01
**Branch:** `sprint-yanmar-fit`
**Validator:** `client-requirements-validator` agent (read-only, evidence-based)
**Source of truth:** `docs/yanmar/requirements-checklist.yaml` + the
"Yanmar specs → herbruikbaar voor Inclufy Finance" portability matrix

## TL;DR

**18 PASS · 1 PARTIAL · 0 FAIL · 95% coverage.**

All GREEN (direct port-baar) and YELLOW (adapt-patterns) items are
fully implemented. The single PARTIAL is monitoring infrastructure
(UptimeRobot + PagerDuty not yet configured — Sentry is wired in code
but conditional on the prod `.env` having `SENTRY_DSN`).

| Group | Items | PASS | PARTIAL | FAIL |
|---|:-:|:-:|:-:|:-:|
| 🟢 GREEN — direct port-baar | 5 | 5 | 0 | 0 |
| 🟡 YELLOW — adapt patterns | 9 | 9 | 0 | 0 |
| 🔵 BLUE — cross-cutting infra | 5 | 4 | 1 | 0 |
| **Total** | **19** | **18** | **1** | **0** |

## 🟢 GREEN — direct port-baar (5/5 PASS)

| Item | Status | Evidence |
|---|:-:|---|
| BYO LLM keys per company | PASS | `accounts/models.py:196` CompanyAIKey · `core/llm_keys.py:60` get_anthropic_client · `admin_portal/models.py:180` ClientApiKey |
| Fernet encryption at rest | PASS | `core/secret_field.py:65` MultiFernet · CompanyAIKey + ClientApiKey both use `_EncryptedCharField` · migrations 0015/0004 applied |
| GDPR DPIA document | PASS | `docs/yanmar/dpia-projextpal.md` (7.3KB) |
| AWS topology document | PASS | `docs/yanmar/aws-topology-yanmar.md` (7.9KB) |
| Methodology-aware export selector | PASS | `projects/export_templates/__init__.py` pick_template · 3 slots: yanmar/prince2/generic · `CompanyExportPreference.default_template` |

## 🟡 YELLOW — adapt patterns (9/9 PASS)

| Item | Status | Evidence |
|---|:-:|---|
| Budget rollup (6-field one-view) | PASS | `projects/views.py:282` budget_rollup action · BudgetOneView.tsx · internal/external/paid/outstanding/etc/variance |
| Push-back approval workflow | PASS | `projects/models.py:341` TaskDueDateChangeRequest · 14-day rule at `serializers.py:117` · approve/reject ViewSet actions ⚠ field named `decided_by` not `approved_by` |
| E-signature project closing | PASS | `projects/models.py:1244` ProjectSignOff · ProjectSignOffDialog.tsx with canvas pad |
| 6-role unified membership | PASS | `projects/models.py:1297` ProjectMembership · ROLE_CHOICES = owner/PM/leader/facilitator/outside_eyes/stakeholder |
| AI Meeting Minutes | PASS | `communication/ai_minutes.py:140` transcript_to_minutes · DOCX export via render_minutes_docx |
| DOCX export (Project Plan) | PASS | `projects/exports_project_plan.py` · python-docx==1.2.0 · `views.py:195` endpoint |
| PPTX export (Highlight Report) | PASS | `prince2/exports.py` · python-pptx==1.0.2 · `views.py:425` endpoint |
| Category sub-totals | PASS | `Task.category` field · `views.py:1269` category_subtotals action |
| Revised Due Date + Delay tracking | PASS | `Task.revised_due_date` + `completed_on` + `delay_days` property + `revision_count` |

## 🔵 BLUE — cross-cutting infra (4 PASS + 1 PARTIAL)

| Item | Status | Evidence |
|---|:-:|---|
| CompanyScopedQuerysetMixin | PASS | `projects/views.py:96` + replicated in execution/views.py:21 + workflow/views.py:18 |
| Audit trail (log_action) | PASS | `admin_portal/models.py:353` log_action · AuditLog model line 11 · called from API key ops |
| Sentry + UptimeRobot + PagerDuty | **PARTIAL** | Sentry wired in `core/settings.py:33` (conditional on SENTRY_DSN env). UptimeRobot **not configured** (per CLAUDE.md §10). PagerDuty **absent**. |
| JWT auth + TOTP MFA | PASS | rest_framework_simplejwt · `accounts/two_factor.py` TOTPDevice · login-2fa endpoint · Company.require_2fa flag |
| data-guardian agent | PASS | `~/.claude/agents/data-guardian.md` (out-of-repo, present on machine) |

## Top 3 Gaps

### 1. UptimeRobot + PagerDuty niet ingericht (PARTIAL)
Sentry-code staat klaar maar pas actief als `SENTRY_DSN` in productie `.env` staat. UptimeRobot heeft 0 monitors (bekend uit CLAUDE.md §10). PagerDuty geen sporen in codebase. Blokkeert Yanmar-demo niet, maar als Yanmar InfoSec naar uptime-SLA-monitoring vraagt is dit een sales risk.

### 2. GDPR audit trail niet volledig gewired (note bij Audit trail PASS)
`log_action()` bestaat en wordt gebruikt voor API-key operaties. Maar `accounts/gdpr.py:238` heeft een TODO: "write to AuditLog table once that model exists". Het model bestaat nu wel, maar die GDPR code-path is niet gekoppeld. Als Yanmar's DPO bij DPIA-review een audit-trail van persoonsgegeven-events vraagt, surface dit.

### 3. Push-back veldnaam-mismatch (PASS met note)
Spec verwijst naar `approved_by`. Implementatie heet `decided_by` (line 378). Semantisch identiek, maar als Finance dit ports en zoekt naar `approved_by`, faalt silent. Hernoemen of aliassen vóór Finance-port.

## Manueel te checken vóór 8 juni demo

`seed_yanmar_demo.py` bestaat en definieert `PROJECT_NAME = "Renovation Phase 2"`. Of het command tegen de productie DB is gedraaid kon de agent niet bevestigen zonder execute-rechten. Verifieer met:

```bash
docker compose -f docker-compose.production.yml exec -T backend \
  python manage.py shell -c "from projects.models import Project; print(Project.objects.filter(name='Renovation Phase 2').count())"
```

Verwacht: `>= 1`. Zo niet, run `python manage.py seed_yanmar_demo`.

## Sprint-claim verificatie

Alle sprint-claims uit de matrix verified:

- **Sprint 0** (PPTX, AI minutes, delay tracking, category sub-totals): ✅ alle vier aanwezig
- **Sprint 1** (DOCX export, push-back workflow): ✅
- **Sprint 2** (BYO LLM, e-sig, 6-role membership, DPIA, AWS topology): ✅
- **Sprint 3** (Fernet, budget rollup, methodology selector, export preference): ✅

## Conclusie

**95% coverage** is meer dan acceptabel voor Yanmar handoff op 8 juni. Geen FAIL items. De enige PARTIAL is infrastructuur (monitoring) die niet de demo blokkeert maar wel het InfoSec-gesprek raakt.

Voor de Finance-portability (waar deze validatie eigenlijk voor liep): alle 14 patronen in 🟢 + 🟡 zijn 1:1 of via documented patterns aanwezig in ProjeXtPal en kunnen direct gespiegeld worden naar Inclufy Finance.
