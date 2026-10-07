import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Edit2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { usePageTranslations } from '@/hooks/usePageTranslations';
import { useAuth } from '@/contexts/AuthContext';

const PM_PLUS = ['pm', 'program_manager', 'admin', 'superadmin'];

const fetchProject = async (id: string) => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`/api/v1/projects/${id}/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to fetch project");
  return response.json();
};

const updateProject = async ({ id, data }: { id: string; data: any }) => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`/api/v1/projects/${id}/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update project");
  return response.json();
};

export const ProjectHeader = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const isPMPlus = PM_PLUS.includes(user?.role || '') || (user as any)?.isSuperAdmin === true;
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    budget: "",
    start_date: "",
    end_date: "",
  });
  const [dateError, setDateError] = useState<string | null>(null);
  const { pt } = usePageTranslations();

  const { data: project } = useQuery({
    queryKey: ["project", id],
    queryFn: () => fetchProject(id!),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: updateProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", id] });
      toast.success(pt("Project updated successfully"));
      setEditOpen(false);
    },
    onError: () => {
      toast.error(pt("Failed to update project"));
    },
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

  return (
    <>
      <div className="border-b border-border bg-card">
        <div className="px-6 py-4 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={handleEditClick}
            className="gap-2"
          >
            <Edit2 className="h-4 w-4" />
            {pt("Edit Project")}
          </Button>
          {isPMPlus && (
            <Button
              className="gap-2"
              onClick={() => navigate(`/projects/${id}/ai-doctor`)}
            >
              <Sparkles className="h-4 w-4" />
              {pt("Analyze with AI")}
            </Button>
          )}
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{pt("Edit Project")}</DialogTitle>
            <DialogDescription>
              {pt("Update your project details")}
            </DialogDescription>
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
    </>
  );
};
