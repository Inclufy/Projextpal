// Reusable multi-format export for ANY report (Yanmar — all reporting).
// Client-side: PDF (print view), Markdown, CSV, JSON.
// Backend (generic, no per-report renderer): Word (.docx), Excel (.xlsx)
//   via POST /api/v1/communication/reports/export/.
// Optional `nativeExports` for per-type renderers (e.g. Highlight → PPTX).
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, ChevronDown, Loader2 } from "lucide-react";
import { toast } from "sonner";

export interface ReportSection {
  heading?: string;
  rows?: [string, any][];
  text?: string;
}

interface NativeExport { label: string; url: string; filename?: string; }

interface Props {
  title: string;
  sections: ReportSection[];
  nativeExports?: NativeExport[];
  className?: string;
}

const authHeaders = (): Record<string, string> => {
  const t = localStorage.getItem("access_token");
  return t ? { Authorization: `Bearer ${t}` } : {};
};

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
};

const slug = (s: string) => s.replace(/[^a-z0-9-_]+/gi, "-").slice(0, 60) || "report";

export function ReportExportMenu({ title, sections, nativeExports = [], className }: Props) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const esc = (s: string) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const exportPdf = () => {
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title>
      <style>body{font-family:-apple-system,Segoe UI,Roboto,sans-serif;margin:32px;color:#111}
      h1{font-size:22px;margin:0 0 16px} h2{font-size:15px;margin:20px 0 6px;border-bottom:1px solid #ddd;padding-bottom:2px}
      table{border-collapse:collapse;width:100%;margin:4px 0} td{border:1px solid #e5e5e5;padding:4px 8px;font-size:13px;vertical-align:top}
      td:first-child{width:30%;color:#555;font-weight:600} p{font-size:13px;white-space:pre-wrap;margin:4px 0}</style></head>
      <body><h1>${esc(title)}</h1>${sections.map((s) => `
        ${s.heading ? `<h2>${esc(s.heading)}</h2>` : ""}
        ${s.rows && s.rows.length ? `<table>${s.rows.map((r) => `<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td></tr>`).join("")}</table>` : ""}
        ${s.text ? `<p>${esc(s.text)}</p>` : ""}`).join("")}</body></html>`;
    const w = window.open("", "_blank");
    if (!w) { toast.error("Allow pop-ups to export PDF"); return; }
    w.document.write(html); w.document.close();
    setTimeout(() => { w.focus(); w.print(); }, 300);
    setOpen(false);
  };

  const exportMarkdown = () => {
    const md = `# ${title}\n\n` + sections.map((s) => {
      let out = s.heading ? `## ${s.heading}\n\n` : "";
      if (s.rows?.length) out += s.rows.map((r) => `- **${r[0]}:** ${r[1] ?? ""}`).join("\n") + "\n\n";
      if (s.text) out += `${s.text}\n\n`;
      return out;
    }).join("");
    downloadBlob(new Blob([md], { type: "text/markdown" }), `${slug(title)}.md`);
    setOpen(false);
  };

  const exportCsv = () => {
    const q = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lines: string[] = ["Section,Label,Value"];
    for (const s of sections) {
      const h = s.heading || "";
      for (const r of (s.rows || [])) lines.push([q(h), q(r[0]), q(r[1])].join(","));
      if (s.text) lines.push([q(h), q("text"), q(s.text)].join(","));
    }
    downloadBlob(new Blob([lines.join("\n")], { type: "text/csv" }), `${slug(title)}.csv`);
    setOpen(false);
  };

  const exportJson = () => {
    downloadBlob(new Blob([JSON.stringify({ title, sections }, null, 2)], { type: "application/json" }), `${slug(title)}.json`);
    setOpen(false);
  };

  const exportOffice = async (format: "docx" | "xlsx") => {
    setBusy(true);
    try {
      const res = await fetch(`/api/v1/communication/reports/export/`, {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ format, title, sections }),
      });
      if (!res.ok) { toast.error("Export failed"); return; }
      downloadBlob(await res.blob(), `${slug(title)}.${format}`);
    } catch { toast.error("Export failed"); }
    finally { setBusy(false); setOpen(false); }
  };

  const exportNative = async (n: NativeExport) => {
    setBusy(true);
    try {
      const res = await fetch(n.url, { headers: authHeaders() });
      if (!res.ok) { toast.error("Export failed"); return; }
      downloadBlob(await res.blob(), n.filename || `${slug(title)}.${n.label.toLowerCase()}`);
    } catch { toast.error("Export failed"); }
    finally { setBusy(false); setOpen(false); }
  };

  const Item = ({ label, onClick }: { label: string; onClick: () => void }) => (
    <button onClick={onClick} className="w-full text-left px-3 py-1.5 text-sm hover:bg-accent rounded-sm">{label}</button>
  );

  return (
    <div className={`relative inline-block ${className ?? ""}`} ref={ref}>
      <Button variant="outline" size="sm" className="gap-2" onClick={() => setOpen((o) => !o)} disabled={busy}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} Export <ChevronDown className="h-3 w-3" />
      </Button>
      {open && (
        <div className="absolute right-0 z-50 mt-1 w-44 rounded-md border bg-popover p-1 shadow-md">
          <Item label="PDF" onClick={exportPdf} />
          <Item label="Word (.docx)" onClick={() => exportOffice("docx")} />
          <Item label="Excel (.xlsx)" onClick={() => exportOffice("xlsx")} />
          <Item label="Markdown" onClick={exportMarkdown} />
          <Item label="CSV" onClick={exportCsv} />
          <Item label="JSON" onClick={exportJson} />
          {nativeExports.map((n) => <Item key={n.label} label={n.label} onClick={() => exportNative(n)} />)}
        </div>
      )}
    </div>
  );
}

export default ReportExportMenu;
