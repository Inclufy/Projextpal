import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatBudgetDetailed, getCurrencyFromLanguage } from '@/lib/currencies';
import {
  Plus,
  Search,
  Layers,
  Calendar,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  FolderKanban,
  MoreHorizontal,
  Trash2,
  Edit,
  Eye,
  Loader2,
  Sparkles,
  Lightbulb,
  CheckCircle2,
  LayoutGrid,
  List,
  Zap,
  Target,
  BarChart3,
  Crown,
  GitMerge,
  Check,
  Users,
  Clock,
  FileText,
  ArrowRight,
  ArrowLeft,
  Building2,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// API functions
const fetchPrograms = async () => {
  const token = localStorage.getItem("access_token");
  const response = await fetch("/api/v1/programs/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Failed to fetch programs");
  return response.json();
};

const deleteProgram = async (id: number) => {
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

const createProgram = async (programData: any) => {
  const token = localStorage.getItem("access_token");
  const response = await fetch("/api/v1/programs/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(programData),
  });
  if (!response.ok) throw new Error("Failed to create program");
  return response.json();
};

const updateProgram = async ({ id, data }: { id: number; data: any }) => {
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

// AI Helper function
const callAI = async (prompt: string): Promise<string> => {
  const token = localStorage.getItem("access_token");
  try {
    const response = await fetch("/api/v1/governance/ai/generate/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ prompt }),
    });
    if (!response.ok) throw new Error("AI service unavailable");
    const data = await response.json();
    return data.response || "";
  } catch (error) {
    console.error("AI call failed:", error);
    throw error;
  }
};

// Methodology configurations for Programs - Now with translation keys
const getMethodologyConfig = (t: any) => ({
  safe: { 
    icon: Zap, 
    color: 'text-blue-600', 
    bgColor: 'bg-blue-50', 
    borderColor: 'border-blue-200', 
    label: t.programs.methodologies.safe, 
    description: t.programs.methodologies.safeDesc 
  },
  msp: { 
    icon: Target, 
    color: 'text-purple-600', 
    bgColor: 'bg-purple-50', 
    borderColor: 'border-purple-200', 
    label: t.programs.methodologies.msp, 
    description: t.programs.methodologies.mspDesc 
  },
  pmi: { 
    icon: BarChart3, 
    color: 'text-green-600', 
    bgColor: 'bg-green-50', 
    borderColor: 'border-green-200', 
    label: t.programs.methodologies.pmi, 
    description: t.programs.methodologies.pmiDesc 
  },
  prince2_programme: { 
    icon: Crown, 
    color: 'text-amber-600', 
    bgColor: 'bg-amber-50', 
    borderColor: 'border-amber-200', 
    label: t.programs.methodologies.prince2, 
    description: t.programs.methodologies.prince2Desc 
  },
  hybrid: { 
    icon: GitMerge, 
    color: 'text-pink-600', 
    bgColor: 'bg-pink-50', 
    borderColor: 'border-pink-200', 
    label: t.programs.methodologies.hybrid, 
    description: t.programs.methodologies.hybridDesc 
  },
});

// AI Wizard Step type
type WizardStep = 'idea' | 'methodology' | 'details' | 'review' | 'creating';

interface ProgramFormData {
  name: string;
  description: string;
  methodology: string;
  strategic_objective: string;
  departments: string;
  total_budget: string;
  duration: string;
  status: string;
  startDate: string;
}

const ProgramsOverview = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t, language } = useLanguage();

  // Get methodology config with translations - FIXED: Added safety check
  const METHODOLOGY_CONFIG = useMemo(() => t?.programs?.methodologies ? getMethodologyConfig(t) : {}, [t]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodologyFilter, setMethodologyFilter] = useState("all");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [programToDelete, setProgramToDelete] = useState<any>(null);

  // AI Wizard States
  const [aiGenerateOpen, setAiGenerateOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<WizardStep>('idea');
  const [aiLoading, setAiLoading] = useState(false);
  const [programIdea, setProgramIdea] = useState("");
  const [aiRecommendation, setAiRecommendation] = useState<{
    methodology: string;
    reasoning: string;
    confidence: number;
  } | null>(null);
  const [formData, setFormData] = useState<ProgramFormData>({
    name: '',
    description: '',
    methodology: '',
    strategic_objective: '',
    departments: '',
    total_budget: '',
    duration: '',
    status: 'planning',
    startDate: new Date().toISOString().split('T')[0],
  });

  // Reset wizard when dialog closes
  useEffect(() => {
    if (!aiGenerateOpen) {
      setWizardStep('idea');
      setProgramIdea("");
      setAiRecommendation(null);
      setFormData({
        name: '',
        description: '',
        methodology: '',
        strategic_objective: '',
        departments: '',
        total_budget: '',
        duration: '',
        status: 'planning',
        startDate: new Date().toISOString().split('T')[0],
      });
    }
  }, [aiGenerateOpen]);

  // Fetch programs
  const { data: programs = [], isLoading, error } = useQuery({
    queryKey: ["programs"],
    queryFn: fetchPrograms,
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: updateProgram,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["programs"] });
      toast.success(t.common.success);
      setEditDialogOpen(false);
      setProgramToEdit(null);
    },
    onError: () => {
      toast.error(t.common.error);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteProgram,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["programs"] });
      toast.success(t.common.success);
      setDeleteDialogOpen(false);
    },
    onError: () => {
      toast.error(t.common.error);
    },
  });

  // Edit Dialog States
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [programToEdit, setProgramToEdit] = useState<any>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    total_budget: "",
    strategic_objective: "",
  });

  // Create program mutation
  const createMutation = useMutation({
    mutationFn: createProgram,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["programs"] });
      toast.success(t.common.success);
      setAiGenerateOpen(false);
      navigate(`/programs/${data.id}`);
    },
    onError: () => {
      toast.error(t.common.error);
      setWizardStep('review');
    },
  });

  // Step 1: Analyze idea and recommend methodology
  const handleAnalyzeIdea = async () => {
    if (!programIdea.trim()) {
      toast.error(t.programs.programNameRequired);
      return;
    }

    setAiLoading(true);
    try {
      const prompt = `You are a program management expert. Analyze this program/initiative idea and recommend the best methodology.

Program Idea: "${programIdea}"

Choose from: SAFe (safe), MSP (msp), PMI Standard (pmi), PRINCE2 for Programmes (prince2_programme), or Hybrid (hybrid).

Respond in this EXACT JSON format only, no other text:
{
  "methodology": "safe|msp|pmi|prince2_programme|hybrid",
  "reasoning": "2-3 sentences explaining why this methodology is the best fit for this strategic initiative",
  "confidence": 85,
  "suggestedName": "A clear, professional program name",
  "suggestedDescription": "A 2-3 sentence program description",
  "suggestedObjective": "The main strategic objective",
  "suggestedDuration": "18",
  "suggestedBudget": 500000,
  "suggestedDepartments": "IT, Operations, Marketing"
}`;

      const response = await callAI(prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setAiRecommendation({
          methodology: parsed.methodology || 'hybrid',
          reasoning: parsed.reasoning || 'This methodology fits your program needs.',
          confidence: parsed.confidence || 80,
        });
        
        // Pre-fill form with AI suggestions
        setFormData(prev => ({
          ...prev,
          name: parsed.suggestedName || '',
          description: parsed.suggestedDescription || programIdea,
          methodology: parsed.methodology || 'hybrid',
          strategic_objective: parsed.suggestedObjective || '',
          duration: parsed.suggestedDuration?.toString().replace(/[^0-9]/g, '') || '18',
          total_budget: parsed.suggestedBudget?.toString() || '',
          departments: parsed.suggestedDepartments || '',
        }));
        
        setWizardStep('methodology');
      }
    } catch (error) {
      toast.error(t.common.error);
    } finally {
      setAiLoading(false);
    }
  };

  // Select methodology and go to details
  const handleSelectMethodology = (methodology: string) => {
    setFormData(prev => ({ ...prev, methodology }));
    setWizardStep('details');
  };

  // Go to review
  const handleGoToReview = () => {
    if (!formData.name.trim()) {
      toast.error(t.programs.programNameRequired);
      return;
    }
    setWizardStep('review');
  };

  // Create the program
  const handleCreateProgram = async () => {
    setWizardStep('creating');
    
    // Calculate end date based on duration
    const startDate = new Date(formData.startDate);
    const durationMonths = parseInt(formData.duration) || 18;
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + durationMonths);

    const programData = {
      name: formData.name,
      description: formData.description,
      methodology: formData.methodology,
      status: formData.status,
      strategic_objective: formData.strategic_objective,
      total_budget: parseFloat(formData.total_budget) || 0,
      start_date: formData.startDate,
      target_end_date: endDate.toISOString().split('T')[0],
    };

    createMutation.mutate(programData);
  };

  // Filter programs
  const filteredPrograms = useMemo(() => {
    const programList = Array.isArray(programs) ? programs : [];
    return programList.filter((program: any) => {
      const matchesSearch = program.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || program.status === statusFilter;
      const matchesMethodology = methodologyFilter === "all" || program.methodology === methodologyFilter;
      return matchesSearch && matchesStatus && matchesMethodology;
    });
  }, [programs, searchQuery, statusFilter, methodologyFilter]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const programList = Array.isArray(programs) ? programs : [];
    return {
      total: programList.length,
      active: programList.filter((p: any) => p.status === 'active').length,
      atRisk: programList.filter((p: any) => p.health_status === 'red' || p.health_status === 'amber').length,
      totalProjects: programList.reduce((acc: number, p: any) => acc + (p.project_count || 0), 0),
      totalBudget: programList.reduce((acc: number, p: any) => acc + (parseFloat(p.total_budget) || 0), 0),
    };
  }, [programs]);

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

  const formatCurrency = (amount: number) => formatBudgetDetailed(amount || 0, getCurrencyFromLanguage(language));

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleDelete = (program: any) => {
    setProgramToDelete(program);
    setDeleteDialogOpen(true);
  };

  const handleEdit = (program: any) => {
    setProgramToEdit(program);
    setEditFormData({
      name: program.name || "",
      description: program.description || "",
      total_budget: program.total_budget?.toString() || "",
      strategic_objective: program.strategic_objective || "",
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!programToEdit) return;
    updateMutation.mutate({
      id: programToEdit.id,
      data: {
        name: editFormData.name,
        description: editFormData.description,
        total_budget: parseFloat(editFormData.total_budget) || 0,
        strategic_objective: editFormData.strategic_objective,
      },
    });
  };

  // Render wizard step indicator
  const renderStepIndicator = () => {
    const steps = [
      { key: 'idea', label: t.programs.describeProgram, icon: Lightbulb },
      { key: 'methodology', label: t.programs.recommendedMethodology, icon: Target },
      { key: 'details', label: t.programs.programDetails, icon: FileText },
      { key: 'review', label: t.programs.review, icon: CheckCircle2 },
    ];

    const currentIndex = steps.findIndex(s => s.key === wizardStep);

    return (
      <div className="flex items-center justify-center mb-6">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = step.key === wizardStep;
          const isCompleted = index < currentIndex;
          const isCreating = wizardStep === 'creating';

          return (
            <div key={step.key} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all",
                  isActive && !isCreating ? "border-primary bg-primary text-primary-foreground" :
                  isCompleted || isCreating ? "border-green-500 bg-green-500 text-white" :
                  "border-muted-foreground/30 text-muted-foreground"
                )}>
                  {isCompleted || isCreating ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={cn(
                  "w-16 h-0.5 mx-2",
                  index < currentIndex || isCreating ? "bg-green-500" : "bg-muted-foreground/30"
                )} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-red-500">{t.common.error}</p>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["programs"] })}>
          {t.common.retry}
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Layers className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">{t.programs.title}</h1>
            <p className="text-muted-foreground">{t.programs.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* AI Generate Button */}
          <Dialog open={aiGenerateOpen} onOpenChange={setAiGenerateOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Sparkles className="h-4 w-4 text-purple-500" />
                {t.programs.generateWithAI}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  {t.programs.aiAssistant}
                </DialogTitle>
                <DialogDescription>
                  {t.programs.aiAssistantDesc}
                </DialogDescription>
              </DialogHeader>

              {renderStepIndicator()}

              {/* Step 1: Idea Input */}
              {wizardStep === 'idea' && (
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 flex items-center justify-center mx-auto mb-3">
                      <Lightbulb className="h-8 w-8 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold">{t.programs.describeProgram}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t.programs.describeProgramHint}
                    </p>
                  </div>

                  <Textarea
                    placeholder={t.programs.ideaPlaceholder}
                    value={programIdea}
                    onChange={(e) => setProgramIdea(e.target.value)}
                    rows={5}
                    className="resize-none"
                  />

                  <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    <Lightbulb className="h-4 w-4 mt-0.5 text-amber-500 flex-shrink-0" />
                    <p>{t.programs.ideaTip}</p>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleAnalyzeIdea} disabled={aiLoading || !programIdea.trim()} size="lg">
                      {aiLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {t.programs.analyzing}
                        </>
                      ) : (
                        <>
                          {t.programs.analyzeRecommend}
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Methodology Selection */}
              {wizardStep === 'methodology' && aiRecommendation && (
                <div className="space-y-4">
                  <div className="text-center mb-2">
                    <h3 className="text-lg font-semibold">{t.programs.recommendedMethodology}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t.programs.recommendationHint}
                    </p>
                  </div>

                  {/* AI Recommendation Card */}
                  <Card className={cn(
                    "border-2 cursor-pointer hover:shadow-md transition-all",
                    METHODOLOGY_CONFIG[aiRecommendation.methodology]?.borderColor || 'border-pink-200',
                    METHODOLOGY_CONFIG[aiRecommendation.methodology]?.bgColor || 'bg-pink-50'
                  )}
                  onClick={() => handleSelectMethodology(aiRecommendation.methodology)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          "p-3 rounded-xl",
                          METHODOLOGY_CONFIG[aiRecommendation.methodology]?.bgColor || 'bg-pink-100'
                        )}>
                          {(() => {
                            const config = METHODOLOGY_CONFIG[aiRecommendation.methodology] || METHODOLOGY_CONFIG.hybrid;
                            const Icon = config?.icon || GitMerge;
                            return <Icon className={cn("h-8 w-8", config?.color || "text-pink-600")} />;
                          })()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-lg">
                              {METHODOLOGY_CONFIG[aiRecommendation.methodology]?.label || 'Hybrid'}
                            </h4>
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              <Sparkles className="h-3 w-3 mr-1" />
                              {aiRecommendation.confidence}% {t.programs.match}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {METHODOLOGY_CONFIG[aiRecommendation.methodology]?.description}
                          </p>
                          <p className="text-sm">
                            {aiRecommendation.reasoning}
                          </p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        {t.programs.orChooseAnother}
                      </span>
                    </div>
                  </div>

                  {/* Other methodologies - FIXED: Added safety checks */}
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(METHODOLOGY_CONFIG)
                      .filter(([key]) => key !== aiRecommendation.methodology)
                      .map(([key, config]) => {
                        const Icon = config?.icon || GitMerge;
                        return (
                          <button
                            key={key}
                            onClick={() => handleSelectMethodology(key)}
                            className={cn(
                              "flex items-center gap-2 p-3 rounded-lg border text-left hover:border-primary hover:bg-accent transition-colors",
                              "bg-card"
                            )}
                          >
                            <div className={cn("p-1.5 rounded", config?.bgColor || "bg-pink-50")}>
                              <Icon className={cn("h-4 w-4", config?.color || "text-pink-600")} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm">{config?.label || "Unknown"}</p>
                              <p className="text-xs text-muted-foreground truncate">{config?.description || ""}</p>
                            </div>
                          </button>
                        );
                      })}
                  </div>

                  <div className="flex justify-start pt-2">
                    <Button variant="outline" onClick={() => setWizardStep('idea')}>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      {t.programs.back}
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Program Details Form */}
              {wizardStep === 'details' && (
                <div className="space-y-4">
                  <div className="text-center mb-2">
                    <h3 className="text-lg font-semibold">{t.programs.programDetails}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t.programs.reviewDetails}
                    </p>
                  </div>

                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">{t.programs.programName} *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder={t.programs.programName}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="description">{t.programs.description}</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder={t.programs.description}
                        rows={3}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="strategic_objective" className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-muted-foreground" />
                        {t.programs.strategicObjective}
                      </Label>
                      <Textarea
                        id="strategic_objective"
                        value={formData.strategic_objective}
                        onChange={(e) => setFormData(prev => ({ ...prev, strategic_objective: e.target.value }))}
                        placeholder={t.programs.strategicObjective}
                        rows={2}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="departments" className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          {t.programs.departments}
                        </Label>
                        <Input
                          id="departments"
                          value={formData.departments}
                          onChange={(e) => setFormData(prev => ({ ...prev, departments: e.target.value }))}
                          placeholder={t.programs.departmentsPlaceholder}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="total_budget" className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          {t.programs.budget}
                        </Label>
                        <Input
                          id="total_budget"
                          type="number"
                          value={formData.total_budget}
                          onChange={(e) => setFormData(prev => ({ ...prev, total_budget: e.target.value }))}
                          placeholder={t.programs.budgetPlaceholder}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="duration" className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {t.programs.duration}
                        </Label>
                        <Input
                          id="duration"
                          type="number"
                          value={formData.duration}
                          onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                          placeholder={t.programs.durationPlaceholder}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="startDate" className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {t.programs.startDate}
                        </Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between pt-2">
                    <Button variant="outline" onClick={() => setWizardStep('methodology')}>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      {t.programs.back}
                    </Button>
                    <Button onClick={handleGoToReview}>
                      {t.programs.review}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Review - FIXED: Added safety checks */}
              {wizardStep === 'review' && (
                <div className="space-y-4">
                  <div className="text-center mb-2">
                    <h3 className="text-lg font-semibold">{t.programs.reviewProgram}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t.programs.reviewHint}
                    </p>
                  </div>

                  <Card>
                    <CardContent className="p-4 space-y-4">
                      {/* Program Header */}
                      <div className="flex items-start gap-3">
                        {(() => {
                          const config = METHODOLOGY_CONFIG[formData.methodology] || METHODOLOGY_CONFIG.hybrid;
                          const Icon = config?.icon || GitMerge;
                          return (
                            <div className={cn("p-2 rounded-lg", config?.bgColor || "bg-pink-50")}>
                              <Icon className={cn("h-6 w-6", config?.color || "text-pink-600")} />
                            </div>
                          );
                        })()}
                        <div>
                          <h4 className="font-bold text-lg">{formData.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">
                              {METHODOLOGY_CONFIG[formData.methodology]?.label || formData.methodology}
                            </Badge>
                            <Badge className="bg-blue-100 text-blue-800">
                              {t.programs.planning}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {formData.description && (
                        <p className="text-sm text-muted-foreground">{formData.description}</p>
                      )}

                      {formData.strategic_objective && (
                        <div className="pt-2 border-t">
                          <div className="flex items-center gap-2 mb-1">
                            <Target className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{t.programs.strategicObjective}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{formData.strategic_objective}</p>
                        </div>
                      )}

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                        {formData.departments && (
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{formData.departments}</span>
                          </div>
                        )}
                        {formData.total_budget && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{formatCurrency(parseInt(formData.total_budget))}</span>
                          </div>
                        )}
                        {formData.duration && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{formData.duration} {t.programs.months}</span>
                          </div>
                        )}
                        {formData.startDate && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{formatDate(formData.startDate)}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex justify-between pt-2">
                    <Button variant="outline" onClick={() => setWizardStep('details')}>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      {t.common.edit}
                    </Button>
                    <Button onClick={handleCreateProgram} size="lg" className="gap-2">
                      <Sparkles className="h-4 w-4" />
                      {t.programs.createProgram}
                    </Button>
                  </div>
                </div>
              )}

              {/* Creating State */}
              {wizardStep === 'creating' && (
                <div className="py-12 text-center">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{t.programs.creatingProgram}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t.programs.settingUp}
                  </p>
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mt-4 text-primary" />
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* New Program Button */}
          <Button onClick={() => navigate('/programs/new')} className="gap-2">
            <Plus className="h-4 w-4" />
            {t.programs.newProgram}
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.programs.totalPrograms}</p>
                <p className="text-2xl font-bold">{metrics.total}</p>
              </div>
              <Layers className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.programs.active}</p>
                <p className="text-2xl font-bold text-green-600">{metrics.active}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.programs.atRisk}</p>
                <p className="text-2xl font-bold text-amber-600">{metrics.atRisk}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.programs.totalProjects}</p>
                <p className="text-2xl font-bold">{metrics.totalProjects}</p>
              </div>
              <FolderKanban className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.programs.totalBudget}</p>
                <p className="text-2xl font-bold">{formatCurrency(metrics.totalBudget)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t.programs.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder={t.programs.allStatus} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.programs.allStatus}</SelectItem>
            <SelectItem value="planning">{t.programs.planning}</SelectItem>
            <SelectItem value="active">{t.programs.active}</SelectItem>
            <SelectItem value="on_hold">{t.app.onHold}</SelectItem>
            <SelectItem value="completed">{t.programs.completed}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={methodologyFilter} onValueChange={setMethodologyFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder={t.programs.allMethods} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.programs.allMethods}</SelectItem>
            <SelectItem value="safe">SAFe</SelectItem>
            <SelectItem value="msp">MSP</SelectItem>
            <SelectItem value="pmi">PMI</SelectItem>
            <SelectItem value="prince2_programme">PRINCE2</SelectItem>
            <SelectItem value="hybrid">Hybrid</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center border rounded-lg">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="rounded-r-none"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="rounded-l-none"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Programs Grid/List */}
      {filteredPrograms.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-8 text-center">
            <Layers className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t.programs.noPrograms}</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? t.common.search : t.programs.createNewProgram}
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => setAiGenerateOpen(true)}>
                <Sparkles className="h-4 w-4 mr-2" />
                {t.programs.aiAssistant}
              </Button>
              <Button onClick={() => navigate('/programs/new')}>
                <Plus className="h-4 w-4 mr-2" />
                {t.programs.newProgram}
              </Button>
            </div>
          </Card>
          
          {/* Create New Program Card */}
          <Card 
            className="border-dashed cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => navigate('/programs/new')}
          >
            <CardContent className="p-8 text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{t.programs.createNewProgram}</h3>
              <p className="text-muted-foreground mb-4">
                {t.programs.createDescription}
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t.programs.newProgram}
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className={cn(
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
            : "space-y-3"
        )}>
          {filteredPrograms.map((program: any) => {
            const methodologyConfig = METHODOLOGY_CONFIG[program.methodology] || METHODOLOGY_CONFIG.hybrid;
            const Icon = methodologyConfig?.icon || GitMerge;
            
            return (
              <Card key={program.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn("p-1.5 rounded", methodologyConfig?.bgColor || "bg-pink-50")}>
                        <Icon className={cn("h-4 w-4", methodologyConfig?.color || "text-pink-600")} />
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {methodologyConfig?.label || "Unknown"}
                      </Badge>
                      <Badge className={cn("text-xs", getStatusColor(program.status))}>
                        {program.status?.replace('_', ' ')}
                      </Badge>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/programs/${program.id}`)}>
                          <Eye className="h-4 w-4 mr-2" />
                          {t.programs.view}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(program)}>
                          <Edit className="h-4 w-4 mr-2" />
                          {t.programs.edit}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(program)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {t.programs.delete}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardTitle 
                    className="text-lg mt-2 cursor-pointer hover:text-primary"
                    onClick={() => navigate(`/programs/${program.id}`)}
                  >
                    {program.name}
                  </CardTitle>
                  {program.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {program.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t.app.progress}</span>
                      <span>{program.progress || 0}%</span>
                    </div>
                    <Progress value={program.progress || 0} className="h-2" />
                    
                    <div className="grid grid-cols-3 gap-2 pt-2">
                      <div className="text-center">
                        <p className="text-lg font-semibold">{program.project_count || 0}</p>
                        <p className="text-xs text-muted-foreground">{t.programs.projects}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold">
                          {program.spent_budget ? Math.round((program.spent_budget / 1000)) : 0}k
                        </p>
                        <p className="text-xs text-muted-foreground">{t.programs.spent}</p>
                      </div>
                      <div className="text-center">
                        <CheckCircle2 className={cn(
                          "h-5 w-5 mx-auto",
                          getHealthColor(program.health_status)
                        )} />
                        <p className="text-xs text-muted-foreground">{t.programs.health}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {program.program_manager_name || t.programs.unassigned}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(program.target_end_date)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          
          {/* Create New Program Card */}
          <Card 
            className="border-dashed cursor-pointer hover:border-primary/50 transition-colors min-h-[200px] flex items-center justify-center"
            onClick={() => navigate('/programs/new')}
          >
            <CardContent className="p-6 text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">{t.programs.createNewProgram}</h3>
              <p className="text-sm text-muted-foreground mb-3">
                {t.programs.createDescription}
              </p>
              <div className="flex gap-2 justify-center">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setAiGenerateOpen(true);
                  }}
                >
                  <Sparkles className="h-4 w-4 mr-1" />
                  {t.programs.aiAssistant}
                </Button>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  {t.programs.manual}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.programs.delete}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.programs.deleteConfirm} "{programToDelete?.name}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.programs.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => programToDelete && deleteMutation.mutate(programToDelete.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t.programs.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Program Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t.programs.editProgram}</DialogTitle>
            <DialogDescription>
              {t.programs.updateDetails}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">{t.programs.programName}</Label>
              <Input
                id="edit-name"
                value={editFormData.name}
                onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">{t.programs.description}</Label>
              <Textarea
                id="edit-description"
                value={editFormData.description}
                onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-budget">{t.programs.budget}</Label>
              <Input
                id="edit-budget"
                type="number"
                value={editFormData.total_budget}
                onChange={(e) => setEditFormData(prev => ({ ...prev, total_budget: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-objective">{t.programs.strategicObjective}</Label>
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
              {t.common.cancel}
            </Button>
            <Button onClick={handleSaveEdit} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? t.programs.saving : t.programs.saveChanges}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProgramsOverview;