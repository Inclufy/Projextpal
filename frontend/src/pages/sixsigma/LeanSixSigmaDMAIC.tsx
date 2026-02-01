import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ProjectHeader } from '@/components/ProjectHeader';
import { useProject } from '@/hooks/useApi';
import { Target, Gauge, BarChart3, TrendingUp, Shield, CheckCircle2, Clock, FileText, ArrowRight } from 'lucide-react';
import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';

const LeanSixSigmaDMAIC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: project } = useProject(id);
  const [activePhase, setActivePhase] = useState(2);

  const phases = [
    { id: 0, name: 'Define', letter: 'D', color: 'bg-blue-500', status: 'completed', progress: 100, deliverables: ['Project Charter', 'SIPOC Diagram', 'Voice of Customer'], tollgate: { status: 'passed', date: '2025-10-15' } },
    { id: 1, name: 'Measure', letter: 'M', color: 'bg-green-500', status: 'completed', progress: 100, deliverables: ['Data Collection Plan', 'Process Map', 'Baseline Metrics', 'MSA Report'], tollgate: { status: 'passed', date: '2025-11-01' } },
    { id: 2, name: 'Analyze', letter: 'A', color: 'bg-yellow-500', status: 'active', progress: 65, deliverables: ['Root Cause Analysis', 'Fishbone Diagram', 'Pareto Chart', 'Hypothesis Tests'], tollgate: { status: 'pending', date: '2025-12-15' } },
    { id: 3, name: 'Improve', letter: 'I', color: 'bg-orange-500', status: 'upcoming', progress: 0, deliverables: ['Solution Design', 'Pilot Plan', 'DOE Results', 'Implementation Plan'], tollgate: { status: 'upcoming', date: '2026-01-15' } },
    { id: 4, name: 'Control', letter: 'C', color: 'bg-red-500', status: 'upcoming', progress: 0, deliverables: ['Control Plan', 'SPC Charts', 'Training Materials', 'Documentation'], tollgate: { status: 'upcoming', date: '2026-02-15' } },
  ];

  const metrics = {
    sigmaLevel: { baseline: 2.1, current: 3.4, target: 4.0 },
    defectRate: { baseline: 30.8, current: 6.7, target: 0.62 },
    savings: { projected: 150000, realized: 85000 },
    cycleTime: { baseline: 45, current: 28, target: 20 },
  };

  const currentPhase = phases[activePhase];

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Target className="h-6 w-6 text-green-600" />
              DMAIC Process Improvement
            </h1>
            <p className="text-muted-foreground">Lean Six Sigma Project Dashboard</p>
          </div>
          <Badge className={project?.methodology === 'lean_six_sigma_black' ? 'bg-gray-800' : 'bg-green-500'}>
            {project?.methodology === 'lean_six_sigma_black' ? 'Black Belt' : 'Green Belt'}
          </Badge>
        </div>

        {/* Sigma Level Progress */}
        <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium opacity-90">Sigma Level Improvement</h3>
                <div className="flex items-center gap-4 mt-2">
                  <div><span className="text-sm opacity-75">Baseline:</span> <span className="text-2xl font-bold">{metrics.sigmaLevel.baseline}σ</span></div>
                  <ArrowRight className="h-5 w-5" />
                  <div><span className="text-sm opacity-75">Current:</span> <span className="text-3xl font-bold">{metrics.sigmaLevel.current}σ</span></div>
                  <ArrowRight className="h-5 w-5" />
                  <div><span className="text-sm opacity-75">Target:</span> <span className="text-2xl font-bold">{metrics.sigmaLevel.target}σ</span></div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold">+{(metrics.sigmaLevel.current - metrics.sigmaLevel.baseline).toFixed(1)}σ</div>
                <div className="text-sm opacity-75">Improvement</div>
              </div>
            </div>
            <Progress value={((metrics.sigmaLevel.current - metrics.sigmaLevel.baseline) / (metrics.sigmaLevel.target - metrics.sigmaLevel.baseline)) * 100} className="h-3 bg-white/20" />
          </CardContent>
        </Card>

        {/* DMAIC Phases */}
        <Card>
          <CardHeader><CardTitle>DMAIC Progress</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              {phases.map((phase, index) => (
                <div key={phase.id} className="flex items-center">
                  <div 
                    className={`flex flex-col items-center cursor-pointer transition-transform ${activePhase === phase.id ? 'scale-110' : ''}`}
                    onClick={() => setActivePhase(phase.id)}
                  >
                    <div className={`h-16 w-16 rounded-full ${phase.color} flex items-center justify-center text-white text-2xl font-bold shadow-lg ${phase.status === 'upcoming' ? 'opacity-50' : ''}`}>
                      {phase.letter}
                    </div>
                    <p className="mt-2 font-medium">{phase.name}</p>
                    <p className="text-sm text-muted-foreground">{phase.progress}%</p>
                    {phase.tollgate.status === 'passed' && <Badge className="mt-1 bg-green-500 text-xs">Passed</Badge>}
                    {phase.tollgate.status === 'pending' && <Badge className="mt-1 bg-yellow-500 text-xs">Pending</Badge>}
                  </div>
                  {index < phases.length - 1 && (
                    <ArrowRight className={`h-6 w-6 mx-4 ${phase.status === 'completed' ? 'text-green-500' : 'text-gray-300'}`} />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Defect Rate</p>
                  <p className="text-2xl font-bold text-green-600">{metrics.defectRate.current}%</p>
                  <p className="text-xs text-muted-foreground">from {metrics.defectRate.baseline}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Cycle Time</p>
                  <p className="text-2xl font-bold text-blue-600">{metrics.cycleTime.current} days</p>
                  <p className="text-xs text-muted-foreground">from {metrics.cycleTime.baseline} days</p>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Projected Savings</p>
                  <p className="text-2xl font-bold text-purple-600">€{(metrics.savings.projected / 1000).toFixed(0)}K</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Realized Savings</p>
                  <p className="text-2xl font-bold text-green-600">€{(metrics.savings.realized / 1000).toFixed(0)}K</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Phase Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <div className={`h-8 w-8 rounded-full ${currentPhase.color} flex items-center justify-center text-white font-bold`}>
                  {currentPhase.letter}
                </div>
                {currentPhase.name} Phase
              </CardTitle>
              <Badge className={currentPhase.status === 'completed' ? 'bg-green-500' : currentPhase.status === 'active' ? 'bg-blue-500' : 'bg-gray-400'}>
                {currentPhase.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Phase Progress</span>
                <span className="text-sm font-medium">{currentPhase.progress}%</span>
              </div>
              <Progress value={currentPhase.progress} className="h-3" />
            </div>
            <div>
              <h4 className="font-medium mb-3">Deliverables</h4>
              <div className="grid grid-cols-2 gap-3">
                {currentPhase.deliverables.map((deliverable, i) => (
                  <div key={i} className="flex items-center gap-2 p-3 border rounded-lg">
                    {currentPhase.status === 'completed' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : i < Math.floor(currentPhase.deliverables.length * currentPhase.progress / 100) ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-gray-400" />
                    )}
                    <span>{deliverable}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tollgate Review</p>
                  <p className="font-medium">{currentPhase.tollgate.date}</p>
                </div>
                <Badge className={currentPhase.tollgate.status === 'passed' ? 'bg-green-500' : currentPhase.tollgate.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-400'}>
                  {currentPhase.tollgate.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <MethodologyHelpPanel methodology="lean_six_sigma" />
    </div>
  );
};

export default LeanSixSigmaDMAIC;
