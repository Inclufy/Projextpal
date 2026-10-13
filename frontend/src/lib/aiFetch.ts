/**
 * aiFetch — drop-in `fetch` wrapper that injects the UI language into AI calls.
 *
 * Alle AI-endpoints die ná issue #12 (mei 2026) zijn toegevoegd (governance
 * ai/generate, reports generate, ai-plan, coach, risk-mitigation, risk-
 * forecast) sloten nooit aan op het `X-UI-Language`-pad dat Ask Co-pilot al
 * gebruikte. Resultaat: Engelstalige output voor NL-gebruikers.
 *
 * Deze helper vervangt een directe `fetch(...)`-aanroep en voegt automatisch
 * zowel een `X-UI-Language` header als een `language` body-veld toe, zodat de
 * backend-helper `core.i18n_ai.resolve_ui_language` beide kan lezen.
 *
 * Taalbron: `localStorage.getItem('language')` — dezelfde sleutel als
 * `LanguageContext`. Default is 'nl', consistent met de backend.
 */

type Lang = "en" | "nl" | "fr";
const SUPPORTED: Lang[] = ["en", "nl", "fr"];
const DEFAULT: Lang = "nl";

function getUiLanguage(): Lang {
  try {
    const v = (localStorage.getItem("language") || "").toLowerCase().trim();
    if ((SUPPORTED as string[]).includes(v)) return v as Lang;
  } catch {
    // SSR / private mode / disabled storage — fall through to default.
  }
  return DEFAULT;
}

/**
 * Fetch wrapper that auto-injects the UI language into AI requests.
 *
 * Pass the same arguments as `fetch`. Returns the same Promise<Response>.
 * - Adds `X-UI-Language: <lang>` header (overrideable).
 * - If the body is a JSON object (string that parses to an object) and no
 *   `language` field is present, inserts `language: <lang>`.
 * - All other calls behave exactly like native `fetch`.
 */
export function aiFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const lang = getUiLanguage();

  const headers = new Headers(init.headers || {});
  if (!headers.has("X-UI-Language")) headers.set("X-UI-Language", lang);

  let body = init.body;
  if (typeof body === "string" && body.length) {
    try {
      const parsed = JSON.parse(body);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed) && !("language" in parsed)) {
        body = JSON.stringify({ ...parsed, language: lang });
      }
    } catch {
      // Not JSON — leave body untouched.
    }
  }

  return fetch(input, { ...init, headers, body });
}

export { getUiLanguage };
