import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import {
  Edit,
  Trash2,
  Mail,
  Calendar,
  Plus,
  UserPlus,
  Search,
  MoreHorizontal,
  Phone,
  Building2,
  FolderKanban,
  Layers,
  Shield,
  UserCheck,
  UserX,
  Users,
  X,
  Clock,
  Send,
  Copy,
  CheckCircle2,
  AlertCircle,
  Timer,
  BarChart3,
  Sparkles,
  Brain,
  Lightbulb,
  Wand2,
  Target,
  Zap,
  RefreshCw,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  CheckCheck,
  GraduationCap,
  Loader2,
} from "lucide-react";

// Use relative path - proxy handles the backend URL
const API_BASE_URL = '/api/v1';

// Types
interface ProjectAssignment {
  projectId: string;
  projectName: string;
  role: string;
  assignedAt: string;
}

interface ProgramAssignment {
  programId: string;
  programName: string;
  role: string;
  assignedAt: string;
}

interface TimeTrackingStats {
  enabled: boolean;
  totalHours: number;
  thisWeek: number;
  thisMonth: number;
  lastEntry?: string;
}

interface Invitation {
  id: string;
  email: string;
  type: "project" | "program";
  itemId: string;
  itemName: string;
  role: string;
  status: "pending" | "accepted" | "expired";
  sentAt: string;
  expiresAt: string;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "ADMIN" | "PM" | "MEMBER" | "REVIEWER" | "GUEST";
  department?: string;
  status: "Active" | "Inactive" | "Pending";
  joinedDate: string;
  lastActive?: string;
  projectAssignments: ProjectAssignment[];
  programAssignments: ProgramAssignment[];
  timeTracking: TimeTrackingStats;
  invitations: Invitation[];
}

interface Project {
  id: string;
  name: string;
  status: string;
  methodology: string;
}

interface Program {
  id: string;
  name: string;
  status: string;
  methodology: string;
}

// AI-related interfaces
interface AITeamSuggestion {
  role: string;
  reason: string;
  priority: "high" | "medium" | "low";
  suggestedMembers: {
    memberId: string;
    memberName: string;
    matchScore: number;
    reasons: string[];
  }[];
}

interface AIWorkloadAnalysis {
  memberId: string;
  memberName: string;
  currentLoad: number;
  status: "underutilized" | "optimal" | "overloaded";
  recommendation: string;
  projectCount: number;
  hoursThisWeek: number;
}

interface AIOnboardingPlan {
  memberId: string;
  tasks: {
    id: string;
    title: string;
    description: string;
    dueDay: number;
    category: "setup" | "training" | "introduction" | "documentation";
  }[];
}

// API fetch functions
const fetchTeamMembers = async (): Promise<TeamMember[]> => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_BASE_URL}/auth/company-users/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch team members');
  }
  
  const data = await response.json();
  const members = Array.isArray(data) ? data : data.results || [];
  
  // Map backend data to frontend format
  return members.map((m: any) => ({
    id: String(m.id),
    name: m.name || m.full_name || `${m.first_name || ''} ${m.last_name || ''}`.trim() || m.username || 'Unknown',
    email: m.email || '',
    phone: m.phone || m.phone_number || '',
    role: mapBackendRole(m.role),
    department: m.department || '',
    status: mapBackendStatus(m.status || m.is_active),
    joinedDate: m.date_joined ? new Date(m.date_joined).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown',
    lastActive: m.last_login ? new Date(m.last_login).toLocaleDateString() : undefined,
    projectAssignments: (m.project_assignments || m.projects || []).map((p: any) => ({
      projectId: String(p.project_id || p.id),
      projectName: p.project_name || p.name || 'Unknown Project',
      role: p.role || 'Member',
      assignedAt: p.assigned_at || p.created_at || new Date().toISOString().split('T')[0],
    })),
    programAssignments: (m.program_assignments || m.programs || []).map((p: any) => ({
      programId: String(p.program_id || p.id),
      programName: p.program_name || p.name || 'Unknown Program',
      role: p.role || 'Member',
      assignedAt: p.assigned_at || p.created_at || new Date().toISOString().split('T')[0],
    })),
    timeTracking: {
      enabled: m.time_tracking_enabled ?? m.timeTracking?.enabled ?? true,
      totalHours: m.total_hours || m.timeTracking?.totalHours || 0,
      thisWeek: m.hours_this_week || m.timeTracking?.thisWeek || 0,
      thisMonth: m.hours_this_month || m.timeTracking?.thisMonth || 0,
      lastEntry: m.last_time_entry || m.timeTracking?.lastEntry,
    },
    invitations: (m.invitations || []).map((inv: any) => ({
      id: String(inv.id),
      email: inv.email,
      type: inv.type || 'project',
      itemId: String(inv.item_id || inv.project_id || inv.program_id),
      itemName: inv.item_name || inv.project_name || inv.program_name || 'Unknown',
      role: inv.role || 'Member',
      status: inv.status || 'pending',
      sentAt: inv.sent_at || inv.created_at || new Date().toISOString().split('T')[0],
      expiresAt: inv.expires_at || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    })),
  }));
};

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
    status: p.status || 'active',
    methodology: p.methodology || 'hybrid',
  }));
};

const fetchPrograms = async (): Promise<Program[]> => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_BASE_URL}/programs/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  if (!response.ok) return [];
  
  const data = await response.json();
  const programs = Array.isArray(data) ? data : data.results || [];
  
  return programs.map((p: any) => ({
    id: String(p.id),
    name: p.name || p.title || 'Unnamed Program',
    status: p.status || 'active',
    methodology: p.methodology || 'hybrid',
  }));
};

