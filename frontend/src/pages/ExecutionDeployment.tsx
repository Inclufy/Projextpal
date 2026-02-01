import { Card } from "@/components/ui/card";
import { ProjectHeader } from "@/components/ProjectHeader";
import { Button } from "@/components/ui/button";
import { CheckCircle, Edit, Trash2, Clock } from "lucide-react";

const ExecutionDeployment = () => {
  const strategies = [
    { id: 1, title: "Go to market", description: "Hoe de omscholingstrajecten te vermarkten", completed: true },
    { id: 2, title: "Marketing", description: "how to market the omscholing concept", completed: true },
  ];

  const rollOutPhases = [
    {
      title: "Intake",
      tasks: [{ text: "geintreseerden en aanmelders", completed: true }],
    },
    {
      title: "Assessment deelnemers",
      tasks: [{ text: "Inclufy laten afnemen", completed: true }],
    },
    {
      title: "Onboarding & Skill scan",
      tasks: [{ text: "Onboarding & Skill scan", completed: true }],
    },
  ];

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Deployment Strategy: Task Management Application
          </h1>
          <p className="text-muted-foreground mb-4">
            A comprehensive plan for deploying an AI-powered task management application, ensuring
            <br />
            scalability, reliability, and seamless AI integration.
          </p>
          <Button variant="outline" className="bg-primary text-primary-foreground hover:bg-primary/90">
            Review Sent For
          </Button>
        </div>

        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Deployment Strategy</h2>
            </div>
            <Button variant="ghost" size="icon">
              <Edit className="h-4 w-4 text-primary" />
            </Button>
          </div>
          
          <p className="text-sm italic text-muted-foreground mb-4">No strategy overview yet.</p>
          
          <div className="space-y-3">
            {strategies.map((strategy) => (
              <div key={strategy.id} className="flex items-start justify-between p-3 rounded-lg border border-border">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">
                      {strategy.title}: <span className="font-normal">{strategy.description}</span>
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Edit className="h-4 w-4 text-primary" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          <Button className="mt-4 bg-primary hover:bg-primary/90">
            Add Strategy Item
          </Button>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Roll-Out Plan</h2>
            </div>
            <Button variant="ghost" size="icon">
              <Edit className="h-4 w-4 text-primary" />
            </Button>
          </div>
          
          <p className="text-sm italic text-muted-foreground mb-4">No roll-out overview yet.</p>
          
          <div className="space-y-4">
            {rollOutPhases.map((phase, index) => (
              <div key={index} className="border-l-4 border-primary pl-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-foreground">{phase.title}</h3>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit className="h-4 w-4 text-primary" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                {phase.tasks.map((task, taskIndex) => (
                  <div key={taskIndex} className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">{task.text}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto">
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                ))}
                <Button variant="link" className="text-primary p-0 h-auto text-sm">
                  + Add Task
                </Button>
              </div>
            ))}
          </div>
          
          <Button className="mt-4 bg-primary hover:bg-primary/90">
            Add Phase
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default ExecutionDeployment;
