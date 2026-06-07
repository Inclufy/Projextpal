import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, UserPlus, Building2, Send, Trash2, GraduationCap } from "lucide-react";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const AcademyAssignments = () => {
  const { pt } = usePageTranslations();
  const { user } = useAuth();
  const role = (user as any)?.role;
  const isSuper = role === "superadmin" || (user as any)?.is_superuser;
  const isAdmin = isSuper || role === "admin";

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const [courses, setCourses] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [entitlements, setEntitlements] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // assign form
  const [aCourse, setACourse] = useState("");
  const [aTarget, setATarget] = useState("user");
  const [aUser, setAUser] = useState("");
  const [aDue, setADue] = useState("");
  const [aCompany, setACompany] = useState("");
  const [busy, setBusy] = useState(false);

  // entitlement form (superadmin)
  const [eTenant, setETenant] = useState("");
  const [eCourse, setECourse] = useState("");

  const arr = (d: any) => (Array.isArray(d) ? d : d.results || []);

  const load = async () => {
    try {
      const reqs: Promise<any>[] = [
        fetch("/api/v1/academy/courses/", { headers }),
        fetch("/api/v1/auth/company-users/members/", { headers }),
        fetch("/api/v1/academy/assignments/", { headers }),
      ];
      if (isSuper) {
        reqs.push(fetch("/api/v1/admin/tenants/", { headers }));
        reqs.push(fetch("/api/v1/academy/entitlements/", { headers }));
      }
      const res = await Promise.all(reqs);
      if (res[0].ok) setCourses(arr(await res[0].json()));
      if (res[1].ok) setMembers(arr(await res[1].json()));
      if (res[2].ok) setAssignments(arr(await res[2].json()));
      if (isSuper && res[3]?.ok) setTenants(arr(await res[3].json()));
      if (isSuper && res[4]?.ok) setEntitlements(arr(await res[4].json()));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const assign = async () => {
    if (!aCourse) { toast.error(pt("Pick a course")); return; }
    if (aTarget === "user" && !aUser) { toast.error(pt("Pick a user")); return; }
    setBusy(true);
    try {
      const body: any = { course: aCourse, target_type: aTarget };
      if (aTarget === "user") body.target_user = aUser;
      if (aDue) body.due_date = aDue;
      if (isSuper && aCompany) body.company = aCompany;
      const r = await fetch("/api/v1/academy/assignments/", { method: "POST", headers: jsonHeaders, body: JSON.stringify(body) });
      if (r.ok) { toast.success(pt("Course assigned")); setAUser(""); load(); }
      else { const d = await r.json().catch(() => ({})); toast.error(d.detail || pt("Assign failed")); }
    } catch { toast.error(pt("Assign failed")); }
    finally { setBusy(false); }
  };

  const grant = async () => {
    if (!eTenant || !eCourse) { toast.error(pt("Pick a tenant and a course")); return; }
    try {
      const r = await fetch("/api/v1/academy/entitlements/", { method: "POST", headers: jsonHeaders, body: JSON.stringify({ company: eTenant, course: eCourse, active: true }) });
      if (r.ok) { toast.success(pt("Course enabled for tenant")); setECourse(""); load(); }
      else { const d = await r.json().catch(() => ({})); toast.error(d.detail || JSON.stringify(d).slice(0, 100)); }
    } catch { toast.error(pt("Failed")); }
  };

  const delEntitlement = async (id: any) => {
    const r = await fetch(`/api/v1/academy/entitlements/${id}/`, { method: "DELETE", headers });
    if (r.ok || r.status === 204) { toast.success(pt("Removed")); load(); }
  };
  const delAssignment = async (id: any) => {
    const r = await fetch(`/api/v1/academy/assignments/${id}/`, { method: "DELETE", headers });
    if (r.ok || r.status === 204) { toast.success(pt("Removed")); load(); }
  };

  const userName = (u: any) => u.first_name || u.email || `#${u.id}`;

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  if (!isAdmin) {
    return <div className="w-full px-6 lg:px-8 py-10 text-center text-muted-foreground">{pt("Only admins can assign courses.")}</div>;
  }

  return (
    <div className="min-h-full bg-background w-full px-6 lg:px-8 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-purple-600 to-fuchsia-600 flex items-center justify-center text-white"><UserPlus className="h-5 w-5" /></div>
        <div>
          <h1 className="text-2xl font-bold">{pt("Course Assignment")}</h1>
          <p className="text-sm text-muted-foreground">
            {isSuper ? pt("Enable courses for tenants, and assign them to users or whole organizations.") : pt("Assign courses to a user or your entire organization.")}
          </p>
        </div>
      </div>

      {/* Superadmin: enable courses for a tenant */}
      {isSuper && (
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-indigo-500" /><h3 className="font-semibold">{pt("Enable a course for a tenant")}</h3></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Select value={eTenant} onValueChange={setETenant}>
              <SelectTrigger><SelectValue placeholder={pt("Tenant")} /></SelectTrigger>
              <SelectContent>{tenants.map((t) => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={eCourse} onValueChange={setECourse}>
              <SelectTrigger><SelectValue placeholder={pt("Course")} /></SelectTrigger>
              <SelectContent>{courses.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.title}</SelectItem>)}</SelectContent>
            </Select>
            <Button onClick={grant} className="gap-2"><Send className="h-4 w-4" />{pt("Enable")}</Button>
          </div>
          {entitlements.length > 0 && (
            <div className="space-y-1.5 pt-2">
              {entitlements.map((e) => (
                <div key={e.id} className="flex items-center justify-between text-sm border-b last:border-0 py-1.5">
                  <span><Badge variant="outline" className="mr-2">{e.company_name}</Badge>{e.course_title}</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => delEntitlement(e.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Assign a course */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-2"><GraduationCap className="h-4 w-4 text-fuchsia-500" /><h3 className="font-semibold">{pt("Assign a course")}</h3></div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {isSuper && (
            <div className="space-y-1.5"><Label className="text-xs">{pt("Tenant (optional)")}</Label>
              <Select value={aCompany} onValueChange={setACompany}>
                <SelectTrigger><SelectValue placeholder={pt("My organization")} /></SelectTrigger>
                <SelectContent>{tenants.map((t) => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-1.5"><Label className="text-xs">{pt("Course")}</Label>
            <Select value={aCourse} onValueChange={setACourse}>
              <SelectTrigger><SelectValue placeholder={pt("Pick a course")} /></SelectTrigger>
              <SelectContent>{courses.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.title}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><Label className="text-xs">{pt("Assign to")}</Label>
            <Select value={aTarget} onValueChange={setATarget}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="user">{pt("Specific user")}</SelectItem>
                <SelectItem value="entire_org">{pt("Entire organization")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {aTarget === "user" && (
            <div className="space-y-1.5"><Label className="text-xs">{pt("User")}</Label>
              <Select value={aUser} onValueChange={setAUser}>
                <SelectTrigger><SelectValue placeholder={pt("Pick a user")} /></SelectTrigger>
                <SelectContent>{members.map((u) => <SelectItem key={u.id} value={String(u.id)}>{userName(u)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-1.5"><Label className="text-xs">{pt("Due date (optional)")}</Label><Input type="date" value={aDue} onChange={(e) => setADue(e.target.value)} /></div>
        </div>
        <Button onClick={assign} disabled={busy} className="gap-2">{busy && <Loader2 className="h-4 w-4 animate-spin" />}<Send className="h-4 w-4" />{pt("Assign")}</Button>
      </Card>

      {/* Existing assignments */}
      <Card className="overflow-hidden">
        <div className="px-4 py-2.5 bg-muted/50 border-b font-semibold text-sm">{pt("Assignments")} <Badge variant="outline" className="ml-1">{assignments.length}</Badge></div>
        {assignments.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">{pt("No assignments yet.")}</div>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-muted-foreground border-b"><th className="px-4 py-2">{pt("Course")}</th><th className="px-3 py-2">{pt("Assigned to")}</th><th className="px-3 py-2 w-28">{pt("Due")}</th><th className="px-2 py-2 w-12"></th></tr></thead>
            <tbody>
              {assignments.map((a) => (
                <tr key={a.id} className="border-b last:border-0 hover:bg-accent/40">
                  <td className="px-4 py-2.5 font-medium">{a.course_title}</td>
                  <td className="px-3 py-2.5">{a.target_type === "entire_org" ? <Badge className="bg-indigo-100 text-indigo-700 text-[10px]">{pt("Entire organization")}</Badge> : (a.target_user_name || a.target_user_email)}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{a.due_date || "—"}</td>
                  <td className="px-2 py-2.5"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => delAssignment(a.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
};

export default AcademyAssignments;
