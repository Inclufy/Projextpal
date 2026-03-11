import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { 
  Layers, FolderKanban, TrendingUp, DollarSign, Calendar, 
  AlertTriangle, CheckCircle2, ArrowRight, Loader2, Plus,
  Edit, Trash2, ArrowLeft
} from 'lucide-react';
import { usePageTranslations } from '@/hooks/usePageTranslations';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatBudgetDetailed, getCurrencyFromLanguage } from '@/lib/currencies';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001/api/v1';

// API functions
const fetchProgram = async (id: string) => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_BASE_URL}/programs/${id}/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to fetch program");
  return response.json();
};

const fetchProgramProjects = async (id: string) => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_BASE_URL}/programs/${id}/projects/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) return [];
  return response.json();
};

const fetchProgramMilestones = async (id: string) => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_BASE_URL}/programs/${id}/milestones/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) return [];
  return response.json();
};

const updateProgram = async ({ id, data }: { id: string; data: any }) => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_BASE_URL}/programs/${id}/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update program");
  return response.json();
};

const deleteProgram = async (id: string) => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_BASE_URL}/programs/${id}/`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to delete program");
  return true;
};

const ProgramDashboard = () => {
  const { pt } = usePageTranslations();
  const { t, language } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    total_budget: "",
    strategic_objective: "",
  });

  // Fetch program data
  const { data: program, isLoading: programLoading } = useQuery({
    queryKey: ['program', id],
    queryFn: () => fetchProgram(id!),
    enabled: !!id,
  });

  // Fetch program projects
  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['program-projects', id],
    queryFn: () => fetchProgramProjects(id!),
    enabled: !!id,
  });

  // Fetch program milestones
  const { data: milestones = [] } = useQuery({
    queryKey: ['program-milestones', id],
    queryFn: () => fetchProgramMilestones(id!),
    enabled: !!id,
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: updateProgram,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['program', id] });
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      toast.success(t.common.programUpdated);
      setEditDialogOpen(false);
    },
    onError: () => {
      toast.error(t.common.updateFailed);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => deleteProgram(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      toast.success(t.common.programDeleted);
      navigate("/programs");
    },
    onError: () => {
      toast.error(t.common.deleteFailed);
    },
  });

  const handleEditClick = () => {
    if (program) {
      setEditFormData({
        name: program.name || "",
        description: program.description || "",
        total_budget: program.total_budget?.toString() || "",
        strategic_objective: program.strategic_objective || "",
      });
    }
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    updateMutation.mutate({
      id: id!,
      data: {
        name: editFormData.name,
        description: editFormData.description,
        total_budget: parseFloat(editFormData.total_budget) || 0,
        strategic_objective: editFormData.strategic_objective,
      },
    });
  };

  const isLoading = programLoading || projectsLoading;

  // Calculate metrics from real data
  const programMetrics = {
    totalProjects: projects.length,
    activeProjects: projects.filter((p: any) => p.status === 'active').length,
    completedProjects: projects.filter((p: any) => p.status === 'completed').length,
    overallProgress: projects.length > 0 
      ? Math.round(projects.reduce((sum: number, p: any) => sum + (p.progress || 0), 0) / projects.length) 
      : 0,
    atRiskProjects: projects.filter((p: any) => p.health_status === 'amber' || p.health_status === 'red').length,
  };

  // Filter upcoming milestones
  const upcomingMilestones = milestones
    .filter((m: any) => new Date(m.target_date || m.due_date) >= new Date())
    .sort((a: any, b: any) => new Date(a.target_date || a.due_date).getTime() - new Date(b.target_date || b.due_date).getTime())
    .slice(0, 5);

  const getHealthColor = (health: string) => {
    switch (health?.toLowerCase()) {
      case 'green': return 'bg-green-500';
      case 'amber': return 'bg-yellow-500';
      case 'red': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'planning': return 'bg-gray-400';
      case 'on_hold': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  const formatCurrency = (amount: number) => formatBudgetDetailed(amount || 0, getCurrencyFromLanguage(language));

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-full bg-background">
        <div className="border-b border-border bg-card">
          <div className="px-6 py-4 flex justify-end gap-2">
            <Button variant="outline" disabled className="gap-2">
              <Edit className="h-4 w-4" />
              {pt("Edit")}
            </Button>
            <Button variant="destructive" disabled className="gap-2">
              <Trash2 className="h-4 w-4" />
              {pt("Delete")}
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const totalBudget = program?.total_budget || 0;
  const spentBudget = program?.spent_budget || 0;

  return (
    <div className="min-h-full bg-background">
      {/* Header with Edit/Delete buttons */}
      <div className="border-b border-border bg-card">
        <div className="px-6 py-4 flex justify-between items-center">
          <Button variant="ghost" size="icon" onClick={() => navigate("/programs")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleEditClick} className="gap-2">
              <Edit className="h-4 w-4" />
              {pt("Edit")}
            </Button>
            <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)} className="gap-2">
              <Trash2 className="h-4 w-4" />
              {pt("Delete")}
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Layers className="h-6 w-6 text-indigo-600" />
              Program Dashboard
            </h1>
            <p className="text-muted-foreground">{program?.name || 'Overview of all projects in the program'}</p>
          </div>
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={() => navigate(`/projects/new?program=${id}`)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Project to Program
          </Button>
        </div>

        {/* Program Summary */}
        <div className="grid grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-sm text-muted-foreground">Total Projects</p>
              <p className="text-3xl font-bold text-indigo-600">{programMetrics.totalProjects}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-sm text-muted-foreground">{pt("Active")}</p>
              <p className="text-3xl font-bold text-blue-600">{programMetrics.activeProjects}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-sm text-muted-foreground">{pt("Completed")}</p>
              <p className="text-3xl font-bold text-green-600">{programMetrics.completedProjects}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-sm text-muted-foreground">Overall Progress</p>
              <p className="text-3xl font-bold">{programMetrics.overallProgress}%</p>
            </CardContent>
          </Card>
          <Card className={programMetrics.atRiskProjects > 0 ? 'border-yellow-300 bg-yellow-50' : ''}>
            <CardContent className="pt-4 text-center">
              <p className="text-sm text-muted-foreground">{pt("At Risk")}</p>
              <p className={`text-3xl font-bold ${programMetrics.atRiskProjects > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
                {programMetrics.atRiskProjects}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Budget Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-indigo-600" />
              Program Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-6 mb-4">
              <div>
                <p className="text-sm text-muted-foreground">{pt("Total Budget")}</p>
                <p className="text-2xl font-bold">{formatCurrency(totalBudget)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{pt("Spent")}</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(spentBudget)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{pt("Remaining")}</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalBudget - spentBudget)}</p>
              </div>
            </div>
            <Progress value={totalBudget > 0 ? (spentBudget / totalBudget) * 100 : 0} className="h-3" />
            <p className="text-sm text-right mt-1 text-muted-foreground">
              {totalBudget > 0 ? Math.round((spentBudget / totalBudget) * 100) : 0}% utilized
            </p>
          </CardContent>
        </Card>

        {/* Projects Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderKanban className="h-5 w-5 text-indigo-600" />
              Projects in Program
            </CardTitle>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <div className="text-center py-8">
                <FolderKanban className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No projects in this program yet</p>
                <Button onClick={() => navigate(`/projects/new?program=${id}`)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Project
                </Button>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3">{pt("Project")}</th>
                    <th className="pb-3">Methodology</th>
                    <th className="pb-3">Lead</th>
                    <th className="pb-3">{pt("Status")}</th>
                    <th className="pb-3">{pt("Progress")}</th>
                    <th className="pb-3">{pt("Budget")}</th>
                    <th className="pb-3">{pt("Health")}</th>
                    <th className="pb-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((proj: any) => (
                    <tr key={proj.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 font-medium">{proj.name}</td>
                      <td className="py-3">
                        <Badge variant="outline">{proj.methodology || 'hybrid'}</Badge>
                      </td>
                      <td className="py-3 text-sm text-muted-foreground">
                        {proj.project_manager_name || proj.lead_name || 'Unassigned'}
                      </td>
                      <td className="py-3">
                        <Badge className={getStatusColor(proj.status)}>{proj.status}</Badge>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <Progress value={proj.progress || 0} className="h-2 w-20" />
                          <span className="text-sm">{proj.progress || 0}%</span>
                        </div>
                      </td>
                      <td className="py-3 text-sm">
                        {formatCurrency(proj.spent_budget || 0)} / {formatCurrency(proj.budget || 0)}
                      </td>
                      <td className="py-3">
                        <div className={`h-3 w-3 rounded-full ${getHealthColor(proj.health_status)}`} />
                      </td>
                      <td className="py-3">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => navigate(`/projects/${proj.id}/foundation/overview`)}
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Milestones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-600" />
              Upcoming Program Milestones
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingMilestones.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No upcoming milestones</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingMilestones.map((ms: any, i: number) => (
                  <div key={ms.id || i} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {ms.status === 'completed' ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : ms.status === 'at_risk' ? (
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      ) : (
                        <CheckCircle2 className="h-5 w-5 text-blue-500" />
                      )}
                      <div>
                        <p className="font-medium">{ms.name}</p>
                        <p className="text-sm text-muted-foreground">{ms.project_name || 'Program Milestone'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm">{formatDate(ms.target_date || ms.due_date)}</span>
                      <Badge className={
                        ms.status === 'completed' ? 'bg-green-500' : 
                        ms.status === 'at_risk' ? 'bg-yellow-500' : 'bg-blue-500'
                      }>
                        {ms.status?.replace('_', ' ') || 'on track'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Program Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Program</DialogTitle>
            <DialogDescription>
              Update your program details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Program Name</Label>
              <Input
                id="edit-name"
                value={editFormData.name}
                onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">{pt("Description")}</Label>
              <Textarea
                id="edit-description"
                value={editFormData.description}
                onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-budget">Total Budget (€)</Label>
              <Input
                id="edit-budget"
                type="number"
                value={editFormData.total_budget}
                onChange={(e) => setEditFormData(prev => ({ ...prev, total_budget: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-objective">{pt("Strategic Objective")}</Label>
              <Textarea
                id="edit-objective"
                value={editFormData.strategic_objective}
                onChange={(e) => setEditFormData(prev => ({ ...prev, strategic_objective: e.target.value }))}
                rows={2}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              {pt("Cancel")}
            </Button>
            <Button onClick={handleSaveEdit} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Program</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{program?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{pt("Cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {pt("Delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProgramDashboard;