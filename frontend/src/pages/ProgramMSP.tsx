import { useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from '@/components/ui/dialog';
import { ProjectHeader } from '@/components/ProjectHeader';
import {
  Map, Award, TrendingUp, Layers, ArrowRightLeft, Loader2, Plus, CheckCircle2,
  AlertTriangle, Save, Lock,
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

type View = 'blueprint' | 'benefits' | 'realization' | 'tranches' | 'transitions';

const resolveView = (pathname: string): View => {
  if (pathname.endsWith('/blueprint')) return 'blueprint';
  if (pathname.endsWith('/benefits/realization')) return 'realization';
  if (pathname.endsWith('/benefits/profiles')) return 'benefits';
  if (pathname.endsWith('/transitions')) return 'transitions';
  if (pathname.endsWith('/tranches')) return 'tranches';
  return 'blueprint';
};

const ProgramMSP = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const view = resolveView(location.pathname);

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        {view === 'blueprint' && <BlueprintView programId={id!} />}
        {(view === 'benefits' || view === 'realization') && <BenefitsView programId={id!} withRealization={view === 'realization'} />}
        {view === 'tranches' && <TranchesView programId={id!} />}
        {view === 'transitions' && <TransitionsView programId={id!} />}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Blueprint (POTI + Vision)
// ---------------------------------------------------------------------------
const BlueprintView = ({ programId }: { programId: string }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['msp-blueprint', programId],
    queryFn: () => apiGet(`/msp/programs/${programId}/blueprints/`),
    enabled: !!programId,
  });
  const existing = asList(data)[0] ?? null;
  const queryClient = useQueryClient();
  const [form, setForm] = useState<any>(null);

  const current = form ?? existing ?? {
    vision: '', processes: '', organisation: '', technology: '', information: '',
  };

  const save = useMutation({
    mutationFn: async () => {
      const body = JSON.stringify({
        vision: current.vision, processes: current.processes, organisation: current.organisation,
        technology: current.technology, information: current.information,
      });
      const url = existing
        ? `${API_BASE_URL}/msp/blueprints/${existing.id}/`
        : `${API_BASE_URL}/msp/programs/${programId}/blueprints/`;
      const res = await fetch(url, { method: existing ? 'PATCH' : 'POST', headers: authHeaders(), body });
      if (!res.ok) throw await res.json().catch(() => ({}));
      return res.json();
    },
    onSuccess: () => {
      toast.success('Blueprint saved');
      queryClient.invalidateQueries({ queryKey: ['msp-blueprint', programId] });
    },
    onError: () => toast.error('Could not save Blueprint'),
  });

  const set = (k: string, v: string) => setForm({ ...current, [k]: v });

  if (isLoading) return <Spinner />;

  const POTI: [string, string, string][] = [
    ['processes', 'Processes', 'Future-state business processes & ways of working'],
    ['organisation', 'Organisation', 'Structure, roles, skills, culture'],
    ['technology', 'Technology', 'Tools, systems, infrastructure'],
    ['information', 'Information', 'Data & information requirements'],
  ];

  return (
    <>
      <Header
        icon={<Map className="h-6 w-6 text-amber-600" />}
        title="Programme Blueprint"
        sub="The POTI model of the future operating state, and the programme Vision"
        action={
          <Button className="bg-amber-600 hover:bg-amber-700" disabled={save.isPending} onClick={() => save.mutate()}>
            {save.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Blueprint
          </Button>
        }
      />
      <Card>
        <CardHeader><CardTitle>Vision</CardTitle></CardHeader>
        <CardContent>
          <Textarea
            placeholder="The compelling future-state vision the programme is steering toward…"
            value={current.vision}
            onChange={(e) => set('vision', e.target.value)}
            rows={3}
          />
        </CardContent>
      </Card>
      <div className="grid grid-cols-2 gap-4">
        {POTI.map(([key, label, hint]) => (
          <Card key={key}>
            <CardHeader><CardTitle className="text-base">{label}</CardTitle></CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-2">{hint}</p>
              <Textarea value={current[key]} onChange={(e) => set(key, e.target.value)} rows={4} />
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
};

// ---------------------------------------------------------------------------
// Benefits (variance) + optional realization
// ---------------------------------------------------------------------------
const BenefitsView = ({ programId, withRealization }: { programId: string; withRealization: boolean }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['msp-benefits', programId],
    queryFn: () => apiGet(`/msp/programs/${programId}/benefits/`),
    enabled: !!programId,
  });
  const benefits = asList(data);
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', benefit_type: 'financial', baseline_value: '', target_value: '', measurement_method: '' });

  // Realization dialog state
  const [measureFor, setMeasureFor] = useState<any | null>(null);
  const [measure, setMeasure] = useState({ actual_value: '', measurement_date: '', notes: '' });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['msp-benefits', programId] });

  const create = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_BASE_URL}/msp/programs/${programId}/benefits/`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({
          ...form,
          baseline_value: form.baseline_value || null,
          target_value: form.target_value || null,
        }),
      });
      if (!res.ok) throw await res.json().catch(() => ({}));
      return res.json();
    },
    onSuccess: () => {
      toast.success('Benefit added');
      setOpen(false);
      setForm({ name: '', benefit_type: 'financial', baseline_value: '', target_value: '', measurement_method: '' });
      invalidate();
    },
    onError: () => toast.error('Could not add benefit'),
  });

  const addMeasure = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_BASE_URL}/msp/programs/${programId}/benefits/${measureFor.id}/realizations/`, {
        method: 'POST', headers: authHeaders(), body: JSON.stringify(measure),
      });
      if (!res.ok) throw await res.json().catch(() => ({}));
      return res.json();
    },
    onSuccess: () => {
      toast.success('Measurement recorded');
      setMeasureFor(null);
      setMeasure({ actual_value: '', measurement_date: '', notes: '' });
      invalidate();
    },
    onError: () => toast.error('Could not record measurement'),
  });

  return (
    <>
      <Header
        icon={<Award className="h-6 w-6 text-amber-600" />}
        title={withRealization ? 'Benefit Realization' : 'Benefit Profiles'}
        sub="Actual-vs-baseline variance per programme benefit"
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-amber-600 hover:bg-amber-700"><Plus className="h-4 w-4 mr-2" />Add Benefit</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Benefit</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Baseline value</Label><Input type="number" value={form.baseline_value} onChange={(e) => setForm({ ...form, baseline_value: e.target.value })} /></div>
                  <div><Label>Target value</Label><Input type="number" value={form.target_value} onChange={(e) => setForm({ ...form, target_value: e.target.value })} /></div>
                </div>
                <div><Label>Measurement method</Label><Textarea value={form.measurement_method} onChange={(e) => setForm({ ...form, measurement_method: e.target.value })} /></div>
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
      {isLoading ? <Spinner /> : benefits.length === 0 ? (
        <Empty icon={<Award className="h-12 w-12" />} text="No benefits defined yet" />
      ) : (
        <Card>
          <CardContent className="pt-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2">Benefit</th>
                  <th className="pb-2">Baseline</th>
                  <th className="pb-2">Latest</th>
                  <th className="pb-2">Target</th>
                  <th className="pb-2">Variance</th>
                  <th className="pb-2">Progress</th>
                  {withRealization && <th className="pb-2"></th>}
                </tr>
              </thead>
              <tbody>
                {benefits.map((b: any) => {
                  const variance = b.variance;
                  const positive = variance != null && variance >= 0;
                  return (
                    <tr key={b.id} className="border-b">
                      <td className="py-2 font-medium">{b.name}</td>
                      <td className="py-2">{b.baseline_value ?? '—'}</td>
                      <td className="py-2">{b.latest_actual ?? '—'}</td>
                      <td className="py-2">{b.target_value ?? '—'}</td>
                      <td className="py-2">
                        {variance == null ? <span className="text-muted-foreground">—</span> : (
                          <span className={positive ? 'text-green-600' : 'text-red-600'}>
                            {positive ? '+' : ''}{variance}
                          </span>
                        )}
                      </td>
                      <td className="py-2">
                        {b.variance_pct != null ? (
                          <Badge className={b.variance_pct >= 100 ? 'bg-green-500' : 'bg-amber-500'}>{b.variance_pct}%</Badge>
                        ) : <span className="text-muted-foreground">—</span>}
                      </td>
                      {withRealization && (
                        <td className="py-2 text-right">
                          <Button size="sm" variant="outline" onClick={() => setMeasureFor(b)}>
                            <TrendingUp className="h-3 w-3 mr-1" />Measure
                          </Button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!measureFor} onOpenChange={(o) => !o && setMeasureFor(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Record measurement{measureFor ? ` — ${measureFor.name}` : ''}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Actual value</Label><Input type="number" value={measure.actual_value} onChange={(e) => setMeasure({ ...measure, actual_value: e.target.value })} /></div>
            <div><Label>Measurement date</Label><Input type="date" value={measure.measurement_date} onChange={(e) => setMeasure({ ...measure, measurement_date: e.target.value })} /></div>
            <div><Label>Notes</Label><Textarea value={measure.notes} onChange={(e) => setMeasure({ ...measure, notes: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button disabled={!measure.actual_value || !measure.measurement_date || addMeasure.isPending} onClick={() => addMeasure.mutate()}>
              {addMeasure.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

// ---------------------------------------------------------------------------
// Tranches + close gate
// ---------------------------------------------------------------------------
const TranchesView = ({ programId }: { programId: string }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['msp-tranches', programId],
    queryFn: () => apiGet(`/msp/programs/${programId}/tranches/`),
    enabled: !!programId,
  });
  const tranches = asList(data);
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['msp-tranches', programId] });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', sequence: 1, description: '' });

  const create = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_BASE_URL}/msp/programs/${programId}/tranches/`, {
        method: 'POST', headers: authHeaders(), body: JSON.stringify(form),
      });
      if (!res.ok) throw await res.json().catch(() => ({}));
      return res.json();
    },
    onSuccess: () => {
      toast.success('Tranche created');
      setOpen(false);
      setForm({ name: '', sequence: 1, description: '' });
      invalidate();
    },
    onError: () => toast.error('Could not create tranche'),
  });

  const toggleReview = useMutation({
    mutationFn: async ({ id, value }: { id: string; value: boolean }) => {
      const res = await fetch(`${API_BASE_URL}/msp/tranches/${id}/`, {
        method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ boundary_review_done: value }),
      });
      if (!res.ok) throw await res.json().catch(() => ({}));
      return res.json();
    },
    onSuccess: () => invalidate(),
    onError: () => toast.error('Could not update boundary review'),
  });

  const close = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_BASE_URL}/msp/tranches/${id}/close/`, {
        method: 'POST', headers: authHeaders(), body: '{}',
      });
      if (!res.ok) throw await res.json().catch(() => ({}));
      return res.json();
    },
    onSuccess: () => { toast.success('Tranche closed'); invalidate(); },
    onError: (err: any) => {
      const blockers = err?.blockers?.join(' ') ?? '';
      if (err?.code === 'no_measurements') toast.error('Cannot close: no benefit measurements recorded yet.');
      else if (err?.code === 'boundary_review_required') toast.error('Cannot close: complete the boundary review first.');
      else if (err?.code === 'already_closed') toast.error('Tranche is already closed.');
      else toast.error(`Cannot close tranche. ${blockers}`);
    },
  });

  return (
    <>
      <Header
        icon={<Layers className="h-6 w-6 text-amber-600" />}
        title="Programme Tranches"
        sub="Each tranche closes at a boundary review that gates the next step"
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-amber-600 hover:bg-amber-700"><Plus className="h-4 w-4 mr-2" />New Tranche</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New Tranche</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div><Label>Sequence</Label><Input type="number" value={form.sequence} onChange={(e) => setForm({ ...form, sequence: Number(e.target.value) })} /></div>
                <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
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
      {isLoading ? <Spinner /> : tranches.length === 0 ? (
        <Empty icon={<Layers className="h-12 w-12" />} text="No tranches yet" />
      ) : (
        <div className="space-y-3">
          {tranches.map((t: any) => {
            const closed = t.status === 'closed';
            return (
              <Card key={t.id} className={closed ? 'border-l-4 border-l-green-500' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Tranche {t.sequence}: {t.name}</CardTitle>
                    <Badge variant="outline">{t.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {t.description && <p className="text-sm text-muted-foreground mb-3">{t.description}</p>}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={t.boundary_review_done}
                        disabled={closed}
                        onCheckedChange={(v) => toggleReview.mutate({ id: t.id, value: v })}
                      />
                      <Label className="text-sm">Boundary review complete</Label>
                    </div>
                    {closed ? (
                      <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Closed</Badge>
                    ) : (
                      <Button
                        size="sm"
                        className="bg-amber-600 hover:bg-amber-700"
                        disabled={close.isPending}
                        onClick={() => close.mutate(t.id)}
                      >
                        {close.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Lock className="h-4 w-4 mr-2" />}
                        Close tranche
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
};

// ---------------------------------------------------------------------------
// Transitions (BCM-owned change embedding)
// ---------------------------------------------------------------------------
const TransitionsView = ({ programId }: { programId: string }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['msp-transitions', programId],
    queryFn: () => apiGet(`/msp/programs/${programId}/transitions/`),
    enabled: !!programId,
  });
  const transitions = asList(data);
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', planned_date: '' });

  const create = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_BASE_URL}/msp/programs/${programId}/transitions/`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ ...form, planned_date: form.planned_date || null }),
      });
      if (!res.ok) throw await res.json().catch(() => ({}));
      return res.json();
    },
    onSuccess: () => {
      toast.success('Transition added');
      setOpen(false);
      setForm({ name: '', description: '', planned_date: '' });
      queryClient.invalidateQueries({ queryKey: ['msp-transitions', programId] });
    },
    onError: () => toast.error('Could not add transition'),
  });

  return (
    <>
      <Header
        icon={<ArrowRightLeft className="h-6 w-6 text-amber-600" />}
        title="Business Transitions"
        sub="Embedding change into business-as-usual, owned by the Business Change Manager"
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-amber-600 hover:bg-amber-700"><Plus className="h-4 w-4 mr-2" />New Transition</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New Transition</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                <div><Label>Planned date</Label><Input type="date" value={form.planned_date} onChange={(e) => setForm({ ...form, planned_date: e.target.value })} /></div>
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
      {isLoading ? <Spinner /> : transitions.length === 0 ? (
        <Empty icon={<ArrowRightLeft className="h-12 w-12" />} text="No transitions planned yet" />
      ) : (
        <div className="space-y-2">
          {transitions.map((t: any) => (
            <Card key={t.id}>
              <CardContent className="pt-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{t.name}</p>
                  {t.description && <p className="text-sm text-muted-foreground">{t.description}</p>}
                  {t.bcm_name && <p className="text-xs text-muted-foreground">BCM: {t.bcm_name}</p>}
                </div>
                <div className="text-right">
                  <Badge variant="outline">{t.status}</Badge>
                  {t.planned_date && <p className="text-xs text-muted-foreground mt-1">{t.planned_date}</p>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
};

// ---------------------------------------------------------------------------
// Shared
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

export default ProgramMSP;
