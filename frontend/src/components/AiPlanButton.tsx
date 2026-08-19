import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import AiPlanDialog from "@/components/AiPlanDialog";
import { usePageTranslations } from "@/hooks/usePageTranslations";

// Zelfstandige "Plan met AI"-knop + dialoog, voor de methodiek-schermen
// (Scrum-backlog, Kanban-bord, PRINCE2-werkpakketten, DMAIC-fasen, …).
// De dialoog stelt naast het generieke plan ook de artefacten van de
// projectmethodiek voor; onApplied ververst de weergave van de pagina.
export default function AiPlanButton({
  projectId,
  onApplied,
  size = "sm",
}: {
  projectId: string | number;
  onApplied?: () => void;
  size?: "sm" | "default";
}) {
  const { pt } = usePageTranslations();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        variant="outline"
        size={size}
        className="gap-1.5 border-indigo-300 text-indigo-700 hover:bg-indigo-50"
        onClick={() => setOpen(true)}
      >
        <Sparkles className="h-4 w-4" />
        {pt("Plan with AI")}
      </Button>
      <AiPlanDialog projectId={projectId} open={open} onOpenChange={setOpen} onApplied={() => onApplied?.()} />
    </>
  );
}
