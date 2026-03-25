import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ProjectHeader } from '@/components/ProjectHeader';
import { Users, AlertTriangle, CheckCircle2, User, Loader2, Plus } from 'lucide-react';
import { usePageTranslations } from '@/hooks/usePageTranslations';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001/api/v1';

const fetchProgramResources = async (programId: string) => {
  const token = localStorage.getItem("access_token");
  // Try program-specific resources first
  const response = await fetch(`${API_BASE_URL}/programs/${programId}/resources/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    // Fallback to team members
    const teamResponse = await fetch(`${API_BASE_URL}/auth/company-users/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!teamResponse.ok) return [];
    return teamResponse.json();
  }
  return response.json();
};

const ProgramResources = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();

  const { data: resourcesData = [], isLoading } = useQuery({
    queryKey: ['program-resources', id],
    queryFn: () => fetchProgramResources(id!),
    enabled: !!id,
  });

  const resources = Array.isArray(resourcesData) ? resourcesData : resourcesData.results || [];

  // Calculate summary
  const summary = {
    total: resources.length,
    allocated: resources.filter((r: any) => r.allocation >= 80 && r.allocation <= 100).length,
    available: resources.filter((r: any) => r.allocation < 80).length,
    overallocated: resources.filter((r: any) => r.allocation > 100).length,
  };

  // Find conflicts
  const conflicts = resources
    .filter((r: any) => r.allocation > 100)
    .map((r: any) => ({
      resource: r.name,
      issue: `Overallocated by ${r.allocation - 100}%`,
      projects: r.projects || [],
      severity: r.allocation > 120 ? 'high' : 'medium',
    }));

  const getStatusColor = (allocation: number) => {
    if (allocation > 100) return 'bg-red-500';
    if (allocation >= 80) return 'bg-green-500';
    return 'bg-blue-500';
  };

  const getStatusLabel = (allocation: number) => {
    if (allocation > 100) return 'overallocated';
    if (allocation >= 80) return 'allocated';
    return 'available';
  };

  const getAllocationColor = (allocation: number) => {
    if (allocation > 100) return 'text-red-600';
    if (allocation >= 80) return 'text-green-600';
    return 'text-blue-600';
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
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Users className="h-6 w-6 text-indigo-600" />
              {pt("Resource Management")}
            </h1>
            <p className="text-muted-foreground">{pt("Manage resources across program projects")}</p>
          </div>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="h-4 w-4 mr-2" />
            {pt("Add Resource")}
          </Button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-sm text-muted-foreground">{pt("Total Resources")}</p>
              <p className="text-3xl font-bold">{summary.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-sm text-muted-foreground">{pt("Fully Allocated")}</p>
              <p className="text-3xl font-bold text-green-600">{summary.allocated}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-sm text-muted-foreground">{pt("Available Capacity")}</p>
              <p className="text-3xl font-bold text-blue-600">{summary.available}</p>
            </CardContent>
          </Card>
          <Card className={summary.overallocated > 0 ? 'border-red-200 bg-red-50' : ''}>
            <CardContent className="pt-4 text-center">
              <p className="text-sm text-muted-foreground">{pt("Overallocated")}</p>
              <p className={`text-3xl font-bold ${summary.overallocated > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {summary.overallocated}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Resource Conflicts */}
        {conflicts.length > 0 && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-700">
                <AlertTriangle className="h-5 w-5" />
                {pt("Resource Conflicts")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {conflicts.map((conflict: any, i: number) => (
                <div key={i} className="p-3 bg-white rounded-lg border border-yellow-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{conflict.resource}</span>
                    <Badge className={conflict.severity === 'high' ? 'bg-red-500' : 'bg-yellow-500'}>
                      {conflict.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{conflict.issue}</p>
                  {conflict.projects.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {conflict.projects.map((proj: string, j: number) => (
                        <Badge key={j} variant="outline">{proj}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Resource Table */}
        <Card>
          <CardHeader>
            <CardTitle>{pt("Resource Allocation")}</CardTitle>
          </CardHeader>
          <CardContent>
            {resources.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">{pt("No resources assigned yet")}</p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {pt("Add First Resource")}
                </Button>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3">{pt("Name")}</th>
                    <th className="pb-3">{pt("Role")}</th>
                    <th className="pb-3">{pt("Projects")}</th>
                    <th className="pb-3">{pt("Allocation")}</th>
                    <th className="pb-3">{pt("Status")}</th>
                  </tr>
                </thead>
                <tbody>
                  {resources.map((resource: any) => {
                    const allocation = resource.allocation || 0;
                    return (
                      <tr key={resource.id} className="border-b hover:bg-muted/50">
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
                              {resource.name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                            </div>
                            <span className="font-medium">{resource.name}</span>
                          </div>
                        </td>
                        <td className="py-3 text-sm text-muted-foreground">{resource.role || '-'}</td>
                        <td className="py-3">
                          <div className="flex flex-wrap gap-1">
                            {(resource.projects || []).map((proj: string, i: number) => (
                              <Badge key={i} variant="outline" className="text-xs">{proj}</Badge>
                            ))}
                            {(!resource.projects || resource.projects.length === 0) && (
                              <span className="text-sm text-muted-foreground">-</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={Math.min(allocation, 100)} 
                              className={`h-2 w-20 ${allocation > 100 ? '[&>div]:bg-red-500' : ''}`} 
                            />
                            <span className={`font-medium ${getAllocationColor(allocation)}`}>
                              {allocation}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3">
                          <Badge className={getStatusColor(allocation)}>
                            {getStatusLabel(allocation)}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProgramResources;
