import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, User, TrendingUp, AlertCircle, Pencil, Trash2, MoreHorizontal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePageTranslations } from '@/hooks/usePageTranslations';

interface Stakeholder {
  id: string;
  user_email: string;
  user_name: string;
  role: string;
  influence_level: string;
  interest_level: string;
  quadrant: string;
  communication_plan: string;
  is_active: boolean;
  portfolio?: number;
  program?: number;
  project?: number;
}

export default function Stakeholders() {
  const { pt } = usePageTranslations();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingStakeholder, setEditingStakeholder] = useState<Stakeholder | null>(null);
  const [editForm, setEditForm] = useState({
    role: "",
    influence_level: "",
    interest_level: "",
    communication_plan: "",
  });

  const token = localStorage.getItem("access_token");
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  useEffect(() => { fetchStakeholders(); }, []);

  const fetchStakeholders = async () => {
    try {
      const response = await fetch("/api/v1/governance/stakeholders/", { headers });
      const data = await response.json();
      setStakeholders(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error("Error fetching stakeholders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete stakeholder "${name}"?`)) return;
    try {
      await fetch(`/api/v1/governance/stakeholders/${id}/`, { method: "DELETE", headers });
      toast({ title: "Deleted", description: `${name} has been removed.` });
      fetchStakeholders();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
    }
  };

  const handleEdit = (stakeholder: Stakeholder) => {
    setEditingStakeholder(stakeholder);
    setEditForm({
      role: stakeholder.role,
      influence_level: stakeholder.influence_level,
      interest_level: stakeholder.interest_level,
      communication_plan: stakeholder.communication_plan || "",
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingStakeholder) return;
    try {
      const res = await fetch(`/api/v1/governance/stakeholders/${editingStakeholder.id}/`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(editForm),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("Stakeholder update failed:", res.status, errorData);
        throw new Error(errorData?.detail || "Failed to update");
      }
      toast({ title: pt("Updated"), description: pt("Stakeholder updated successfully.") });
      setEditModalOpen(false);
      fetchStakeholders();
    } catch (error) {
      toast({ title: pt("Error"), description: error?.message || pt("Failed to update."), variant: "destructive" });
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      executive_sponsor: "Executive Sponsor",
      senior_responsible_owner: "Senior Responsible Owner",
      business_change_manager: "Business Change Manager",
      project_executive: "Project Executive",
      key_stakeholder: "Key Stakeholder",
    };
    return labels[role] || role;
  };

  const getInfluenceColor = (level: string) => {
    const colors: Record<string, string> = {
      high: "bg-red-100 text-red-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-green-100 text-green-800",
    };
    return colors[level] || colors.medium;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading stakeholders...</div>
      </div>
    );
  }

  const matrix = {
    manage_closely: stakeholders.filter(s => s.influence_level === "high" && s.interest_level === "high"),
    keep_satisfied: stakeholders.filter(s => s.influence_level === "high" && s.interest_level !== "high"),
    keep_informed: stakeholders.filter(s => s.influence_level !== "high" && s.interest_level === "high"),
    monitor: stakeholders.filter(s => s.influence_level !== "high" && s.interest_level !== "high"),
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TrendingUp className="h-8 w-8" /> {pt("Stakeholder Management")}
          </h1>
          <p className="text-muted-foreground mt-1">{pt("Strategic stakeholder engagement and influence mapping")}</p>
        </div>
        <Button onClick={() => navigate("/governance/stakeholders/new")}>
          <Plus className="h-4 w-4 mr-2" /> {pt("Add Stakeholder")}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">{pt("Total Stakeholders")}</p><p className="text-2xl font-bold mt-1">{stakeholders.length}</p></div><User className="h-8 w-8 text-blue-600" /></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">{pt("Key Players")}</p><p className="text-2xl font-bold mt-1">{matrix.manage_closely.length}</p></div><AlertCircle className="h-8 w-8 text-red-600" /></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">{pt("High Influence")}</p><p className="text-2xl font-bold mt-1">{matrix.manage_closely.length + matrix.keep_satisfied.length}</p></div><TrendingUp className="h-8 w-8 text-orange-600" /></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">{pt("High Interest")}</p><p className="text-2xl font-bold mt-1">{matrix.manage_closely.length + matrix.keep_informed.length}</p></div><User className="h-8 w-8 text-green-600" /></div></CardContent></Card>
      </div>

      {/* Stakeholder List */}
      <div className="space-y-3">
        {stakeholders.map((s) => (
          <Card key={s.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <User className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">{s.user_name}</p>
                    <p className="text-sm text-muted-foreground">{s.user_email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{getRoleLabel(s.role)}</Badge>
                  <Badge className={getInfluenceColor(s.influence_level)}>{s.influence_level} influence</Badge>
                  <Badge variant="outline">{s.interest_level} interest</Badge>
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(s)} className="h-8 w-8">
                    <Pencil className="h-4 w-4 text-gray-500" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id, s.user_name)} className="h-8 w-8">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
              {s.communication_plan && (
                <p className="text-sm text-muted-foreground mt-2 ml-13 pl-13">{s.communication_plan}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {stakeholders.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{pt("No Stakeholders Yet")}</h3>
            <p className="text-muted-foreground mb-4">{pt("Add stakeholders to track engagement and influence")}</p>
            <Button onClick={() => navigate("/governance/stakeholders/new")}><Plus className="h-4 w-4 mr-2" /> {pt("Add Stakeholder")}</Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{pt("Edit Stakeholder")}: {editingStakeholder?.user_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid gap-2">
              <Label>{pt("Role")}</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={editForm.role} onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))}>
                <option value="executive_sponsor">{pt("Executive Sponsor")}</option>
                <option value="senior_responsible_owner">{pt("Senior Responsible Owner")}</option>
                <option value="business_change_manager">{pt("Business Change Manager")}</option>
                <option value="project_executive">{pt("Project Executive")}</option>
                <option value="key_stakeholder">{pt("Key Stakeholder")}</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{pt("Influence Level")}</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={editForm.influence_level} onChange={(e) => setEditForm(prev => ({ ...prev, influence_level: e.target.value }))}>
                  <option value="high">{pt("High")}</option>
                  <option value="medium">{pt("Medium")}</option>
                  <option value="low">{pt("Low")}</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label>{pt("Interest Level")}</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={editForm.interest_level} onChange={(e) => setEditForm(prev => ({ ...prev, interest_level: e.target.value }))}>
                  <option value="high">{pt("High")}</option>
                  <option value="medium">{pt("Medium")}</option>
                  <option value="low">{pt("Low")}</option>
                </select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>{pt("Communication Plan")}</Label>
              <Textarea value={editForm.communication_plan} onChange={(e) => setEditForm(prev => ({ ...prev, communication_plan: e.target.value }))} placeholder={pt("How should this stakeholder be engaged?")} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setEditModalOpen(false)}>{pt("Cancel")}</Button>
              <Button onClick={handleSaveEdit} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">{pt("Save Changes")}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
