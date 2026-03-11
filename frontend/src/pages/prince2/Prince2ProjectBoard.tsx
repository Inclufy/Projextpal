import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectHeader } from "@/components/ProjectHeader";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Users, Trash2, Crown, UserPlus } from "lucide-react";
import { toast } from "sonner";

const Prince2ProjectBoard = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [board, setBoard] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [memberDialog, setMemberDialog] = useState(false);
  const [memberForm, setMemberForm] = useState({ name: "", role: "senior_user", email: "" });
  const [creating, setCreating] = useState(false);

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchData = async () => {
    try {
      const [bRes, mRes] = await Promise.all([
        fetch(`/api/v1/projects/${id}/prince2/board/`, { headers }),
        fetch(`/api/v1/projects/${id}/prince2/board-members/`, { headers }),
      ]);
      if (bRes.ok) {
        const d = await bRes.json();
        const list = Array.isArray(d) ? d : d.results || [];
        setBoard(list[0] || null);
      }
      if (mRes.ok) {
        const d = await mRes.json();
        setMembers(Array.isArray(d) ? d : d.results || []);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [id]);

  const createBoard = async () => {
    setCreating(true);
    try {
      const r = await fetch(`/api/v1/projects/${id}/prince2/board/`, {
        method: "POST", headers: jsonHeaders, body: JSON.stringify({ name: "Project Board" }),
      });
      if (r.ok) { toast.success(pt("Created")); fetchData(); }
      else toast.error(pt("Create failed"));
    } catch { toast.error(pt("Create failed")); }
    finally { setCreating(false); }
  };

  const addMember = async () => {
    if (!board || !memberForm.name) return;
    try {
      const r = await fetch(`/api/v1/projects/${id}/prince2/board/${board.id}/add_member/`, {
        method: "POST", headers: jsonHeaders, body: JSON.stringify(memberForm),
      });
      if (r.ok) { toast.success(pt("Created")); setMemberDialog(false); setMemberForm({ name: "", role: "senior_user", email: "" }); fetchData(); }
      else toast.error(pt("Create failed"));
    } catch { toast.error(pt("Create failed")); }
  };

  const removeMember = async (mId: number) => {
    try {
      const r = await fetch(`/api/v1/projects/${id}/prince2/board-members/${mId}/`, { method: "DELETE", headers });
      if (r.ok || r.status === 204) { toast.success(pt("Deleted")); fetchData(); }
    } catch { toast.error(pt("Delete failed")); }
  };

  const roleLabels: Record<string, string> = {
    executive: "Executive", senior_user: "Senior User", senior_supplier: "Senior Supplier",
    project_manager: "Project Manager", team_manager: "Team Manager", project_assurance: "Project Assurance",
    change_authority: "Change Authority", project_support: "Project Support",
  };

  const roleColors: Record<string, string> = {
    executive: "bg-purple-100 text-purple-700", senior_user: "bg-blue-100 text-blue-700",
    senior_supplier: "bg-green-100 text-green-700", project_manager: "bg-amber-100 text-amber-700",
  };

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3"><Crown className="h-6 w-6 text-amber-500" /><h1 className="text-2xl font-bold">{pt("Project Board")}</h1></div>
          <div className="flex gap-2">
            {!board && <Button onClick={createBoard} disabled={creating} className="gap-2">{creating && <Loader2 className="h-4 w-4 animate-spin" />}<Plus className="h-4 w-4" /> {pt("Create")} Board</Button>}
            {board && <Button onClick={() => setMemberDialog(true)} className="gap-2"><UserPlus className="h-4 w-4" /> {pt("Add Member")}</Button>}
          </div>
        </div>

        {!board ? (
          <Card className="p-8 text-center"><Crown className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-semibold mb-2">{pt("No Project Board")}</h3><p className="text-muted-foreground mb-4">Create a project board to define governance roles</p><Button onClick={createBoard} disabled={creating}><Plus className="h-4 w-4 mr-2" /> {pt("Create")} Board</Button></Card>
        ) : (
          <>
            {members.length === 0 ? (
              <Card className="p-8 text-center"><Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-semibold mb-2">No board members yet</h3><Button onClick={() => setMemberDialog(true)}><UserPlus className="h-4 w-4 mr-2" /> {pt("Add Member")}</Button></Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map((m) => (
                  <Card key={m.id} className="group relative">
                    <CardContent className="p-4">
                      <button onClick={() => removeMember(m.id)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5 text-destructive" /></button>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center"><span className="font-semibold text-primary">{m.name?.charAt(0)?.toUpperCase() || "?"}</span></div>
                        <div><p className="font-medium">{m.name}</p>{m.email && <p className="text-xs text-muted-foreground">{m.email}</p>}</div>
                      </div>
                      <Badge className={`text-xs ${roleColors[m.role] || "bg-gray-100 text-gray-700"}`}>{roleLabels[m.role] || m.role}</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <Dialog open={memberDialog} onOpenChange={setMemberDialog}>
        <DialogContent><DialogHeader><DialogTitle>{pt("Add Member")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>{pt("Name")} *</Label><Input value={memberForm.name} onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>{pt("Email")}</Label><Input type="email" value={memberForm.email} onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })} /></div>
            <div className="space-y-2"><Label>{pt("Role")}</Label>
              <Select value={memberForm.role} onValueChange={(v) => setMemberForm({ ...memberForm, role: v })}><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(roleLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setMemberDialog(false)}>{pt("Cancel")}</Button><Button onClick={addMember}>{pt("Add")}</Button></div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Prince2ProjectBoard;
