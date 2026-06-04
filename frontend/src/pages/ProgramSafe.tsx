import { useState, useMemo } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ProjectHeader } from '@/components/ProjectHeader';
import {
  Train, Target, Layers, Presentation, RefreshCw, Loader2, Plus, Gauge,
  GitBranch, CheckCircle2, AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001/api/v1';

const authHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

const apiGet = async (path: string) => {
  const res = await fetch(`${API_BASE_URL}${path}`, { headers: authHeaders() });
  if (!res.ok) return null;
  return res.json();
};

const asList = (body: any): any[] => {
  if (!body) return [];
  return Array.isArray(body) ? body : (body.results ?? []);
};

const FEATURE_STATES: { key: string; label: string }[] = [
  { key: 'funnel', label: 'Funnel' },
  { key: 'analyzing', label: 'Analyzing' },
  { key: 'backlog', label: 'Backlog' },
  { key: 'implementing', label: 'Implementing' },
  { key: 'validating', label: 'Validating' },
  { key: 'done', label: 'Done' },
];

const ROAM_COLORS: Record<string, string> = {
  resolved: 'bg-green-500',
  owned: 'bg-blue-500',
  accepted: 'bg-yellow-500',
  mitigated: 'bg-purple-500',
};

type View = 'art' | 'pi-current' | 'pi-planning' | 'pi-objectives' | 'features' | 'demos' | 'inspect-adapt';

const resolveView = (pathname: string): View => {
  if (pathname.endsWith('/art')) return 'art';
  if (pathname.endsWith('/pi/current')) return 'pi-current';
  if (pathname.endsWith('/pi/planning')) return 'pi-planning';
  if (pathname.endsWith('/pi/objectives')) return 'pi-objectives';
  if (pathname.endsWith('/features')) return 'features';
  if (pathname.endsWith('/demos')) return 'demos';
  if (pathname.endsWith('/inspect-adapt')) return 'inspect-adapt';
  return 'pi-current';
};

const ProgramSafe = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const view = resolveView(location.pathname);
  const queryClient = useQueryClient();

  // PIs for this program. The "current" PI = first active, else most recent.
  const { data: pisRaw, isLoading: pisLoading } = useQuery({
    queryKey: ['safe-pis', id],
    queryFn: () => apiGet(`/safe/pis/?program=${id}`),
    enabled: !!id,
  });
  const pis = asList(pisRaw);
  const currentPi = useMemo(
    () => pis.find((p: any) => p.status === 'active') ?? pis[0] ?? null,
    [pis],
  );

  if (pisLoading) {
    return (
      <div className="min-h-full bg-background">
        <ProjectHeader />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['safe-pis', id] });
    queryClient.invalidateQueries({ queryKey: ['safe-features'] });
    queryClient.invalidateQueries({ queryKey: ['safe-objectives'] });
    queryClient.invalidateQueries({ queryKey: ['safe-dependencies'] });
    queryClient.invalidateQueries({ queryKey: ['safe-demos'] });
    queryClient.invalidateQueries({ queryKey: ['safe-ia'] });
  };

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        {view === 'art' && <ARTView programId={id!} onChange={invalidate} />}
        {(view === 'pi-current' || view === 'pi-planning') && (
          <PIPlanningView programId={id!} pis={pis} currentPi={currentPi} onChange={invalidate} />
        )}
        {view === 'pi-objectives' && <ObjectivesView programId={id!} currentPi={currentPi} onChange={invalidate} />}
        {view === 'features' && <FeaturesView currentPi={currentPi} onChange={invalidate} />}
        {view === 'demos' && <DemosView currentPi={currentPi} onChange={invalidate} />}
        {view === 'inspect-adapt' && <InspectAdaptView currentPi={currentPi} onChange={invalidate} />}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// ART
