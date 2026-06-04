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
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from '@/components/ui/dialog';
import { ProjectHeader } from '@/components/ProjectHeader';
import {
  FileCheck, FolderKanban, Award, Users, Loader2, Plus, Save, History,
  CheckCircle2, PauseCircle, XCircle, PlayCircle, ShieldCheck,
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

type View = 'charter' | 'components' | 'benefits' | 'stakeholders';

const resolveView = (pathname: string): View => {
  if (pathname.endsWith('/components')) return 'components';
  if (pathname.endsWith('/benefit-register')) return 'benefits';
  if (pathname.endsWith('/stakeholder-grid')) return 'stakeholders';
  return 'charter';
};

const ProgramPMI = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const view = resolveView(location.pathname);

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        {view === 'charter' && <CharterView programId={id!} />}
        {view === 'components' && <ComponentsView programId={id!} />}
        {view === 'benefits' && <BenefitsView programId={id!} />}
        {view === 'stakeholders' && <StakeholdersView programId={id!} />}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Program Charter
// ---------------------------------------------------------------------------
const CharterView = ({ programId }: { programId: string }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['pmi-charter', programId],
    queryFn: () => apiGet(`/pmi/programs/${programId}/charters/`),
    enabled: !!programId,
  });
  const existing = asList(data)[0] ?? null;
  const queryClient = useQueryClient();
  const [form, setForm] = useState<any>(null);

  const current = form ?? existing ?? {
    vision: '', objectives: '', scope: '', success_criteria: '', approved: false,
  };

  const save = useMutation({
    mutationFn: async () => {
      const body = JSON.stringify({
        vision: current.vision, objectives: current.objectives, scope: current.scope,
        success_criteria: current.success_criteria, approved: current.approved,
      });
      const url = existing
        ? `${API_BASE_URL}/pmi/charters/${existing.id}/`
        : `${API_BASE_URL}/pmi/programs/${programId}/charters/`;
      const res = await fetch(url, { method: existing ? 'PATCH' : 'POST', headers: authHeaders(), body });
      if (!res.ok) throw await res.json().catch(() => ({}));
      return res.json();
    },
    onSuccess: () => {
      toast.success('Charter saved');
      queryClient.invalidateQueries({ queryKey: ['pmi-charter', programId] });
    },
    onError: () => toast.error('Could not save charter'),
  });

  const set = (k: string, v: any) => setForm({ ...current, [k]: v });

  if (isLoading) return <Spinner />;

  const FIELDS: [string, string, string][] = [
    ['vision', 'Vision', 'The future state the programme is mandated to deliver'],
    ['objectives', 'Objectives', 'Measurable programme objectives'],
    ['scope', 'Scope', 'What is in and out of programme scope'],
    ['success_criteria', 'Success Criteria', 'How programme success will be judged'],
  ];

  return (
    <>
      <Header
        icon={<FileCheck className="h-6 w-6 text-green-600" />}
        title="Program Charter"
        sub="The programme mandate, vision, objectives and success criteria"
        action={
          <Button className="bg-green-600 hover:bg-green-700" disabled={save.isPending} onClick={() => save.mutate()}>
            {save.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Charter
          </Button>
        }
      />
      <Card>
        <CardContent className="pt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Switch checked={!!current.approved} onCheckedChange={(v) => set('approved', v)} />
            <Label className="text-sm">Charter approved by sponsor</Label>
          </div>
          {current.approved && <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Approved</Badge>}
        </CardContent>
      </Card>
      {FIELDS.map(([key, label, hint]) => (
        <Card key={key}>
          <CardHeader><CardTitle className="text-base">{label}</CardTitle></CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-2">{hint}</p>
            <Textarea value={current[key] ?? ''} onChange={(e) => set(key, e.target.value)} rows={3} />
          </CardContent>
        </Card>
      ))}
    </>
  );
};

