/**
 * Sprint 5 S5-01 — compliance flags banner.
 *
 * Shows an amber banner at the top of a project page when
 * ``Project.compliance_flags`` is non-empty. Each flag renders as a
 * clickable chip; clicking a chip scrolls the page's documentation
 * section into view (chips carry an anchor-link so callers can route
 * them anywhere by handling ``onChipClick``).
 *
 * Fetch strategy: the banner fetches the project itself so pages that
 * do not already load it don't need to pass compliance_flags down. We
 * cache it on the shared ``project`` query key so React Query dedupes
 * with ProjectHeader's own fetch.
 */
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { projectsApi } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";

// Keep in sync with backend/projects/compliance_scan.chip_label().
const CHIP_LABELS: Record<string, { nl: string; en: string; fr: string }> = {
  avg_gdpr: { nl: "AVG/GDPR", en: "GDPR", fr: "RGPD" },
  iso_27001: { nl: "ISO 27001", en: "ISO 27001", fr: "ISO 27001" },
  iso_9001: { nl: "ISO 9001", en: "ISO 9001", fr: "ISO 9001" },
  wkkgz: { nl: "Wkkgz", en: "Wkkgz (NL)", fr: "Wkkgz" },
  jeugdwet: { nl: "Jeugdwet", en: "Youth Care Act (NL)", fr: "Loi jeunesse" },
  wmo: { nl: "Wmo", en: "Social Support Act (NL)", fr: "Loi soutien social" },
  aanbestedingswet: { nl: "Aanbestedingswet", en: "NL Procurement Act", fr: "Marchés publics (NL)" },
  besluit_informatiebeveiliging: {
    nl: "Besluit informatiebeveiliging",
    en: "NL Govt Infosec Decree",
    fr: "Décret sécurité info (NL)",
  },
  nis2: { nl: "NIS2", en: "NIS2", fr: "NIS2" },
  dora: { nl: "DORA", en: "DORA", fr: "DORA" },
  soc2: { nl: "SOC 2", en: "SOC 2", fr: "SOC 2" },
  pci_dss: { nl: "PCI-DSS", en: "PCI-DSS", fr: "PCI-DSS" },
};

export interface ComplianceBannerProps {
  projectId: string | number;
  /** Called when a chip is clicked. Defaults to scrolling to #project-documents. */
  onChipClick?: (slug: string) => void;
}

const ComplianceBanner: React.FC<ComplianceBannerProps> = ({ projectId, onChipClick }) => {
  const { language } = useLanguage();
  const lang = (language || "nl") as "nl" | "en" | "fr";
  const { data: project } = useQuery({
    queryKey: ["project", String(projectId)],
    queryFn: () => projectsApi.getById(String(projectId)),
    enabled: !!projectId,
  });
  const flags: string[] = Array.isArray(project?.compliance_flags) ? project!.compliance_flags : [];
  if (flags.length === 0) return null;

  const label = (slug: string) => {
    const rec = CHIP_LABELS[slug];
    return rec ? rec[lang] || rec.en : slug;
  };

  const handleClick = (slug: string) => {
    if (onChipClick) return onChipClick(slug);
    const el = document.getElementById("project-documents");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const title = lang === "en"
    ? "Compliance keywords detected in uploaded documents"
    : lang === "fr"
      ? "Mots-clés de conformité détectés dans les documents"
      : "Compliance-termen gevonden in de documenten";

  const body = lang === "en"
    ? "Review the regimes below and make sure your project plan covers them."
    : lang === "fr"
      ? "Consultez les régimes ci-dessous et assurez-vous que votre plan les couvre."
      : "Controleer de regelgevingen hieronder en zorg dat je plan ze afdekt.";

  return (
    <Alert className="border-amber-300 bg-amber-50 dark:bg-amber-950/30">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-900 dark:text-amber-200">{title}</AlertTitle>
      <AlertDescription className="text-amber-800 dark:text-amber-300">
        <p className="mb-2 text-xs">{body}</p>
        <div className="flex flex-wrap gap-1.5">
          {flags.map((slug) => (
            <Badge
              key={slug}
              variant="outline"
              onClick={() => handleClick(slug)}
              className="cursor-pointer border-amber-400 text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/40"
            >
              {label(slug)}
            </Badge>
          ))}
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default ComplianceBanner;
