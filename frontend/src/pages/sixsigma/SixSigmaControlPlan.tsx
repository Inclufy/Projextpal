import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ProjectHeader } from '@/components/ProjectHeader';
import { useProject } from '@/hooks/useApi';
import { sixsigmaApi, ControlPlan, ControlPlanItem } from '@/lib/sixsigmaApi';
import { FileText, Plus, Trash2, Loader2, AlertCircle, Shield, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
const SixSigmaControlPlan = () => {
  const { id } = useParams<{ id: string }>();
  const { data: project } = useProject(id);
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [controlPlan, setControlPlan] = useState<ControlPlan | null>(null);
  const [items, setItems] = useState<ControlPlanItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newItem, setNewItem] = useState({
    process_step: '',
    input_output: 'output',
    characteristic: '',
    specification: '',
    measurement_method: '',
    sample_size: '',
    sample_frequency: '',
    control_method: '',
    reaction_plan: '',
    responsible: '',
  });

  useEffect(() => {
    if (id) loadControlPlan();
  }, [id]);

  const loadControlPlan = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const plans = await sixsigmaApi.controlPlan.getAll(id);
      if (plans.length > 0) {
        setControlPlan(plans[0]);
        // Load items for this control plan
        const planItems = await sixsigmaApi.controlPlanItems.getAll(id, plans[0].id);
        setItems(planItems);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load control plan');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const created = await sixsigmaApi.controlPlan.create(id, {
        title: `${project?.name || 'Project'} Control Plan`,
        process_name: project?.name || 'Process',
        revision: '1.0',
        status: 'draft',
      });
      setControlPlan(created);
      toast({ title: 'Control Plan Created', description: 'Now add control items.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddItem = async () => {
    if (!id || !controlPlan) return;
    setSaving(true);
    try {
      const created = await sixsigmaApi.controlPlanItems.create(id, controlPlan.id, newItem);
      setItems([...items, created]);
      setShowForm(false);
      setNewItem({
        process_step: '',
        input_output: 'output',
        characteristic: '',
        specification: '',
        measurement_method: '',
        sample_size: '',
        sample_frequency: '',
        control_method: '',
        reaction_plan: '',
        responsible: '',
      });
      toast({ title: 'Item Added', description: 'Control item created.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!id || !controlPlan) return;
    try {
      await sixsigmaApi.controlPlanItems.delete(id, controlPlan.id, itemId);
      setItems(items.filter(i => i.id !== itemId));
      toast({ title: 'Deleted', description: 'Control item removed.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleApprovePlan = async () => {
    if (!id || !controlPlan) return;
    try {
      await sixsigmaApi.controlPlan.update(id, controlPlan.id, { status: 'approved' });
      setControlPlan({ ...controlPlan, status: 'approved' });
      toast({ title: 'Approved', description: 'Control plan approved.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
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
              <FileText className="h-6 w-6 text-teal-600" />
              Control Plan
            </h1>
            <p className="text-muted-foreground">Document how improvements will be sustained</p>
          </div>
          {controlPlan && controlPlan.status !== 'approved' && (
            <div className="flex gap-2">
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Control Item
              </Button>
              <Button variant="outline" onClick={handleApprovePlan}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve Plan
              </Button>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        {/* No Control Plan Yet */}
        {!controlPlan && (
          <Card>
            <CardContent className="py-12 text-center">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Control Plan Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create a control plan to document how you'll sustain improvements.
              </p>
              <Button onClick={handleCreatePlan} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Control Plan
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Control Plan Header */}
        {controlPlan && (
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{controlPlan.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    Process: {controlPlan.process_name} | Rev: {controlPlan.revision}
                  </p>
                </div>
                <Badge className={controlPlan.status === 'approved' ? 'bg-green-500' : 'bg-yellow-500'}>
                  {controlPlan.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* New Item Form */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Add Control Item</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Process Step</label>
                  <Input
                    value={newItem.process_step}
                    onChange={(e) => setNewItem({ ...newItem, process_step: e.target.value })}
                    placeholder="e.g., Data Entry"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Input/Output</label>
                  <Select value={newItem.input_output} onValueChange={(v) => setNewItem({ ...newItem, input_output: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="input">Input (X)</SelectItem>
                      <SelectItem value="output">Output (Y)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Characteristic</label>
                  <Input
                    value={newItem.characteristic}
                    onChange={(e) => setNewItem({ ...newItem, characteristic: e.target.value })}
                    placeholder="What is being measured?"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Specification/Tolerance</label>
                  <Input
                    value={newItem.specification}
                    onChange={(e) => setNewItem({ ...newItem, specification: e.target.value })}
                    placeholder="e.g., ± 5%, < 24 hours"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Measurement Method</label>
                  <Input
                    value={newItem.measurement_method}
                    onChange={(e) => setNewItem({ ...newItem, measurement_method: e.target.value })}
                    placeholder="How is it measured?"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Sample Size</label>
                  <Input
                    value={newItem.sample_size}
                    onChange={(e) => setNewItem({ ...newItem, sample_size: e.target.value })}
                    placeholder="e.g., 5, 100%"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Sample Frequency</label>
                  <Input
                    value={newItem.sample_frequency}
                    onChange={(e) => setNewItem({ ...newItem, sample_frequency: e.target.value })}
                    placeholder="e.g., Hourly, Daily"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Responsible</label>
                  <Input
                    value={newItem.responsible}
                    onChange={(e) => setNewItem({ ...newItem, responsible: e.target.value })}
                    placeholder="Who monitors this?"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Control Method</label>
                <Input
                  value={newItem.control_method}
                  onChange={(e) => setNewItem({ ...newItem, control_method: e.target.value })}
                  placeholder="e.g., Control Chart, Checklist, Audit"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Reaction Plan</label>
                <Textarea
                  value={newItem.reaction_plan}
                  onChange={(e) => setNewItem({ ...newItem, reaction_plan: e.target.value })}
                  placeholder="What to do if out of control..."
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddItem} disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Add Item
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Control Plan Table */}
        {controlPlan && items.length > 0 && (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-3">Process Step</th>
                      <th className="text-center p-3">I/O</th>
                      <th className="text-left p-3">Characteristic</th>
                      <th className="text-left p-3">Spec</th>
                      <th className="text-left p-3">Measurement</th>
                      <th className="text-center p-3">Sample</th>
                      <th className="text-left p-3">Control Method</th>
                      <th className="text-left p-3">Reaction Plan</th>
                      <th className="text-left p-3">Owner</th>
                      <th className="p-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(item => (
                      <tr key={item.id} className="border-t hover:bg-gray-50">
                        <td className="p-3">{item.process_step}</td>
                        <td className="p-3 text-center">
                          <Badge variant="outline">
                            {item.input_output === 'input' ? 'X' : 'Y'}
                          </Badge>
                        </td>
                        <td className="p-3">{item.characteristic}</td>
                        <td className="p-3">{item.specification}</td>
                        <td className="p-3">{item.measurement_method}</td>
                        <td className="p-3 text-center text-xs">
                          {item.sample_size}<br/>{item.sample_frequency}
                        </td>
                        <td className="p-3">{item.control_method}</td>
                        <td className="p-3 max-w-[150px] truncate">{item.reaction_plan}</td>
                        <td className="p-3">{item.responsible}</td>
                        <td className="p-3">
                          {controlPlan.status !== 'approved' && (
                            <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDeleteItem(item.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {controlPlan && items.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No control items yet. Add items to define how you'll sustain improvements.</p>
            </CardContent>
          </Card>
        )}

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <h4 className="font-medium text-blue-800 mb-2">💡 Control Plan Tips</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Focus on key process inputs (X) and outputs (Y)</li>
              <li>• Define clear specifications and tolerances</li>
              <li>• Establish practical sampling plans</li>
              <li>• Document clear reaction plans for out-of-control conditions</li>
            </ul>
          </CardContent>
        </Card>
      </div>
      <MethodologyHelpPanel methodology="lean_six_sigma" />
    </div>
  );
};

export default SixSigmaControlPlan;
