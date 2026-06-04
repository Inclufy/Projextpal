import { useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from '@/components/ui/dialog';
import { ProjectHeader } from '@/components/ProjectHeader';
import {
  Compass, FolderKanban, Loader2, Plus, Save, ShieldCheck, PlayCircle,
  XCircle, PauseCircle, History, Crown,
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

type View = 'operating-model' | 'projects';

const resolveView = (pathname: string): View => {
  if (pathname.endsWith('/operating-model')) return 'operating-model';
  return 'projects';
};

const ProgramP2 = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const view = resolveView(location.pathname);

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        {view === 'operating-model' && <BlueprintView programmeId={id!} />}
        {view === 'projects' && <ProjectsView programmeId={id!} />}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Blueprint — target operating model
// ---------------------------------------------------------------------------
const BlueprintView = ({ programmeId }: { programmeId: string }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['p2-blueprints', programmeId],
    queryFn: () => apiGet(`/p2-programme/programs/${programmeId}/blueprints/`),
    enabled: !!programmeId,
  });
  const existing = asList(data)[0] ?? null;
  const queryClient = useQueryClient();
  const [form, setForm] = useState<any>(null);

  const current = form ?? existing ?? {
    name: 'Target Operating Model', version: '1.0', status: 'draft',
    target_operating_model: '', description: '',
  };

  const save = useMutation({
    mutationFn: async () => {
      const body = JSON.stringify({
        name: current.name, version: current.version, status: current.status,
        target_operating_model: current.target_operating_model, description: current.description,
      });
      const url = existing
        ? `${API_BASE_URL}/p2-programme/blueprints/${existing.id}/`
        : `${API_BASE_URL}/p2-programme/programs/${programmeId}/blueprints/`;
      const res = await fetch(url, { method: existing ? 'PATCH' : 'POST', headers: authHeaders(), body });
      if (!res.ok) throw await res.json().catch(() => ({}));
      return res.json();
    },
    onSuccess: () => {
      toast.success('Blueprint saved');
      queryClient.invalidateQueries({ queryKey: ['p2-blueprints', programmeId] });
    },
    onError: () => toast.error('Could not save Blueprint'),
  });

  const set = (k: string, v: string) => setForm({ ...current, [k]: v });

  if (isLoading) return <Spinner />;

  return (
    <>
      <Header
        icon={<Compass className="h-6 w-6 text-purple-600" />}
        title="Programme Blueprint"
        sub="The target operating model that every constituent project must contribute to"
        action={
          <Button className="bg-purple-600 hover:bg-purple-700" disabled={save.isPending} onClick={() => save.mutate()}>
            {save.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Blueprint
          </Button>
        }
      />
      <Card>
        <CardContent className="pt-4 grid grid-cols-3 gap-3">
          <div><Label>Name</Label><Input value={current.name} onChange={(e) => set('name', e.target.value)} /></div>
          <div><Label>Version</Label><Input value={current.version} onChange={(e) => set('version', e.target.value)} /></div>
          <div>
            <Label>Status</Label>
            <Select value={current.status} onValueChange={(v) => set('status', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {['draft', 'approved', 'active', 'superseded'].map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Target Operating Model</CardTitle></CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-2">The future-state operating model (processes, organisation, technology, information)</p>
          <Textarea value={current.target_operating_model} onChange={(e) => set('target_operating_model', e.target.value)} rows={5} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Description</CardTitle></CardHeader>
        <CardContent>
          <Textarea value={current.description} onChange={(e) => set('description', e.target.value)} rows={3} />
        </CardContent>
      </Card>
    </>
  );
};

// ---------------------------------------------------------------------------
// Constituent projects + programme-board authorization
// ---------------------------------------------------------------------------
const STATUS_COLOR: Record<string, string> = {
  proposed: 'bg-slate-400',
  approved: 'bg-blue-500',
  active: 'bg-green-500',
  completed: 'bg-emerald-600',
  closed: 'bg-red-500',
};

const ProjectsView = ({ programmeId }: { programmeId: string }) => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['p2-projects', programmeId],
    queryFn: () => apiGet(`/p2-programme/programs/${programmeId}/projects/`),
    enabled: !!programmeId,
  });
  const { data: bpData } = useQuery({
    queryKey: ['p2-blueprints', programmeId],
    queryFn: () => apiGet(`/p2-programme/programs/${programmeId}/blueprints/`),
    enabled: !!programmeId,
  });
  const { data: rollup } = useQuery({
    queryKey: ['p2-rollup', programmeId],
    queryFn: () => apiGet(`/p2-programme/programs/${programmeId}/projects/rollup/`),
    enabled: !!programmeId,
  });
  const projects = asList(data);
  const blueprints = asList(bpData);
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['p2-projects', programmeId] });
    queryClient.invalidateQueries({ queryKey: ['p2-rollup', programmeId] });
  };

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', methodology: 'prince2', description: '' });
  const [decideFor, setDecideFor] = useState<any | null>(null);

  const create = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_BASE_URL}/p2-programme/programs/${programmeId}/projects/`, {
        method: 'POST', headers: authHeaders(), body: JSON.stringify(form),
      });
      if (!res.ok) throw await res.json().catch(() => ({}));
      return res.json();
    },
    onSuccess: () => {
      toast.success('Project added');
      setOpen(false);
      setForm({ name: '', methodology: 'prince2', description: '' });
      invalidate();
    },
    onError: () => toast.error('Could not add project'),
  });

  const setBlueprint = useMutation({
    mutationFn: async ({ id, blueprint }: { id: string; blueprint: string }) => {
      const res = await fetch(`${API_BASE_URL}/p2-programme/projects/${id}/`, {
        method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ blueprint: blueprint || null }),
      });
      if (!res.ok) throw await res.json().catch(() => ({}));
      return res.json();
    },
    onSuccess: () => { toast.success('Blueprint linked'); invalidate(); },
    onError: () => toast.error('Could not link Blueprint'),
  });

  return (
    <>
      <Header
        icon={<FolderKanban className="h-6 w-6 text-purple-600" />}
        title="Constituent Projects"
        sub="The programme board authorizes each project — status changes only through a board decision"
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700"><Plus className="h-4 w-4 mr-2" />New Project</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New Constituent Project</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div>
                  <Label>Delivery methodology</Label>
                  <Select value={form.methodology} onValueChange={(v) => setForm({ ...form, methodology: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['prince2', 'agile', 'waterfall', 'hybrid'].map((m) => (
                        <SelectItem key={m} value={m} className="capitalize">{m}</SelectItem>
                      ))}
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

      {rollup && (
        <Card>
          <CardContent className="pt-4 flex items-center gap-6 text-sm">
            <div><span className="text-2xl font-bold">{rollup.total}</span><p className="text-muted-foreground">Projects</p></div>
            <div><span className="text-2xl font-bold text-green-600">{rollup.authorized}</span><p className="text-muted-foreground">Authorized</p></div>
            <div><span className="text-2xl font-bold text-purple-600">{rollup.with_blueprint}</span><p className="text-muted-foreground">Anchored to Blueprint</p></div>
          </CardContent>
        </Card>
      )}

      {isLoading ? <Spinner /> : projects.length === 0 ? (
        <Empty icon={<FolderKanban className="h-12 w-12" />} text="No constituent projects yet" />
      ) : (
        <div className="space-y-3">
          {projects.map((p: any) => (
            <Card key={p.id}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium flex items-center gap-2">
                      {p.name}
                      <Badge className={STATUS_COLOR[p.status] ?? 'bg-slate-400'}>{p.status_display ?? p.status}</Badge>
                      <Badge variant="outline" className="capitalize">{p.methodology}</Badge>
                    </p>
                    {p.description && <p className="text-sm text-muted-foreground">{p.description}</p>}
                  </div>
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={() => setDecideFor(p)}>
                    <Crown className="h-3 w-3 mr-1" />Board decision
                  </Button>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground">Blueprint:</Label>
                  <Select
                    value={p.blueprint ?? ''}
                    onValueChange={(v) => setBlueprint.mutate({ id: p.id, blueprint: v })}
                  >
                    <SelectTrigger className="h-8 w-64"><SelectValue placeholder="(not anchored)" /></SelectTrigger>
                    <SelectContent>
                      {blueprints.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.name} v{b.version}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {decideFor && (
        <DecideDialog
          project={decideFor}
          onClose={() => setDecideFor(null)}
          onDecided={() => { setDecideFor(null); invalidate(); }}
        />
      )}
    </>
  );
};

const DECISIONS: [string, string, any, string][] = [
  ['authorize', 'Authorize', ShieldCheck, '→ Approved (needs Blueprint)'],
  ['start', 'Start', PlayCircle, '→ Active'],
  ['stop', 'Stop', XCircle, '→ Closed'],
  ['defer', 'Defer', PauseCircle, 'Status unchanged'],
];

const DecideDialog = ({ project, onClose, onDecided }: any) => {
  const [decision, setDecision] = useState<string | null>(null);
  const [gate, setGate] = useState('');
  const [rationale, setRationale] = useState('');

  const decide = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_BASE_URL}/p2-programme/projects/${project.id}/decide/`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ decision, gate, rationale }),
      });
      if (!res.ok) throw await res.json().catch(() => ({}));
      return res.json();
    },
    onSuccess: (d: any) => {
      toast.success(`Decision recorded — project is now "${d.project.status}"`);
      onDecided();
    },
    onError: (err: any) => {
      if (err?.code === 'blueprint_required') toast.error('Link the project to a Blueprint before authorizing it.');
      else if (err?.code === 'invalid_decision') toast.error('Pick a valid board decision.');
      else toast.error('Could not record board decision.');
    },
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Programme-board decision — {project.name}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {DECISIONS.map(([value, label, Icon, hint]) => (
              <button
                key={value}
                type="button"
                onClick={() => setDecision(value)}
                className={`flex flex-col items-start gap-1 rounded-md border p-3 text-left transition ${
                  decision === value ? 'border-purple-600 bg-purple-50' : 'hover:bg-muted'
                }`}
              >
                <span className="flex items-center gap-2 font-medium"><Icon className="h-4 w-4" />{label}</span>
                <span className="text-xs text-muted-foreground">{hint}</span>
              </button>
            ))}
          </div>
          <div><Label>Gate / tranche</Label><Input value={gate} onChange={(e) => setGate(e.target.value)} placeholder="e.g. End of Tranche 1" /></div>
          <div><Label>Rationale</Label><Textarea value={rationale} onChange={(e) => setRationale(e.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button disabled={!decision || decide.isPending} onClick={() => decide.mutate()}>
            {decide.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Record decision
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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

export default ProgramP2;
