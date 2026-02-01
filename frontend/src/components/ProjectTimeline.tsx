import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useState, useMemo } from "react";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001/api/v1';

interface Task {
  id: string;
  name: string;
  description?: string;
  status: string;
  priority: string;
  assignee_name?: string;
  start_date: string;
  due_date: string;
  progress?: number;
}

const fetchProjectTasks = async (projectId: string) => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/tasks/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) return [];
  const data = await response.json();
  return Array.isArray(data) ? data : data.results || [];
};

export function ProjectTimeline() {
  const { id } = useParams<{ id: string }>();
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentQuarter, setCurrentQuarter] = useState(Math.ceil((new Date().getMonth() + 1) / 3));

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['project-tasks-timeline', id],
    queryFn: () => fetchProjectTasks(id!),
    enabled: !!id,
  });

  // Calculate months for current quarter
  const months = useMemo(() => {
    const startMonth = (currentQuarter - 1) * 3;
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return [
      `${monthNames[startMonth]} ${currentYear}`,
      `${monthNames[startMonth + 1]} ${currentYear}`,
      `${monthNames[startMonth + 2]} ${currentYear}`,
    ];
  }, [currentYear, currentQuarter]);

  const daysInMonth = 31;

  // Calculate task position on timeline
  const getTaskPosition = (task: Task) => {
    const quarterStart = new Date(currentYear, (currentQuarter - 1) * 3, 1);
    const quarterEnd = new Date(currentYear, currentQuarter * 3, 0);
    const quarterDays = (quarterEnd.getTime() - quarterStart.getTime()) / (1000 * 60 * 60 * 24);
    
    const taskStart = new Date(task.start_date);
    const taskEnd = new Date(task.due_date);
    
    const startOffset = Math.max(0, (taskStart.getTime() - quarterStart.getTime()) / (1000 * 60 * 60 * 24));
    const endOffset = Math.min(quarterDays, (taskEnd.getTime() - quarterStart.getTime()) / (1000 * 60 * 60 * 24));
    const duration = Math.max(1, endOffset - startOffset);
    
    return {
      left: `${(startOffset / quarterDays) * 100}%`,
      width: `${(duration / quarterDays) * 100}%`,
    };
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'rgba(34, 197, 94, 0.7)';
      case 'in_progress': return 'rgba(59, 130, 246, 0.7)';
      case 'at_risk': return 'rgba(245, 158, 11, 0.7)';
      default: return 'rgba(255, 255, 255, 0.3)';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'critical': return 'Critical';
      case 'high': return 'High';
      case 'medium': return 'Medium';
      case 'low': return 'Low';
      default: return 'Normal';
    }
  };

  const prevQuarter = () => {
    if (currentQuarter === 1) {
      setCurrentQuarter(4);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentQuarter(currentQuarter - 1);
    }
  };

  const nextQuarter = () => {
    if (currentQuarter === 4) {
      setCurrentQuarter(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentQuarter(currentQuarter + 1);
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-primary text-primary-foreground p-8">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-primary text-primary-foreground">
      <div className="p-4 flex items-center justify-between border-b border-primary-foreground/20">
        <h2 className="text-lg font-semibold">Project Timeline</h2>
        <p className="text-sm opacity-90">Track project progress, milestones, and deliverables</p>
        <div className="flex items-center gap-2">
          <Button 
            variant="secondary" 
            size="sm" 
            className="bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground border-0"
          >
            {currentYear}
          </Button>
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
              onClick={prevQuarter}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium px-2">Q{currentQuarter}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
              onClick={nextQuarter}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[1200px]">
          {/* Header Row */}
          <div className="flex border-b border-primary-foreground/20 bg-primary-hover">
            <div className="w-48 px-4 py-2 text-sm font-medium border-r border-primary-foreground/20">
              Task
            </div>
            <div className="w-24 px-4 py-2 text-sm font-medium border-r border-primary-foreground/20">
              Status
            </div>
            <div className="w-24 px-4 py-2 text-sm font-medium border-r border-primary-foreground/20">
              Priority
            </div>
            <div className="w-32 px-4 py-2 text-sm font-medium border-r border-primary-foreground/20">
              Assignee
            </div>
            <div className="flex-1 px-4 py-2">
              <div className="flex">
                {months.map((month, idx) => (
                  <div key={idx} className="flex-1 text-center text-sm font-medium">
                    {month}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Task Rows */}
          {tasks.length === 0 ? (
            <div className="p-8 text-center opacity-70">
              No tasks found for this quarter. Add tasks to see them on the timeline.
            </div>
          ) : (
            tasks.map((task: Task) => {
              const position = getTaskPosition(task);
              return (
                <div key={task.id} className="flex border-b border-primary-foreground/10 hover:bg-primary-hover/50">
                  <div className="w-48 px-4 py-3 text-sm border-r border-primary-foreground/10 truncate">
                    {task.name}
                  </div>
                  <div className="w-24 px-4 py-3 text-sm border-r border-primary-foreground/10 capitalize">
                    {task.status?.replace('_', ' ') || 'Pending'}
                  </div>
                  <div className="w-24 px-4 py-3 text-sm border-r border-primary-foreground/10">
                    {getPriorityLabel(task.priority)}
                  </div>
                  <div className="w-32 px-4 py-3 text-sm border-r border-primary-foreground/10 truncate">
                    {task.assignee_name || '-'}
                  </div>
                  <div className="flex-1 px-4 py-3 relative">
                    {/* Grid lines */}
                    <div className="absolute inset-y-0 left-0 right-0 flex">
                      {months.map((_, monthIdx) => (
                        <div key={monthIdx} className="flex-1 border-r border-primary-foreground/10" />
                      ))}
                    </div>
                    {/* Task Bar */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 h-6 rounded-full flex items-center justify-center text-xs font-medium px-2"
                      style={{
                        left: position.left,
                        width: position.width,
                        minWidth: '20px',
                        background: getStatusColor(task.status),
                      }}
                    >
                      {task.progress !== undefined && `${task.progress}%`}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="px-4 py-2 text-xs opacity-75 border-t border-primary-foreground/20">
        Showing Q{currentQuarter} {currentYear} • {tasks.length} tasks
      </div>
    </Card>
  );
}
