# iOS 1.2.1 — App Review rejection fixes (2026-08-13)

Submission ID: `fa0181c8-82bb-43a8-9499-9263c0296eb3` — review device iPad Air 11-inch.
Branch: `mobile/1.2.1-app-review-fixes` (vanaf `master`). Alle screenshots zijn
gemaakt op een iPad Air 11-inch (M2) simulator met Expo tegen een lokale backend.

## 1. Account deletion — Guideline 5.1.1(v)

Flow (soepel demonstreerbaar voor de vereiste schermopname):

Profiel → **Privacy & Beveiliging** → **Account verwijderen** → uitleg + optionele
data-export (AVG art. 15) → typ `DELETE` → rode knop → destructive confirm-alert →
`DELETE /api/v1/auth/me/delete/` (AVG art. 17, anonymisatie + 30 dagen grace) →
succes-alert met definitieve-verwijderdatum → automatische logout naar login.

Ook bereikbaar via Settings → Account → Account verwijderen.

Bewijs: `after/04-privacy.png` t/m `after/08-delete-success.png`; backend-verificatie:
user geanonimiseerd (`deleted-user-<id>@deleted.projextpal.com`, `is_active=False`).

## 2. Org-only login — Guidelines 3.1.1 + 3.1.3(c)

- Register-, TrialRegistration- en Pricing-schermen volledig verwijderd.
- "Nog geen account? Registreren" vervangen door uitleg dat accounts door de
  organisatie worden aangemaakt (`after/01-login.png` vs `before/01-login.png`).
- "Abonnement Upgraden"-menu-item verwijderd (`after/03-profile.png` vs
  `before/03-profile.png`). Geen prijzen/abonnementen meer in de app.
- Wachtwoord-vergeten/reset intact.

## 3. Typografie / iPad — Guideline 4

- Minimale fontgroottes: 11pt (badges) / 12pt (labels), app-breed.
- Contrast secundaire tekst: `#9CA3AF` → `#6B7280`; inactieve tab-tint idem.
- Loginformulier gecapt op 560pt breed (gecentreerd) op tablets; Delete/Privacy
  content-kolommen max 600pt.

## Vervolg (mobile-deploy-engineer)

Niet gebouwd/gesubmit. Release 1.2.1 gaat via de mobile-deploy-engineer zodra
Apple op de bugfix-reply voor 1.2.0 heeft gereageerd. `app.json` staat al op
1.2.1 (buildNumber nog op 45 — ophogen bij de build).
