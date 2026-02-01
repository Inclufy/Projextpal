import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { programsApi, projectsApi } from "@/lib/api";
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Layers, 
  Target, 
  Calendar, 
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MethodologyOnboardingWizard } from '@/components/MethodologyOnboardingWizard';
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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

// Types
type ProgramMethodology = 'safe' | 'msp' | 'pmi' | 'prince2_programme' | 'hybrid';

interface MethodologyOption {
  id: ProgramMethodology;
  name: string;
  shortName: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  features: string[];
  bestFor: string[];
}

const METHODOLOGIES: MethodologyOption[] = [
  {
    id: 'safe',
    name: 'Scaled Agile Framework (SAFe)',
    shortName: 'SAFe',
    description: 'Enterprise-scale agile development with Program Increments, Agile Release Trains, and coordinated planning across teams.',
    icon: <Zap className="h-6 w-6" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-500',
    features: [
      'Program Increments (PI) - 8-12 week planning cycles',
      'Agile Release Trains (ART) - cross-functional teams',
      'PI Planning events for alignment',
      'System demos and Inspect & Adapt',
      'Continuous delivery pipeline',
    ],
    bestFor: [
      'Large organizations with multiple agile teams',
      'Software development programs',
      'Digital transformation initiatives',
      'Organizations adopting agile at scale',
    ],
  },
  {
    id: 'msp',
    name: 'Managing Successful Programmes (MSP)',
    shortName: 'MSP',
    description: 'UK government standard focusing on benefits realization, stakeholder engagement, and organizational change management.',
    icon: <Target className="h-6 w-6" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-500',
    features: [
      'Benefits Management - track and realize value',
      'Blueprint Design - define future state',
      'Stakeholder Engagement - manage relationships',
      'Tranches & Transitions - phased delivery',
      'Programme Governance - oversight structure',
    ],
    bestFor: [
      'Government and public sector programs',
      'Organizational transformation',
      'Programs with significant change impact',
      'Benefits-driven initiatives',
    ],
  },
  {
    id: 'pmi',
    name: 'PMI Standard for Program Management',
    shortName: 'PMI',
    description: "PMI's framework for managing multiple related projects to achieve strategic objectives and benefits not available from managing them individually.",
    icon: <BarChart3 className="h-6 w-6" />,
    color: 'text-green-600',
    bgColor: 'bg-green-500',
    features: [
      'Program Lifecycle Management',
      'Benefits Identification & Realization',
      'Stakeholder Engagement Strategy',
      'Program Governance Framework',
      'Resource Optimization across projects',
    ],
    bestFor: [
      'Organizations following PMI standards',
      'Programs requiring formal governance',
      'Multi-project coordination',
      'Strategic initiative management',
    ],
  },
  {
    id: 'prince2_programme',
    name: 'PRINCE2 for Programmes',
    shortName: 'P2 Programme',
    description: 'Extended PRINCE2 principles for coordinating multiple projects within a programme, with strong governance and stage-gate approach.',
    icon: <Crown className="h-6 w-6" />,
    color: 'text-amber-600',
    bgColor: 'bg-amber-500',
    features: [
      'Programme Board governance',
      'Tranche-based planning and delivery',
      'Business Case driven decisions',
      'Stage Gates and exception management',
      'Structured roles and responsibilities',
    ],
    bestFor: [
      'Organizations using PRINCE2 for projects',
      'Programs requiring formal controls',
      'Government and regulated industries',
      'Programs with strict governance needs',
    ],
  },
  {
    id: 'hybrid',
    name: 'Hybrid Programme Management',
    shortName: 'Hybrid',
    description: 'Flexible approach combining elements from multiple methodologies based on organizational needs and program characteristics.',
    icon: <GitMerge className="h-6 w-6" />,
    color: 'text-pink-600',
    bgColor: 'bg-pink-500',
    features: [
      'Customizable governance structure',
      'Mix of agile and traditional approaches',
      'Adaptive planning cycles',
      'Flexible reporting frameworks',
      'Best-of-breed practices selection',
    ],
    bestFor: [
      'Organizations with diverse project types',
      'Programs spanning multiple departments',
      'Situations requiring flexibility',
      'Transitioning organizations',
    ],
  },
];

