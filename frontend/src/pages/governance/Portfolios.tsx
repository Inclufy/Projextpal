import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Briefcase, TrendingUp, Users, DollarSign, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePageTranslations } from '@/hooks/usePageTranslations';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatBudgetDetailed, getCurrencyFromLanguage } from '@/lib/currencies';

interface Portfolio {
  id: string;
  name: string;
  description: string;
  status: string;
  strategic_objectives: string;
  budget_allocated: number;
  owner_name: string;
  owner_email: string;
  total_boards: number;
  created_at: string;
}

export default function Portfolios() {
  const { pt } = usePageTranslations();
  const { language } = useLanguage();
  const formatCurrency = (val: number) => formatBudgetDetailed(val, getCurrencyFromLanguage(language));
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState<Portfolio | null>(null);
  const [editForm, setEditForm] = useState({ name: "", description: "", status: "", strategic_objectives: "", budget_allocated: 0 });
  const navigate = useNavigate();
  const { toast } = useToast();

  const token = localStorage.getItem("access_token");
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  useEffect(() => { fetchPortfolios(); }, []);

  const fetchPortfolios = async () => {
    try {
      const response = await fetch("/api/v1/governance/portfolios/", { headers });
      const data = await response.json();
      setPortfolios(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error("Error fetching portfolios:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (e: React.MouseEvent, portfolio: Portfolio) => {
    e.stopPropagation();
    setEditingPortfolio(portfolio);
    setEditForm({ name: portfolio.name, description: portfolio.description || "", status: portfolio.status, strategic_objectives: portfolio.strategic_objectives || "", budget_allocated: portfolio.budget_allocated || 0 });
    setEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingPortfolio) return;
    try {
      const res = await fetch(`/api/v1/governance/portfolios/${editingPortfolio.id}/`, { method: "PATCH", headers, body: JSON.stringify(editForm) });
      if (!res.ok) throw new Error("Failed");
      toast({ title: "Updated", description: "Portfolio updated successfully." });
      setEditModalOpen(false);
      fetchPortfolios();
    } catch {
      toast({ title: "Error", description: "Failed to update.", variant: "destructive" });
    }
  };

  const handleDelete = async (e: React.MouseEvent, portfolio: Portfolio) => {
    e.stopPropagation();
    if (!confirm(`Delete portfolio "${portfolio.name}"?`)) return;
    try {
      await fetch(`/api/v1/governance/portfolios/${portfolio.id}/`, { method: "DELETE", headers });
      toast({ title: "Deleted", description: `${portfolio.name} has been removed.` });
      fetchPortfolios();
    } catch {
      toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = { planning: "bg-yellow-100 text-yellow-800", active: "bg-green-100 text-green-800", on_hold: "bg-orange-100 text-orange-800", closed: "bg-gray-100 text-gray-800" };
    return colors[status] || colors.active;
  };

  if (loading) return <div className="flex items-center justify-center h-96"><div className="text-muted-foreground">Loading portfolios...</div></div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Briefcase className="h-8 w-8" /> {pt("Strategic Portfolios")}</h1>
          <p className="text-muted-foreground mt-1">{pt("Manage strategic initiatives and governance")}</p>
        </div>
        <Button onClick={() => navigate("/governance/portfolios/new")}><Plus className="h-4 w-4 mr-2" /> {pt("New Portfolio")}</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">{pt("Total Portfolios")}</p><p className="text-2xl font-bold mt-1">{portfolios.length}</p></div><Briefcase className="h-8 w-8 text-purple-600" /></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">{pt("Active")}</p><p className="text-2xl font-bold mt-1">{portfolios.filter(p => p.status === "active").length}</p></div><TrendingUp className="h-8 w-8 text-green-600" /></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">{pt("Total Boards")}</p><p className="text-2xl font-bold mt-1">{portfolios.reduce((sum, p) => sum + p.total_boards, 0)}</p></div><Users className="h-8 w-8 text-blue-600" /></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">{pt("Total Budget")}</p><p className="text-2xl font-bold mt-1">{formatCurrency(portfolios.reduce((sum, p) => sum + (Number(p.budget_allocated) || 0), 0))}</p></div><DollarSign className="h-8 w-8 text-orange-600" /></div></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolios.map((portfolio) => (
          <Card key={portfolio.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/governance/portfolios/${portfolio.id}`)}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{portfolio.name}</CardTitle>
                <div className="flex items-center gap-1">
                  <Badge className={getStatusColor(portfolio.status)}>{portfolio.status.replace("_", " ")}</Badge>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => handleEdit(e, portfolio)}><Pencil className="h-3.5 w-3.5 text-gray-500" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => handleDelete(e, portfolio)}><Trash2 className="h-3.5 w-3.5 text-red-500" /></Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{portfolio.description || "No description"}</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between"><span className="text-muted-foreground">{pt("Owner")}</span><span className="font-medium">{portfolio.owner_name || portfolio.owner_email}</span></div>
                <div className="flex items-center justify-between"><span className="text-muted-foreground">{pt("Governance Boards")}</span><span className="font-medium">{portfolio.total_boards}</span></div>
                {portfolio.budget_allocated > 0 && <div className="flex items-center justify-between"><span className="text-muted-foreground">{pt("Budget")}</span><span className="font-medium">{formatCurrency(portfolio.budget_allocated)}</span></div>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {portfolios.length === 0 && (
        <Card><CardContent className="p-12 text-center"><Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-semibold mb-2">{pt("No Portfolios Yet")}</h3><p className="text-muted-foreground mb-4">{pt("Create your first strategic portfolio to get started")}</p><Button onClick={() => navigate("/governance/portfolios/new")}><Plus className="h-4 w-4 mr-2" /> {pt("Create Portfolio")}</Button></CardContent></Card>
      )}

      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{pt("Edit Portfolio")}: {editingPortfolio?.name}</DialogTitle><DialogDescription>{pt("Update portfolio details")}</DialogDescription></DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid gap-2"><Label>{pt("Name")}</Label><Input value={editForm.name} onChange={(e) => setEditForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div className="grid gap-2"><Label>{pt("Description")}</Label><Textarea value={editForm.description} onChange={(e) => setEditForm(p => ({ ...p, description: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{pt("Status")}</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={editForm.status} onChange={(e) => setEditForm(p => ({ ...p, status: e.target.value }))}>
                  <option value="planning">{pt("Planning")}</option>
                  <option value="active">{pt("Active")}</option>
                  <option value="on_hold">{pt("On Hold")}</option>
                  <option value="closed">{pt("Closed")}</option>
                </select>
              </div>
              <div className="grid gap-2"><Label>{pt("Budget")} (€)</Label><Input type="number" value={editForm.budget_allocated} onChange={(e) => setEditForm(p => ({ ...p, budget_allocated: parseFloat(e.target.value) || 0 }))} /></div>
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
}
