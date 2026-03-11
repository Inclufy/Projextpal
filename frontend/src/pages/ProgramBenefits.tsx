import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ProjectHeader } from '@/components/ProjectHeader';
import { Award, TrendingUp, DollarSign, Target, CheckCircle2, Loader2, Plus, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { usePageTranslations } from '@/hooks/usePageTranslations';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatBudgetDetailed, getCurrencyFromLanguage } from '@/lib/currencies';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001/api/v1';

const fetchProgramBenefits = async (programId: string) => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_BASE_URL}/programs/${programId}/benefits/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) return [];
  return response.json();
};

const ProgramBenefits = () => {
  const { pt } = usePageTranslations();
  const { language } = useLanguage();
  const fmtCurrency = (val: number) => formatBudgetDetailed(val, getCurrencyFromLanguage(language));
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: benefits = [], isLoading } = useQuery({
    queryKey: ['program-benefits', id],
    queryFn: () => fetchProgramBenefits(id!),
    enabled: !!id,
  });

  const summary = {
    totalFinancial: benefits.filter((b: any) => b.type === 'financial').reduce((sum: number, b: any) => sum + (parseFloat(b.target_value) || 0), 0),
    realizedFinancial: benefits.filter((b: any) => b.type === 'financial').reduce((sum: number, b: any) => sum + (parseFloat(b.realized_value) || 0), 0),
    onTrack: benefits.filter((b: any) => b.status === 'on_track').length,
    atRisk: benefits.filter((b: any) => b.status === 'at_risk').length,
    realized: benefits.filter((b: any) => b.status === 'realized').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'realized': return 'bg-green-500';
      case 'on_track': return 'bg-blue-500';
      case 'at_risk': return 'bg-yellow-500';
      case 'not_achieved': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
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
              <Award className="h-6 w-6 text-indigo-600" />
              Benefits Management
            </h1>
            <p className="text-muted-foreground">Track and realize program benefits</p>
          </div>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Benefit
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Target Financial Benefits</p>
              <p className="text-2xl font-bold">{fmtCurrency(summary.totalFinancial)}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Realized to Date</p>
              <p className="text-2xl font-bold text-blue-600">{fmtCurrency(summary.realizedFinancial)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Benefits On Track</p>
              <p className="text-2xl font-bold text-green-600">{summary.onTrack + summary.realized}</p>
            </CardContent>
          </Card>
          <Card className={summary.atRisk > 0 ? 'border-yellow-300 bg-yellow-50' : ''}>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">{pt("At Risk")}</p>
              <p className={`text-2xl font-bold ${summary.atRisk > 0 ? 'text-yellow-600' : 'text-green-600'}`}>{summary.atRisk}</p>
            </CardContent>
          </Card>
        </div>

        {/* Benefits Table */}
        <Card>
          <CardHeader>
            <CardTitle>Benefits Register</CardTitle>
          </CardHeader>
          <CardContent>
            {benefits.length === 0 ? (
              <div className="text-center py-8">
                <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No benefits defined yet</p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Benefit
                </Button>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3">Benefit</th>
                    <th className="pb-3">{pt("Type")}</th>
                    <th className="pb-3">{pt("Owner")}</th>
                    <th className="pb-3">{pt("Target")}</th>
                    <th className="pb-3">Realized</th>
                    <th className="pb-3">{pt("Progress")}</th>
                    <th className="pb-3">{pt("Status")}</th>
                  </tr>
                </thead>
                <tbody>
                  {benefits.map((benefit: any) => {
                    const target = parseFloat(benefit.target_value) || 0;
                    const realized = parseFloat(benefit.realized_value) || 0;
                    const progress = target > 0 ? (realized / target) * 100 : 0;
                    
                    return (
                      <tr key={benefit.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 font-medium">{benefit.name}</td>
                        <td className="py-3">
                          <Badge variant="outline">
                            {benefit.type === 'financial' ? <DollarSign className="h-3 w-3 mr-1" /> : <TrendingUp className="h-3 w-3 mr-1" />}
                            {benefit.type}
                          </Badge>
                        </td>
                        <td className="py-3 text-sm text-muted-foreground">{benefit.owner || '-'}</td>
                        <td className="py-3">
                          {benefit.type === 'financial' ? fmtCurrency(target) : `${target}%`}
                        </td>
                        <td className="py-3 text-green-600">
                          {benefit.type === 'financial' ? fmtCurrency(realized) : `${realized}%`}
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <Progress value={Math.min(progress, 100)} className="h-2 w-16" />
                            <span className="text-xs">{Math.round(progress)}%</span>
                          </div>
                        </td>
                        <td className="py-3">
                          <Badge className={getStatusColor(benefit.status)}>
                            {benefit.status === 'realized' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                            {benefit.status?.replace('_', ' ') || 'pending'}
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

export default ProgramBenefits;
