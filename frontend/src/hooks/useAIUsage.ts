/**
 * useAIUsage — leest `/api/v1/ai/usage/` met een lichte in-memory cache zodat
 * componenten die het verbruik tonen (topbar-pill, waarschuwing in dialogs)
 * niet dubbel fetchen. Default: polled elke 60s.
 */
import { useEffect, useRef, useState } from "react";

export type AIUsageWarn = "ok" | "warning" | "critical";

export interface AIUsageSummary {
  available: boolean;
  used_today: number;
  used_7d: number;
  used_30d: number;
  quota_monthly: number;
  remaining_monthly: number;
  daily_avg_7d: number;
  estimated_days_left: number | null;
  warn_level: AIUsageWarn;
  providers_today?: Record<string, number>;
}

type CacheEntry = { data: AIUsageSummary; fetchedAt: number };
let _cache: CacheEntry | null = null;
const _subs = new Set<(d: AIUsageSummary) => void>();
let _inflight: Promise<AIUsageSummary | null> | null = null;

const STALE_MS = 60_000;

async function fetchUsage(signal?: AbortSignal): Promise<AIUsageSummary | null> {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) return null;
    const r = await fetch("/api/v1/ai/usage/", {
      headers: { Authorization: `Bearer ${token}` },
      signal,
    });
    if (!r.ok) return null;
    const data = (await r.json()) as AIUsageSummary;
    _cache = { data, fetchedAt: Date.now() };
    _subs.forEach((cb) => cb(data));
    return data;
  } catch {
    return null;
  }
}

export function useAIUsage(pollMs = STALE_MS): { data: AIUsageSummary | null; refresh: () => void } {
  const [data, setData] = useState<AIUsageSummary | null>(_cache?.data || null);
  const mounted = useRef(true);

  const trigger = () => {
    if (_inflight) return _inflight;
    _inflight = fetchUsage().finally(() => { _inflight = null; });
    return _inflight;
  };

  useEffect(() => {
    mounted.current = true;
    const sub = (d: AIUsageSummary) => { if (mounted.current) setData(d); };
    _subs.add(sub);
    // Trigger initial fetch if cache is stale.
    if (!_cache || Date.now() - _cache.fetchedAt > STALE_MS) trigger();
    const id = window.setInterval(() => { trigger(); }, Math.max(10_000, pollMs));
    return () => {
      mounted.current = false;
      _subs.delete(sub);
      window.clearInterval(id);
    };
  }, [pollMs]);

  return { data, refresh: trigger };
}

export function clearAIUsageCache() { _cache = null; }
