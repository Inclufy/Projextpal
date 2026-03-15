import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Loader2,
  Calendar,
  DollarSign,
  Users,
  FolderKanban,
  Target,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  Plus,
  MoreHorizontal,
  Eye,
  Zap,
  BarChart3,
  Crown,
  GitMerge,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { usePageTranslations } from '@/hooks/usePageTranslations';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatBudgetDetailed, getCurrencyFromLanguage } from '@/lib/currencies';

// API functions
const fetchProgram = async (id: string) => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`/api/v1/programs/${id}/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Failed to fetch program");
  return response.json();
};

const fetchProgramProjects = async (id: string) => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`/api/v1/programs/${id}/projects/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) return [];
  return response.json();
};

const deleteProgram = async (id: string) => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`/api/v1/programs/${id}/`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Failed to delete program");
  return true;
};

const updateProgram = async ({ id, data }: { id: string; data: any }) => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`/api/v1/programs/${id}/`, {
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

const METHODOLOGY_CONFIG: Record<string, { icon: any; color: string; bgColor: string; label: string }> = {
  safe: { icon: Zap, color: 'text-blue-600', bgColor: 'bg-blue-500', label: 'SAFe' },
  msp: { icon: Target, color: 'text-purple-600', bgColor: 'bg-purple-500', label: 'MSP' },
  pmi: { icon: BarChart3, color: 'text-green-600', bgColor: 'bg-green-500', label: 'PMI' },
  prince2_programme: { icon: Crown, color: 'text-amber-600', bgColor: 'bg-amber-500', label: 'PRINCE2' },
  hybrid: { icon: GitMerge, color: 'text-pink-600', bgColor: 'bg-pink-500', label: 'Hybrid' },
};

const ProgramDetail = () => {
  const { pt } = usePageTranslations();
  const { language } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    total_budget: "",
    strategic_objective: "",
  });

  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  // Fetch program
  const { data: program, isLoading, error } = useQuery({
    queryKey: ["program", id],
    queryFn: () => fetchProgram(id!),
    enabled: !!id,
  });

  // Fetch program projects
  const { data: projects = [] } = useQuery({
    queryKey: ["program-projects", id],
    queryFn: () => fetchProgramProjects(id!),
    enabled: !!id,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => deleteProgram(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["programs"] });
      toast.success("Program deleted successfully");
      navigate("/programs");
    },
    onError: () => {
      toast.error("Failed to delete program");
    },
  });

  // Fetch all projects for linking
  const fetchAllProjects = async () => {
    setLoadingProjects(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("/api/v1/projects/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        const projectsList = Array.isArray(data) ? data : data.results || [];
        setAllProjects(projectsList);
      }
    } catch (err) {
      console.error("Failed to fetch projects", err);
    } finally {
      setLoadingProjects(false);
    }
  };

  // Link project mutation
  const linkProjectMutation = useMutation({
    mutationFn: async (projectId: number) => {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`/api/v1/programs/${id}/add_project/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ project_id: projectId }),
      });
      if (!response.ok) throw new Error("Failed to link project");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["program-projects", id] });
      queryClient.invalidateQueries({ queryKey: ["program", id] });
      toast.success("Project gekoppeld aan programma");
      setLinkDialogOpen(false);
    },
    onError: () => {
      toast.error("Koppelen mislukt");
    },
  });

  const linkedProjectIds = projects.map((p: any) => p.id);
  const availableProjects = allProjects
    .filter((p: any) => !linkedProjectIds.includes(p.id))
    .filter((p: any) => 
      !searchQuery || 
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: updateProgram,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["program", id] });
      queryClient.invalidateQueries({ queryKey: ["programs"] });
      toast.success("Program updated successfully");
      setEditDialogOpen(false);
    },
    onError: () => {
      toast.error("Failed to update program");
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

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'planning': return 'bg-blue-100 text-blue-800';
      case 'on_hold': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getHealthColor = (health: string) => {
    switch (health?.toLowerCase()) {
      case 'green': return 'text-green-600';
      case 'amber': return 'text-amber-600';
      case 'red': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getHealthBgColor = (health: string) => {
    switch (health?.toLowerCase()) {
      case 'green': return 'bg-green-100';
      case 'amber': return 'bg-amber-100';
      case 'red': return 'bg-red-100';
      default: return 'bg-gray-100';
    }
  };

  const formatCurrency = (amount: number) => formatBudgetDetailed(amount || 0, getCurrencyFromLanguage(language));

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-red-500">Failed to load program</p>
        <Button onClick={() => navigate("/programs")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Programs
        </Button>
      </div>
    );
  }

  const methodologyConfig = METHODOLOGY_CONFIG[program.methodology] || METHODOLOGY_CONFIG.hybrid;
  const MethodologyIcon = methodologyConfig.icon;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/programs")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold">{program.name}</h1>
              <Badge className={getStatusColor(program.status)}>
                {program.status?.replace('_', ' ')}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <MethodologyIcon className={cn("h-3 w-3", methodologyConfig.color)} />
                {methodologyConfig.label}
              </Badge>
            </div>
            <p className="text-muted-foreground">{program.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleEditClick}>
            <Edit className="h-4 w-4 mr-2" />
            {pt("Edit")}
          </Button>
          <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            {pt("Delete")}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{pt("Projects")}</p>
                <p className="text-2xl font-bold">{program.project_count || projects.length || 0}</p>
              </div>
              <FolderKanban className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{pt("Progress")}</p>
                <p className="text-2xl font-bold">{program.progress || 0}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{pt("Health")}</p>
                <div className={cn("flex items-center gap-2 mt-1 px-2 py-1 rounded-full w-fit", getHealthBgColor(program.health_status))}>
                  <CheckCircle2 className={cn("h-4 w-4", getHealthColor(program.health_status))} />
                  <span className={cn("text-sm font-medium capitalize", getHealthColor(program.health_status))}>
                    {program.health_status || 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{pt("Total Budget")}</p>
                <p className="text-2xl font-bold">{formatCurrency(program.total_budget)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{pt("Spent")}</p>
                <p className="text-2xl font-bold">{formatCurrency(program.spent_budget)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{pt("End Date")}</p>
                <p className="text-lg font-semibold">{formatDate(program.target_end_date)}</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">{program.progress || 0}%</span>
          </div>
          <Progress value={program.progress || 0} className="h-3" />
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">{pt("Overview")}</TabsTrigger>
          <TabsTrigger value="projects">Projects ({projects.length})</TabsTrigger>
          <TabsTrigger value="timeline">{pt("Timeline")}</TabsTrigger>
          <TabsTrigger value="risks">Risks & Issues</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Program Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{pt("Program Manager")}</p>
                    <p className="font-medium">{program.program_manager_name || 'Unassigned'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{pt("Sponsor")}</p>
                    <p className="font-medium">{program.executive_sponsor_name || program.sponsor_name || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{pt("Start Date")}</p>
                    <p className="font-medium">{formatDate(program.start_date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Target End Date</p>
                    <p className="font-medium">{formatDate(program.target_end_date)}</p>
                  </div>
                </div>
                {program.strategic_objective && (
                  <div>
                    <p className="text-sm text-muted-foreground">{pt("Strategic Objective")}</p>
                    <p className="font-medium">{program.strategic_objective}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Budget Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{pt("Total Budget")}</p>
                    <p className="text-xl font-bold">{formatCurrency(program.total_budget)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{pt("Spent")}</p>
                    <p className="text-xl font-bold text-amber-600">{formatCurrency(program.spent_budget)}</p>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Budget Utilization</span>
                    <span>
                      {program.total_budget 
                        ? Math.round((program.spent_budget / program.total_budget) * 100) 
                        : 0}%
                    </span>
                  </div>
                  <Progress 
                    value={program.total_budget 
                      ? (program.spent_budget / program.total_budget) * 100 
                      : 0} 
                    className="h-2" 
                  />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{pt("Remaining")}</p>
                  <p className="text-lg font-semibold text-green-600">
                    {formatCurrency((program.total_budget || 0) - (program.spent_budget || 0))}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Projects in this Program</h3>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { fetchAllProjects(); setLinkDialogOpen(true); }}>
                <FolderKanban className="h-4 w-4 mr-2" />
                {pt("Bestaand project koppelen")}
              </Button>
              <Button onClick={() => navigate(`/projects/new?program=${id}`)}>
                <Plus className="h-4 w-4 mr-2" />
                {pt("Nieuw project")}
              </Button>
            </div>
          </div>
          
          {projects.length === 0 ? (
            <Card className="p-8 text-center">
              <FolderKanban className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
              <p className="text-muted-foreground mb-4">
                Add projects to this program to track progress
              </p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={() => { fetchAllProjects(); setLinkDialogOpen(true); }}>
                  <FolderKanban className="h-4 w-4 mr-2" />
                  {pt("Bestaand project koppelen")}
                </Button>
                <Button onClick={() => navigate(`/projects/new?program=${id}`)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {pt("Nieuw project")}
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project: any) => (
                <Card 
                  key={project.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/projects/${project.id}/foundation/overview`)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/projects/${project.id}/foundation/overview`);
                          }}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/projects/${project.id}/foundation/overview?edit=true`);
                          }}>
                            <Edit className="h-4 w-4 mr-2" />
                            {pt("Edit")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {project.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{pt("Progress")}</span>
                        <span>{project.progress || 0}%</span>
                      </div>
                      <Progress value={project.progress || 0} className="h-2" />
                      <div className="flex items-center justify-between">
                        <Badge className={getStatusColor(project.status)}>
                          {project.status?.replace('_', ' ')}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(project.end_date)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="timeline">
          <Card className="p-8 text-center">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Timeline View</h3>
            <p className="text-muted-foreground">
              Program timeline visualization coming soon
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="risks">
          <Card className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Risks & Issues</h3>
            <p className="text-muted-foreground">
              Risk management features coming soon
            </p>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Program</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{program.name}"? This action cannot be undone.
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

      {/* Link Existing Project Dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="max-w-lg max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{pt("Bestaand project koppelen")}</DialogTitle>
            <DialogDescription>
              {pt("Selecteer een project om te koppelen aan dit programma")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <input
              type="text"
              placeholder={pt("Zoek project...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-background"
            />
            <div className="max-h-[400px] overflow-y-auto space-y-2">
              {loadingProjects ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : availableProjects.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  {searchQuery ? pt("Geen projecten gevonden") : pt("Alle projecten zijn al gekoppeld")}
                </p>
              ) : (
                availableProjects.map((project: any) => (
                  <Card
                    key={project.id}
                    className="cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => linkProjectMutation.mutate(project.id)}
                  >
                    <CardContent className="p-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{project.name}</p>
                        <p className="text-sm text-muted-foreground truncate max-w-[300px]">
                          {project.description || pt("Geen beschrijving")}
                        </p>
                        <div className="flex gap-2 mt-1">
                          {project.methodology && (
                            <Badge variant="secondary" className="text-xs">{project.methodology}</Badge>
                          )}
                          {project.status && (
                            <Badge variant="outline" className="text-xs">{project.status}</Badge>
                          )}
                        </div>
                      </div>
                      <Plus className="h-5 w-5 text-muted-foreground" />
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
    </div>
  );
};

export default ProgramDetail;