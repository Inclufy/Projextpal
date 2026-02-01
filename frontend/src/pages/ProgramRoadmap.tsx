import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProjectHeader } from '@/components/ProjectHeader';
import { Map, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001/api/v1';

const fetchProgramProjects = async (programId: string) => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_BASE_URL}/programs/${programId}/projects/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) return [];
  return response.json();
};

const COLORS = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500', 'bg-cyan-500', 'bg-pink-500'];

const ProgramRoadmap = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const { data: projectsData = [], isLoading } = useQuery({
    queryKey: ['program-projects-roadmap', id],
    queryFn: () => fetchProgramProjects(id!),
    enabled: !!id,
  });

  const projects = Array.isArray(projectsData) ? projectsData : projectsData.results || [];

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = new Date().getMonth();

  // Calculate project positions on timeline
  const projectsWithPosition = useMemo(() => {
    return projects.map((project: any, index: number) => {
      const startDate = project.start_date ? new Date(project.start_date) : new Date();
      const endDate = project.end_date ? new Date(project.end_date) : new Date();
      
      const startMonth = startDate.getFullYear() === currentYear 
        ? startDate.getMonth() 
        : (startDate.getFullYear() < currentYear ? 0 : 12);
      
      const endMonth = endDate.getFullYear() === currentYear 
        ? endDate.getMonth() 
        : (endDate.getFullYear() > currentYear ? 11 : -1);
      
      return {
        ...project,
        color: COLORS[index % COLORS.length],
        startMonth: Math.max(0, Math.min(11, startMonth)),
        endMonth: Math.max(0, Math.min(11, endMonth)),
      };
    }).filter((p: any) => p.endMonth >= 0 && p.startMonth <= 11);
  }, [projects, currentYear]);

  // Find dependencies (projects that reference each other)
  const dependencies = useMemo(() => {
    const deps: any[] = [];
    projects.forEach((project: any) => {
      if (project.dependencies) {
        project.dependencies.forEach((depId: number) => {
          const depProject = projects.find((p: any) => p.id === depId);
          if (depProject) {
            deps.push({
              from: depProject.id,
              to: project.id,
              fromName: depProject.name,
              toName: project.name,
              description: `${depProject.name} → ${project.name}`,
            });
          }
        });
      }
    });
    return deps;
  }, [projects]);

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
              <Map className="h-6 w-6 text-indigo-600" />
              Program Roadmap
            </h1>
            <p className="text-muted-foreground">Timeline view of all projects</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => setCurrentYear(currentYear - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline">{currentYear}</Button>
            <Button variant="outline" size="icon" onClick={() => setCurrentYear(currentYear + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Roadmap */}
        <Card>
          <CardContent className="pt-6">
            {projects.length === 0 ? (
              <div className="text-center py-12">
                <Map className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No projects in this program yet</p>
              </div>
            ) : (
              <>
                {/* Month Headers */}
                <div className="flex border-b pb-2 mb-4">
                  <div className="w-48 shrink-0 font-medium">Project</div>
                  {months.map((month, i) => (
                    <div 
                      key={month} 
                      className={`flex-1 text-center text-sm ${i === currentMonth && currentYear === new Date().getFullYear() ? 'font-bold text-indigo-600' : 'text-muted-foreground'}`}
                    >
                      {month}
                    </div>
                  ))}
                </div>

                {/* Project Rows */}
                <div className="space-y-4">
                  {projectsWithPosition.map((proj: any) => (
                    <div key={proj.id} className="flex items-center h-12">
                      <div 
                        className="w-48 shrink-0 pr-4 cursor-pointer hover:text-indigo-600"
                        onClick={() => navigate(`/projects/${proj.id}/foundation/overview`)}
                      >
                        <p className="font-medium text-sm truncate">{proj.name}</p>
                      </div>
                      <div className="flex-1 flex relative">
                        {/* Grid lines */}
                        {months.map((_, i) => (
                          <div 
                            key={i} 
                            className={`flex-1 border-l border-dashed ${i === currentMonth && currentYear === new Date().getFullYear() ? 'border-indigo-300' : 'border-gray-200'}`} 
                          />
                        ))}
                        {/* Project Bar */}
                        <div 
                          className={`absolute h-8 ${proj.color} rounded-full flex items-center px-3 text-white text-xs font-medium cursor-pointer hover:opacity-80`}
                          style={{
                            left: `${(proj.startMonth / 12) * 100}%`,
                            width: `${((proj.endMonth - proj.startMonth + 1) / 12) * 100}%`,
                            minWidth: '40px',
                          }}
                          onClick={() => navigate(`/projects/${proj.id}/foundation/overview`)}
                        >
                          <span className="truncate">{proj.progress || 0}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Dependencies */}
        {dependencies.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Project Dependencies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dependencies.map((dep: any, i: number) => {
                  const fromProject = projectsWithPosition.find((p: any) => p.id === dep.from);
                  const toProject = projectsWithPosition.find((p: any) => p.id === dep.to);
                  return (
                    <div key={i} className="flex items-center gap-4 p-3 border rounded-lg">
                      <Badge className={fromProject?.color || 'bg-gray-500'}>{dep.fromName}</Badge>
                      <span className="text-muted-foreground">→</span>
                      <Badge className={toProject?.color || 'bg-gray-500'}>{dep.toName}</Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Legend */}
        {projectsWithPosition.length > 0 && (
          <div className="flex gap-6 justify-center flex-wrap">
            {projectsWithPosition.map((proj: any) => (
              <div key={proj.id} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded ${proj.color}`} />
                <span className="text-sm">{proj.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgramRoadmap;
