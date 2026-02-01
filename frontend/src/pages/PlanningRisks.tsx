import { ProjectHeader } from "@/components/ProjectHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertTriangle, Plus } from "lucide-react";

const PlanningRisks = () => {
  const hasRisks = false;

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">Risk Register</h1>
          <Button className="bg-foreground text-background hover:bg-foreground/90">
            <Plus className="h-4 w-4 mr-2" />
            Add Risk
          </Button>
        </div>

        {!hasRisks ? (
          <Card className="p-12">
            <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
              <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-6">
                <AlertTriangle className="h-12 w-12 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-3">No Risks Yet</h2>
              <p className="text-muted-foreground mb-6">
                Start identifying and managing potential risks for your project. Click the button below to add your first risk.
              </p>
              <Button className="bg-foreground text-background hover:bg-foreground/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Risk
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Risk items would be displayed here when they exist */}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanningRisks;
