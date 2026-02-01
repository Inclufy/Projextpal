import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ProjectHeader } from '@/components/ProjectHeader';
import { TrendingUp, Lightbulb, FlaskConical, Rocket, ArrowRight, Loader2, Plus } from 'lucide-react';

import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001/api/v1';

const fetchImproveData = async (projectId: string) => {
  const token = localStorage.getItem("access_token");
  
  // Try sixsigma improve endpoint
  const response = await fetch(`${API_BASE_URL}/sixsigma/projects/${projectId}/improve/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  if (response.ok) {
    return response.json();
  }
  
  // Return empty data structure
  return {
    solutions: [],
    pilotResults: null,
    implementationPlan: [],
  };
};

const SixSigmaImprove = () => {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ['sixsigma-improve', id],
    queryFn: () => fetchImproveData(id!),
    enabled: !!id,
  });

  const solutions = data?.solutions || [];
  const pilotResults = data?.pilotResults;
  const implementationPlan = data?.implementationPlan || [];

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'implemented': case 'completed': return 'bg-green-500';
      case 'piloting': case 'in_progress': return 'bg-blue-500';
      default: return 'bg-gray-400';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-green-100 text-green-700';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-full bg-background">
        <ProjectHeader />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
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
              <TrendingUp className="h-6 w-6 text-green-600" />
              Improve Phase
            </h1>
            <p className="text-muted-foreground">Solution Design, Piloting & Implementation</p>
          </div>
          <Button className="bg-green-600 hover:bg-green-700">
            <Lightbulb className="h-4 w-4 mr-2" />Add Solution
          </Button>
        </div>

        {/* Solutions Matrix */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-green-600" />
              Solution Prioritization Matrix
            </CardTitle>
          </CardHeader>
          <CardContent>
            {solutions.length === 0 ? (
              <div className="text-center py-8">
                <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No solutions defined yet</p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Solution
                </Button>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3">Solution</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Impact</th>
                    <th className="pb-3">Effort</th>
                    <th className="pb-3">Expected Reduction</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {solutions.map((solution: any) => (
                    <tr key={solution.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 font-medium">{solution.name}</td>
                      <td className="py-3"><Badge variant="outline">{solution.category}</Badge></td>
                      <td className="py-3"><Badge className={getImpactColor(solution.impact)}>{solution.impact}</Badge></td>
                      <td className="py-3"><Badge variant="outline">{solution.effort}</Badge></td>
                      <td className="py-3 text-green-600 font-medium">-{solution.expectedReduction || solution.expected_reduction}%</td>
                      <td className="py-3"><Badge className={getStatusColor(solution.status)}>{solution.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {/* Pilot Results */}
        {pilotResults && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <FlaskConical className="h-5 w-5" />
                Pilot Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-4">
                <div className="p-4 bg-white rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Pilot Duration</p>
                  <p className="text-xl font-bold">{pilotResults.pilotDuration || pilotResults.pilot_duration}</p>
                </div>
                <div className="p-4 bg-white rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Sample Size</p>
                  <p className="text-xl font-bold">{pilotResults.sampleSize || pilotResults.sample_size}</p>
                </div>
                <div className="p-4 bg-white rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Baseline</p>
                  <p className="text-xl font-bold text-red-600">{pilotResults.baselineDefectRate || pilotResults.baseline_defect_rate}%</p>
                </div>
                <div className="p-4 bg-white rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Pilot Result</p>
                  <p className="text-xl font-bold text-green-600">{pilotResults.pilotDefectRate || pilotResults.pilot_defect_rate}%</p>
                </div>
                <div className="p-4 bg-white rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Improvement</p>
                  <p className="text-xl font-bold text-green-600">-{pilotResults.improvement}%</p>
                </div>
              </div>
              {pilotResults.statisticalSignificance && (
                <div className="mt-4 p-3 bg-white rounded-lg flex items-center justify-between">
                  <span className="text-sm">Statistical Significance:</span>
                  <Badge className="bg-green-500">{pilotResults.statisticalSignificance || pilotResults.statistical_significance}</Badge>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Implementation Plan */}
        {implementationPlan.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="h-5 w-5 text-green-600" />
                Implementation Rollout Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {implementationPlan.map((phase: any, i: number) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-40 shrink-0">
                      <p className="font-medium">{phase.phase || phase.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {phase.startDate || phase.start_date} - {phase.endDate || phase.end_date}
                      </p>
                    </div>
                    <div className="flex-1">
                      <Progress 
                        value={phase.progress} 
                        className={`h-3 ${
                          phase.status === 'completed' ? '[&>div]:bg-green-500' : 
                          phase.status === 'in_progress' ? '[&>div]:bg-blue-500' : ''
                        }`} 
                      />
                    </div>
                    <Badge className={getStatusColor(phase.status)}>
                      {(phase.status || '').replace('_', ' ')}
                    </Badge>
                    <span className="w-16 text-right">{phase.progress}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty state for implementation plan */}
        {implementationPlan.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="h-5 w-5 text-green-600" />
                Implementation Rollout Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8">
              <Rocket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No implementation phases defined yet</p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Implementation Phase
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Six Sigma Tips */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-4">
            <h3 className="font-semibold text-green-900 mb-2">Improve Phase Best Practices</h3>
            <ul className="space-y-1 text-sm text-green-800">
              <li>• Prioritize solutions using Impact/Effort matrix</li>
              <li>• Always pilot before full implementation</li>
              <li>• Measure statistical significance of improvements</li>
              <li>• Document lessons learned for Control phase</li>
            </ul>
          </CardContent>
        </Card>
      </div>
      <MethodologyHelpPanel methodology="lean_six_sigma" />
    </div>
  );
};

export default SixSigmaImprove;
