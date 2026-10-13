import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { AlertCircle, Users, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Sprint 7 — S7-09
 * ----------------
 * Capacity dashboard: shows one user's allocated hours vs the FTE-hours of
 * the selected date range, broken down per project. Red banner when total
 * commitments exceed 100% of available time.
 */

interface ProjectBreakdown {
  project_id: number;
  project_name: string;
  allocated_hours: number;
  budgeted_hours: number;
  actual_hours: number;
}

interface Payload {
  user_id: number;
  user_name: string;
  from: string;
  to: string;
  working_days_in_range: number;
  fte_hours_in_range: number;
  projects: ProjectBreakdown[];
  total_allocated: number;
  total_budgeted: number;
  total_actual: number;
  total_fte_pct: number;
  is_overcommitted: boolean;
}

interface CompanyUser {
  id: number;
  first_name?: string;
  last_name?: string;
  name?: string;
  email: string;
}

const defaultFetcher = (url: string) => {
  const token = localStorage.getItem("access_token");
  return fetch(url, {
    credentials: "include",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
};

function todayISO(): string {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

function addDaysISO(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function UserCapacityDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>(
    user?.id ? String(user.id) : "",
  );
  const [from, setFrom] = useState(todayISO());
  const [to, setTo] = useState(addDaysISO(todayISO(), 29));
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load company users so an admin/PM can switch user.
  useEffect(() => {
    defaultFetcher("/api/v1/auth/company-users/")
      .then(async (r) => (r.ok ? r.json() : []))
      .then((d) => {
        const list = Array.isArray(d) ? d : d.results || [];
        setUsers(list);
      })
      .catch(() => {
        /* best effort */
      });
  }, []);

  const loadCapacity = async () => {
    if (!selectedUserId) return;
    setLoading(true);
    setError(null);
    try {
      const r = await defaultFetcher(
        `/api/v1/users/${selectedUserId}/capacity/?from=${from}&to=${to}`,
      );
      if (r.status === 403) {
        setError("Je hebt geen toegang tot de capaciteit van deze gebruiker.");
        setData(null);
        return;
      }
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = (await r.json()) as Payload;
      setData(j);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedUserId) loadCapacity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUserId, from, to]);

  const maxBar = Math.max(
    1,
    data?.fte_hours_in_range || 0,
    data?.total_allocated || 0,
  );

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Users className="w-6 h-6" />
        <h1 className="text-xl font-semibold">Capaciteit per persoon</h1>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <Label>Gebruiker</Label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecteer gebruiker" />
              </SelectTrigger>
              <SelectContent>
                {users.map((u) => (
                  <SelectItem key={u.id} value={String(u.id)}>
                    {u.name || `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Van</Label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <Label>Tot</Label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>
        <div className="mt-3">
          <Button variant="outline" onClick={loadCapacity} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Verversen
          </Button>
        </div>
      </Card>

      {error && (
        <Card className="p-4">
          <p className="text-sm text-red-600">{error}</p>
        </Card>
      )}

      {data && (
        <>
          {data.is_overcommitted && (
            <Card className="p-3 border-red-300 bg-red-50">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">
                  Overcommitted: {data.total_fte_pct.toFixed(1)}% van beschikbare tijd ({data.fte_hours_in_range}u)
                </span>
              </div>
            </Card>
          )}

          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-semibold">{data.user_name}</h2>
                <p className="text-xs text-muted-foreground">
                  {data.working_days_in_range} werkdagen · {data.fte_hours_in_range}u FTE in deze periode
                </p>
              </div>
              <div className="text-sm">
                Totaal gepland:{" "}
                <span className={data.is_overcommitted ? "text-red-600 font-semibold" : ""}>
                  {data.total_allocated}u
                </span>{" "}
                / {data.fte_hours_in_range}u
              </div>
            </div>

            {data.projects.length === 0 ? (
              <div className="text-sm text-muted-foreground py-6 text-center">
                Geen projecten in deze periode.
              </div>
            ) : (
              <div className="space-y-3">
                {data.projects.map((p) => {
                  const pct = (p.allocated_hours / maxBar) * 100;
                  return (
                    <div key={p.project_id} className="text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{p.project_name}</span>
                        <span className="text-muted-foreground">
                          {p.allocated_hours}u gepland · {p.actual_hours}u gewerkt
                          {p.budgeted_hours > 0 ? ` · ${p.budgeted_hours}u begroot` : ""}
                        </span>
                      </div>
                      <div className="h-3 bg-muted rounded mt-1 overflow-hidden">
                        <div
                          className="h-3 bg-sky-500"
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {/* 100% FTE reference line */}
                <div className="text-xs text-muted-foreground pt-1">
                  Horizontale lijn: 100% FTE = {data.fte_hours_in_range}u
                </div>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
