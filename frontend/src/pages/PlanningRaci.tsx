import { ProjectHeader } from "@/components/ProjectHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Trash2, Users } from "lucide-react";
import { ProgressDots } from "@/components/ProgressDots";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { toast } from "sonner";

const ROLES: { key: string; label: string }[] = [
  { key: "project_owner", label: "Project Owner" },
  { key: "project_manager", label: "Project Manager" },
  { key: "project_leader", label: "Project Leader" },
  { key: "facilitator", label: "Facilitator" },
  { key: "outside_eyes", label: "Outside Eyes" },
  { key: "stakeholder", label: "Stakeholder" },
];

const userLabel = (u: any) =>
  u?.name || [u?.first_name, u?.last_name].filter(Boolean).join(" ") || u?.username || u?.email || `User ${u?.id}`;

const PlanningRaci = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [users, setUsers] = useState<any[]>([]);
  const [memberships, setMemberships] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addRole, setAddRole] = useState<string>("project_owner");
  const [addUser, setAddUser] = useState<string>("");

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchAll = async () => {
    try {
      const [u, m, t] = await Promise.all([
        fetch("/api/v1/auth/company-users/", { headers }),
        fetch(`/api/v1/projects/memberships/?project=${id}`, { headers }),
        fetch(`/api/v1/projects/tasks/?project=${id}`, { headers }),
      ]);
      if (u.ok) { const d = await u.json(); setUsers(Array.isArray(d) ? d : d.results || []); }
      if (m.ok) { const d = await m.json(); setMemberships(Array.isArray(d) ? d : d.results || []); }
      if (t.ok) { const d = await t.json(); setTasks(Array.isArray(d) ? d : d.results || []); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, [id]);

  const addMembership = async () => {
    if (!addUser) { toast.error(pt("Pick a person")); return; }
    try {
      const res = await fetch(`/api/v1/projects/memberships/`, {
        method: "POST", headers: jsonHeaders,
        body: JSON.stringify({ project: id, user: addUser, role: addRole }),
      });
      if (res.ok) { toast.success(pt("Assigned")); setAddUser(""); fetchAll(); }
      else toast.error(pt("Assign failed"));
    } catch { toast.error(pt("Assign failed")); }
  };

  const removeMembership = async (mid: number) => {
    try {
      const res = await fetch(`/api/v1/projects/memberships/${mid}/`, { method: "DELETE", headers });
      if (res.ok || res.status === 204) { toast.success(pt("Removed")); fetchAll(); }
    } catch { toast.error(pt("Remove failed")); }
  };

  const patchTaskRaci = async (taskId: number, field: string, value: any) => {
    try {
      const res = await fetch(`/api/v1/projects/tasks/${taskId}/`, {
        method: "PATCH", headers: jsonHeaders, body: JSON.stringify({ [field]: value }),
      });
      if (res.ok) { setTasks((ts) => ts.map((t) => t.id === taskId ? { ...t, [field]: value } : t)); }
      else toast.error(pt("Save failed"));
    } catch { toast.error(pt("Save failed")); }
  };

  if (loading) return (
    <div className="min-h-full bg-background"><ProjectHeader />
      <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>
    </div>
  );

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        {/* PP-01 — six distinct project roles */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />{pt("Project Roles")}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ROLES.map((r) => {
                const holders = memberships.filter((m) => m.role === r.key);
                return (
                  <div key={r.key} className="border rounded-md p-3">
                    <div className="text-sm font-semibold mb-2">{pt(r.label)}</div>
                    {holders.length === 0 ? (
                      <span className="text-xs text-muted-foreground italic">{pt("Unassigned")}</span>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {holders.map((m) => (
                          <Badge key={m.id} variant="secondary" className="gap-1">
                            {m.user_name || m.user_email}
                            <button onClick={() => removeMembership(m.id)} className="ml-1 hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex flex-wrap items-end gap-2 border-t pt-4">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">{pt("Role")}</span>
                <Select value={addRole} onValueChange={setAddRole}>
                  <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                  <SelectContent>{ROLES.map((r) => <SelectItem key={r.key} value={r.key}>{pt(r.label)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">{pt("Person")}</span>
                <Select value={addUser} onValueChange={setAddUser}>
                  <SelectTrigger className="w-[220px]"><SelectValue placeholder={pt("Pick a person")} /></SelectTrigger>
                  <SelectContent>{users.map((u) => <SelectItem key={u.id} value={String(u.id)}>{userLabel(u)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button onClick={addMembership} className="gap-2"><Plus className="h-4 w-4" />{pt("Assign")}</Button>
            </div>
          </CardContent>
        </Card>

        {/* ATR-02 — per-task RACI matrix */}
        <Card>
          <CardHeader>
            <CardTitle>{pt("RACI Matrix")}</CardTitle>
            <div className="flex gap-3 text-xs text-muted-foreground pt-1">
              <span><b>R</b> {pt("Responsible")}</span><span><b>A</b> {pt("Accountable")}</span>
              <span><b>C</b> {pt("Consulted")}</span><span><b>I</b> {pt("Informed")}</span>
            </div>
          </CardHeader>
          <CardContent>
            {tasks.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">{pt("No tasks yet")}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="py-2 pr-4">{pt("Task")}</th>
                      <th className="py-2 px-2 w-[110px]">{pt("Progress")}</th>
                      <th className="py-2 px-2 w-[180px]">R</th>
                      <th className="py-2 px-2 w-[180px]">A</th>
                      <th className="py-2 px-2">C</th>
                      <th className="py-2 px-2">I</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((t) => (
                      <tr key={t.id} className="border-b">
                        <td className="py-2 pr-4 font-medium">{t.title || t.name}</td>
                        <td className="py-2 px-2"><ProgressDots progress={t.progress || 0} onChange={(v) => patchTaskRaci(t.id, "progress", v)} /></td>
                        {(["raci_responsible", "raci_accountable"] as const).map((field) => (
                          <td key={field} className="py-2 px-2">
                            <Select
                              value={t[field] ? String(t[field]) : "none"}
                              onValueChange={(v) => patchTaskRaci(t.id, field, v === "none" ? null : Number(v))}
                            >
                              <SelectTrigger className="h-8"><SelectValue placeholder="—" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">—</SelectItem>
                                {users.map((u) => <SelectItem key={u.id} value={String(u.id)}>{userLabel(u)}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </td>
                        ))}
                        <td className="py-2 px-2">
                          {Array.isArray(t.raci_consulted) && t.raci_consulted.length ? <Badge variant="outline">{t.raci_consulted.length}</Badge> : <span className="text-muted-foreground">—</span>}
                        </td>
                        <td className="py-2 px-2">
                          {Array.isArray(t.raci_informed) && t.raci_informed.length ? <Badge variant="outline">{t.raci_informed.length}</Badge> : <span className="text-muted-foreground">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PlanningRaci;
