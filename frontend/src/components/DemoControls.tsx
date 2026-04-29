import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { usePageTranslations } from "@/hooks/usePageTranslations";

const ALLOWED_ROLES = ["superadmin", "admin", "pm", "program_manager"];

interface DemoControlsProps {
  /** Project (or program) id used in the URL. */
  entityId: string | number;
  /**
   * URL-prefix that the seed/clear endpoints live under.
   * Example: "agile" produces /api/v1/projects/{id}/agile/seed-demo/.
   * For programs pass `programs/{id}` style explicitly via `seedUrl`/`clearUrl`.
   */
  methodology?: string;
  /** Optional explicit overrides if the URLs don't follow the standard pattern. */
  seedUrl?: string;
  clearUrl?: string;
  /** Called after a successful seed or clear so the parent can refresh data. */
  onChanged?: () => void;
  /** Extra classes for the container. */
  className?: string;
}

export const DemoControls = ({
  entityId,
  methodology,
  seedUrl,
  clearUrl,
  onChanged,
  className = "",
}: DemoControlsProps) => {
  const { user } = useAuth();
  const { pt } = usePageTranslations();
  const [seeding, setSeeding] = useState(false);
  const [clearing, setClearing] = useState(false);

  if (!user || !ALLOWED_ROLES.includes(user.role)) return null;

  const computedSeed = seedUrl || `/api/v1/projects/${entityId}/${methodology}/seed-demo/`;
  const computedClear = clearUrl || `/api/v1/projects/${entityId}/${methodology}/clear-demo/`;

  const post = async (url: string) => {
    const token = localStorage.getItem("access_token");
    return fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  };

  const seedDemo = async () => {
    if (!confirm(pt("Fill all empty tabs with realistic demo data? Existing data will be preserved."))) return;
    setSeeding(true);
    try {
      const r = await post(computedSeed);
      if (r.ok) {
        const data = await r.json().catch(() => ({}));
        const counts = Object.entries(data.created || {}).filter(([, v]: any) => v > 0).map(([k, v]) => `${k}: ${v}`).join(", ");
        toast.success(counts ? `${pt("Demo data seeded")} — ${counts}` : pt("All tabs already had data"));
        onChanged?.();
      } else {
        toast.error(pt("Failed to seed demo data"));
      }
    } catch {
      toast.error(pt("Failed to seed demo data"));
    } finally {
      setSeeding(false);
    }
  };

  const clearDemo = async () => {
    if (!confirm(pt("Permanently delete ALL data for this methodology? This cannot be undone."))) return;
    setClearing(true);
    try {
      const r = await post(computedClear);
      if (r.ok) {
        toast.success(pt("All data cleared"));
        onChanged?.();
      } else {
        toast.error(pt("Failed to clear data"));
      }
    } catch {
      toast.error(pt("Failed to clear data"));
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <Button variant="outline" onClick={seedDemo} disabled={seeding} className="gap-2">
        {seeding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {pt("Fill with demo data")}
      </Button>
      <Button
        variant="outline"
        onClick={clearDemo}
        disabled={clearing}
        className="gap-2 text-destructive hover:bg-destructive/10"
      >
        {clearing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        {pt("Clear data")}
      </Button>
    </div>
  );
};

export default DemoControls;
