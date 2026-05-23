import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProjectHeader } from "@/components/ProjectHeader";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { Loader2, CheckCircle2, Circle, AlertCircle, CheckSquare, ArrowRight } from "lucide-react";

type ChecklistItem = {
  id: string;
  label: string;
  description: string;
  link: string;
  status: "done" | "partial" | "todo";
  detail?: string;
};

const Prince2ClosureChecklist = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };

  const fetchData = async () => {
    try {
      const [bcRes, erRes, lRes, bRes, wpRes] = await Promise.all([
        fetch(`/api/v1/projects/${id}/prince2/business-case/`, { headers }),
        fetch(`/api/v1/projects/${id}/prince2/end-project-report/`, { headers }),
        fetch(`/api/v1/projects/${id}/prince2/lessons/`, { headers }),
        fetch(`/api/v1/projects/${id}/prince2/benefits/`, { headers }),
        fetch(`/api/v1/projects/${id}/prince2/work-packages/`, { headers }),
      ]);

      const businessCases = bcRes.ok ? await bcRes.json() : [];
      const bcList = Array.isArray(businessCases) ? businessCases : businessCases.results || [];

      const endReports = erRes.ok ? await erRes.json() : [];
      const erList = Array.isArray(endReports) ? endReports : endReports.results || [];

      const lessons = lRes.ok ? await lRes.json() : [];
      const lList = Array.isArray(lessons) ? lessons : lessons.results || [];

      const benefits = bRes.ok ? await bRes.json() : [];
      const bList = Array.isArray(benefits) ? benefits : benefits.results || [];

      const workPackages = wpRes.ok ? await wpRes.json() : [];
      const wpList = Array.isArray(workPackages) ? workPackages : workPackages.results || [];

      const endReport = erList[0];

      const openWorkPackages = wpList.filter((w: any) => w.status && w.status !== "completed" && w.status !== "approved" && w.status !== "closed");

      const checklist: ChecklistItem[] = [
        {
          id: "business-case",
          label: pt("Business Case approved"),
          description: pt("The Business Case must be created and approved before closure."),
          link: `/projects/${id}/prince2/business-case`,
          status: bcList.length > 0 ? "done" : "todo",
          detail: bcList.length > 0 ? pt("Business Case exists") : pt("No Business Case yet"),
        },
        {
          id: "work-packages",
          label: pt("All work packages completed"),
          description: pt("No open or in-progress work packages should remain at closure."),
          link: `/projects/${id}/prince2/work-packages`,
          status: openWorkPackages.length === 0 && wpList.length > 0 ? "done" : openWorkPackages.length === 0 ? "todo" : "partial",
          detail: openWorkPackages.length === 0
            ? (wpList.length > 0 ? `${wpList.length} ${pt("completed")}` : pt("No work packages"))
            : `${openWorkPackages.length} ${pt("still open")}`,
        },
        {
          id: "end-report",
          label: pt("End Project Report created"),
          description: pt("Document achievements, performance, benefits achieved, quality review and follow-on actions."),
          link: `/projects/${id}/prince2/end-project-report`,
          status: endReport ? (endReport.status === "approved" ? "done" : "partial") : "todo",
          detail: endReport ? `${pt("Status")}: ${endReport.status}` : pt("Not started"),
        },
        {
          id: "end-report-approved",
          label: pt("End Project Report approved"),
          description: pt("The Project Board must approve the End Project Report."),
          link: `/projects/${id}/prince2/end-project-report`,
          status: endReport?.status === "approved" ? "done" : "todo",
          detail: endReport?.status === "approved" ? pt("Approved") : pt("Awaiting approval"),
        },
        {
          id: "lessons",
          label: pt("Lessons captured"),
          description: pt("Lessons should be logged for the benefit of future projects."),
          link: `/projects/${id}/prince2/lessons-log`,
          status: lList.length >= 3 ? "done" : lList.length > 0 ? "partial" : "todo",
          detail: `${lList.length} ${pt("lessons recorded")}`,
        },
        {
          id: "benefits",
          label: pt("Benefits Review documented"),
          description: pt("Realised benefits should be recorded against the planned ones."),
          link: `/projects/${id}/prince2/benefits-review`,
          status: endReport?.benefits_achieved
            ? "done"
            : bList.length > 0
              ? "partial"
              : "todo",
          detail: endReport?.benefits_achieved
            ? pt("Realised benefits documented")
            : `${bList.length} ${pt("planned benefits, realisation not yet recorded")}`,
        },
        {
          id: "follow-on",
          label: pt("Follow-on actions documented"),
          description: pt("Any outstanding items not delivered should be captured for handover."),
          link: `/projects/${id}/prince2/end-project-report`,
          status: endReport?.follow_on_actions ? "done" : "todo",
          detail: endReport?.follow_on_actions ? pt("Documented") : pt("Not documented"),
        },
      ];

      setItems(checklist);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  const doneCount = items.filter((i) => i.status === "done").length;
  const partialCount = items.filter((i) => i.status === "partial").length;
  const percent = items.length > 0 ? Math.round((doneCount / items.length) * 100) : 0;

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckSquare className="h-6 w-6 text-emerald-500" />
            <div>
              <h1 className="text-2xl font-bold">{pt("Closure Checklist")}</h1>
              <p className="text-sm text-muted-foreground">{pt("Make sure each item is complete before formally closing the project.")}</p>
            </div>
          </div>
          <Badge className="text-sm" variant={percent === 100 ? "default" : "outline"}>
            {doneCount} / {items.length} {pt("complete")} ({percent}%)
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{pt("Readiness")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <div
                className={percent === 100 ? "bg-emerald-500 h-3" : percent >= 60 ? "bg-amber-500 h-3" : "bg-red-500 h-3"}
                style={{ width: `${percent}%`, transition: "width 0.3s" }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {doneCount} {pt("done")} · {partialCount} {pt("partial")} · {items.length - doneCount - partialCount} {pt("to do")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{pt("Items")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {items.map((item) => (
                <Link
                  key={item.id}
                  to={item.link}
                  className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="mt-1">
                    {item.status === "done" ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : item.status === "partial" ? (
                      <AlertCircle className="h-5 w-5 text-amber-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{item.label}</p>
                      <Badge
                        variant={item.status === "done" ? "default" : item.status === "partial" ? "secondary" : "outline"}
                        className="text-xs"
                      >
                        {item.status === "done" ? pt("Done") : item.status === "partial" ? pt("Partial") : pt("To do")}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                    {item.detail && <p className="text-xs text-muted-foreground mt-1 italic">{item.detail}</p>}
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground mt-2" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Prince2ClosureChecklist;
