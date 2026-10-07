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
  ListTodo,
  Bot,
  UserCheck,
  Sparkles,
  ChevronDown,
  CalendarClock,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { useAuth } from "@/contexts/AuthContext";
import { useCopilot } from "@/contexts/CopilotContext";
import { cn } from "@/lib/utils";

type ItemType = "action" | "issue" | "risk";

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("access_token")}` });

const fetchAttention = async (id: string) => {
  const res = await fetch(`/api/v1/projects/${id}/attention/`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch attention items");
  return res.json();
};

// "Self" pick-up: take ownership + move it along, via the item's own endpoint.
const ENDPOINT: Record<ItemType, (itemId: number) => string> = {
  action: (i) => `/api/v1/projects/tasks/${i}/`,
  issue: (i) => `/api/v1/projects/issues/${i}/`,
  risk: (i) => `/api/v1/projects/risks/${i}/`,
};

const selfPatch = async ({
  type,
  itemId,
  userId,
}: {
  type: ItemType;
  itemId: number;
  userId: number;
}) => {
  const body: Record<string, any> =
    type === "action"
      ? { status: "in_progress", assigned_to: userId }
      : type === "issue"
        ? { status: "In Progress", owner: userId }
        : { owner: userId };
  const res = await fetch(ENDPOINT[type](itemId), {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to pick up item");
  return res.json();
};

export const ProjectAttentionPanel = () => {
  const { id } = useParams();
  const { pt } = usePageTranslations();
  const { user } = useAuth();
  const userId = (user as any)?.id;
  const queryClient = useQueryClient();
  const { openForProject } = useCopilot();

  const { data } = useQuery({
    queryKey: ["project-attention", id],
    queryFn: () => fetchAttention(id!),
    enabled: !!id,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["project-attention", id] });
    queryClient.invalidateQueries({ queryKey: ["project-health", id] });
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
  };

  const pickSelf = useMutation({
    mutationFn: selfPatch,
    onSuccess: () => {
      invalidate();
      toast.success(pt("Picked up — assigned to you"));
    },
    onError: () => toast.error(pt("Could not pick up this item")),
  });

  const acceptDisclosure = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/v1/projects/${id}/financial-disclosure/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: "{}",
      });
      if (!res.ok) throw new Error("Failed to accept financial disclosure");
      return res.json();
    },
    onSuccess: () => {
      invalidate();
      toast.success(pt("Financial disclosure accepted"));
    },
    onError: () => toast.error(pt("Could not accept the financial disclosure")),
  });

  const project = { id: id!, name: data?.name };

  const promptFor = (type: ItemType, label: string, itemId: number, auto: boolean) => {
    const kind =
      type === "action" ? pt("action") : type === "issue" ? pt("issue") : pt("risk");
    if (auto) {
      return `${pt("Resolve this")} ${kind} ${pt("autonomously")}: ${type} #${itemId} "${label}".`;
    }
    return `${pt("Help me pick up this")} ${kind}: ${type} #${itemId} "${label}". ${pt("What are the steps?")}`;
  };

  const PickUpMenu = ({ type, itemId, label }: { type: ItemType; itemId: number; label: string }) => (
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
        <DropdownMenuItem onClick={() => pickSelf.mutate({ type, itemId, userId })}>
          <UserCheck className="mr-2 h-4 w-4" />
          {pt("Do it myself")}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            openForProject(project, { prompt: promptFor(type, label, itemId, false), autoSend: false })
          }
        >
          <Bot className="mr-2 h-4 w-4" />
          {pt("AI guidance")}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            openForProject(project, { prompt: promptFor(type, label, itemId, true), autoSend: true })
          }
        >
          <Sparkles className="mr-2 h-4 w-4" />
          {pt("Let AI do it")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const actions = data?.actions ?? [];
  const issues = data?.issues ?? [];
  const risks = data?.risks ?? [];
  const fd = data?.financial_disclosure ?? null;
  const fdFlag = !!fd && (fd.needs_ack || fd.stale);
  const nothing =
    actions.length === 0 && issues.length === 0 && risks.length === 0 && !fdFlag;

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

        {/* Governance — financial disclosure to cost-viewing members */}
        {fd && (fdFlag || fd.acknowledged) && (
          <section className="space-y-2">
            <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Lock className="h-3.5 w-3.5" /> {pt("Financial disclosure")}
            </h4>
            <div
              className={cn(
                "rounded-lg border p-2.5",
                fdFlag
                  ? "border-amber-200 bg-amber-50"
                  : "border-emerald-200 bg-emerald-50",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    {fd.stale
                      ? pt("The set of members who can see this project's financials has changed — please re-confirm.")
                      : fd.needs_ack
                        ? pt("This project's budget, rates and EVM are visible to its cost-viewing members.")
                        : pt("Financial disclosure accepted.")}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {pt("Visible to")} {fd.disclosed_count}{" "}
                    {fd.disclosed_count === 1 ? pt("member") : pt("members")}
                    {Array.isArray(fd.disclosed_members) && fd.disclosed_members.length > 0 && (
                      <>: {fd.disclosed_members.map((m: any) => m.name).filter(Boolean).join(", ")}</>
                    )}
                    {!fdFlag && fd.acknowledged_by_name && (
                      <>
                        {" — "}
                        {pt("accepted by")} {fd.acknowledged_by_name}
                        {fd.acknowledged_at && <> ({new Date(fd.acknowledged_at).toLocaleDateString()})</>}
                      </>
                    )}
                  </p>
                </div>
                {fdFlag ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 shrink-0 gap-1 text-xs"
                    disabled={acceptDisclosure.isPending}
                    onClick={() => acceptDisclosure.mutate()}
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {pt("Accept")}
                  </Button>
                ) : (
                  <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
                )}
              </div>
            </div>
          </section>
        )}

        {/* Open actions */}
        {actions.length > 0 && (
          <section className="space-y-2">
            <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <ListTodo className="h-3.5 w-3.5" /> {pt("Open actions")} ({actions.length})
            </h4>
            {actions.slice(0, 8).map((a: any) => (
              <div key={a.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{a.title}</p>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                    {a.overdue && (
                      <span className="inline-flex items-center gap-1 text-rose-600">
                        <CalendarClock className="h-3 w-3" /> {pt("Overdue")}
                      </span>
                    )}
                    {a.due_date && <span>{a.due_date}</span>}
                    <span className="capitalize">{a.priority}</span>
                  </div>
                </div>
                <PickUpMenu type="action" itemId={a.id} label={a.title} />
              </div>
            ))}
          </section>
        )}

        {/* Open issues */}
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

        {/* Open risks */}
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
