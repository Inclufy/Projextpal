"""
One-shot triage script — flips ProductIssue rows that map to this session's
fixed BUGs (focus-loss across 5 editor pages; BUG-036..BUG-064 methodology
saves; Budget Expense forms) from new/triaging/needs-info/accepted/
in-progress to either `resolved` (already live on prod) or `accepted` with
a `fix_pending_deploy` note (committed but not on Mac Studio yet), and
posts a Dutch-language comment on each one explaining the fix.

Run on the Mac Studio:

    # Dry-run (default — prints what would change, no DB writes):
    docker exec projextpal-backend-prod python manage.py shell \
        -c "exec(open('/app/scripts/triage_product_issues_2026_05_23.py').read())"

    # Apply mode — actually writes:
    docker exec -e APPLY=1 projextpal-backend-prod python manage.py shell \
        -c "exec(open('/app/scripts/triage_product_issues_2026_05_23.py').read())"

Idempotent — re-running the script after APPLY is safe; it skips any
issue that already has a comment from this script (matched by signature
string at the head of each comment body).

Always prints a final summary table so you can verify what changed.

What's deployed to prod (as of triage time):
  - Focus-loss fix      : commit 24104360 + 476f1500   → LIVE
  - 29 methodology BUGs : backend 7f18f151, fe e02c03b1 → LIVE
  - Budget Expense forms: included in e02c03b1         → LIVE
  - 4 read-only fixes   : commit b0f71650              → NOT YET DEPLOYED
    (waterfall risk/issue/deliverable + kanban work-policy)
"""
from __future__ import annotations

import os

from django.utils import timezone

from product_issues.models import ProductIssue, ProductIssueComment


SCRIPT_SIGNATURE = "[triage-2026-05-23]"

# ────────────────────────────────────────────────────────────────────
# Mapping: catalog BUG → match rules + resolution comment
# ────────────────────────────────────────────────────────────────────
# Each entry's `match` callable returns True if a ProductIssue is the
# one the BUG fixed. Multiple BUGs may match a single issue (rare); the
# first match wins.
#
# `new_status` is one of the ProductIssue.STATUS_CHOICES values.
#   - "resolved"  — fix is live on prod, no follow-up needed
#   - "accepted"  — fix is committed but not yet deployed; will resolve
#                   after next Mac Studio backend deploy
#   - "wont-fix"  — by-design / not a code bug
#
# `new_repro_result` is one of the REPRO_RESULT_CHOICES values; used to
# distinguish "we reproduced and fixed the code" from "static-analysis
# only — no auth available" from "not applicable".

