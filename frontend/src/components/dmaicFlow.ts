// ============================================================
// Shared DMAIC → MethodologyFlow step builder for Lean Six Sigma
// (Green Belt + Black Belt). The DMAIC phase models have no
// `progress` field, so progress is derived from `status`:
//   completed → 100 (done) · in_progress → 50 (active) · else 0 (todo)
// Tabs differ per belt, so the caller passes a links map.
// ============================================================

import { FlowStep, FlowStatus } from "@/components/MethodologyFlow";

export const DMAIC_ORDER = ["define", "measure", "analyze", "improve", "control"] as const;
export type DmaicPhase = (typeof DMAIC_ORDER)[number];

const META: Record<DmaicPhase, { code: string; purpose: string }> = {
  define:  { code: "D", purpose: "Frame the problem, scope, goal and voice-of-customer (CTQs)." },
  measure: { code: "M", purpose: "Baseline the current process with valid, repeatable measurement data." },
  analyze: { code: "A", purpose: "Find and verify the root causes driving the defect or variation." },
  improve: { code: "I", purpose: "Design, pilot and confirm changes that remove the root causes." },
  control: { code: "C", purpose: "Lock in the gains with controls, SPC and a hand-over plan." },
};

const dmaicStatus = (s: string): FlowStatus =>
  s === "completed" ? "done" : s === "in_progress" ? "active" : "todo";

const progressFor = (s: FlowStatus) => (s === "done" ? 100 : s === "active" ? 50 : 0);

export const buildDmaicSteps = (
  phases: any[],
  links: Record<DmaicPhase, { label: string; slug: string }[]>,
  academyHref?: string,
): FlowStep[] =>
  DMAIC_ORDER.map((ph) => {
    const found = phases.find((p: any) => (p.phase || "").toLowerCase() === ph);
    const status = dmaicStatus(found?.status || "not_started");
    return {
      code: META[ph].code,
      label: ph.charAt(0).toUpperCase() + ph.slice(1),
      purpose: META[ph].purpose,
      progress: progressFor(status),
      status,
      links: links[ph],
      academyHref,
    };
  });
