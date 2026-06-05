import { Card } from "@/components/ui/card";
import { ProjectHeader } from "@/components/ProjectHeader";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, FileBarChart } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useProject } from "@/hooks/useApi";
import { doctrineReportPath } from "@/lib/methodologyRoutes";
import { usePageTranslations } from '@/hooks/usePageTranslations';

const ExecutionStatusReporting = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: project } = useProject(id);
  const doctrinePath = id ? doctrineReportPath(id, project?.methodology) : null;
  const reports = [
    { id: 3, status: "In Progress", progress: 10, lastUpdated: "2025-12-12" },
    { id: 2, status: "In Progress", progress: 50, lastUpdated: "2025-10-10" },
  ];

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6">
        <div className="flex items-center justify-end gap-2 mb-6">
          {doctrinePath && (
            <Button variant="outline" onClick={() => navigate(doctrinePath)} className="gap-2" title={pt("Open the methodology-specific doctrine report for this project")}>
              <FileBarChart className="h-4 w-4" />
              {pt("Methodology report")}
            </Button>
          )}
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            {pt("Add Report")}
          </Button>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium text-muted-foreground text-sm">{pt("REPORT ID")}</th>
                  <th className="text-left p-4 font-medium text-muted-foreground text-sm">{pt("STATUS")}</th>
                  <th className="text-left p-4 font-medium text-muted-foreground text-sm">{pt("PROGRESS (%)")}</th>
                  <th className="text-left p-4 font-medium text-muted-foreground text-sm">{pt("LAST UPDATED")}</th>
                  <th className="text-left p-4 font-medium text-muted-foreground text-sm">{pt("ACTIONS")}</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id} className="border-t border-border">
                    <td className="p-4 text-foreground font-medium">{report.id}</td>
                    <td className="p-4 text-foreground">{pt(report.status)}</td>
                    <td className="p-4 text-foreground">{report.progress}%</td>
                    <td className="p-4 text-foreground">{report.lastUpdated}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4 text-primary" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ExecutionStatusReporting;
