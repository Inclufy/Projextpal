import { Card } from "@/components/ui/card";
import { ProjectHeader } from "@/components/ProjectHeader";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus } from "lucide-react";

const MonitoringTraining = () => {
  const hasTrainingMaterials = false;

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">Training Materials</h1>
          <Button variant="link" className="text-primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Training Material
          </Button>
        </div>

        {!hasTrainingMaterials && (
          <Card className="p-12">
            <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
              <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-6">
                <BookOpen className="h-12 w-12 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-3">No training materials yet</h2>
              <p className="text-muted-foreground mb-6">
                Create training materials to help your team learn about the project. You can add guides, tutorials, and documentation.
              </p>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Create Training Material
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MonitoringTraining;
