import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectHeader } from "@/components/ProjectHeader";

const FoundationWorkflow = () => {
  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6">
      <Card className="p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Project Approval Workflow</h2>
              <p className="text-sm text-muted-foreground">Review and approve projects through multiple stages</p>
            </div>
            <Button className="bg-primary">
              + Add Approval Stage
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { stage: "01", title: "Initial Review", desc: "Project proposal is reviewed by department heads", status: "1 total" },
            { stage: "02", title: "Technical Assessment", desc: "Technical team evaluates feasibility and requirements", status: "2 total" },
            { stage: "03", title: "Budget Review", desc: "Finance team reviews budget allocation and cost structure", status: "3 total" },
            { stage: "04", title: "Executive Approval", desc: "Executive committee reviews and provides final approval", status: "4 total" },
          ].map((item) => (
            <Card key={item.stage} className="p-4 border-l-4 border-l-primary">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="secondary">STAGE {item.stage}</Badge>
                <Badge variant="outline">Workflow</Badge>
              </div>
              <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
              <p className="text-xs text-muted-foreground mb-4">{item.desc}</p>
              <Button variant="outline" size="sm" className="w-full mb-2">
                Review & Approve
              </Button>
              <div className="flex items-center justify-between text-xs">
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {item.status}
                </Badge>
                <span className="text-muted-foreground">Done</span>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
    </div>
  );
};

export default FoundationWorkflow;