// Helper functions to map backend values
const mapBackendRole = (role: string): TeamMember['role'] => {
  const roleMap: Record<string, TeamMember['role']> = {
    'superadmin': 'ADMIN',
    'admin': 'ADMIN',
    'administrator': 'ADMIN',
    'pm': 'PM',
    'project_manager': 'PM',
    'member': 'MEMBER',
    'contibuter': 'MEMBER',
    'contributor': 'MEMBER',
    'reviewer': 'REVIEWER',
    'guest': 'GUEST',
  };
  return roleMap[role?.toLowerCase()] || 'MEMBER';
};

const mapBackendStatus = (status: string | boolean): TeamMember['status'] => {
  if (typeof status === 'boolean') {
    return status ? 'Active' : 'Inactive';
  }
  const statusMap: Record<string, TeamMember['status']> = {
    'active': 'Active',
    'inactive': 'Inactive',
    'pending': 'Pending',
  };
  return statusMap[status?.toLowerCase()] || 'Active';
};

// Methodology-specific roles for Projects
const getProjectRolesByMethodology = (methodology: string): string[] => {
  const roles: Record<string, string[]> = {
    scrum: ["Scrum Master", "Product Owner", "Development Team Member", "UX Designer", "QA Engineer", "DevOps Engineer", "Stakeholder"],
    kanban: ["Service Delivery Manager", "Service Request Manager", "Flow Manager", "Team Member", "Stakeholder"],
    prince2: ["Executive", "Senior User", "Senior Supplier", "Project Manager", "Team Manager", "Project Assurance", "Change Authority", "Project Support"],
    waterfall: ["Project Manager", "Business Analyst", "Solution Architect", "Technical Lead", "Developer", "Tester", "Database Administrator", "Documentation Specialist"],
    agile: ["Product Owner", "Agile Coach", "Developer", "Designer", "QA Engineer", "DevOps Engineer", "Technical Writer", "Stakeholder"],
    lean_six_sigma_green: ["Project Champion", "Green Belt", "Process Owner", "Team Member", "Subject Matter Expert", "Data Analyst", "Stakeholder"],
    lean_six_sigma_black: ["Project Champion", "Black Belt", "Green Belt", "Process Owner", "Master Black Belt", "Team Member", "Data Analyst", "Stakeholder"],
    hybrid: ["Project Manager", "Product Owner", "Scrum Master", "Developer", "Designer", "Business Analyst", "QA Engineer", "Stakeholder"],
  };
  return roles[methodology] || roles.hybrid;
};

// Methodology-specific roles for Programs
const getProgramRolesByMethodology = (methodology: string): string[] => {
  const roles: Record<string, string[]> = {
    safe: ["Release Train Engineer (RTE)", "Product Manager", "System Architect", "Business Owner", "Scrum Master", "Product Owner", "Agile Team Member", "Solution Train Engineer", "Epic Owner"],
    msp: ["Senior Responsible Owner (SRO)", "Programme Manager", "Business Change Manager (BCM)", "Programme Office Manager", "Benefits Realization Manager", "Design Authority", "Project Executive", "Stakeholder"],
    pmi: ["Program Manager", "Program Director", "Program Coordinator", "Benefits Manager", "Stakeholder Engagement Manager", "Governance Board Member", "Project Manager", "PMO Analyst"],
    prince2_programme: ["Sponsoring Group Member", "Programme Director", "Programme Manager", "Business Change Manager", "Senior Business Change Manager", "Programme Office Manager", "Design Authority", "Benefits Manager"],
    hybrid: ["Program Lead", "Program Manager", "Project Manager", "Business Analyst", "Solution Architect", "Change Manager", "Benefits Manager", "Stakeholder", "PMO Analyst"],
  };
  return roles[methodology] || roles.hybrid;
};

// Get methodology display name
const getMethodologyDisplayName = (methodology: string): string => {
  const names: Record<string, string> = {
    scrum: "Scrum",
    kanban: "Kanban",
    prince2: "PRINCE2",
    waterfall: "Waterfall",
    agile: "Agile",
    lean_six_sigma_green: "Lean Six Sigma (Green Belt)",
    lean_six_sigma_black: "Lean Six Sigma (Black Belt)",
    hybrid: "Hybrid",
    safe: "SAFe",
    msp: "MSP",
    pmi: "PMI Standard",
    prince2_programme: "PRINCE2 Programme",
  };
  return names[methodology] || methodology;
};

// Get methodology badge color
const getMethodologyBadgeColor = (methodology: string): string => {
  const colors: Record<string, string> = {
    scrum: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    kanban: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    prince2: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    waterfall: "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400",
    agile: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
    lean_six_sigma_green: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    lean_six_sigma_black: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
    hybrid: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400",
    safe: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    msp: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    pmi: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    prince2_programme: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  };
  return colors[methodology] || colors.hybrid;
};

const departments = ["IT", "Operations", "Development", "Design", "Finance", "HR", "Marketing", "Sales"];

