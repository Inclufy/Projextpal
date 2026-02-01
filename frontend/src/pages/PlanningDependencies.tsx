import { ProjectHeader } from "@/components/ProjectHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Dependency {
  id: string;
  title: string;
  type: string;
  status: string;
  description: string;
}

const PlanningDependencies = () => {
  const dependencies: Dependency[] = [
    {
      id: "1",
      title: "Backoffice",
      type: "Task",
      status: "In Progress",
      description: "without backoffice unable to launch website",
    },
    {
      id: "2",
      title: "AWS server",
      type: "External",
      status: "Scheduled",
      description: "Without AWS server unable to host website",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "in progress":
        return "bg-primary text-primary-foreground";
      case "scheduled":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">Project Dependencies</h1>
          <Button className="bg-primary hover:bg-primary-hover">Add Dependency</Button>
        </div>

        <div className="space-y-4">
          {dependencies.map((dependency) => (
            <Card key={dependency.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-foreground">{dependency.title}</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">Type:</span>
                      <span className="text-sm text-foreground">{dependency.type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">Status:</span>
                      <Badge className={getStatusColor(dependency.status)}>{dependency.status}</Badge>
                    </div>
                    <p className="text-sm text-foreground mt-3">{dependency.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button variant="ghost" className="text-primary hover:text-primary-hover hover:bg-primary/10">
                    Edit
                  </Button>
                  <Button variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlanningDependencies;
