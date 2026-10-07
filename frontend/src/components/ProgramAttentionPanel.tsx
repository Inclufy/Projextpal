import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertTriangle,
  ShieldAlert,
  FolderKanban,
  Bot,
  UserCheck,
  Sparkles,
  ChevronDown,
  CalendarClock,
  Eye,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { useAuth } from "@/contexts/AuthContext";
import { useCopilot } from "@/contexts/CopilotContext";
import { methodologyOverviewPath } from "@/lib/methodologyRoutes";
import { cn } from "@/lib/utils";

type ItemType = "risk" | "project" | "issue";

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("access_token")}` });

const fetchAttention = async (id: string) => {
  const res = await fetch(`/api/v1/programs/${id}/attention/`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch attention items");
  return res.json();
};

// "Self" pick-up: take ownership + move it along, via the item's own endpoint.
// Programme risks live under the programme; issues are linked-project issues.
const ENDPOINT: Record<"risk" | "issue", (programId: string, itemId: number) => string> = {
  risk: (p, i) => `/api/v1/programs/${p}/risks/${i}/`,
  issue: (_p, i) => `/api/v1/projects/issues/${i}/`,
};

const selfPatch = async ({
  type,
  programId,
  itemId,
  userId,
}: {
  type: "risk" | "issue";
  programId: string;
  itemId: number;
  userId: number;
}) => {
  const body: Record<string, any> =
    type === "issue"
      ? { status: "In Progress", owner: userId }
      : { owner: userId };
  const res = await fetch(ENDPOINT[type](programId, itemId), {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to pick up item");
  return res.json();
};

export const ProgramAttentionPanel = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { pt } = usePageTranslations();
  const { user } = useAuth();
  const userId = (user as any)?.id;
  const queryClient = useQueryClient();
  const { openForProgram } = useCopilot();

  const { data } = useQuery({
    queryKey: ["program-attention", id],
    queryFn: () => fetchAttention(id!),
    enabled: !!id,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["program-attention", id] });
    queryClient.invalidateQueries({ queryKey: ["program-health", id] });
    queryClient.invalidateQueries({ queryKey: ["program-risks", id] });
  };

  const pickSelf = useMutation({
    mutationFn: selfPatch,
    onSuccess: () => {
      invalidate();
      toast.success(pt("Picked up — assigned to you"));
    },
    onError: () => toast.error(pt("Could not pick up this item")),
  });

  const program = { id: id!, name: data?.name };

  const promptFor = (type: ItemType, label: string, itemId: number, auto: boolean) => {
    const kind =
      type === "project" ? pt("project") : type === "issue" ? pt("issue") : pt("risk");
    if (auto) {
      return `${pt("Resolve this")} ${kind} ${pt("autonomously")}: ${type} #${itemId} "${label}".`;
    }
    return `${pt("Help me pick up this")} ${kind}: ${type} #${itemId} "${label}". ${pt("What are the steps?")}`;
  };

  const PickUpMenu = ({
    type,
    itemId,
    label,
    methodology,
  }: {
    type: ItemType;
    itemId: number;
    label: string;
    methodology?: string;
  }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline" className="h-7 gap-1 text-xs">
          {pt("Pick up")}
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{pt("How do you want to pick this up?")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {type === "project" ? (
          <DropdownMenuItem onClick={() => navigate(methodologyOverviewPath(itemId, methodology))}>
            <Eye className="mr-2 h-4 w-4" />
            {pt("Open project")}
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => pickSelf.mutate({ type, programId: id!, itemId, userId })}>
            <UserCheck className="mr-2 h-4 w-4" />
            {pt("Do it myself")}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={() =>
            openForProgram(program, { prompt: promptFor(type, label, itemId, false), autoSend: false })
          }
        >
          <Bot className="mr-2 h-4 w-4" />
          {pt("AI guidance")}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            openForProgram(program, { prompt: promptFor(type, label, itemId, true), autoSend: true })
          }
        >
          <Sparkles className="mr-2 h-4 w-4" />
          {pt("Let AI do it")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const risks = data?.risks ?? [];
  const projects = data?.projects ?? [];
  const issues = data?.issues ?? [];
  const nothing = risks.length === 0 && projects.length === 0 && issues.length === 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          {pt("Needs attention")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {nothing && (
          <p className="text-sm text-muted-foreground">{pt("Nothing needs attention right now.")}</p>
        )}

        {/* Linked projects needing attention (overdue / on hold) */}
        {projects.length > 0 && (
          <section className="space-y-2">
            <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <FolderKanban className="h-3.5 w-3.5" /> {pt("Open projects")} ({projects.length})
            </h4>
            {projects.slice(0, 8).map((p: any) => (
              <div key={p.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                    {p.overdue && (
                      <span className="inline-flex items-center gap-1 text-rose-600">
                        <CalendarClock className="h-3 w-3" /> {pt("Overdue")}
                      </span>
                    )}
                    {p.end_date && <span>{p.end_date}</span>}
                    <span className="capitalize">{(p.status || "").replace("_", " ")}</span>
                  </div>
                </div>
                <PickUpMenu type="project" itemId={p.id} label={p.name} methodology={p.methodology} />
              </div>
            ))}
          </section>
        )}

        {/* Open issues across linked projects */}
        {issues.length > 0 && (
          <section className="space-y-2">
            <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <AlertTriangle className="h-3.5 w-3.5" /> {pt("Open issues")} ({issues.length})
            </h4>
            {issues.slice(0, 8).map((i: any) => (
              <div key={i.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{i.name}</p>
                  <Badge
                    variant="outline"
                    className={cn(
                      "mt-0.5 text-xs",
                      ["Blocker", "Critical"].includes(i.severity)
                        ? "border-rose-200 bg-rose-50 text-rose-700"
                        : "border-amber-200 bg-amber-50 text-amber-700",
                    )}
                  >
                    {i.severity}
                  </Badge>
                </div>
                <PickUpMenu type="issue" itemId={i.id} label={i.name} />
              </div>
            ))}
          </section>
        )}

        {/* Open programme risks */}
        {risks.length > 0 && (
          <section className="space-y-2">
            <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <ShieldAlert className="h-3.5 w-3.5" /> {pt("Open risks")} ({risks.length})
            </h4>
            {risks.slice(0, 8).map((r: any) => (
              <div key={r.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{r.name}</p>
                  <span className="text-xs capitalize text-muted-foreground">{r.level}</span>
                </div>
                <PickUpMenu type="risk" itemId={r.id} label={r.name} />
              </div>
            ))}
          </section>
        )}
      </CardContent>
    </Card>
  );
};
