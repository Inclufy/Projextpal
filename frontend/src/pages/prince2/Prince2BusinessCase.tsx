import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ProjectHeader } from '@/components/ProjectHeader';
import { useProject } from '@/hooks/useApi';
import { prince2Api, BusinessCase, BusinessCaseBenefit, BusinessCaseRisk } from '@/lib/prince2Api';
import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
import { 
  FileCheck, TrendingUp, DollarSign, Clock, AlertTriangle, 
  CheckCircle2, Edit, Save, Target, Plus, Trash2, RefreshCw, X 
} from 'lucide-react';

const Prince2BusinessCase = () => {
  const { id } = useParams<{ id: string }>();
  const { data: project } = useProject(id);
  
  const [businessCase, setBusinessCase] = useState<BusinessCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showBenefitDialog, setShowBenefitDialog] = useState(false);
  const [showRiskDialog, setShowRiskDialog] = useState(false);
  
  // Form state for editing
  const [formData, setFormData] = useState<Partial<BusinessCase>>({});
  const [newBenefit, setNewBenefit] = useState<Partial<BusinessCaseBenefit>>({});
  const [newRisk, setNewRisk] = useState<Partial<BusinessCaseRisk>>({});

  useEffect(() => {
    if (id) loadBusinessCase();
  }, [id]);

  const loadBusinessCase = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const cases = await prince2Api.businessCase.get(id);
      if (cases.length > 0) {
        setBusinessCase(cases[0]);
        setFormData(cases[0]);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createBusinessCase = async () => {
    if (!id) return;
    try {
      setSaving(true);
      const newCase = await prince2Api.businessCase.create(id, {
        executive_summary: 'Enter executive summary...',
        reasons: 'Enter reasons for the project...',
        expected_benefits: 'Enter expected benefits...',
        development_costs: 0,
        ongoing_costs: 0,
      });
      setBusinessCase(newCase);
      setFormData(newCase);
      setIsEditing(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const saveBusinessCase = async () => {
    if (!id || !businessCase) return;
    try {
      setSaving(true);
      const updated = await prince2Api.businessCase.update(id, businessCase.id, formData);
      setBusinessCase(updated);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const approveBusinessCase = async () => {
    if (!id || !businessCase) return;
    try {
      setSaving(true);
      const updated = await prince2Api.businessCase.approve(id, businessCase.id);
      setBusinessCase(updated);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const addBenefit = async () => {
    if (!id || !businessCase) return;
    try {
      await prince2Api.businessCase.addBenefit(id, businessCase.id, newBenefit);
      setShowBenefitDialog(false);
      setNewBenefit({});
      await loadBusinessCase();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const addRisk = async () => {
    if (!id || !businessCase) return;
    try {
      await prince2Api.businessCase.addRisk(id, businessCase.id, newRisk);
      setShowRiskDialog(false);
      setNewRisk({});
      await loadBusinessCase();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  // No business case yet
  if (!businessCase) {
    return (
      <div className="min-h-full bg-background">
        <ProjectHeader project={project} />
        <div className="p-6">
          <Card className="max-w-lg mx-auto">
            <CardContent className="pt-6 text-center">
              <FileCheck className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">No Business Case</h2>
              <p className="text-muted-foreground mb-4">Create a business case to justify this project.</p>
              <Button onClick={createBusinessCase} disabled={saving}>
                {saving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                Create Business Case
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader project={project} />
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileCheck className="h-6 w-6 text-purple-600" />
              Business Case
            </h1>
            <p className="text-muted-foreground">PRINCE2 Business Justification Document</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={businessCase.status === 'approved' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'}>
              {businessCase.status}
            </Badge>
            <Badge variant="outline">v{businessCase.version}</Badge>
            {businessCase.status !== 'approved' && (
              <Button variant="outline" size="sm" onClick={approveBusinessCase} disabled={saving}>
                <CheckCircle2 className="h-4 w-4 mr-2" />Approve
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => isEditing ? saveBusinessCase() : setIsEditing(true)} disabled={saving}>
              {isEditing ? <><Save className="h-4 w-4 mr-2" />Save</> : <><Edit className="h-4 w-4 mr-2" />Edit</>}
            </Button>
          </div>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="text-red-700">{error}</span>
              <Button variant="ghost" size="sm" onClick={() => setError(null)} className="ml-auto"><X className="h-4 w-4" /></Button>
            </CardContent>
          </Card>
        )}

        {/* Executive Summary */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader><CardTitle className="text-lg">Executive Summary</CardTitle></CardHeader>
          <CardContent>
            {isEditing ? (
              <Textarea 
                value={formData.executive_summary || ''} 
                onChange={(e) => setFormData({...formData, executive_summary: e.target.value})}
                rows={4}
              />
            ) : (
              <p className="text-muted-foreground">{businessCase.executive_summary}</p>
            )}
          </CardContent>
        </Card>

        {/* Investment Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">ROI</p>
                  {isEditing ? (
                    <Input type="number" value={formData.roi_percentage || ''} onChange={(e) => setFormData({...formData, roi_percentage: parseFloat(e.target.value)})} className="w-24 mt-1" />
                  ) : (
                    <p className="text-3xl font-bold text-green-600">{businessCase.roi_percentage || 0}%</p>
                  )}
                </div>
                <TrendingUp className="h-10 w-10 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Payback</p>
                  {isEditing ? (
                    <Input type="number" value={formData.payback_period_months || ''} onChange={(e) => setFormData({...formData, payback_period_months: parseInt(e.target.value)})} className="w-24 mt-1" />
                  ) : (
                    <p className="text-3xl font-bold text-blue-600">{businessCase.payback_period_months || 0}m</p>
                  )}
                </div>
                <Clock className="h-10 w-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">NPV</p>
                  {isEditing ? (
                    <Input type="number" value={formData.net_present_value || ''} onChange={(e) => setFormData({...formData, net_present_value: parseFloat(e.target.value)})} className="w-32 mt-1" />
                  ) : (
                    <p className="text-3xl font-bold text-purple-600">€{(businessCase.net_present_value || 0).toLocaleString()}</p>
                  )}
                </div>
                <DollarSign className="h-10 w-10 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reasons */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Target className="h-5 w-5 text-purple-600" />Reasons for the Project</CardTitle></CardHeader>
          <CardContent>
            {isEditing ? (
              <Textarea value={formData.reasons || ''} onChange={(e) => setFormData({...formData, reasons: e.target.value})} rows={4} />
            ) : (
              <p className="whitespace-pre-line">{businessCase.reasons}</p>
            )}
          </CardContent>
        </Card>

        {/* Benefits */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-green-600" />Expected Benefits</CardTitle>
            <Dialog open={showBenefitDialog} onOpenChange={setShowBenefitDialog}>
              <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-2" />Add Benefit</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Benefit</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div><Label>Description</Label><Input value={newBenefit.description || ''} onChange={(e) => setNewBenefit({...newBenefit, description: e.target.value})} /></div>
                  <div><Label>Type</Label>
                    <Select value={newBenefit.benefit_type || ''} onValueChange={(v) => setNewBenefit({...newBenefit, benefit_type: v as any})}>
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="financial">Financial</SelectItem>
                        <SelectItem value="non_financial">Non-Financial</SelectItem>
                        <SelectItem value="intangible">Intangible</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Value</Label><Input value={newBenefit.value || ''} onChange={(e) => setNewBenefit({...newBenefit, value: e.target.value})} /></div>
                  <div><Label>Timing</Label><Input value={newBenefit.timing || ''} onChange={(e) => setNewBenefit({...newBenefit, timing: e.target.value})} /></div>
                  <Button onClick={addBenefit} className="w-full">Add Benefit</Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {businessCase.benefits?.length > 0 ? (
              <table className="w-full">
                <thead><tr className="border-b"><th className="text-left py-2">Benefit</th><th className="text-left py-2">Type</th><th className="text-left py-2">Value</th><th className="text-left py-2">Timing</th></tr></thead>
                <tbody>
                  {businessCase.benefits.map((b) => (
                    <tr key={b.id} className="border-b">
                      <td className="py-3">{b.description}</td>
                      <td><Badge variant="outline">{b.benefit_type}</Badge></td>
                      <td className="font-medium text-green-600">{b.value}</td>
                      <td className="text-muted-foreground">{b.timing}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-muted-foreground text-center py-4">No benefits defined yet</p>
            )}
          </CardContent>
        </Card>

        {/* Costs & Risks */}
        <div className="grid grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5 text-purple-600" />Project Costs</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span>Development</span>
                  {isEditing ? (
                    <Input type="number" value={formData.development_costs || ''} onChange={(e) => setFormData({...formData, development_costs: parseFloat(e.target.value)})} className="w-32" />
                  ) : (
                    <span className="font-medium">€{(businessCase.development_costs || 0).toLocaleString()}</span>
                  )}
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span>Ongoing (Annual)</span>
                  {isEditing ? (
                    <Input type="number" value={formData.ongoing_costs || ''} onChange={(e) => setFormData({...formData, ongoing_costs: parseFloat(e.target.value)})} className="w-32" />
                  ) : (
                    <span className="font-medium">€{(businessCase.ongoing_costs || 0).toLocaleString()}</span>
                  )}
                </div>
                <div className="flex justify-between py-2 text-lg font-bold">
                  <span>Total</span>
                  <span className="text-purple-600">€{(businessCase.total_costs || 0).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-orange-600" />Major Risks</CardTitle>
              <Dialog open={showRiskDialog} onOpenChange={setShowRiskDialog}>
                <DialogTrigger asChild><Button size="sm" variant="outline"><Plus className="h-4 w-4 mr-2" />Add</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Add Risk</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div><Label>Description</Label><Input value={newRisk.description || ''} onChange={(e) => setNewRisk({...newRisk, description: e.target.value})} /></div>
                    <div><Label>Probability</Label>
                      <Select value={newRisk.probability || ''} onValueChange={(v) => setNewRisk({...newRisk, probability: v as any})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="very_low">Very Low</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="very_high">Very High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div><Label>Impact</Label>
                      <Select value={newRisk.impact || ''} onValueChange={(v) => setNewRisk({...newRisk, impact: v as any})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="very_low">Very Low</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="very_high">Very High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div><Label>Mitigation</Label><Textarea value={newRisk.mitigation || ''} onChange={(e) => setNewRisk({...newRisk, mitigation: e.target.value})} /></div>
                    <Button onClick={addRisk} className="w-full">Add Risk</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {businessCase.risks?.length > 0 ? businessCase.risks.map((r) => (
                  <div key={r.id} className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">{r.description}</p>
                      <div className="flex gap-2">
                        <Badge variant="outline" className={r.probability === 'high' || r.probability === 'very_high' ? 'border-red-500 text-red-500' : ''}>{r.probability}</Badge>
                        <Badge variant="outline" className={r.impact === 'high' || r.impact === 'very_high' ? 'border-red-500 text-red-500' : ''}>{r.impact}</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">Mitigation: {r.mitigation}</p>
                  </div>
                )) : (
                  <p className="text-muted-foreground text-center py-4">No risks defined</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <MethodologyHelpPanel methodology="prince2" />
    </div>
  );
};

export default Prince2BusinessCase;
