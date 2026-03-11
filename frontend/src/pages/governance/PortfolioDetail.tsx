import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Briefcase, Users, Euro, Calendar, Trash2, Plus, Shield, Pencil } from "lucide-react";
import { usePageTranslations } from '@/hooks/usePageTranslations';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatBudgetDetailed, getCurrencyFromLanguage } from '@/lib/currencies';

interface Portfolio {
  id: string;
  name: string;
  description: string;
  status: string;
  strategic_objectives: string;
  budget_allocated: string | null;
  owner: number | null;
  created_at: string;
  updated_at: string;
}

interface Board { id: string; name: string; board_type: string; meeting_frequency: string; is_active: boolean; }
interface Stakeholder { id: string; user: number; role: string; influence_level: string; interest_level: string; }
interface Program { id: number; name: string; status: string; health_status?: string; }
interface Project { id: number; name: string; status: string; health_status?: string; }

const statusColors: Record<string, string> = { planning: "bg-blue-100 text-blue-800", active: "bg-green-100 text-green-800", on_hold: "bg-yellow-100 text-yellow-800", closed: "bg-gray-100 text-gray-800" };
const boardTypeLabels: Record<string, string> = { steering_committee: "Steering Committee", program_board: "Program Board", project_board: "Project Board", advisory_board: "Advisory Board", executive_board: "Executive Board" };
const stakeholderRoleLabels: Record<string, string> = { executive_sponsor: "Executive Sponsor", senior_responsible_owner: "Senior Responsible Owner", business_change_manager: "Business Change Manager", project_executive: "Project Executive", key_stakeholder: "Key Stakeholder" };

const PortfolioDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { pt } = usePageTranslations();
  const { language } = useLanguage();
  const formatCurrency = (val: number) => formatBudgetDetailed(val, getCurrencyFromLanguage(language));
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [boards, setBoards] = useState<Board[]>([]);
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", description: "", status: "", strategic_objectives: "", budget_allocated: "" });

  const token = localStorage.getItem("access_token");
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  useEffect(() => { fetchPortfolio(); fetchBoards(); fetchStakeholders(); fetchPrograms(); fetchProjects(); }, [id]);

  const fetchPortfolio = async () => {
    try {
      const res = await fetch(`/api/v1/governance/portfolios/${id}/`, { headers });
      if (!res.ok) throw new Error("Not found");
      setPortfolio(await res.json());
    } catch { toast({ title: "Error", description: "Portfolio not found.", variant: "destructive" }); navigate("/governance/portfolios"); } finally { setLoading(false); }
  };
  const fetchBoards = async () => { try { const res = await fetch(`/api/v1/governance/boards/?portfolio=${id}`, { headers }); if (res.ok) { const data = await res.json(); setBoards(Array.isArray(data) ? data : data.results || []); } } catch {} };
  const fetchStakeholders = async () => { try { const res = await fetch(`/api/v1/governance/stakeholders/?portfolio=${id}`, { headers }); if (res.ok) { const data = await res.json(); setStakeholders(Array.isArray(data) ? data : data.results || []); } } catch {} };
  const fetchPrograms = async () => { try { const res = await fetch(`/api/v1/programs/?portfolio=${id}`, { headers }); const data = await res.json(); setPrograms(data.results || data || []); } catch {} };
  const fetchProjects = async () => { try { const res = await fetch(`/api/v1/projects/?portfolio=${id}`, { headers }); const data = await res.json(); setProjects(data.results || data || []); } catch {} };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this portfolio?")) return;
    try { const res = await fetch(`/api/v1/governance/portfolios/${id}/`, { method: "DELETE", headers }); if (res.ok) { toast({ title: "Deleted", description: "Portfolio has been removed." }); navigate("/governance/portfolios"); } } catch { toast({ title: "Error", description: "Failed to delete.", variant: "destructive" }); }
  };

  const openEditModal = () => {
    if (!portfolio) return;
    setEditForm({ name: portfolio.name, description: portfolio.description || "", status: portfolio.status, strategic_objectives: portfolio.strategic_objectives || "", budget_allocated: portfolio.budget_allocated || "" });
    setEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      const res = await fetch(`/api/v1/governance/portfolios/${id}/`, { method: "PATCH", headers, body: JSON.stringify(editForm) });
      if (!res.ok) throw new Error("Failed");
      toast({ title: "Updated", description: "Portfolio updated successfully." });
      setEditModalOpen(false);
      fetchPortfolio();
    } catch { toast({ title: "Error", description: "Failed to update.", variant: "destructive" }); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" /></div>;
  if (!portfolio) return null;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate("/governance/portfolios")}><ArrowLeft className="w-4 h-4 mr-2" /> {pt("Back to Portfolios")}</Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={openEditModal}><Pencil className="w-4 h-4 mr-2" /> {pt("Edit")}</Button>
          <Button variant="outline" size="sm" onClick={handleDelete}><Trash2 className="w-4 h-4 mr-2" /> {pt("Delete")}</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center"><Briefcase className="w-6 h-6 text-purple-600" /></div>
            <div><CardTitle className="text-2xl">{portfolio.name}</CardTitle><Badge className={statusColors[portfolio.status] || "bg-gray-100"}>{portfolio.status}</Badge></div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {portfolio.description && <div><h3 className="font-semibold text-sm text-gray-500 mb-1">{pt("Description")}</h3><p className="text-gray-700">{portfolio.description}</p></div>}
          {portfolio.strategic_objectives && <div><h3 className="font-semibold text-sm text-gray-500 mb-1">{pt("Strategic Objectives")}</h3><p className="text-gray-700">{portfolio.strategic_objectives}</p></div>}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center"><Euro className="w-5 h-5 mx-auto text-green-600 mb-1" /><p className="text-sm text-gray-500">{pt("Budget")}</p><p className="font-semibold">{formatCurrency(Number(portfolio.budget_allocated || 0))}</p></div>
            <div className="text-center"><Shield className="w-5 h-5 mx-auto text-blue-600 mb-1" /><p className="text-sm text-gray-500">{pt("Boards")}</p><p className="font-semibold">{boards.length}</p></div>
            <div className="text-center"><Users className="w-5 h-5 mx-auto text-purple-600 mb-1" /><p className="text-sm text-gray-500">{pt("Stakeholders")}</p><p className="font-semibold">{stakeholders.length}</p></div>
          </div>
        </CardContent>
      </Card>

      {/* Programs */}
      {programs.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2">{pt("Programs")} ({programs.length})</CardTitle></CardHeader>
          <CardContent><div className="space-y-3">{programs.map((p: any) => (
            <div key={p.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/programs/${p.id}`)}>
              <div><h4 className="font-medium">{p.name}</h4><p className="text-sm text-gray-500">{p.status}</p></div>
              <Badge variant="outline">{p.health_status || p.status}</Badge>
            </div>
          ))}</div></CardContent>
        </Card>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2">{pt("Projects")} ({projects.length})</CardTitle></CardHeader>
          <CardContent><div className="space-y-3">{projects.map((p: any) => (
            <div key={p.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/projects/${p.id}`)}>
              <div><h4 className="font-medium">{p.name}</h4><p className="text-sm text-gray-500">{p.status}</p></div>
              <Badge variant="outline">{p.health_status || p.status}</Badge>
            </div>
          ))}</div></CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><div className="flex items-center justify-between"><CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-blue-600" /> {pt("Governance Boards")}</CardTitle><Button size="sm" onClick={() => navigate("/governance/boards/new")}><Plus className="w-4 h-4 mr-2" /> {pt("Add Board")}</Button></div></CardHeader>
        <CardContent>
          {boards.length === 0 ? <p className="text-gray-500 text-center py-8">{pt("No governance boards yet.")}</p> : (
            <div className="space-y-3">{boards.map((board) => (
              <div key={board.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/governance/boards/${board.id}`)}>
                <div><h4 className="font-medium">{board.name}</h4><p className="text-sm text-gray-500">{boardTypeLabels[board.board_type] || board.board_type}{board.meeting_frequency && ` \u00b7 ${board.meeting_frequency}`}</p></div>
                <Badge variant={board.is_active ? "default" : "secondary"}>{board.is_active ? pt("Active") : pt("Inactive")}</Badge>
              </div>
            ))}</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><div className="flex items-center justify-between"><CardTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-purple-600" /> {pt("Key Stakeholders")}</CardTitle><Button size="sm" onClick={() => navigate("/governance/stakeholders/new")}><Plus className="w-4 h-4 mr-2" /> {pt("Add Stakeholder")}</Button></div></CardHeader>
        <CardContent>
          {stakeholders.length === 0 ? <p className="text-gray-500 text-center py-8">{pt("No stakeholders assigned yet.")}</p> : (
            <div className="space-y-3">{stakeholders.map((sh) => (
              <div key={sh.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div><h4 className="font-medium">{stakeholderRoleLabels[sh.role] || sh.role}</h4><p className="text-sm text-gray-500">Power: {sh.influence_level} \u00b7 Interest: {sh.interest_level}</p></div>
                <div className="flex gap-2"><Badge variant="outline">{sh.influence_level}</Badge><Badge variant="outline">{sh.interest_level}</Badge></div>
              </div>
            ))}</div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-4 text-xs text-gray-400">
        <span>{pt("Created")}: {new Date(portfolio.created_at).toLocaleDateString()}</span>
        <span>{pt("Updated")}: {new Date(portfolio.updated_at).toLocaleDateString()}</span>
      </div>

      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{pt("Edit Portfolio")}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid gap-2"><Label>{pt("Name")}</Label><Input value={editForm.name} onChange={(e) => setEditForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div className="grid gap-2"><Label>{pt("Description")}</Label><Textarea value={editForm.description} onChange={(e) => setEditForm(p => ({ ...p, description: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{pt("Status")}</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={editForm.status} onChange={(e) => setEditForm(p => ({ ...p, status: e.target.value }))}>
                  <option value="planning">{pt("Planning")}</option><option value="active">{pt("Active")}</option><option value="on_hold">{pt("On Hold")}</option><option value="closed">{pt("Closed")}</option>
                </select>
              </div>
              <div className="grid gap-2"><Label>{pt("Budget")} (€)</Label><Input type="number" value={editForm.budget_allocated} onChange={(e) => setEditForm(p => ({ ...p, budget_allocated: String(parseFloat(e.target.value) || 0) }))} /></div>
            </div>
            <div className="grid gap-2"><Label>{pt("Strategic Objectives")}</Label><Textarea value={editForm.strategic_objectives} onChange={(e) => setEditForm(p => ({ ...p, strategic_objectives: e.target.value }))} /></div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setEditModalOpen(false)}>{pt("Cancel")}</Button>
              <Button onClick={handleSaveEdit} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">{pt("Save Changes")}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PortfolioDetail;
