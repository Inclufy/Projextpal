import { ProjectHeader } from "@/components/ProjectHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Calendar, Database, Cloud } from "lucide-react";

interface Integration {
  id: string;
  name: string;
  icon: typeof MessageSquare;
  status: "connected" | "not-connected";
  color: string;
}

const PlanningSystemIntegration = () => {
  const integrations: Integration[] = [
    {
      id: "1",
      name: "Microsoft Teams",
      icon: MessageSquare,
      status: "connected",
      color: "text-primary",
    },
    {
      id: "2",
      name: "Outlook Calendar",
      icon: Calendar,
      status: "connected",
      color: "text-primary",
    },
    {
      id: "3",
      name: "Google Calendar",
      icon: Calendar,
      status: "not-connected",
      color: "text-success",
    },
    {
      id: "4",
      name: "Cloud Storage",
      icon: Database,
      status: "connected",
      color: "text-purple-600",
    },
  ];

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6">
        <h1 className="text-2xl font-bold text-foreground mb-6">System Integrations</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {integrations.map((integration) => (
            <Card key={integration.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`${integration.color}`}>
                    <integration.icon className="h-6 w-6" />
                  </div>
                  <span className="font-medium text-foreground">{integration.name}</span>
                </div>
                {integration.status === "connected" ? (
                  <Badge className="bg-primary text-primary-foreground hover:bg-primary">
                    Connected
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground border-muted-foreground">
                    Not Connected
                  </Badge>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlanningSystemIntegration;