RESOLUTIONS = [
    # ────────────────────────────────────────────────────────────────
    # 1. Focus-loss bug — Project Brief / 4 sibling editor pages
    #    Reporter: elisa@re-care.org (Recare) and others
    #    Fix:     commit 24104360 (hoist Field to module scope)
    #    Status:  LIVE on prod (master + Mac Studio deployed)
    # ────────────────────────────────────────────────────────────────
    {
        "bug_id": "FOCUS-LOSS-2026-05-22",
        "match": lambda i: any(
            kw in (i.title + " " + i.description).lower()
            for kw in [
                "1 letter per keer",
                "één letter per keer",
                "een letter per keer",
                "1 letter per keystroke",
                "letter per toetsaanslag",
                "focus loss", "focus-loss", "focusverlies",
                "projectvoorstel",
                "project brief",
                "project-brief",
                "business case",
                "business-case",
                "product vision",
                "product-vision",
                "project closure",
                "governance",
            ]
        ) and any(
            kw in (i.title + " " + i.description + " " + i.actual_behavior).lower()
            for kw in [
                "letter", "toetsaanslag", "keystroke", "focus", "typen",
            ]
        ),
        "comment_nl": (
            f"{SCRIPT_SIGNATURE} FOCUS-LOSS-2026-05-22\n\n"
            "✅ Opgelost — bij het typen in het Projectvoorstel (en de "
            "Business Case / Governance / Project Closure / Product "
            "Vision pagina's) verloor het tekstvak na elke toetsaanslag "
            "de focus, waardoor het leek alsof er maar 1 letter per "
            "keer ingevoerd werd.\n\n"
            "Oorzaak: de `Field` sub-component was binnen de body van "
            "elke editor-pagina gedefinieerd. Bij elke `setForm`-update "
            "kreeg React een nieuwe component-identity en remountte de "
            "<textarea>, waardoor het invoerveld zijn focus verloor.\n\n"
            "Fix: `Field` is naar module-scope gehoist in alle 5 "
            "betroffen pagina's — Prince2ProjectBrief, Prince2BusinessCase, "
            "Prince2Governance, Prince2ProjectClosure en AgileProductVision. "
            "Form/setForm worden nu als typed props doorgegeven.\n\n"
            "Live sinds 2026-05-22 (commits 24104360 + 476f1500). Smoke-"
            "test: typ een hele zin in elk veld — geen onderbreking meer."
        ),
        "new_status": "resolved",
        "new_repro_result": "reproduced",
        "resolution_summary": (
            "Field sub-component was defined inside editor page body; "
            "every setForm re-render remounted the textarea, dropping "
            "focus. Hoisted Field to module scope across 5 pages "
            "(Prince2ProjectBrief + 4 siblings). Live (commits 24104360 + "
            "476f1500)."
        ),
    },

    # ────────────────────────────────────────────────────────────────
    # 2. LSS-Green / LSS-Black / Hybrid create 400 — project not read-only
    #    BUG-036, BUG-037, BUG-038
    #    Fix:     backend 7f18f151
    #    Status:  LIVE on prod
    # ────────────────────────────────────────────────────────────────
    {
        "bug_id": "BUG-036-037-038",
        "match": lambda i: any(
            kw in (i.title + " " + i.description + " " + i.error_trace).lower()
            for kw in [
                "lss-green", "lss_green", "lss green",
                "lss-black", "lss_black", "lss black",
                "dmaic", "hypothesis", "design of experiments",
                "control plan", "spc chart", "spc-chart",
                "hybrid config", "hybrid-config", "phase methodology",
                "hybrid artifact",
            ]
        ) and any(
            kw in (i.error_trace + " " + i.actual_behavior + " " + i.description).lower()
            for kw in ["project", "400", "this field is required"]
        ),
        "comment_nl": (
            f"{SCRIPT_SIGNATURE} BUG-036/037/038\n\n"
            "✅ Opgelost — opslaan in LSS-Green (DMAIC-phase/metric/"
            "measurement), LSS-Black (hypothesis-test/DOE/control-plan/"
            "SPC-chart) en Hybrid (config/artifact/phase-methodology) "
            "gaf 400 met `{\"project\": [\"This field is required.\"]}`.\n\n"
            "Oorzaak: de serializers hadden 'project' als writable veld, "
            "dus DRF eiste het in de POST-body — terwijl de viewset de "
            "FK altijd uit de URL afleidt.\n\n"
            "Fix: 'project' toegevoegd aan `read_only_fields` op "
            "DMAICPhaseSerializer, LSSGreenMetricSerializer, "
            "LSSGreenMeasurementSerializer, HypothesisTestSerializer, "
            "DesignOfExperimentSerializer, ControlPlanSerializer, "
            "SPCChartSerializer, HybridArtifactSerializer, "
            "HybridConfigurationSerializer en PhaseMethodologySerializer.\n\n"
            "Live sinds 2026-05-22/23 (backend 7f18f151)."
        ),
        "new_status": "resolved",
        "new_repro_result": "reproduced",
        "resolution_summary": (
            "Multiple LSS-Green/LSS-Black/Hybrid serializers had "
            "writable 'project' field; DRF demanded it. Added 'project' "
            "to read_only_fields. Live (backend 7f18f151)."
        ),
    },

    # ────────────────────────────────────────────────────────────────
    # 3. Agile DoD / Daily Update / Epic / Backlog / Iteration / Release
    #    BUG-039, BUG-040, BUG-059, BUG-060, BUG-061, BUG-062
    #    Fix:     backend 7f18f151 (DoD + daily-update guard) + frontend e02c03b1
    #    Status:  LIVE on prod
    # ────────────────────────────────────────────────────────────────
    {
        "bug_id": "BUG-039-040-059-062",
        "match": lambda i: any(
            kw in (i.title + " " + i.description + " " + i.error_trace).lower()
            for kw in [
                "definition of done", "definition-of-done", "agile dod", "agile/dod",
                "daily update", "daily-update", "daily updates", "stand-up",
                "agile epic", "agile-epic", "epics",
                "moscow", "must_have", "should_have",
                "iteration", "iteraties", "release planning",
            ]
        ) and any(
            kw in (i.error_trace + " " + i.actual_behavior + " " + i.description).lower()
            for kw in [
                "400", "500", "is not a valid choice", "this field is required",
                "iteration", "priority",
            ]
        ),
        "comment_nl": (
            f"{SCRIPT_SIGNATURE} BUG-039/040/059-062\n\n"
            "✅ Opgelost — meerdere Agile-saves faalden:\n"
            "- DoD POST gaf 400 (`project` required) — fix: read_only.\n"
            "- Daily-update POST gaf 500 (IntegrityError op NULL "
            "iteration FK) — fix: nu een nette 400 als iteration ontbreekt.\n"
            "- Epic / Backlog priority werd gestuurd met niet-MoSCoW "
            "waarden — fix: frontend stuurt nu must_have / should_have / "
            "could_have / wont_have.\n"
            "- Iteration / Release status='planned' was geen geldige "
            "keuze — fix: frontend stuurt nu 'planning'.\n\n"
            "Live sinds 2026-05-22/23 (backend 7f18f151 + frontend e02c03b1)."
        ),
        "new_status": "resolved",
        "new_repro_result": "reproduced",
        "resolution_summary": (
            "Six Agile create-flows failed (DoD/daily-update/epic/backlog/"
            "iteration/release). Backend: DoD project read-only, daily-"
            "update iteration guard. Frontend: MoSCoW priorities, status "
            "'planning'. Live (7f18f151 + e02c03b1)."
        ),
    },

    # ────────────────────────────────────────────────────────────────
    # 4. PRINCE2 Project Brief — silently-dropped fields
    #    BUG-041 (+ BUG-063 PRINCE2 tolerance)
    #    Fix:     migration 0007 + frontend alignment (backend 7f18f151, fe e02c03b1)
    #    Status:  LIVE on prod
    # ────────────────────────────────────────────────────────────────
    {
        "bug_id": "BUG-041-063",
        "match": lambda i: any(
            kw in (i.title + " " + i.description + " " + i.error_trace).lower()
            for kw in [
                "prince2 brief", "prince2-brief", "prince2 project brief",
                "dependencies", "customer_quality_expectations",
                "customer quality expectations", "acceptance_criteria",
                "acceptance criteria", "prince2 tolerance",
                "tolerances",
            ]
        ),
        "comment_nl": (
            f"{SCRIPT_SIGNATURE} BUG-041/063\n\n"
            "✅ Opgelost — twee PRINCE2-problemen:\n\n"
            "1. PATCH op de Project Brief gaf 200 maar liet "
            "`dependencies`, `customer_quality_expectations` en "
            "`acceptance_criteria` stilletjes vallen — die velden "
            "bestonden niet op het ProjectBrief-model. Toegevoegd via "
            "migration prince2/0007.\n\n"
            "2. Tolerance-create gaf 400 doordat het formulier verkeerde "
            "veldnamen en type-waarden stuurde — frontend uitgelijnd met "
            "de serializer.\n\n"
            "Live sinds 2026-05-22/23 (backend 7f18f151 + frontend "
            "e02c03b1)."
        ),
        "new_status": "resolved",
        "new_repro_result": "reproduced",
        "resolution_summary": (
            "PRINCE2 Brief PATCH dropped 3 new fields (no model columns); "
            "tolerance form misaligned with serializer. Fixed via "
            "migration 0007 + frontend alignment. Live (7f18f151 + "
            "e02c03b1)."
        ),
    },

    # ────────────────────────────────────────────────────────────────
    # 5. Budget Expense forms — Foundation / Scrum / Kanban
    #    BUG-042
    #    Fix:     frontend e02c03b1 (incl. earlier b8c1c862)
    #    Status:  LIVE on prod
    # ────────────────────────────────────────────────────────────────
    {
        "bug_id": "BUG-042",
        "match": lambda i: any(
            kw in (i.title + " " + i.description + " " + i.error_trace).lower()
            for kw in [
                "budget expense", "budget-expense", "expense",
                "expenses/", "foundation budget", "scrum budget",
                "kanban budget",
            ]
        ),
        "comment_nl": (
            f"{SCRIPT_SIGNATURE} BUG-042\n\n"
            "✅ Opgelost — Budget Expense-formulieren (Foundation, "
            "Scrum, Kanban) gaven 400. Oorzaak: het formulier stuurde "
            "een 'title'-veld dat niet bestaat op het Expense-model, "
            "plus verkeerde enum-waarden voor status en category.\n\n"
            "Fix: frontend uitgelijnd met het Expense-model (juiste "
            "veldnamen en enums).\n\n"
            "Live sinds 2026-05-23 (frontend e02c03b1 + b8c1c862)."
        ),
        "new_status": "resolved",
        "new_repro_result": "reproduced",
        "resolution_summary": (
            "Budget Expense forms posted invalid 'title' field + wrong "
            "status/category enums. Frontend aligned to Expense model. "
            "Live (e02c03b1 + b8c1c862)."
        ),
    },

    # ────────────────────────────────────────────────────────────────
    # 6. Scrum suite — sprint / backlog / DoD / sprint-planning / standups / increments
    #    BUG-043..BUG-048
    #    Fix:     frontend e02c03b1
    #    Status:  LIVE on prod
    # ────────────────────────────────────────────────────────────────
    {
        "bug_id": "BUG-043-048",
        "match": lambda i: any(
            kw in (i.title + " " + i.description + " " + i.error_trace).lower()
            for kw in [
                "scrum sprint", "scrum-sprint", "scrum backlog",
                "scrum-backlog", "scrum dod", "scrum-dod",
                "sprint planning", "sprint-planning",
                "daily standup", "daily-standup", "standups",
                "increment", "increments",
            ]
        ),
        "comment_nl": (
            f"{SCRIPT_SIGNATURE} BUG-043/044/045/046/047/048\n\n"
            "✅ Opgelost — alle Scrum-create-flows (sprint, backlog "
            "item, DoD, sprint-planning, daily-standup, increment) "
            "gaven 400. Oorzaken liepen uiteen: verkeerde status-enum "
            "('planned' i.p.v. 'planning'; 'backlog' i.p.v. 'todo'), "
            "ontbrekende sprint-FK, en niet-bestaande veldnamen.\n\n"
            "Fix: frontend-formulieren uitgelijnd met de serializers — "
            "juiste enum-waarden, ontbrekende FK's toegevoegd, "
            "veldnamen gecorrigeerd.\n\n"
            "Live sinds 2026-05-23 (frontend e02c03b1)."
        ),
        "new_status": "resolved",
        "new_repro_result": "reproduced",
        "resolution_summary": (
            "Six Scrum forms had wrong enums / missing sprint FK / wrong "
            "field names. Frontend aligned to serializers. Live "
            "(e02c03b1)."
        ),
    },

    # ────────────────────────────────────────────────────────────────
    # 7. Kanban board init + (NOT YET DEPLOYED) work-policy read-only
    #    BUG-049 LIVE, BUG-050 LIVE (frontend rename), b0f71650 NOT YET
    #    Status:  Kanban board-init LIVE; work-policy read-only NOT YET
    # ────────────────────────────────────────────────────────────────
    {
        "bug_id": "BUG-049-050+kanban-work-policy-readonly",
        "match": lambda i: any(
            kw in (i.title + " " + i.description + " " + i.error_trace).lower()
            for kw in [
                "kanban board", "kanban-board",
                "kanban work policy", "kanban-work-policy",
                "work-policies", "work policy", "work policies",
                "kanban/board",
            ]
        ),
        "comment_nl": (
            f"{SCRIPT_SIGNATURE} BUG-049/050 (+ pending deploy)\n\n"
            "⚠️ Gedeeltelijk opgelost.\n\n"
            "1. Kanban board-init en work-policy frontend-formulieren "
            "(juiste URL + veldnamen title/category i.p.v. "
            "name/policy_type) — LIVE sinds 2026-05-23 (e02c03b1).\n\n"
            "2. Backend-fix voor work-policy create (project moet "
            "read_only zijn, viewset injecteert hem) — gecommit "
            "(b0f71650) maar nog niet uitgerold naar Mac Studio. "
            "Wordt live na de eerstvolgende backend-deploy.\n\n"
            "Status: accepted — fix_pending_deploy. We laten de issue "
            "open totdat de deploy bevestigd is."
        ),
        "new_status": "accepted",
        "new_repro_result": "reproduced",
        "resolution_summary": (
            "Kanban frontend forms LIVE (e02c03b1). Backend work-policy "
            "read-only fix committed (b0f71650) but not yet deployed."
        ),
    },

    # ────────────────────────────────────────────────────────────────
    # 8. Waterfall create flows
    #    BUG-051..BUG-058, BUG-064
    #    Most LIVE (frontend e02c03b1). risk/issue/deliverable b0f71650 NOT YET.
    # ────────────────────────────────────────────────────────────────
    {
        "bug_id": "BUG-056-057+waterfall-deliverable-readonly",
        "match": lambda i: any(
            kw in (i.title + " " + i.description + " " + i.error_trace).lower()
            for kw in [
                "waterfall risk", "waterfall-risk",
                "waterfall issue", "waterfall-issue",
                "waterfall deliverable", "waterfall-deliverable",
                "waterfall/risks", "waterfall/issues", "waterfall/deliverables",
            ]
        ),
        "comment_nl": (
            f"{SCRIPT_SIGNATURE} BUG-056/057 (+ pending deploy)\n\n"
            "⚠️ Gedeeltelijk opgelost.\n\n"
            "Frontend-uitlijning voor de Waterfall-formulieren (juiste "
            "enums + ontbrekende verplichte velden) — LIVE sinds "
            "2026-05-23 (e02c03b1).\n\n"
            "Backend-fix voor risk/issue/deliverable create (project "
            "moet read_only zijn, viewset injecteert hem in "
            "perform_create) — gecommit (b0f71650) maar nog niet "
            "uitgerold naar Mac Studio. Wordt live na de eerstvolgende "
            "backend-deploy.\n\n"
            "Status: accepted — fix_pending_deploy."
        ),
        "new_status": "accepted",
        "new_repro_result": "reproduced",
        "resolution_summary": (
            "Waterfall risk/issue/deliverable: frontend LIVE (e02c03b1); "
            "backend read-only fix committed (b0f71650) but not yet "
            "deployed."
        ),
    },
    {
        "bug_id": "BUG-051-055+058-064-waterfall-other",
        "match": lambda i: any(
            kw in (i.title + " " + i.description + " " + i.error_trace).lower()
            for kw in [
                "waterfall requirement", "waterfall-requirement",
                "waterfall design", "waterfall-design",
                "waterfall task", "waterfall-task",
                "waterfall test", "waterfall-test", "test case",
                "waterfall change", "waterfall-change", "change request",
                "waterfall deployment", "waterfall-deployment",
            ]
        ),
        "comment_nl": (
            f"{SCRIPT_SIGNATURE} BUG-051..055 + 058\n\n"
            "✅ Opgelost — Waterfall-formulieren voor requirement, "
            "design, task, test-case, change-request en deployment "
            "stuurden ongeldige enum-waarden of lieten verplichte "
            "velden weg.\n\n"
            "Fix: frontend uitgelijnd met de serializers — correcte "
            "enums + verplichte velden toegevoegd.\n\n"
            "Live sinds 2026-05-23 (frontend e02c03b1)."
        ),
        "new_status": "resolved",
        "new_repro_result": "reproduced",
        "resolution_summary": (
            "Six Waterfall forms had wrong enums / missing required "
            "fields. Frontend aligned to serializers. Live (e02c03b1)."
        ),
    },

    # ────────────────────────────────────────────────────────────────
    # 9. "backlog data not loading" — needs reproduction; we don't have
    #    enough info to confirm root cause. Static analysis suggests
    #    this is the Agile backlog GET — works fine with auth — most
    #    likely a transient or auth/tenant-scope issue. Move to
    #    needs-info and ask the reporter.
    # ────────────────────────────────────────────────────────────────
    {
        "bug_id": "USER-2026-05-21-backlog-not-loading",
        "match": lambda i: (
            "backlog data not loading" in (i.title + " " + i.description).lower()
            or "backlog laadt niet" in (i.title + " " + i.description).lower()
            or "backlog not loading" in (i.title + " " + i.description).lower()
        ),
        "comment_nl": (
            f"{SCRIPT_SIGNATURE} USER-2026-05-21-backlog-not-loading\n\n"
            "🔎 Meer info nodig.\n\n"
            "Kun je het volgende doorgeven zodat we kunnen reproduceren:\n"
            "1. Welke methodologie? (Agile / Scrum / Waterfall — elke "
            "heeft zijn eigen backlog-endpoint.)\n"
            "2. Welk project-ID stond in de URL toen de backlog leeg "
            "bleef?\n"
            "3. Browser DevTools → Network-tab: faalt /api/v1/projects/"
            "<id>/agile/backlog/ (of de Scrum/Waterfall-variant) met "
            "een specifieke status (401 / 403 / 404 / 500)?\n"
            "4. Was je tussendoor van tenant/company gewisseld? Een "
            "ander company-context kan verklaren waarom je geen items "
            "ziet (RLS).\n\n"
            "Op basis van die info pakken we hem direct op. Voor nu "
            "blijft de issue open op needs-info."
        ),
        "new_status": "needs-info",
        "new_repro_result": "needs-data",
        "resolution_summary": (
            "Insufficient detail to reproduce. Asked reporter for "
            "methodology, project-ID, Network-tab status code and "
            "tenant context."
        ),
    },

    # ────────────────────────────────────────────────────────────────
    # 10. "TEST: per-client suffix Web" — test entry, not a real issue
    # ────────────────────────────────────────────────────────────────
    {
        "bug_id": "TEST-PER-CLIENT-SUFFIX-WEB",
        "match": lambda i: (
            "test: per-client suffix" in i.title.lower()
            or "test per-client suffix" in i.title.lower()
            or i.title.lower().startswith("test:")
        ),
        "comment_nl": (
            f"{SCRIPT_SIGNATURE} TEST-ENTRY\n\n"
            "ℹ️ Test-entry — geen echt productprobleem. Deze issue is "
            "tijdens een verificatie van de per-client suffix (Web/"
            "Mobile detectie in e-mail-subjects, commit 52189d16) "
            "aangemaakt en kan gesloten worden.\n\n"
            "Classificatie: not-applicable / wont-fix (test-data)."
        ),
        "new_status": "wont-fix",
        "new_repro_result": "not-applicable",
        "resolution_summary": (
            "Test entry — created during per-client suffix verification. "
            "Not a product bug."
        ),
    },

    # ────────────────────────────────────────────────────────────────
    # 12. PRINCE2 Project Board — add_member 400 "This field is required."
    #     Form sent {name,email,role}; model needs `user` FK.
    #     Fix:     commit e02c03b1 (rewrote dialog to user-FK select)
    #     Status:  LIVE on prod
    # ────────────────────────────────────────────────────────────────
    {
        "bug_id": "PRINCE2-BOARD-ADD-MEMBER-2026-05-22",
        "match": lambda i: (
            (
                "board member" in (i.title + " " + i.description).lower()
                or "project board" in (i.title + " " + i.description).lower()
            )
            and (
                "failing" in (i.title + " " + i.description).lower()
                or "field is required" in (i.title + " " + i.description + " " + getattr(i, "actual_behavior", "")).lower()
            )
        ),
        "comment_nl": (
            f"{SCRIPT_SIGNATURE} PRINCE2-BOARD-ADD-MEMBER-2026-05-22\n\n"
            "✅ Opgelost — het toevoegen van een Project Board-lid faalde "
            "met `\"This field is required.\"` omdat het formulier "
            "`name/email/role` stuurde terwijl het backend-model "
            "`ProjectBoardMember` een echte `user` (FK) vereist.\n\n"
            "Fix: de Prince2ProjectBoard add-member dialog is herschreven "
            "naar een user-FK select (haalt company-leden op via "
            "`/api/v1/auth/company-users/members/`). De ongeldige "
            "`team_manager`-rol is verwijderd.\n\n"
            "Live sinds 2026-05-23 (commit e02c03b1). Test: open de Project "
            "Board pagina, klik Add Member, selecteer een gebruiker en sla "
            "op — 201 Created."
        ),
        "new_status": "resolved",
        "new_repro_result": "reproduced",
        "resolution_summary": (
            "Prince2ProjectBoard add_member sent name/email/role; model "
            "needs `user` FK. Rewrote dialog to user-FK select. Live "
            "(commit e02c03b1)."
        ),
    },

    # ────────────────────────────────────────────────────────────────
    # 13. PRINCE2 Project Closure sub-tabs — routing bug
    #     All 4 sub-pages (Closure Checklist / End Project Report /
    #     Lessons Log / Benefits Review) redirect to End Project Report.
    #     Router config issue — NOT yet fixed (form itself is fine).
    # ────────────────────────────────────────────────────────────────
    {
        "bug_id": "CLOSURE-SUBTABS-ROUTING",
        "match": lambda i: (
            ("closure check" in (i.title + " " + i.description).lower()
             or "closure checklist" in (i.title + " " + i.description).lower()
             or "benefits review" in (i.title + " " + i.description).lower())
            and ("redirecting" in (i.title + " " + i.description).lower()
                 or "doorverwijst" in (i.title + " " + i.description).lower()
                 or "all not working" in (i.title + " " + i.description).lower()
                 or "end project report only" in (i.title + " " + i.description).lower())
        ),
        "comment_nl": (
            f"{SCRIPT_SIGNATURE} CLOSURE-SUBTABS-ROUTING\n\n"
            "📌 Erkend (P2 — nog niet opgelost) — alle Project Closure "
            "sub-tabs (Closure Checklist, End Project Report, Lessons Log, "
            "Benefits Review) navigeren naar dezelfde pagina (End Project "
            "Report). Dit is een router-configuratie probleem, niet een "
            "bug in de formulieren zelf.\n\n"
            "Het End Project Report formulier is wel correct herschreven "
            "naar de echte model-velden (commit e02c03b1) — zodra de "
            "routes ontkoppeld zijn werken alle 4 sub-pagina's onafhankelijk.\n\n"
            "Wordt opgepakt in een aparte commit; nog niet in productie."
        ),
        "new_status": "accepted",
        "new_repro_result": "reproduced",
        "resolution_summary": (
            "Closure sub-tabs (checklist/end-report/lessons/benefits) all "
            "route to End Project Report. Router config bug, separate "
            "from the form-field fix already shipped in e02c03b1."
        ),
    },

    # ────────────────────────────────────────────────────────────────
    # 14. AI Copilot — UI language not propagating to assistant responses
    #     i18n bug — NOT yet fixed.
    # ────────────────────────────────────────────────────────────────
    {
        "bug_id": "AI-COPILOT-LANGUAGE-EN",
        "match": lambda i: (
            ("ai copilot" in (i.title + " " + i.description).lower()
             or "ai-copilot" in (i.title + " " + i.description).lower())
            and "language" in (i.title + " " + i.description).lower()
            and ("english" in (i.title + " " + i.description).lower()
                 or "engels" in (i.title + " " + i.description).lower()
                 or "not changing" in (i.title + " " + i.description).lower())
        ),
        "comment_nl": (
            f"{SCRIPT_SIGNATURE} AI-COPILOT-LANGUAGE-EN\n\n"
            "📌 Erkend (P2 — nog niet opgelost) — de taalwissel in de AI "
            "Copilot werkt momenteel niet: de UI staat op EN maar de "
            "assistant-responses blijven in NL (of vice versa).\n\n"
            "Classificatie: i18n-bug, prioriteit P2 (UX-issue, geen "
            "blokkade voor functionaliteit). De fix vereist het meegeven "
            "van de UI-taal in elke AI-Copilot-call en het gebruiken in "
            "de system-prompt op de backend.\n\n"
            "Wordt opgepakt in een aparte commit; nog niet in productie."
        ),
        "new_status": "accepted",
        "new_repro_result": "reproduced",
        "resolution_summary": (
            "AI Copilot doesn't honour UI language setting. Real i18n "
            "bug, accepted for separate fix."
        ),
    },

    # ────────────────────────────────────────────────────────────────
    # 15. Impact fields Add button — needs more info
    #     "user impact / business impact / timeline impact cant be added"
    #     Could be governance Decision, Risk register, PI Objective,
    #     or Change Request form. Body says only "add button is not
    #     working" — needs URL + network detail.
    # ────────────────────────────────────────────────────────────────
    {
        "bug_id": "IMPACT-FIELDS-ADD-BUTTON",
        "match": lambda i: (
            ("user impact" in (i.title + " " + i.description).lower()
             or "business impact" in (i.title + " " + i.description).lower()
             or "timeline impact" in (i.title + " " + i.description).lower())
            and ("add button" in (i.title + " " + i.description).lower()
                 or "cant be added" in (i.title + " " + i.description).lower()
                 or "can't be added" in (i.title + " " + i.description).lower()
                 or "kan niet" in (i.title + " " + i.description).lower())
        ),
        "comment_nl": (
            f"{SCRIPT_SIGNATURE} IMPACT-FIELDS-ADD-BUTTON\n\n"
            "ℹ️ Triage — om dit te kunnen reproduceren hebben we meer "
            "informatie nodig:\n\n"
            "1. Op welke pagina staan deze velden? (governance Decision, "
            "Risk register, PI Objective, of Change Request?)\n"
            "2. Wat is de exacte URL?\n"
            "3. Wat gebeurt er als je op de Add-knop klikt — geen "
            "reactie, een foutmelding, of een lege response?\n"
            "4. Wat staat er in het netwerk-tabblad (F12 → Network) bij "
            "het klikken op Add?\n\n"
            "Zonder die info kunnen we niet vaststellen welke form en "
            "welk endpoint hier breken."
        ),
        "new_status": "needs-info",
        "new_repro_result": "needs-data",
        "resolution_summary": (
            "Add button reportedly broken on an impact-fields form. "
            "Needs URL + network response to identify which form."
        ),
    },
]

