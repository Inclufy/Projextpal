import { useEffect } from "react";
import { Loader2 } from "lucide-react";

/** Receives the JWT pair from the backend SSO callback (?access=&refresh=),
 *  stores it the same way the normal login does, and lands the user in the app. */
export default function SsoCallback() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const access = params.get("access");
    const refresh = params.get("refresh");
    if (access && refresh) {
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      window.location.replace("/dashboard");
    } else {
      window.location.replace("/login?sso_error=missing_tokens");
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" /> Signing you in…
      </div>
    </div>
  );
}