const STEPS = [
  { id: 1, title: 'Methodology', description: 'Select framework' },
  { id: 2, title: 'Details', description: 'Program information' },
  { id: 3, title: 'Projects', description: 'Link projects' },
  { id: 4, title: 'Review', description: 'Confirm & create' },
];

// AI Helper function
const callAI = async (prompt: string): Promise<string> => {
  const token = localStorage.getItem("access_token");
  
  try {
    // Step 1: Create a new chat
    const createChatResponse = await fetch("/api/v1/bot/chats/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: "Program AI Assistant",
      }),
    });

    if (!createChatResponse.ok) {
      throw new Error("Failed to create chat");
    }

    const chatData = await createChatResponse.json();
    const chatId = chatData.id;

    // Step 2: Send message to the chat
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

const CreateProgram = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);

  // AI States
  const [aiAdvisorOpen, setAiAdvisorOpen] = useState(false);
  const [aiGenerateOpen, setAiGenerateOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<{
    methodology: ProgramMethodology;
    reasoning: string;
    confidence: number;
  } | null>(null);
  const [generatePrompt, setGeneratePrompt] = useState("");

  // Fetch team members from API
  const { data: teamMembers = [] } = useQuery({
    queryKey: ["team-members"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/v1/team/members", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        if (response.ok) {
          return response.json();
        }
      } catch (e) {
        console.log("Team API not available");
      }
      return [];
    },
  });

  // Fetch available projects
  const { data: availableProjects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: () => projectsApi.getAll(),
  });

  // Create program mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => programsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["programs"] });
      toast.success("Program created successfully!");
      navigate("/programs");
    },
    onError: (error: any) => {
      console.error("Create program error:", error);
      toast.error(error?.message || "Failed to create program");
    },
  });

  // Form state
  const [formData, setFormData] = useState({
    methodology: '' as ProgramMethodology | '',
    name: '',
    description: '',
    startDate: '',
    targetEndDate: '',
    programManagerId: '',
    sponsorId: '',
    totalBudget: '',
    currency: 'EUR',
    selectedProjectIds: [] as string[],
    strategicObjective: '',
  });

  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Onboarding useEffect - trigger wanneer methodology verandert
  useEffect(() => {
    if (formData.methodology) {
      const hasSeenOnboarding = localStorage.getItem(`onboarding_program_${formData.methodology}_completed`);
      const hasSkippedOnboarding = localStorage.getItem(`onboarding_program_${formData.methodology}_skipped`);
      if (!hasSeenOnboarding && !hasSkippedOnboarding) {
        setShowOnboarding(true);
      }
    }
  }, [formData.methodology]);

  const selectedMethodology = METHODOLOGIES.find(m => m.id === formData.methodology);

  // AI Methodology Advisor
  const handleAIAdvisor = async () => {
    if (!aiPrompt.trim()) {
      toast.error("Please describe your program first");
      return;
    }

    setAiLoading(true);
    try {
      const prompt = `You are a program management expert. Based on the following program description, recommend the best methodology from: SAFe, MSP, PMI, PRINCE2, or Hybrid.

Program Description: ${aiPrompt}

Analyze and respond in this exact JSON format:
{
  "methodology": "safe|msp|pmi|prince2_programme|hybrid",
  "reasoning": "2-3 sentences explaining why this methodology fits best",
  "confidence": 85
}

Consider:
- Team size and structure
- Industry/sector
- Agile vs traditional needs
- Governance requirements
- Organizational change scope`;

      const response = await callAI(prompt);
      
      // Try to parse JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setAiRecommendation({
          methodology: parsed.methodology as ProgramMethodology,
          reasoning: parsed.reasoning,
          confidence: parsed.confidence || 80,
        });
      } else {
        // Fallback: try to extract methodology from text
        const methodologies = ['safe', 'msp', 'pmi', 'prince2_programme', 'hybrid'];
        const found = methodologies.find(m => response.toLowerCase().includes(m));
        setAiRecommendation({
          methodology: (found as ProgramMethodology) || 'hybrid',
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

  // AI Generate Program Details
  const handleAIGenerate = async () => {
    if (!generatePrompt.trim()) {
      toast.error("Please describe what you want to create");
      return;
    }

    setAiLoading(true);
    try {
      const prompt = `You are a program management expert. Generate program details based on this description:

"${generatePrompt}"

Respond in this exact JSON format:
{
  "name": "Program name (concise, professional)",
  "description": "2-3 sentence description of the program scope and purpose",
  "strategicObjective": "The main strategic business objective",
  "methodology": "safe|msp|pmi|prince2_programme|hybrid",
  "durationMonths": 12,
  "estimatedBudget": 500000
}

Be specific and professional. Use the context to determine appropriate methodology, timeline, and budget.`;

      const response = await callAI(prompt);
      
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // Calculate dates
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + (parsed.durationMonths || 12));
        
        setFormData(prev => ({
          ...prev,
          name: parsed.name || prev.name,
          description: parsed.description || prev.description,
          strategicObjective: parsed.strategicObjective || prev.strategicObjective,
          methodology: parsed.methodology || prev.methodology,
          startDate: startDate.toISOString().split('T')[0],
          targetEndDate: endDate.toISOString().split('T')[0],
          totalBudget: parsed.estimatedBudget?.toString() || prev.totalBudget,
        }));
        
        setAiGenerateOpen(false);
        toast.success("Program details generated! Review and adjust as needed.");
      }
    } catch (error) {
      toast.error("AI generation temporarily unavailable");
    } finally {
      setAiLoading(false);
    }
  };

  // Generate description with AI
  const handleGenerateDescription = async () => {
    if (!formData.name) {
      toast.error("Please enter a program name first");
      return;
    }

    setAiLoading(true);
    try {
      const prompt = `Generate a professional 2-3 sentence program description for a program called "${formData.name}". 
      ${formData.methodology ? `The program uses ${formData.methodology} methodology.` : ''}
      Be concise and focus on objectives and scope. Return only the description text, no JSON.`;

      const response = await callAI(prompt);
      setFormData(prev => ({ ...prev, description: response.trim() }));
      toast.success("Description generated!");
    } catch (error) {
      toast.error("Could not generate description");
    } finally {
      setAiLoading(false);
    }
  };

  // Generate strategic objective with AI
  const handleGenerateObjective = async () => {
    if (!formData.name && !formData.description) {
      toast.error("Please enter a program name or description first");
      return;
    }

    setAiLoading(true);
    try {
      const prompt = `Generate a strategic business objective for this program:
      Name: ${formData.name}
      Description: ${formData.description}
      
      Return a single sentence strategic objective that is measurable and aligned with business goals. Return only the objective text.`;

      const response = await callAI(prompt);
      setFormData(prev => ({ ...prev, strategicObjective: response.trim() }));
      toast.success("Strategic objective generated!");
    } catch (error) {
      toast.error("Could not generate objective");
    } finally {
      setAiLoading(false);
    }
  };

  const handleMethodologySelect = (methodologyId: ProgramMethodology) => {
    setFormData(prev => ({ ...prev, methodology: methodologyId }));
  };

  const handleProjectToggle = (projectId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedProjectIds: prev.selectedProjectIds.includes(projectId)
        ? prev.selectedProjectIds.filter(id => id !== projectId)
        : [...prev.selectedProjectIds, projectId]
    }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!formData.methodology;
      case 2:
        return formData.name && formData.startDate && formData.targetEndDate;
      case 3:
        return true;
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

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    const payload: any = {
      name: formData.name,
      description: formData.description || "",
      strategic_objective: formData.strategicObjective || "",
      methodology: formData.methodology,
      status: "planning",
      health_status: "green",
      start_date: formData.startDate,
      target_end_date: formData.targetEndDate,
      currency: formData.currency,
    };

    if (formData.totalBudget) {
      payload.total_budget = formData.totalBudget;
    }

    if (formData.programManagerId) {
      payload.program_manager = parseInt(formData.programManagerId);
    }

    if (formData.sponsorId) {
      payload.executive_sponsor = parseInt(formData.sponsorId);
    }

    if (formData.selectedProjectIds.length > 0) {
      payload.project_ids = formData.selectedProjectIds.map(id => parseInt(id));
    }

    createMutation.mutate(payload);
  };

  return (
    <div className="min-h-full bg-background">
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate('/programs')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Programs
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Layers className="h-8 w-8 text-primary" />
                Create New Program
              </h1>
              <p className="text-muted-foreground mt-1">
                Set up a strategic program to coordinate multiple projects
              </p>
            </div>
            
            {/* AI Generate Button */}
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
                    Generate Program with AI
                  </DialogTitle>
                  <DialogDescription>
                    Describe what you want to achieve and AI will generate program details for you.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Textarea
                    placeholder="Example: We need to modernize our customer service platform, integrating AI chatbots, improving response times, and training staff on new tools. The initiative will span our support, IT, and training departments."
                    value={generatePrompt}
                    onChange={(e) => setGeneratePrompt(e.target.value)}
                    rows={5}
                  />
                  <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    <Lightbulb className="h-4 w-4 mt-0.5 text-amber-500" />
                    <p>Tip: Include details about scope, teams involved, goals, and any constraints for better results.</p>
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
          <div className="flex items-center justify-between">
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
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "h-0.5 w-full mx-4 mt-[-24px]",
                      currentStep > step.id ? "bg-primary" : "bg-muted"
                    )}
                    style={{ minWidth: '60px' }}
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
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Choose Your Programme Methodology</h2>
                    <p className="text-muted-foreground">
                      Select the programme management framework that best fits your organization's needs
                    </p>
                  </div>
                  
                  {/* AI Advisor Button */}
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
                          Describe your program and AI will recommend the best methodology.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <Textarea
                          placeholder="Example: We're a software company planning to implement a new ERP system across 5 departments. We have 8 agile teams and need to coordinate delivery over 18 months while managing organizational change..."
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                      <CardHeader className="pb-3">
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
                            <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                              <Check className="h-4 w-4 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                        <CardTitle className="text-lg mt-3">{methodology.shortName}</CardTitle>
                        <CardDescription className="text-xs">{methodology.name}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {methodology.description}
                        </p>
                        <div className="space-y-1">
                          {methodology.features.slice(0, 3).map((feature, idx) => (
                            <p key={idx} className="text-xs text-muted-foreground flex items-start gap-1">
                              <span className="text-primary">•</span>
                              <span className="line-clamp-1">{feature.split(' - ')[0]}</span>
                            </p>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Methodology Details Panel */}
                {selectedMethodology && (
                  <Card className="bg-muted/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className={selectedMethodology.color}>
                          {selectedMethodology.icon}
                        </div>
                        {selectedMethodology.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-2">Key Features</h4>
                          <ul className="space-y-2">
                            {selectedMethodology.features.map((feature, idx) => (
                              <li key={idx} className="text-sm flex items-start gap-2">
                                <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Best For</h4>
                          <ul className="space-y-2">
                            {selectedMethodology.bestFor.map((item, idx) => (
                              <li key={idx} className="text-sm flex items-start gap-2">
                                <Target className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Step 2: Program Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Program Details</h2>
                  <p className="text-muted-foreground">
                    Enter the basic information about your program
                  </p>
                </div>

                <div className="grid gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Program Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Digital Transformation 2025"
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
                      placeholder="Describe the program's objectives and scope..."
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="objective">Strategic Objective</Label>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleGenerateObjective}
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
                      id="objective"
                      placeholder="What strategic business objective does this program aim to achieve?"
                      value={formData.strategicObjective}
                      onChange={(e) => setFormData(prev => ({ ...prev, strategicObjective: e.target.value }))}
                      rows={2}
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
                      <Label htmlFor="endDate">Target End Date *</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.targetEndDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, targetEndDate: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="manager">Program Manager</Label>
                      <Select 
                        value={formData.programManagerId}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, programManagerId: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select program manager (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {teamMembers.length > 0 ? (
                            teamMembers.map((member: any) => (
                              <SelectItem key={member.id} value={member.id.toString()}>
                                {member.first_name} {member.last_name} - {member.email}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="none" disabled>
                              No team members available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="sponsor">Executive Sponsor</Label>
                      <Select 
                        value={formData.sponsorId}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, sponsorId: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select sponsor (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {teamMembers.length > 0 ? (
                            teamMembers.map((member: any) => (
                              <SelectItem key={member.id} value={member.id.toString()}>
                                {member.first_name} {member.last_name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="none" disabled>
                              No team members available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="budget">Total Budget</Label>
                      <Input
                        id="budget"
                        type="number"
                        placeholder="e.g., 1000000"
                        value={formData.totalBudget}
                        onChange={(e) => setFormData(prev => ({ ...prev, totalBudget: e.target.value }))}
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
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Link Projects */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Link Projects</h2>
                  <p className="text-muted-foreground">
                    Select existing projects to include in this program (you can add more later)
                  </p>
                </div>

                {availableProjects.length > 0 ? (
                  <div className="grid gap-3">
                    {availableProjects.map((project: any) => (
                      <Card
                        key={project.id}
                        className={cn(
                          "cursor-pointer transition-all",
                          formData.selectedProjectIds.includes(project.id.toString())
                            ? "ring-2 ring-primary border-primary"
                            : "hover:border-primary/50"
                        )}
                        onClick={() => handleProjectToggle(project.id.toString())}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <Checkbox 
                                checked={formData.selectedProjectIds.includes(project.id.toString())}
                                onChange={() => {}}
                              />
                              <div>
                                <p className="font-medium">{project.name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  {project.methodology && (
                                    <Badge variant="outline" className="text-xs">
                                      {project.methodology}
                                    </Badge>
                                  )}
                                  <Badge 
                                    className={cn(
                                      "text-xs",
                                      project.status === 'active' || project.status === 'in_progress'
                                        ? "bg-green-100 text-green-800" 
                                        : "bg-gray-100 text-gray-800"
                                    )}
                                  >
                                    {project.status}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <FolderKanban className="h-5 w-5 text-muted-foreground" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="p-8 text-center">
                    <FolderKanban className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No projects available to link</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      You can create projects later and link them to this program
                    </p>
                  </Card>
                )}

                <p className="text-sm text-muted-foreground">
                  {formData.selectedProjectIds.length} project(s) selected
                </p>
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Review & Create</h2>
                  <p className="text-muted-foreground">
                    Review your program details before creating
                  </p>
                </div>

                <div className="grid gap-6">
                  {/* Methodology */}
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
                            <p className="text-sm text-muted-foreground">{selectedMethodology.shortName}</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Program Details */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-muted-foreground">Program Details</CardTitle>
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
                      {formData.strategicObjective && (
                        <div>
                          <p className="text-sm text-muted-foreground">Strategic Objective</p>
                          <p>{formData.strategicObjective}</p>
                        </div>
                      )}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Start Date</p>
                          <p className="font-medium">{formData.startDate || '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Target End Date</p>
                          <p className="font-medium">{formData.targetEndDate || '-'}</p>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Program Manager</p>
                          <p className="font-medium">
                            {formData.programManagerId 
                              ? teamMembers.find((m: any) => m.id.toString() === formData.programManagerId)?.first_name || 'Selected'
                              : 'Not assigned'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Budget</p>
                          <p className="font-medium">
                            {formData.totalBudget 
                              ? new Intl.NumberFormat('nl-NL', { style: 'currency', currency: formData.currency }).format(Number(formData.totalBudget))
                              : '-'
                            }
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Linked Projects */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-muted-foreground">
                        Linked Projects ({formData.selectedProjectIds.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {formData.selectedProjectIds.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {formData.selectedProjectIds.map(id => {
                            const project = availableProjects.find((p: any) => p.id.toString() === id);
                            return project ? (
                              <Badge key={id} variant="secondary" className="py-1">
                                <FolderKanban className="h-3 w-3 mr-1" />
                                {project.name}
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm">No projects linked yet</p>
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
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {currentStep < 4 ? (
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
                  Create Program
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

export default CreateProgram;