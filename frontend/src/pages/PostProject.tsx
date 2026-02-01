import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Edit, 
  Trash2, 
  Plus,
  Building2,
  TrendingUp,
  DollarSign,
  Loader2,
  ClipboardList,
  Sparkles,
  Brain,
  Send,
  Copy,
  CheckCircle2,
  FileText,
  BarChart3,
  MessageSquare,
  Star,
  ThumbsUp,
  Users,
  Calendar,
  Eye,
  MoreHorizontal,
  Wand2,
  RefreshCw,
  ListChecks,
  ChevronRight,
  AlertCircle,
  Mail,
  Share2,
  X,
  Check,
  UserPlus,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// Use relative path - proxy handles the backend URL
const API_BASE_URL = '/api/v1';

// Types
interface PostProject {
  id: string;
  name: string;
  company: string;
  lessonsLearned: string;
  achievedResults: string;
  roi: string;
  savings: string;
  completedDate?: string;
  methodology?: string;
}

interface SurveyQuestion {
  id: string;
  type: "rating" | "text" | "multiple_choice" | "yes_no";
  question: string;
  options?: string[];
  required: boolean;
}

interface Survey {
  id: string;
  title: string;
  description: string;
  projectId?: string;
  projectName?: string;
  questions: SurveyQuestion[];
  status: "draft" | "active" | "closed";
  responses: number;
  createdAt: string;
  expiresAt?: string;
}

// API Functions
const fetchPostProjects = async (): Promise<PostProject[]> => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_BASE_URL}/post-projects/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  if (!response.ok) return [];
  
  const data = await response.json();
  const projects = Array.isArray(data) ? data : data.results || [];
  
  return projects.map((p: any) => ({
    id: String(p.id),
    name: p.name || p.title || '',
    company: p.company || p.company_name || '',
    lessonsLearned: p.lessons_learned || p.lessonsLearned || '',
    achievedResults: p.achieved_results || p.achievedResults || '',
    roi: p.roi || '',
    savings: p.savings || '',
    completedDate: p.completed_date || p.completedDate,
    methodology: p.methodology,
  }));
};

// Fetch regular projects for linking to surveys
interface Project {
  id: string;
  name: string;
}

const fetchProjects = async (): Promise<Project[]> => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_BASE_URL}/projects/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  if (!response.ok) return [];
  
  const data = await response.json();
  const projects = Array.isArray(data) ? data : data.results || [];
  
  return projects.map((p: any) => ({
    id: String(p.id),
    name: p.name || p.title || 'Unnamed Project',
  }));
};

// Team members for survey sharing
interface TeamMember {
  id: string;
  email: string;
  firstName: string;
  role: string;
  isActive: boolean;
}

const fetchTeamMembers = async (): Promise<TeamMember[]> => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_BASE_URL}/team/members/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  if (!response.ok) return [];
  
  const data = await response.json();
  const members = Array.isArray(data) ? data : data.results || [];
  
  return members.map((m: any) => ({
    id: String(m.id),
    email: m.email || '',
    firstName: m.first_name || m.firstName || '',
    role: m.role || 'guest',
    isActive: m.is_active ?? true,
  }));
};

