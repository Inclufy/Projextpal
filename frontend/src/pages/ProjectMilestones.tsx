import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle, Clock, Loader2, Plus } from "lucide-react";
import { ProjectHeader } from "@/components/ProjectHeader";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001/api/v1';

const fetchProjectMilestones = async (projectId: string) => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/milestones/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) return [];
  return response.json();
};

const ProjectMilestones = () => {
  const { id } = useParams<{ id: string }>();

  const { data: milestones = [], isLoading } = useQuery({
    queryKey: ['project-milestones', id],
    queryFn: () => fetchProjectMilestones(id!),
    enabled: !!id,
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'in_progress':
      case 'in-progress':
        return <Clock className="h-6 w-6 text-blue-500" />;
      default:
        return <Circle className="h-6 w-6 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'in_progress':
      case 'in-progress':
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case 'at_risk':
        return <Badge className="bg-yellow-100 text-yellow-800">At Risk</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-full bg-background">
        <ProjectHeader />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Project Milestones</h1>
            <p className="text-muted-foreground">Track key project milestones and achievements</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Milestone
          </Button>
        </div>

        {milestones.length === 0 ? (
          <Card className="p-8 text-center">
            <Circle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No milestones yet</h3>
            <p className="text-muted-foreground mb-4">
              Add milestones to track key achievements
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add First Milestone
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {milestones.map((milestone: any, index: number) => (
              <Card key={milestone.id} className="p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="pt-1">
                    {getStatusIcon(milestone.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          {milestone.name || milestone.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {milestone.description || 'No description'}
                        </p>
                      </div>
                      {getStatusBadge(milestone.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Due:</span> {formatDate(milestone.due_date || milestone.date)}
                    </p>
                  </div>
                </div>
                {index < milestones.length - 1 && (
                  <div className="ml-3 mt-4 h-8 border-l-2 border-dashed border-border"></div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectMilestones;
