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
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    budget: "",
  });

  const { data: project } = useQuery({
    queryKey: ["project", id],
    queryFn: () => fetchProject(id!),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: updateProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", id] });
      toast.success("Project updated successfully");
      setEditOpen(false);
    },
    onError: () => {
      toast.error("Failed to update project");
    },
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
            Edit Project
          </Button>
          <Button className="gap-2">
            <Sparkles className="h-4 w-4" />
            Analyze with AI
          </Button>
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update your project details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget">Budget (€)</Label>
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
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};