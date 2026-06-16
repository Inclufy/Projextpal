# Inclufy cross-app financial documents — shared contract

One contract for any Inclufy app (ProjeXtPal, Ignite, IQ Helix, Marketing,
AMOS) to push **financial documents** into Inclufy Finance: **quotes
(offertes), invoices (facturen), orders, receipts (ontvangsten)** — each with
the **customer/relation** and the **origin** (`source`) attached.

Transport reuses the existing generic cross-app webhook channel
(`cross-app-webhook-receive` on Finance). No new transport is invented; this doc
only fixes the **event names + payload shapes** so every app is interchangeable.

## Transport (unchanged)

```
POST {FINANCE_SUPABASE_URL}/functions/v1/cross-app-webhook-receive
Headers:
  X-Inclufy-Webhook-Token : <shared secret for this (org, app) endpoint>
  X-Inclufy-Signature     : hex( HMAC-SHA256(secret, raw_body) )
  X-Inclufy-Event         : <event name, see below>
  X-Inclufy-Source        : projextpal | ignite | helix | marketing | amos
Body (envelope):
  { event, occurred_at, organization_id, delivery_id, idempotency_key, payload }
```

The receiver matches the secret → `webhook_endpoints` row (direction inbound) →
that row's `organization_id` + `target_app`. So the **sending app never needs to
know Finance's org UUID** — the secret maps to it. `idempotency_key` makes
re-sends safe (the handler upserts on `(source, external_id)`).

## Events

| Event             | Finance table     | Meaning                          |
| ----------------- | ----------------- | -------------------------------- |
| `quote.created`   | `quotes`          | Offerte uit de bron-app          |
| `invoice.created` | `invoices`        | Factuur (receivable) uit bron-app |
| `order.created`   | `sales_orders`    | Verkooporder uit bron-app        |
| `receipt.created` | `payments`/receipts | Ontvangst/betaling uit bron-app |

A `*.updated` variant may follow later with the same payload + the same
`external_id` (handlers upsert, never duplicate).

## Payload schema (per event)

```jsonc
{
  "external_id": "PXP-Q-2026-0007",        // the source app's own document id (idempotency)
  "source": "projextpal",                   // origin — also in X-Inclufy-Source
  "origin_url": "https://projextpal.com/admin/pricing-configurator", // deep link back (optional)
  "currency": "EUR",
  "issued_at": "2026-06-16T09:00:00Z",
  "valid_until": "2026-07-16",              // quotes; null for invoices/orders
  "customer": {                              // klant/relatie — upserted on (org, email) or (org, source, external_id)
    "external_id": "PXP-CUST-42",
    "name": "Bedrijf BV",
    "email": "inkoop@bedrijf.nl",
    "vat_number": "NL000099998B57",
    "address": { "line1": "...", "postal_code": "...", "city": "...", "country": "NL" }
  },
  "lines": [
    { "sku": "PXP-PRO", "name": "Professional", "qty": 10, "unit": "per_user_month",
      "unit_price_cents": 4900, "line_total_cents": 49000, "period": "/maand", "tax_rate": 21 }
  ],
  "totals": { "subtotal_cents": 49000, "tax_cents": 10290, "total_cents": 59290 },
  "notes": "optioneel"
}
```

Money is sent in **integer cents** to avoid float drift. `tax_rate` is a percent
(21 = 21%). `unit` is free text from the source catalog (`per_user_month`,
`monthly`, `one_off`, …) — Finance stores it verbatim on the line.

## Finance handler behaviour (per event)

1. **Upsert customer/relation** in the endpoint's `organization_id`, matched on
   `(organization_id, lower(email))` first, else `(organization_id, source,
   customer.external_id)`. Tag `source`.
2. **Upsert the document** on `(organization_id, source, external_id)` → never
   duplicates on re-send. Store `source`, `origin_url`, lines, totals, status
   `draft` (quotes/orders) or `open` (invoices). Link the customer.
3. Log to `webhook_deliveries` (the transport already does this) and return 200.

Documents land tagged with `source` so Finance can show "via ProjeXtPal" and
filter/report by origin.

## Per-app onboarding (makes it generic for ALL apps)

For each app × Finance-org, create one inbound `webhook_endpoints` row:

```sql
insert into public.webhook_endpoints
  (organization_id, target_app, direction, secret, enabled_events, active)
values
  ('<finance-org-uuid>', 'projextpal', 'inbound', '<random-secret>',
   array['quote.created','invoice.created','order.created','receipt.created'], true);
```

The sending app stores the **same secret** + the Finance functions URL in its own
server config (never hardcoded, never shipped to the browser):

- ProjeXtPal: `FINANCE_CROSS_APP_URL`, `FINANCE_CROSS_APP_SECRET` in backend `.env`.
- Other apps: the equivalent server-side secret store.

Because the event names + payloads are identical, onboarding a new app =
(1) add its `webhook_endpoints` row, (2) point its connector at the same
contract. No Finance code change per app.
