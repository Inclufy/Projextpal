# ProjeXtPal ↔ Inclufy Finance integration

End-to-end view of how ProjeXtPal exchanges suppliers / vendors / invoices /
booking entries / cost data with the Inclufy Finance product.

```
+--------------------+      pull (sync command, manual trigger)      +---------------------+
|                    | <--------------------------------------------- |                     |
|   ProjeXtPal       |                                                |  Inclufy Finance    |
|  (Django+Postgres) |                                                |  (Supabase Postgres |
|                    | ---------------------------------------------> |   + Edge Functions) |
|                    |    push (project_code / program_code)          |                     |
|                    |                                                |                     |
|                    | <--------------------------------------------- |                     |
|                    |     webhook (invoice.created / .updated)       |                     |
+--------------------+                                                +---------------------+
```

There are **three flows**:

1. **PULL-SYNC** — ProjeXtPal queries Inclufy Finance Supabase REST API and
   reconciles into the local `finance` app.
2. **WEBHOOK PUSH** — Inclufy Finance Edge Function calls a ProjeXtPal
   endpoint when an invoice is created/updated/paid. Real-time, low-latency.
3. **PROJECT_CODE PUSH-BACK** — when a Project or Program is created or
   renamed in ProjeXtPal, a Django signal pushes the metadata to a
   `projextpal_projects` / `projextpal_programs` table in Finance so
   bookkeepers see the up-to-date list.

## 1. Configuration

### ProjeXtPal env vars (Django settings)

```bash
# Required to enable any Inclufy Finance integration
INCLUFY_FINANCE_SUPABASE_URL=https://nruqfegrngpzoigflexn.supabase.co
INCLUFY_FINANCE_SUPABASE_SERVICE_KEY=<service-role key, server-only>

# Required for inbound webhook
INCLUFY_FINANCE_WEBHOOK_SECRET=<shared random string, ~64 chars>

# Set to "true" to enable outbound project_code push to Finance
INCLUFY_FINANCE_PUSH_ENABLED=false
```

Settings are read in `backend/core/settings.py` (search for "Inclufy Finance integration").

### Inclufy Finance secrets (Supabase)

```bash
PROJEXTPAL_WEBHOOK_URL=https://projextpal.com/api/v1/finance/webhooks/inclufy/
PROJEXTPAL_WEBHOOK_SECRET=<same value as INCLUFY_FINANCE_WEBHOOK_SECRET>
PROJEXTPAL_COMPANY_ID=<integer Company.id in ProjeXtPal>
```

Set these as Edge Function secrets via `supabase secrets set ...`.

## 2. Pull-sync — admin or scheduled

### CLI

```bash
# One company, last 24h (default since)
python manage.py sync_inclufy_finance --company 1

# All companies, since a specific date
python manage.py sync_inclufy_finance --all-companies --since 2026-04-01

# Dry-run (show counts, don't write)
python manage.py sync_inclufy_finance --company 1 --dry-run
```

Schedule via cron / Celery beat / GitLab pipeline schedule. Suggested cadence:
hourly for active development, daily in production once webhooks are in place.

### HTTP

```bash
curl -X POST https://projextpal.com/api/v1/finance/sync/inclufy/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"company_id": 1, "since": "2026-04-01T00:00:00"}'
```

Returns:

```json
{
  "since": "2026-04-01T00:00:00",
  "results": {
    "1": {
      "vendors_created": 4,
      "vendors_updated": 12,
      "invoices_created": 23,
      "invoices_updated": 5,
      "invoice_lines_created": 67,
      "bookings_recorded": 18,
      "errors": []
    }
  }
}
```

## 3. Project-code matching

For a Finance invoice to land on the correct ProjeXtPal Project, the project
must have a non-empty `project_code` AND the invoice must reference that code
in either:

- `invoices.description`: `[P-2026-001] April consulting hours`
- `invoices.description`: `P-CODE: P-2026-001 — Acme deliverables`
- `invoices.entity_name`: any of the above patterns

