import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * Highlight deep-link helper.
 *
 * Pages that accept `?highlight=<id>` use this hook to:
 *   1. Smooth-scroll the matching row into view (centered) once it has
 *      rendered.
 *   2. Apply a `data-highlight-active` attribute so callers can style a ring
 *      via CSS / Tailwind for the duration the highlight is "active". The
 *      attribute is cleared after `ringMs` so the ring fades.
 *
 * Returns a `ref` to attach to the row that matches the highlighted id, and
 * a boolean indicating whether this id is currently the highlight target.
 * Most callers can ignore the boolean and just conditionally apply a class
 * like `ring-2 ring-primary` based on the same id check they already use.
 *
 * Usage:
 *   const { ref, isHighlighted } = useHighlightFromQuery(epic.id);
 *   <Card ref={ref} className={isHighlighted ? "ring-2 ring-emerald-400" : ""}>...</Card>
 *
 * Notes:
 * - `itemId` can be number or string; we coerce both sides to string before
 *   comparing so `?highlight=42` matches `useHighlightFromQuery(42)` and
 *   UUID-keyed pages work too.
 * - The effect re-runs when the highlight changes or the item id changes,
 *   so navigating to a different `?highlight=` value re-scrolls correctly.
 */
export function useHighlightFromQuery<T extends HTMLElement = HTMLDivElement>(
  itemId: number | string | null | undefined,
  ringMs = 3000,
) {
  const [searchParams] = useSearchParams();
  const highlight = searchParams.get("highlight");
  const ref = useRef<T | null>(null);
  const isHighlighted =
    highlight != null && itemId != null && String(itemId) === String(highlight);

  useEffect(() => {
    if (!isHighlighted || !ref.current) return;
    const el = ref.current;
    // Use a small RAF / timeout so the scroll fires after the parent list has
    // finished its initial render + layout pass. Without this, the target
    // element exists in the DOM but its final position isn't settled yet on
    // the first paint and scrollIntoView lands off-center.
    const t = window.setTimeout(() => {
      try {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      } catch {
        // Older browsers w/o smooth scroll — fall back to instant.
        el.scrollIntoView();
      }
    }, 50);
    return () => window.clearTimeout(t);
  }, [isHighlighted]);

  // Active-flag attribute so callers can drive a fading ring via CSS if they
  // want. Most usages just toggle a Tailwind class from `isHighlighted` so
  // this is purely opt-in.
  useEffect(() => {
    if (!isHighlighted || !ref.current) return;
    const el = ref.current;
    el.setAttribute("data-highlight-active", "true");
    const t = window.setTimeout(() => {
      el.removeAttribute("data-highlight-active");
    }, ringMs);
    return () => window.clearTimeout(t);
  }, [isHighlighted, ringMs]);

  return { ref, isHighlighted };
}

export default useHighlightFromQuery;
