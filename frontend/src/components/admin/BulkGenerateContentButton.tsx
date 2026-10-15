/**
 * Sprint 9 Agent B (S9-06) — one-click filler for missing academy content.
 *
 * Calls ``POST /api/v1/academy/admin/bulk-generate-content/`` with
 * ``{type: "both"}`` to populate every course that still has 0 quiz
 * questions and every Exam that still has ``questions=[]``. Idempotent on
 * the backend side (already-filled lessons/exams are skipped), so clicking
 * twice does not duplicate rows.
 */
import { useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface BulkResponse {
  generated_quizzes: number;
  generated_exams: number;
  errors: { lesson_id?: number; course_id?: number; type?: string; error?: string }[];
}

const BulkGenerateContentButton: React.FC<{
  type?: "quizzes" | "exams" | "both";
  courseId?: number;
}> = ({ type = "both", courseId }) => {
  const [running, setRunning] = useState(false);

  const run = async () => {
    setRunning(true);
    try {
      const body: Record<string, unknown> = { type };
      if (courseId) body.course_id = courseId;
      const data = await api.post<BulkResponse>(
        "/academy/admin/bulk-generate-content/",
        body,
      );
      const parts: string[] = [];
      if (data.generated_quizzes) {
        parts.push(`${data.generated_quizzes} quiz set(s)`);
      }
      if (data.generated_exams) {
        parts.push(`${data.generated_exams} exam(s)`);
      }
      const summary = parts.length
        ? `Generated ${parts.join(" + ")}.`
        : "Everything is already populated.";
      const errSuffix = data.errors.length
        ? ` (${data.errors.length} failures)`
        : "";
      toast.success(summary + errSuffix);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Bulk generation failed.",
      );
    } finally {
      setRunning(false);
    }
  };

  return (
    <Button onClick={run} disabled={running} className="gap-2">
      {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
      Generate missing content
    </Button>
  );
};

export default BulkGenerateContentButton;