If no match is found, the invoice is created with `project=null` and a
non-empty `project_code` field — admins can then assign it via the UI later.

For programmes the same logic applies with `program_code`.

## 4. Webhook (push from Finance to ProjeXtPal)

Endpoint: `POST /api/v1/finance/webhooks/inclufy/`

Authentication (one of):
- `X-Inclufy-Webhook-Token: <shared secret>` — simple MVP path
- `X-Inclufy-Signature: <hex hmac-sha256 of body>` — preferred

Payload:

```json
{
  "event": "invoice.created",
  "company_id": 1,
  "invoice": { "id": "uuid", "invoice_number": "INV-2026-042", "...": "..." },
  "supplier": { "id": "uuid", "name": "Acme BV", "...": "..." },
  "lines":   [ {"description": "...", "quantity": 1, "unit_price": "100.00"} ]
}
```

Response:

```json
{ "ok": true, "invoice_id": 42, "created": true, "lines_added": 3 }
```

The Edge Function in Inclufy Finance lives at
`supabase/functions/sync-to-projextpal/`. A trigger on `public.invoices`
fires the function on insert and on status/total_amount/paid_amount updates,
skipping drafts.

## 5. Push-back: project_code → Finance

When `INCLUFY_FINANCE_PUSH_ENABLED=true`:

- After every Project save with a non-empty `project_code`, a row is
  upserted into Finance `public.projextpal_projects` (REST,
  Prefer: resolution=merge-duplicates).
- After every Program save with a non-empty `program_code`, similarly
  pushed to `public.projextpal_programs`.

Failure is logged via `finance` logger and the local save proceeds — the
external sync is best-effort.

## 6. Models touched

| ProjeXtPal model | Inclufy Finance origin |
|---|---|
| `finance.Vendor` | `public.suppliers` |
| `finance.Invoice` | `public.invoices` (only `invoice_type='payable'`) |
| `finance.InvoiceLineItem` | `public.invoice_lines` |
| `finance.InvoicePayment` | `public.booking_entries` linked to the invoice |
| `projects.Project.project_code` | `public.projextpal_projects` (push-back) |
| `programs.Program.program_code` | `public.projextpal_programs` (push-back) |

## 7. Failure handling

- The pull-sync catches per-record exceptions and continues; the response
  includes an `errors` array.
- The webhook catches per-line-item exceptions but FAILS the whole
  request if vendor or invoice upsert errors. Callers should retry on
  5xx.
- The push-back signal swallows network errors and logs a warning.
- The Finance Edge Function logs failures into
  `public.projextpal_sync_log` for retry (see Finance repo docs).

## 8. Testing

After deploy:

```bash
# 1. From ProjeXtPal — pull last hour
python manage.py sync_inclufy_finance --company 1 --since 2026-04-29T00:00

# 2. Check what's in
GET /api/v1/finance/invoices/?source=import_api

# 3. Cost rollup on a project
GET /api/v1/finance/projects/5/cost-summary/

# 4. From Finance side — fake webhook
curl -X POST https://projextpal.com/api/v1/finance/webhooks/inclufy/ \
  -H "X-Inclufy-Webhook-Token: $WEBHOOK_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"event":"invoice.created","company_id":1,"invoice":{"id":"abc","invoice_number":"TEST-1","invoice_date":"2026-04-29","total_amount":"100.00"}}'
```

## 9. Roadmap

- [ ] Bidirectional reconciliation report (compare ProjeXtPal totals with
  Finance totals per project, flag gaps).
- [ ] Multi-tenant Finance (Inclufy Finance becomes multi-tenant) — replace
  the single `PROJEXTPAL_COMPANY_ID` env var with a mapping table.
- [ ] Map Finance `purchase_orders` → ProjeXtPal `Invoice.purchase_order`.
- [ ] Map Finance `cost_centers` → ProjeXtPal Project / Program metadata.
- [ ] Replace REST polling with Supabase Realtime subscription for
  near-instant updates.
