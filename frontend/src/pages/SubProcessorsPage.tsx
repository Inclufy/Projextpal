import { Link } from "react-router-dom";
import { Network, ArrowLeft } from "lucide-react";

/** Public sub-processor list (GDPR Art. 28 transparency). Mirrors
 *  docs/compliance/sub-processors.md. No auth. */
const SUBPROCESSORS = [
  { name: "Resend", purpose: "Transactional & notification email", data: "Name, email, message content", location: "USA", transfer: "SCCs / DPF" },
  { name: "Stripe", purpose: "Payments & invoicing", data: "Billing details, email (no card data stored by us)", location: "USA / EU", transfer: "SCCs / DPF" },
  { name: "Cloudflare", purpose: "CDN, WAF, DDoS protection, secure tunnel", data: "IP address, request metadata", location: "Global (EU edge)", transfer: "SCCs / DPF" },
  { name: "Sentry", purpose: "Error tracking & performance monitoring", data: "IP, user id, diagnostic context (PII scrubbed)", location: "USA / EU", transfer: "SCCs / DPF" },
  { name: "OpenAI", purpose: "AI features (summaries, copilot)", data: "Content submitted to AI features", location: "USA", transfer: "SCCs; no-training on API data" },
  { name: "Anthropic", purpose: "AI features (summaries, analysis)", data: "Content submitted to AI features", location: "USA", transfer: "SCCs; no-training on API data" },
  { name: "Hosting (EU)", purpose: "Application + database hosting", data: "All categories in the privacy policy", location: "Netherlands (EEA)", transfer: "N/A — within EEA" },
];

export default function SubProcessorsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/40 to-white dark:from-purple-950/20 dark:to-background">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link to="/landing" className="inline-flex items-center gap-1.5 text-sm text-purple-600 hover:underline mb-6">
          <ArrowLeft className="h-4 w-4" /> ProjeXtPal
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center">
            <Network className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold">Sub-processors</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-8">
          ProjeXtPal — Inclufy · The third parties we use to process personal data on behalf of our customers, under data-processing agreements (GDPR Art. 28). Last updated 9 June 2026.
        </p>

        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-muted-foreground border-b bg-muted/40">
              <th className="px-3 py-2.5">Sub-processor</th>
              <th className="px-3 py-2.5">Purpose</th>
              <th className="px-3 py-2.5">Data</th>
              <th className="px-3 py-2.5">Location</th>
              <th className="px-3 py-2.5">Transfer safeguard</th>
            </tr></thead>
            <tbody>
              {SUBPROCESSORS.map((s) => (
                <tr key={s.name} className="border-b last:border-0 align-top">
                  <td className="px-3 py-2.5 font-medium">{s.name}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{s.purpose}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{s.data}</td>
                  <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">{s.location}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{s.transfer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-sm text-muted-foreground mt-6">
          We do not sell personal data. We notify customers at least 30 days before adding a new sub-processor that processes their personal data. Questions: <a href="mailto:privacy@inclufy.com" className="text-purple-600 hover:underline">privacy@inclufy.com</a>. See also our <Link to="/privacy" className="text-purple-600 hover:underline">privacy policy</Link>.
        </p>
      </div>
    </div>
  );
}
