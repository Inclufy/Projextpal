import { Link } from "react-router-dom";
import { ShieldCheck, ArrowLeft } from "lucide-react";

/** Public Vulnerability Disclosure Policy (VDP) page. Paired with
 *  /.well-known/security.txt (RFC 9116). No auth. */
export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/40 to-white dark:from-purple-950/20 dark:to-background">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link to="/landing" className="inline-flex items-center gap-1.5 text-sm text-purple-600 hover:underline mb-6">
          <ArrowLeft className="h-4 w-4" /> ProjeXtPal
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold">Security &amp; Responsible Disclosure</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-8">ProjeXtPal — Inclufy</p>

        <div className="space-y-6 text-[15px] leading-relaxed text-foreground/90">
          <section>
            <h2 className="text-lg font-semibold mb-1">Reporting a vulnerability</h2>
            <p>If you believe you've found a security vulnerability in ProjeXtPal, please email <a href="mailto:security@inclufy.com" className="text-purple-600 hover:underline">security@inclufy.com</a>. Our machine-readable contact is published at <a href="/.well-known/security.txt" className="text-purple-600 hover:underline">/.well-known/security.txt</a> (RFC 9116).</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-1">Please do</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Give us reasonable time to investigate and remediate before any public disclosure.</li>
              <li>Make a good-faith effort to avoid privacy violations, data destruction, and service disruption.</li>
              <li>Only test against your own account / data — do not access data that isn't yours.</li>
              <li>Provide enough detail to reproduce (steps, impact, affected endpoint).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-1">Please don't</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Run automated scanners that degrade the service, or perform DoS/DDoS.</li>
              <li>Use social engineering, phishing, or physical attacks against staff or customers.</li>
              <li>Access, modify, or delete other users' data.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-1">Our commitment</h2>
            <p>We acknowledge reports promptly, keep you updated on remediation, and will not pursue legal action for good-faith research that follows this policy.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-1">How we protect your data</h2>
            <p>2FA, encryption in transit (TLS/HSTS) and at rest for secrets, role-based access control, tenant isolation, rate limiting, audit logging, and monitored error tracking. See our <Link to="/privacy" className="text-purple-600 hover:underline">privacy policy</Link>.</p>
          </section>
        </div>

        <p className="text-xs text-muted-foreground mt-10 border-t pt-4">
          © {new Date().getFullYear()} Inclufy · security@inclufy.com
        </p>
      </div>
    </div>
  );
}
