/**
 * Sprint 5 S5-03 — Status report AI-draft button + preview dialog.
 *
 * Thin wrapper over the Sprint 4 AutoDraftFromDocsButton pattern,
 * configured for the status-report payload. The caller passes an
 * ``onApply`` that persists the user-edited draft via the existing
 * status-report API.
 */
import AutoDraftFromDocsButton from "@/components/AutoDraftFromDocsButton";
import { useLanguage } from "@/contexts/LanguageContext";

export interface StatusReportAiDraftButtonProps {
  projectId: string | number;
  onApply: (suggested: Record<string, any>) => Promise<void>;
}

const StatusReportAiDraftButton: React.FC<StatusReportAiDraftButtonProps> = ({
  projectId, onApply,
}) => {
  const { language } = useLanguage();
  const isNl = language === "nl" || !language;
  const isFr = language === "fr";
  return (
    <AutoDraftFromDocsButton
      endpoint={`/api/v1/projects/${projectId}/status-reports/auto-draft/`}
      title={isFr ? "Rapport d'avancement — brouillon IA"
        : isNl ? "Statusrapport — AI-draft"
          : "Status report — AI draft"}
      description={isFr
        ? "Synthèse générée depuis les documents et signaux récents."
        : isNl
          ? "Samenvatting op basis van documenten en recente signalen."
          : "Summary based on documents and recent signals."}
      buttonLabel={isFr ? "Brouillon IA" : isNl ? "AI-draft" : "AI draft"}
      fields={[
        { key: "headline", label: isNl ? "Kop" : "Headline", kind: "text" },
        { key: "summary", label: isNl ? "Samenvatting" : "Summary", kind: "textarea" },
        { key: "period_start", label: isNl ? "Periode start" : "Period start", kind: "text" },
        { key: "period_end", label: isNl ? "Periode einde" : "Period end", kind: "text" },
        { key: "highlights", label: isNl ? "Highlights" : "Highlights", kind: "stringList" },
        { key: "risks", label: isNl ? "Risico's" : "Risks", kind: "stringList" },
        { key: "actions_required", label: isNl ? "Vereiste acties" : "Actions required", kind: "stringList" },
      ]}
      onApply={onApply}
    />
  );
};

export default StatusReportAiDraftButton;
