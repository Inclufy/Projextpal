import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Upload, FileSpreadsheet, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useCustomFieldDefs } from "@/components/CustomFieldsEditor";

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("access_token")}` });
const jsonHeaders = () => ({ ...authHeaders(), "Content-Type": "application/json" });

/** Minimal RFC-4180-ish CSV/TSV parser (handles quoted fields, escaped quotes,
 *  embedded commas + newlines). Delimiter auto-detected from the header line. */
function parseDelimited(text: string): { headers: string[]; rows: string[][] } {
  text = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const firstLine = text.slice(0, text.indexOf("\n") < 0 ? text.length : text.indexOf("\n"));
  const counts = { ",": (firstLine.match(/,/g) || []).length, ";": (firstLine.match(/;/g) || []).length, "\t": (firstLine.match(/\t/g) || []).length };
  const delim = (Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]) as string;

  const rows: string[][] = [];
  let field = "", row: string[] = [], inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === delim) { row.push(field); field = ""; }
    else if (ch === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else field += ch;
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  const nonEmpty = rows.filter((r) => r.some((c) => (c || "").trim() !== ""));
  const headers = (nonEmpty.shift() || []).map((h) => h.trim());
  return { headers, rows: nonEmpty };
}

const TARGETS = [
  { key: "title", label: "Title", required: true, aliases: ["title", "task", "action", "name", "summary", "onderwerp", "actie", "taak"] },
  { key: "description", label: "Description", aliases: ["description", "detail", "details", "omschrijving", "notes"] },
  { key: "category", label: "Category", aliases: ["category", "categorie", "group", "type", "label"] },
  { key: "assigned_to_email", label: "Owner (email)", aliases: ["owner", "assignee", "assigned", "email", "eigenaar", "owner email", "verantwoordelijke"] },
  { key: "status", label: "Status", aliases: ["status", "state", "stage"] },
  { key: "priority", label: "Priority", aliases: ["priority", "prio", "prioriteit", "severity"] },
  { key: "due_date", label: "Due date", aliases: ["due", "due date", "duedate", "deadline", "einddatum", "target date"] },
  { key: "start_date", label: "Start date", aliases: ["start", "start date", "startdate", "begindatum"] },
];

const norm = (s: string) => (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");

export default function ImportDialog({
  open, onOpenChange, projectId, onImported,
}: { open: boolean; onOpenChange: (v: boolean) => void; projectId: string | number; onImported?: () => void }) {
  const { defs: customDefs } = useCustomFieldDefs("task");
  const [headers, setHeaders] = useState<string[]>([]);
  const [dataRows, setDataRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<any>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const targets = useMemo(
    () => [...TARGETS, ...customDefs.map((f) => ({ key: `cf:${f.key}`, label: `${f.label} (custom)`, required: false, aliases: [f.label, f.key] }))],
    [customDefs],
  );

  const autoMap = (hdrs: string[]) => {
    const m: Record<string, string> = {};
    targets.forEach((t) => {
      const hit = hdrs.find((h) => t.aliases.some((a) => norm(a) === norm(h)))
        || hdrs.find((h) => t.aliases.some((a) => norm(h).includes(norm(a)) && norm(a).length > 2));
      if (hit) m[t.key] = hit;
    });
    return m;
  };

  const onFile = async (file: File) => {
    setResult(null);
    const text = await file.text();
    const { headers: hdrs, rows } = parseDelimited(text);
    if (hdrs.length === 0) { toast.error("Could not read any columns from that file."); return; }
    setHeaders(hdrs); setDataRows(rows); setMapping(autoMap(hdrs));
  };

  const colIndex = (h: string) => headers.indexOf(h);
  const buildRows = () =>
    dataRows.map((r) => {
      const out: any = { custom_fields: {} };
      Object.entries(mapping).forEach(([target, col]) => {
        if (!col) return;
        const v = r[colIndex(col)] ?? "";
        if (target.startsWith("cf:")) out.custom_fields[target.slice(3)] = v;
        else out[target] = v;
      });
      return out;
    }).filter((r) => (r.title || "").trim() !== "");

  const doImport = async () => {
    if (!mapping.title) { toast.error("Map the Title column first."); return; }
    const rows = buildRows();
    if (rows.length === 0) { toast.error("No rows with a title to import."); return; }
    setBusy(true);
    try {
      const r = await fetch(`/api/v1/projects/tasks/import/`, {
        method: "POST", headers: jsonHeaders(),
        body: JSON.stringify({ project: Number(projectId), rows }),
      });
      const d = await r.json().catch(() => ({}));
      if (r.ok) {
        setResult(d);
        toast.success(`Imported ${d.created} item${d.created === 1 ? "" : "s"}`);
        onImported?.();
      } else toast.error(d.detail || "Import failed");
    } catch { toast.error("Import failed"); }
    finally { setBusy(false); }
  };

  const reset = () => { setHeaders([]); setDataRows([]); setMapping({}); setResult(null); };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><FileSpreadsheet className="h-5 w-5 text-purple-600" /> Import from CSV</DialogTitle></DialogHeader>

        {headers.length === 0 ? (
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Upload a <strong>.csv</strong> file (in Excel: <em>File → Save As → CSV</em>). The first row must be column headers.
              We’ll auto-match common columns; you can adjust the mapping before importing.
            </p>
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed rounded-xl py-10 flex flex-col items-center gap-2 hover:bg-accent/40 transition"
            >
              <Upload className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm font-medium">Choose a CSV file</span>
              <span className="text-xs text-muted-foreground">comma, semicolon or tab separated</span>
            </button>
            <input ref={fileRef} type="file" accept=".csv,.tsv,.txt,text/csv" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.currentTarget.value = ""; }} />
          </div>
        ) : result ? (
          <div className="space-y-3 py-2">
            <div className="flex items-center gap-2 text-green-700"><CheckCircle2 className="h-5 w-5" /> <span className="font-medium">{result.created} imported</span></div>
            {result.skipped > 0 && <p className="text-sm text-amber-600 flex items-center gap-1.5"><AlertTriangle className="h-4 w-4" /> {result.skipped} skipped (missing title)</p>}
            {(result.warnings || []).length > 0 && (
              <div className="text-xs text-muted-foreground border rounded-lg p-2 max-h-32 overflow-y-auto">
                {result.warnings.map((w: any, i: number) => <div key={i}>Row {w.row}: {w.warning}</div>)}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={reset}>Import another</Button>
              <Button onClick={() => { reset(); onOpenChange(false); }}>Done</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              {dataRows.length} row{dataRows.length === 1 ? "" : "s"} found. Map each field to a column (leave blank to ignore).
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {targets.map((t) => (
                <div key={t.key} className="flex items-center justify-between gap-2">
                  <Label className="text-sm shrink-0 w-32 truncate">{t.label}{t.required && <span className="text-destructive">*</span>}</Label>
                  <Select value={mapping[t.key] || "__none__"} onValueChange={(v) => setMapping((m) => ({ ...m, [t.key]: v === "__none__" ? "" : v }))}>
                    <SelectTrigger className="h-8 flex-1"><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">— ignore —</SelectItem>
                      {headers.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            {mapping.title && (
              <div className="border rounded-lg overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="bg-muted/50 text-left">
                    {targets.filter((t) => mapping[t.key]).map((t) => <th key={t.key} className="px-2 py-1.5 font-medium whitespace-nowrap">{t.label}</th>)}
                  </tr></thead>
                  <tbody>
                    {buildRows().slice(0, 5).map((r, i) => (
                      <tr key={i} className="border-t">
                        {targets.filter((t) => mapping[t.key]).map((t) => (
                          <td key={t.key} className="px-2 py-1.5 whitespace-nowrap truncate max-w-[140px]">
                            {t.key.startsWith("cf:") ? r.custom_fields[t.key.slice(3)] : r[t.key]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {buildRows().length > 5 && <div className="px-2 py-1 text-[11px] text-muted-foreground">+{buildRows().length - 5} more…</div>}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={reset}>Choose another file</Button>
              <Button onClick={doImport} disabled={busy || !mapping.title}>
                {busy && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Import {buildRows().length} rows
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
