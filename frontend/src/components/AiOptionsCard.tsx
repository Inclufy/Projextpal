// =============================================================================
// AiOptionsCard — "wat kan AI uit jouw project-context draften?" overview.
//
// Verschijnt op de project-overview (FoundationOverview) wanneer het project
// een opgeladen AI-context heeft (bijv. net uit documenten opgezet via de
// nieuw-project-wizard). Toont een grid van kaarten per methodology — één
// kaart per draftable artefact — met een directe link naar de bijbehorende
// tab waar de operator met één klik de AI-draft dialog opent.
//
// Prio uit UAT 15 okt 2026: "geef een optie-kaart voor dingen die AI kan
// genereren voor de gebruiker op basis van de context."
// =============================================================================

import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText, Briefcase, ListTree, Columns, Target, GanttChart,
  AlertTriangle, FileSearch, Scale, Sparkles, ArrowRight,
} from "lucide-react";
import { usePageTranslations } from "@/hooks/usePageTranslations";

export interface AiOption {
  key: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  methodologies: string[]; // which methodologies this option applies to; empty = all
  path: (projectId: string) => string;
}

const OPTIONS: AiOption[] = [
  {
    key: "project_charter",
    icon: FileSearch,
    title: "Project Charter",
    description: "Visie, scope, aannames en go/no-go rationale — in één pagina.",
    methodologies: [], // all
    path: (id) => `/projects/${id}/foundation/charter`,
  },
  {
    key: "business_case",
    icon: Briefcase,
    title: "Business Case",
    description: "Executive summary, reasons, options, benefits, dis-benefits + major risks.",
    methodologies: ["prince2"],
    path: (id) => `/projects/${id}/prince2/business-case`,
  },
  {
    key: "project_brief",
    icon: FileText,
    title: "Project Brief",
    description: "Projectdefinitie, aanpak en product-description — PRINCE2 initiatie.",
    methodologies: ["prince2"],
    path: (id) => `/projects/${id}/prince2/project-brief`,
  },
  {
    key: "scrum_vision",
    icon: Target,
    title: "Visie + backlog",
    description: "Product-visie + initial backlog (user stories, prioriteiten).",
    methodologies: ["scrum", "agile"],
    path: (id) => `/projects/${id}/scrum/backlog`,
  },
  {
    key: "kanban_swimlanes",
    icon: Columns,
    title: "Swimlanes",
    description: "Suggested swimlane-structuur op basis van scope en teams.",
    methodologies: ["kanban"],
    path: (id) => `/projects/${id}/kanban/board`,
  },
  {
    key: "lss_define",
    icon: Scale,
    title: "DMAIC Define",
    description: "Problem statement, SIPOC, project charter voor Six Sigma Green Belt.",
    methodologies: ["lean_six_sigma_green", "lean_six_sigma_black"],
    path: (id) => `/projects/${id}/lss-green/phases`,
  },
  {
    key: "waterfall_phases",
    icon: GanttChart,
    title: "Fases + gates",
    description: "Fase-indeling met deadlines, interpoleerd uit project-periode of docs.",
    methodologies: ["waterfall", "hybrid"],
    path: (id) => `/projects/${id}/waterfall/phases`,
  },
  {
    key: "risks",
    icon: AlertTriangle,
    title: "Risico-register",
    description: "AI identificeert risico's uit de context en stelt mitigaties voor.",
    methodologies: [],
    path: (id) => `/projects/${id}/planning/risks`,
  },
  {
    key: "milestones",
    icon: ListTree,
    title: "Mijlpalen + Gantt",
    description: "Mijlpaalstructuur op basis van deliverables, deadlines en afhankelijkheden.",
    methodologies: [],
    path: (id) => `/projects/${id}/planning/milestones`,
  },
  {
    key: "status_report",
    icon: FileText,
    title: "Status Report",
    description: "Highlight-report met voortgang, risico's, blockers — klaar voor stakeholder.",
    methodologies: [],
    path: (id) => `/projects/${id}/reports`,
  },
];

interface AiOptionsCardProps {
  projectId: string;
  methodology?: string;
}

export function AiOptionsCard({ projectId, methodology }: AiOptionsCardProps) {
  const { pt } = usePageTranslations();
  const navigate = useNavigate();

  // Only show the card when there IS AI-context on this project —
  // otherwise the options would all open empty dialogs. We GET the
  // ai-context endpoint and gate the whole card on `exists`.
  const { data: ctx, isLoading } = useQuery({
    queryKey: ["project-ai-context", projectId],
    queryFn: async () => {
      const token = localStorage.getItem("access_token");
      const r = await fetch(`/api/v1/projects/${projectId}/ai-context/`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!r.ok) return null;
      return r.json();
    },
    enabled: !!projectId,
    staleTime: 60_000,
  });

  if (isLoading) return null;
  const hasContext = !!ctx && (ctx.exists === true || (ctx.chars ?? 0) > 0);
  if (!hasContext) return null;

  const normMeth = (methodology || "").toLowerCase();
  const visible = OPTIONS.filter(
    (o) => o.methodologies.length === 0 || o.methodologies.includes(normMeth),
  );
  const docCount = Array.isArray(ctx?.source_files) ? ctx.source_files.length : 0;
  const chars = ctx?.chars ?? 0;

  return (
    <Card className="p-5 mb-6 border-purple-200 bg-purple-50/40 dark:bg-purple-950/20 dark:border-purple-900/50">
      <div className="flex items-start justify-between mb-4 gap-3 flex-wrap">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg shrink-0">
            <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-300" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-purple-900 dark:text-purple-100">
              {pt("AI kan deze dingen voor je draften uit jouw project-context")}
            </h3>
            <p className="text-xs text-purple-800 dark:text-purple-200 mt-0.5">
              {pt("Elke optie opent de desbetreffende tab waar je met één klik een AI-concept kunt opstellen. Je blijft als mens verantwoordelijk voor de review en activatie.")}
            </p>
          </div>
        </div>
        <Badge variant="outline" className="shrink-0 border-purple-300 text-purple-800 dark:border-purple-700 dark:text-purple-200">
          {docCount} {pt(docCount === 1 ? "document" : "documents")} · {chars.toLocaleString()} {pt("chars")}
        </Badge>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((opt) => {
          const Icon = opt.icon;
          return (
            <button
              key={opt.key}
              onClick={() => navigate(opt.path(projectId))}
              className="group text-left p-3 border border-purple-200 dark:border-purple-900/60 rounded-lg bg-white dark:bg-background hover:border-purple-400 dark:hover:border-purple-700 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-purple-600 dark:text-purple-400 shrink-0" />
                  <span className="font-medium text-sm text-foreground">{pt(opt.title)}</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors shrink-0" />
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug">
                {pt(opt.description)}
              </p>
            </button>
          );
        })}
      </div>

      {visible.length === 0 && (
        <p className="text-xs text-muted-foreground italic text-center py-4">
          {pt("Geen methodology-specifieke draft-opties voor dit project — algemene tabs blijven beschikbaar.")}
        </p>
      )}
    </Card>
  );
}