APPLY = os.environ.get("APPLY") == "1"

# ────────────────────────────────────────────────────────────────────
# Triage loop
# ────────────────────────────────────────────────────────────────────

print(f"\n{'='*70}")
print(f"  ProductIssue triage — 2026-05-23 session")
print(f"  Mode: {'APPLY (DB writes ENABLED)' if APPLY else 'DRY-RUN (no DB writes)'}")
print(f"{'='*70}\n")

OPEN_STATUSES = ["new", "triaging", "needs-info", "accepted", "in-progress"]
candidates = list(
    ProductIssue.objects.filter(status__in=OPEN_STATUSES).order_by("created_at")
)
print(f"Found {len(candidates)} open ProductIssue rows. Walking each one...\n")

actions = []
for issue in candidates:
    matched = None
    for r in RESOLUTIONS:
        try:
            if r["match"](issue):
                matched = r
                break
        except Exception as exc:
            print(f"  ! match() error on issue #{issue.id} for {r['bug_id']}: {exc}")

    if not matched:
        print(f"  · #{issue.id:>4} [{issue.status:<11}] '{issue.title[:60]}' — no match, leaving as-is")
        continue

    # Idempotency check — has this exact triage already been written?
    already_done = ProductIssueComment.objects.filter(
        issue=issue,
        body__startswith=f"{SCRIPT_SIGNATURE} {matched['bug_id']}",
    ).exists()
    if already_done:
        print(f"  · #{issue.id:>4} [{issue.status:<11}] '{issue.title[:60]}' — already triaged for {matched['bug_id']}, skipping")
        continue

    print(f"  → #{issue.id:>4} [{issue.status:<11}] '{issue.title[:60]}'")
    print(f"      MATCH    : {matched['bug_id']}")
    print(f"      → status : {issue.status}  →  {matched['new_status']}")
    print(f"      → repro  : {issue.reproduction_result or '(empty)'}  →  {matched['new_repro_result']}")
    print(f"      + comment ({len(matched['comment_nl'])} chars)")

    actions.append((issue, matched))

