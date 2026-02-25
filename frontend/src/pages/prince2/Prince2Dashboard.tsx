import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ProjectHeader } from "@/components/ProjectHeader";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import {
  Loader2, RefreshCw, FileText, Briefcase, Shield,
  ChevronRight, AlertTriangle, CheckCircle2, Clock, Layers,
  Plus, TrendingUp
} from "lucide-react";
import { toast } from "sonner";

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
          <Button variant="outline" onClick={fetchDashboard} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            {pt("Refresh")}
          </Button>
        </div>

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{pt("Reports")}</p>
                <p className="text-2xl font-bold">{dashboard?.recent_highlight_reports?.length || 0}</p>
              </div>
            </CardContent>
          </Card>
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

        {/* Recent Reports */}
        {dashboard?.recent_highlight_reports?.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>{pt("Highlight Reports")}</CardTitle>
                <Button variant="outline" size="sm" onClick={() => nav("highlight-report")}>
                  {pt("View All")}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {dashboard.recent_highlight_reports.map((report: any) => (
                <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{report.title || `Report #${report.id}`}</p>
                    <p className="text-sm text-muted-foreground">{report.report_date}</p>
                  </div>
                  <Badge variant={report.overall_status === "green" ? "default" : "destructive"}>
                    {report.overall_status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Prince2Dashboard;
