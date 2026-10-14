import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Edit2,
  Bot,
  ChevronDown,
  CheckCircle2,
  PauseCircle,
  RotateCcw,
  ArrowLeft,
  Trash2,
  Mail,
  Copy,
} from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ProjectAttentionPanel } from "./ProjectAttentionPanel";
import { ProjectKpiStrip } from "./ProjectKpiStrip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { usePageTranslations } from '@/hooks/usePageTranslations';
import { useAuth } from '@/contexts/AuthContext';
import { useCopilot } from "@/contexts/CopilotContext";
import { cn } from "@/lib/utils";

const PM_PLUS = ['pm', 'program_manager', 'admin', 'superadmin'];

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("access_token")}`,
});

const fetchProject = async (id: string) => {
  const response = await fetch(`/api/v1/projects/${id}/`, { headers: authHeaders() });
  if (!response.ok) throw new Error("Failed to fetch project");
  return response.json();
};

const fetchHealth = async (id: string) => {
  const response = await fetch(`/api/v1/projects/${id}/health/`, { headers: authHeaders() });
  if (!response.ok) throw new Error("Failed to fetch health");
  return response.json();
};

const updateProject = async ({ id, data }: { id: string; data: any }) => {
  const response = await fetch(`/api/v1/projects/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update project");
  return response.json();
};

