import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ProjectHeader } from '@/components/ProjectHeader';
import { useProject } from '@/hooks/useApi';
import { prince2Api, WorkPackage, Stage } from '@/lib/prince2Api';
import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
import { 
  Package, Plus, Edit, Trash2, Play, CheckCircle2, 
  Clock, User, AlertTriangle, RefreshCw, ChevronRight, Filter
} from 'lucide-react';

const Prince2WorkPackages = () => {
  const { id } = useParams<{ id: string }>();
  const { data: project } = useProject(id);
  
  const [workPackages, setWorkPackages] = useState<WorkPackage[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedWP, setSelectedWP] = useState<WorkPackage | null>(null);
  const [filterStage, setFilterStage] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  const [newWP, setNewWP] = useState<Partial<WorkPackage>>({
    priority: 'medium',
    status: 'draft'
  });

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [wpData, stageData] = await Promise.all([
        prince2Api.workPackages.getAll(id),
        prince2Api.stages.getAll(id)
      ]);
      setWorkPackages(wpData);
      setStages(stageData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createWorkPackage = async () => {
    if (!id || !newWP.stage || !newWP.reference || !newWP.title) return;
    try {
      await prince2Api.workPackages.create(id, newWP);
      setShowCreateDialog(false);
      setNewWP({ priority: 'medium', status: 'draft' });
      await loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const authorizeWP = async (wp: WorkPackage) => {
    if (!id) return;
    try {
      await prince2Api.workPackages.authorize(id, wp.id);
      await loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const startWP = async (wp: WorkPackage) => {
    if (!id) return;
    try {
      await prince2Api.workPackages.start(id, wp.id);
      await loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const completeWP = async (wp: WorkPackage) => {
    if (!id) return;
    try {
      await prince2Api.workPackages.complete(id, wp.id);
      await loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const deleteWP = async (wp: WorkPackage) => {
    if (!id || !confirm('Delete this work package?')) return;
    try {
      await prince2Api.workPackages.delete(id, wp.id);
      await loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'bg-slate-100 text-slate-700',
      authorized: 'bg-blue-100 text-blue-700',
      in_progress: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-green-100 text-green-700',
      closed: 'bg-gray-100 text-gray-700'
    };
    return <Badge className={styles[status] || ''}>{status.replace('_', ' ')}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      low: 'bg-gray-100 text-gray-600',
      medium: 'bg-blue-100 text-blue-600',
      high: 'bg-orange-100 text-orange-600',
      critical: 'bg-red-100 text-red-600'
    };
    return <Badge className={styles[priority] || ''}>{priority}</Badge>;
  };

  const filteredWPs = workPackages.filter(wp => {
    if (filterStage !== 'all' && wp.stage.toString() !== filterStage) return false;
    if (filterStatus !== 'all' && wp.status !== filterStatus) return false;
    return true;
  });

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader project={project} />
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Package className="h-6 w-6 text-cyan-600" />
              Work Packages
            </h1>
            <p className="text-muted-foreground">Manage delegated work assignments</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={loadData}><RefreshCw className="h-4 w-4 mr-2" />Refresh</Button>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" />New Work Package</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>Create Work Package</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Reference</Label>
                      <Input value={newWP.reference || ''} onChange={(e) => setNewWP({...newWP, reference: e.target.value})} placeholder="WP-001" />
                    </div>
                    <div>
                      <Label>Stage</Label>
                      <Select value={newWP.stage?.toString() || ''} onValueChange={(v) => setNewWP({...newWP, stage: parseInt(v)})}>
                        <SelectTrigger><SelectValue placeholder="Select stage" /></SelectTrigger>
                        <SelectContent>
                          {stages.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Title</Label>
                    <Input value={newWP.title || ''} onChange={(e) => setNewWP({...newWP, title: e.target.value})} />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea value={newWP.description || ''} onChange={(e) => setNewWP({...newWP, description: e.target.value})} rows={3} />
                  </div>
                  <div>
                    <Label>Products to Deliver</Label>
                    <Textarea value={newWP.product_descriptions || ''} onChange={(e) => setNewWP({...newWP, product_descriptions: e.target.value})} rows={2} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Priority</Label>
                      <Select value={newWP.priority || 'medium'} onValueChange={(v) => setNewWP({...newWP, priority: v as any})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Planned End Date</Label>
                      <Input type="date" value={newWP.planned_end_date || ''} onChange={(e) => setNewWP({...newWP, planned_end_date: e.target.value})} />
                    </div>
                  </div>
                  <Button onClick={createWorkPackage} className="w-full">Create Work Package</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="text-red-700">{error}</span>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-4">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filterStage} onValueChange={setFilterStage}>
                <SelectTrigger className="w-48"><SelectValue placeholder="Filter by stage" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  {stages.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48"><SelectValue placeholder="Filter by status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="authorized">Authorized</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground ml-auto">{filteredWPs.length} work packages</span>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{workPackages.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">In Progress</p>
              <p className="text-2xl font-bold text-yellow-600">{workPackages.filter(w => w.status === 'in_progress').length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold text-green-600">{workPackages.filter(w => w.status === 'completed' || w.status === 'closed').length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Awaiting Auth</p>
              <p className="text-2xl font-bold text-blue-600">{workPackages.filter(w => w.status === 'draft').length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Work Packages List */}
        <div className="space-y-4">
          {filteredWPs.length > 0 ? filteredWPs.map((wp) => (
            <Card key={wp.id} className="hover:bg-muted/50 transition-colors">
              <CardContent className="py-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm text-muted-foreground">{wp.reference}</span>
                      <h3 className="font-medium">{wp.title}</h3>
                      {getStatusBadge(wp.status)}
                      {getPriorityBadge(wp.priority)}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">{wp.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Package className="h-4 w-4" />{wp.stage_name}</span>
                      {wp.team_manager_name && <span className="flex items-center gap-1"><User className="h-4 w-4" />{wp.team_manager_name}</span>}
                      {wp.planned_end_date && <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{wp.planned_end_date}</span>}
                    </div>
                  </div>
                  <div className="text-right mr-4">
                    <p className="text-lg font-bold">{wp.progress_percentage}%</p>
                    <Progress value={wp.progress_percentage} className="w-24 h-2 mt-1" />
                  </div>
                  <div className="flex items-center gap-2">
                    {wp.status === 'draft' && (
                      <Button size="sm" variant="outline" onClick={() => authorizeWP(wp)}>
                        <CheckCircle2 className="h-4 w-4 mr-1" />Authorize
                      </Button>
                    )}
                    {wp.status === 'authorized' && (
                      <Button size="sm" variant="outline" onClick={() => startWP(wp)}>
                        <Play className="h-4 w-4 mr-1" />Start
                      </Button>
                    )}
                    {wp.status === 'in_progress' && (
                      <Button size="sm" variant="outline" onClick={() => completeWP(wp)}>
                        <CheckCircle2 className="h-4 w-4 mr-1" />Complete
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => deleteWP(wp)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No work packages found</p>
                <Button className="mt-4" onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />Create Work Package
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

          {/* Methodology Help Panel */}
          <MethodologyHelpPanel methodology="prince2" />
    </div>
  );
};

export default Prince2WorkPackages;
