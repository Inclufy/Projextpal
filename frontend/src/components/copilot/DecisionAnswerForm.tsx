// =============================================================================
// DecisionAnswerForm — Sprint 12 decision-request flow.
//
// Rendered inside IssuesTab's expanded detail panel when a ProductIssue is in
// status "needs-decision". The reporter (or a tenant admin) answers 1–5
// concrete questions the auto-fix worker posed because it could not one-shot
// the issue. On submit the backend validates each answer against the
// question type + choices and bumps the issue to "in-progress"; the
// orchestrator (S12-08) then re-queues the worker with the decision
// context in its prompt.
// =============================================================================

import { useMemo, useState } from "react";
import { HelpCircle, Loader2, MessageSquareQuote, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ApiError } from "@/lib/api";
import {
  type DecisionAnswers,
  type DecisionQuestion,
  type ProductIssueRecord,
  answerDecision,
} from "@/lib/copilotIssues";

interface DecisionAnswerFormProps {
  issue: ProductIssueRecord;
  isNl: boolean;
  onAnswered: () => void;
}

function emptyAnswer(q: DecisionQuestion): string | string[] {
  if (q.type === "multi_choice") return [];
  return "";
}

function initialAnswers(questions: DecisionQuestion[]): DecisionAnswers {
  const out: DecisionAnswers = {};
  for (const q of questions) out[q.id] = emptyAnswer(q);
  return out;
}

function isAnswerFilled(q: DecisionQuestion, v: string | string[] | undefined): boolean {
  if (q.type === "multi_choice") return Array.isArray(v) && v.length > 0;
  return typeof v === "string" && v.trim().length > 0;
}

