import { Card } from "@/components/ui/card";
import { ProjectHeader } from "@/components/ProjectHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Link as LinkIcon, ChevronDown, Calendar } from "lucide-react";

const MonitoringMilestones = () => {
  const milestones = [
    {
      title: "A functional Website & Bakcoffice",
      status: "In Progress",
      linkedDocs: 0,
      date: null,
    },
    {
      title: "Kick off",
      status: "In Progress",
      linkedDocs: 0,
      date: null,
    },
    {
      title: "Bugfree Procurement & Sales Portal",
      status: "In Progress",
      linkedDocs: 0,
      date: null,
    },
  ];

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-6">Milestones</h2>
          <div className="space-y-4">
            {milestones.map((milestone, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-semibold text-foreground">{milestone.title}</h3>
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        {milestone.status}
                      </Badge>
                      <Button variant="ghost" size="icon" className="ml-auto">
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {milestone.linkedDocs} linked documents
                    </p>
                    <div className="flex gap-3">
                      <Button variant="link" className="text-primary p-0 h-auto">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button variant="link" className="text-primary p-0 h-auto">
                        <LinkIcon className="h-4 w-4 mr-1" />
                        Link Document
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MonitoringMilestones;
