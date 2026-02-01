import { ProjectHeader } from "@/components/ProjectHeader";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";

const PlanningRaci = () => {
  const teamMembers = [
    "Ramak Noor (Project Manager)",
    "Sami (Project Manager)",
    "Abraham (Project Manager)",
    "Lucky Ali (Admin)",
  ];

  const tasks = ["test1", "Design sign off"];

  const raciLegend = [
    { letter: "R", label: "Responsible", color: "bg-primary text-primary-foreground" },
    { letter: "A", label: "Accountable", color: "bg-primary text-primary-foreground" },
    { letter: "C", label: "Consulted", color: "bg-warning text-warning-foreground" },
    { letter: "I", label: "Informed", color: "bg-pink-500 text-white" },
  ];

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">RACI Matrix for RACI Matrix</h1>
          <p className="text-muted-foreground mb-4">Responsibility Assignment Matrix for Project Tasks</p>
          <Input placeholder="Search tasks..." className="max-w-xs" />
        </div>

        <div className="bg-card rounded-lg border border-border overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="bg-primary text-primary-foreground py-4 px-6 text-left font-semibold border-r border-primary/20">
                    TASK/
                    <br />
                    ACTIVITIES
                  </th>
                  {teamMembers.map((member) => (
                    <th
                      key={member}
                      className="bg-primary text-primary-foreground py-4 px-6 text-center font-semibold border-r border-primary/20 last:border-r-0"
                    >
                      {member}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tasks.map((task, taskIndex) => (
                  <tr key={task} className="border-b border-border last:border-b-0">
                    <td className="bg-primary text-primary-foreground py-4 px-6 font-medium border-r border-border">
                      {task}
                    </td>
                    {teamMembers.map((member, memberIndex) => (
                      <td
                        key={member}
                        className="bg-muted/20 py-4 px-6 text-center border-r border-border last:border-r-0"
                      >
                        <div className="flex items-center justify-center gap-2">
                          {taskIndex === 0 && memberIndex === 3 ? (
                            <span className="text-xl font-bold text-primary">R</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 p-0 hover:bg-primary/10"
                          >
                            <Edit className="h-4 w-4 text-primary" />
                          </Button>
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex gap-6 flex-wrap">
          {raciLegend.map((item) => (
            <div key={item.letter} className="flex items-center gap-2">
              <Badge className={`${item.color} h-8 w-8 rounded-md flex items-center justify-center text-lg font-bold p-0`}>
                {item.letter}
              </Badge>
              <span className="text-foreground font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlanningRaci;
