import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  Crown, FileText, CheckCircle2, Clock, AlertCircle,
  Users, Shield, FileCheck, Loader2
} from 'lucide-react';
import { prince2Api } from '@/lib/prince2Api';

interface Prince2DashboardProps {
  project: any;
}

const Prince2Dashboard = ({ project }: Prince2DashboardProps) => {
  const projectId = project?.id;

  // Fetch all data from the backend (no hardcoded mock data)
  const { data: dashboard, isLoading: dashboardLoading } = useQuery({
    queryKey: ['prince2', 'dashboard', projectId],
    queryFn: () => prince2Api.dashboard.get(projectId),
    enabled: !!projectId,
  });

  const { data: boards = [] } = useQuery({
    queryKey: ['prince2', 'board', projectId],
    queryFn: () => prince2Api.board.get(projectId),
    enabled: !!projectId,
  });

  const { data: tolerances = [] } = useQuery({
    queryKey: ['prince2', 'tolerances', projectId],
    queryFn: () => prince2Api.tolerances.getAll(projectId),
    enabled: !!projectId,
  });

  const stages = dashboard?.stages ?? [];
  const currentStage = stages.find((s) => s.status === 'active');

  // Project Board members come from the first board (a PRINCE2 project has one board)
  const projectBoardMembers = boards?.[0]?.members ?? [];

  // Management products: derived from real dashboard flags + recent highlight reports
  const managementProducts = [
    dashboard?.has_brief
      ? { name: 'Project Brief', status: dashboard.brief_status ?? 'approved', date: null }
      : null,
    dashboard?.has_business_case
      ? { name: 'Business Case', status: dashboard.business_case_status ?? 'approved', date: null }
      : null,
    dashboard?.has_pid
      ? { name: 'Project Initiation Document', status: dashboard.pid_status ?? 'approved', date: null }
      : null,
    ...(dashboard?.recent_highlight_reports ?? []).map((r: any) => ({
      name: `Highlight Report${r.stage_name ? ` (${r.stage_name})` : ''}`,
      status: r.overall_status === 'red' ? 'pending' : 'approved',
      date: r.report_date ?? null,
    })),
  ].filter(Boolean) as Array<{ name: string; status: string; date: string | null }>;

  // Exceptions: derived from real issues + exceeded tolerances
  const exceptions = [
    ...(dashboard?.recent_issues ?? [])
      .filter((i: any) => i.priority === 'high' || i.priority === 'critical')
      .map((i: any) => ({
        id: `issue-${i.id}`,
        title: i.description,
        severity: i.priority,
        raised: i.date_raised,
      })),
    ...tolerances
      .filter((t: any) => t.is_exceeded)
      .map((t: any) => ({
        id: `tolerance-${t.id}`,
        title: `${t.tolerance_type_display ?? t.tolerance_type} tolerance exceeded`,
        severity: 'high',
        raised: t.updated_at?.slice(0, 10) ?? '',
      })),
  ];

  const getDocStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'draft': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      executive: 'Executive',
      senior_user: 'Senior User',
      senior_supplier: 'Senior Supplier',
      project_manager: 'Project Manager',
      project_assurance: 'Project Assurance',
      change_authority: 'Change Authority',
      project_support: 'Project Support',
    };
    return labels[role] ?? role;
  };

  // Tolerance helpers — show real values when available, empty state otherwise
  const toleranceByType = (type: string) => tolerances.find((t: any) => t.tolerance_type === type);

  if (dashboardLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* PRINCE2 Header */}
      <div className="bg-gradient-to-r from-purple-600 to-violet-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-6 w-6" />
              <h2 className="text-2xl font-bold">PRINCE2 Project</h2>
            </div>
            <p className="text-purple-200">Controlled Environments Management</p>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold">Current Stage</div>
            <div className="text-2xl font-bold">{currentStage?.name ?? 'Not started'}</div>
          </div>
        </div>
      </div>

      {/* Stage Gate Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Stage Gate Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stages.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No stages defined yet — initialize PRINCE2 stages from the Dashboard page.
            </p>
          ) : (
            <div className="relative">
              <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200" />
              <div className="relative flex justify-between">
                {stages.map((stage, index) => (
                  <div key={stage.id} className="flex flex-col items-center" style={{ width: `${100 / stages.length}%` }}>
                    <div className={`relative z-10 h-10 w-10 rounded-full flex items-center justify-center ${
                      stage.status === 'completed' ? 'bg-green-500' :
                      stage.status === 'active' ? 'bg-blue-500' :
                      'bg-gray-200'
                    }`}>
                      {stage.status === 'completed' ? (
                        <CheckCircle2 className="h-5 w-5 text-white" />
                      ) : stage.status === 'active' ? (
                        <Clock className="h-5 w-5 text-white" />
                      ) : (
                        <span className="text-gray-500 text-sm">{index + 1}</span>
                      )}
                    </div>
                    <div className="mt-2 text-center">
                      <p className={`text-xs font-medium ${stage.status === 'active' ? 'text-blue-600' : ''}`}>
                        {stage.name}
                      </p>
                      {stage.status === 'active' && (
                        <p className="text-xs text-muted-foreground">{stage.progress_percentage}%</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Project Board & Documents */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Project Board */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Project Board
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projectBoardMembers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No project board members yet — invite stakeholders from the Project Board page.
                </p>
              ) : (
                projectBoardMembers.map((member: any) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{member.user_name ?? member.user_email ?? 'Unassigned'}</p>
                      <p className="text-sm text-muted-foreground">{getRoleLabel(member.role)}</p>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      Active
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Management Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Management Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {managementProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No management products yet — create a Project Brief, Business Case or PID to get started.
                </p>
              ) : (
                managementProducts.map((doc, idx) => (
                  <div key={`${doc.name}-${idx}`} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileCheck className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{doc.name}</p>
                        {doc.date && (
                          <p className="text-xs text-muted-foreground">{doc.date}</p>
                        )}
                      </div>
                    </div>
                    <Badge className={getDocStatusColor(doc.status)}>
                      {doc.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exception Report */}
      {exceptions.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              Exception Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {exceptions.map((exception) => (
                <div key={exception.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-200">
                  <div>
                    <p className="font-medium text-red-700">{exception.title}</p>
                    {exception.raised && (
                      <p className="text-sm text-muted-foreground">Raised: {exception.raised}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">High Priority</Badge>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tolerances */}
      <Card>
        <CardHeader>
          <CardTitle>Stage Tolerances</CardTitle>
        </CardHeader>
        <CardContent>
          {tolerances.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No tolerances defined yet — set them up from the Tolerances page.
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(['time', 'cost', 'scope', 'risk'] as const).map((type) => {
                const tol = toleranceByType(type);
                if (!tol) {
                  return (
                    <div key={type} className="p-4 bg-muted/30 rounded-lg border border-dashed">
                      <p className="text-sm text-muted-foreground capitalize">{type}</p>
                      <p className="text-sm text-muted-foreground mt-2">Not set</p>
                    </div>
                  );
                }
                return (
                  <div
                    key={type}
                    className={`p-4 rounded-lg ${tol.is_exceeded ? 'bg-red-50 border border-red-200' : 'bg-muted/50'}`}
                  >
                    <p className="text-sm text-muted-foreground capitalize">{type}</p>
                    <p className={`text-lg font-bold ${tol.is_exceeded ? 'text-red-600' : ''}`}>
                      {tol.plus_tolerance && tol.minus_tolerance
                        ? `+${tol.plus_tolerance} / -${tol.minus_tolerance}`
                        : tol.plus_tolerance ?? tol.minus_tolerance ?? '—'}
                    </p>
                    <Progress
                      value={tol.is_exceeded ? 100 : 50}
                      className={`mt-2 h-2 ${tol.is_exceeded ? 'bg-red-200' : ''}`}
                    />
                    <p className={`text-xs mt-1 ${tol.is_exceeded ? 'text-red-600' : 'text-muted-foreground'}`}>
                      {tol.is_exceeded ? 'Exceeded!' : tol.current_status ?? 'Within tolerance'}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Prince2Dashboard;
