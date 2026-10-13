import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { CheckCircle, Circle, Clock, Loader2, Plus, Sparkles } from "lucide-react";
import { ProjectHeader } from "@/components/ProjectHeader";
import { usePageTranslations } from '@/hooks/usePageTranslations';
import { useLanguage } from '@/contexts/LanguageContext';
import AiPlanDialog from "@/components/AiPlanDialog";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001/api/v1';

const fetchProjectMilestones = async (projectId: string) => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_BASE_URL}/projects/milestones/?project=${projectId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) return [];
  return response.json();
};

const EMPTY_FORM = { name: "", description: "", start_date: "", end_date: "", status: "pending" };

const ProjectMilestones = () => {
  const { pt } = usePageTranslations();
  const { language } = useLanguage();
  const { id } = useParams<{ id: string }>();

  const { data: milestones = [], isLoading, refetch } = useQuery({
    queryKey: ['project-milestones', id],
    queryFn: () => fetchProjectMilestones(id!),
    enabled: !!id,
  });
  const [aiPlanOpen, setAiPlanOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setAddOpen(true);
  };

  const handleCreate = async () => {
    if (!form.name.trim()) {
      toast.error(pt("Name is required"));
      return;
    }
    if (form.start_date && form.end_date && form.end_date < form.start_date) {
      toast.error(pt("End date cannot be before start date"));
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_BASE_URL}/projects/milestones/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          project: Number(id),
          name: form.name.trim(),
          description: form.description.trim(),
          start_date: form.start_date || null,
          end_date: form.end_date || null,
          status: form.status,
        }),
      });
      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        throw new Error(detail || `HTTP ${res.status}`);
      }
      toast.success(pt("Milestone created"));
      setAddOpen(false);
      refetch();
    } catch (e: any) {
      toast.error(e?.message || pt("Could not create milestone"));
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const locale = language === 'nl' ? 'nl-NL' : 'en-US';
    return new Date(dateString).toLocaleDateString(locale, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'in_progress':
      case 'in-progress':
        return <Clock className="h-6 w-6 text-blue-500" />;
      default:
        return <Circle className="h-6 w-6 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">{pt("Completed")}</Badge>;
      case 'in_progress':
      case 'in-progress':
        return <Badge className="bg-blue-100 text-blue-800">{pt("In Progress")}</Badge>;
      case 'at_risk':
        return <Badge className="bg-yellow-100 text-yellow-800">{pt("At Risk")}</Badge>;
      default:
        return <Badge variant="outline">{pt("Pending")}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-full bg-background">
        <ProjectHeader />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Project Milestones</h1>
            <p className="text-muted-foreground">Track key project milestones and achievements</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-1.5 border-indigo-300 text-indigo-700 hover:bg-indigo-50" onClick={() => setAiPlanOpen(true)}>
              <Sparkles className="h-4 w-4" />{pt("Plan with AI")}
            </Button>
            <Button onClick={openAdd}>
              <Plus className="h-4 w-4 mr-2" />
              {pt("Add Milestone")}
            </Button>
          </div>
        </div>

        <AiPlanDialog projectId={id!} open={aiPlanOpen} onOpenChange={setAiPlanOpen} onApplied={() => refetch()} />

        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogContent className="sm:max-w-[460px]">
            <DialogHeader>
              <DialogTitle>{pt("Add Milestone")}</DialogTitle>
              <DialogDescription>{pt("Define a key checkpoint for this project.")}</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="ms-name">{pt("Name")} *</Label>
                <Input id="ms-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ms-desc">{pt("Description")}</Label>
                <Textarea id="ms-desc" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="ms-start">{pt("Start date")}</Label>
                  <Input id="ms-start" type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ms-end">{pt("End date")}</Label>
                  <Input id="ms-end" type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ms-status">{pt("Status")}</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger id="ms-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">{pt("Pending")}</SelectItem>
                    <SelectItem value="in_progress">{pt("In Progress")}</SelectItem>
                    <SelectItem value="completed">{pt("Completed")}</SelectItem>
                    <SelectItem value="on_hold">{pt("On Hold")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddOpen(false)} disabled={saving}>{pt("Cancel")}</Button>
              <Button onClick={handleCreate} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {pt("Create milestone")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {milestones.length === 0 ? (
          <Card className="p-8 text-center">
            <Circle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{pt("No milestones yet")}</h3>
            <p className="text-muted-foreground mb-4">
              {pt("Draft with AI, or add one yourself.")}
            </p>
            <div className="flex justify-center gap-2">
              <Button variant="outline" className="gap-1.5 border-indigo-300 text-indigo-700 hover:bg-indigo-50" onClick={() => setAiPlanOpen(true)}>
                <Sparkles className="h-4 w-4" />{pt("Plan with AI")}
              </Button>
              <Button onClick={openAdd}>
                <Plus className="h-4 w-4 mr-2" />
                {pt("Add First Milestone")}
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {milestones.map((milestone: any, index: number) => (
              <Card key={milestone.id} className="p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="pt-1">
                    {getStatusIcon(milestone.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          {milestone.name || milestone.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {milestone.description || 'No description'}
                        </p>
                      </div>
                      {getStatusBadge(milestone.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Due:</span> {formatDate(milestone.due_date || milestone.date)}
                    </p>
                  </div>
                </div>
                {index < milestones.length - 1 && (
                  <div className="ml-3 mt-4 h-8 border-l-2 border-dashed border-border"></div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectMilestones;
