import { ProjectHeader } from "@/components/ProjectHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Square, Circle, Triangle, Pentagon, Hexagon, Octagon } from "lucide-react";

const PlanningWorkflowDiagram = () => {
  const shapes = [
    { name: "Rectangle", icon: Square, color: "text-primary" },
    { name: "Snip Rectangle", icon: Square, color: "text-primary" },
    { name: "Rounded Rectangle", icon: Square, color: "text-primary" },
    { name: "Diamond", icon: Square, color: "text-warning rotate-45" },
    { name: "Circle", icon: Circle, color: "text-success" },
    { name: "Parallelogram", icon: Square, color: "text-primary" },
    { name: "Triangle", icon: Triangle, color: "text-success" },
    { name: "Equilateral Triangle", icon: Triangle, color: "text-primary" },
    { name: "Pentagon", icon: Pentagon, color: "text-destructive" },
    { name: "Hexagon", icon: Hexagon, color: "text-primary" },
    { name: "Octagon", icon: Octagon, color: "text-warning" },
    { name: "Decagon", icon: Circle, color: "text-pink-500" },
  ];

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-4">WORKFLOW BUILDER</h1>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Drag and drop to add or rearrange steps</li>
            <li>• Zoom and pan map easily</li>
            <li>• Left-click to select</li>
          </ul>
        </div>

        <div className="grid grid-cols-[280px_1fr] gap-6">
          {/* Left Sidebar */}
          <div className="space-y-6">
            {/* Process Flow Controls */}
            <Card className="p-4">
              <h3 className="font-semibold text-foreground mb-4">Process Flow</h3>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="text-xs">
                  Add Start
                </Button>
                <Button className="bg-primary hover:bg-primary-hover text-xs" size="sm">
                  Add Step
                </Button>
                <Button className="bg-warning hover:bg-warning/90 text-xs" size="sm">
                  Add Decision
                </Button>
                <Button className="bg-destructive hover:bg-destructive/90 text-xs" size="sm">
                  Add End
                </Button>
                <Button variant="outline" size="sm" className="text-xs text-muted-foreground">
                  Delete
                </Button>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white text-xs" size="sm">
                  Clear All
                </Button>
              </div>
            </Card>

            {/* Shape Library */}
            <Card className="p-4">
              <h3 className="font-semibold text-foreground mb-4">Shape Library</h3>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="Select shape type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Shapes</SelectItem>
                  <SelectItem value="basic">Basic Shapes</SelectItem>
                  <SelectItem value="flowchart">Flowchart</SelectItem>
                </SelectContent>
              </Select>

              <div className="mt-4">
                <p className="text-sm font-medium text-muted-foreground mb-3">Available Shapes</p>
                <div className="grid grid-cols-2 gap-3">
                  {shapes.map((shape) => (
                    <div
                      key={shape.name}
                      className="flex flex-col items-center justify-center p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      <shape.icon className={`h-8 w-8 mb-2 ${shape.color}`} />
                      <span className="text-xs text-center text-muted-foreground">{shape.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Canvas Area */}
          <Card className="p-6 min-h-[600px] relative bg-muted/20">
            <div className="absolute top-4 right-4">
              <Button className="bg-success hover:bg-success/90">Save</Button>
            </div>
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>Drag shapes here to build your workflow</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PlanningWorkflowDiagram;
