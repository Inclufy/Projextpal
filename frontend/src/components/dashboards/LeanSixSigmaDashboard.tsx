import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Target, CheckCircle2, Clock,
  BarChart3, Activity, Award, ArrowRight, Loader2
} from 'lucide-react';
import { sixsigmaApi } from '@/lib/sixsigmaApi';

interface LeanSixSigmaDashboardProps {
  project: any;
  level?: 'green' | 'black';
}

const DMAIC_PHASES = [
  {
    phase: 'Define',
    deliverables: ['Project Charter', 'SIPOC', 'Voice of Customer'],
  },
  {
    phase: 'Measure',
    deliverables: ['Data Collection Plan', 'MSA', 'Process Capability'],
  },
  {
    phase: 'Analyze',
    deliverables: ['Root Cause Analysis', 'Fishbone Diagram', 'Pareto Chart', 'Hypothesis Tests'],
  },
  {
    phase: 'Improve',
    deliverables: ['Solution Design', 'Pilot Plan', 'Implementation'],
  },
  {
    phase: 'Control',
    deliverables: ['Control Plan', 'SPC Charts', 'Documentation'],
  },
];

const LeanSixSigmaDashboard = ({ project, level = 'green' }: LeanSixSigmaDashboardProps) => {
  const projectId = project?.id;
  const isBlackBelt = level === 'black';

  // Fetch real data from backend (no hardcoded mock data)
  const { data: dashboard, isLoading: dashboardLoading } = useQuery({
    queryKey: ['sixsigma', 'dashboard', projectId],
    queryFn: () => sixsigmaApi.dashboard.get(projectId),
    enabled: !!projectId,
  });

  if (dashboardLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  // Derive DMAIC phase status from real backend data
  const currentPhase = (dashboard?.current_phase ?? 'define').toLowerCase();
  const phaseOrder = ['define', 'measure', 'analyze', 'improve', 'control'];
  const currentIndex = Math.max(0, phaseOrder.indexOf(currentPhase));

  const dmaic = DMAIC_PHASES.map((p, i) => ({
    ...p,
    status: i < currentIndex ? 'completed' : i === currentIndex ? 'current' : 'upcoming',
    progress: i < currentIndex ? 100 : i === currentIndex ? 50 : 0,
  }));

  // Derive tollgate list from real backend dictionary
  const tollgateStatus = dashboard?.tollgate_status ?? {};
  const tollgates = phaseOrder.map((phase, i) => {
    const status = tollgateStatus[phase] ?? (i < currentIndex ? 'passed' : i === currentIndex ? 'pending' : 'upcoming');
    return {
      name: `Tollgate ${i + 1} - ${phase.charAt(0).toUpperCase()}${phase.slice(1)}`,
      status,
      date: null as string | null,
    };
  });

  const baselineMetrics = dashboard?.baseline_metrics ?? [];
  const hasMetrics = baselineMetrics.length > 0;

  const currentPhaseData = dmaic.find((p) => p.status === 'current');

  return (
    <div className="space-y-6">
      {/* LSS Header */}
      <div className={`rounded-lg p-6 text-white ${isBlackBelt ? 'bg-gradient-to-r from-gray-800 to-gray-900' : 'bg-gradient-to-r from-green-500 to-emerald-600'}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-6 w-6" />
              <h2 className="text-2xl font-bold">
                Lean Six Sigma {isBlackBelt ? '(Black Belt)' : '(Green Belt)'}
              </h2>
            </div>
            <p className={isBlackBelt ? 'text-gray-300' : 'text-green-100'}>
              DMAIC Process Improvement
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end">
              <Award className={`h-8 w-8 ${isBlackBelt ? 'text-yellow-400' : 'text-green-200'}`} />
              <div>
                <div className="text-3xl font-bold capitalize">{currentPhase}</div>
                <div className={isBlackBelt ? 'text-gray-300' : 'text-green-100'}>Current Phase</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sigma Level / Baseline Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Baseline Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!hasMetrics ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No baseline metrics defined yet — add them from the Six Sigma Baseline page.
            </p>
          ) : (
            <div className="space-y-4">
              {baselineMetrics.slice(0, 3).map((m: any) => (
                <div key={m.id} className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">{m.metric_name}</p>
                      <p className="text-xs text-muted-foreground">{m.metric_type} · {m.unit_of_measure}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-center">
                      <p className="text-lg font-bold text-red-500">{m.baseline_value}</p>
                      <p className="text-xs text-muted-foreground">Baseline</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <div className="text-center">
                      <p className="text-lg font-bold text-green-500">{m.target_value}</p>
                      <p className="text-xs text-muted-foreground">Target</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* DMAIC Progress */}
      <Card>
        <CardHeader>
          <CardTitle>DMAIC Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {dmaic.map((phase, index) => (
              <div key={phase.phase} className="flex-1">
                <div className={`p-4 rounded-lg text-center ${
                  phase.status === 'completed' ? 'bg-green-100 border-2 border-green-500' :
                  phase.status === 'current' ? `${isBlackBelt ? 'bg-gray-100 border-2 border-gray-700' : 'bg-green-50 border-2 border-green-400'}` :
                  'bg-gray-100 border-2 border-gray-200'
                }`}>
                  <div className={`text-2xl font-bold mb-1 ${
                    phase.status === 'completed' ? 'text-green-600' :
                    phase.status === 'current' ? (isBlackBelt ? 'text-gray-700' : 'text-green-500') :
                    'text-gray-400'
                  }`}>
                    {phase.phase.charAt(0)}
                  </div>
                  <p className="text-sm font-medium">{phase.phase}</p>
                  {phase.status === 'current' && (
                    <Progress value={phase.progress} className="mt-2 h-1" />
                  )}
                </div>
                {index < dmaic.length - 1 && (
                  <div className="flex justify-center py-2">
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tollgates & Open Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tollgate Reviews */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Tollgate Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tollgates.map((tollgate) => (
                <div key={tollgate.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {tollgate.status === 'passed' || tollgate.status === 'approved' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : tollgate.status === 'pending' ? (
                      <Clock className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{tollgate.name}</p>
                    </div>
                  </div>
                  <Badge className={
                    tollgate.status === 'passed' || tollgate.status === 'approved' ? 'bg-green-100 text-green-700' :
                    tollgate.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }>
                    {tollgate.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Open Actions / Risks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Project Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Open Actions</p>
                <p className="text-2xl font-bold">{dashboard?.open_actions ?? 0}</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Active Risks</p>
                <p className="text-2xl font-bold">{(dashboard?.risks ?? []).length}</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Key Improvements</p>
                <p className="text-2xl font-bold">{(dashboard?.key_improvements ?? []).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Phase Deliverables */}
      {currentPhaseData && (
        <Card>
          <CardHeader>
            <CardTitle>Current Phase: {currentPhaseData.phase}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {currentPhaseData.deliverables.map((deliverable) => (
                <div
                  key={deliverable}
                  className="p-4 rounded-lg border bg-gray-50 border-gray-200"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium">{deliverable}</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Complete each deliverable from the corresponding Six Sigma page.
            </p>
          </CardContent>
        </Card>
      )}

    </div>
  );
};

export default LeanSixSigmaDashboard;
