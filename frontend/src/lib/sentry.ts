import * as Sentry from "@sentry/react";

/**
 * Initialise Sentry for the ProjeXtPal web app.
 *
 * The DSN is read from VITE_SENTRY_DSN at build time and is public-by-design:
 * Sentry DSNs only authorize event ingest, never read access. They CAN be
 * committed and shipped in the bundle.
 *
 * Init happens in main.tsx BEFORE the React tree is rendered so that any
 * crash during boot is captured.
 */
export function initSentry(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) {
    if (import.meta.env.PROD) {
      console.warn(
        "[Sentry] VITE_SENTRY_DSN missing in production build — error tracking disabled."
      );
    }
    return;
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    release: import.meta.env.VITE_APP_VERSION,
    integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
    // Performance: 10% of transactions in prod, 100% in dev.
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    // Session Replay: 10% of sessions, 100% of sessions with errors.
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}

export const SentryErrorBoundary = Sentry.ErrorBoundary;
export { Sentry };