export default function Team() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const tt = t.team || {
    title: "Team Management",
    createNewMember: "Create A New Member",
    addNewMember: "Add New Member",
    active: "Active",
    inactive: "Inactive",
    joined: "Joined",
  };

  // Fetch data from API
  const { data: members = [], isLoading: membersLoading, refetch: refetchMembers } = useQuery({
    queryKey: ['team-members'],
    queryFn: fetchTeamMembers,
  });

  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['projects-list'],
    queryFn: fetchProjects,
  });

  const { data: programs = [], isLoading: programsLoading } = useQuery({
    queryKey: ['programs-list'],
    queryFn: fetchPrograms,
  });

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [assignmentType, setAssignmentType] = useState<"project" | "program">("project");

  // New member form
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    phone: "",
    role: "MEMBER" as const,
    department: "",
    enableTimeTracking: true,
  });

  // Assignment state
  const [selectedItemId, setSelectedItemId] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  // Invite state
  const [inviteEmails, setInviteEmails] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviteItemId, setInviteItemId] = useState("");
  const [inviteRole, setInviteRole] = useState("");
  const [inviteType, setInviteType] = useState<"project" | "program">("project");
  const [generatedLink, setGeneratedLink] = useState("");

  // AI-related state
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isAITeamBuilderOpen, setIsAITeamBuilderOpen] = useState(false);
  const [isAIWorkloadOpen, setIsAIWorkloadOpen] = useState(false);
  const [isAIOnboardingOpen, setIsAIOnboardingOpen] = useState(false);
  const [aiSelectedProject, setAiSelectedProject] = useState("");
  const [aiSelectedProgram, setAiSelectedProgram] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiTeamSuggestions, setAiTeamSuggestions] = useState<AITeamSuggestion[]>([]);
  const [aiWorkloadAnalysis, setAiWorkloadAnalysis] = useState<AIWorkloadAnalysis[]>([]);
  const [aiGeneratedMessage, setAiGeneratedMessage] = useState("");
  const [aiOnboardingPlan, setAiOnboardingPlan] = useState<AIOnboardingPlan | null>(null);

  // Filter members
  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.department?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || member.role === roleFilter;
    const matchesStatus = statusFilter === "all" || member.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Stats
  const stats = {
    total: members.length,
    active: members.filter((m) => m.status === "Active").length,
    inactive: members.filter((m) => m.status === "Inactive").length,
    pending: members.filter((m) => m.status === "Pending").length,
    timeTrackingEnabled: members.filter((m) => m.timeTracking.enabled).length,
    totalHoursThisWeek: members.reduce((sum, m) => sum + m.timeTracking.thisWeek, 0),
  };

  // Helpers
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      ADMIN: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
      PM: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
      MEMBER: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
      REVIEWER: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800",
      GUEST: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800",
    };
    return colors[role] || "bg-muted text-muted-foreground border-border";
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      Inactive: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
      Pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    };
    return colors[status] || "bg-muted text-muted-foreground";
  };

  const getInviteStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      accepted: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      expired: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    };
    return colors[status] || "bg-muted text-muted-foreground";
  };

  // Create member mutation - FIXED: use /users/ endpoint
  const createMemberMutation = useMutation({
    mutationFn: async (memberData: typeof newMember) => {
      const token = localStorage.getItem("access_token");
      
      // Prepare payload for backend
      const payload = {
        name: memberData.name,
        email: memberData.email,
        phone: memberData.phone || '',
        role: memberData.role.toLowerCase(),
        department: memberData.department || '',
        time_tracking_enabled: memberData.enableTimeTracking,
      };
      
      console.log('Creating team member with payload:', payload);
      
      const response = await fetch(`${API_BASE_URL}/auth/admin/create-user/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to create member:', response.status, errorData);
        throw new Error('Failed to create member');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      setNewMember({ name: "", email: "", phone: "", role: "MEMBER", department: "", enableTimeTracking: true });
      setIsCreateDialogOpen(false);
      toast({
        title: "Teamlid aangemaakt",
        description: "Het nieuwe teamlid is succesvol toegevoegd.",
      });
    },
    onError: (error) => {
      console.error('Create member error:', error);
      toast({
        title: "Fout",
        description: "Kon teamlid niet aanmaken.",
        variant: "destructive",
      });
    },
  });

  // Delete member mutation - FIXED: use /users/{id}/ endpoint
  const deleteMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_BASE_URL}/auth/admin/users/${memberId}/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete member');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      setIsDeleteDialogOpen(false);
      setSelectedMember(null);
      toast({
        title: "Teamlid verwijderd",
        description: "Het teamlid is verwijderd.",
      });
    },
    onError: () => {
      toast({
        title: "Fout",
        description: "Kon teamlid niet verwijderen.",
        variant: "destructive",
      });
    },
  });

  // Handlers
  const handleCreateMember = () => {
    if (!newMember.name || !newMember.email) {
      toast({
        title: "Velden verplicht",
        description: "Vul naam en e-mail in.",
        variant: "destructive",
      });
      return;
    }
    createMemberMutation.mutate(newMember);
  };

  const handleDeleteMember = () => {
    if (!selectedMember) return;
    deleteMemberMutation.mutate(selectedMember.id);
  };

  const handleToggleStatus = async (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;
    
    const newStatus = member.status === "Active" ? "inactive" : "active";
    
    try {
      const token = localStorage.getItem("access_token");
      await fetch(`${API_BASE_URL}/users/${memberId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast({
        title: "Status bijgewerkt",
        description: "De status is gewijzigd.",
      });
    } catch (error) {
      toast({
        title: "Fout",
        description: "Kon status niet bijwerken.",
        variant: "destructive",
      });
    }
  };

  const handleToggleTimeTracking = async (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;
    
    try {
      const token = localStorage.getItem("access_token");
      await fetch(`${API_BASE_URL}/users/${memberId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ time_tracking_enabled: !member.timeTracking.enabled }),
      });
      
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast({
        title: member.timeTracking.enabled ? "Tijdregistratie uitgeschakeld" : "Tijdregistratie ingeschakeld",
        description: `Tijdregistratie is ${member.timeTracking.enabled ? "uitgeschakeld" : "ingeschakeld"} voor ${member.name}.`,
      });
    } catch (error) {
      toast({
        title: "Fout",
        description: "Kon tijdregistratie niet bijwerken.",
        variant: "destructive",
      });
    }
  };

  const handleAssignment = async () => {
    if (!selectedMember || !selectedItemId || !selectedRole) {
      toast({
        title: "Selectie verplicht",
        description: "Selecteer een project/programma en rol.",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const endpoint = assignmentType === "project" 
        ? `${API_BASE_URL}/projects/${selectedItemId}/team/`
        : `${API_BASE_URL}/programs/${selectedItemId}/team/`;
      
      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: parseInt(selectedMember.id, 10),
          role: selectedRole,
        }),
      });

      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      setSelectedItemId("");
      setSelectedRole("");
      setIsAssignDialogOpen(false);

      toast({
        title: "Toewijzing succesvol",
        description: `${selectedMember.name} is toegewezen.`,
      });
    } catch (error) {
      toast({
        title: "Fout",
        description: "Kon toewijzing niet maken.",
        variant: "destructive",
      });
    }
  };

  const handleSendInvitation = async () => {
    if (!inviteEmails || !inviteItemId || !inviteRole) {
      toast({
        title: "Velden verplicht",
        description: "Vul alle verplichte velden in.",
        variant: "destructive",
      });
      return;
    }

    const emails = inviteEmails.split(",").map((e) => e.trim()).filter((e) => e);
    const item = inviteType === "project" 
      ? projects.find((p) => p.id === inviteItemId)
      : programs.find((p) => p.id === inviteItemId);

    if (!item) return;

    try {
      const token = localStorage.getItem("access_token");
      await fetch(`${API_BASE_URL}/invitations/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          emails,
          type: inviteType,
          item_id: parseInt(inviteItemId, 10),
          role: inviteRole,
          message: inviteMessage,
        }),
      });

      // Generate invite link
      const baseUrl = window.location.origin;
      const inviteToken = btoa(JSON.stringify({ itemId: inviteItemId, type: inviteType, role: inviteRole }));
      setGeneratedLink(`${baseUrl}/invite/${inviteToken}`);

      queryClient.invalidateQueries({ queryKey: ['team-members'] });

      toast({
        title: "Uitnodigingen verzonden",
        description: `${emails.length} uitnodiging(en) verzonden voor ${item.name}.`,
      });
    } catch (error) {
      toast({
        title: "Fout",
        description: "Kon uitnodigingen niet versturen.",
        variant: "destructive",
      });
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    toast({
      title: "Link gekopieerd",
      description: "De uitnodigingslink is gekopieerd naar het klembord.",
    });
  };

  const resetInviteForm = () => {
    setInviteEmails("");
    setInviteMessage("");
    setInviteItemId("");
    setInviteRole("");
    setGeneratedLink("");
  };

  // AI Functions (simplified - would call backend AI endpoints in production)
  const analyzeWorkload = async () => {
    setAiLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1200));

    const analysis: AIWorkloadAnalysis[] = members
      .filter(m => m.status === "Active" && m.timeTracking.enabled)
      .map(m => {
        const loadPercentage = (m.timeTracking.thisWeek / 40) * 100;
        let status: "underutilized" | "optimal" | "overloaded";
        let recommendation: string;

        if (loadPercentage < 50) {
          status = "underutilized";
          recommendation = `${m.name} heeft capaciteit beschikbaar. Overweeg toewijzing aan nieuwe projecten.`;
        } else if (loadPercentage > 100) {
          status = "overloaded";
          recommendation = `${m.name} is overbelast. Heroverweeg de huidige toewijzingen of verdeel taken.`;
        } else {
          status = "optimal";
          recommendation = `${m.name} heeft een gezonde werkbelasting. Behoud de huidige toewijzingen.`;
        }

        return {
          memberId: m.id,
          memberName: m.name,
          currentLoad: Math.round(loadPercentage),
          status,
          recommendation,
          projectCount: m.projectAssignments.length + m.programAssignments.length,
          hoursThisWeek: m.timeTracking.thisWeek,
        };
      })
      .sort((a, b) => b.currentLoad - a.currentLoad);

    setAiWorkloadAnalysis(analysis);
    setAiLoading(false);
  };

  // Loading state
  if (membersLoading) {
    return (
      <div className="min-h-full bg-background p-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-muted-foreground">Team laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{tt.title}</h1>
            <p className="text-muted-foreground">Beheer teamleden, toewijzingen en tijdregistratie</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {/* AI Assistant Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20">
                  <Sparkles className="h-4 w-4" />
                  AI Assistent
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => setIsAITeamBuilderOpen(true)}>
                  <Brain className="h-4 w-4 mr-2 text-purple-500" />
                  <div>
                    <p className="font-medium">Team Samenstelling</p>
                    <p className="text-xs text-muted-foreground">Analyseer en optimaliseer teams</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  analyzeWorkload();
                  setIsAIWorkloadOpen(true);
                }}>
                  <BarChart3 className="h-4 w-4 mr-2 text-blue-500" />
                  <div>
                    <p className="font-medium">Werkbelasting Analyse</p>
                    <p className="text-xs text-muted-foreground">Bekijk capaciteit & balans</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsAIAssistantOpen(true)}>
                  <Lightbulb className="h-4 w-4 mr-2 text-amber-500" />
                  <div>
                    <p className="font-medium">Slimme Suggesties</p>
                    <p className="text-xs text-muted-foreground">Tips voor teambeheer</p>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              onClick={() => {
                resetInviteForm();
                setIsInviteDialogOpen(true);
              }}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              Uitnodigen
            </Button>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
              <UserPlus className="h-4 w-4" />
              {tt.addNewMember}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Totaal</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <UserCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.active}</p>
                  <p className="text-xs text-muted-foreground">Actief</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-900/30">
                  <UserX className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.inactive}</p>
                  <p className="text-xs text-muted-foreground">Inactief</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                  <Shield className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-xs text-muted-foreground">In afwachting</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.timeTrackingEnabled}</p>
                  <p className="text-xs text-muted-foreground">Tijdreg. actief</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <Timer className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalHoursThisWeek}u</p>
                  <p className="text-xs text-muted-foreground">Deze week</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Zoek op naam, e-mail of afdeling..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Alle rollen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle rollen</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="PM">Project Manager</SelectItem>
                  <SelectItem value="MEMBER">Member</SelectItem>
                  <SelectItem value="REVIEWER">Reviewer</SelectItem>
                  <SelectItem value="GUEST">Guest</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Alle statussen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle statussen</SelectItem>
                  <SelectItem value="Active">Actief</SelectItem>
                  <SelectItem value="Inactive">Inactief</SelectItem>
                  <SelectItem value="Pending">In afwachting</SelectItem>
                </SelectContent>
              </Select>
              {(searchQuery || roleFilter !== "all" || statusFilter !== "all") && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSearchQuery("");
                    setRoleFilter("all");
                    setStatusFilter("all");
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  Reset
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMembers.map((member) => (
            <Card
              key={member.id}
              className="group relative overflow-hidden border-border bg-card hover:shadow-lg transition-all duration-300 hover:border-primary/50"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <CardContent className="p-6 relative">
                {/* Header with Avatar and Actions */}
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => {
                      setSelectedMember(member);
                      setIsDetailDialogOpen(true);
                    }}
                  >
                    <Avatar className="h-12 w-12 border-2 border-primary/20">
                      <AvatarFallback className="bg-primary/10 text-primary text-base font-semibold">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-foreground text-base mb-0.5 hover:text-primary transition-colors">
                        {member.name}
                      </h3>
                      <Badge variant="outline" className={cn("text-xs", getRoleColor(member.role))}>
                        {member.role}
                      </Badge>
                    </div>
                  </div>

                  {/* Action menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedMember(member);
                          setIsDetailDialogOpen(true);
                        }}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Details bekijken
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedMember(member);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Bewerken
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedMember(member);
                          setAssignmentType("project");
                          setIsAssignDialogOpen(true);
                        }}
                      >
                        <FolderKanban className="h-4 w-4 mr-2" />
                        Toewijzen aan project
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedMember(member);
                          setAssignmentType("program");
                          setIsAssignDialogOpen(true);
                        }}
                      >
                        <Layers className="h-4 w-4 mr-2" />
                        Toewijzen aan programma
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleToggleTimeTracking(member.id)}>
                        <Clock className="h-4 w-4 mr-2" />
                        {member.timeTracking.enabled ? "Tijdregistratie uit" : "Tijdregistratie aan"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleStatus(member.id)}>
                        {member.status === "Active" ? (
                          <>
                            <UserX className="h-4 w-4 mr-2" />
                            Deactiveren
                          </>
                        ) : (
                          <>
                            <UserCheck className="h-4 w-4 mr-2" />
                            Activeren
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => {
                          setSelectedMember(member);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Verwijderen
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Status Badges */}
                <div className="flex gap-2 mb-4">
                  <Badge variant="secondary" className={cn("text-xs", getStatusColor(member.status))}>
                    {member.status === "Active" ? "Actief" : member.status === "Inactive" ? "Inactief" : "In afwachting"}
                  </Badge>
                  {member.timeTracking.enabled && (
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
                      <Clock className="h-3 w-3 mr-1" />
                      Tijdreg.
                    </Badge>
                  )}
                </div>

                {/* Member Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{member.email}</span>
                  </div>
                  {member.department && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building2 className="h-3.5 w-3.5 shrink-0" />
                      <span>{member.department}</span>
                    </div>
                  )}
                </div>

                {/* Time Tracking Stats */}
                {member.timeTracking.enabled && member.timeTracking.thisWeek > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                      <span>Deze week</span>
                      <span className="font-medium">{member.timeTracking.thisWeek}u / 40u</span>
                    </div>
                    <Progress value={(member.timeTracking.thisWeek / 40) * 100} className="h-1.5" />
                  </div>
                )}

                {/* Assignment counts */}
                {(member.projectAssignments.length > 0 || member.programAssignments.length > 0) && (
                  <div className="mt-4 pt-4 border-t flex gap-4">
                    {member.projectAssignments.length > 0 && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <FolderKanban className="h-3.5 w-3.5" />
                        <span>{member.projectAssignments.length} project(en)</span>
                      </div>
                    )}
                    {member.programAssignments.length > 0 && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Layers className="h-3.5 w-3.5" />
                        <span>{member.programAssignments.length} programma('s)</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Pending Invitations Badge */}
                {member.invitations.filter((i) => i.status === "pending").length > 0 && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-yellow-600 dark:text-yellow-400">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>{member.invitations.filter((i) => i.status === "pending").length} uitnodiging(en) in afwachting</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {/* Add New Member Card */}
          <Card
            className="border-2 border-dashed border-border bg-card/50 hover:bg-accent/30 hover:border-primary/50 transition-all duration-300 cursor-pointer group min-h-[280px]"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <CardContent className="p-6 h-full flex flex-col items-center justify-center gap-4">
              <div className="rounded-full bg-primary/10 p-4 group-hover:bg-primary/20 transition-colors">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground mb-1">{tt.createNewMember}</p>
                <p className="text-xs text-muted-foreground">Voeg een nieuw teamlid toe</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Empty state */}
        {filteredMembers.length === 0 && (
          <Card className="mt-6">
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Geen teamleden gevonden</h3>
              <p className="text-muted-foreground mb-4">
                Pas je filters aan of voeg een nieuw teamlid toe.
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                {tt.addNewMember}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Member Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nieuw Teamlid Toevoegen</DialogTitle>
            <DialogDescription>Vul de gegevens in voor het nieuwe teamlid.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Naam *</Label>
              <Input
                id="name"
                placeholder="Volledige naam"
                value={newMember.name}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail *</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@company.nl"
                value={newMember.email}
                onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefoonnummer</Label>
              <Input
                id="phone"
                placeholder="+31 6 12345678"
                value={newMember.phone}
                onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Rol</Label>
                <Select
                  value={newMember.role}
                  onValueChange={(value: any) => setNewMember({ ...newMember, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="PM">Project Manager</SelectItem>
                    <SelectItem value="MEMBER">Member</SelectItem>
                    <SelectItem value="REVIEWER">Reviewer</SelectItem>
                    <SelectItem value="GUEST">Guest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Afdeling</Label>
                <Select
                  value={newMember.department}
                  onValueChange={(value) => setNewMember({ ...newMember, department: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer..." />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Tijdregistratie inschakelen</Label>
                <p className="text-xs text-muted-foreground">Sta toe dat dit lid uren registreert</p>
              </div>
              <Switch
                checked={newMember.enableTimeTracking}
                onCheckedChange={(checked) => setNewMember({ ...newMember, enableTimeTracking: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Annuleren
            </Button>
            <Button onClick={handleCreateMember} disabled={createMemberMutation.isPending}>
              {createMemberMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Toevoegen...
                </>
              ) : (
                'Toevoegen'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assignment Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {assignmentType === "project" ? "Toewijzen aan Project" : "Toewijzen aan Programma"}
            </DialogTitle>
            <DialogDescription>
              Wijs {selectedMember?.name} toe aan een {assignmentType === "project" ? "project" : "programma"}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{assignmentType === "project" ? "Project" : "Programma"}</Label>
              <Select 
                value={selectedItemId} 
                onValueChange={(value) => {
                  setSelectedItemId(value);
                  setSelectedRole("");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Selecteer ${assignmentType === "project" ? "project" : "programma"}...`} />
                </SelectTrigger>
                <SelectContent>
                  {(assignmentType === "project" ? projects : programs).map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      <div className="flex items-center gap-2">
                        {assignmentType === "project" ? (
                          <FolderKanban className="h-4 w-4" />
                        ) : (
                          <Layers className="h-4 w-4" />
                        )}
                        <span>{item.name}</span>
                        <Badge variant="secondary" className={cn("text-xs ml-2", getMethodologyBadgeColor(item.methodology))}>
                          {getMethodologyDisplayName(item.methodology)}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedItemId && (
              <div className="p-3 rounded-lg bg-muted/50 border">
                <p className="text-xs text-muted-foreground mb-1">Methodology</p>
                <Badge className={cn(
                  getMethodologyBadgeColor(
                    assignmentType === "project"
                      ? projects.find(p => p.id === selectedItemId)?.methodology || "hybrid"
                      : programs.find(p => p.id === selectedItemId)?.methodology || "hybrid"
                  )
                )}>
                  {getMethodologyDisplayName(
                    assignmentType === "project"
                      ? projects.find(p => p.id === selectedItemId)?.methodology || "hybrid"
                      : programs.find(p => p.id === selectedItemId)?.methodology || "hybrid"
                  )}
                </Badge>
              </div>
            )}
            
            <div className="space-y-2">
              <Label>Rol {selectedItemId && "(gebaseerd op methodology)"}</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole} disabled={!selectedItemId}>
                <SelectTrigger>
                  <SelectValue placeholder={selectedItemId ? "Selecteer rol..." : "Selecteer eerst een project/programma"} />
                </SelectTrigger>
                <SelectContent>
                  {selectedItemId && (
                    assignmentType === "project"
                      ? getProjectRolesByMethodology(projects.find(p => p.id === selectedItemId)?.methodology || "hybrid")
                      : getProgramRolesByMethodology(programs.find(p => p.id === selectedItemId)?.methodology || "hybrid")
                  ).map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              Annuleren
            </Button>
            <Button onClick={handleAssignment}>Toewijzen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invite Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={(open) => {
        setIsInviteDialogOpen(open);
        if (!open) resetInviteForm();
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Teamleden Uitnodigen
            </DialogTitle>
            <DialogDescription>
              Nodig mensen uit om deel te nemen aan een project of programma.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Tabs value={inviteType} onValueChange={(v) => {
              setInviteType(v as "project" | "program");
              setInviteItemId("");
              setInviteRole("");
            }}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="project" className="gap-2">
                  <FolderKanban className="h-4 w-4" />
                  Project
                </TabsTrigger>
                <TabsTrigger value="program" className="gap-2">
                  <Layers className="h-4 w-4" />
                  Programma
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="space-y-2">
              <Label>{inviteType === "project" ? "Project" : "Programma"} *</Label>
              <Select 
                value={inviteItemId} 
                onValueChange={(value) => {
                  setInviteItemId(value);
                  setInviteRole("");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Selecteer ${inviteType === "project" ? "project" : "programma"}...`} />
                </SelectTrigger>
                <SelectContent>
                  {(inviteType === "project" ? projects : programs).map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      <div className="flex items-center gap-2">
                        <span>{item.name}</span>
                        <Badge variant="secondary" className={cn("text-xs", getMethodologyBadgeColor(item.methodology))}>
                          {getMethodologyDisplayName(item.methodology)}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Rol *</Label>
              <Select value={inviteRole} onValueChange={setInviteRole} disabled={!inviteItemId}>
                <SelectTrigger>
                  <SelectValue placeholder={inviteItemId ? "Selecteer rol..." : "Selecteer eerst een project/programma"} />
                </SelectTrigger>
                <SelectContent>
                  {inviteItemId && (
                    inviteType === "project"
                      ? getProjectRolesByMethodology(projects.find(p => p.id === inviteItemId)?.methodology || "hybrid")
                      : getProgramRolesByMethodology(programs.find(p => p.id === inviteItemId)?.methodology || "hybrid")
                  ).map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="invite-emails">E-mailadressen *</Label>
              <Textarea
                id="invite-emails"
                placeholder="jan@company.nl, maria@company.nl, ..."
                value={inviteEmails}
                onChange={(e) => setInviteEmails(e.target.value)}
                rows={2}
              />
              <p className="text-xs text-muted-foreground">Meerdere e-mailadressen scheiden met een komma</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="invite-message">Persoonlijk bericht (optioneel)</Label>
              <Textarea
                id="invite-message"
                placeholder="Voeg een persoonlijk bericht toe aan de uitnodiging..."
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                rows={4}
              />
            </div>

            {generatedLink && (
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-400 mb-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="font-medium">Uitnodigingen verzonden!</span>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Of deel deze link:</Label>
                  <div className="flex gap-2">
                    <Input value={generatedLink} readOnly className="text-xs" />
                    <Button size="sm" variant="outline" onClick={handleCopyLink}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsInviteDialogOpen(false);
              resetInviteForm();
            }}>
              {generatedLink ? "Sluiten" : "Annuleren"}
            </Button>
            {!generatedLink && (
              <Button onClick={handleSendInvitation} className="gap-2">
                <Send className="h-4 w-4" />
                Uitnodigingen Versturen
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Member Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Teamlid Details</DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16 border-2 border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                    {getInitials(selectedMember.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{selectedMember.name}</h3>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge variant="outline" className={cn(getRoleColor(selectedMember.role))}>
                      {selectedMember.role}
                    </Badge>
                    <Badge variant="secondary" className={cn(getStatusColor(selectedMember.status))}>
                      {selectedMember.status === "Active" ? "Actief" : selectedMember.status === "Inactive" ? "Inactief" : "In afwachting"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedMember.email}</span>
                </div>
                {selectedMember.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedMember.phone}</span>
                  </div>
                )}
                {selectedMember.department && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedMember.department}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Lid sinds {selectedMember.joinedDate}</span>
                </div>
              </div>

              {/* Time Tracking Stats */}
              {selectedMember.timeTracking.enabled && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-4 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Tijdregistratie Overzicht
                    </h4>
                    <div className="grid grid-cols-4 gap-4">
                      <Card>
                        <CardContent className="p-4 text-center">
                          <p className="text-2xl font-bold text-primary">{selectedMember.timeTracking.thisWeek}u</p>
                          <p className="text-xs text-muted-foreground">Deze week</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <p className="text-2xl font-bold">{selectedMember.timeTracking.thisMonth}u</p>
                          <p className="text-xs text-muted-foreground">Deze maand</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <p className="text-2xl font-bold">{selectedMember.timeTracking.totalHours}u</p>
                          <p className="text-xs text-muted-foreground">Totaal</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4 text-center">
                          <p className="text-2xl font-bold">{Math.round((selectedMember.timeTracking.thisWeek / 40) * 100)}%</p>
                          <p className="text-xs text-muted-foreground">Weekdoel</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </>
              )}

              <Separator />

              {/* Assignments */}
              <Tabs defaultValue="projects" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="projects" className="gap-2">
                    <FolderKanban className="h-4 w-4" />
                    Projecten ({selectedMember.projectAssignments.length})
                  </TabsTrigger>
                  <TabsTrigger value="programs" className="gap-2">
                    <Layers className="h-4 w-4" />
                    Programma's ({selectedMember.programAssignments.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="projects" className="mt-4">
                  <div className="space-y-2">
                    {selectedMember.projectAssignments.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <FolderKanban className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>Geen projecten toegewezen</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => {
                            setAssignmentType("project");
                            setIsDetailDialogOpen(false);
                            setIsAssignDialogOpen(true);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Project toewijzen
                        </Button>
                      </div>
                    ) : (
                      <>
                        {selectedMember.projectAssignments.map((assignment) => (
                          <div
                            key={assignment.projectId}
                            className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <FolderKanban className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{assignment.projectName}</p>
                                <p className="text-xs text-muted-foreground">{assignment.role}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-2"
                          onClick={() => {
                            setAssignmentType("project");
                            setIsDetailDialogOpen(false);
                            setIsAssignDialogOpen(true);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Project toewijzen
                        </Button>
                      </>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="programs" className="mt-4">
                  <div className="space-y-2">
                    {selectedMember.programAssignments.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Layers className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>Geen programma's toegewezen</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => {
                            setAssignmentType("program");
                            setIsDetailDialogOpen(false);
                            setIsAssignDialogOpen(true);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Programma toewijzen
                        </Button>
                      </div>
                    ) : (
                      <>
                        {selectedMember.programAssignments.map((assignment) => (
                          <div
                            key={assignment.programId}
                            className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <Layers className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{assignment.programName}</p>
                                <p className="text-xs text-muted-foreground">{assignment.role}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-2"
                          onClick={() => {
                            setAssignmentType("program");
                            setIsDetailDialogOpen(false);
                            setIsAssignDialogOpen(true);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Programma toewijzen
                        </Button>
                      </>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* AI Workload Analysis Dialog */}
      <Dialog open={isAIWorkloadOpen} onOpenChange={setIsAIWorkloadOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              AI Werkbelasting Analyse
            </DialogTitle>
            <DialogDescription>
              Overzicht van de werkbelasting van alle actieve teamleden met AI-aanbevelingen.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {aiLoading ? (
              <div className="py-12 text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Werkbelasting analyseren...</p>
              </div>
            ) : aiWorkloadAnalysis.length > 0 ? (
              <>
                <div className="grid grid-cols-3 gap-4">
                  <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                        {aiWorkloadAnalysis.filter(a => a.status === "optimal").length}
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-500">Optimaal belast</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                        {aiWorkloadAnalysis.filter(a => a.status === "underutilized").length}
                      </p>
                      <p className="text-xs text-amber-600 dark:text-amber-500">Onderbenut</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-red-700 dark:text-red-400">
                        {aiWorkloadAnalysis.filter(a => a.status === "overloaded").length}
                      </p>
                      <p className="text-xs text-red-600 dark:text-red-500">Overbelast</p>
                    </CardContent>
                  </Card>
                </div>

                <Separator />

                <div className="space-y-3">
                  {aiWorkloadAnalysis.map((analysis) => (
                    <Card key={analysis.memberId} className={cn(
                      "border-l-4",
                      analysis.status === "optimal" ? "border-l-green-500" :
                      analysis.status === "underutilized" ? "border-l-amber-500" : "border-l-red-500"
                    )}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>{getInitials(analysis.memberName)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{analysis.memberName}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{analysis.projectCount} toewijzingen</span>
                                <span>•</span>
                                <span>{analysis.hoursThisWeek}u deze week</span>
                              </div>
                            </div>
                          </div>
                          <Badge variant="secondary" className={cn(
                            analysis.status === "optimal" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                            analysis.status === "underutilized" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                            "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          )}>
                            {analysis.status === "optimal" ? "Optimaal" :
                             analysis.status === "underutilized" ? "Onderbenut" : "Overbelast"}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Werkbelasting</span>
                            <span className="font-medium">{analysis.currentLoad}%</span>
                          </div>
                          <Progress 
                            value={Math.min(analysis.currentLoad, 100)} 
                            className={cn(
                              "h-2",
                              analysis.status === "overloaded" && "[&>div]:bg-red-500"
                            )}
                          />
                        </div>
                        
                        <div className="mt-3 p-2 rounded-lg bg-muted/50 flex items-start gap-2">
                          <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                          <p className="text-sm text-muted-foreground">{analysis.recommendation}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <div className="py-12 text-center text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Geen actieve teamleden met tijdregistratie gevonden.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Smart Suggestions Dialog */}
      <Dialog open={isAIAssistantOpen} onOpenChange={setIsAIAssistantOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              Slimme Suggesties
            </DialogTitle>
            <DialogDescription>
              AI-gegenereerde tips voor beter teambeheer.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {members.filter(m => m.status === "Pending").length > 0 && (
              <Card className="border-l-4 border-l-yellow-500">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0" />
                    <div>
                      <p className="font-medium">Openstaande uitnodigingen</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Er zijn {members.filter(m => m.status === "Pending").length} teamleden met status "In afwachting".
                      </p>
                      <Button variant="link" size="sm" className="px-0 mt-1" onClick={() => {
                        setStatusFilter("Pending");
                        setIsAIAssistantOpen(false);
                      }}>
                        Bekijk leden <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {members.some(m => m.status === "Active" && m.projectAssignments.length === 0 && m.programAssignments.length === 0) && (
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-blue-500 shrink-0" />
                    <div>
                      <p className="font-medium">Niet-toegewezen teamleden</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {members.filter(m => m.status === "Active" && m.projectAssignments.length === 0 && m.programAssignments.length === 0).length} actieve 
                        teamleden hebben geen project- of programmatoewijzingen.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {members.some(m => m.timeTracking.enabled && m.timeTracking.thisWeek > 45) && (
              <Card className="border-l-4 border-l-red-500">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-red-500 shrink-0" />
                    <div>
                      <p className="font-medium">Hoge werkbelasting gedetecteerd</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Sommige teamleden werken meer dan 45 uur deze week.
                      </p>
                      <Button variant="link" size="sm" className="px-0 mt-1" onClick={() => {
                        analyzeWorkload();
                        setIsAIWorkloadOpen(true);
                        setIsAIAssistantOpen(false);
                      }}>
                        Bekijk analyse <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <CheckCheck className="h-5 w-5 text-green-500 shrink-0" />
                  <div>
                    <p className="font-medium">Best Practice Tip</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Zorg dat elk project minimaal 1 Product Owner/Manager en 2-3 teamleden heeft.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Team Builder Dialog */}
      <Dialog open={isAITeamBuilderOpen} onOpenChange={setIsAITeamBuilderOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
              AI Team Samenstelling
            </DialogTitle>
            <DialogDescription>
              Analyseer welke rollen en teamleden het beste passen bij je project of programma.
            </DialogDescription>
          </DialogHeader>
          
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Selecteer een project of programma om AI-aanbevelingen te genereren.</p>
            <p className="text-sm mt-2">Deze functie is beschikbaar in de Pro versie.</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Teamlid Verwijderen</AlertDialogTitle>
            <AlertDialogDescription>
              Weet je zeker dat je {selectedMember?.name} wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuleren</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteMember} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMemberMutation.isPending}
            >
              {deleteMemberMutation.isPending ? 'Verwijderen...' : 'Verwijderen'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}