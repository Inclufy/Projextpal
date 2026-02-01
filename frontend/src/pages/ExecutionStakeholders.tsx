import { Card } from "@/components/ui/card";
import { ProjectHeader } from "@/components/ProjectHeader";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const ExecutionStakeholders = () => {
  const stakeholders = [
    {
      name: "Zinedine",
      role: "Project assistant",
      contact: "Zine@inclufy.com",
      influence: "High",
      governanceType: "Team Member",
    },
    {
      name: "Salma",
      role: "Project manager",
      contact: "salma@inclufy.com",
      influence: "Medium",
      governanceType: "Sponsor",
    },
  ];

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Stakeholder Management</h1>
            <p className="text-muted-foreground">Identify and manage project stakeholders</p>
          </div>
          <Button className="bg-foreground text-background hover:bg-foreground/90">
            <Plus className="h-4 w-4 mr-2" />
            Add Stakeholder
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stakeholders.map((stakeholder) => (
            <Card key={stakeholder.name} className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">{stakeholder.name}</h3>
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">
                  <span className="font-medium">Role:</span> {stakeholder.role}
                </p>
                <p className="text-muted-foreground">
                  <span className="font-medium">Contact:</span> {stakeholder.contact}
                </p>
                <p className="text-muted-foreground">
                  <span className="font-medium">Influence:</span> {stakeholder.influence}
                </p>
                <p className="text-muted-foreground">
                  <span className="font-medium">Governance Type:</span> {stakeholder.governanceType}
                </p>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm">
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExecutionStakeholders;
