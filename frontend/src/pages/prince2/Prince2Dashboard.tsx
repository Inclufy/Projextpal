import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DemoControls } from "@/components/DemoControls";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ProjectHeader } from "@/components/ProjectHeader";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import {
  Loader2, RefreshCw, FileText, Briefcase, Shield,
  ChevronRight, AlertTriangle, CheckCircle2, Clock, Layers,
  Plus, TrendingUp, ShieldAlert, GitBranch, Workflow,
  Euro, Wallet, Gavel, Check, X, Inbox, GraduationCap
} from "lucide-react";
import { toast } from "sonner";
import Prince2ProcessFlow from "./Prince2ProcessFlow";
import Prince2MethodologyOverview from "./Prince2MethodologyOverview";
import { TaskKpiTiles } from "@/components/TaskKpiTiles";
import { TaskCategorySubtotals } from "@/components/TaskCategorySubtotals";
import { DueDateChangeRequestQueue } from "@/components/DueDateChangeRequestQueue";

const riskBadge: Record<string, string> = { high: "bg-red-100 text-red-700", medium: "bg-amber-100 text-amber-700", low: "bg-blue-100 text-blue-700" };

const approvalIcon: Record<string, any> = { stage_gate: Gavel, stage_plan: FileText, exception_plan: AlertTriangle };
const approvalTint: Record<string, string> = { stage_gate: "text-purple-600", stage_plan: "text-blue-600", exception_plan: "text-rose-600" };

