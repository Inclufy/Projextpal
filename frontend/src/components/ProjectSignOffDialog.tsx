import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface SignOffResponse {
  project_id: number;
  signed_off_by: string | null;
  signed_off_role: string;
  signed_off_at: string | null;
  sign_off_note: string;
  signature_image_url: string | null;
  is_valid: boolean;
}

interface Props {
  projectId: number | string;
  /** Initial sign-off, if already present. */
  initial?: SignOffResponse | null;
  fetcher?: (url: string, init?: RequestInit) => Promise<Response>;
  onSigned?: (s: SignOffResponse) => void;
  className?: string;
}

const DEFAULT_FETCHER: Props["fetcher"] = (url, init) => {
  const token = localStorage.getItem("access_token");
  return fetch(url, {
    credentials: "include",
    ...(init ?? {}),
    headers: {
      ...((init?.headers as Record<string, string>) ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
};

const ROLE_OPTIONS = [
  "Senior Manager",
  "Project Sponsor",
  "Programme Director",
  "Executive",
];

/**
 * Yanmar project-closing sign-off dialog.
 *
 * - Embedded <canvas> signature pad (no extra deps).
 * - Role dropdown + optional note.
 * - POST to /api/v1/projects/<id>/closing/sign-off/ with multipart form data.
 * - When already signed, shows the persisted signature + metadata.
 */
export function ProjectSignOffDialog({
  projectId,
  initial = null,
  fetcher = DEFAULT_FETCHER,
  onSigned,
  className,
}: Props) {
  const [existing, setExisting] = useState<SignOffResponse | null>(initial);
  const [role, setRole] = useState<string>(ROLE_OPTIONS[0]);
  const [customRole, setCustomRole] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef<{ down: boolean; last: [number, number] | null }>({
    down: false,
    last: null,
  });

  // Fetch current sign-off if not seeded.
  useEffect(() => {
    if (initial !== null) return;
    fetcher(`/api/v1/projects/${projectId}/closing/sign-off/`)
      .then(async (r) => (r.ok ? r.json() : null))
      .then((j: SignOffResponse | null) => setExisting(j));
  }, [projectId, fetcher, initial]);

  // Canvas drawing handlers.
  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current!;
    const rect = c.getBoundingClientRect();
    return [
      ((e.clientX - rect.left) * c.width) / rect.width,
      ((e.clientY - rect.top) * c.height) / rect.height,
    ] as [number, number];
  };
  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    canvasRef.current?.setPointerCapture(e.pointerId);
    drawingRef.current.down = true;
    drawingRef.current.last = pos(e);
  };
  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current.down) return;
    const [x, y] = pos(e);
    const c = canvasRef.current!;
    const ctx = c.getContext("2d")!;
    ctx.strokeStyle = "#111";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.beginPath();
    if (drawingRef.current.last) {
      ctx.moveTo(drawingRef.current.last[0], drawingRef.current.last[1]);
    }
    ctx.lineTo(x, y);
    ctx.stroke();
    drawingRef.current.last = [x, y];
  };
  const onUp = () => {
    drawingRef.current.down = false;
    drawingRef.current.last = null;
  };
  const clear = () => {
    const c = canvasRef.current;
    if (!c) return;
    c.getContext("2d")!.clearRect(0, 0, c.width, c.height);
  };

  const submit = async () => {
    const c = canvasRef.current;
    if (!c) return;
    setBusy(true);
    setError(null);
    try {
      // Convert canvas to PNG Blob
      const blob: Blob = await new Promise((resolve, reject) => {
        c.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png");
      });
      const fd = new FormData();
      fd.append("signature_image", blob, "signature.png");
      fd.append("role", role === "Other" ? customRole : role);
      fd.append("note", note);

      const r = await fetcher(
        `/api/v1/projects/${projectId}/closing/sign-off/`,
        { method: "POST", body: fd },
      );
      if (!r.ok) {
        const text = await r.text();
        throw new Error(`HTTP ${r.status}: ${text}`);
      }
      const data: SignOffResponse = await r.json();
      setExisting(data);
      onSigned?.(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  if (existing && existing.is_valid && existing.signed_off_at) {
    return (
      <div className={cn(
        "rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm",
        className,
      )}>
        <div className="font-semibold text-emerald-900">Project signed off</div>
        <div className="mt-1 text-emerald-800">
          {existing.signed_off_role} <strong>{existing.signed_off_by}</strong> on{" "}
          {new Date(existing.signed_off_at).toLocaleString()}
        </div>
        {existing.signature_image_url && (
          <img
            src={existing.signature_image_url}
            alt="Signature"
            className="mt-2 max-h-20 border rounded bg-white"
          />
        )}
        {existing.sign_off_note && (
          <div className="mt-2 italic text-emerald-700">“{existing.sign_off_note}”</div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
        Project closing — Senior Manager sign-off
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="text-xs">
          Role
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mt-1 block w-full rounded-md border-slate-300"
          >
            {ROLE_OPTIONS.map((r) => (
              <option key={r}>{r}</option>
            ))}
            <option value="Other">Other…</option>
          </select>
          {role === "Other" && (
            <input
              type="text"
              value={customRole}
              onChange={(e) => setCustomRole(e.target.value)}
              placeholder="Specify role"
              className="mt-2 block w-full rounded-md border-slate-300"
            />
          )}
        </label>
        <label className="text-xs">
          Note (optional)
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border-slate-300"
            placeholder="Lessons learned, follow-up actions, etc."
          />
        </label>
      </div>

      <div>
        <div className="text-xs text-slate-600 mb-1">Signature (draw below)</div>
        <canvas
          ref={canvasRef}
          width={800}
          height={200}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerLeave={onUp}
          className="w-full h-32 border-2 border-dashed border-slate-300 rounded-md bg-white touch-none"
          aria-label="Signature pad"
        />
        <button
          type="button"
          onClick={clear}
          className="mt-1 text-xs text-slate-600 hover:text-slate-900 underline"
        >
          Clear signature
        </button>
      </div>

      {error && (
        <div className="text-xs text-red-700">Failed: {error}</div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={submit}
          className="px-4 py-2 text-sm rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {busy ? "Saving…" : "Sign off project"}
        </button>
      </div>
    </div>
  );
}

export default ProjectSignOffDialog;
