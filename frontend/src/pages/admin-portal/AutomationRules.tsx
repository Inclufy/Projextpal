// ============================================================
// ADMIN PORTAL - AUTOMATION RULES (IL-3)
// Real CRUD against /api/v1/admin/automation-rules/ + dry-run.
// ============================================================

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Loader2, Plus, Zap, Trash2, PlayCircle, Activity } from 'lucide-react';
import { toast } from 'sonner';

const TRIGGERS = [
  'task.status_changed', 'task.created', 'backlog_item.status_changed',
  'iteration.completed', 'risk.created', 'risk.exposure_changed',
  'milestone.due', 'phase.gate_requested', 'custom',
];
const ACTIONS = ['notify', 'field_update', 'webhook', 'gate_transition'];

interface Rule {
  id: string;
  name: string;
  description?: string;
  trigger: string;
  trigger_display?: string;
  condition: any;
  action_type: string;
  action_type_display?: string;
  action_config: any;
  is_active: boolean;
  trigger_count: number;
  run_count?: number;
  last_triggered_at?: string | null;
}

const BASE = '/api/v1/admin/automation-rules/';

const AutomationRules = () => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dryResult, setDryResult] = useState<Record<string, any>>({});
  const [form, setForm] = useState({
    name: '', description: '', trigger: 'backlog_item.status_changed',
    action_type: 'notify', condition: '{\n  "clauses": [\n    {"field": "status", "op": "changed_to", "value": "done"}\n  ]\n}',
    action_config: '{\n  "message": "{{title}} shipped"\n}',
  });

  const token = localStorage.getItem('access_token');
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, 'Content-Type': 'application/json' };

  const fetchRules = async () => {
    try {
      const r = await fetch(BASE, { headers });
      if (r.ok) { const d = await r.json(); setRules(Array.isArray(d) ? d : d.results || []); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchRules(); }, []);

  const submit = async () => {
    let condition: any, action_config: any;
    try { condition = form.condition.trim() ? JSON.parse(form.condition) : {}; }
    catch { toast.error('Condition is geen geldige JSON'); return; }
    try { action_config = form.action_config.trim() ? JSON.parse(form.action_config) : {}; }
    catch { toast.error('Action config is geen geldige JSON'); return; }
    if (!form.name) { toast.error('Naam verplicht'); return; }
    setSubmitting(true);
    try {
      const r = await fetch(BASE, {
        method: 'POST', headers: jsonHeaders,
        body: JSON.stringify({
          name: form.name, description: form.description, trigger: form.trigger,
          action_type: form.action_type, condition, action_config,
        }),
      });
      if (r.ok) {
        toast.success('Regel aangemaakt'); setDialogOpen(false);
        setForm({ ...form, name: '', description: '' }); fetchRules();
      } else {
        const err = await r.json().catch(() => null);
        toast.error(err?.detail || JSON.stringify(err) || 'Aanmaken mislukt');
      }
    } catch { toast.error('Aanmaken mislukt'); }
    finally { setSubmitting(false); }
  };

  const toggleActive = async (rule: Rule) => {
    try {
      const r = await fetch(`${BASE}${rule.id}/`, {
        method: 'PATCH', headers: jsonHeaders,
        body: JSON.stringify({ is_active: !rule.is_active }),
      });
      if (r.ok) fetchRules();
    } catch { toast.error('Bijwerken mislukt'); }
  };

  const remove = async (id: string) => {
    if (!confirm('Verwijderen?')) return;
    try {
      const r = await fetch(`${BASE}${id}/`, { method: 'DELETE', headers });
      if (r.ok || r.status === 204) { toast.success('Verwijderd'); fetchRules(); }
    } catch { toast.error('Verwijderen mislukt'); }
  };

  const dryRun = async (rule: Rule) => {
    const sample = prompt('Sample payload (JSON):',
      '{"changes": {"status": {"to": "done"}}, "title": "Demo"}');
    if (sample === null) return;
    let payload: any;
    try { payload = JSON.parse(sample); } catch { toast.error('Ongeldige JSON'); return; }
    try {
      const r = await fetch(`${BASE}${rule.id}/dry-run/`, {
        method: 'POST', headers: jsonHeaders, body: JSON.stringify({ payload }),
      });
      if (r.ok) {
        const d = await r.json();
        setDryResult({ ...dryResult, [rule.id]: d });
        toast.success(d.matched ? 'Match — actie zou worden uitgevoerd' : 'Geen match');
      } else toast.error('Dry-run mislukt');
    } catch { toast.error('Dry-run mislukt'); }
  };

  if (loading) return (<div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Zap className="h-6 w-6 text-violet-500" />
          <div>
            <h1 className="text-2xl font-bold">Automation Rules</h1>
            <p className="text-sm text-muted-foreground">Trigger → condition → action. Evaluated by the engine, with an audit trail.</p>
          </div>
          <Badge variant="outline">{rules.length}</Badge>
        </div>
        <Button onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-1" />New Rule</Button>
      </div>

      {rules.length === 0 ? (
        <Card className="p-8 text-center">
          <Zap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No automation rules yet</h3>
          <p className="text-muted-foreground">Create a rule to automate notifications, field updates, webhooks and gate transitions.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => (
            <Card key={rule.id}><CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-medium">{rule.name}</span>
                    <Badge variant="outline">{rule.trigger_display || rule.trigger}</Badge>
                    <span className="text-muted-foreground text-xs">→</span>
                    <Badge variant="secondary">{rule.action_type_display || rule.action_type}</Badge>
                    {rule.is_active
                      ? <Badge className="bg-green-100 text-green-700">Active</Badge>
                      : <Badge variant="outline">Paused</Badge>}
                  </div>
                  {rule.description && <p className="text-sm text-muted-foreground">{rule.description}</p>}
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Activity className="h-3 w-3" /> {rule.trigger_count} fired · {rule.run_count ?? 0} runs
                  </p>
                  {dryResult[rule.id] && (
                    <div className={`mt-2 text-xs p-2 rounded border ${dryResult[rule.id].matched ? 'bg-green-50 border-green-200 text-green-700' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                      Dry-run: {dryResult[rule.id].matched ? 'MATCH' : 'no match'}
                      {dryResult[rule.id].matched && dryResult[rule.id].action?.config && (
                        <pre className="mt-1 whitespace-pre-wrap">{JSON.stringify(dryResult[rule.id].action.config, null, 2)}</pre>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="outline" size="sm" onClick={() => dryRun(rule)}><PlayCircle className="h-3.5 w-3.5 mr-1" />Test</Button>
                  <Button variant="ghost" size="sm" onClick={() => toggleActive(rule)}>{rule.is_active ? 'Pause' : 'Activate'}</Button>
                  <Button variant="ghost" size="sm" onClick={() => remove(rule.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
            </CardContent></Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New Automation Rule</DialogTitle>
          <DialogDescription>When the trigger fires and the condition matches, the action runs.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div className="space-y-2"><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="space-y-2"><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Trigger</Label>
              <Select value={form.trigger} onValueChange={(v) => setForm({ ...form, trigger: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TRIGGERS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Action</Label>
              <Select value={form.action_type} onValueChange={(v) => setForm({ ...form, action_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ACTIONS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2"><Label>Condition (JSON)</Label><Textarea className="font-mono text-xs min-h-[120px]" value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} /></div>
          <div className="space-y-2"><Label>Action config (JSON, supports {'{{path}}'})</Label><Textarea className="font-mono text-xs min-h-[80px]" value={form.action_config} onChange={(e) => setForm({ ...form, action_config: e.target.value })} /></div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={submit} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Create</Button>
          </div>
        </div>
      </DialogContent></Dialog>
    </div>
  );
};

export default AutomationRules;