const Prince2Dashboard = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchDashboard = async () => {
    try {
      const response = await fetch(`/api/v1/projects/${id}/prince2/dashboard/`, { headers });
      if (response.ok) {
        setDashboard(await response.json());
      } else {
        toast.error(pt("Loading data..."));
      }
    } catch (err) {
      console.error("Failed to fetch dashboard", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboard(); }, [id]);

  const initializeStages = async () => {
    setInitializing(true);
    try {
      const response = await fetch(`/api/v1/projects/${id}/prince2/stages/initialize_stages/`, {
        method: "POST",
        headers: jsonHeaders,
      });
      if (response.ok) {
        toast.success(pt("Saved"));
        fetchDashboard();
      } else {
        const err = await response.json().catch(() => ({}));
        toast.error(err.error || err.detail || pt("Action failed"));
      }
    } catch {
      toast.error(pt("Action failed"));
    } finally {
      setInitializing(false);
    }
  };

  const nav = (path: string) => navigate(`/projects/${id}/prince2/${path}`);

  const [acting, setActing] = useState<string | null>(null);

  const bg = dashboard?.budget_governance;
  const fmtMoney = (v: number | null | undefined) => {
    if (v === null || v === undefined) return "—";
    try {
      return new Intl.NumberFormat("nl-NL", {
        style: "currency", currency: bg?.currency || "EUR", maximumFractionDigits: 0,
      }).format(v);
    } catch { return `€${Math.round(v).toLocaleString("nl-NL")}`; }
  };

  // Approve / reject items in the Board-approvals inbox.
  const ENDPOINT: Record<string, string> = {
    stage_gate: "stage-gates", stage_plan: "stage-plans", exception_plan: "exception-plans",
  };
  const actOnApproval = async (item: any, action: "approve" | "reject") => {
    const base = ENDPOINT[item.kind];
    if (!base) return;
    // stage_plan + exception_plan only expose approve; reject a gate only.
    const key = `${item.kind}-${item.id}-${action}`;
    setActing(key);
    try {
      const res = await fetch(
        `/api/v1/projects/${id}/prince2/${base}/${item.id}/${action}/`,
        { method: "POST", headers: jsonHeaders, body: JSON.stringify({}) },
      );
      if (res.ok) {
        toast.success(action === "approve" ? pt("Approved") : pt("Rejected"));
        fetchDashboard();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || err.detail || pt("Action failed"));
      }
    } catch {
      toast.error(pt("Action failed"));
    } finally {
      setActing(null);
    }
  };

  const checkCostTolerance = async () => {
    setActing("cost-check");
    try {
      const res = await fetch(
        `/api/v1/projects/${id}/prince2/tolerances/check-cost-tolerance/`,
        { method: "POST", headers: jsonHeaders, body: JSON.stringify({}) },
      );
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        if (data.breach && data.exception_raised) {
          toast.warning(pt("Cost tolerance exceeded — Exception Report raised"));
        } else if (data.breach) {
          toast.warning(pt("Cost tolerance exceeded"));
        } else {
          toast.success(pt("Within cost tolerance"));
        }
        fetchDashboard();
      } else {
        toast.error(data.error || data.detail || pt("Action failed"));
      }
    } catch {
      toast.error(pt("Action failed"));
    } finally {
      setActing(null);
    }
  };

  const getStatusBadge = (status: string | null) => {
    if (!status) return <Badge variant="outline" className="text-xs">Not created</Badge>;
    const colors: Record<string, string> = {
      draft: "bg-gray-100 text-gray-700",
      in_review: "bg-blue-100 text-blue-700",
      approved: "bg-green-100 text-green-700",
      baselined: "bg-purple-100 text-purple-700",
    };
    return <Badge className={`text-xs ${colors[status] || "bg-gray-100 text-gray-700"}`}>{status}</Badge>;
  };

  const getStageStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500";
      case "active": return "bg-blue-500";
      case "planned": return "bg-gray-300";
      default: return "bg-gray-200";
    }
  };

  if (loading) return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    </div>
  );

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-600 flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">PRINCE2 Dashboard</h1>
              <p className="text-sm text-muted-foreground">{dashboard?.project_name || "Projects IN Controlled Environments"}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {id && <DemoControls entityId={id} methodology="prince2" onChanged={fetchDashboard} />}
            <Button variant="outline" onClick={fetchDashboard} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              {pt("Refresh")}
            </Button>
          </div>
        </div>

        {/* Action Tracker KPI tiles (Today / Tomorrow / This Week / Next Week) — Yanmar ATR-05 */}
        {id && <TaskKpiTiles projectId={id} />}

        {/* Task sub-totals per category — Yanmar ATR-01 */}
        {id && <TaskCategorySubtotals projectId={id} />}

        {/* Quick link to the Communication Plan editor — Yanmar PP-08 */}
        {id && (
          <Button variant="outline" className="gap-2" onClick={() => navigate(`/projects/${id}/foundation/communication-plan`)}>
            <FileText className="h-4 w-4" /> {pt("Communication Plan")}
          </Button>
        )}

        {/* Due-date push-back approval queue — Yanmar PP-05 */}
        {id && <DueDateChangeRequestQueue projectId={id} canDecide />}

        {/* No stages warning */}
        {dashboard?.total_stages === 0 && (
          <Card className="border-amber-200 bg-amber-50/50">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-800">{pt("No stages defined yet")}</p>
                  <p className="text-sm text-amber-600">{pt("Initialize stages from the dashboard first")}</p>
                </div>
              </div>
              <Button onClick={initializeStages} disabled={initializing} className="gap-2">
                {initializing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {pt("Initialize Stages")}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{pt("Progress")}</p>
                <p className="text-2xl font-bold">{dashboard?.overall_progress || 0}%</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <Layers className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Stages</p>
                <p className="text-2xl font-bold">{dashboard?.completed_stages || 0} / {dashboard?.total_stages || 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{pt("Issues")}</p>
                <p className="text-2xl font-bold">{dashboard?.tolerances_exceeded || 0}</p>
                <p className="text-xs text-muted-foreground">{pt("tolerances exceeded")}</p>
              </div>
            </CardContent>
          </Card>
          <Card className={bg?.over_budget ? "border-rose-200" : ""}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${bg?.over_budget ? "bg-rose-100" : "bg-emerald-100"}`}>
                <Euro className={`h-5 w-5 ${bg?.over_budget ? "text-rose-600" : "text-emerald-600"}`} />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">{pt("Budget remaining")}</p>
                <p className={`text-2xl font-bold truncate ${bg?.over_budget ? "text-rose-600" : ""}`}>
                  {bg?.has_budget_data ? fmtMoney(bg?.total_remaining) : "—"}
                </p>
                {bg?.has_budget_data && (
                  <p className="text-xs text-muted-foreground truncate">
                    {fmtMoney(bg?.total_actual)} / {fmtMoney(bg?.total_planned)}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* PRINCE2 Process Flow */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Workflow className="h-5 w-5 text-purple-600" /> {pt("PRINCE2 Process Flow")}
              </CardTitle>
              <button
                type="button"
                onClick={() => navigate("/academy/course/prince2-foundation")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700 transition-colors hover:bg-purple-100 dark:border-purple-900/50 dark:bg-purple-950/30 dark:text-purple-300"
                title={pt("Open the PRINCE2 Foundation course in the Academy")}
              >
                <GraduationCap className="h-3.5 w-3.5" />
                {pt("PRINCE2 course")}
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <Prince2ProcessFlow current={dashboard?.current_process} progress={dashboard?.process_progress} onNavigate={nav} />
          </CardContent>
        </Card>

        {/* PRINCE2 methodology at a glance — 7 principles + 7 themes, linked to Academy */}
        <Prince2MethodologyOverview projectId={id} defaultOpen={true} />

        {/* Board approvals inbox + Budget governance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Board approvals inbox — Manage by Exception */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Inbox className="h-5 w-5 text-purple-600" /> {pt("Awaiting Board approval")}
                <Badge variant="outline" className="ml-1">{dashboard?.approvals_count || 0}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(dashboard?.approvals_inbox?.length || 0) === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <CheckCircle2 className="h-8 w-8 text-green-500 mb-2" />
                  <p className="text-sm text-muted-foreground">{pt("Nothing awaiting approval — the board is up to date.")}</p>
                </div>
              ) : (
                dashboard.approvals_inbox.map((item: any) => {
                  const Icon = approvalIcon[item.kind] || Gavel;
                  const canReject = item.kind === "stage_gate";
                  return (
                    <div key={`${item.kind}-${item.id}`} className="flex items-center justify-between gap-3 p-3 border rounded-lg">
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className={`h-5 w-5 shrink-0 ${approvalTint[item.kind] || ""}`} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{item.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{pt(item.subtitle)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          size="sm" variant="default" className="gap-1 h-8"
                          disabled={!!acting}
                          onClick={() => actOnApproval(item, "approve")}
                        >
                          {acting === `${item.kind}-${item.id}-approve`
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : <Check className="h-3.5 w-3.5" />}
                          {pt("Approve")}
                        </Button>
                        {canReject && (
                          <Button
                            size="sm" variant="outline" className="gap-1 h-8"
                            disabled={!!acting}
                            onClick={() => actOnApproval(item, "reject")}
                          >
                            {acting === `${item.kind}-${item.id}-reject`
                              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              : <X className="h-3.5 w-3.5" />}
                            {pt("Reject")}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Budget governance — planned vs actual vs remaining per stage */}
          <Card className={bg?.over_budget ? "border-rose-200" : ""}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Wallet className="h-5 w-5 text-emerald-600" /> {pt("Budget governance")}
                </CardTitle>
                <Button
                  variant="outline" size="sm" className="gap-1"
                  disabled={acting === "cost-check"}
                  onClick={checkCostTolerance}
                >
                  {acting === "cost-check" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Gavel className="h-3.5 w-3.5" />}
                  {pt("Check cost tolerance")}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {!bg?.has_budget_data ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Wallet className="h-8 w-8 text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground">{pt("No budget set yet. Add stage budgets in the Stage Plans.")}</p>
                  <Button variant="link" size="sm" className="mt-1" onClick={() => nav("stage-plan")}>{pt("Stage Plans")}</Button>
                </div>
              ) : (
                <>
                  {/* Totals row */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-md border p-2">
                      <p className="text-xs text-muted-foreground">{pt("Planned")}</p>
                      <p className="text-sm font-semibold">{fmtMoney(bg.total_planned)}</p>
                    </div>
                    <div className="rounded-md border p-2">
                      <p className="text-xs text-muted-foreground">{pt("Actual")}</p>
                      <p className="text-sm font-semibold">{fmtMoney(bg.total_actual)}</p>
                    </div>
                    <div className={`rounded-md border p-2 ${bg.over_budget ? "bg-rose-50 border-rose-200" : "bg-emerald-50 border-emerald-200"}`}>
                      <p className="text-xs text-muted-foreground">{pt("Remaining")}</p>
                      <p className={`text-sm font-semibold ${bg.over_budget ? "text-rose-600" : "text-emerald-700"}`}>{fmtMoney(bg.total_remaining)}</p>
                    </div>
                  </div>
                  {/* Spend bar */}
                  {bg.total_planned > 0 && (
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full ${bg.over_budget ? "bg-rose-500" : "bg-emerald-500"}`}
                        style={{ width: `${Math.min(100, Math.round((bg.total_actual / bg.total_planned) * 100))}%` }}
                      />
                    </div>
                  )}
                  {bg.active_cost_breach && (
                    <div className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 rounded-md px-2 py-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                      {pt("Active stage over budget")}: {bg.active_cost_breach.stage_name} — {fmtMoney(bg.active_cost_breach.actual)} / {fmtMoney(bg.active_cost_breach.planned)}
                    </div>
                  )}
                  {/* Per-stage breakdown */}
                  <div className="space-y-1.5">
                    {bg.stages.filter((s: any) => s.planned > 0 || s.actual > 0).map((s: any) => (
                      <div key={s.stage_id} className="flex items-center justify-between gap-2 text-sm">
                        <span className="truncate flex-1 min-w-0">{s.stage_name}</span>
                        <span className="text-xs text-muted-foreground shrink-0">{fmtMoney(s.actual)} / {fmtMoney(s.planned)}</span>
                        <span className={`text-xs font-medium w-16 text-right shrink-0 ${s.over_budget ? "text-rose-600" : "text-emerald-700"}`}>
                          {fmtMoney(s.remaining)}
                        </span>
                      </div>
                    ))}
                    {bg.stages.filter((s: any) => s.planned > 0 || s.actual > 0).length === 0 && (
                      <p className="text-xs text-muted-foreground italic">{pt("No per-stage budgets recorded.")}</p>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Risk + Exception/Issue widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Risk widget */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <ShieldAlert className="h-5 w-5 text-amber-500" /> {pt("Risks")}
                  <Badge variant="outline" className="ml-1">{dashboard?.open_risks_total || 0} {pt("open")}</Badge>
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => nav("risks")} className="gap-1">
                  {pt("Risk Register")} <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Badge className={riskBadge.high}>{pt("High")}: {dashboard?.risk_counts?.high || 0}</Badge>
                <Badge className={riskBadge.medium}>{pt("Medium")}: {dashboard?.risk_counts?.medium || 0}</Badge>
                <Badge className={riskBadge.low}>{pt("Low")}: {dashboard?.risk_counts?.low || 0}</Badge>
              </div>
              {dashboard?.top_risks?.length > 0 ? (
                <div className="space-y-1.5">
                  {dashboard.top_risks.map((r: any) => (
                    <div key={r.id} className="flex items-center justify-between p-2 border rounded-md hover:bg-muted/40 cursor-pointer" onClick={() => nav("risks")}>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{r.title}</p>
                        {r.mitigation && <p className="text-xs text-muted-foreground truncate">{pt("Response")}: {r.mitigation}</p>}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        <Badge className={`text-[10px] ${riskBadge[r.impact] || ""}`}>{pt("I")}:{r.impact}</Badge>
                        <Badge className={`text-[10px] ${riskBadge[r.probability] || ""}`}>{pt("P")}:{r.probability}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic py-2">{pt("No open risks recorded.")}</p>
              )}
            </CardContent>
          </Card>

          {/* Exceptions + Issues counters */}
          <div className="space-y-4">
            <Card className="cursor-pointer hover:bg-muted/50" onClick={() => nav("exception-reports")}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-rose-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{pt("Open Exceptions")}</p>
                  <p className="text-2xl font-bold">{dashboard?.open_exceptions || 0}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:bg-muted/50" onClick={() => nav("issues")}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <GitBranch className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{pt("Open Issues")}</p>
                  <p className="text-2xl font-bold">{dashboard?.open_issues_total || 0}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Documents */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:bg-muted/50" onClick={() => nav("project-brief")}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">{pt("Project Brief")}</p>
                  {dashboard?.has_brief
                    ? getStatusBadge(dashboard.brief_status)
                    : <span className="text-sm text-muted-foreground">Not created</span>
                  }
                </div>
              </div>
              {!dashboard?.has_brief && <Plus className="h-5 w-5 text-muted-foreground" />}
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-muted/50" onClick={() => nav("business-case")}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Briefcase className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">Business Case</p>
                  {dashboard?.has_business_case
                    ? getStatusBadge(dashboard.business_case_status)
                    : <span className="text-sm text-muted-foreground">Not created</span>
                  }
                </div>
              </div>
              {!dashboard?.has_business_case && <Plus className="h-5 w-5 text-muted-foreground" />}
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-muted/50" onClick={() => nav("governance")}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="font-medium">PID</p>
                  {dashboard?.has_pid
                    ? getStatusBadge(dashboard.pid_status)
                    : <span className="text-sm text-muted-foreground">Not created</span>
                  }
                </div>
              </div>
              {!dashboard?.has_pid && <Plus className="h-5 w-5 text-muted-foreground" />}
            </CardContent>
          </Card>
        </div>

        {/* Stages */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Stages</CardTitle>
              <Button variant="outline" size="sm" onClick={() => nav("stage-plan")} className="gap-1">
                <FileText className="h-3.5 w-3.5" /> {pt("Stage Plans")}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboard?.stages?.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">{pt("No stages defined yet")}</p>
            ) : (
              dashboard?.stages?.map((stage: any) => (
                <div
                  key={stage.id}
                  className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                    stage.status === "active" ? "border-blue-300 bg-blue-50/50" : ""
                  }`}
                  onClick={() => nav("stage-plan")}
                >
                  <div className="flex items-center gap-4">
                    <div className={`h-8 w-8 rounded-full ${getStageStatusColor(stage.status)} flex items-center justify-center text-white text-sm font-bold`}>
                      {stage.order}
                    </div>
                    <div>
                      <p className="font-medium">{stage.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline" className="text-xs">{stage.status}</Badge>
                        {stage.start_date && <span>{stage.start_date} - {stage.end_date || "..."}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">{stage.progress_percentage || 0}%</p>
                      <p className="text-xs text-muted-foreground">
                        {stage.work_packages_count || 0} WPs
                      </p>
                    </div>
                    <div className="w-24">
                      <Progress value={stage.progress_percentage || 0} className="h-2" />
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Quick Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: pt("Work Packages"), path: "work-packages", icon: Layers },
            { label: pt("Stage Gates"), path: "stage-gate", icon: CheckCircle2 },
            { label: pt("Tolerances"), path: "tolerances", icon: AlertTriangle },
            { label: pt("Project Board"), path: "project-board", icon: Shield },
          ].map(({ label, path, icon: Icon }) => (
            <Card
              key={path}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => nav(path)}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <Icon className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium text-sm">{label}</span>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Reports — always visible (Progress theme: report viability) */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" /> {pt("Highlight Reports")}
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => nav("highlight-report")}>
                {(dashboard?.recent_highlight_reports?.length || 0) > 0 ? pt("View All") : pt("Open reports")}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {(dashboard?.recent_highlight_reports?.length || 0) === 0 ? (
              <div className="rounded-lg border border-dashed bg-muted/20 py-8 text-center">
                <FileText className="mx-auto h-7 w-7 text-muted-foreground/40" />
                <p className="mt-2 text-sm font-medium">{pt("No Highlight Reports yet")}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {pt("Highlight Reports keep the Project Board informed of stage progress (Manage by Exception).")}
                </p>
                <Button size="sm" className="mt-3 gap-1.5" onClick={() => nav("highlight-report")}>
                  <Plus className="h-3.5 w-3.5" /> {pt("Create Highlight Report")}
                </Button>
              </div>
            ) : (
              dashboard.recent_highlight_reports.map((report: any) => (
                <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{report.title || `Report #${report.id}`}</p>
                    <p className="text-sm text-muted-foreground">{report.report_date}</p>
                  </div>
                  <Badge variant={report.overall_status === "green" ? "default" : "destructive"}>
                    {report.overall_status}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Prince2Dashboard;
