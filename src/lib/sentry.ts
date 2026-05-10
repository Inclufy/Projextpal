import * as Sentry from "@sentry/react-native";

/**
 * Initialise Sentry for the ProjeXtPal mobile app.
 *
 * The DSN is read from EXPO_PUBLIC_SENTRY_DSN at build time and is
 * public-by-design — Sentry DSNs only authorize event ingest, never read
 * access. Stored in eas.json or .env.
 *
 * Init happens at module-load time of App.tsx so any boot crash is captured.
 */
export function initSentry(): void {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
  if (!dsn) {
    if (!__DEV__) {
      console.warn(
        "[Sentry] EXPO_PUBLIC_SENTRY_DSN missing in production build — error tracking disabled."
      );
    }
    return;
  }

  Sentry.init({
    dsn,
    environment: __DEV__ ? "development" : "production",
    enableNative: true,
    // Performance: 10% of transactions in prod, 100% in dev.
    tracesSampleRate: __DEV__ ? 1.0 : 0.1,
    // Don't capture during dev to keep noise down.
    enabled: !__DEV__,
  });
}

export { Sentry };
