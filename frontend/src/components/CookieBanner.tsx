import { useEffect, useState } from "react";

// Lichte cookie-consent-banner voor ProjeXtPal — AVG: analytics pas ná toestemming.
// Bron van waarheid voor de GA4-tag: localStorage-record (zie index.html consent-restore).
const CONSENT_KEY = "projextpal.cookie.consent";

export interface CookieConsentRecord {
  necessary: true;
  analytics: boolean;
}

/** Helper voor andere modules: mag analytics laden? */
export function getCookieConsent(): CookieConsentRecord | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    return raw ? (JSON.parse(raw) as CookieConsentRecord) : null;
  } catch {
    return null;
  }
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(CONSENT_KEY)) setVisible(true);
  }, []);

  const decide = (analytics: boolean) => {
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify({ necessary: true, analytics }));
    } catch {
      /* private mode — banner verdwijnt deze sessie */
    }
    // GA4 Consent Mode v2 — analytics aan/uit op basis van de keuze
    (window as { gtag?: (...a: unknown[]) => void }).gtag?.("consent", "update", {
      analytics_storage: analytics ? "granted" : "denied",
    });
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4">
      <div className="mx-auto flex max-w-3xl flex-col items-start gap-4 rounded-2xl border border-border bg-card/95 px-5 py-4 shadow-2xl backdrop-blur-sm sm:flex-row sm:items-center">
        <p className="flex-1 text-sm text-muted-foreground">
          We gebruiken noodzakelijke cookies om ProjeXtPal te laten werken. Met jouw toestemming gebruiken we ook
          geanonimiseerde analytics om de app te verbeteren.{" "}
          <a href="/privacy" className="underline underline-offset-2 hover:text-foreground">
            Privacybeleid
          </a>
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => decide(false)}
            className="h-9 rounded-lg border border-border bg-muted px-4 text-sm font-medium transition-colors hover:bg-muted/80"
          >
            Alleen noodzakelijk
          </button>
          <button
            type="button"
            onClick={() => decide(true)}
            className="h-9 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
          >
            Alles accepteren
          </button>
        </div>
      </div>
    </div>
  );
}
