import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Target, CheckCircle2, Clock, AlertCircle, TrendingUp,
  BarChart3, Activity, Award, ArrowRight
} from 'lucide-react';

interface LeanSixSigmaDashboardProps {
  project: any;
  level?: 'green' | 'black';
}

const LeanSixSigmaDashboard = ({ project, level = 'green' }: LeanSixSigmaDashboardProps) => {
  const dmaic = [
    { 
      phase: 'Define', 
      status: 'completed', 
      progress: 100,
      deliverables: ['Project Charter', 'SIPOC', 'Voice of Customer'],
      completedDeliverables: 3
    },
    { 
      phase: 'Measure', 
      status: 'completed', 
      progress: 100,
      deliverables: ['Data Collection Plan', 'MSA', 'Process Capability'],
      completedDeliverables: 3
    },
    { 
      phase: 'Analyze', 
      status: 'current', 
      progress: 60,
      deliverables: ['Root Cause Analysis', 'Fishbone Diagram', 'Pareto Chart', 'Hypothesis Tests'],
      completedDeliverables: 2
    },
    { 
      phase: 'Improve', 
      status: 'upcoming', 
      progress: 0,
      deliverables: ['Solution Design', 'Pilot Plan', 'Implementation'],
      completedDeliverables: 0
    },
    { 
      phase: 'Control', 
      status: 'upcoming', 
      progress: 0,
      deliverables: ['Control Plan', 'SPC Charts', 'Documentation'],
      completedDeliverables: 0
    },
  ];

  const metrics = {
    baselineSigma: 2.1,
    currentSigma: 3.4,
    targetSigma: 4.0,
    defectRate: { before: 30.8, current: 6.7, target: 0.62 },
    savings: { projected: 150000, realized: 85000 },
  };

  const tollgates = [
    { name: 'Tollgate 1 - Define', status: 'passed', date: '2025-10-15' },
    { name: 'Tollgate 2 - Measure', status: 'passed', date: '2025-11-01' },
    { name: 'Tollgate 3 - Analyze', status: 'pending', date: null },
    { name: 'Tollgate 4 - Improve', status: 'upcoming', date: null },
    { name: 'Tollgate 5 - Control', status: 'upcoming', date: null },
  ];

  const currentPhase = dmaic.find(p => p.status === 'current');
  const isBlackBelt = level === 'black';

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
                <div className="text-3xl font-bold">{metrics.currentSigma}σ</div>
                <div className={isBlackBelt ? 'text-gray-300' : 'text-green-100'}>Current Level</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sigma Level Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Sigma Level Improvement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-8">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-2">
                <span>Baseline: {metrics.baselineSigma}σ</span>
                <span>Current: {metrics.currentSigma}σ</span>
                <span>Target: {metrics.targetSigma}σ</span>
              </div>
              <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="absolute h-full bg-red-400 rounded-l-full"
                  style={{ width: `${(metrics.baselineSigma / 6) * 100}%` }}
                />
                <div 
                  className={`absolute h-full ${isBlackBelt ? 'bg-gray-700' : 'bg-green-500'} rounded-l-full transition-all`}
                  style={{ width: `${(metrics.currentSigma / 6) * 100}%` }}
                />
                <div 
                  className="absolute h-full w-1 bg-yellow-500"
                  style={{ left: `${(metrics.targetSigma / 6) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>1σ</span>
                <span>2σ</span>
                <span>3σ</span>
                <span>4σ</span>
                <span>5σ</span>
                <span>6σ</span>
              </div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-3xl font-bold text-green-600">+{(metrics.currentSigma - metrics.baselineSigma).toFixed(1)}σ</p>
              <p className="text-sm text-muted-foreground">Improvement</p>
            </div>
          </div>
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
                  <p className="text-xs text-muted-foreground">
                    {phase.completedDeliverables}/{phase.deliverables.length}
                  </p>
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

      {/* Tollgates & Metrics */}
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
                    {tollgate.status === 'passed' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : tollgate.status === 'pending' ? (
                      <Clock className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{tollgate.name}</p>
                      {tollgate.date && (
                        <p className="text-xs text-muted-foreground">{tollgate.date}</p>
                      )}
                    </div>
                  </div>
                  <Badge className={
                    tollgate.status === 'passed' ? 'bg-green-100 text-green-700' :
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

        {/* Key Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Key Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Defect Rate (%)</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-red-500">{metrics.defectRate.before}%</p>
                    <p className="text-xs text-muted-foreground">Before</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <div className="text-center">
                    <p className="text-lg font-bold text-yellow-500">{metrics.defectRate.current}%</p>
                    <p className="text-xs text-muted-foreground">Current</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-500">{metrics.defectRate.target}%</p>
                    <p className="text-xs text-muted-foreground">Target</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Projected Savings</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${metrics.savings.projected.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Realized</p>
                    <p className="text-xl font-bold text-green-500">
                      ${metrics.savings.realized.toLocaleString()}
                    </p>
                  </div>
                </div>
                <Progress 
                  value={(metrics.savings.realized / metrics.savings.projected) * 100} 
                  className="mt-3 h-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Phase Deliverables */}
      {currentPhase && (
        <Card>
          <CardHeader>
            <CardTitle>Current Phase: {currentPhase.phase}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {currentPhase.deliverables.map((deliverable, i) => (
                <div 
                  key={deliverable}
                  className={`p-4 rounded-lg border ${
                    i < currentPhase.completedDeliverables 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {i < currentPhase.completedDeliverables ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-gray-400" />
                    )}
                    <span className="text-sm font-medium">{deliverable}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LeanSixSigmaDashboard;
