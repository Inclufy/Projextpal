import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ProjectHeader } from '@/components/ProjectHeader';
import { useProject } from '@/hooks/useApi';
import { sixsigmaApi, ProjectClosure } from '@/lib/sixsigmaApi';
import { Award, Save, Loader2, AlertCircle, CheckCircle, TrendingUp, DollarSign, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
const SixSigmaClosure = () => {
  const { id } = useParams<{ id: string }>();
  const { data: project } = useProject(id);
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [closure, setClosure] = useState<ProjectClosure | null>(null);
  const [formData, setFormData] = useState({
    baseline_performance: '',
    final_performance: '',
    improvement_achieved: '',
    financial_benefit: 0,
    benefit_type: 'cost_reduction',
    lessons_learned: '',
    best_practices: '',
    recommendations: '',
    team_recognition: '',
    handover_notes: '',
    documentation_status: '',
    closure_date: new Date().toISOString().split('T')[0],
    approved_by: '',
  });

  useEffect(() => {
    if (id) loadClosure();
  }, [id]);

  const loadClosure = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const closures = await sixsigmaApi.closure.getAll(id);
      if (closures.length > 0) {
        setClosure(closures[0]);
        setFormData({
          baseline_performance: closures[0].baseline_performance || '',
          final_performance: closures[0].final_performance || '',
          improvement_achieved: closures[0].improvement_achieved || '',
          financial_benefit: closures[0].financial_benefit || 0,
          benefit_type: closures[0].benefit_type || 'cost_reduction',
          lessons_learned: closures[0].lessons_learned || '',
          best_practices: closures[0].best_practices || '',
          recommendations: closures[0].recommendations || '',
          team_recognition: closures[0].team_recognition || '',
          handover_notes: closures[0].handover_notes || '',
          documentation_status: closures[0].documentation_status || '',
          closure_date: closures[0].closure_date || new Date().toISOString().split('T')[0],
          approved_by: closures[0].approved_by || '',
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load closure data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      if (closure) {
        await sixsigmaApi.closure.update(id, closure.id, formData);
        toast({ title: 'Saved', description: 'Closure report updated.' });
      } else {
        const created = await sixsigmaApi.closure.create(id, formData);
        setClosure(created);
        toast({ title: 'Created', description: 'Closure report created.' });
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
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
              <Award className="h-6 w-6 text-amber-600" />
              Project Closure
            </h1>
            <p className="text-muted-foreground">Document project completion and benefits realized</p>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Closure Report
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Results Summary */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-800">Baseline</span>
              </div>
              <Input
                value={formData.baseline_performance}
                onChange={(e) => setFormData({ ...formData, baseline_performance: e.target.value })}
                placeholder="e.g., 15% defect rate"
                className="bg-white"
              />
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">Final Performance</span>
              </div>
              <Input
                value={formData.final_performance}
                onChange={(e) => setFormData({ ...formData, final_performance: e.target.value })}
                placeholder="e.g., 3% defect rate"
                className="bg-white"
              />
            </CardContent>
          </Card>
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-purple-800">Improvement</span>
              </div>
              <Input
                value={formData.improvement_achieved}
                onChange={(e) => setFormData({ ...formData, improvement_achieved: e.target.value })}
                placeholder="e.g., 80% reduction"
                className="bg-white"
              />
            </CardContent>
          </Card>
        </div>

        {/* Financial Benefits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Financial Benefits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Annual Financial Benefit ($)</label>
                <Input
                  type="number"
                  value={formData.financial_benefit}
                  onChange={(e) => setFormData({ ...formData, financial_benefit: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Benefit Type</label>
                <select 
                  className="w-full h-10 rounded-md border border-input bg-background px-3"
                  value={formData.benefit_type}
                  onChange={(e) => setFormData({ ...formData, benefit_type: e.target.value })}
                >
                  <option value="cost_reduction">Cost Reduction</option>
                  <option value="cost_avoidance">Cost Avoidance</option>
                  <option value="revenue_increase">Revenue Increase</option>
                  <option value="productivity">Productivity Improvement</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lessons Learned */}
        <Card>
          <CardHeader>
            <CardTitle>Lessons Learned & Best Practices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Lessons Learned</label>
              <Textarea
                value={formData.lessons_learned}
                onChange={(e) => setFormData({ ...formData, lessons_learned: e.target.value })}
                placeholder="What did the team learn during this project?"
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Best Practices to Share</label>
              <Textarea
                value={formData.best_practices}
                onChange={(e) => setFormData({ ...formData, best_practices: e.target.value })}
                placeholder="What approaches should be replicated?"
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Recommendations for Future Projects</label>
              <Textarea
                value={formData.recommendations}
                onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
                placeholder="Advice for similar future projects..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Team Recognition */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Team Recognition
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.team_recognition}
              onChange={(e) => setFormData({ ...formData, team_recognition: e.target.value })}
              placeholder="Acknowledge team members and their contributions..."
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Handover & Documentation */}
        <Card>
          <CardHeader>
            <CardTitle>Handover & Documentation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Handover Notes</label>
              <Textarea
                value={formData.handover_notes}
                onChange={(e) => setFormData({ ...formData, handover_notes: e.target.value })}
                placeholder="Instructions for process owners..."
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Documentation Status</label>
              <Input
                value={formData.documentation_status}
                onChange={(e) => setFormData({ ...formData, documentation_status: e.target.value })}
                placeholder="e.g., All documents uploaded to SharePoint"
              />
            </div>
          </CardContent>
        </Card>

        {/* Approval */}
        <Card>
          <CardHeader>
            <CardTitle>Closure Approval</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Closure Date</label>
                <Input
                  type="date"
                  value={formData.closure_date}
                  onChange={(e) => setFormData({ ...formData, closure_date: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Approved By</label>
                <Input
                  value={formData.approved_by}
                  onChange={(e) => setFormData({ ...formData, approved_by: e.target.value })}
                  placeholder="Champion / Sponsor name"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <h4 className="font-medium text-blue-800 mb-2">💡 Closure Checklist</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>✓ All tollgate reviews completed and approved</li>
              <li>✓ Control plan in place and validated</li>
              <li>✓ Process owners trained on new procedures</li>
              <li>✓ Documentation complete and accessible</li>
              <li>✓ Financial benefits validated with Finance</li>
              <li>✓ Lessons learned documented and shared</li>
            </ul>
          </CardContent>
        </Card>
      </div>
      <MethodologyHelpPanel methodology="lean_six_sigma" />
    </div>
  );
};

export default SixSigmaClosure;