// ---------------------------------------------------------------------------
const ARTView = ({ programId, onChange }: { programId: string; onChange: () => void }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['safe-arts', programId],
    queryFn: () => apiGet(`/safe/arts/?program=${programId}`),
    enabled: !!programId,
  });
  const arts = asList(data);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', team_count: 0 });
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_BASE_URL}/safe/arts/`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ ...form, program: Number(programId) }),
      });
      if (!res.ok) throw await res.json().catch(() => ({}));
      return res.json();
    },
    onSuccess: () => {
      toast.success('Agile Release Train created');
      setOpen(false);
      setForm({ name: '', description: '', team_count: 0 });
      queryClient.invalidateQueries({ queryKey: ['safe-arts', programId] });
      onChange();
    },
    onError: () => toast.error('Could not create ART'),
  });

  return (
    <>
      <Header
        icon={<Train className="h-6 w-6 text-indigo-600" />}
        title="Agile Release Trains"
        sub="The teams-of-teams that deliver value on a cadence"
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700"><Plus className="h-4 w-4 mr-2" />New ART</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New Agile Release Train</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                <div><Label>Team count</Label><Input type="number" value={form.team_count} onChange={(e) => setForm({ ...form, team_count: Number(e.target.value) })} /></div>
              </div>
              <DialogFooter>
                <Button disabled={!form.name || create.isPending} onClick={() => create.mutate()}>
                  {create.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      {isLoading ? <Spinner /> : arts.length === 0 ? (
        <Empty icon={<Train className="h-12 w-12" />} text="No Agile Release Trains yet" />
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {arts.map((art: any) => (
            <Card key={art.id}>
              <CardHeader><CardTitle className="text-base">{art.name}</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">{art.description || 'No description'}</p>
                <Badge variant="outline">{art.team_count} teams</Badge>
                {art.is_active && <Badge className="ml-2 bg-green-500">Active</Badge>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
};

// ---------------------------------------------------------------------------
// PI Planning (current + planning)
// ---------------------------------------------------------------------------
const PIPlanningView = ({ programId, pis, currentPi, onChange }: any) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', iteration_count: 5, status: 'planning' });
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_BASE_URL}/safe/pis/`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ ...form, program: Number(programId) }),
      });
      if (!res.ok) throw await res.json().catch(() => ({}));
      return res.json();
    },
    onSuccess: () => {
      toast.success('Program Increment planned');
      setOpen(false);
      setForm({ name: '', iteration_count: 5, status: 'planning' });
      queryClient.invalidateQueries({ queryKey: ['safe-pis', programId] });
      onChange();
    },
    onError: () => toast.error('Could not create PI'),
  });

  return (
    <>
      <Header
        icon={<Target className="h-6 w-6 text-indigo-600" />}
        title="Program Increments"
        sub="Plan and track each PI — the fixed-cadence delivery box"
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700"><Plus className="h-4 w-4 mr-2" />Plan PI</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Plan a Program Increment</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Name</Label><Input placeholder="PI 2026.1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div><Label>Iterations</Label><Input type="number" value={form.iteration_count} onChange={(e) => setForm({ ...form, iteration_count: Number(e.target.value) })} /></div>
                <div>
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button disabled={!form.name || create.isPending} onClick={() => create.mutate()}>
                  {create.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      {currentPi && (
        <div className="grid grid-cols-4 gap-4">
          <Stat label="Current PI" value={currentPi.name} />
          <Stat label="Planned BV" value={String(currentPi.planned_business_value ?? 0)} />
          <Stat label="Features" value={String(currentPi.feature_count ?? 0)} />
          <Stat label="Predictability" value={currentPi.predictability != null ? `${currentPi.predictability}%` : '—'} />
        </div>
      )}
      {pis.length === 0 ? (
        <Empty icon={<Target className="h-12 w-12" />} text="No Program Increments yet — plan your first PI" />
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {pis.map((pi: any) => (
            <Card key={pi.id} className={pi.status === 'active' ? 'border-l-4 border-l-green-500' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{pi.name}</CardTitle>
                  <Badge variant="outline">{pi.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Iterations</span><span>{pi.iteration_count}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Objectives</span><span>{pi.objectives_count ?? 0}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Planned BV</span><span>{pi.planned_business_value ?? 0}</span></div>
                {pi.predictability != null && (
                  <div className="flex justify-between"><span className="text-muted-foreground">Predictability</span><span className="font-medium">{pi.predictability}%</span></div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
};

// ---------------------------------------------------------------------------
// PI Objectives + BV roll-up
// ---------------------------------------------------------------------------
const ObjectivesView = ({ currentPi, onChange }: any) => {
  const piId = currentPi?.id;
  const { data, isLoading } = useQuery({
    queryKey: ['safe-objectives', piId],
    queryFn: () => apiGet(`/safe/pis/${piId}/objectives/`),
    enabled: !!piId,
  });
  const objectives = asList(data);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ description: '', business_value: 5, actual_value: 0, committed: true });
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_BASE_URL}/safe/pis/${piId}/objectives/`, {
        method: 'POST', headers: authHeaders(), body: JSON.stringify(form),
      });
      if (!res.ok) throw await res.json().catch(() => ({}));
      return res.json();
    },
    onSuccess: () => {
      toast.success('PI Objective added');
      setOpen(false);
      setForm({ description: '', business_value: 5, actual_value: 0, committed: true });
      queryClient.invalidateQueries({ queryKey: ['safe-objectives', piId] });
      onChange();
    },
    onError: () => toast.error('Could not add objective'),
  });

  const plannedBV = currentPi?.planned_business_value ?? 0;
  const actualBV = currentPi?.actual_business_value ?? 0;
  const predictability = currentPi?.predictability;

  if (!currentPi) return <NoPi />;

  return (
    <>
      <Header
        icon={<Gauge className="h-6 w-6 text-indigo-600" />}
        title="PI Objectives"
        sub={`Business-value commitments for ${currentPi.name}`}
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700"><Plus className="h-4 w-4 mr-2" />Add Objective</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add PI Objective</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Planned BV (1-10)</Label><Input type="number" value={form.business_value} onChange={(e) => setForm({ ...form, business_value: Number(e.target.value) })} /></div>
                  <div><Label>Actual BV (scored at PI end)</Label><Input type="number" value={form.actual_value} onChange={(e) => setForm({ ...form, actual_value: Number(e.target.value) })} /></div>
                </div>
              </div>
              <DialogFooter>
                <Button disabled={!form.description || create.isPending} onClick={() => create.mutate()}>
                  {create.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Add
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="grid grid-cols-3 gap-4">
        <Stat label="Planned Business Value" value={String(plannedBV)} />
        <Stat label="Actual Business Value" value={String(actualBV)} accent="text-blue-600" />
        <Stat label="PI Predictability" value={predictability != null ? `${predictability}%` : '—'}
          accent={predictability != null && predictability >= 80 ? 'text-green-600' : 'text-yellow-600'} />
      </div>
      <Card>
        <CardHeader><CardTitle>Objectives</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <Spinner /> : objectives.length === 0 ? (
            <Empty icon={<Gauge className="h-12 w-12" />} text="No objectives committed yet" />
          ) : (
            <div className="space-y-2">
              {objectives.map((o: any) => (
                <div key={o.id} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">{o.description}</p>
                    {o.assigned_team_name && <p className="text-xs text-muted-foreground">{o.assigned_team_name}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    {o.committed && <Badge variant="outline">Committed</Badge>}
                    <Badge className="bg-indigo-600">BV {o.business_value}</Badge>
                    <Badge className="bg-blue-500">Actual {o.actual_value}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

// ---------------------------------------------------------------------------
// Features — Program Kanban ordered by WSJF
// ---------------------------------------------------------------------------
const FeaturesView = ({ currentPi, onChange }: any) => {
  const piId = currentPi?.id;
  const { data, isLoading } = useQuery({
    queryKey: ['safe-features', piId],
    queryFn: () => apiGet(`/safe/features/?pi=${piId}`),
    enabled: !!piId,
  });
  const features = asList(data);
  const { data: depsRaw } = useQuery({
    queryKey: ['safe-dependencies', piId],
    queryFn: () => apiGet(`/safe/dependencies/?pi=${piId}`),
    enabled: !!piId,
  });
  const dependencies = asList(depsRaw);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', business_value: 5, time_criticality: 3, risk_reduction: 2, job_size: 3, state: 'funnel',
  });
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_BASE_URL}/safe/features/`, {
        method: 'POST', headers: authHeaders(), body: JSON.stringify({ ...form, pi: piId }),
      });
      if (!res.ok) throw await res.json().catch(() => ({}));
      return res.json();
    },
    onSuccess: () => {
      toast.success('Feature added to the Program Kanban');
      setOpen(false);
      setForm({ name: '', description: '', business_value: 5, time_criticality: 3, risk_reduction: 2, job_size: 3, state: 'funnel' });
      queryClient.invalidateQueries({ queryKey: ['safe-features', piId] });
      onChange();
    },
    onError: () => toast.error('Could not add feature'),
  });

  const previewWsjf = ((form.business_value + form.time_criticality + form.risk_reduction) / (form.job_size || 1)).toFixed(2);

  if (!currentPi) return <NoPi />;

  return (
    <>
      <Header
        icon={<Layers className="h-6 w-6 text-indigo-600" />}
        title="Program Kanban"
        sub="Features sequenced by WSJF (Weighted Shortest Job First)"
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700"><Plus className="h-4 w-4 mr-2" />New Feature</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New Feature</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Business Value</Label><Input type="number" value={form.business_value} onChange={(e) => setForm({ ...form, business_value: Number(e.target.value) })} /></div>
                  <div><Label>Time Criticality</Label><Input type="number" value={form.time_criticality} onChange={(e) => setForm({ ...form, time_criticality: Number(e.target.value) })} /></div>
                  <div><Label>Risk Reduction</Label><Input type="number" value={form.risk_reduction} onChange={(e) => setForm({ ...form, risk_reduction: Number(e.target.value) })} /></div>
                  <div><Label>Job Size</Label><Input type="number" value={form.job_size} onChange={(e) => setForm({ ...form, job_size: Number(e.target.value) })} /></div>
                </div>
                <div className="text-sm text-muted-foreground">WSJF preview: <span className="font-bold text-indigo-600">{previewWsjf}</span></div>
              </div>
              <DialogFooter>
                <Button disabled={!form.name || create.isPending} onClick={() => create.mutate()}>
                  {create.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Add
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      {isLoading ? <Spinner /> : (
        <div className="grid grid-cols-6 gap-3">
          {FEATURE_STATES.map((col) => {
            const colFeatures = features.filter((f: any) => f.state === col.key);
            return (
              <div key={col.key} className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-sm font-semibold">{col.label}</span>
                  <Badge variant="outline">{colFeatures.length}</Badge>
                </div>
                {colFeatures.map((f: any) => (
                  <Card key={f.id} className="p-2">
                    <p className="text-sm font-medium leading-tight">{f.name}</p>
                    <div className="flex items-center gap-1 mt-2 flex-wrap">
                      <Badge className="bg-indigo-600 text-xs">WSJF {f.wsjf}</Badge>
                      <Badge variant="outline" className="text-xs">{f.done_story_count}/{f.story_count} stories</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* Program Board — dependencies (ROAM) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><GitBranch className="h-5 w-5" />Program Board — Dependencies (ROAM)</CardTitle>
        </CardHeader>
        <CardContent>
          {dependencies.length === 0 ? (
            <p className="text-sm text-muted-foreground">No cross-team dependencies recorded.</p>
          ) : (
            <div className="space-y-2">
              {dependencies.map((d: any) => (
                <div key={d.id} className="flex items-center justify-between border-b pb-2">
                  <div className="text-sm">
                    <span className="font-medium">{d.source_feature_name}</span>
                    <span className="text-muted-foreground"> → {d.target_feature_name || '?'}</span>
                    {d.description && <p className="text-xs text-muted-foreground">{d.description}</p>}
                  </div>
                  <Badge className={d.roam ? ROAM_COLORS[d.roam] : 'bg-gray-400'}>
                    {d.roam_display || 'Untriaged'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

// ---------------------------------------------------------------------------
// System Demos
// ---------------------------------------------------------------------------
const DemosView = ({ currentPi, onChange }: any) => {
  const piId = currentPi?.id;
  const { data, isLoading } = useQuery({
    queryKey: ['safe-demos', piId],
    queryFn: () => apiGet(`/safe/system-demos/?pi=${piId}`),
    enabled: !!piId,
  });
  const demos = asList(data);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ iteration: 1, summary: '', feedback: '' });
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_BASE_URL}/safe/system-demos/`, {
        method: 'POST', headers: authHeaders(), body: JSON.stringify({ ...form, pi: piId }),
      });
      if (!res.ok) throw await res.json().catch(() => ({}));
      return res.json();
    },
    onSuccess: () => {
      toast.success('System Demo recorded');
      setOpen(false);
      setForm({ iteration: 1, summary: '', feedback: '' });
      queryClient.invalidateQueries({ queryKey: ['safe-demos', piId] });
      onChange();
    },
    onError: () => toast.error('Could not record demo'),
  });

  if (!currentPi) return <NoPi />;

  return (
    <>
      <Header
        icon={<Presentation className="h-6 w-6 text-indigo-600" />}
        title="System Demos"
        sub="The integrated, end-of-iteration milestone"
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700"><Plus className="h-4 w-4 mr-2" />Record Demo</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Record System Demo</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Iteration</Label><Input type="number" value={form.iteration} onChange={(e) => setForm({ ...form, iteration: Number(e.target.value) })} /></div>
                <div><Label>Summary</Label><Textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} /></div>
                <div><Label>Feedback</Label><Textarea value={form.feedback} onChange={(e) => setForm({ ...form, feedback: e.target.value })} /></div>
              </div>
              <DialogFooter>
                <Button disabled={create.isPending} onClick={() => create.mutate()}>
                  {create.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Record
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      {isLoading ? <Spinner /> : demos.length === 0 ? (
        <Empty icon={<Presentation className="h-12 w-12" />} text="No System Demos recorded yet" />
      ) : (
        <div className="space-y-3">
          {demos.map((d: any) => (
            <Card key={d.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Iteration {d.iteration}</CardTitle>
                  <Badge variant="outline">{d.feature_count} features</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p>{d.summary || 'No summary'}</p>
                {d.feedback && <p className="text-muted-foreground">Feedback: {d.feedback}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
};

// ---------------------------------------------------------------------------
// Inspect & Adapt
// ---------------------------------------------------------------------------
const InspectAdaptView = ({ currentPi, onChange }: any) => {
  const piId = currentPi?.id;
  const { data, isLoading } = useQuery({
    queryKey: ['safe-ia', piId],
    queryFn: () => apiGet(`/safe/inspect-adapt/?pi=${piId}`),
    enabled: !!piId,
  });
  const ia = asList(data)[0] ?? null;
  const queryClient = useQueryClient();

  const snapshot = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_BASE_URL}/safe/pis/${piId}/inspect-adapt/snapshot/`, {
        method: 'POST', headers: authHeaders(), body: '{}',
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw err;
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success('Predictability snapshotted');
      queryClient.invalidateQueries({ queryKey: ['safe-ia', piId] });
      onChange();
    },
    onError: (err: any) => {
      if (err?.code === 'pi_required') toast.error('No PI selected');
      else if (err?.code === 'pi_not_found') toast.error('PI not found');
      else toast.error('Snapshot failed');
    },
  });

  if (!currentPi) return <NoPi />;

  const livePredictability = currentPi.predictability;

  return (
    <>
      <Header
        icon={<RefreshCw className="h-6 w-6 text-indigo-600" />}
        title="Inspect & Adapt"
        sub={`Measure and improve — ${currentPi.name}`}
        action={
          <Button className="bg-indigo-600 hover:bg-indigo-700" disabled={snapshot.isPending} onClick={() => snapshot.mutate()}>
            {snapshot.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Snapshot Predictability
          </Button>
        }
      />
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Live PI Predictability</CardTitle></CardHeader>
          <CardContent>
            {livePredictability != null ? (
              <>
                <p className="text-3xl font-bold text-indigo-600">{livePredictability}%</p>
                <Progress value={livePredictability} className="h-2 mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {currentPi.actual_business_value} of {currentPi.planned_business_value} planned business value achieved
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Score objectives' actual value to compute predictability.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Snapshotted at I&A</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <Spinner /> : ia && ia.predictability != null ? (
              <>
                <p className="text-3xl font-bold text-green-600 flex items-center gap-2">
                  <CheckCircle2 className="h-6 w-6" />{ia.predictability}%
                </p>
                <p className="text-xs text-muted-foreground mt-2">Captured snapshot for the I&A event</p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />No snapshot taken yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

// ---------------------------------------------------------------------------
// Shared bits
// ---------------------------------------------------------------------------
const Header = ({ icon, title, sub, action }: any) => (
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-2xl font-bold flex items-center gap-2">{icon}{title}</h1>
      <p className="text-muted-foreground">{sub}</p>
    </div>
    {action}
  </div>
);

const Stat = ({ label, value, accent }: { label: string; value: string; accent?: string }) => (
  <Card>
    <CardContent className="pt-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`text-2xl font-bold ${accent ?? ''}`}>{value}</p>
    </CardContent>
  </Card>
);

const Spinner = () => (
  <div className="flex items-center justify-center h-32"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
);

const Empty = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <Card>
    <CardContent className="text-center py-10">
      <div className="mx-auto text-muted-foreground mb-3 w-fit">{icon}</div>
      <p className="text-muted-foreground">{text}</p>
    </CardContent>
  </Card>
);

const NoPi = () => (
  <Empty icon={<Target className="h-12 w-12" />} text="No Program Increment yet — plan a PI first" />
);

export default ProgramSafe;
