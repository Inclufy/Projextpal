import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ProjectHeader } from '@/components/ProjectHeader';
import { useProject } from '@/hooks/useApi';
import { Layers, CheckCircle2, Clock, AlertTriangle, ArrowRight, FileCheck, Lock } from 'lucide-react';

import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
const WaterfallPhaseGate = () => {
  const { id } = useParams<{ id: string }>();
  const { data: project } = useProject(id);
  const [selectedPhase, setSelectedPhase] = useState(2);

  const phases = [
    { 
      id: 0, 
      name: 'Requirements', 
      status: 'completed', 
      progress: 100, 
      startDate: '2025-09-01', 
      endDate: '2025-09-30',
      deliverables: [
        { name: 'Business Requirements Document', status: 'approved' },
        { name: 'Functional Requirements', status: 'approved' },
        { name: 'Use Case Specifications', status: 'approved' },
      ],
      gate: { status: 'passed', date: '2025-10-02', approver: 'Project Board' }
    },
    { 
      id: 1, 
      name: 'Design', 
      status: 'completed', 
      progress: 100, 
      startDate: '2025-10-01', 
      endDate: '2025-10-31',
      deliverables: [
        { name: 'System Architecture Document', status: 'approved' },
        { name: 'Database Design', status: 'approved' },
        { name: 'UI/UX Specifications', status: 'approved' },
      ],
      gate: { status: 'passed', date: '2025-11-01', approver: 'Technical Lead' }
    },
    { 
      id: 2, 
      name: 'Implementation', 
      status: 'active', 
      progress: 65, 
      startDate: '2025-11-01', 
      endDate: '2025-12-15',
      deliverables: [
        { name: 'Frontend Components', status: 'completed' },
        { name: 'Backend API', status: 'in_progress' },
        { name: 'Database Implementation', status: 'completed' },
        { name: 'Integration Layer', status: 'in_progress' },
      ],
      gate: { status: 'pending', date: '2025-12-16', approver: 'Technical Lead' }
    },
    { 
      id: 3, 
      name: 'Testing', 
      status: 'upcoming', 
      progress: 0, 
      startDate: '2025-12-16', 
      endDate: '2026-01-15',
      deliverables: [
        { name: 'Test Plan', status: 'draft' },
        { name: 'Test Cases', status: 'draft' },
        { name: 'UAT Sign-off', status: 'pending' },
      ],
      gate: { status: 'upcoming', date: '2026-01-16', approver: 'Business Owner' }
    },
    { 
      id: 4, 
      name: 'Deployment', 
      status: 'upcoming', 
      progress: 0, 
      startDate: '2026-01-16', 
      endDate: '2026-01-31',
      deliverables: [
        { name: 'Deployment Plan', status: 'pending' },
        { name: 'Training Materials', status: 'pending' },
        { name: 'Go-Live Checklist', status: 'pending' },
      ],
      gate: { status: 'upcoming', date: '2026-02-01', approver: 'Project Board' }
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': case 'approved': case 'passed': return 'bg-green-500';
      case 'active': case 'in_progress': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-300';
    }
  };

  const currentPhase = phases[selectedPhase];

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Layers className="h-6 w-6 text-slate-600" />
              Waterfall Phase Gates
            </h1>
            <p className="text-muted-foreground">Sequential phase progression with gate reviews</p>
          </div>
        </div>

        {/* Phase Timeline */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              {phases.map((phase, index) => (
                <div key={phase.id} className="flex items-center">
                  <div 
                    className={`flex flex-col items-center cursor-pointer transition-all ${selectedPhase === phase.id ? 'scale-110' : ''}`}
                    onClick={() => setSelectedPhase(phase.id)}
                  >
                    <div className={`relative h-14 w-14 rounded-full ${getStatusColor(phase.status)} flex items-center justify-center text-white font-bold shadow-lg`}>
                      {phase.status === 'completed' ? <CheckCircle2 className="h-7 w-7" /> : phase.status === 'upcoming' ? <Lock className="h-5 w-5" /> : phase.id + 1}
                      {phase.gate.status === 'passed' && (
                        <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-green-600 rounded-full flex items-center justify-center border-2 border-white">
                          <CheckCircle2 className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                    <p className={`mt-2 text-sm font-medium ${selectedPhase === phase.id ? 'text-primary' : ''}`}>{phase.name}</p>
                    <p className="text-xs text-muted-foreground">{phase.progress}%</p>
                  </div>
                  {index < phases.length - 1 && (
                    <div className={`h-1 w-16 mx-2 ${phase.status === 'completed' ? 'bg-green-500' : 'bg-gray-200'}`}>
                      {phase.gate.status === 'passed' && (
                        <div className="relative">
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                            <FileCheck className="h-4 w-4 text-green-600" />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Selected Phase Details */}
        <div className="grid grid-cols-3 gap-6">
          <Card className="col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{currentPhase.name} Phase</CardTitle>
                <Badge className={getStatusColor(currentPhase.status)}>{currentPhase.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-2 text-sm">
                  <span>Progress</span>
                  <span>{currentPhase.progress}%</span>
                </div>
                <Progress value={currentPhase.progress} className="h-3" />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Start Date</p>
                  <p className="font-medium">{currentPhase.startDate}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">End Date</p>
                  <p className="font-medium">{currentPhase.endDate}</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-3">Deliverables</h4>
                <div className="space-y-2">
                  {currentPhase.deliverables.map((del, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                      <span>{del.name}</span>
                      <Badge className={getStatusColor(del.status)}>{del.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5" />
                Phase Gate
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`p-4 rounded-lg ${currentPhase.gate.status === 'passed' ? 'bg-green-50 border-green-200' : currentPhase.gate.status === 'pending' ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50'} border`}>
                <div className="flex items-center gap-2 mb-2">
                  {currentPhase.gate.status === 'passed' ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <Clock className="h-5 w-5 text-yellow-600" />}
                  <span className="font-medium capitalize">{currentPhase.gate.status}</span>
                </div>
                <p className="text-sm text-muted-foreground">Gate Date: {currentPhase.gate.date}</p>
                <p className="text-sm text-muted-foreground">Approver: {currentPhase.gate.approver}</p>
              </div>
              
              {currentPhase.gate.status === 'pending' && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Gate Criteria</h4>
                  <ul className="text-sm space-y-1">
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" />All deliverables complete</li>
                    <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-yellow-500" />Quality review passed</li>
                    <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-gray-400" />Stakeholder sign-off</li>
                  </ul>
                  <Button className="w-full mt-4" disabled>Request Gate Review</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

          {/* Methodology Help Panel */}
          <MethodologyHelpPanel methodology="waterfall" />
    </div>
  );
};

export default WaterfallPhaseGate;
