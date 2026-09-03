"""
Seed: keurmerk-projecten voor Inclufy in ProjeXtPal (methodiek PRINCE2).

Eén canonieke bron voor de 4 keurmerk-projecten (CRKBO, NRTO, Blik op Werk, NLQF).
IDEMPOTENT én RECONCILEREND: herhaald draaien maakt niets dubbel en verwijdert juist
stray milestones/taken/stages die niet in de spec staan, zodat élke omgeving
(productie + staging) exact dezelfde stand krijgt.

Per project wordt gezet:
  - Project           (code, naam, methodiek, status, budget, datums, health, teksten)
  - ProjectTeam(sami) (is_active=True)  -> zichtbaarheid in de projectenlijst
  - Milestone per fase (status)         -> reconciled tegen de spec
  - Task per milestone (progress)       -> DRIJFT de voortgang% op het dashboard
  - prince2.Stage per fase              -> per-fase teller

Voortgang% = gemiddelde van de task-progress per project
  (Project.compute_progress_from_work(): tasks aanwezig -> gemiddelde task-progress).

DRAAIEN op elke backend (prod op Hetzner, staging op de Studio):
    docker exec -i <projextpal-backend-container> python3 manage.py shell < seed_keurmerk_projects.py

Verwachte eindstand:  CRKBO 100% · NRTO 92% · Blik op Werk 42% · NLQF 48%.
"""
import datetime as _dt
from django.contrib.auth import get_user_model
from accounts.models import Company
from projects.models import Project, Milestone, Task, ProjectTeam, ProjectMembership
try:
    from prince2.models import Stage
except Exception:
    Stage = None

User = get_user_model()

OWNER_EMAIL = "sami@inclufy.com"
GREEN, AMBER, RED = "#22c55e", "#f59e0b", "#ef4444"


def D(y, m, d):
    return _dt.date(y, m, d)


