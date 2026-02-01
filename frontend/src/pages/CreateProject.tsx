import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsApi } from "@/lib/api";
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

// Types
type ProjectMethodology = 'prince2' | 'agile' | 'scrum' | 'kanban' | 'waterfall' | 'lean_six_sigma_green' | 'lean_six_sigma_black' | 'hybrid';

interface MethodologyOption {
  id: ProjectMethodology;
  name: string;
  shortName: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const METHODOLOGIES: MethodologyOption[] = [
  {
    id: 'prince2',
    name: 'PRINCE2',
    shortName: 'PRINCE2',
    description: 'Projects IN Controlled Environments - A structured project management method with defined stages and governance.',
    icon: <Crown className="h-6 w-6" />,
    color: 'text-amber-600',
    bgColor: 'bg-amber-500',
  },
  {
    id: 'agile',
    name: 'Agile',
    shortName: 'Agile',
    description: 'Iterative approach focusing on collaboration, flexibility, and responding to change.',
    icon: <Zap className="h-6 w-6" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-500',
  },
  {
    id: 'scrum',
    name: 'Scrum',
    shortName: 'Scrum',
    description: 'Framework for developing complex products through iterative sprints and ceremonies.',
    icon: <Repeat className="h-6 w-6" />,
    color: 'text-green-600',
    bgColor: 'bg-green-500',
  },
  {
    id: 'kanban',
    name: 'Kanban',
    shortName: 'Kanban',
    description: 'Visual workflow management with continuous delivery and WIP limits.',
    icon: <Kanban className="h-6 w-6" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-500',
  },
  {
    id: 'waterfall',
    name: 'Waterfall',
    shortName: 'Waterfall',
    description: 'Sequential design process with distinct phases flowing downward like a waterfall.',
    icon: <Droplets className="h-6 w-6" />,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-500',
  },
  {
    id: 'lean_six_sigma_green',
    name: 'Lean Six Sigma (Green Belt)',
    shortName: 'LSS Green',
    description: 'DMAIC methodology for process improvement with moderate complexity.',
    icon: <Award className="h-6 w-6" />,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-500',
  },
  {
    id: 'lean_six_sigma_black',
    name: 'Lean Six Sigma (Black Belt)',
    shortName: 'LSS Black',
    description: 'Advanced DMAIC methodology with statistical analysis for complex improvements.',
    icon: <Award className="h-6 w-6" />,
    color: 'text-gray-800',
    bgColor: 'bg-gray-800',
  },
  {
    id: 'hybrid',
    name: 'Hybrid',
    shortName: 'Hybrid',
    description: 'Combines elements from multiple methodologies based on project needs.',
    icon: <GitMerge className="h-6 w-6" />,
    color: 'text-pink-600',
    bgColor: 'bg-pink-500',
  },
];

const STEPS = [
  { id: 1, title: 'Methodology', description: 'Select framework' },
  { id: 2, title: 'Details', description: 'Project information' },
  { id: 3, title: 'Review', description: 'Confirm & create' },
];

// AI Helper function
const callAI = async (prompt: string): Promise<string> => {
  const token = localStorage.getItem("access_token");
  
  try {
    const createChatResponse = await fetch("/api/v1/bot/chats/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: "Project AI Assistant",
      }),
    });

    if (!createChatResponse.ok) {
      throw new Error("Failed to create chat");
    }

    const chatData = await createChatResponse.json();
    const chatId = chatData.id;

    const messageResponse = await fetch(`/api/v1/bot/chats/${chatId}/send_message/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        message: prompt,
      }),
    });

    if (!messageResponse.ok) {
      throw new Error("AI service unavailable");
    }

    const data = await messageResponse.json();
    return data.ai_response?.content || data.response || data.message || "";
  } catch (error) {
    console.error("AI call failed:", error);
    throw error;
  }
};

const CreateProject = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);

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

  // Form state
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

  // Create project mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => projectsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project created successfully!");
      navigate("/projects");
    },
    onError: (error: any) => {
      console.error("Create project error:", error);
      toast.error(error?.message || "Failed to create project");
    },
  });

  // AI Methodology Advisor
  const handleAIAdvisor = async () => {
    if (!aiPrompt.trim()) {
      toast.error("Please describe your project first");
      return;
    }

    setAiLoading(true);
    try {
      const prompt = `You are a project management expert. Based on the following project description, recommend the best methodology from: PRINCE2, Agile, Scrum, Kanban, Waterfall, Lean Six Sigma (Green Belt), Lean Six Sigma (Black Belt), or Hybrid.

Project Description: ${aiPrompt}

Analyze and respond in this exact JSON format:
{
  "methodology": "prince2|agile|scrum|kanban|waterfall|lean_six_sigma_green|lean_six_sigma_black|hybrid",
  "reasoning": "2-3 sentences explaining why this methodology fits best",
  "confidence": 85
}

Consider:
- Project size and complexity
- Team experience
- Flexibility requirements
- Stakeholder involvement
- Delivery timeline
- Industry standards`;

      const response = await callAI(prompt);
      
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setAiRecommendation({
          methodology: parsed.methodology as ProjectMethodology,
          reasoning: parsed.reasoning,
          confidence: parsed.confidence || 80,
        });
      } else {
        const methodologies = ['prince2', 'agile', 'scrum', 'kanban', 'waterfall', 'lean_six_sigma_green', 'lean_six_sigma_black', 'hybrid'];
        const found = methodologies.find(m => response.toLowerCase().includes(m.replace('_', ' ')));
        setAiRecommendation({
          methodology: (found as ProjectMethodology) || 'agile',
          reasoning: response.slice(0, 200),
          confidence: 70,
        });
      }
    } catch (error) {
      toast.error("AI advisor temporarily unavailable. Please select manually.");
    } finally {
      setAiLoading(false);
    }
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
      toast.error("Please describe what you want to create");
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
        toast.success("Project details generated! Review and adjust as needed.");
      }
    } catch (error) {
      toast.error("AI generation temporarily unavailable");
    } finally {
      setAiLoading(false);
    }
  };

  const handleGenerateDescription = async () => {
    if (!formData.name) {
      toast.error("Please enter a project name first");
      return;
    }

    setAiLoading(true);
    try {
      const prompt = `Generate a professional 2-3 sentence project description for a project called "${formData.name}". 
      ${formData.methodology ? `The project uses ${formData.methodology} methodology.` : ''}
      Be concise and focus on scope and deliverables. Return only the description text, no JSON.`;

      const response = await callAI(prompt);
      setFormData(prev => ({ ...prev, description: response.trim() }));
      toast.success("Description generated!");
    } catch (error) {
      toast.error("Could not generate description");
    } finally {
      setAiLoading(false);
    }
  };

  const handleGenerateObjectives = async () => {
    if (!formData.name && !formData.description) {
      toast.error("Please enter a project name or description first");
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
      toast.success("Objectives generated!");
    } catch (error) {
      toast.error("Could not generate objectives");
    } finally {
      setAiLoading(false);
    }
  };

  const handleMethodologySelect = (methodologyId: ProjectMethodology) => {
    setFormData(prev => ({ ...prev, methodology: methodologyId }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!formData.methodology;
      case 2:
        return formData.name && formData.startDate && formData.endDate;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    const payload: any = {
      name: formData.name,
      description: formData.description || "",
      methodology: formData.methodology,
      status: "planning",
      start_date: formData.startDate,
      end_date: formData.endDate,
      priority: formData.priority,
    };

    if (formData.budget) {
      payload.budget = parseFloat(formData.budget);
    }

    if (formData.objectives) {
      payload.objectives = formData.objectives;
    }

    createMutation.mutate(payload);
  };

  return (
    <div className="min-h-full bg-background">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate('/projects')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <FolderKanban className="h-8 w-8 text-primary" />
                Create New Project
              </h1>
              <p className="text-muted-foreground mt-1">
                Set up a new project with the right methodology
              </p>
            </div>
            
            <Dialog open={aiGenerateOpen} onOpenChange={setAiGenerateOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  Generate with AI
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-500" />
                    Generate Project with AI
                  </DialogTitle>
                  <DialogDescription>
                    Describe your project and AI will generate all the details for you.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Textarea
                    placeholder="Example: Build a new customer portal with user authentication, dashboard, and reporting features. The team has 5 developers and we need to deliver in 3 months."
                    value={generatePrompt}
                    onChange={(e) => setGeneratePrompt(e.target.value)}
                    rows={5}
                  />
                  <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    <Lightbulb className="h-4 w-4 mt-0.5 text-amber-500" />
                    <p>Tip: Include details about team size, timeline, deliverables, and any constraints for better results.</p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAiGenerateOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAIGenerate} disabled={aiLoading || !generatePrompt.trim()}>
                    {aiLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4 mr-2" />
                        Generate
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
                    <h2 className="text-xl font-semibold mb-2">Choose Your Methodology</h2>
                    <p className="text-muted-foreground">
                      Select the project management methodology that best fits your project needs
                    </p>
                  </div>
                  
                  <Dialog open={aiAdvisorOpen} onOpenChange={setAiAdvisorOpen}>
                    <DialogTrigger asChild>
                      <Button variant="secondary" className="gap-2">
                        <MessageSquare className="h-4 w-4 text-purple-500" />
                        AI Advisor
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-purple-500" />
                          AI Methodology Advisor
                        </DialogTitle>
                        <DialogDescription>
                          Describe your project and AI will recommend the best methodology.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <Textarea
                          placeholder="Example: We're building a mobile app for internal use. Team of 4 developers, 2 month timeline, requirements may change based on user feedback..."
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
                              Try Again
                            </Button>
                            <Button onClick={applyAIRecommendation}>
                              <Check className="h-4 w-4 mr-2" />
                              Apply Recommendation
                            </Button>
                          </>
                        ) : (
                          <Button onClick={handleAIAdvisor} disabled={aiLoading || !aiPrompt.trim()}>
                            {aiLoading ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Analyzing...
                              </>
                            ) : (
                              <>
                                <Sparkles className="h-4 w-4 mr-2" />
                                Get Recommendation
                              </>
                            )}
                          </Button>
                        )}
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {METHODOLOGIES.map((methodology) => (
                    <Card
                      key={methodology.id}
                      className={cn(
                        "cursor-pointer transition-all hover:shadow-md",
                        formData.methodology === methodology.id
                          ? "ring-2 ring-primary border-primary"
                          : "hover:border-primary/50"
                      )}
                      onClick={() => handleMethodologySelect(methodology.id)}
                    >
                      <CardHeader className="pb-2 pt-4 px-4">
                        <div className="flex items-start justify-between">
                          <div className={cn(
                            "p-2 rounded-lg",
                            methodology.bgColor + "/10"
                          )}>
                            <div className={methodology.color}>
                              {methodology.icon}
                            </div>
                          </div>
                          {formData.methodology === methodology.id && (
                            <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                              <Check className="h-3 w-3 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                        <CardTitle className="text-base mt-2">{methodology.shortName}</CardTitle>
                      </CardHeader>
                      <CardContent className="px-4 pb-4">
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {methodology.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Project Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Project Details</h2>
                  <p className="text-muted-foreground">
                    Enter the basic information about your project
                  </p>
                </div>

                <div className="grid gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Project Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Customer Portal v2.0"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>

                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="description">Description</Label>
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
                        Generate with AI
                      </Button>
                    </div>
                    <Textarea
                      id="description"
                      placeholder="Describe the project scope and deliverables..."
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="objectives">Objectives</Label>
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
                        Generate with AI
                      </Button>
                    </div>
                    <Textarea
                      id="objectives"
                      placeholder="What are the key objectives and success criteria?"
                      value={formData.objectives}
                      onChange={(e) => setFormData(prev => ({ ...prev, objectives: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="startDate">Start Date *</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="endDate">End Date *</Label>
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
                      <Label htmlFor="budget">Budget</Label>
                      <Input
                        id="budget"
                        type="number"
                        placeholder="e.g., 50000"
                        value={formData.budget}
                        onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="currency">Currency</Label>
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
                      <Label htmlFor="priority">Priority</Label>
                      <Select 
                        value={formData.priority}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Review & Create</h2>
                  <p className="text-muted-foreground">
                    Review your project details before creating
                  </p>
                </div>

                <div className="grid gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-muted-foreground">Methodology</CardTitle>
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

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-muted-foreground">Project Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="font-medium">{formData.name || '-'}</p>
                      </div>
                      {formData.description && (
                        <div>
                          <p className="text-sm text-muted-foreground">Description</p>
                          <p>{formData.description}</p>
                        </div>
                      )}
                      {formData.objectives && (
                        <div>
                          <p className="text-sm text-muted-foreground">Objectives</p>
                          <p>{formData.objectives}</p>
                        </div>
                      )}
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Start Date</p>
                          <p className="font-medium">{formData.startDate || '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">End Date</p>
                          <p className="font-medium">{formData.endDate || '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Priority</p>
                          <Badge variant="outline" className="capitalize">{formData.priority}</Badge>
                        </div>
                      </div>
                      {formData.budget && (
                        <div>
                          <p className="text-sm text-muted-foreground">Budget</p>
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
            {currentStep === 1 ? 'Cancel' : 'Back'}
          </Button>

          {currentStep < 3 ? (
            <Button onClick={handleNext} disabled={!canProceed()}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Create Project
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