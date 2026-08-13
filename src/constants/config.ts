/**
 * @deprecated This module is a thin re-export shim around `src/services/api.ts`.
 *
 * Historical context: this file was the original mobile API config and diverged
 * from the canonical `src/services/api.ts`. As of the 2026-04-28 mobile parity
 * audit, 12 of its endpoints returned 404 in production. To eliminate the
 * shadow-config maintenance hazard, we now re-export the canonical config.
 *
 * Prefer importing directly from `../services/api`:
 *   import { API_CONFIG } from '../services/api';
 *
 * The endpoints below extend the canonical map with a small set of
 * non-canonical-but-wired endpoints used only by `authService.ts`
 * (forgot-password / reset-password / verify-email / change-password /
 * update-profile). Subscription and registration endpoints were removed for
 * the org-only 1.2.1 release (App Review 3.1.1/3.1.3(c)); dead admin
 * endpoints were dropped earlier — callers should fail gracefully or be removed.
 */
import { API_CONFIG as CANONICAL_API_CONFIG, APP_CONFIG as CANONICAL_APP_CONFIG } from '../services/api';

export const API_CONFIG = {
  ...CANONICAL_API_CONFIG,
  ENDPOINTS: {
    ...CANONICAL_API_CONFIG.ENDPOINTS,

    // Auth extras still wired on backend (verified 2026-04-28)
    FORGOT_PASSWORD: '/api/v1/auth/forgot-password/',
    RESET_PASSWORD: (token: string) => `/api/v1/auth/reset-password/${token}/`,
    VERIFY_EMAIL: (token: string) => `/api/v1/auth/verify-email/${token}/`,
    RESEND_VERIFICATION: '/api/v1/auth/resend-verification/',
    CHANGE_PASSWORD: '/api/v1/auth/user/change-password/',
    UPDATE_PROFILE: '/api/v1/auth/user/update/',

    // Legacy alias: `BUDGET` once pointed at /api/v1/projects/budget/ (404).
    // The working CRUD list endpoint is /budget-items/. Keep this alias so
    // existing budget.ts callers don't break, but new code should import
    // BUDGET_ITEMS directly from services/api.
    BUDGET: CANONICAL_API_CONFIG.ENDPOINTS.BUDGET_ITEMS,
  },
};

export const APP_CONFIG = {
  ...CANONICAL_APP_CONFIG,

  // Deep linking
  SCHEME: 'projextpal',
  DEEP_LINK_PREFIX: 'projextpal://',
  UNIVERSAL_LINK_PREFIX: 'https://projextpal.com',
};
