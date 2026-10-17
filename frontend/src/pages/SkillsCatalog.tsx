/**
 * Member-skills catalog (Sprint 9 Agent B / S9-05).
 *
 * Lists every Skill row the backend exposes at /api/v1/skills/catalog/.
 * Admins ("admin" / "superadmin") get an inline "Add skill" form; everyone
 * else sees the catalog as read-only reference.
 */
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type SkillCategory =
  | "methodology"
  | "technical"
  | "soft"
  | "domain";

export interface CatalogSkill {
  id: number;
  code: string;
  name: string;
  name_nl?: string;
  category: SkillCategory;
  description?: string;
  description_nl?: string;
}

const CATEGORIES: { value: SkillCategory; label: string }[] = [
  { value: "methodology", label: "Methodology" },
  { value: "technical", label: "Technical" },
  { value: "soft", label: "Soft Skill" },
  { value: "domain", label: "Domain" },
];

const SkillsCatalog = () => {
  const { user } = useAuth();
  const isAdmin =
    user?.role === "admin" || user?.role === "superadmin" || Boolean((user as unknown as { is_staff?: boolean })?.is_staff);

  const [skills, setSkills] = useState<CatalogSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    code: "",
    name: "",
    name_nl: "",
    category: "technical" as SkillCategory,
  });
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.get<CatalogSkill[]>("/skills/catalog/");
      setSkills(data ?? []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load skills.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const grouped = useMemo(() => {
    const by: Record<string, CatalogSkill[]> = {};
    for (const s of skills) {
      (by[s.category] ||= []).push(s);
    }
    return by;
  }, [skills]);

  const submit = async () => {
    if (!form.code.trim() || !form.name.trim()) return;
    setSubmitting(true);
    try {
      await api.post<CatalogSkill>("/skills/catalog/", form);
      setForm({ code: "", name: "", name_nl: "", category: "technical" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create skill.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Skills catalog</h1>
        <p className="text-muted-foreground">
          Shared taxonomy of member skills — used by project team-matching.
        </p>
      </div>

      {isAdmin && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Add a skill</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
              <div>
                <label htmlFor="code" className="text-xs text-muted-foreground">Code</label>
                <Input
                  id="code"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  placeholder="prince2"
                />
              </div>
              <div>
                <label htmlFor="name" className="text-xs text-muted-foreground">Name (EN)</label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="PRINCE2"
                />
              </div>
              <div>
                <label htmlFor="name_nl" className="text-xs text-muted-foreground">Name (NL)</label>
                <Input
                  id="name_nl"
                  value={form.name_nl}
                  onChange={(e) => setForm({ ...form, name_nl: e.target.value })}
                  placeholder="PRINCE2"
                />
              </div>
              <div>
                <label htmlFor="category" className="text-xs text-muted-foreground">Category</label>
                <Select
                  id="category"
                  value={form.category}
                  onValueChange={(v) => setForm({ ...form, category: v as SkillCategory })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={submit} disabled={submitting}>
                {submitting ? "Adding…" : "Add skill"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : skills.length === 0 ? (
        <p className="text-muted-foreground">
          No skills yet. Run{" "}
          <code className="rounded bg-muted px-1 py-0.5">
            manage.py seed_default_skills
          </code>{" "}
          to populate the catalog.
        </p>
      ) : (
        CATEGORIES.map((c) => {
          const rows = grouped[c.value] ?? [];
          if (rows.length === 0) return null;
          return (
            <Card key={c.value} className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  {c.label}
                  <Badge variant="secondary">{rows.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-40">Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>NL</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-mono text-xs">{s.code}</TableCell>
                        <TableCell>{s.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {s.name_nl || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
};

export default SkillsCatalog;