// ---------------------------------------------------------------------------
// Components + gate decisions (the only path that moves status)
// ---------------------------------------------------------------------------
const STATUS_COLOR: Record<string, string> = {
  proposed: 'bg-slate-400',
  approved: 'bg-blue-500',
  active: 'bg-green-500',
  completed: 'bg-emerald-600',
  cancelled: 'bg-red-500',
};

const ComponentsView = ({ programId }: { programId: string }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['pmi-components', programId],
    queryFn: () => apiGet(`/pmi/programs/${programId}/components/`),
    enabled: !!programId,
  });
  const components = asList(data);
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['pmi-components', programId] });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'project', description: '' });
  const [decideFor, setDecideFor] = useState<any | null>(null);
  const [historyFor, setHistoryFor] = useState<any | null>(null);

  const create = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_BASE_URL}/pmi/programs/${programId}/components/`, {
        method: 'POST', headers: authHeaders(), body: JSON.stringify(form),
      });
      if (!res.ok) throw await res.json().catch(() => ({}));
      return res.json();
    },
    onSuccess: () => {
      toast.success('Component added');
      setOpen(false);
      setForm({ name: '', type: 'project', description: '' });
      invalidate();
    },
    onError: () => toast.error('Could not add component'),
  });

  return (
    <>
      <Header
        icon={<FolderKanban className="h-6 w-6 text-green-600" />}
        title="Program Components"
        sub="A component's status changes only through a recorded governance gate decision"
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700"><Plus className="h-4 w-4 mr-2" />New Component</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New Component</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div>
                  <Label>Type</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="project">Project</SelectItem>
                      <SelectItem value="subsidiary_program">Subsidiary Program</SelectItem>
                      <SelectItem value="operational_activity">Operational Activity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
      {isLoading ? <Spinner /> : components.length === 0 ? (
        <Empty icon={<FolderKanban className="h-12 w-12" />} text="No components yet" />
      ) : (
        <div className="space-y-3">
          {components.map((c: any) => (
            <Card key={c.id}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium flex items-center gap-2">
                      {c.name}
                      <Badge className={STATUS_COLOR[c.status] ?? 'bg-slate-400'}>{c.status_display ?? c.status}</Badge>
                    </p>
                    {c.description && <p className="text-sm text-muted-foreground">{c.description}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => setHistoryFor(c)}>
                      <History className="h-3 w-3 mr-1" />History
                    </Button>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => setDecideFor(c)}>
                      <ShieldCheck className="h-3 w-3 mr-1" />Gate decision
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {decideFor && (
        <DecideDialog
          component={decideFor}
          onClose={() => setDecideFor(null)}
          onDecided={() => { setDecideFor(null); invalidate(); }}
        />
      )}
      {historyFor && (
        <HistoryDialog component={historyFor} onClose={() => setHistoryFor(null)} />
      )}
    </>
  );
};

const OUTCOMES: [string, string, any, string][] = [
  ['authorize', 'Authorize', ShieldCheck, '→ Approved'],
  ['continue', 'Continue', PlayCircle, '→ Active'],
  ['hold', 'Hold', PauseCircle, 'Status unchanged'],
  ['stop', 'Stop', XCircle, '→ Cancelled'],
];

const DecideDialog = ({ component, onClose, onDecided }: any) => {
  const [outcome, setOutcome] = useState<string | null>(null);
  const [gate, setGate] = useState('');
  const [rationale, setRationale] = useState('');

  const decide = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_BASE_URL}/pmi/components/${component.id}/decide/`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ outcome, gate, rationale }),
      });
      if (!res.ok) throw await res.json().catch(() => ({}));
      return res.json();
    },
    onSuccess: (d: any) => {
      toast.success(`Decision recorded — component is now "${d.component.status}"`);
      onDecided();
    },
    onError: (err: any) => {
      if (err?.code === 'invalid_outcome') toast.error('Pick a valid gate outcome.');
      else toast.error('Could not record gate decision.');
    },
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Gate decision — {component.name}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {OUTCOMES.map(([value, label, Icon, hint]) => (
              <button
                key={value}
                type="button"
                onClick={() => setOutcome(value)}
                className={`flex flex-col items-start gap-1 rounded-md border p-3 text-left transition ${
                  outcome === value ? 'border-green-600 bg-green-50' : 'hover:bg-muted'
                }`}
              >
                <span className="flex items-center gap-2 font-medium"><Icon className="h-4 w-4" />{label}</span>
                <span className="text-xs text-muted-foreground">{hint}</span>
              </button>
            ))}
          </div>
          <div><Label>Gate / phase</Label><Input value={gate} onChange={(e) => setGate(e.target.value)} placeholder="e.g. Gate 1 — Business case" /></div>
          <div><Label>Rationale</Label><Textarea value={rationale} onChange={(e) => setRationale(e.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button disabled={!outcome || decide.isPending} onClick={() => decide.mutate()}>
            {decide.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Record decision
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const HistoryDialog = ({ component, onClose }: any) => {
  const { data, isLoading } = useQuery({
    queryKey: ['pmi-gate-decisions', component.id],
    queryFn: () => apiGet(`/pmi/gate-decisions/?component=${component.id}`),
  });
  const rows = asList(data);

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Gate history — {component.name}</DialogTitle></DialogHeader>
        {isLoading ? <Spinner /> : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">No gate decisions recorded yet.</p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {rows.map((d: any) => (
              <div key={d.id} className="rounded-md border p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium capitalize">{d.outcome_display ?? d.outcome}</span>
                  <span className="text-xs text-muted-foreground">{d.previous_status} → {d.new_status || d.previous_status}</span>
                </div>
                {d.gate && <p className="text-xs text-muted-foreground">{d.gate}</p>}
                {d.rationale && <p className="text-xs mt-1">{d.rationale}</p>}
                {d.decided_by_name && <p className="text-xs text-muted-foreground mt-1">by {d.decided_by_name}</p>}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// ---------------------------------------------------------------------------
// Benefit register
// ---------------------------------------------------------------------------
const BENEFIT_STATUSES = ['identified', 'analyzed', 'planned', 'realizing', 'realized', 'sustained'];

const BenefitsView = ({ programId }: { programId: string }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['pmi-benefits', programId],
    queryFn: () => apiGet(`/pmi/programs/${programId}/benefits/`),
    enabled: !!programId,
  });
  const { data: compData } = useQuery({
    queryKey: ['pmi-components', programId],
    queryFn: () => apiGet(`/pmi/programs/${programId}/components/`),
    enabled: !!programId,
  });
  const benefits = asList(data);
  const components = asList(compData);
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['pmi-benefits', programId] });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', status: 'identified', target_value: '', component: '' });

  const create = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_BASE_URL}/pmi/programs/${programId}/benefits/`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({
          name: form.name, status: form.status,
          target_value: form.target_value || null,
          component: form.component || null,
        }),
      });
      if (!res.ok) throw await res.json().catch(() => ({}));
      return res.json();
    },
    onSuccess: () => {
      toast.success('Benefit added');
      setOpen(false);
      setForm({ name: '', status: 'identified', target_value: '', component: '' });
      invalidate();
    },
    onError: () => toast.error('Could not add benefit'),
  });

  return (
    <>
      <Header
        icon={<Award className="h-6 w-6 text-green-600" />}
        title="Benefit Register"
        sub="Programme benefits tracked across the realization life-cycle"
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700"><Plus className="h-4 w-4 mr-2" />Add Benefit</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Benefit</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Status</Label>
                    <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {BENEFIT_STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Target value</Label><Input type="number" value={form.target_value} onChange={(e) => setForm({ ...form, target_value: e.target.value })} /></div>
                </div>
                <div>
                  <Label>Delivered by component</Label>
                  <Select value={form.component} onValueChange={(v) => setForm({ ...form, component: v })}>
                    <SelectTrigger><SelectValue placeholder="(none)" /></SelectTrigger>
                    <SelectContent>
                      {components.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
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
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Target</th>
                  <th className="pb-2">Component</th>
                </tr>
              </thead>
              <tbody>
                {benefits.map((b: any) => (
                  <tr key={b.id} className="border-b">
                    <td className="py-2 font-medium">{b.name}</td>
                    <td className="py-2"><Badge variant="outline" className="capitalize">{b.status_display ?? b.status}</Badge></td>
                    <td className="py-2">{b.target_value ?? '—'}</td>
                    <td className="py-2">{b.component_name ?? <span className="text-muted-foreground">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </>
  );
};

// ---------------------------------------------------------------------------
// Stakeholder power/interest grid
// ---------------------------------------------------------------------------
const QUADRANT_LABEL: Record<string, string> = {
  manage_closely: 'Manage closely',
  keep_satisfied: 'Keep satisfied',
  keep_informed: 'Keep informed',
  monitor: 'Monitor',
};

const StakeholdersView = ({ programId }: { programId: string }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['pmi-stakeholders', programId],
    queryFn: () => apiGet(`/pmi/programs/${programId}/stakeholders/`),
    enabled: !!programId,
  });
  const stakeholders = asList(data);
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['pmi-stakeholders', programId] });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', role: '', power: 'low', interest: 'low', engagement_strategy: '' });

  const create = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_BASE_URL}/pmi/programs/${programId}/stakeholders/`, {
        method: 'POST', headers: authHeaders(), body: JSON.stringify(form),
      });
      if (!res.ok) throw await res.json().catch(() => ({}));
      return res.json();
    },
    onSuccess: () => {
      toast.success('Stakeholder added');
      setOpen(false);
      setForm({ name: '', role: '', power: 'low', interest: 'low', engagement_strategy: '' });
      invalidate();
    },
    onError: () => toast.error('Could not add stakeholder'),
  });

  // Power/interest grid cells: [power, interest]
  const cell = (power: string, interest: string) =>
    stakeholders.filter((s: any) => s.power === power && s.interest === interest);

  const GridCell = ({ power, interest, label }: { power: string; interest: string; label: string }) => (
    <div className="rounded-md border p-3 min-h-28">
      <p className="text-xs font-semibold text-muted-foreground mb-2">{label}</p>
      <div className="space-y-1">
        {cell(power, interest).map((s: any) => (
          <Badge key={s.id} variant="secondary" className="mr-1">{s.name}</Badge>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <Header
        icon={<Users className="h-6 w-6 text-green-600" />}
        title="Stakeholder Grid"
        sub="Power / interest grid driving the engagement strategy"
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700"><Plus className="h-4 w-4 mr-2" />Add Stakeholder</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Stakeholder</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div><Label>Role</Label><Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Power</Label>
                    <Select value={form.power} onValueChange={(v) => setForm({ ...form, power: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Interest</Label>
                    <Select value={form.interest} onValueChange={(v) => setForm({ ...form, interest: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div><Label>Engagement strategy</Label><Textarea value={form.engagement_strategy} onChange={(e) => setForm({ ...form, engagement_strategy: e.target.value })} /></div>
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
        <>
          <div className="grid grid-cols-2 gap-3">
            <GridCell power="high" interest="high" label={`${QUADRANT_LABEL.manage_closely} (High power · High interest)`} />
            <GridCell power="high" interest="low" label={`${QUADRANT_LABEL.keep_satisfied} (High power · Low interest)`} />
            <GridCell power="low" interest="high" label={`${QUADRANT_LABEL.keep_informed} (Low power · High interest)`} />
            <GridCell power="low" interest="low" label={`${QUADRANT_LABEL.monitor} (Low power · Low interest)`} />
          </div>
          {stakeholders.length === 0 && (
            <Empty icon={<Users className="h-12 w-12" />} text="No stakeholders mapped yet" />
          )}
        </>
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

export default ProgramPMI;