# stage-tuple = (naam, milestone_status, progress_pct)
#   milestone_status ∈ {completed, in_progress, pending, on_hold}
#   progress_pct     = task-progress voor die fase (drijft het project-%)
PROJECTS = [
    {
        "code": "KM-CRKBO",
        "name": "CRKBO-registratie",
        "status": "completed",
        "budget": 555,
        "health": GREEN,
        "start": D(2026, 1, 15), "end": D(2026, 5, 26),
        "goal": "Erkenning als instelling voor Kort Beroepsonderwijs (CRKBO) verkrijgen en behouden, inclusief BTW-vrijstelling.",
        "scope_in": "Kwaliteitsdossier, instellingsaudit (CPION), registratie, BTW-vrijstelling.",
        "description": (
            "CRKBO-erkenning van Inclufy Academy. Instellingsaudit via CPION met succes afgerond; "
            "geregistreerd onder nr. 67622, geldig t/m 25-05-2030. Geeft recht op BTW-vrijstelling "
            "(art. 11 lid 1 sub o Wet OB 1968). RESULTAAT: behaald."
        ),
        "stages": [
            ("Initiatie & scoping", "completed", 100),
            ("Kwaliteitsdossier & CRKBO-kwaliteitscode", "completed", 100),
            ("Instellingsaudit (CPION)", "completed", 100),
            ("Registratie & toekenning (nr. 67622)", "completed", 100),
            ("Onderhoud & BTW-vrijstelling (t/m 25-05-2030)", "completed", 100),
        ],
    },
    {
        "code": "KM-NRTO",
        "name": "NRTO-keurmerk",
        "status": "in_progress",
        "budget": 702,
        "health": GREEN,
        "start": D(2026, 6, 1), "end": D(2026, 8, 31),
        "goal": "Het NRTO-keurmerk behalen en definitief laten registreren (kwaliteitslabel private opleiders).",
        "scope_in": "Aanvullende NRTO-audit, kwaliteitsdossier, B2C-voorwaarden, definitieve registratie.",
        "description": (
            "NRTO-keurmerk van Inclufy Academy. Bij de aanvullende NRTO-audit (CPION/LRQA, juli 2026) "
            "is vastgesteld dat volledig aan alle NRTO-eisen wordt voldaan. Lidnummer 5361; registratie "
            "loopt gelijk met CRKBO (t/m 25-05-2030). RESULTAAT: keurmerk behaald; definitieve registratie "
            "bij directie voor laatste handtekening + ledenportaal-toegang ontvangen (laatste stap)."
        ),
        "stages": [
            ("Initiatie & lidmaatschapsaanvraag", "completed", 100),
            ("Aanvullende NRTO-audit (CPION/LRQA)", "completed", 100),
            ("Kwaliteitsdossier & B2C-voorwaarden (jurist-akkoord)", "completed", 100),
            ("Keurmerk behaald — voldoet aan alle NRTO-eisen", "completed", 100),
            ("Definitieve registratie & ledenportaal-toegang", "in_progress", 60),
        ],
    },
    {
        "code": "KM-BOW",
        "name": "Blik op Werk - Keurmerk Arbeid",
        "status": "in_progress",
        "budget": 2228,
        "health": GREEN,
        "start": D(2026, 6, 1), "end": D(2027, 12, 31),
        "goal": "Het Blik op Werk Keurmerk Arbeid behalen: eerst Aspirant, daarna het volwaardige keurmerk na de meetperiode.",
        "scope_in": "Diensten 1/3/8/9 (scholing, diagnose/loopbaanoriëntatie, toeleiding naar werk, sociale activering & participatie).",
        "description": (
            "Blik op Werk Keurmerk Arbeid voor de re-integratie/UWV-markt. Aspirant-Keurmerk Arbeid "
            "toegekend op 19-08-2026. Meetperiode 01-09-2026 t/m 31-12-2027 (verlengde eerste meetperiode). "
            "RESULTAAT: Aspirant-Keurmerk behaald; volwaardig Keurmerk Arbeid volgt na resultaten- en "
            "tevredenheidsaudit (Panteia) en toekenning."
        ),
        "stages": [
            ("Verkenning & aanvraag Hoofdnorm 1 (diensten 1/3/8/9)", "completed", 100),
            ("Aspirant-Keurmerk Arbeid toegekend (19-08-2026)", "completed", 100),
            ("Meetperiode: 5 trajecten + tevredenheidsonderzoek (Panteia)", "in_progress", 10),
            ("Resultatenaudit (certificerende instelling)", "pending", 0),
            ("Toekenning volwaardig Keurmerk Arbeid", "pending", 0),
        ],
    },
    {
        "code": "KM-NLQF",
        "name": "NLQF-inschaling (Werken met Generatieve AI)",
        "status": "on_hold",
        "budget": 0,
        "health": AMBER,
        "start": D(2026, 6, 1), "end": None,
        "goal": "NLQF/EQF-3 niveau borgen voor de opleiding 'Werken met Generatieve AI'.",
        "scope_in": "Leeruitkomsten, examinering, arbeidsmarktrelevantie, inschaling (of via ROC-partner).",
        "description": (
            "NLQF-inschaling van de opleiding 'Werken met Generatieve AI' (niveau 3). Eigen NCP-inschaling "
            "STILGELEGD (19-08-2026): prijskaart ~EUR 4.100-5.800 + de ROC-route levert NLQF-niveau al gratis "
            "(mbo-keuzedeel). NCP-controlefeedback: aanvraag 'niet beoordeelbaar' (onderbouwing met formele, "
            "eigenstandige documenten). RESULTAAT: on hold; NLQF-claim loopt VIA PARTNER (ROC / mbo-certificaat)."
        ),
        "stages": [
            ("Dossier & leeruitkomsten NLQF-3", "completed", 100),
            ("Aanvraag ter controle (NCP NLQF) — feedback: niet beoordeelbaar", "on_hold", 40),
            ("Eigen inschaling (validiteit + inschaling) — stilgelegd (prijskaart)", "pending", 0),
            ("NLQF via ROC-partner (mbo-certificaat)", "in_progress", 50),
        ],
    },
]

STAGE_STATUS = {"completed": "completed", "in_progress": "active", "pending": "planned", "on_hold": "planned"}
# milestone-status -> task-status. task-progress komt uit de spec-pct.
TASK_STATUS = {"completed": "done", "in_progress": "in_progress", "pending": "todo", "on_hold": "todo"}
KM_CODES = [s["code"] for s in PROJECTS]


