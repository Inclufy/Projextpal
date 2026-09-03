# Inclufy Finance integratie-API

Server-kant van het pull/push-contract waarvan **Inclufy Finance** (Supabase
edge function `projextpal-sync`, elk uur via pg_cron) de client is.

## Endpoints (`/api/v1/integration/`)

| Methode | Pad | Inhoud |
| --- | --- | --- |
| GET | `documents/time-expense?since=&limit=` | Urenregistraties (`TimeEntry`) mét actuele goedkeuringsstatus. Finance materialiseert alléén `approved` naar zijn urenadministratie en verwijdert de materialisatie weer wanneer een goedkeuring wordt teruggedraaid. |
| GET | `documents/project-actuals` | Projecten + goedgekeurde uren/arbeidskosten-aggregaten. |
| GET | `documents/milestone-progress?since=&limit=` | Milestones per project. |
| POST | `documents/cost-centers` | Finance-masterdata → `FinanceInboundDocument`. |
| POST | `documents/budgets` | Finance-masterdata → `FinanceInboundDocument`. |

Responsevormen volgen de Finance-client exact:
GET → `{"documents": [{external_id, external_name, payload, updated_at}], "cursor"}`;
POST → `{"accepted", "rejected", "results": [{external_id, status, message?}]}`.
`since` is een ISO-timestamp (high-watermark op `updated_at`).

## Authenticatie

`Authorization: Bearer pxp_live_…` — per Company uitgegeven; alleen de
sha256-hash staat in de database (`FinanceIntegrationApiKey`).

Sleutel uitgeven (eenmalig zichtbaar):

```bash
python manage.py create_finance_api_key --company 1 --name "Inclufy Finance"
```

Finance-kant configureren:

```bash
supabase secrets set PROJEXTPAL_API_KEY='<sleutel>' --project-ref nruqfegrngpzoigflexn
supabase secrets set PROJEXTPAL_INTEGRATION_URL='https://projextpal.com/api/v1/integration' --project-ref nruqfegrngpzoigflexn
```

## Koppeling met Finance-projecten

Finance matcht uren op `projects.projextpal_project_id` (= ProjeXtPal
`Project.id` als string, meegegeven als `payload.project_external_id`),
met exacte projectnaam-match als fallback.
