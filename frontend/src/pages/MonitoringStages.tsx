import { Card } from "@/components/ui/card";
import { ProjectHeader } from "@/components/ProjectHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Plus } from "lucide-react";

const MonitoringStages = () => {
  const stages = [
    { id: "01", name: "STAGE 01", status: "pending", linkedDocs: 0 },
    { id: "02", name: "STAGE 02", status: "pending", linkedDocs: 0 },
    { id: "03", name: "STAGE 03", status: "pending", linkedDocs: 0 },
    { id: "04", name: "STAGE 04", status: "pending", linkedDocs: 0 },
  ];

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6">
        <h1 className="text-2xl font-bold text-foreground mb-6">Documents</h1>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-6">Stages</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stages.map((stage) => (
              <Card key={stage.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-semibold text-foreground">{stage.name}</h3>
                  <Badge variant="outline" className="text-xs">
                    {stage.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {stage.linkedDocs} linked documents
                </p>
                <div className="flex gap-2">
                  <Button variant="link" className="text-primary p-0 h-auto">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button variant="link" className="text-primary p-0 h-auto">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Document
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MonitoringStages;