const fetchSurveys = async (): Promise<Survey[]> => {
  const token = localStorage.getItem("access_token");
  // Backend uses /surveys/survey/ (app prefix + router registration)
  const response = await fetch(`${API_BASE_URL}/surveys/survey/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  if (!response.ok) return [];
  
  const data = await response.json();
  const surveys = Array.isArray(data) ? data : data.results || [];
  
  return surveys.map((s: any) => ({
    id: String(s.id),
    title: s.name || '', // Backend uses 'name', frontend uses 'title'
    description: s.description || '',
    projectId: s.project ? String(s.project) : undefined,
    projectName: s.project_name,
    questions: (s.questions || []).map((q: any) => ({
      id: String(q.id),
      type: q.question_type || 'text', // Backend uses 'question_type'
      question: q.text || '', // Backend uses 'text'
      options: q.choices || [], // Backend uses 'choices'
      required: q.required ?? true,
    })),
    status: (s.status || 'draft').toLowerCase(), // Normalize to lowercase
    responses: s.responses || 0,
    createdAt: s.created_at || new Date().toISOString(),
    expiresAt: s.deadline, // Backend uses 'deadline'
  }));
};

// AI Helper
const callAI = async (prompt: string): Promise<string> => {
  const token = localStorage.getItem("access_token");
  
  try {
    const createChatResponse = await fetch(`${API_BASE_URL}/bot/chats/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title: "Survey Generator" }),
    });

    if (!createChatResponse.ok) throw new Error("Failed to create chat");

    const chatData = await createChatResponse.json();
    const chatId = chatData.id;

    const messageResponse = await fetch(`${API_BASE_URL}/bot/chats/${chatId}/send_message/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message: prompt }),
    });

    if (!messageResponse.ok) throw new Error("AI service unavailable");

    const data = await messageResponse.json();
    return data.ai_response?.content || data.response || data.message || "";
  } catch (error) {
    console.error("AI call failed:", error);
    throw error;
  }
};

// Question type icons and labels - only types supported by backend
const questionTypeConfig: Record<string, { icon: any; label: string; color: string }> = {
  rating: { icon: Star, label: "Rating (1-5)", color: "text-amber-500" },
  text: { icon: MessageSquare, label: "Open Text", color: "text-blue-500" },
  multiple_choice: { icon: ListChecks, label: "Multiple Choice", color: "text-green-500" },
  yes_no: { icon: ThumbsUp, label: "Yes/No", color: "text-purple-500" },
  scale: { icon: BarChart3, label: "Scale (1-10)", color: "text-pink-500" },
};

export default function PostProject() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("projects");
  
  // Fetch data
  const { data: postProjects = [], isLoading: postProjectsLoading } = useQuery({
    queryKey: ['post-projects'],
    queryFn: fetchPostProjects,
  });

  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  });

  const { data: surveys = [], isLoading: surveysLoading } = useQuery({
    queryKey: ['surveys'],
    queryFn: fetchSurveys,
  });

  const { data: teamMembers = [] } = useQuery({
    queryKey: ['team-members'],
    queryFn: fetchTeamMembers,
  });

  // Project dialog state
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<PostProject | null>(null);
  const [projectFormData, setProjectFormData] = useState({
    name: "",
    company: "",
    lessonsLearned: "",
    achievedResults: "",
    roi: "",
    savings: "",
  });

  // Survey dialog state
  const [isSurveyDialogOpen, setIsSurveyDialogOpen] = useState(false);
  const [editingSurvey, setEditingSurvey] = useState<Survey | null>(null);
  const [surveyFormData, setSurveyFormData] = useState({
    title: "",
    description: "",
    projectId: "none",
    questions: [] as SurveyQuestion[],
  });

  // AI generation state
  const [isAIGenerateOpen, setIsAIGenerateOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSurveyType, setAiSurveyType] = useState<string>("project_feedback");
  const [aiProjectId, setAiProjectId] = useState<string>("none");
  const [aiCustomPrompt, setAiCustomPrompt] = useState("");
  const [aiGeneratedSurvey, setAiGeneratedSurvey] = useState<{
    title: string;
    description: string;
    questions: SurveyQuestion[];
  } | null>(null);

  // View survey responses state
  const [viewingSurvey, setViewingSurvey] = useState<Survey | null>(null);
  const [isViewResponsesOpen, setIsViewResponsesOpen] = useState(false);

  // Share survey state
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [sharingSurvey, setSharingSurvey] = useState<Survey | null>(null);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [manualEmail, setManualEmail] = useState("");
  const [shareMessage, setShareMessage] = useState("You've been invited to participate in a survey. Your feedback is valuable to us!");
  const [isSending, setIsSending] = useState(false);

  // Project mutations
  const createProjectMutation = useMutation({
    mutationFn: async (data: typeof projectFormData) => {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_BASE_URL}/post-projects/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: data.name,
          company: data.company,
          lessons_learned: data.lessonsLearned,
          achieved_results: data.achievedResults,
          roi: data.roi,
          savings: data.savings,
        }),
      });
      if (!response.ok) throw new Error('Failed to create');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post-projects'] });
      toast({ title: "Project added", description: "The post project has been added successfully." });
      setIsProjectDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add project.", variant: "destructive" });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof projectFormData }) => {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_BASE_URL}/post-projects/${id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: data.name,
          company: data.company,
          lessons_learned: data.lessonsLearned,
          achieved_results: data.achievedResults,
          roi: data.roi,
          savings: data.savings,
        }),
      });
      if (!response.ok) throw new Error('Failed to update');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post-projects'] });
      toast({ title: "Project updated", description: "The post project has been updated successfully." });
      setIsProjectDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update project.", variant: "destructive" });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_BASE_URL}/post-projects/${id}/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post-projects'] });
      toast({ title: "Project deleted", description: "The post project has been removed successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete project.", variant: "destructive" });
    },
  });

  // Survey mutations - FIXED: use correct field names and question_type values
  const createSurveyMutation = useMutation({
    mutationFn: async (data: typeof surveyFormData) => {
      const token = localStorage.getItem("access_token");
      
      // Map frontend question types to backend question_type values
      // Backend supports: text, textarea, rating, multiple_choice, yes_no
      const mapQuestionType = (frontendType: string): string => {
        const typeMap: Record<string, string> = {
          'text': 'text',
          'rating': 'rating',
          'multiple_choice': 'multiple_choice',
          'yes_no': 'yes_no',
          'scale': 'rating', // Map scale (1-10) to rating (1-5)
        };
        return typeMap[frontendType] || 'text';
      };
      
      // Backend expects: name (not title), text (not question), question_type (not type), choices (not options)
      const payload = {
        name: data.title, // Backend uses 'name' not 'title'
        description: data.description || '',
        project: data.projectId !== "none" ? parseInt(data.projectId, 10) : null,
        questions: data.questions.map((q, index) => ({
          text: q.question, // Backend uses 'text' not 'question'
          question_type: mapQuestionType(q.type), // Map to valid backend types
          choices: q.type === 'multiple_choice' ? (q.options || []) : [], // Only send choices for multiple_choice
          required: q.required,
          order: index + 1,
        })),
        status: 'Draft', // Backend expects capitalized status
      };
      
      console.log('Creating survey with payload:', JSON.stringify(payload, null, 2));
      
      // Use the correct endpoint: /surveys/survey/
      const response = await fetch(`${API_BASE_URL}/surveys/survey/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Survey creation failed:', response.status, errorData);
        const errorMsg = errorData?.detail || errorData?.message || JSON.stringify(errorData);
        throw new Error(errorMsg || `Failed to create survey (${response.status})`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      toast({ title: "Survey created", description: "The survey has been created successfully." });
      setIsSurveyDialogOpen(false);
      resetSurveyForm();
    },
    onError: (error: Error) => {
      console.error('Survey creation error:', error);
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create survey.", 
        variant: "destructive" 
      });
    },
  });

  const updateSurveyStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const token = localStorage.getItem("access_token");
      // Use activate/close actions or PATCH
      const endpoint = status === 'active' 
        ? `${API_BASE_URL}/surveys/survey/${id}/activate/`
        : status === 'closed'
        ? `${API_BASE_URL}/surveys/survey/${id}/close/`
        : `${API_BASE_URL}/surveys/survey/${id}/`;
      
      const method = status === 'active' || status === 'closed' ? 'POST' : 'PATCH';
      const body = method === 'PATCH' ? JSON.stringify({ status: status.charAt(0).toUpperCase() + status.slice(1) }) : undefined;
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body,
      });
      if (!response.ok) throw new Error('Failed to update');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      toast({ title: "Survey updated", description: "Survey status has been updated." });
    },
  });

  const deleteSurveyMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_BASE_URL}/surveys/survey/${id}/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      toast({ title: "Survey deleted", description: "The survey has been removed." });
    },
  });

  // Share survey handler
  const handleShareSurvey = async () => {
    if (!sharingSurvey) return;
    
    // Collect all email addresses (selected team members + manual entry)
    const emails = [
      ...selectedRecipients,
      ...manualEmail.split(',').map(e => e.trim()).filter(e => e && e.includes('@')),
    ];
    
    if (emails.length === 0) {
      toast({ 
        title: "No recipients", 
        description: "Please select team members or enter email addresses.", 
        variant: "destructive" 
      });
      return;
    }
    
    setIsSending(true);
    
    try {
      const token = localStorage.getItem("access_token");
      const surveyLink = `${window.location.origin}/survey/${sharingSurvey.id}`;
      
      // Update survey with recipients emails
      const response = await fetch(`${API_BASE_URL}/surveys/survey/${sharingSurvey.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipients_emails: emails.join(','),
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update recipients');
      }
      
      // Try to send invitations (if endpoint exists)
      try {
        await fetch(`${API_BASE_URL}/surveys/survey/${sharingSurvey.id}/send_invitations/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            emails,
            message: shareMessage,
            survey_link: surveyLink,
          }),
        });
      } catch (e) {
        // Endpoint might not exist, that's ok
        console.log('Send invitations endpoint not available');
      }
      
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      
      toast({ 
        title: "Survey shared!", 
        description: `Survey invitation sent to ${emails.length} recipient${emails.length > 1 ? 's' : ''}.`,
      });
      
      setIsShareDialogOpen(false);
      setSharingSurvey(null);
      setSelectedRecipients([]);
      setManualEmail("");
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to share survey. Please try again.", 
        variant: "destructive" 
      });
    } finally {
      setIsSending(false);
    }
  };

  const openShareDialog = (survey: Survey) => {
    setSharingSurvey(survey);
    setSelectedRecipients([]);
    setManualEmail("");
    setIsShareDialogOpen(true);
  };

  const toggleRecipient = (email: string) => {
    setSelectedRecipients(prev => 
      prev.includes(email) 
        ? prev.filter(e => e !== email)
        : [...prev, email]
    );
  };

  // Handlers
  const handleEditProject = (project: PostProject) => {
    setEditingProject(project);
    setProjectFormData({
      name: project.name,
      company: project.company,
      lessonsLearned: project.lessonsLearned,
      achievedResults: project.achievedResults,
      roi: project.roi,
      savings: project.savings,
    });
    setIsProjectDialogOpen(true);
  };

  const handleAddNewProject = () => {
    setEditingProject(null);
    setProjectFormData({
      name: "",
      company: "",
      lessonsLearned: "",
      achievedResults: "",
      roi: "",
      savings: "",
    });
    setIsProjectDialogOpen(true);
  };

  const handleProjectSubmit = () => {
    if (editingProject) {
      updateProjectMutation.mutate({ id: editingProject.id, data: projectFormData });
    } else {
      createProjectMutation.mutate(projectFormData);
    }
  };

  const resetSurveyForm = () => {
    setSurveyFormData({
      title: "",
      description: "",
      projectId: "none",
      questions: [],
    });
    setEditingSurvey(null);
  };

  const handleAddNewSurvey = () => {
    resetSurveyForm();
    setIsSurveyDialogOpen(true);
  };

  const handleSurveySubmit = () => {
    if (surveyFormData.questions.length === 0) {
      toast({ title: "Error", description: "Please add at least one question.", variant: "destructive" });
      return;
    }
    createSurveyMutation.mutate(surveyFormData);
  };

  const addQuestion = (type: SurveyQuestion["type"]) => {
    const newQuestion: SurveyQuestion = {
      id: `q-${Date.now()}`,
      type,
      question: "",
      options: type === "multiple_choice" ? ["Option 1", "Option 2"] : undefined,
      required: true,
    };
    setSurveyFormData({
      ...surveyFormData,
      questions: [...surveyFormData.questions, newQuestion],
    });
  };

  const updateQuestion = (questionId: string, updates: Partial<SurveyQuestion>) => {
    setSurveyFormData({
      ...surveyFormData,
      questions: surveyFormData.questions.map(q =>
        q.id === questionId ? { ...q, ...updates } : q
      ),
    });
  };

  const removeQuestion = (questionId: string) => {
    setSurveyFormData({
      ...surveyFormData,
      questions: surveyFormData.questions.filter(q => q.id !== questionId),
    });
  };

  const addOption = (questionId: string) => {
    setSurveyFormData({
      ...surveyFormData,
      questions: surveyFormData.questions.map(q =>
        q.id === questionId
          ? { ...q, options: [...(q.options || []), `Option ${(q.options?.length || 0) + 1}`] }
          : q
      ),
    });
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setSurveyFormData({
      ...surveyFormData,
      questions: surveyFormData.questions.map(q =>
        q.id === questionId
          ? {
              ...q,
              options: q.options?.map((opt, idx) => idx === optionIndex ? value : opt),
            }
          : q
      ),
    });
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    setSurveyFormData({
      ...surveyFormData,
      questions: surveyFormData.questions.map(q =>
        q.id === questionId
          ? { ...q, options: q.options?.filter((_, idx) => idx !== optionIndex) }
          : q
      ),
    });
  };

  // AI Survey Generation
  const handleAIGenerateSurvey = async () => {
    setAiLoading(true);
    setAiGeneratedSurvey(null);

    try {
      const selectedProject = aiProjectId !== "none" ? projects.find(p => p.id === aiProjectId) : null;
      const selectedPostProject = aiProjectId !== "none" ? postProjects.find(p => p.id === aiProjectId) : null;
      
      const surveyTypePrompts: Record<string, string> = {
        project_feedback: "Create a post-project feedback survey to gather team insights about project execution, challenges faced, and improvement suggestions.",
        stakeholder_satisfaction: "Create a stakeholder satisfaction survey to measure how satisfied stakeholders are with project outcomes and delivery.",
        lessons_learned: "Create a lessons learned survey to capture what went well, what could be improved, and recommendations for future projects.",
        team_retrospective: "Create a team retrospective survey for agile/scrum teams to reflect on the sprint or project iteration.",
        client_feedback: "Create a client feedback survey to gather customer opinions on deliverables, communication, and overall satisfaction.",
        process_improvement: "Create a process improvement survey to identify bottlenecks and areas for workflow optimization.",
      };

      const basePrompt = surveyTypePrompts[aiSurveyType] || surveyTypePrompts.project_feedback;
      
      let contextInfo = "";
      if (selectedProject) {
        contextInfo = `\nProject Context:\n- Project Name: ${selectedProject.name}`;
      }
      if (selectedPostProject) {
        contextInfo = `
Project Context:
- Project Name: ${selectedPostProject.name}
- Company: ${selectedPostProject.company}
- Achieved Results: ${selectedPostProject.achievedResults}
- Lessons Learned: ${selectedPostProject.lessonsLearned}
- ROI: ${selectedPostProject.roi}
- Savings: ${selectedPostProject.savings}
`;
      }

      const customContext = aiCustomPrompt ? `\nAdditional Requirements: ${aiCustomPrompt}` : "";

      const prompt = `You are a survey design expert. ${basePrompt}
${contextInfo}${customContext}

Generate a professional survey with 6-10 questions. Use a mix of question types for better insights.

Respond in this exact JSON format:
{
  "title": "Survey Title",
  "description": "Brief description of the survey purpose",
  "questions": [
    {
      "id": "q1",
      "type": "rating",
      "question": "Question text here",
      "required": true
    },
    {
      "id": "q2",
      "type": "multiple_choice",
      "question": "Question text here",
      "options": ["Option 1", "Option 2", "Option 3"],
      "required": true
    },
    {
      "id": "q3",
      "type": "text",
      "question": "Question text here",
      "required": false
    },
    {
      "id": "q4",
      "type": "yes_no",
      "question": "Question text here",
      "required": true
    },
    {
      "id": "q5",
      "type": "scale",
      "question": "Question text here (1-10)",
      "required": true
    }
  ]
}

Available question types: rating (1-5 stars), text (open-ended), multiple_choice (with options), yes_no, scale (1-10).
Make questions specific, actionable, and relevant to post-project evaluation.`;

      const response = await callAI(prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setAiGeneratedSurvey({
          title: parsed.title,
          description: parsed.description,
          questions: parsed.questions.map((q: any, idx: number) => ({
            id: q.id || `q-${idx}`,
            type: q.type || 'text',
            question: q.question,
            options: q.options,
            required: q.required ?? true,
          })),
        });
        toast({ title: "Survey generated!", description: "Review and customize the AI-generated survey." });
      } else {
        throw new Error("Could not parse AI response");
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to generate survey. Please try again.", variant: "destructive" });
    } finally {
      setAiLoading(false);
    }
  };

  const applyAIGeneratedSurvey = () => {
    if (!aiGeneratedSurvey) return;
    
    setSurveyFormData({
      title: aiGeneratedSurvey.title,
      description: aiGeneratedSurvey.description,
      projectId: aiProjectId,
      questions: aiGeneratedSurvey.questions,
    });
    
    setIsAIGenerateOpen(false);
    setIsSurveyDialogOpen(true);
    setAiGeneratedSurvey(null);
    setAiCustomPrompt("");
  };

  const copySurveyLink = (surveyId: string) => {
    const link = `${window.location.origin}/survey/${surveyId}`;
    navigator.clipboard.writeText(link);
    toast({ title: "Link copied!", description: "Survey link copied to clipboard." });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'draft': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'closed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  // Loading state
  if (postProjectsLoading || projectsLoading || surveysLoading) {
    return (
      <div className="min-h-full bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background">
      <div className="py-8 px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Post-Project Management
            </h1>
            <p className="text-muted-foreground">
              Document completed projects, capture lessons learned, and gather feedback through surveys.
            </p>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="flex items-center justify-between">
              <TabsList className="grid w-[400px] grid-cols-2">
                <TabsTrigger value="projects" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Projects ({postProjects.length})
                </TabsTrigger>
                <TabsTrigger value="surveys" className="gap-2">
                  <ClipboardList className="h-4 w-4" />
                  Surveys ({surveys.length})
                </TabsTrigger>
              </TabsList>

              <div className="flex gap-2">
                {activeTab === "surveys" && (
                  <Button
                    variant="outline"
                    onClick={() => setIsAIGenerateOpen(true)}
                    className="gap-2 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                  >
                    <Sparkles className="h-4 w-4" />
                    Generate with AI
                  </Button>
                )}
                <Button
                  onClick={activeTab === "projects" ? handleAddNewProject : handleAddNewSurvey}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  {activeTab === "projects" ? "Add Project" : "Create Survey"}
                </Button>
              </div>
            </div>

            {/* Projects Tab */}
            <TabsContent value="projects" className="space-y-6">
              {postProjects.length === 0 ? (
                <Card className="p-12">
                  <div className="text-center">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No post projects yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Add your first completed project to get started.
                    </p>
                    <Button onClick={handleAddNewProject}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Post Project
                    </Button>
                  </div>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {postProjects.map((project) => (
                    <Card
                      key={project.id}
                      className="group relative overflow-hidden border-border bg-card hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      <CardContent className="p-6 relative">
                        <div className="mb-4">
                          <h3 className="text-xl font-bold text-foreground mb-2">
                            {project.name}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Building2 className="h-4 w-4" />
                            <span>Company: <span className="font-medium">{project.company}</span></span>
                          </div>
                        </div>

                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-foreground mb-1">
                            Lessons Learned:
                          </h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {project.lessonsLearned || 'Not documented'}
                          </p>
                        </div>

                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-foreground mb-1">
                            Achieved Results:
                          </h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {project.achievedResults || 'Not documented'}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <div className="flex items-center gap-1.5 mb-1">
                              <TrendingUp className="h-3.5 w-3.5 text-success" />
                              <span className="text-xs font-medium text-muted-foreground">ROI:</span>
                            </div>
                            <p className="text-lg font-bold text-success">
                              {project.roi || '-'}
                            </p>
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 mb-1">
                              <DollarSign className="h-3.5 w-3.5 text-success" />
                              <span className="text-xs font-medium text-muted-foreground">Savings:</span>
                            </div>
                            <p className="text-lg font-bold text-success">
                              {project.savings || '-'}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-4 border-t border-border">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleEditProject(project)}
                          >
                            <Edit className="h-3.5 w-3.5 mr-1.5" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => deleteProjectMutation.mutate(project.id)}
                            disabled={deleteProjectMutation.isPending}
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Surveys Tab */}
            <TabsContent value="surveys" className="space-y-6">
              {/* Survey Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <ClipboardList className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{surveys.length}</p>
                        <p className="text-xs text-muted-foreground">Total Surveys</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{surveys.filter(s => s.status === 'active').length}</p>
                        <p className="text-xs text-muted-foreground">Active</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                        <FileText className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{surveys.filter(s => s.status === 'draft').length}</p>
                        <p className="text-xs text-muted-foreground">Drafts</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                        <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{surveys.reduce((sum, s) => sum + s.responses, 0)}</p>
                        <p className="text-xs text-muted-foreground">Total Responses</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Surveys List */}
              {surveys.length === 0 ? (
                <Card className="p-12">
                  <div className="text-center">
                    <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No surveys yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first survey to gather feedback.
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Button
                        variant="outline"
                        onClick={() => setIsAIGenerateOpen(true)}
                        className="gap-2"
                      >
                        <Sparkles className="h-4 w-4" />
                        Generate with AI
                      </Button>
                      <Button onClick={handleAddNewSurvey}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Survey
                      </Button>
                    </div>
                  </div>
                </Card>
              ) : (
                <div className="space-y-4">
                  {surveys.map((survey) => (
                    <Card key={survey.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold">{survey.title}</h3>
                              <Badge className={cn("text-xs", getStatusColor(survey.status))}>
                                {survey.status.charAt(0).toUpperCase() + survey.status.slice(1)}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {survey.description}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <ListChecks className="h-4 w-4" />
                                <span>{survey.questions.length} questions</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                <span>{survey.responses} responses</span>
                              </div>
                              {survey.projectName && (
                                <div className="flex items-center gap-1">
                                  <FileText className="h-4 w-4" />
                                  <span>{survey.projectName}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(survey.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {survey.status === 'active' && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openShareDialog(survey)}
                                  className="gap-1"
                                >
                                  <Share2 className="h-4 w-4" />
                                  Share
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => copySurveyLink(survey.id)}
                                >
                                  <Copy className="h-4 w-4 mr-1" />
                                  Copy Link
                                </Button>
                              </>
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {survey.status === 'draft' && (
                                  <DropdownMenuItem
                                    onClick={() => updateSurveyStatusMutation.mutate({ id: survey.id, status: 'active' })}
                                  >
                                    <Send className="h-4 w-4 mr-2" />
                                    Activate Survey
                                  </DropdownMenuItem>
                                )}
                                {survey.status === 'active' && (
                                  <DropdownMenuItem
                                    onClick={() => updateSurveyStatusMutation.mutate({ id: survey.id, status: 'closed' })}
                                  >
                                    <AlertCircle className="h-4 w-4 mr-2" />
                                    Close Survey
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => {
                                  setViewingSurvey(survey);
                                  setIsViewResponsesOpen(true);
                                }}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Responses
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openShareDialog(survey)}>
                                  <Share2 className="h-4 w-4 mr-2" />
                                  Share with Team
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => copySurveyLink(survey.id)}>
                                  <Copy className="h-4 w-4 mr-2" />
                                  Copy Link
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => deleteSurveyMutation.mutate(survey.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Project Dialog */}
      <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingProject ? "Edit Post Project" : "Add New Post Project"}
            </DialogTitle>
            <DialogDescription>
              Fill in the details about the completed project.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                value={projectFormData.name}
                onChange={(e) => setProjectFormData({ ...projectFormData, name: e.target.value })}
                placeholder="Enter project name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={projectFormData.company}
                onChange={(e) => setProjectFormData({ ...projectFormData, company: e.target.value })}
                placeholder="Enter company name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lessonsLearned">Lessons Learned</Label>
              <Textarea
                id="lessonsLearned"
                value={projectFormData.lessonsLearned}
                onChange={(e) => setProjectFormData({ ...projectFormData, lessonsLearned: e.target.value })}
                placeholder="What did you learn from this project?"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="achievedResults">Achieved Results</Label>
              <Textarea
                id="achievedResults"
                value={projectFormData.achievedResults}
                onChange={(e) => setProjectFormData({ ...projectFormData, achievedResults: e.target.value })}
                placeholder="What results were achieved?"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="roi">ROI</Label>
                <Input
                  id="roi"
                  value={projectFormData.roi}
                  onChange={(e) => setProjectFormData({ ...projectFormData, roi: e.target.value })}
                  placeholder="e.g., 53%"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="savings">Savings</Label>
                <Input
                  id="savings"
                  value={projectFormData.savings}
                  onChange={(e) => setProjectFormData({ ...projectFormData, savings: e.target.value })}
                  placeholder="e.g., €97,000"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProjectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleProjectSubmit}
              disabled={createProjectMutation.isPending || updateProjectMutation.isPending}
            >
              {(createProjectMutation.isPending || updateProjectMutation.isPending) ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                `${editingProject ? "Update" : "Add"} Project`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Survey Dialog */}
      <Dialog open={isSurveyDialogOpen} onOpenChange={setIsSurveyDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSurvey ? "Edit Survey" : "Create New Survey"}
            </DialogTitle>
            <DialogDescription>
              Design your survey with different question types.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="surveyTitle">Survey Title *</Label>
                <Input
                  id="surveyTitle"
                  value={surveyFormData.title}
                  onChange={(e) => setSurveyFormData({ ...surveyFormData, title: e.target.value })}
                  placeholder="Enter survey title"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="surveyDescription">Description</Label>
                <Textarea
                  id="surveyDescription"
                  value={surveyFormData.description}
                  onChange={(e) => setSurveyFormData({ ...surveyFormData, description: e.target.value })}
                  placeholder="Describe the purpose of this survey"
                  rows={2}
                />
              </div>
              <div className="grid gap-2">
                <Label>Link to Project (Optional)</Label>
                <Select
                  value={surveyFormData.projectId}
                  onValueChange={(value) => setSurveyFormData({ ...surveyFormData, projectId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No project</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Questions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Questions</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Question
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {Object.entries(questionTypeConfig).map(([type, config]) => {
                      const Icon = config.icon;
                      return (
                        <DropdownMenuItem
                          key={type}
                          onClick={() => addQuestion(type as SurveyQuestion["type"])}
                        >
                          <Icon className={cn("h-4 w-4 mr-2", config.color)} />
                          {config.label}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {surveyFormData.questions.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                  <ListChecks className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No questions added yet</p>
                  <p className="text-sm text-muted-foreground">Click "Add Question" to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {surveyFormData.questions.map((question, idx) => {
                    const typeConfig = questionTypeConfig[question.type] || questionTypeConfig.text;
                    const Icon = typeConfig.icon;
                    
                    return (
                      <Card key={question.id} className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-muted-foreground">Q{idx + 1}</span>
                              <Badge variant="outline" className="gap-1">
                                <Icon className={cn("h-3 w-3", typeConfig.color)} />
                                {typeConfig.label}
                              </Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => removeQuestion(question.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <Input
                            value={question.question}
                            onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
                            placeholder="Enter your question"
                          />

                          {question.type === "multiple_choice" && (
                            <div className="space-y-2 pl-4">
                              <Label className="text-xs text-muted-foreground">Options</Label>
                              {question.options?.map((option, optIdx) => (
                                <div key={optIdx} className="flex items-center gap-2">
                                  <Input
                                    value={option}
                                    onChange={(e) => updateOption(question.id, optIdx, e.target.value)}
                                    placeholder={`Option ${optIdx + 1}`}
                                    className="flex-1"
                                  />
                                  {(question.options?.length || 0) > 2 && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => removeOption(question.id, optIdx)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                              ))}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => addOption(question.id)}
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Add Option
                              </Button>
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <Switch
                              checked={question.required}
                              onCheckedChange={(checked) => updateQuestion(question.id, { required: checked })}
                            />
                            <Label className="text-sm">Required</Label>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSurveyDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSurveySubmit}
              disabled={createSurveyMutation.isPending || !surveyFormData.title}
            >
              {createSurveyMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Survey"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Generate Survey Dialog */}
      <Dialog open={isAIGenerateOpen} onOpenChange={setIsAIGenerateOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              Generate Survey with AI
            </DialogTitle>
            <DialogDescription>
              Let AI create a professional survey based on your requirements.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {!aiGeneratedSurvey ? (
              <>
                <div className="space-y-2">
                  <Label>Survey Type</Label>
                  <Select value={aiSurveyType} onValueChange={setAiSurveyType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="project_feedback">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-blue-500" />
                          <span>Project Feedback</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="stakeholder_satisfaction">
                        <div className="flex items-center gap-2">
                          <ThumbsUp className="h-4 w-4 text-green-500" />
                          <span>Stakeholder Satisfaction</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="lessons_learned">
                        <div className="flex items-center gap-2">
                          <Brain className="h-4 w-4 text-purple-500" />
                          <span>Lessons Learned</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="team_retrospective">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-amber-500" />
                          <span>Team Retrospective</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="client_feedback">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span>Client Feedback</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="process_improvement">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-pink-500" />
                          <span>Process Improvement</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Link to Project (Optional)</Label>
                  <Select value={aiProjectId} onValueChange={setAiProjectId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project for context..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No specific project</SelectItem>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Linking a project helps AI create more relevant questions.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Additional Requirements (Optional)</Label>
                  <Textarea
                    value={aiCustomPrompt}
                    onChange={(e) => setAiCustomPrompt(e.target.value)}
                    placeholder="E.g., Focus on communication aspects, include questions about timeline adherence, ask about budget management..."
                    rows={3}
                  />
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-start gap-3">
                    <Brain className="h-5 w-5 text-purple-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-purple-900 dark:text-purple-100">AI will generate:</p>
                      <ul className="text-sm text-purple-700 dark:text-purple-300 mt-1 space-y-1">
                        <li>• 6-10 professional questions</li>
                        <li>• Mix of rating, text, and choice questions</li>
                        <li>• Tailored to your selected survey type</li>
                        {aiProjectId !== "none" && <li>• Contextualized for your project</li>}
                      </ul>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-400 mb-2">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">Survey Generated Successfully!</span>
                  </div>
                </div>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{aiGeneratedSurvey.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{aiGeneratedSurvey.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-sm font-medium">{aiGeneratedSurvey.questions.length} Questions:</p>
                      {aiGeneratedSurvey.questions.map((q, idx) => {
                        const typeConfig = questionTypeConfig[q.type] || questionTypeConfig.text;
                        const Icon = typeConfig.icon;
                        return (
                          <div key={q.id} className="flex items-start gap-2 text-sm">
                            <span className="text-muted-foreground">{idx + 1}.</span>
                            <Icon className={cn("h-4 w-4 mt-0.5", typeConfig.color)} />
                            <span className="flex-1">{q.question}</span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          <DialogFooter>
            {!aiGeneratedSurvey ? (
              <>
                <Button variant="outline" onClick={() => setIsAIGenerateOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAIGenerateSurvey}
                  disabled={aiLoading}
                  className="gap-2"
                >
                  {aiLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4" />
                      Generate Survey
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setAiGeneratedSurvey(null);
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerate
                </Button>
                <Button onClick={applyAIGeneratedSurvey}>
                  <ChevronRight className="h-4 w-4 mr-2" />
                  Continue to Edit
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Responses Dialog */}
      <Dialog open={isViewResponsesOpen} onOpenChange={setIsViewResponsesOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Survey Responses</DialogTitle>
            <DialogDescription>
              {viewingSurvey?.title} - {viewingSurvey?.responses} responses
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {viewingSurvey?.responses === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No responses yet</h3>
                <p className="text-muted-foreground">
                  Share your survey link to start collecting responses.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => viewingSurvey && copySurveyLink(viewingSurvey.id)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Survey Link
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <p className="text-center text-muted-foreground">
                      Response analytics and individual responses will be displayed here.
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewResponsesOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Survey Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-primary" />
              Share Survey
            </DialogTitle>
            <DialogDescription>
              {sharingSurvey?.title} - Select team members or enter email addresses to share this survey.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Team Members Selection */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Team Members</Label>
              {teamMembers.length === 0 ? (
                <div className="text-center py-4 border rounded-lg bg-muted/30">
                  <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No team members available</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto border rounded-lg p-3">
                  {teamMembers.filter(m => m.isActive).map((member) => (
                    <div
                      key={member.id}
                      onClick={() => toggleRecipient(member.email)}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors",
                        selectedRecipients.includes(member.email)
                          ? "bg-primary/10 border-2 border-primary"
                          : "bg-muted/30 hover:bg-muted/50 border-2 border-transparent"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium">
                          {member.firstName?.[0]?.toUpperCase() || member.email[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {member.firstName || 'Team Member'}
                          </p>
                          <p className="text-xs text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {member.role}
                        </Badge>
                        {selectedRecipients.includes(member.email) && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {selectedRecipients.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {selectedRecipients.length} team member{selectedRecipients.length > 1 ? 's' : ''} selected
                </p>
              )}
            </div>

            <Separator />

            {/* Manual Email Entry */}
            <div className="space-y-2">
              <Label htmlFor="manualEmails" className="text-base font-medium">
                Additional Email Addresses
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="manualEmails"
                    value={manualEmail}
                    onChange={(e) => setManualEmail(e.target.value)}
                    placeholder="Enter emails (comma separated)"
                    className="pl-9"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Add external recipients who are not team members. Separate multiple emails with commas.
              </p>
            </div>

            <Separator />

            {/* Custom Message */}
            <div className="space-y-2">
              <Label htmlFor="shareMessage" className="text-base font-medium">
                Personal Message (Optional)
              </Label>
              <Textarea
                id="shareMessage"
                value={shareMessage}
                onChange={(e) => setShareMessage(e.target.value)}
                placeholder="Add a personal message to your invitation..."
                rows={3}
              />
            </div>

            {/* Preview */}
            <div className="bg-muted/30 rounded-lg p-4 border">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-sm mb-1">Survey Link Preview</p>
                  <code className="text-xs bg-background px-2 py-1 rounded border">
                    {typeof window !== 'undefined' ? `${window.location.origin}/survey/${sharingSurvey?.id}` : ''}
                  </code>
                  <p className="text-xs text-muted-foreground mt-2">
                    Recipients will receive this link to complete the survey.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsShareDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleShareSurvey}
              disabled={isSending || (selectedRecipients.length === 0 && !manualEmail.trim())}
              className="gap-2"
            >
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Share Survey
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}