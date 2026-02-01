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
import { sixsigmaApi, VoiceOfCustomer } from '@/lib/sixsigmaApi';
import { Users, Plus, Trash2, Save, Loader2, AlertCircle, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
const priorityColors: Record<string, string> = {
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-yellow-500',
  low: 'bg-green-500',
};

const SixSigmaVOC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: project } = useProject(id);
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vocItems, setVocItems] = useState<VoiceOfCustomer[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newVoc, setNewVoc] = useState({
    customer_segment: '',
    voice_statement: '',
    customer_need: '',
    ctq_requirement: '',
    priority: 'medium',
    measurement: '',
    target_value: '',
  });

  useEffect(() => {
    if (id) loadVOC();
  }, [id]);

  const loadVOC = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await sixsigmaApi.voc.getAll(id);
      setVocItems(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load VOC data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const created = await sixsigmaApi.voc.create(id, newVoc);
      setVocItems([...vocItems, created]);
      setShowForm(false);
      setNewVoc({
        customer_segment: '',
        voice_statement: '',
        customer_need: '',
        ctq_requirement: '',
        priority: 'medium',
        measurement: '',
        target_value: '',
      });
      toast({ title: 'VOC Added', description: 'Voice of Customer item created successfully.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (vocId: number) => {
    if (!id) return;
    try {
      await sixsigmaApi.voc.delete(id, vocId);
      setVocItems(vocItems.filter(v => v.id !== vocId));
      toast({ title: 'Deleted', description: 'VOC item removed.' });
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
          <span className="ml-2">Loading Voice of Customer...</span>
        </div>
      </div>
    );
  }

  // Group by priority
  const grouped = vocItems.reduce((acc, item) => {
    const p = item.priority || 'medium';
    if (!acc[p]) acc[p] = [];
    acc[p].push(item);
    return acc;
  }, {} as Record<string, VoiceOfCustomer[]>);

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Users className="h-6 w-6 text-blue-600" />
              Voice of Customer (VOC)
            </h1>
            <p className="text-muted-foreground">Capture customer needs and translate to CTQ requirements</p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add VOC
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        {/* New VOC Form */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Add Voice of Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Customer Segment</label>
                  <Input
                    value={newVoc.customer_segment}
                    onChange={(e) => setNewVoc({ ...newVoc, customer_segment: e.target.value })}
                    placeholder="e.g., End Users, Enterprise Clients"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <Select value={newVoc.priority} onValueChange={(v) => setNewVoc({ ...newVoc, priority: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Voice Statement (What the customer says)</label>
                <Textarea
                  value={newVoc.voice_statement}
                  onChange={(e) => setNewVoc({ ...newVoc, voice_statement: e.target.value })}
                  placeholder="e.g., 'The process takes too long'"
                  rows={2}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Customer Need (What they really mean)</label>
                <Textarea
                  value={newVoc.customer_need}
                  onChange={(e) => setNewVoc({ ...newVoc, customer_need: e.target.value })}
                  placeholder="e.g., Faster turnaround time"
                  rows={2}
                />
              </div>
              <div>
                <label className="text-sm font-medium">CTQ Requirement (Critical to Quality)</label>
                <Input
                  value={newVoc.ctq_requirement}
                  onChange={(e) => setNewVoc({ ...newVoc, ctq_requirement: e.target.value })}
                  placeholder="e.g., Processing time < 24 hours"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Measurement</label>
                  <Input
                    value={newVoc.measurement}
                    onChange={(e) => setNewVoc({ ...newVoc, measurement: e.target.value })}
                    placeholder="e.g., Hours from submission to completion"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Target Value</label>
                  <Input
                    value={newVoc.target_value}
                    onChange={(e) => setNewVoc({ ...newVoc, target_value: e.target.value })}
                    placeholder="e.g., < 24 hours"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreate} disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Save VOC
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* VOC Items by Priority */}
        {vocItems.length > 0 ? (
          <div className="space-y-6">
            {['critical', 'high', 'medium', 'low'].map(priority => (
              grouped[priority]?.length > 0 && (
                <div key={priority}>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Badge className={`${priorityColors[priority]} text-white`}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Badge>
                    <span className="text-muted-foreground">({grouped[priority].length})</span>
                  </h3>
                  <div className="grid gap-4">
                    {grouped[priority].map(voc => (
                      <Card key={voc.id}>
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline">{voc.customer_segment}</Badge>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Voice: </span>
                                  <span className="italic">"{voc.voice_statement}"</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Need: </span>
                                  {voc.customer_need}
                                </div>
                                <div>
                                  <span className="text-muted-foreground">CTQ: </span>
                                  <span className="font-medium text-blue-600">{voc.ctq_requirement}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Target: </span>
                                  {voc.target_value}
                                </div>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(voc.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Voice of Customer Data</h3>
              <p className="text-muted-foreground mb-4">
                Capture what your customers are saying and translate it to measurable requirements.
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First VOC
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <h4 className="font-medium text-blue-800 mb-2">💡 VOC Tips</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>Voice:</strong> Exact words the customer uses (often vague or emotional)</li>
              <li>• <strong>Need:</strong> The underlying requirement (what they really mean)</li>
              <li>• <strong>CTQ:</strong> Specific, measurable requirement critical to quality</li>
              <li>• Use surveys, interviews, complaints, and feedback as sources</li>
            </ul>
          </CardContent>
        </Card>
      </div>
      <MethodologyHelpPanel methodology="lean_six_sigma" />
    </div>
  );
};

export default SixSigmaVOC;
