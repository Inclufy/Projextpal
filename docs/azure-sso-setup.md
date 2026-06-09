# Azure / Entra ID SSO — activation guide

ProjeXtPal ships a **config-gated** Azure SSO (OIDC). It is **OFF by default** and
changes nothing about the existing login until you set the four env vars below.
Token validation is handled by Microsoft's official `msal` library.

## 1. Register the app in Entra ID (Azure portal)
1. Entra ID → App registrations → **New registration**.
2. Redirect URI (type *Web*): `https://api.projextpal.com/api/v1/auth/sso/azure/callback/`
3. Note the **Application (client) ID** and **Directory (tenant) ID**.
4. Certificates & secrets → **New client secret** → copy the value.
5. API permissions: Microsoft Graph → delegated → `User.Read` (+ `openid`, `email`, `profile`).

## 2. Set the env vars (Mac Studio `.env`)
```
AZURE_SSO_CLIENT_ID=<application-client-id>
AZURE_SSO_CLIENT_SECRET=<client-secret-value>
AZURE_SSO_TENANT_ID=<directory-tenant-id>
AZURE_SSO_REDIRECT_URI=https://api.projextpal.com/api/v1/auth/sso/azure/callback/
# Optional — auto-provision unknown users (default: invite-first, safer):
# AZURE_SSO_AUTO_CREATE=true
```

## 3. Rebuild the backend (installs msal) + restart
```bash
cd ~/Desktop/ProjextPal
docker build -t registry.gitlab.com/inclufy/projextpal/backend:latest ./backend
docker compose -f docker-compose.production.yml up -d --force-recreate backend
```

## 4. Verify
- `GET https://api.projextpal.com/api/v1/auth/sso/config/` → `{"azure_enabled": true}`.
- The **"Sign in with Microsoft"** button appears on the login page.
- Click it → Microsoft consent → you land back signed in.

## Behaviour & safety
- **Invite-first by default:** an SSO login only succeeds for a user that already
  exists (matched by email). Set `AZURE_SSO_AUTO_CREATE=true` to auto-create
  (role `guest`) — only do this for a single trusted tenant.
- Inactive users are rejected.
- Every SSO login is written to the audit log (`auth.sso_login`).
- The backend redirects to `FRONTEND_URL/sso/callback?access=…&refresh=…`; the
  SPA stores the tokens and lands on the dashboard. Error cases redirect to
  `/login?sso_error=…`.

## Endpoints
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/v1/auth/sso/config/` | public | is SSO enabled? |
| GET | `/api/v1/auth/sso/azure/login/` | public | 302 → Microsoft |
| GET | `/api/v1/auth/sso/azure/callback/` | public | exchange code → JWT → SPA |

> Not yet tested against a live tenant in this repo — verify the round-trip in a
> staging tenant before announcing it to customers.
