import { ProjectHeader } from "@/components/ProjectHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { ChevronRight } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: "completed" | "in-progress" | "pending";
  priority: "high" | "medium" | "low";
  dueDate: string;
  assignee: {
    name: string;
    initial: string;
  };
  progress: number;
}

const PlanningTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "test1",
      description: "test123",
      status: "completed",
      priority: "high",
      dueDate: "2025-10-30",
      assignee: { name: "Lucky Ali", initial: "L" },
      progress: 100,
    },
    {
      id: "2",
      title: "Design sign off",
      description: "design sign off will eliminate discussions on delivery",
      status: "in-progress",
      priority: "high",
      dueDate: "2025-10-31",
      assignee: { name: "Sami", initial: "S" },
      progress: 0,
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-success text-success-foreground";
      case "in-progress":
        return "bg-primary text-primary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">Tasks</h1>
          <Button className="bg-primary hover:bg-primary-hover">Add Task</Button>
        </div>

        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30 border-b border-border">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Task
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Assignee
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-start gap-2">
                        <ChevronRight className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-foreground">{task.title}</div>
                          {task.description && (
                            <div className="text-sm text-muted-foreground mt-1">{task.description}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge
                        variant="outline"
                        className={getStatusColor(task.status)}
                      >
                        {task.status === "completed" && "● Completed"}
                        {task.status === "in-progress" && "● In Progress"}
                        {task.status === "pending" && "● Pending"}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-foreground">{task.priority}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-foreground">{task.dueDate}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-foreground">
                          {task.assignee.initial}
                        </div>
                        <span className="text-foreground">{task.assignee.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3 min-w-[120px]">
                        <Progress value={task.progress} className="h-2 flex-1" />
                        <span className="text-sm font-medium text-foreground w-10">{task.progress}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button className="bg-success hover:bg-success/90" size="sm">
                          Mark Complete
                        </Button>
                        <Button variant="destructive" size="sm">
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanningTasks;
