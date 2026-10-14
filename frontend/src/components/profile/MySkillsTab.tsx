/**
 * Profile → Skills tab (Sprint 9 Agent B / S9-05).
 *
 * Users pick skills from the shared catalog and declare their level +
 * optional years-of-experience. Backend: ``/api/v1/skills/me/``.
 */
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2 } from "lucide-react";

interface CatalogSkill {
  id: number;
  code: string;
  name: string;
  category: string;
}

interface UserSkill {
  id: number;
  level: "beginner" | "intermediate" | "expert";
  years_experience: number | null;
  verified_at: string | null;
  skill: CatalogSkill;
}

const LEVELS: UserSkill["level"][] = ["beginner", "intermediate", "expert"];

const MySkillsTab = () => {
  const [catalog, setCatalog] = useState<CatalogSkill[]>([]);
  const [mine, setMine] = useState<UserSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // add form
  const [addSkillCode, setAddSkillCode] = useState<string>("");
  const [addLevel, setAddLevel] = useState<UserSkill["level"]>("intermediate");
  const [addYears, setAddYears] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      const [cat, me] = await Promise.all([
        api.get<CatalogSkill[]>("/skills/catalog/"),
        api.get<UserSkill[]>("/skills/me/"),
      ]);
      setCatalog(cat ?? []);
      setMine(me ?? []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const addSkill = async () => {
    if (!addSkillCode) return;
    setSubmitting(true);
    try {
      await api.post("/skills/me/", {
        skill_code: addSkillCode,
        level: addLevel,
        years_experience: addYears ? Number(addYears) : null,
      });
      setAddSkillCode("");
      setAddYears("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add.");
    } finally {
      setSubmitting(false);
    }
  };

  const removeSkill = async (id: number) => {
    try {
      await api.delete(`/skills/me/${id}/`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove.");
    }
  };

  const changeLevel = async (id: number, level: UserSkill["level"]) => {
    try {
      await api.patch(`/skills/me/${id}/`, { level });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update.");
    }
  };

  const mineCodes = new Set(mine.map((us) => us.skill.code));
  const availableSkills = catalog.filter((s) => !mineCodes.has(s.code));

  return (
    <Card>
      <CardHeader>
        <CardTitle>My skills</CardTitle>
        <CardDescription>
          Declare the skills you bring so you show up when a project needs them.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="text-xs text-muted-foreground">Skill</label>
            <Select value={addSkillCode} onValueChange={setAddSkillCode}>
              <SelectTrigger>
                <SelectValue placeholder="Pick a skill" />
              </SelectTrigger>
              <SelectContent>
                {availableSkills.map((s) => (
                  <SelectItem key={s.code} value={s.code}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Level</label>
            <Select
              value={addLevel}
              onValueChange={(v) => setAddLevel(v as UserSkill["level"])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LEVELS.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l[0].toUpperCase() + l.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Years</label>
            <Input
              type="number"
              min={0}
              value={addYears}
              onChange={(e) => setAddYears(e.target.value)}
              placeholder="optional"
            />
          </div>
          <Button
            onClick={addSkill}
            disabled={submitting || !addSkillCode || availableSkills.length === 0}
          >
            Add
          </Button>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : mine.length === 0 ? (
          <p className="text-muted-foreground">
            No skills declared yet. Add your strongest ones above.
          </p>
        ) : (
          <ul className="divide-y">
            {mine.map((us) => (
              <li
                key={us.id}
                className="flex items-center justify-between py-3"
              >
                <div>
                  <p className="font-medium">
                    {us.skill.name}{" "}
                    {us.verified_at && (
                      <Badge variant="secondary" className="ml-2">
                        verified
                      </Badge>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {us.skill.category}
                    {us.years_experience != null
                      ? ` · ${us.years_experience}y experience`
                      : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={us.level}
                    onValueChange={(v) =>
                      changeLevel(us.id, v as UserSkill["level"])
                    }
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LEVELS.map((l) => (
                        <SelectItem key={l} value={l}>
                          {l[0].toUpperCase() + l.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSkill(us.id)}
                    aria-label="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default MySkillsTab;