const postLifecycle = async ({ id, action }: { id: string; action: "close" | "hold" | "reopen" }) => {
  const response = await fetch(`/api/v1/projects/${id}/${action}/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({}),
  });
  if (!response.ok) throw new Error(`Failed to ${action} project`);
  return response.json();
};

const deleteProject = async (id: string) => {
  const response = await fetch(`/api/v1/projects/${id}/`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error("Failed to delete project");
  return true;
};

/** status value -> badge label key + tailwind classes. */
const STATUS_META: Record<string, { key: string; className: string }> = {
  planning: { key: "Planning", className: "bg-slate-100 text-slate-700 border-slate-200" },
  pending: { key: "Pending", className: "bg-slate-100 text-slate-700 border-slate-200" },
  in_progress: { key: "In Progress", className: "bg-blue-50 text-blue-700 border-blue-200" },
  completed: { key: "Completed", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  on_hold: { key: "On Hold", className: "bg-amber-50 text-amber-700 border-amber-200" },
  cancelled: { key: "Cancelled", className: "bg-rose-50 text-rose-700 border-rose-200" },
};

const RAG_DOT: Record<string, string> = {
  green: "bg-emerald-500",
  amber: "bg-amber-500",
  red: "bg-rose-500",
};

export const ProjectHeader = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  // The attention panel belongs on the project dashboard/overview — which every
  // methodology renders through this shared header — so it shows for all types.
  const isOverview = /\/(overview|dashboard)(\/|$)/.test(location.pathname);
  const { user } = useAuth();
  const isPMPlus = PM_PLUS.includes(user?.role || '') || (user as any)?.isSuperAdmin === true;
  const queryClient = useQueryClient();
  const { openForProject } = useCopilot();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    budget: "",
    start_date: "",
    end_date: "",
  });
  const [dateError, setDateError] = useState<string | null>(null);
  // In-project invite (cross-tenant collaborator) — pre-linked to THIS project.
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("guest");
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [inviteSending, setInviteSending] = useState(false);
  const { pt } = usePageTranslations();

  const { data: project } = useQuery({
    queryKey: ["project", id],
    queryFn: () => fetchProject(id!),
    enabled: !!id,
  });

  const { data: health } = useQuery({
    queryKey: ["project-health", id],
    queryFn: () => fetchHealth(id!),
    enabled: !!id,
  });

  const invalidateProject = () => {
    queryClient.invalidateQueries({ queryKey: ["project", id] });
    queryClient.invalidateQueries({ queryKey: ["project-health", id] });
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
  };

  const updateMutation = useMutation({
    mutationFn: updateProject,
    onSuccess: () => {
      invalidateProject();
      toast.success(pt("Project updated successfully"));
      setEditOpen(false);
    },
    onError: () => toast.error(pt("Failed to update project")),
  });

  const lifecycleMutation = useMutation({
    mutationFn: postLifecycle,
    onSuccess: (data, variables) => {
      invalidateProject();
      const msg =
        variables.action === "close"
          ? pt("Project closed — all activities completed")
          : variables.action === "hold"
            ? pt("Project put on hold")
            : pt("Project reopened");
      toast.success(msg);
    },
    onError: () => toast.error(pt("Could not update project status")),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteProject(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success(pt("Project deleted successfully"));
      navigate("/projects");
    },
    onError: () => toast.error(pt("Failed to delete project")),
  });

  const handleEditClick = () => {
    if (project) {
      setFormData({
        name: project.name || "",
        description: project.description || "",
        budget: project.budget?.toString() || "",
        start_date: project.start_date || "",
        end_date: project.end_date || "",
      });
    }
    setDateError(null);
    setEditOpen(true);
  };

  const handleSave = () => {
    // Client-side guard that mirrors ProjectSerializer.validate_end_date
    // (end_date must not be before start_date). Prevents the known bad-data
    // case where end precedes start — the server would also reject it, but
    // we want fast, inline feedback.
    if (formData.start_date && formData.end_date && formData.end_date < formData.start_date) {
      setDateError(pt("End date cannot be before start date"));
      return;
    }
    setDateError(null);
    updateMutation.mutate({
      id: id!,
      data: {
        name: formData.name,
        description: formData.description,
        budget: parseFloat(formData.budget) || 0,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
      },
    });
  };

  // Map UI role → backend TeamInvitation.ROLE_CHOICES (mirrors Team.tsx).
  const roleMap: Record<string, string> = {
    admin: "admin", pm: "pm", program_manager: "program_manager",
    member: "guest", reviewer: "guest", guest: "guest",
  };

  const handleInvite = async () => {
    const email = inviteEmail.trim();
    if (!email) {
      toast.error(pt("Email is required"));
      return;
    }
    setInviteSending(true);
    setInviteLink("");
    try {
      const backendRole = roleMap[inviteRole] || "guest";
      const res = await fetch(`/api/v1/auth/invitations/create/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          email,
          role: backendRole,
          project_id: id ? parseInt(id, 10) : null,
          message: inviteMessage,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || data.message || "Invite failed");
      if (data.invitation_link) setInviteLink(data.invitation_link);
      toast.success(pt("Invitation sent"));
      setInviteEmail("");
      setInviteMessage("");
    } catch {
      toast.error(pt("Could not send invitation"));
    } finally {
      setInviteSending(false);
    }
  };

  const statusMeta = STATUS_META[project?.status] ?? STATUS_META.pending;

  return (
    <>
      <div className="border-b border-border bg-card">
        <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          {/* Left: back + project title + status + health + subtitle */}
          <div className="flex items-start gap-3 min-w-0">
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label={pt("Back")}
              className="mt-1.5 shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold text-foreground truncate max-w-[42ch]">
                  {project?.name || pt("Project")}
                </h1>
                {project?.status && (
                  <Badge variant="outline" className={cn("font-medium", statusMeta.className)}>
                    {pt(statusMeta.key)}
                  </Badge>
                )}
                {health?.rag && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
                        <span className={cn("h-2.5 w-2.5 rounded-full", RAG_DOT[health.rag])} />
                        {pt("Health")}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="text-xs">
                      <div className="space-y-0.5">
                        <div>{pt("Open actions")}: {health.open_actions}</div>
                        <div>{pt("Overdue")}: {health.overdue_actions}</div>
                        <div>{pt("Open issues")}: {health.open_issues}</div>
                        <div>{pt("Open risks")}: {health.open_risks}</div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
              {project?.description && (
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2 max-w-[70ch]">
                  {project.description}
                </p>
              )}
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => openForProject({ id: id!, name: project?.name })}
            >
              <Bot className="h-4 w-4" />
              {pt("Ask Co-pilot")}
            </Button>

            <Button variant="outline" onClick={handleEditClick} className="gap-2">
              <Edit2 className="h-4 w-4" />
              {pt("Edit Project")}
            </Button>

            {isPMPlus && (
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => { setInviteLink(""); setInviteOpen(true); }}
              >
                <Mail className="h-4 w-4" />
                {pt("Invite (email)")}
              </Button>
            )}

            {isPMPlus && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    {pt("Status")}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => lifecycleMutation.mutate({ id: id!, action: "hold" })}
                    disabled={project?.status === "on_hold"}
                  >
                    <PauseCircle className="mr-2 h-4 w-4" />
                    {pt("Put on hold")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => lifecycleMutation.mutate({ id: id!, action: "reopen" })}
                    disabled={project?.status === "in_progress"}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    {pt("Reopen")}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-emerald-700 focus:text-emerald-700"
                    onClick={() => setConfirmCloseOpen(true)}
                    disabled={project?.status === "completed"}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    {pt("Close project")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {isPMPlus && (
              <Button className="gap-2" onClick={() => navigate(`/projects/${id}/ai-doctor`)}>
                <Sparkles className="h-4 w-4" />
                {pt("Analyze with AI")}
              </Button>
            )}

            {isPMPlus && (
              <Button variant="destructive" className="gap-2" onClick={() => setConfirmDeleteOpen(true)}>
                <Trash2 className="h-4 w-4" />
                {pt("Delete")}
              </Button>
            )}
          </div>
        </div>
      </div>

      {isOverview && id && (
        <div className="px-6 pt-4 space-y-4">
          <ProjectKpiStrip />
          <ProjectAttentionPanel />
        </div>
      )}

      {/* Confirm close (cascades to all activities) */}
      <AlertDialog open={confirmCloseOpen} onOpenChange={setConfirmCloseOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{pt("Close this project?")}</AlertDialogTitle>
            <AlertDialogDescription>
              {pt("This marks the project as completed and sets all its activities to done.")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{pt("Cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => lifecycleMutation.mutate({ id: id!, action: "close" })}
            >
              {pt("Close project")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm delete */}
      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{pt("Delete Project")}</AlertDialogTitle>
            <AlertDialogDescription>
              {pt("Are you sure you want to delete this project? This action cannot be undone.")}
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

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{pt("Edit Project")}</DialogTitle>
            <DialogDescription>{pt("Update your project details")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">{pt("Project Name")}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">{pt("Description")}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget">{pt("Budget")} (€)</Label>
              <Input
                id="budget"
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">{pt("Start Date")}</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date || ""}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, start_date: e.target.value }));
                    setDateError(null);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">{pt("End Date")}</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date || ""}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, end_date: e.target.value }));
                    setDateError(null);
                  }}
                />
              </div>
            </div>
            {dateError && (
              <p className="text-sm text-red-500" role="alert">{dateError}</p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              {pt("Cancel")}
            </Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? pt("Saving...") : pt("Save Changes")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* In-project invite — sends a real invitation pre-linked to this project */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{pt("Invite (email)")}</DialogTitle>
            <DialogDescription>
              {pt("Invite someone by email to collaborate on this project.")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="invite-email">{pt("Email")}</Label>
              <Input
                id="invite-email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="naam@bedrijf.nl"
              />
            </div>
            <div className="space-y-2">
              <Label>{pt("Role")}</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="guest">{pt("Guest")}</SelectItem>
                  <SelectItem value="reviewer">{pt("Reviewer")}</SelectItem>
                  <SelectItem value="member">{pt("Member")}</SelectItem>
                  <SelectItem value="pm">{pt("Project Manager")}</SelectItem>
                  <SelectItem value="admin">{pt("Admin")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-message">{pt("Message (optional)")}</Label>
              <Textarea
                id="invite-message"
                rows={2}
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
              />
            </div>
            {inviteLink && (
              <div className="space-y-1.5">
                <Label>{pt("Invite link")}</Label>
                <div className="flex items-center gap-2">
                  <Input readOnly value={inviteLink} className="text-xs" />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      navigator.clipboard?.writeText(inviteLink);
                      toast.success(pt("Copied"));
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setInviteOpen(false)}>
              {pt("Close")}
            </Button>
            <Button onClick={handleInvite} disabled={inviteSending || !inviteEmail.trim()}>
              {inviteSending ? pt("Sending...") : pt("Send invitation")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
