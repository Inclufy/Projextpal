/**
 * Sprint 6 (S6-07) — subtle amber chip rendered under every AI response
 * that consulted a Project/Program/Portfolio AIContext row. Reusable from
 * Ask Co-pilot, Plan with AI dialog, and auto-draft previews.
 *
 * Props shape mirrors the backend ``ai_context_used`` block:
 *   {
 *     chars:     number,            // length of the context prefix
 *     documents: {name, bytes_used}[],
 *     surfaces:  string[],
 *   }
 */
import { FileText, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface AIContextUsed {
  chars: number;
  documents: Array<{ name: string; bytes_used?: number; pages?: number }>;
  surfaces: string[];
}

interface Props {
  used?: AIContextUsed | null;
  className?: string;
}

const AIContextUsedChip: React.FC<Props> = ({ used, className }) => {
  if (!used || !used.chars || used.chars <= 0) {
    return null;
  }
  const n = used.documents?.length || 0;
  const label =
    n === 1
      ? `AI gebruikte 1 document (${used.chars.toLocaleString("nl-NL")} chars)`
      : `AI gebruikte ${n} documenten (${used.chars.toLocaleString("nl-NL")} chars)`;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={
              "inline-flex items-center gap-1 border-amber-300 bg-amber-50 text-amber-800 " +
              "dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200 " +
              "px-2 py-0.5 text-[11px] font-normal cursor-default " +
              (className || "")
            }
          >
            <Sparkles className="h-3 w-3" />
            {label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="text-xs">
            <div className="font-medium mb-1">Gebruikte documenten:</div>
            {n === 0 ? (
              <div className="text-muted-foreground">
                Geen documenten — alleen methodologie-kennis.
              </div>
            ) : (
              <ul className="space-y-0.5">
                {used.documents.map((d, i) => (
                  <li key={`${d.name}-${i}`} className="flex items-center gap-1">
                    <FileText className="h-3 w-3 shrink-0" />
                    <span className="truncate">{d.name}</span>
                  </li>
                ))}
              </ul>
            )}
            {used.surfaces?.length > 0 && (
              <div className="mt-1 text-[10px] text-muted-foreground">
                Surface: {used.surfaces.join(", ")}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default AIContextUsedChip;
