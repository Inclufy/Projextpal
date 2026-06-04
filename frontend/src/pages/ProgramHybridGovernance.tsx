import { useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { ProjectHeader } from '@/components/ProjectHeader';
import {
  Layers, Loader2, Plus, Save, Gavel, Stamp, Activity, ShieldCheck, Repeat, Settings,
} from 'lucide-react';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001/api/v1';

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('access_token')}`,
});

const apiGet = async (path: string) => {
  const res = await fetch(`${API_BASE_URL}${path}`, { headers: authHeaders() });
  if (!res.ok) return null;
  return res.json();
};

const asList = (body: any): any[] => (!body ? [] : Array.isArray(body) ? body : (body.results ?? []));

// 409 `code` from the config-driven authorize gate -> human message.
const AUTH_ERRORS: Record<string, string> = {
  stage_gate_required: 'This predictive constituent needs a passed stage-gate review before it can be authorized.',
  cadence_checkpoint_required: 'This adaptive constituent needs a current cadence checkpoint before it can be authorized.',
  governance_gates_unmet: 'Blended governance requires both a stage gate and a current checkpoint.',
  already_authorized: 'This constituent is already authorized.',
  stage_gate_not_applicable: 'Adaptive constituents use checkpoints, not stage gates.',
  checkpoint_not_applicable: 'Predictive constituents use stage gates, not checkpoints.',
};

const MODE_LABEL: Record<string, string> = {
  predictive: 'Predictive — stage gate',
  adaptive: 'Adaptive — cadence checkpoint',
  blend: 'Blended — gate + cadence',
};

type View = 'constituents' | 'governance-config' | 'adaptations';

const resolveView = (pathname: string): View => {
  if (pathname.endsWith('/governance-config')) return 'governance-config';
  if (pathname.endsWith('/adaptations')) return 'adaptations';
  return 'constituents';
};

const ProgramHybridGovernance = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const view = resolveView(location.pathname);

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        {view === 'constituents' && <ConstituentsView programmeId={id!} />}
        {view === 'governance-config' && <GovernanceConfigView programmeId={id!} />}
        {view === 'adaptations' && <AdaptationsView programmeId={id!} />}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Constituents — the config-driven authorization board
// ---------------------------------------------------------------------------
const ConstituentsView = ({ programmeId }: { programmeId: string }) => {
  const qc = useQueryClient();
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['hp-constituents', programmeId] });
    qc.invalidateQueries({ queryKey: ['hp-rollup', programmeId] });
  };

  const listQ = useQuery({
    queryKey: ['hp-constituents', programmeId],
    queryFn: () => apiGet(`/hybrid-programme/programs/${programmeId}/constituents/`),
    enabled: !!programmeId,
  });
  const rollupQ = useQuery({
    queryKey: ['hp-rollup', programmeId],
    queryFn: () => apiGet(`/hybrid-programme/programs/${programmeId}/constituents/rollup/`),
    enabled: !!programmeId,
  });
  const projectsQ = useQuery({
    queryKey: ['projects-for-hp', programmeId],
    queryFn: () => apiGet(`/projects/`),
    enabled: !!programmeId,
  });

  const constituents = asList(listQ.data);
  const projects = asList(projectsQ.data);
  const rollup = rollupQ.data || {};

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ project: '', governance_mode: 'predictive', cadence_days: '14' });
  const [saving, setSaving] = useState(false);

  const doAction = async (cid: string, action: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/hybrid-programme/constituents/${cid}/${action}/`, {
        method: 'POST', headers: authHeaders(), body: '{}',
      });
      if (res.ok) { toast.success('Done'); refresh(); return; }
      const err = await res.json().catch(() => ({}));
      const blockers = err?.blockers ? ` (${err.blockers.join(', ')})` : '';
      toast.error((AUTH_ERRORS[err?.code] || err?.detail || 'Action blocked') + blockers);
    } catch { toast.error('Action failed'); }
  };

  const create = async () => {
    if (!form.project) { toast.error('Pick a constituent project'); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/hybrid-programme/programs/${programmeId}/constituents/`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ project: form.project, governance_mode: form.governance_mode, cadence_days: parseInt(form.cadence_days) || 14 }),
      });
      if (res.ok) { toast.success('Constituent added'); setDialogOpen(false); setForm({ project: '', governance_mode: 'predictive', cadence_days: '14' }); refresh(); }
      else toast.error('Create failed');
    } catch { toast.error('Create failed'); }
    finally { setSaving(false); }
  };

  if (listQ.isLoading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3"><Gavel className="h-6 w-6 text-teal-600" /><h1 className="text-2xl font-bold">Authorization Board</h1><Badge variant="outline">{constituents.length}</Badge></div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> Add Constituent</Button>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Programme roll-up</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-6 text-sm">
          <div><span className="text-muted-foreground">Total: </span><b>{rollup.total ?? 0}</b></div>
          <div><span className="text-muted-foreground">Authorized: </span><b>{rollup.authorized ?? 0}</b></div>
          {rollup.by_governance_mode && Object.entries(rollup.by_governance_mode).map(([m, n]: any) => (
            <div key={m}><span className="text-muted-foreground">{m}: </span><b>{n}</b></div>
          ))}
          {rollup.total > 0 && <div className="flex items-center gap-2 min-w-[160px]"><Progress value={Math.round(((rollup.authorized ?? 0) / rollup.total) * 100)} className="h-2 flex-1" /><span className="text-xs">{Math.round(((rollup.authorized ?? 0) / rollup.total) * 100)}%</span></div>}
        </CardContent>
      </Card>

      {constituents.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">No constituents yet.</Card>
      ) : (
        <div className="space-y-3">{constituents.map((c: any) => {
          const authorized = c.status === 'authorized';
          return (
            <Card key={c.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-semibold">{c.project_name || c.project}</span>
                    <Badge variant="secondary" className="text-xs" title={MODE_LABEL[c.governance_mode]}>{MODE_LABEL[c.governance_mode]}</Badge>
                    <Badge className={`text-xs ${authorized ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{c.status}</Badge>
                    {c.stage_gate_passed && <Badge variant="outline" className="text-xs">gate passed</Badge>}
                    {c.checkpoint_current && <Badge variant="outline" className="text-xs">checkpoint current</Badge>}
                  </div>
                  <div className="flex gap-1">
                    {!authorized && c.governance_mode !== 'adaptive' && <Button variant="ghost" size="sm" title="Pass stage gate" onClick={() => doAction(c.id, 'stage_gate')}><Stamp className="h-3.5 w-3.5 text-amber-600" /></Button>}
                    {!authorized && c.governance_mode !== 'predictive' && <Button variant="ghost" size="sm" title="Log checkpoint" onClick={() => doAction(c.id, 'checkpoint')}><Activity className="h-3.5 w-3.5 text-blue-600" /></Button>}
                    {!authorized && <Button variant="ghost" size="sm" title="Authorize" onClick={() => doAction(c.id, 'authorize')}><ShieldCheck className="h-3.5 w-3.5 text-green-600" /></Button>}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}</div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent>
        <DialogHeader><DialogTitle>Add Constituent</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><Label>Constituent project *</Label>
            <Select value={form.project} onValueChange={v => setForm({ ...form, project: v })}>
              <SelectTrigger><SelectValue placeholder="Select a project" /></SelectTrigger>
              <SelectContent>{projects.map((p: any) => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Governance mode</Label>
            <Select value={form.governance_mode} onValueChange={v => setForm({ ...form, governance_mode: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="predictive">{MODE_LABEL.predictive}</SelectItem>
                <SelectItem value="adaptive">{MODE_LABEL.adaptive}</SelectItem>
                <SelectItem value="blend">{MODE_LABEL.blend}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {form.governance_mode !== 'predictive' && (
            <div className="space-y-2"><Label>Cadence (days)</Label><Input type="number" min="1" value={form.cadence_days} onChange={e => setForm({ ...form, cadence_days: e.target.value })} /></div>
          )}
        </div>
        <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button onClick={create} disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Add</Button></DialogFooter>
      </DialogContent></Dialog>
    </>
  );
};

// ---------------------------------------------------------------------------
// Governance Config — the blend that drives authorization
// ---------------------------------------------------------------------------
const GovernanceConfigView = ({ programmeId }: { programmeId: string }) => {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['hp-config', programmeId],
    queryFn: () => apiGet(`/hybrid-programme/programs/${programmeId}/governance-configs/`),
    enabled: !!programmeId,
  });
  const existing = asList(data).find((c: any) => c.is_active) || asList(data)[0] || null;
  const [form, setForm] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const current = form ?? existing ?? { primary_framework: 'prince2', secondary_frameworks: [], rationale: '', governance_structure: { control_level: 50 } };
  const controlLevel = current.governance_structure?.control_level ?? 50;

  const save = async () => {
    setSaving(true);
    try {
      const body = JSON.stringify({
        primary_framework: current.primary_framework,
        secondary_frameworks: current.secondary_frameworks || [],
        rationale: current.rationale,
        governance_structure: current.governance_structure || { control_level: 50 },
        is_active: true,
      });
      const url = existing
        ? `${API_BASE_URL}/hybrid-programme/governance-configs/${existing.id}/`
        : `${API_BASE_URL}/hybrid-programme/programs/${programmeId}/governance-configs/`;
      const res = await fetch(url, { method: existing ? 'PATCH' : 'POST', headers: authHeaders(), body });
      if (res.ok) { toast.success('Saved'); qc.invalidateQueries({ queryKey: ['hp-config', programmeId] }); }
      else toast.error('Save failed');
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <>
      <div className="flex items-center gap-3"><Settings className="h-6 w-6 text-teal-600" /><h1 className="text-2xl font-bold">Governance Config</h1></div>
      <Card><CardContent className="p-6 space-y-4 max-w-2xl">
        <div className="space-y-2"><Label>Primary framework</Label>
          <Select value={current.primary_framework} onValueChange={v => setForm({ ...current, primary_framework: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{['prince2', 'msp', 'safe', 'pmi', 'scrum', 'kanban', 'waterfall'].map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-2"><Label>Rationale</Label><Textarea value={current.rationale || ''} onChange={e => setForm({ ...current, rationale: e.target.value })} /></div>
        <div className="space-y-1">
          <Label>Control level — {controlLevel} ({controlLevel >= 66 ? 'predictive-leaning' : controlLevel <= 33 ? 'adaptive-leaning' : 'balanced'})</Label>
          <Progress value={controlLevel} className="h-2" />
          <p className="text-xs text-muted-foreground">Adjusted automatically when you apply an adaptation. 0 = fully adaptive, 100 = fully predictive.</p>
        </div>
        <Button onClick={save} disabled={saving} className="gap-2">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Save</Button>
      </CardContent></Card>
    </>
  );
};

// ---------------------------------------------------------------------------
// Adaptations — each applies to the active config's control level
// ---------------------------------------------------------------------------
const TRIGGERS = ['market_change', 'technology_shift', 'regulatory_change', 'resource_change', 'stakeholder_change', 'performance_issue'];
const RESPONSES = ['increase_agility', 'increase_control', 'rebalance', 'pivot', 'scale_up', 'scale_down'];

const AdaptationsView = ({ programmeId }: { programmeId: string }) => {
  const qc = useQueryClient();
  const refresh = () => qc.invalidateQueries({ queryKey: ['hp-adaptations', programmeId] });
  const { data, isLoading } = useQuery({
    queryKey: ['hp-adaptations', programmeId],
    queryFn: () => apiGet(`/hybrid-programme/programs/${programmeId}/adaptations/`),
    enabled: !!programmeId,
  });
  const adaptations = asList(data);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ trigger: 'market_change', response: 'increase_agility', methodology_adjustment: '' });
  const [saving, setSaving] = useState(false);

  const create = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/hybrid-programme/programs/${programmeId}/adaptations/`, {
        method: 'POST', headers: authHeaders(), body: JSON.stringify(form),
      });
      if (res.ok) { toast.success('Adaptation logged'); setDialogOpen(false); refresh(); }
      else toast.error('Create failed');
    } catch { toast.error('Create failed'); }
    finally { setSaving(false); }
  };

  const apply = async (aid: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/hybrid-programme/adaptations/${aid}/apply/`, { method: 'POST', headers: authHeaders(), body: '{}' });
      if (res.ok) { const b = await res.json(); toast.success(`Control level: ${b.previous_level} → ${b.control_level}`); }
      else { const err = await res.json().catch(() => ({})); toast.error(err?.code === 'no_active_config' ? 'No active governance config to adapt — create one first.' : 'Apply failed'); }
    } catch { toast.error('Apply failed'); }
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3"><Repeat className="h-6 w-6 text-teal-600" /><h1 className="text-2xl font-bold">Adaptations</h1><Badge variant="outline">{adaptations.length}</Badge></div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2"><Plus className="h-4 w-4" /> Log Adaptation</Button>
      </div>
      {adaptations.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">No adaptations yet.</Card>
      ) : (
        <div className="space-y-3">{adaptations.map((a: any) => (
          <Card key={a.id}><CardContent className="p-4 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant="outline" className="text-xs">{a.trigger}</Badge>
              <span className="text-muted-foreground">→</span>
              <Badge className="text-xs bg-teal-100 text-teal-700">{a.response}</Badge>
              {a.methodology_adjustment && <span className="text-sm text-muted-foreground">{a.methodology_adjustment}</span>}
            </div>
            <Button variant="outline" size="sm" className="gap-1" onClick={() => apply(a.id)}><Layers className="h-3.5 w-3.5" /> Apply to config</Button>
          </CardContent></Card>
        ))}</div>
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent>
        <DialogHeader><DialogTitle>Log Adaptation</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><Label>Trigger</Label>
            <Select value={form.trigger} onValueChange={v => setForm({ ...form, trigger: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TRIGGERS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select>
          </div>
          <div className="space-y-2"><Label>Response</Label>
            <Select value={form.response} onValueChange={v => setForm({ ...form, response: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{RESPONSES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select>
          </div>
          <div className="space-y-2"><Label>Notes</Label><Textarea value={form.methodology_adjustment} onChange={e => setForm({ ...form, methodology_adjustment: e.target.value })} /></div>
        </div>
        <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button onClick={create} disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Log</Button></DialogFooter>
      </DialogContent></Dialog>
    </>
  );
};

export default ProgramHybridGovernance;
