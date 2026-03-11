import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, RefreshCw, Users, Building2, CreditCard, Activity, TrendingUp } from "lucide-react";
import ProjectImport from './ProjectImport';
import TimesheetExport from './TimesheetExport';

const AdminDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/v1/admin/stats/", { headers });
      if (r.ok) setStats(await r.json());
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };
  useEffect(() => { fetchStats(); }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  const s = stats || {};
  const ov = s.overview || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Admin Dashboard</h1><p className="text-sm text-muted-foreground">System overview and statistics</p></div>
        <Button variant="outline" onClick={fetchStats} className="gap-2"><RefreshCw className="h-4 w-4" /> Refresh</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-4"><div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center"><Users className="h-6 w-6 text-blue-600" /></div><div><p className="text-sm text-muted-foreground">Total Users</p><p className="text-2xl font-bold">{ov.total_users ?? s.total_users ?? 0}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-4"><div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center"><Building2 className="h-6 w-6 text-green-600" /></div><div><p className="text-sm text-muted-foreground">Organizations</p><p className="text-2xl font-bold">{ov.total_companies ?? s.total_companies ?? 0}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-4"><div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center"><CreditCard className="h-6 w-6 text-purple-600" /></div><div><p className="text-sm text-muted-foreground">Active Subscriptions</p><p className="text-2xl font-bold">{ov.active_subscriptions ?? s.active_subscriptions ?? 0}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-4"><div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center"><Activity className="h-6 w-6 text-orange-600" /></div><div><p className="text-sm text-muted-foreground">Projects</p><p className="text-2xl font-bold">{ov.total_projects ?? s.total_projects ?? 0}</p></div></CardContent></Card>
      </div>

      {/* Revenue Stats */}
      {s.revenue && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">MRR</p><p className="text-2xl font-bold">{s.revenue.currency === 'EUR' ? '€' : '$'}{s.revenue.mrr?.toFixed(2) ?? '0.00'}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">ARR</p><p className="text-2xl font-bold">{s.revenue.currency === 'EUR' ? '€' : '$'}{s.revenue.arr?.toFixed(2) ?? '0.00'}</p></CardContent></Card>
          {s.growth && <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">User Growth</p><p className="text-2xl font-bold flex items-center gap-1"><TrendingUp className="h-5 w-5 text-green-500" />{s.growth.users ?? 0}%</p></CardContent></Card>}
        </div>
      )}

      {(s.new_users || s.recent_users || s.recent_signups) && (
        <Card><CardHeader><CardTitle>Recent Users</CardTitle></CardHeader>
          <CardContent><div className="space-y-2">{(s.new_users || s.recent_users || s.recent_signups || []).slice(0, 10).map((u: any, i: number) => (
            <div key={i} className="flex items-center justify-between p-2 border rounded hover:bg-muted/50">
              <div className="flex items-center gap-3"><div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">{(u.first_name || u.email || "?").charAt(0).toUpperCase()}</div><div><p className="text-sm font-medium">{u.first_name ? `${u.first_name} ${u.last_name || ""}` : u.email}</p>{u.company_name && <p className="text-xs text-muted-foreground">{u.company_name}</p>}</div></div>
              <span className="text-xs text-muted-foreground">{u.date_joined?.split("T")[0] || u.created_at?.split("T")[0]}</span>
            </div>
          ))}</div></CardContent>
        </Card>
      )}

      {s.subscriptions_by_plan && s.subscriptions_by_plan.length > 0 && (
        <Card><CardHeader><CardTitle>Plan Distribution</CardTitle></CardHeader>
          <CardContent><div className="space-y-3">{s.subscriptions_by_plan.map((item: any) => (
            <div key={item.plan} className="flex items-center gap-3"><span className="w-24 text-sm font-medium">{item.plan}</span><div className="flex-1"><Progress value={ov.total_companies ? (item.count / ov.total_companies) * 100 : 0} className="h-3" /></div><Badge variant="outline">{item.count}</Badge></div>
          ))}</div></CardContent>
        </Card>
      )}

      {(s.plan_distribution || s.plans_breakdown) && (
        <Card><CardHeader><CardTitle>Plan Distribution</CardTitle></CardHeader>
          <CardContent><div className="space-y-3">{Object.entries(s.plan_distribution || s.plans_breakdown || {}).map(([plan, count]: [string, any]) => (
            <div key={plan} className="flex items-center gap-3"><span className="w-24 text-sm font-medium">{plan}</span><div className="flex-1"><Progress value={ov.total_companies ? (count / ov.total_companies) * 100 : 0} className="h-3" /></div><Badge variant="outline">{count}</Badge></div>
          ))}</div></CardContent>
        </Card>
      )}

      {/* Import & Export Tools */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Import & Export</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ProjectImport />
        </div>
        <TimesheetExport />
      </div>
    </div>
  );
};

export default AdminDashboard;