export function DecisionAnswerForm({
  issue,
  isNl,
  onAnswered,
}: DecisionAnswerFormProps) {
  const { toast } = useToast();
  const questions = useMemo<DecisionQuestion[]>(
    () => issue.decision_questions ?? [],
    [issue.decision_questions],
  );
  const [answers, setAnswers] = useState<DecisionAnswers>(() =>
    initialAnswers(questions),
  );
  const [freeText, setFreeText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [perFieldError, setPerFieldError] = useState<Record<string, string>>({});

  if (questions.length === 0) {
    return (
      <div className="rounded p-2 bg-fuchsia-50 dark:bg-fuchsia-950/20 border border-fuchsia-200 dark:border-fuchsia-900/50 text-fuchsia-800 dark:text-fuchsia-200">
        {isNl
          ? "Dit issue wacht op een beslissing, maar er zijn nog geen vragen gesteld."
          : "This issue is awaiting a decision but no questions have been posted yet."}
      </div>
    );
  }

  const allFilled = questions.every((q) => isAnswerFilled(q, answers[q.id]));

  function setSingle(qid: string, value: string) {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
    setPerFieldError((prev) => {
      if (!prev[qid]) return prev;
      const next = { ...prev };
      delete next[qid];
      return next;
    });
  }

  function toggleMulti(qid: string, value: string) {
    setAnswers((prev) => {
      const current = Array.isArray(prev[qid]) ? [...(prev[qid] as string[])] : [];
      const i = current.indexOf(value);
      if (i >= 0) current.splice(i, 1);
      else current.push(value);
      return { ...prev, [qid]: current };
    });
    setPerFieldError((prev) => {
      if (!prev[qid]) return prev;
      const next = { ...prev };
      delete next[qid];
      return next;
    });
  }

  async function handleSubmit() {
    setSubmitting(true);
    setPerFieldError({});
    try {
      await answerDecision(issue.id, {
        answers,
        free_text: freeText.trim() || undefined,
      });
      toast({
        title: isNl ? "Beslissing verzonden" : "Decision submitted",
        description: isNl
          ? "De auto-fix pipeline pakt het weer op."
          : "The auto-fix pipeline will pick this up again.",
      });
      onAnswered();
    } catch (err) {
      // Backend returns 400 with {answers: {qid: msg}} on per-question
      // shape errors. ApiError exposes that payload as err.data.
      if (err instanceof ApiError && err.data && typeof err.data === "object") {
        const payload = err.data as { answers?: Record<string, string> };
        if (payload.answers && typeof payload.answers === "object") {
          setPerFieldError(payload.answers);
        }
      }
      toast({
        title: isNl ? "Niet verzonden" : "Not submitted",
        description:
          (err as Error).message ||
          (isNl
            ? "Controleer je antwoorden en probeer het opnieuw."
            : "Check your answers and try again."),
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded p-3 bg-fuchsia-50/60 dark:bg-fuchsia-950/20 border border-fuchsia-200 dark:border-fuchsia-900/50 space-y-3">
      <div className="flex items-start gap-2">
        <MessageSquareQuote className="h-4 w-4 text-fuchsia-700 dark:text-fuchsia-300 mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold text-fuchsia-900 dark:text-fuchsia-100 text-xs">
            {isNl
              ? "De auto-fix pipeline wacht op een beslissing"
              : "The auto-fix pipeline is waiting for a decision"}
          </p>
          <p className="text-[11px] text-fuchsia-800 dark:text-fuchsia-200 mt-0.5">
            {isNl
              ? "Beantwoord de onderstaande vragen zodat de volgende poging door kan."
              : "Answer the questions below so the next attempt can continue."}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {questions.map((q) => (
          <div key={q.id} className="space-y-1">
            <Label className="text-[11px] font-semibold text-gray-800 dark:text-gray-200 flex items-start gap-1">
              <span className="shrink-0 text-fuchsia-700 dark:text-fuchsia-300 font-mono">
                {q.id}
              </span>
              <span>{q.text}</span>
            </Label>
            {q.help && (
              <p className="text-[10px] text-gray-500 flex items-start gap-1">
                <HelpCircle className="h-3 w-3 mt-0.5 shrink-0" />
                <span>{q.help}</span>
              </p>
            )}
            {q.type === "single_choice" && (
              <div className="flex flex-wrap gap-1.5">
                {(q.choices ?? []).map((c) => {
                  const selected = answers[q.id] === c;
                  return (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setSingle(q.id, c)}
                      disabled={submitting}
                      aria-pressed={selected}
                      className={`text-[11px] px-2 py-1 rounded border transition-colors ${
                        selected
                          ? "bg-fuchsia-600 text-white border-fuchsia-600"
                          : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:border-fuchsia-400"
                      }`}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            )}
            {q.type === "multi_choice" && (
              <div className="flex flex-wrap gap-1.5">
                {(q.choices ?? []).map((c) => {
                  const selected = Array.isArray(answers[q.id])
                    ? (answers[q.id] as string[]).includes(c)
                    : false;
                  return (
                    <button
                      type="button"
                      key={c}
                      onClick={() => toggleMulti(q.id, c)}
                      disabled={submitting}
                      aria-pressed={selected}
                      className={`text-[11px] px-2 py-1 rounded border transition-colors ${
                        selected
                          ? "bg-fuchsia-600 text-white border-fuchsia-600"
                          : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:border-fuchsia-400"
                      }`}
                    >
                      {selected ? "✓ " : ""}
                      {c}
                    </button>
                  );
                })}
              </div>
            )}
            {q.type === "text" && (
              <Textarea
                value={typeof answers[q.id] === "string" ? (answers[q.id] as string) : ""}
                onChange={(e) => setSingle(q.id, e.target.value)}
                disabled={submitting}
                rows={2}
                className="text-[11px]"
                placeholder={isNl ? "Jouw antwoord..." : "Your answer..."}
              />
            )}
            {perFieldError[q.id] && (
              <p className="text-[10px] text-red-600 dark:text-red-400">
                {perFieldError[q.id]}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="space-y-1">
        <Label className="text-[11px] text-gray-700 dark:text-gray-300">
          {isNl ? "Toelichting (optioneel)" : "Extra context (optional)"}
        </Label>
        <Textarea
          value={freeText}
          onChange={(e) => setFreeText(e.target.value)}
          disabled={submitting}
          rows={2}
          maxLength={4000}
          className="text-[11px]"
          placeholder={
            isNl
              ? "Alles wat de volgende poging kan helpen"
              : "Anything that could help the next attempt"
          }
        />
      </div>

      <div className="flex items-center justify-end">
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={!allFilled || submitting}
          size="sm"
          className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white h-7"
        >
          {submitting ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Send className="h-3 w-3" />
          )}
          <span className="ml-1.5 text-[11px]">
            {isNl ? "Beslissing verzenden" : "Submit decision"}
          </span>
        </Button>
      </div>
    </div>
  );
}
