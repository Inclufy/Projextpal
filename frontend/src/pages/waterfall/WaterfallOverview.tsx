import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ProjectHeader } from '@/components/ProjectHeader';
import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
import { 
  Droplets, FileText, Palette, Code, TestTube, 
  Rocket, Wrench, CheckCircle, Clock, AlertTriangle, ArrowRight, Loader2
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001/api/v1';

const PHASE_ICONS: Record<string, any> = {
  requirements: FileText,
  design: Palette,
  development: Code,
  testing: TestTube,
  deployment: Rocket,
  maintenance: Wrench,
};

const PHASE_COLORS: Record<string, string> = {
  requirements: 'bg-blue-500',
  design: 'bg-purple-500',
  development: 'bg-orange-500',
  testing: 'bg-green-500',
  deployment: 'bg-red-500',
  maintenance: 'bg-gray-500',
};

const fetchWaterfallData = async (projectId: string) => {
  const token = localStorage.getItem("access_token");
  
  // Try waterfall-specific endpoint
  const response = await fetch(`${API_BASE_URL}/waterfall/projects/${projectId}/overview/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  if (response.ok) {
    return response.json();
  }
  
  // Fallback to project data
  const projectResponse = await fetch(`${API_BASE_URL}/projects/${projectId}/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  if (!projectResponse.ok) return null;
  const project = await projectResponse.json();
  
  // Get milestones for phase progress
  const milestonesResponse = await fetch(`${API_BASE_URL}/projects/${projectId}/milestones/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const milestones = milestonesResponse.ok ? await milestonesResponse.json() : [];
  
  // Calculate stats
  const startDate = project.start_date ? new Date(project.start_date) : new Date();
  const endDate = project.end_date ? new Date(project.end_date) : new Date();
  const today = new Date();
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysElapsed = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
  
  const completedMilestones = milestones.filter((m: any) => m.status === 'completed').length;
  
  return {
    project,
    phases: project.phases || [],
    stats: {
      overallProgress: project.progress || 0,
      daysElapsed: Math.max(0, daysElapsed),
      daysRemaining,
      totalBudget: parseFloat(project.budget) || 0,
      budgetSpent: parseFloat(project.spent_budget) || 0,
      milestones: { total: milestones.length, completed: completedMilestones },
      issues: project.open_issues || 0,
    }
  };
};

const WaterfallOverview = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['waterfall-overview', id],
    queryFn: () => fetchWaterfallData(id!),
    enabled: !!id,
  });

  const stats = data?.stats || {
    overallProgress: 0,
    daysElapsed: 0,
    daysRemaining: 0,
    totalBudget: 0,
    budgetSpent: 0,
    milestones: { total: 0, completed: 0 },
    issues: 0,
  };

  // Default phases if none from backend
  const phases = data?.phases?.length > 0 ? data.phases : [
    { id: 'requirements', name: 'Requirements', progress: 0, status: 'pending' },
    { id: 'design', name: 'Design', progress: 0, status: 'pending' },
    { id: 'development', name: 'Development', progress: 0, status: 'pending' },
    { id: 'testing', name: 'Testing', progress: 0, status: 'pending' },
    { id: 'deployment', name: 'Deployment', progress: 0, status: 'pending' },
    { id: 'maintenance', name: 'Maintenance', progress: 0, status: 'pending' },
  ];

  const currentPhase = phases.find((p: any) => p.status === 'in_progress')?.name || 
                       phases.find((p: any) => p.progress > 0 && p.progress < 100)?.name ||
                       'Not Started';

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return <Badge className="bg-green-500">Completed</Badge>;
      case 'in_progress': return <Badge className="bg-blue-500">In Progress</Badge>;
      default: return <Badge variant="outline">Pending</Badge>;
    }
  };

  const quickLinks = [
    { title: 'Requirements', url: `/projects/${id}/waterfall/requirements`, icon: FileText },
    { title: 'Gantt Chart', url: `/projects/${id}/waterfall/gantt`, icon: Clock },
    { title: 'Milestones', url: `/projects/${id}/milestones`, icon: CheckCircle },
    { title: 'Testing', url: `/projects/${id}/waterfall/testing`, icon: TestTube },
  ];

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
              <Droplets className="h-6 w-6 text-blue-600" />
              Waterfall Overview
            </h1>
            <p className="text-muted-foreground">Sequential project phases and progress</p>
          </div>
          <Badge className="bg-blue-500 text-white text-sm px-3 py-1">
            Phase: {currentPhase}
          </Badge>
        </div>

        {/* Overall Progress */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg">Project Progress</h3>
                <p className="text-sm text-muted-foreground">
                  {stats.daysElapsed} days elapsed • {stats.daysRemaining} days remaining
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-blue-600">{stats.overallProgress}%</span>
                <p className="text-sm text-muted-foreground">Complete</p>
              </div>
            </div>
            <Progress value={stats.overallProgress} className="h-3" />
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Milestones</p>
              <p className="text-2xl font-bold">{stats.milestones.completed}/{stats.milestones.total}</p>
              <Progress value={stats.milestones.total > 0 ? (stats.milestones.completed / stats.milestones.total) * 100 : 0} className="h-1 mt-2" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Budget Used</p>
              <p className="text-2xl font-bold">€{(stats.budgetSpent / 1000).toFixed(0)}k</p>
              <p className="text-xs text-muted-foreground">of €{(stats.totalBudget / 1000).toFixed(0)}k</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Days Remaining</p>
              <p className="text-2xl font-bold">{stats.daysRemaining}</p>
            </CardContent>
          </Card>
          <Card className={stats.issues > 0 ? 'border-yellow-300 bg-yellow-50' : ''}>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Open Issues</p>
              <p className={`text-2xl font-bold ${stats.issues > 0 ? 'text-yellow-600' : ''}`}>{stats.issues}</p>
              <p className="text-xs text-muted-foreground">{stats.issues > 0 ? 'Needs attention' : 'All clear'}</p>
            </CardContent>
          </Card>
        </div>

        {/* Phase Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Phase Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {phases.map((phase: any, idx: number) => {
                const PhaseIcon = PHASE_ICONS[phase.id?.toLowerCase()] || PHASE_ICONS[phase.name?.toLowerCase()] || FileText;
                const phaseColor = PHASE_COLORS[phase.id?.toLowerCase()] || PHASE_COLORS[phase.name?.toLowerCase()] || 'bg-gray-500';
                
                return (
                  <div key={phase.id || idx} className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full ${phaseColor} flex items-center justify-center text-white`}>
                      <PhaseIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{phase.name}</span>
                          {getStatusBadge(phase.status)}
                        </div>
                        <span className="text-sm text-muted-foreground">{phase.progress || 0}%</span>
                      </div>
                      <Progress value={phase.progress || 0} className="h-2" />
                    </div>
                    {idx < phases.length - 1 && (
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Navigation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-3">
              {quickLinks.map((link) => (
                <Button
                  key={link.title}
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center gap-2"
                  onClick={() => navigate(link.url)}
                >
                  <link.icon className="h-6 w-6 text-blue-600" />
                  <span className="text-sm">{link.title}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Waterfall Principles */}
        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="pt-4">
            <h3 className="font-semibold text-blue-900 mb-2">Waterfall Methodology</h3>
            <div className="grid grid-cols-2 gap-4 text-sm text-blue-800">
              <div>• Sequential phase completion before next phase</div>
              <div>• Comprehensive documentation at each phase</div>
              <div>• Clear milestones and deliverables</div>
              <div>• Formal sign-off and change control</div>
            </div>
          </CardContent>
        </Card>
      </div>
      <MethodologyHelpPanel methodology="waterfall" />
    </div>
  );
};

export default WaterfallOverview;
