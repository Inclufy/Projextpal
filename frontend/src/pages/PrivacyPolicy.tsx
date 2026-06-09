import { Link } from "react-router-dom";
import { ShieldCheck, ArrowLeft } from "lucide-react";

/** Public privacy policy page (no auth). Mirrors docs/compliance/privacy-policy.md.
 *  NOTE: fill the [...] placeholders (KvK, address, DPO) before final publication;
 *  the page is wired + publicly reachable, satisfying GDPR's transparency duty (G1). */
export default function PrivacyPolicy() {
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
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-8">ProjeXtPal — Inclufy · Last updated: 9 June 2026</p>

        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-[15px] leading-relaxed text-foreground/90">
          <section>
            <h2 className="text-lg font-semibold">1. Who we are</h2>
            <p>ProjeXtPal is a project-management service operated by <strong>Inclufy</strong> [legal entity B.V.], [WTC Almere, address], KvK [number]. For privacy questions: <a href="mailto:privacy@inclufy.com" className="text-purple-600 hover:underline">privacy@inclufy.com</a>. Data Protection contact: [DPO / privacy@inclufy.com]. When you are invited into a customer's workspace, that customer is the controller of their project data and Inclufy acts as their processor.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">2. What data we process</h2>
            <p>Account data (name, email, hashed password, profile image, company, role, language), authentication data (login times, 2FA secrets, session & device push tokens), project content you create, billing details (payment via Stripe — we don't store card numbers), and technical/usage data (IP, browser, error diagnostics). We practise data minimization.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">3. Why & on what basis</h2>
            <p>To provide the service (contract), keep it secure (legitimate interest / legal obligation), send transactional email, bill you (contract + legal obligation), and improve reliability (legitimate interest). Non-essential notifications are sent on the basis of <strong>consent</strong> — you can opt out any time in Settings → Preferences.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">4. AI features</h2>
            <p>Some features use third-party AI models (OpenAI, Anthropic) as our sub-processors to generate summaries and suggestions. Your content is not used to train their models on API traffic.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">5. Who we share with</h2>
            <p>Vetted sub-processors under data-processing agreements: Resend (email), Stripe (billing), Cloudflare (edge/security), Sentry (error tracking), OpenAI & Anthropic (AI), and our own EU hosting. We do <strong>not</strong> sell personal data. Transfers outside the EEA are covered by EU Standard Contractual Clauses.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">6. How long we keep it</h2>
            <p>Account & project data for the life of the account. Deleted accounts are anonymized immediately and hard-deleted after a 30-day grace period. Invoices are kept 7 years (Dutch law). Logs [retention window].</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">7. Your rights</h2>
            <p>You can <strong>download all your data</strong> (Art. 15) and <strong>delete your account</strong> (Art. 17) directly in <em>Settings → Security → Privacy &amp; your data</em>, edit your profile (Art. 16), and opt out of non-essential notifications (Art. 21). Email <a href="mailto:privacy@inclufy.com" className="text-purple-600 hover:underline">privacy@inclufy.com</a> for help — we respond within one month. You may lodge a complaint with the Dutch DPA (Autoriteit Persoonsgegevens).</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">8. Security</h2>
            <p>2FA, TLS/HSTS encryption in transit, encryption at rest for secrets, role-based access control, tenant isolation, rate limiting, audit logging and monitored error tracking.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">9. Cookies</h2>
            <p>We use strictly-necessary browser storage (authentication tokens) to keep you signed in. [We do not use non-essential analytics or marketing cookies / a consent banner is shown for any non-essential cookies.]</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">10. Contact</h2>
            <p><a href="mailto:privacy@inclufy.com" className="text-purple-600 hover:underline">privacy@inclufy.com</a> · Inclufy, [address].</p>
          </section>
        </div>

        <p className="text-xs text-muted-foreground mt-10 border-t pt-4">
          © {new Date().getFullYear()} Inclufy. This policy may be updated; material changes are notified by email and in-app.
        </p>
      </div>
    </div>
  );
}