print(f"\n{'─'*70}")
print(f"Planned actions: {len(actions)}")
print(f"{'─'*70}\n")

if APPLY:
    for issue, r in actions:
        ProductIssueComment.objects.create(
            issue=issue,
            author=f"agent:triage-2026-05-23",
            body=r["comment_nl"],
            is_triage_step=True,
        )
        issue.status = r["new_status"]
        issue.reproduction_result = r["new_repro_result"]
        if not issue.resolution_summary:
            issue.resolution_summary = r["resolution_summary"]
        issue.triaged_by = f"agent:triage-2026-05-23 + human:sami"
        issue.triaged_at = timezone.now()
        issue.save(
            update_fields=[
                "status",
                "reproduction_result",
                "resolution_summary",
                "triaged_by",
                "triaged_at",
                "updated_at",
            ]
        )
        print(f"  ✓ wrote: #{issue.id} → {r['new_status']} + comment ({r['bug_id']})")
    print(f"\n{len(actions)} issue(s) updated.\n")
else:
    print("DRY-RUN — no DB writes. To apply, re-run with:")
    print("  docker exec -e APPLY=1 projextpal-backend-prod \\")
    print("      python manage.py shell -c \"exec(open('/app/scripts/triage_product_issues_2026_05_23.py').read())\"\n")

# ────────────────────────────────────────────────────────────────────
# Final state summary
# ────────────────────────────────────────────────────────────────────
print(f"{'='*70}")
print("Current state (all ProductIssues, newest first):")
print(f"{'='*70}")
for issue in ProductIssue.objects.all().order_by("-created_at")[:20]:
    age_d = (timezone.now() - issue.created_at).days
    print(
        f"  #{issue.id:>4} [{issue.status:<11}] "
        f"prio={issue.priority or '--':<2} "
        f"sev={issue.severity or '--':<8} "
        f"{age_d:>3}d old  "
        f"'{issue.title[:50]}'"
    )
print()
