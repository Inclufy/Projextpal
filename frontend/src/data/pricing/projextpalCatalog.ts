// ============================================================================
// ProjeXtPal canonical price catalog — single source of truth for the admin
// pricing configurator + quotes. Prices are in lock-step with the Inclufy
// Finance product catalog (SKUs PXP-*) and the public Pricing.tsx tiers.
// Any price change here MUST be mirrored in Finance + Pricing.tsx.
// Currency: EUR, ex VAT.
// ============================================================================

export type Unit = 'per_user_month' | 'monthly' | 'one_off';

export interface CatalogItem {
  sku: string;
  name: string;
  price: number;          // recurring (per_user_month / monthly) OR one-off amount
  unit: Unit;
  setup?: number;         // optional one-time setup on top of a recurring item
  description?: string;
}

// — Licence tiers (per user / month) ----------------------------------------
export const LICENCE_TIERS: CatalogItem[] = [
  { sku: 'PXP-STARTER',      name: 'Starter',      price: 25,  unit: 'per_user_month', description: 'Voor kleine teams die starten' },
  { sku: 'PXP-PRO',          name: 'Professional', price: 49,  unit: 'per_user_month', description: 'Gantt, planning, methodieken' },
  { sku: 'PXP-BUSINESS',     name: 'Business',     price: 79,  unit: 'per_user_month', description: 'Portfolio + resource planning' },
  { sku: 'PXP-ENTERPRISE',   name: 'Enterprise',   price: 120, unit: 'per_user_month', description: 'White-label, SSO, SLA' },
];

// — Hosting & data-sovereignty tiers (one per tenant) -----------------------
export const HOSTING_TIERS: CatalogItem[] = [
  { sku: 'PXP-HOST-T1', name: 'Shared Cloud (standaard)',          price: 0,    unit: 'monthly', setup: 0 },
  { sku: 'PXP-HOST-T2', name: 'Dedicated Tenant',                  price: 395,  unit: 'monthly', setup: 2500 },
  { sku: 'PXP-HOST-T3', name: 'Customer Cloud (AWS/Azure/GCP)',    price: 795,  unit: 'monthly', setup: 8500 },
  { sku: 'PXP-HOST-T4', name: 'On-Premise / Dedicated Server',     price: 1495, unit: 'monthly', setup: 15000 },
  { sku: 'PXP-HOST-T5', name: 'Sovereign / Air-Gapped',            price: 2495, unit: 'monthly', setup: 35000 },
];

// — Recurring add-ons (per month) -------------------------------------------
export const ADDONS: CatalogItem[] = [
  { sku: 'PXP-AI-MINUTES',  name: 'AI Meeting Minutes',                 price: 29,  unit: 'monthly' },
  { sku: 'PXP-COMPLIANCE',  name: 'Enterprise Compliance Pack',         price: 199, unit: 'monthly' },
  { sku: 'PXP-EXPORT-PACK', name: 'Country-specific Export Templates',  price: 39,  unit: 'monthly' },
  { sku: 'PXP-GOVERNANCE',  name: 'PMO Governance Pack',                price: 99,  unit: 'monthly' },
  { sku: 'PXP-LSS',         name: 'LSS Black/Green add-on',             price: 99,  unit: 'monthly' },
  { sku: 'PXP-MSP',         name: 'MSP programme add-on',               price: 149, unit: 'monthly' },
  { sku: 'PXP-PRINCE2',     name: 'PRINCE2 + Highlight Reports add-on', price: 79,  unit: 'monthly' },
];

// — Setup & implementation (one-off) ----------------------------------------
export const SETUP: CatalogItem[] = [
  { sku: 'PXP-FIRST-PROJECTS-SETUP', name: 'Eerste 3 projecten samen inrichten', price: 2950, unit: 'one_off' },
  { sku: 'PXP-PMO-LAUNCH',           name: 'PMO launch package',                 price: 5950, unit: 'one_off' },
  { sku: 'PXP-SVC-AWS',              name: 'AWS dedicated hosting setup',        price: 5000, unit: 'one_off' },
];

// — Training (one-off) ------------------------------------------------------
export const TRAINING: CatalogItem[] = [
  { sku: 'PXP-TRAINING-AGILE-COACH',         name: 'Agile Coach / Scrum Master',            price: 2450, unit: 'one_off' },
  { sku: 'PXP-TRAINING-LSS-BLACK-BELT',      name: 'Lean Six Sigma Black Belt',             price: 4950, unit: 'one_off' },
  { sku: 'PXP-TRAINING-LSS-GREEN-BELT',      name: 'Lean Six Sigma Green Belt',             price: 2950, unit: 'one_off' },
  { sku: 'PXP-TRAINING-MSP-FOUNDATION',      name: 'MSP Foundation (Managing Successful Programmes)', price: 1950, unit: 'one_off' },
  { sku: 'PXP-TRAINING-PRINCE2-AGILE',       name: 'PRINCE2 Agile Foundation + Practitioner', price: 1950, unit: 'one_off' },
  { sku: 'PXP-TRAINING-PRINCE2-PRACTITIONER', name: 'PRINCE2 Practitioner cert-prep',        price: 1450, unit: 'one_off' },
];

// — Consultancy (one-off) ---------------------------------------------------
export const CONSULTANCY: CatalogItem[] = [
  { sku: 'PXP-METHODOLOGY-WORKSHOP', name: 'Methodology selection workshop', price: 1950, unit: 'one_off' },
  { sku: 'PXP-SVC-DPIA',             name: 'DPIA-review + GDPR consult',     price: 2500, unit: 'one_off' },
];

export const CATALOG_SECTIONS = [
  { key: 'addons',      title: 'Add-ons (per maand)',  items: ADDONS },
  { key: 'setup',       title: 'Setup & implementatie', items: SETUP },
  { key: 'training',    title: 'Training',              items: TRAINING },
  { key: 'consultancy', title: 'Consultancy',           items: CONSULTANCY },
] as const;

export const eur = (n: number) =>
  new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Math.round(n));