def run():
    owner = User.objects.filter(email__iexact=OWNER_EMAIL).first()
    if not owner:
        print(f"FOUT: gebruiker {OWNER_EMAIL} niet gevonden.")
        return

    # De keurmerk-projecten horen bij de EIGEN company van de eigenaar (sami) — dat is
    # wat de site toont. Een naam-lookup is fout gebleken: 'Inclufy' matcht ook
    # 'Inclufy (retired - merged into Business Solutions)' -> projecten in de verkeerde tenant.
    company = None
    if getattr(owner, "company_id", None):
        company = Company.objects.filter(id=owner.company_id).first()
    if not company:
        company = (Company.objects.filter(name__iexact="Inclufy").first()
                   or Company.objects.filter(name__icontains="Inclufy").first())
    if not company:
        print("FOUT: geen company voor de eigenaar gevonden. Beschikbare companies:")
        for cid, cname in Company.objects.values_list("id", "name"):
            print(f"   - id={cid}  name={cname!r}")
        return

    print(f"Company: {company.name} (id={company.id}) · eigenaar: {owner.email} (id={owner.id})\n")

    # Ruim eerdere mis-seeds op: KM-gecodeerde duplicaten in ANDERE companies.
    # Best-effort: een ProjectActivity-signal bij delete kan een FK-fout geven; die
    # duplicaten staan in een retired company (onzichtbaar), dus overslaan mag.
    from django.db import transaction as _txn
    for sp in list(Project.objects.filter(project_code__in=KM_CODES).exclude(company=company)):
        sid, sname, scomp = sp.id, sp.name, sp.company_id
        try:
            with _txn.atomic():
                sp.activities.all().delete()  # dependent activity-rows eerst (FK zonder cascade)
        except Exception:
            pass
        try:
            with _txn.atomic():
                sp.delete()
            print(f"  ✗ duplicaat verwijderd: proj {sid} {sname!r} (company {scomp})")
        except Exception as e:
            print(f"  ⚠ duplicaat {sid} ({sname!r}) niet verwijderd — laat staan (onzichtbaar): {e.__class__.__name__}")

    for spec in PROJECTS:
        # match binnen de eigen company op code OF naam (bestaande rijen hebben soms lege code)
        proj = (Project.objects.filter(company=company, project_code=spec["code"]).first()
                or Project.objects.filter(company=company, name=spec["name"]).first())
        created = proj is None
        if proj is None:
            proj = Project(company=company, project_code=spec["code"], created_by=owner)
        proj.project_code = spec["code"]
        # idempotente refresh van de kernvelden
        proj.name = spec["name"]; proj.methodology = "prince2"; proj.status = spec["status"]
        proj.budget = spec["budget"]; proj.currency = "EUR"
        proj.description = spec["description"]; proj.project_goal = spec["goal"]
        proj.scope_in = spec.get("scope_in", "")
        proj.start_date = spec["start"]; proj.end_date = spec.get("end")
        if proj.created_by_id is None:
            proj.created_by = owner
        for f in ("health_scope", "health_time", "health_cost", "health_cash_flow",
                  "health_safety", "health_risk", "health_quality"):
            setattr(proj, f, spec["health"])
        proj.save()

        # zichtbaarheid in de projectenlijst (accessible_project_ids -> ProjectTeam actief)
        pt, _ = ProjectTeam.objects.get_or_create(
            project=proj, user=owner, defaults=dict(is_active=True, added_by=owner))
        if not pt.is_active:
            pt.is_active = True
            pt.save(update_fields=["is_active"])
        ProjectMembership.objects.get_or_create(
            project=proj, user=owner,
            defaults=dict(role="project_owner", is_primary=True, responsibilities="Executive / Project Owner (PRINCE2)"),
        )

        spec_names = [s[0] for s in spec["stages"]]

        # RECONCILE: verwijder milestones (en via cascade hun taken) die niet in de spec staan
        stray = Milestone.objects.filter(project=proj).exclude(name__in=spec_names)
        n_stray = stray.count()
        if n_stray:
            stray.delete()

        for i, (mname, mstatus, pct) in enumerate(spec["stages"], start=1):
            ms, _ = Milestone.objects.get_or_create(
                project=proj, name=mname, defaults=dict(status=mstatus, order_index=i))
            Milestone.objects.filter(pk=ms.pk).update(status=mstatus, order_index=i)

            # exact één task per milestone (deze taken drijven het project-%)
            tasks = list(Task.objects.filter(milestone=ms).order_by("id"))
            if not tasks:
                Task.objects.create(
                    milestone=ms, title=mname, assigned_to=owner,
                    status=TASK_STATUS.get(mstatus, "todo"), progress=pct,
                    priority="medium", due_date=spec.get("end"))
            else:
                keep = tasks[0]
                for extra in tasks[1:]:
                    extra.delete()
                Task.objects.filter(pk=keep.pk).update(
                    title=mname, assigned_to=owner,
                    status=TASK_STATUS.get(mstatus, "todo"), progress=pct)

            if Stage is not None:
                sstatus = STAGE_STATUS.get(mstatus, "planned")
                st, _ = Stage.objects.get_or_create(
                    project=proj, name=mname,
                    defaults=dict(order=i, status=sstatus, progress_percentage=pct))
                Stage.objects.filter(pk=st.pk).update(order=i, status=sstatus, progress_percentage=pct)

        if Stage is not None:
            Stage.objects.filter(project=proj).exclude(name__in=spec_names).delete()

        try:
            pct_total = proj.compute_progress_from_work()
        except Exception as e:
            pct_total = f"? ({e})"
        tcount = Task.objects.filter(milestone__project=proj).count()
        flag = "NIEUW" if created else "bijgewerkt"
        extra = f" · {n_stray} stray opgeruimd" if n_stray else ""
        print(f"[{flag}] {proj.name}  ·  status={proj.status}  ·  voortgang={pct_total}%  ·  {tcount} taken{extra}")

    print("\nKlaar. Keurmerk-projecten staan onder Inclufy (PRINCE2). Verwacht: CRKBO 100 · NRTO 92 · BoW 42 · NLQF 48.")


run()
