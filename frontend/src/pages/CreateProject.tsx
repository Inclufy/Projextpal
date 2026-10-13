import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsApi } from "@/lib/api";
import MultiFileDropzone from "@/components/MultiFileDropzone";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  FolderKanban,
  Zap,
  Crown,
  BarChart3,
  GitMerge,
  Loader2,
  Sparkles,
  Wand2,
  MessageSquare,
  Lightbulb,
  RefreshCw,
  Repeat,
  Target,
  Workflow,
  Kanban,
  Droplets,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { MethodologyOnboardingWizard } from '@/components/MethodologyOnboardingWizard';
import { usePageTranslations } from '@/hooks/usePageTranslations';
import { aiFetch } from "@/lib/aiFetch";

// Types
type ProjectMethodology = 'inclufy' | 'prince2' | 'agile' | 'scrum' | 'kanban' | 'waterfall' | 'lean_six_sigma_green' | 'lean_six_sigma_black' | 'hybrid';

interface MethodologyOption {
  id: ProjectMethodology;
  name: string;
  shortName: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  recommended?: boolean;
}

// AI Helper function
const callAI = async (prompt: string): Promise<string> => {
  const token = localStorage.getItem("access_token");
  try {
    const response = await aiFetch("/api/v1/governance/ai/generate/", {
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

const CreateProject = () => {
  const { pt } = usePageTranslations();

  const METHODOLOGIES: MethodologyOption[] = [
    {
      id: 'inclufy',
      name: 'Inclufy Best Practices',
      shortName: 'Inclufy Best Practices',
      description: pt('Our curated, opinionated default — the proven best-of-all-methodologies blend, recommended for most teams.'),
      icon: <Sparkles className="h-6 w-6" />,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-500',
      recommended: true,
    },
    {
      id: 'prince2',
      name: 'PRINCE2',
      shortName: 'PRINCE2',
      description: pt('PRINCE2 desc'),
      icon: <Crown className="h-6 w-6" />,
      color: 'text-amber-600',
      bgColor: 'bg-amber-500',
    },
    {
      id: 'agile',
      name: 'Agile',
      shortName: 'Agile',
      description: pt('Agile desc'),
      icon: <Zap className="h-6 w-6" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-500',
    },
    {
      id: 'scrum',
      name: 'Scrum',
      shortName: 'Scrum',
      description: pt('Scrum desc'),
      icon: <Repeat className="h-6 w-6" />,
      color: 'text-green-600',
      bgColor: 'bg-green-500',
    },
    {
      id: 'kanban',
      name: 'Kanban',
      shortName: 'Kanban',
      description: pt('Kanban desc'),
      icon: <Kanban className="h-6 w-6" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-500',
    },
    {
      id: 'waterfall',
      name: 'Waterfall',
      shortName: 'Waterfall',
      description: pt('Waterfall desc'),
      icon: <Droplets className="h-6 w-6" />,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-500',
    },
    {
      id: 'lean_six_sigma_green',
      name: 'Lean Six Sigma (Green Belt)',
      shortName: 'LSS Green',
      description: pt('LSS Green desc'),
      icon: <Award className="h-6 w-6" />,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-500',
    },
    {
      id: 'lean_six_sigma_black',
      name: 'Lean Six Sigma (Black Belt)',
      shortName: 'LSS Black',
      description: pt('LSS Black desc'),
      icon: <Award className="h-6 w-6" />,
      color: 'text-gray-800',
      bgColor: 'bg-gray-800',
    },
    {
      id: 'hybrid',
      name: 'Hybrid',
      shortName: 'Hybrid',
      description: pt('Hybrid desc'),
      icon: <GitMerge className="h-6 w-6" />,
      color: 'text-pink-600',
      bgColor: 'bg-pink-500',
    },
  ];

  const STEPS = [
    { id: 1, title: pt('Methodology'), description: pt('Select framework') },
    { id: 2, title: pt('Documents'), description: pt('Upload briefs or tenders (optional)') },
    { id: 3, title: pt('Details'), description: pt('Project information') },
    { id: 4, title: pt('Review'), description: pt('Confirm & create') },
  ];

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);

  // Entry point via "Generate with AI" / "AI Assistant" buttons on the
  // Projects overview: /projects/new?ai=1 auto-opens the AI Methodology
  // Advisor so the two flows (modal + wizard) are a single UX.
  useEffect(() => {
    if (searchParams.get("ai") === "1") {
      setAiAdvisorOpen(true);
      // Strip the param so a refresh doesn't re-open the dialog on top of
      // existing state.
      const next = new URLSearchParams(searchParams);
      next.delete("ai");
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // AI States
  const [aiAdvisorOpen, setAiAdvisorOpen] = useState(false);
  const [aiGenerateOpen, setAiGenerateOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<{
    methodology: ProjectMethodology;
    reasoning: string;
    confidence: number;
  } | null>(null);
  const [generatePrompt, setGeneratePrompt] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(false);
  // Tailoring intake captured from the AI advisor, persisted after project creation.
  const [intake, setIntake] = useState<{ project_type: string; dimensions: Record<string, number>; rationale: string } | null>(null);
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [showMethodologies, setShowMethodologies] = useState(false);
  const [showAdvancedDetails, setShowAdvancedDetails] = useState(false);

  // Document-driven onboarding (nieuwe wizard-stap 2). Elisa uploadt tender-
  // PDF's → endpoint destilleert naam/beschrijving/milestones → we pre-fillen
  // Details en bewaren de voorgestelde milestones voor na project-creatie.
  const [docFiles, setDocFiles] = useState<File[]>([]);
  const [docHint, setDocHint] = useState("");
  const [docExtracting, setDocExtracting] = useState(false);
  const [docResult, setDocResult] = useState<null | {
    name: string;
    description: string;
    scope_in: string;
    scope_out: string;
    deliverables: string[];
    suggested_milestones: Array<{ name: string; description: string; due_offset_weeks: number }>;
    // Sprint 2 S2-03/S2-04: methodology suggestion from the LLM, only present
    // when source === "ai". null when the LLM path did not run.
    suggested_methodology?: ProjectMethodology | null;
    methodology_confidence?: number;
    methodology_reason?: string;
    extracted_pages: number;
    extracted_text_preview: string;
    source: string;
    skipped: Array<{ name: string; reason: string }>;
  }>(null);
  // S2-02: avoid auto-running the AI advisor more than once per docResult.
  const [autoAdvisorDone, setAutoAdvisorDone] = useState(false);
  // Hergebruik de uploads als persistente AI-context voor élke downstream
  // AI-call op dit project (Plan with AI, Ask Co-pilot, risk-forecast…).
  // Default aan: als Elisa de moeite neemt om tenders te uploaden, wil ze
  // zelden alleen de wizard-stap pre-fillen en de context daarna wegduwen.
  const [useDocsAsContext, setUseDocsAsContext] = useState(true);

  // Form state
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);

  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch("/api/v1/governance/portfolios/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setPortfolios(data.results || data || []);
      } catch (e) { console.error("Failed to fetch portfolios:", e); }
    };
    const fetchPrograms = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch("/api/v1/programs/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setPrograms(data.results || data || []);
      } catch (e) { console.error("Failed to fetch programs:", e); }
    };
    fetchPortfolios();
    fetchPrograms();
  }, []);

  const [formData, setFormData] = useState({
    methodology: '' as ProjectMethodology | '',
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    budget: '',
    currency: 'EUR',
    objectives: '',
    priority: 'medium',
    portfolio: '',
    program: '',
  });

  // Onboarding useEffect - trigger wanneer methodology verandert
  useEffect(() => {
    if (formData.methodology) {
      const hasSeenOnboarding = localStorage.getItem(`onboarding_${formData.methodology}_completed`);
      const hasSkippedOnboarding = localStorage.getItem(`onboarding_${formData.methodology}_skipped`);
      if (!hasSeenOnboarding && !hasSkippedOnboarding) {
        setShowOnboarding(true);
      }
    }
  }, [formData.methodology]);

  const selectedMethodology = METHODOLOGIES.find(m => m.id === formData.methodology);

  // Persist the tailoring captured at intake onto the freshly-created project.
  const persistTailoring = async (projectId: number | string) => {
    if (!intake || !projectId) return;
    try {
      const token = localStorage.getItem("access_token");
      await fetch(`/api/v1/projects/${projectId}/tailoring/`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          project_type: intake.project_type,
          dim_scope: intake.dimensions.scope, dim_budget: intake.dimensions.budget,
          dim_duur: intake.dimensions.duur, dim_politiek: intake.dimensions.politiek,
          dim_risico: intake.dimensions.risico, dim_regel: intake.dimensions.regel,
          ai_rationale: intake.rationale, source: "ai",
        }),
      });
    } catch { /* tailoring is additive — never block project creation */ }
  };

  const persistAIContext = async (projectId: number | undefined) => {
    if (!projectId || !docResult || !useDocsAsContext) return;
    try {
      const token = localStorage.getItem("access_token");
      await fetch(`/api/v1/projects/${projectId}/ai-context/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          enabled: true,
          extracted_text: docResult.extracted_text_preview,
          source_files: docFiles.map((f) => ({ name: f.name, size: f.size, pages: 0 })),
        }),
      });
    } catch {
      /* AI context is additive — never block project creation */
    }
  };

  // Create project mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => projectsApi.create(data),
    onSuccess: async (created: any) => {
      const newId = created?.id ?? created?.data?.id;
      await persistTailoring(newId);
      await persistAIContext(newId);
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success(pt("Project created successfully!"));
      navigate(newId ? `/projects/${newId}/tailoring` : "/projects");
    },
    onError: (error: any) => {
      console.error("Create project error:", error);
      toast.error(error?.message || pt("Failed to create project"));
    },
  });

  // AI Methodology Advisor
  const handleAIAdvisor = async () => {
    if (!aiPrompt.trim()) {
      toast.error(pt("Please describe your project first"));
      return;
    }

    setAiLoading(true);
    try {
      // Use the tailoring engine (deterministic + optional LLM) so the advice is
      // consistent with the project's tailoring and also yields the dimensions.
      const token = localStorage.getItem("access_token");
      const res = await fetch(`/api/v1/projects/intake/analyze/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ description: aiPrompt }),
      });
      const d = await res.json();
      if (res.ok && d.methodology) {
        const confMap: Record<string, number> = { hoog: 90, gemiddeld: 70, laag: 55 };
        setAiRecommendation({
          methodology: d.methodology as ProjectMethodology,
          reasoning: `${d.rationale} (voorgestelde vorm: ${d.preview?.shape || "—"})`,
          confidence: confMap[d.methodology_confidence] || 75,
        });
        setIntake({ project_type: d.project_type, dimensions: d.dimensions, rationale: d.rationale });
      } else {
        throw new Error("no result");
      }
    } catch (error) {
      toast.error(pt("AI advisor temporarily unavailable. Please select manually."));
    } finally {
      setAiLoading(false);
    }
  };

  // Sprint 2 S2-02: when the user arrived at step 1 after extracting documents
  // (common flow: Methodology → Documents → user hits Back → Methodology again,
  // or the aanbesteding-scenario entrypoint that bootstraps a doc result), auto
  // pre-fill the AI Methodology Advisor with the extracted description and run
  // it once so the user sees a doc-grounded suggestion without typing. We gate
  // on autoAdvisorDone so the user can later Try-Again manually without the
  // effect clobbering their edit.
  useEffect(() => {
    if (
      currentStep === 1 &&
      docResult &&
      !autoAdvisorDone &&
      !aiLoading &&
      !aiRecommendation &&
      !aiPrompt.trim() &&
      (docResult.description || docResult.extracted_text_preview)
    ) {
      const seed = (docResult.description || docResult.extracted_text_preview || "").slice(0, 1200);
      setAiPrompt(seed);
      setAutoAdvisorDone(true);
      // Delay slightly so React commits the aiPrompt before the advisor reads it.
      setTimeout(() => { handleAIAdvisor(); }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, docResult, autoAdvisorDone]);

  // Load scenario presets for the quick-start picker.
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    fetch(`/api/v1/projects/intake/scenarios/`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => d?.scenarios && setScenarios(d.scenarios))
      .catch(() => {});
  }, []);

  const applyScenario = (s: any) => {
    setSelectedScenario(s.key);
    setFormData((prev) => ({ ...prev, methodology: s.methodology as ProjectMethodology }));
    setIntake({ project_type: s.project_type, dimensions: s.dimensions, rationale: `Scenario: ${s.title}` });
    setShowMethodologies(false);   // scenario chosen → collapse the manual grid
  };

  const applyAIRecommendation = () => {
    if (aiRecommendation) {
      setFormData(prev => ({ ...prev, methodology: aiRecommendation.methodology }));
      setAiAdvisorOpen(false);
      toast.success(`Applied ${METHODOLOGIES.find(m => m.id === aiRecommendation.methodology)?.shortName} methodology`);
    }
  };

  // AI Generate Project Details
  const handleAIGenerate = async () => {
    if (!generatePrompt.trim()) {
      toast.error(pt("Please describe what you want to create"));
      return;
    }

    setAiLoading(true);
    try {
      const prompt = `You are a project management expert. Generate project details based on this description:

"${generatePrompt}"

Respond in this exact JSON format:
{
  "name": "Project name (concise, professional)",
  "description": "2-3 sentence description of the project scope and deliverables",
  "objectives": "Key objectives and success criteria",
  "methodology": "prince2|agile|scrum|kanban|waterfall|lean_six_sigma_green|lean_six_sigma_black|hybrid",
  "durationWeeks": 12,
  "estimatedBudget": 50000,
  "priority": "low|medium|high|critical"
}

Be specific and professional. Use the context to determine appropriate methodology, timeline, and budget.`;

      const response = await callAI(prompt);
      
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + ((parsed.durationWeeks || 12) * 7));
        
        setFormData(prev => ({
          ...prev,
          name: parsed.name || prev.name,
          description: parsed.description || prev.description,
          objectives: parsed.objectives || prev.objectives,
          methodology: parsed.methodology || prev.methodology,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          budget: parsed.estimatedBudget?.toString() || prev.budget,
          priority: parsed.priority || prev.priority,
        }));
        
        setAiGenerateOpen(false);
        toast.success(pt("Project details generated! Review and adjust as needed."));
      }
    } catch (error) {
      toast.error(pt("AI generation temporarily unavailable"));
    } finally {
      setAiLoading(false);
    }
  };

  const handleGenerateDescription = async () => {
    if (!formData.name) {
      toast.error(pt("Please enter a project name first"));
      return;
    }

    setAiLoading(true);
    try {
      const prompt = `Generate a professional 2-3 sentence project description for a project called "${formData.name}". 
      ${formData.methodology ? `The project uses ${formData.methodology} methodology.` : ''}
      Be concise and focus on scope and deliverables. Return only the description text, no JSON.`;

      const response = await callAI(prompt);
      setFormData(prev => ({ ...prev, description: response.trim() }));
      toast.success(pt("Description generated!"));
    } catch (error) {
      toast.error(pt("Could not generate description"));
    } finally {
      setAiLoading(false);
    }
  };

  const handleGenerateObjectives = async () => {
    if (!formData.name && !formData.description) {
      toast.error(pt("Please enter a project name or description first"));
      return;
    }

    setAiLoading(true);
    try {
      const prompt = `Generate project objectives for this project:
      Name: ${formData.name}
      Description: ${formData.description}
      
      Return 3-4 clear, measurable objectives. Return only the objectives text, no JSON.`;

      const response = await callAI(prompt);
      setFormData(prev => ({ ...prev, objectives: response.trim() }));
      toast.success(pt("Objectives generated!"));
    } catch (error) {
      toast.error(pt("Could not generate objectives"));
    } finally {
      setAiLoading(false);
    }
  };

  const handleMethodologySelect = (methodologyId: ProjectMethodology) => {
    setFormData(prev => ({ ...prev, methodology: methodologyId }));
    setSelectedScenario(null);   // manual pick → not from a scenario
    setIntake(null);             // no scenario tailoring captured
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!formData.methodology;
      case 2:
        return true;                                        // documents are optional
      case 3:
        return formData.name && formData.startDate && formData.endDate;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const extractFromDocuments = async () => {
    if (docFiles.length === 0 || docExtracting) return;
    setDocExtracting(true);
    try {
      const token = localStorage.getItem("access_token");
      const fd = new FormData();
      docFiles.forEach((f) => fd.append("files", f));
      if (docHint.trim()) fd.append("hint", docHint.trim());
      const lang = (localStorage.getItem("language") || "nl").toLowerCase();
      const r = await fetch("/api/v1/projects/plan-from-documents/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-UI-Language": lang,
        },
        body: fd,
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) {
        toast.error(d.detail || pt("Could not extract from documents"));
        return;
      }
      setDocResult(d);
      // Pre-fill the Details form from the extracted project draft so the
      // user only has to adjust, not type.
      setFormData((prev) => ({
        ...prev,
        name: prev.name || d.name || "",
        description: prev.description || d.description || "",
        objectives: prev.objectives || [d.scope_in, d.scope_out]
          .filter(Boolean)
          .map((s: string, i: number) => (i === 0 ? `In scope: ${s}` : `Out of scope: ${s}`))
          .join("\n") || "",
      }));
      toast.success(
        d.source === "fallback"
          ? pt("Draft prepared from documents (template — AI unavailable)")
          : pt("Draft prepared from documents")
      );
    } catch {
      toast.error(pt("Could not extract from documents"));
    } finally {
      setDocExtracting(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    const payload: any = {
      portfolio: formData.portfolio || null,
      program: formData.program || null,
      name: formData.name,
      description: formData.description || "",
      methodology: formData.methodology,
      status: "planning",
      start_date: formData.startDate,
      end_date: formData.endDate,
    };

    if (formData.budget) {
      payload.budget = parseFloat(formData.budget);
    }

    payload.currency = formData.currency;

    // `objectives` has no dedicated Project column — map onto project_goal so it is not silently dropped.
    if (formData.objectives) {
      payload.project_goal = formData.objectives;
    }

    createMutation.mutate(payload);
  };

  return (
    <div className="min-h-full bg-background">
      <div className="max-w-6xl mx-auto p-6 lg:px-10">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate('/projects')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {pt("Back to Projects")}
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <FolderKanban className="h-8 w-8 text-primary" />
                {pt("Create New Project")}
              </h1>
              <p className="text-muted-foreground mt-1">
                {pt("Set up a new project with the right methodology")}
              </p>
            </div>
            
            <Dialog open={aiGenerateOpen} onOpenChange={setAiGenerateOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  {pt("Generate with AI")}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-500" />
                    {pt("Generate Project with AI")}
                  </DialogTitle>
                  <DialogDescription>
                    {pt("Describe your project and AI will generate all the details for you.")}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Textarea
                    placeholder={pt("Example: Build a new customer portal with user authentication, dashboard, and reporting features. The team has 5 developers and we need to deliver in 3 months.")}
                    value={generatePrompt}
                    onChange={(e) => setGeneratePrompt(e.target.value)}
                    rows={5}
                  />
                  <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    <Lightbulb className="h-4 w-4 mt-0.5 text-amber-500" />
                    <p>{pt("Tip: Include details about team size, timeline, deliverables, and any constraints for better results.")}</p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAiGenerateOpen(false)}>
                    {pt("Cancel")}
                  </Button>
                  <Button onClick={handleAIGenerate} disabled={aiLoading || !generatePrompt.trim()}>
                    {aiLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {pt("Generating...")}
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4 mr-2" />
                        {pt("Generate")}
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors",
                      currentStep > step.id
                        ? "bg-primary text-primary-foreground"
                        : currentStep === step.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {currentStep > step.id ? <Check className="h-5 w-5" /> : step.id}
                  </div>
                  <div className="mt-2 text-center">
                    <p className={cn(
                      "text-sm font-medium",
                      currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {step.title}
                    </p>
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "h-0.5 w-24 mx-4",
                      currentStep > step.id ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="mb-6">
          <CardContent className="p-6">
            {/* Step 1: Methodology Selection */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="text-center flex-1">
                    <h2 className="text-xl font-semibold mb-2">{pt("Choose Your Methodology")}</h2>
                    <p className="text-muted-foreground">
                      {pt("Select the project management methodology that best fits your project needs")}
                    </p>
                  </div>
                  
                  <Dialog open={aiAdvisorOpen} onOpenChange={setAiAdvisorOpen}>
                    <DialogTrigger asChild>
                      <Button variant="secondary" className="gap-2">
                        <MessageSquare className="h-4 w-4 text-purple-500" />
                        {pt("AI Advisor")}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-purple-500" />
                          {pt("AI Methodology Advisor")}
                        </DialogTitle>
                        <DialogDescription>
                          {pt("Describe your project and AI will recommend the best methodology.")}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <Textarea
                          placeholder={pt("Example: We're building a mobile app for internal use. Team of 4 developers, 2 month timeline, requirements may change based on user feedback...")}
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          rows={4}
                        />
                        
                        {aiRecommendation && (
                          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-200 dark:border-purple-800">
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div className={cn(
                                  "p-2 rounded-lg",
                                  METHODOLOGIES.find(m => m.id === aiRecommendation.methodology)?.bgColor + "/20"
                                )}>
                                  {METHODOLOGIES.find(m => m.id === aiRecommendation.methodology)?.icon}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold">
                                      {METHODOLOGIES.find(m => m.id === aiRecommendation.methodology)?.name}
                                    </span>
                                    <Badge variant="secondary" className="text-xs">
                                      {aiRecommendation.confidence}% match
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {aiRecommendation.reasoning}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                      <DialogFooter>
                        {aiRecommendation ? (
                          <>
                            <Button variant="outline" onClick={() => {
                              setAiRecommendation(null);
                              setAiPrompt("");
                            }}>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              {pt("Try Again")}
                            </Button>
                            <Button onClick={applyAIRecommendation}>
                              <Check className="h-4 w-4 mr-2" />
                              {pt("Apply Recommendation")}
                            </Button>
                          </>
                        ) : (
                          <Button onClick={handleAIAdvisor} disabled={aiLoading || !aiPrompt.trim()}>
                            {aiLoading ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                {pt("Analyzing...")}
                              </>
                            ) : (
                              <>
                                <Sparkles className="h-4 w-4 mr-2" />
                                {pt("Get Recommendation")}
                              </>
                            )}
                          </Button>
                        )}
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Primary path: pick a recognisable scenario → sets methodology + tailoring */}
                {scenarios.length > 0 && (
                  <div className="rounded-xl border bg-muted/30 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold">{pt("Begin met een scenario")}</span>
                      <span className="text-xs text-muted-foreground">{pt("één klik zet de methodiek + de juiste governance — meest gekozen")}</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-72 overflow-y-auto pr-1">
                      {scenarios.map((s) => (
                        <button
                          key={s.key}
                          type="button"
                          onClick={() => applyScenario(s)}
                          className={cn(
                            "text-left rounded-lg border p-3 transition hover:border-primary hover:shadow-sm bg-background",
                            selectedScenario === s.key ? "ring-2 ring-primary border-primary" : "border-border"
                          )}
                        >
                          <div className="text-[13px] font-semibold leading-tight mb-1">{s.title}</div>
                          <div className="text-[11px] text-muted-foreground line-clamp-2 mb-2">{s.desc}</div>
                          <div className="flex flex-wrap gap-1">
                            {(s.tags || []).map((t: string) => (
                              <span key={t} className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">{t}</span>
                            ))}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Confirmation of what was chosen */}
                {selectedMethodology && (
                  <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span>Gekozen: <b>{selectedMethodology.shortName}</b>{selectedScenario ? " — via scenario" : ""}. Klik <b>{pt("Next")}</b> om door te gaan.</span>
                    {!showMethodologies && (
                      <button type="button" onClick={() => setShowMethodologies(true)} className="ml-auto text-xs font-semibold text-primary hover:underline whitespace-nowrap">methodiek wijzigen</button>
                    )}
                  </div>
                )}

                {/* Secondary path: pick a methodology manually */}
                {scenarios.length > 0 && !showMethodologies && (
                  <button type="button" onClick={() => setShowMethodologies(true)}
                    className="text-sm font-semibold text-primary hover:underline">
                    {pt("Of kies zelf een methodiek")} →
                  </button>
                )}

                {(showMethodologies || scenarios.length === 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {METHODOLOGIES.map((methodology) => (
                    <Card
                      key={methodology.id}
                      className={cn(
                        "cursor-pointer transition-all hover:shadow-md flex flex-col h-full",
                        formData.methodology === methodology.id
                          ? "ring-2 ring-primary border-primary"
                          : "hover:border-primary/50"
                      )}
                      onClick={() => handleMethodologySelect(methodology.id)}
                    >
                      <CardHeader className="pb-2 pt-5 px-5">
                        <div className="flex items-start justify-between">
                          <div className={cn(
                            "p-2.5 rounded-lg",
                            methodology.bgColor + "/10"
                          )}>
                            <div className={methodology.color}>
                              {methodology.icon}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {methodology.recommended && (
                              <Badge className="bg-indigo-500 text-white text-[10px] px-1.5 py-0.5">
                                {pt("Recommended")}
                              </Badge>
                            )}
                            {formData.methodology === methodology.id && (
                              <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                                <Check className="h-3 w-3 text-primary-foreground" />
                              </div>
                            )}
                          </div>
                        </div>
                        <CardTitle className="text-lg mt-3">{methodology.shortName}</CardTitle>
                      </CardHeader>
                      <CardContent className="px-5 pb-5 flex-1">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {methodology.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                )}
              </div>
            )}

            {/* Step 2: Documents — optional pre-fill from tender/brief PDFs */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-1">{pt('Documents')}</h2>
                  <p className="text-sm text-muted-foreground">
                    {pt('Drop tender documents, briefs or specs here. The AI extracts a project draft (name, scope, milestones) you review on the next step.')}
                  </p>
                </div>

                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <MultiFileDropzone
                      files={docFiles}
                      onFilesChange={setDocFiles}
                      accept=".pdf,.txt,.md,.csv"
                      description={pt('PDF, TXT, MD or CSV — up to 10 files, 15 MB each.')}
                      disabled={docExtracting}
                    />

                    <div className="space-y-1.5">
                      <Label htmlFor="doc-hint">{pt('Hint (optional)')}</Label>
                      <Textarea
                        id="doc-hint"
                        rows={2}
                        placeholder={pt('e.g. "Focus on gemeente Heerenveen scope, Wmo tracks only"')}
                        value={docHint}
                        onChange={(e) => setDocHint(e.target.value)}
                        disabled={docExtracting}
                      />
                    </div>

                    <div className="flex justify-between items-center">
                      <p className="text-xs text-muted-foreground">
                        {docFiles.length === 0
                          ? pt('Skip this step if you don’t have supporting documents.')
                          : `${docFiles.length} ${pt(docFiles.length === 1 ? 'file' : 'files')} ${pt('ready for extraction')}`}
                      </p>
                      <Button
                        type="button"
                        onClick={extractFromDocuments}
                        disabled={docFiles.length === 0 || docExtracting}
                        className="gap-2"
                      >
                        {docExtracting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                        {docExtracting ? pt('Extracting…') : pt('Extract with AI')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {docResult && (
                  <Alert>
                    <AlertTitle className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-600" />
                      {pt('Draft prepared')}
                      {docResult.source === "fallback" && (
                        <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">
                          {pt('Template plan (AI unavailable)')}
                        </span>
                      )}
                    </AlertTitle>
                    <AlertDescription className="space-y-2 pt-2">
                      <p className="text-sm">
                        <strong>{pt('Name')}:</strong> {docResult.name}
                      </p>
                      {docResult.description && (
                        <p className="text-sm whitespace-pre-wrap">
                          <strong>{pt('Description')}:</strong> {docResult.description}
                        </p>
                      )}
                      {docResult.suggested_milestones.length > 0 && (
                        <div className="text-sm">
                          <strong>{pt('Suggested milestones')}:</strong>
                          <ul className="list-disc pl-5 mt-1 space-y-0.5">
                            {docResult.suggested_milestones.map((m, i) => (
                              <li key={i}>
                                {m.name}
                                {m.due_offset_weeks > 0 && (
                                  <span className="text-muted-foreground"> — {pt('week')} {m.due_offset_weeks}</span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {/* S2-04: methodology chip from the doc-level LLM suggestion.
                          Only renders when the AI returned one. */}
                      {docResult.suggested_methodology && (
                        <div className="flex items-center flex-wrap gap-2 pt-1">
                          <span className="inline-flex items-center gap-1.5 text-xs rounded-full border border-primary/30 bg-primary/10 text-primary px-2.5 py-1">
                            <Sparkles className="h-3 w-3" />
                            {pt('AI schat methodologie in:')}{' '}
                            <b className="ml-0.5">
                              {METHODOLOGIES.find((m) => m.id === docResult.suggested_methodology)?.shortName
                                || docResult.suggested_methodology}
                            </b>
                            {typeof docResult.methodology_confidence === 'number' && docResult.methodology_confidence > 0 && (
                              <span className="opacity-70">· {docResult.methodology_confidence}%</span>
                            )}
                          </span>
                          {formData.methodology !== docResult.suggested_methodology && (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs"
                              onClick={() => {
                                if (docResult.suggested_methodology) {
                                  setFormData((prev) => ({
                                    ...prev,
                                    methodology: docResult.suggested_methodology as ProjectMethodology,
                                  }));
                                  toast.success(
                                    pt('Methodologie uit documenten toegepast:') + ' ' +
                                    (METHODOLOGIES.find((m) => m.id === docResult.suggested_methodology)?.shortName
                                      || docResult.suggested_methodology)
                                  );
                                }
                              }}
                            >
                              <Check className="h-3 w-3 mr-1" />
                              {pt('Pas toe')}
                            </Button>
                          )}
                          {docResult.methodology_reason && (
                            <div className="basis-full text-xs text-muted-foreground italic">
                              {docResult.methodology_reason}
                            </div>
                          )}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {pt('Extracted from')} {docResult.extracted_pages} {pt('pages')}. {pt('Review & adjust on the next step.')}
                      </p>
                      {docResult.skipped.length > 0 && (
                        <p className="text-xs text-amber-700">
                          {pt('Skipped')}: {docResult.skipped.map((s) => s.name).join(", ")}
                        </p>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                {docResult && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <Label htmlFor="use-docs-ctx" className="text-sm font-medium">
                            {pt('Use these documents as AI context for the whole project')}
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            {pt('When on, Plan with AI, Ask Co-pilot and other AI features on this project will transparently include the uploaded document text as background. You can toggle this off later on the project page.')}
                          </p>
                        </div>
                        <Switch
                          id="use-docs-ctx"
                          checked={useDocsAsContext}
                          onCheckedChange={setUseDocsAsContext}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Step 3: Project Details */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">{pt("Project Details")}</h2>
                  <p className="text-muted-foreground">
                    {pt("Enter the basic information about your project")}
                  </p>
                </div>

                {/* Carry the chosen approach forward so it's visible */}
                {selectedMethodology && (
                  <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span>Aanpak: <b>{selectedMethodology.shortName}</b>{intake?.project_type ? ` · ${intake.project_type}` : ""} — de tailoring (vorm + governance) richten we automatisch in na het aanmaken.</span>
                  </div>
                )}

                <div className="grid gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="name">{pt("Project Name")} *</Label>
                    <Input
                      id="name"
                      placeholder={pt("e.g., Customer Portal v2.0")}
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>

                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="description">{pt("Description")}</Label>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleGenerateDescription}
                        disabled={aiLoading || !formData.name}
                        className="h-7 text-xs gap-1"
                      >
                        {aiLoading ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Sparkles className="h-3 w-3 text-purple-500" />
                        )}
                        {pt("Generate with AI")}
                      </Button>
                    </div>
                    <Textarea
                      id="description"
                      placeholder={pt("Describe the project scope and deliverables...")}
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="objectives">{pt("Objectives")}</Label>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleGenerateObjectives}
                        disabled={aiLoading || (!formData.name && !formData.description)}
                        className="h-7 text-xs gap-1"
                      >
                        {aiLoading ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Sparkles className="h-3 w-3 text-purple-500" />
                        )}
                        {pt("Generate with AI")}
                      </Button>
                    </div>
                    <Textarea
                      id="objectives"
                      placeholder={pt("What are the key objectives and success criteria?")}
                      value={formData.objectives}
                      onChange={(e) => setFormData(prev => ({ ...prev, objectives: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="startDate">{pt("Start Date")} *</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="endDate">{pt("End Date")} *</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="budget">{pt("Budget")}</Label>
                      <Input
                        id="budget"
                        type="number"
                        placeholder={pt("e.g., 50000")}
                        value={formData.budget}
                        onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="currency">{pt("Currency")}</Label>
                      <Select 
                        value={formData.currency}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="GBP">GBP (£)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="priority">{pt("Priority")}</Label>
                      <Select 
                        value={formData.priority}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">{pt("Low")}</SelectItem>
                          <SelectItem value="medium">{pt("Medium")}</SelectItem>
                          <SelectItem value="high">{pt("High")}</SelectItem>
                          <SelectItem value="critical">{pt("Critical")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Advanced (less-used) options — collapsed by default */}
                  <div className="border-t pt-4">
                    <button type="button" onClick={() => setShowAdvancedDetails(v => !v)}
                      className="text-sm font-semibold text-primary hover:underline">
                      {showAdvancedDetails ? "− " : "+ "}{pt("Geavanceerde opties")} ({pt("portfolio, programma")})
                    </button>
                    {showAdvancedDetails && (
                      <div className="grid grid-cols-2 gap-4 mt-3">
                        <div className="grid gap-2">
                          <Label>{pt("Portfolio (optional)")}</Label>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={formData.portfolio}
                            onChange={(e) => setFormData(prev => ({ ...prev, portfolio: e.target.value }))}
                          >
                            <option value="">{pt("No portfolio")}</option>
                            {portfolios.map((p: any) => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="grid gap-2">
                          <Label>{pt("Program (optional)")}</Label>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={formData.program}
                            onChange={(e) => setFormData(prev => ({ ...prev, program: e.target.value }))}
                          >
                            <option value="">{pt("No program")}</option>
                            {programs.map((p: any) => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">{pt("Review & Create")}</h2>
                  <p className="text-muted-foreground">
                    {pt("Review your project details before creating")}
                  </p>
                </div>

                <div className="grid gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-muted-foreground">{pt("Methodology")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedMethodology && (
                        <div className="flex items-center gap-3">
                          <div className={cn("p-2 rounded-lg", selectedMethodology.bgColor + "/10")}>
                            <div className={selectedMethodology.color}>
                              {selectedMethodology.icon}
                            </div>
                          </div>
                          <div>
                            <p className="font-medium">{selectedMethodology.name}</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {intake && (
                    <Card className="border-primary/20 bg-primary/5">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                          <Sparkles className="h-3.5 w-3.5 text-primary" /> {pt("Aanpak (tailoring)")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm">
                        <p>Projecttype: <b>{intake.project_type}</b>. Na het aanmaken wordt de <b>vorm</b> (Light/Medium/Heavy) en de <b>governance</b> automatisch ingericht op basis van je keuze — je landt meteen op de tailoring-pagina om te bevestigen.</p>
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-muted-foreground">{pt("Project Details")}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">{pt("Name")}</p>
                        <p className="font-medium">{formData.name || '-'}</p>
                      </div>
                      {formData.description && (
                        <div>
                          <p className="text-sm text-muted-foreground">{pt("Description")}</p>
                          <p>{formData.description}</p>
                        </div>
                      )}
                      {formData.objectives && (
                        <div>
                          <p className="text-sm text-muted-foreground">{pt("Objectives")}</p>
                          <p>{formData.objectives}</p>
                        </div>
                      )}
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">{pt("Start Date")}</p>
                          <p className="font-medium">{formData.startDate || '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{pt("End Date")}</p>
                          <p className="font-medium">{formData.endDate || '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{pt("Priority")}</p>
                          <Badge variant="outline" className="capitalize">{formData.priority}</Badge>
                        </div>
                      </div>
                      {formData.budget && (
                        <div>
                          <p className="text-sm text-muted-foreground">{pt("Budget")}</p>
                          <p className="font-medium">
                            {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: formData.currency }).format(Number(formData.budget))}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={currentStep === 1 ? () => navigate('/projects') : handleBack}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {currentStep === 1 ? pt('Cancel') : pt('Back')}
          </Button>

          {currentStep < 4 ? (
            <Button onClick={handleNext} disabled={!canProceed()}>
              {pt("Next")}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {pt("Creating...")}
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  {pt("Create Project")}
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Methodology Onboarding Wizard */}
      <MethodologyOnboardingWizard
        methodology={formData.methodology || 'hybrid'}
        projectName={formData.name}
        open={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={() => {
          setShowOnboarding(false);
          if (currentStep === 1) {
            setCurrentStep(2);
          }
        }}
      />
    </div>
  );
};

export default CreateProject;