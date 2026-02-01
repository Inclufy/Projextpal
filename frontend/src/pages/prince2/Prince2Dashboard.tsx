import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjectHeader } from '@/components/ProjectHeader';
import { useProject } from '@/hooks/useApi';
import { useLanguage } from '@/contexts/LanguageContext';
import { prince2Api, Prince2Dashboard as DashboardData } from '@/lib/prince2Api';
import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
import { 
  Crown, Play, CheckCircle2, AlertCircle, Clock, FileText,
  Users, Target, TrendingUp, BarChart3, Shield,
  Briefcase, ClipboardList, Calendar, FolderOpen, AlertTriangle,
  Layers, GitBranch, ChevronRight, Plus, RefreshCw
} from 'lucide-react';

// PRINCE2 7 Processes (static reference)
const PRINCE2_PROCESSES = [
  { id: 'starting-up', name: 'Starting Up a Project', shortName: 'SU', description: 'Ensure prerequisites for initiating project are in place', icon: Play, color: 'bg-purple-500', activities: ['Appoint Executive & PM', 'Capture Lessons', 'Design Project Approach', 'Prepare Project Brief'], deliverables: ['Project Brief', 'Initiation Stage Plan'] },
  { id: 'initiating', name: 'Initiating a Project', shortName: 'IP', description: 'Establish solid foundations for the project', icon: Target, color: 'bg-blue-500', activities: ['Prepare Risk Management Approach', 'Create Project Plan', 'Assemble PID'], deliverables: ['PID', 'Stage Plan'] },
  { id: 'directing', name: 'Directing a Project', shortName: 'DP', description: 'Enable Project Board to manage by exception', icon: Crown, color: 'bg-amber-500', activities: ['Authorize Initiation', 'Authorize Project', 'Give Ad Hoc Direction'], deliverables: ['Project Board Decisions'] },
  { id: 'controlling', name: 'Controlling a Stage', shortName: 'CS', description: 'Assign work, monitor, report, and take corrective action', icon: Shield, color: 'bg-green-500', activities: ['Authorize Work Package', 'Report Highlights', 'Escalate Issues'], deliverables: ['Work Packages', 'Highlight Reports'] },
  { id: 'managing-delivery', name: 'Managing Product Delivery', shortName: 'MP', description: 'Control link between PM and Team Manager(s)', icon: Briefcase, color: 'bg-cyan-500', activities: ['Accept Work Package', 'Execute Work Package', 'Deliver Work Package'], deliverables: ['Checkpoint Reports'] },
  { id: 'managing-boundaries', name: 'Managing Stage Boundaries', shortName: 'SB', description: 'Enable Project Board to review stage success', icon: GitBranch, color: 'bg-orange-500', activities: ['Plan Next Stage', 'Update Business Case', 'Report Stage End'], deliverables: ['End Stage Report'] },
  { id: 'closing', name: 'Closing a Project', shortName: 'CP', description: 'Confirm delivery of products and controlled close', icon: CheckCircle2, color: 'bg-slate-500', activities: ['Hand Over Products', 'Evaluate Project', 'Recommend Closure'], deliverables: ['End Project Report', 'Lessons Report'] }
];

const MANAGEMENT_PRODUCTS = [
  { name: 'Business Case', icon: FileText, path: 'business-case' },
  { name: 'Project Brief', icon: ClipboardList, path: 'project-brief' },
  { name: 'Project Board', icon: Users, path: 'project-board' },
  { name: 'Stage Plan', icon: Calendar, path: 'stage-plan' },
  { name: 'Stage Gate', icon: GitBranch, path: 'stage-gate' },
  { name: 'Work Packages', icon: FolderOpen, path: 'work-packages' },
  { name: 'Highlight Reports', icon: BarChart3, path: 'highlight-report' },
  { name: 'Tolerances', icon: Target, path: 'tolerances' },
];

const Prince2Dashboard = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: project, isLoading: projectLoading } = useProject(id);
  const { t } = useLanguage();
  
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initializingStages, setInitializingStages] = useState(false);

  useEffect(() => {
    if (id) loadDashboard();
  }, [id]);

  const loadDashboard = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await prince2Api.dashboard.get(id);
      setDashboard(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const initializeStages = async () => {
    if (!id) return;
    try {
      setInitializingStages(true);
      await prince2Api.stages.initialize(id);
      await loadDashboard();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setInitializingStages(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      completed: 'bg-green-100 text-green-800',
      active: 'bg-blue-100 text-blue-800',
      planned: 'bg-slate-100 text-slate-600',
      exception: 'bg-red-100 text-red-800'
    };
    return <Badge className={styles[status] || ''}>{status}</Badge>;
  };

  const navigateToPage = (path: string) => navigate(`/projects/${id}/prince2/${path}`);

  if (projectLoading || loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <ProjectHeader project={project} />
        <div className="container mx-auto py-6 px-4">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6 flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-red-500" />
              <div><p className="font-medium text-red-800">Error</p><p className="text-sm text-red-600">{error}</p></div>
              <Button variant="outline" onClick={loadDashboard} className="ml-auto"><RefreshCw className="h-4 w-4 mr-2" />Retry</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentStage = dashboard?.stages?.find(s => s.status === 'active');

  return (
    <div className="min-h-screen bg-background">
      <ProjectHeader project={project} />
      <div className="container mx-auto py-6 px-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-purple-100"><Crown className="h-8 w-8 text-purple-600" /></div>
          <div>
            <h1 className="text-2xl font-bold">PRINCE2 Dashboard</h1>
            <p className="text-muted-foreground">Projects IN Controlled Environments</p>
          </div>
          <div className="ml-auto flex gap-2">
            {currentStage && <Badge variant="outline">Stage {currentStage.order}: {currentStage.name}</Badge>}
            <Button variant="outline" size="sm" onClick={loadDashboard}><RefreshCw className="h-4 w-4 mr-2" />Refresh</Button>
          </div>
        </div>

        {/* No stages warning */}
        {dashboard?.total_stages === 0 && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardContent className="pt-6 flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-amber-500" />
              <div className="flex-1">
                <p className="font-medium text-amber-800">No stages defined</p>
                <p className="text-sm text-amber-600">Initialize default PRINCE2 stages to get started.</p>
              </div>
              <Button onClick={initializeStages} disabled={initializingStages}>
                {initializingStages ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                Initialize Stages
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-muted-foreground">Progress</p><p className="text-2xl font-bold">{dashboard?.overall_progress || 0}%</p></div>
                <div className="p-3 rounded-full bg-blue-100"><TrendingUp className="h-6 w-6 text-blue-600" /></div>
              </div>
              <Progress value={dashboard?.overall_progress || 0} className="mt-3" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-muted-foreground">Stages</p><p className="text-2xl font-bold">{dashboard?.completed_stages || 0} / {dashboard?.total_stages || 0}</p></div>
                <div className="p-3 rounded-full bg-green-100"><Layers className="h-6 w-6 text-green-600" /></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-muted-foreground">Issues</p><p className="text-2xl font-bold">{dashboard?.open_issues || 0}</p></div>
                <div className="p-3 rounded-full bg-amber-100"><AlertCircle className="h-6 w-6 text-amber-600" /></div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">{dashboard?.high_priority_issues || 0} high priority</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-muted-foreground">Risks</p><p className="text-2xl font-bold">{dashboard?.total_risks || 0}</p></div>
                <div className="p-3 rounded-full bg-red-100"><AlertTriangle className="h-6 w-6 text-red-600" /></div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">{dashboard?.high_risks || 0} high/critical</p>
            </CardContent>
          </Card>
        </div>

        {/* Document Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="cursor-pointer hover:bg-muted/50" onClick={() => navigateToPage('project-brief')}>
            <CardContent className="pt-6 flex items-center gap-3">
              <ClipboardList className="h-5 w-5 text-purple-500" />
              <div className="flex-1"><p className="font-medium">Project Brief</p><p className="text-sm text-muted-foreground">{dashboard?.has_brief ? dashboard?.brief_status : 'Not created'}</p></div>
              {dashboard?.has_brief ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <Plus className="h-5 w-5 text-muted-foreground" />}
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:bg-muted/50" onClick={() => navigateToPage('business-case')}>
            <CardContent className="pt-6 flex items-center gap-3">
              <FileText className="h-5 w-5 text-blue-500" />
              <div className="flex-1"><p className="font-medium">Business Case</p><p className="text-sm text-muted-foreground">{dashboard?.has_business_case ? dashboard?.business_case_status : 'Not created'}</p></div>
              {dashboard?.has_business_case ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <Plus className="h-5 w-5 text-muted-foreground" />}
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:bg-muted/50" onClick={() => navigateToPage('governance')}>
            <CardContent className="pt-6 flex items-center gap-3">
              <Target className="h-5 w-5 text-green-500" />
              <div className="flex-1"><p className="font-medium">PID</p><p className="text-sm text-muted-foreground">{dashboard?.has_pid ? dashboard?.pid_status : 'Not created'}</p></div>
              {dashboard?.has_pid ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <Plus className="h-5 w-5 text-muted-foreground" />}
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="stages" className="space-y-4">
          <TabsList>
            <TabsTrigger value="stages">Stages</TabsTrigger>
            <TabsTrigger value="processes">PRINCE2 Processes</TabsTrigger>
            <TabsTrigger value="products">Management Products</TabsTrigger>
          </TabsList>

          <TabsContent value="stages" className="space-y-4">
            {dashboard?.stages?.length ? (
              dashboard.stages.map((stage) => (
                <Card key={stage.id} className={`cursor-pointer hover:bg-muted/50 ${stage.status === 'active' ? 'border-blue-300 bg-blue-50/50' : ''}`} onClick={() => navigateToPage(`stages/${stage.id}`)}>
                  <CardContent className="py-4 flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${stage.status === 'completed' ? 'bg-green-100 text-green-600' : stage.status === 'active' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                      {stage.status === 'completed' ? <CheckCircle2 className="h-5 w-5" /> : <span className="font-bold">{stage.order}</span>}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2"><h3 className="font-medium">{stage.name}</h3>{getStatusBadge(stage.status)}</div>
                      <p className="text-sm text-muted-foreground">{stage.planned_start_date || 'No dates'} - {stage.planned_end_date || ''}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{stage.progress_percentage}%</p>
                      <p className="text-sm text-muted-foreground">{stage.work_packages_count} WPs</p>
                    </div>
                    <Progress value={stage.progress_percentage} className="w-32" />
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card><CardContent className="py-8 text-center"><Layers className="h-12 w-12 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground">No stages defined</p><Button className="mt-4" onClick={initializeStages}>Initialize Stages</Button></CardContent></Card>
            )}
          </TabsContent>

          <TabsContent value="processes" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {PRINCE2_PROCESSES.map((process) => {
                const Icon = process.icon;
                return (
                  <Card key={process.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${process.color} text-white`}><Icon className="h-5 w-5" /></div>
                        <div><CardTitle className="text-base">{process.name} <Badge variant="outline" className="text-xs ml-2">{process.shortName}</Badge></CardTitle><CardDescription>{process.description}</CardDescription></div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-1">{process.deliverables.map((d, i) => <Badge key={i} variant="secondary" className="text-xs">{d}</Badge>)}</div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {MANAGEMENT_PRODUCTS.map((product, idx) => {
                const Icon = product.icon;
                return (
                  <Card key={idx} className="cursor-pointer hover:bg-muted/50" onClick={() => navigateToPage(product.path)}>
                    <CardContent className="p-6 flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-primary/10"><Icon className="h-6 w-6 text-primary" /></div>
                      <div className="flex-1"><h3 className="font-medium">{product.name}</h3></div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>

          {/* Methodology Help Panel */}
          <MethodologyHelpPanel methodology="prince2" />
    </div>
  );
};

export default Prince2Dashboard;
