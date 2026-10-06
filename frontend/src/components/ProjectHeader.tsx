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
} from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ProjectAttentionPanel } from "./ProjectAttentionPanel";
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
  const [formData, setFormData] = useState({ name: "", description: "", budget: "" });
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

  const handleEditClick = () => {
    if (project) {
      setFormData({
        name: project.name || "",
        description: project.description || "",
        budget: project.budget?.toString() || "",
      });
    }
    setEditOpen(true);
  };

  const handleSave = () => {
    updateMutation.mutate({
      id: id!,
      data: {
        name: formData.name,
        description: formData.description,
        budget: parseFloat(formData.budget) || 0,
      },
    });
  };

  const statusMeta = STATUS_META[project?.status] ?? STATUS_META.pending;

  return (
    <>
      <div className="border-b border-border bg-card">
        <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          {/* Left: project title + status + health */}
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="text-lg font-semibold text-foreground truncate max-w-[42ch]">
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
          </div>
        </div>
      </div>

      {isOverview && id && (
        <div className="px-6 pt-4">
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
    </>
  );
};
