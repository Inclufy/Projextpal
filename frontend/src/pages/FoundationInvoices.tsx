import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProjectHeader } from "@/components/ProjectHeader";
import { ReportExportMenu } from "@/components/ReportExportMenu";
import { Plus, Loader2, Paperclip, Trash2, FileText } from "lucide-react";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { toast } from "sonner";

const STATUSES = ["draft", "received", "approved", "paid", "disputed", "cancelled"];
const emptyForm = { vendorId: "", vendorName: "", invoice_number: "", issue_date: "", due_date: "", total_amount: "", vat_amount: "", currency: "EUR", status: "received", paid_amount: "" };

const FoundationInvoices = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [file, setFile] = useState<File | null>(null);

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };

  const fetchData = async () => {
    try {
      const [iv, vn] = await Promise.all([
        fetch(`/api/v1/finance/invoices/?project=${id}`, { headers }),
        fetch(`/api/v1/finance/vendors/`, { headers }),
      ]);
      if (iv.ok) { const d = await iv.json(); setInvoices(Array.isArray(d) ? d : d.results || []); }
      if (vn.ok) { const d = await vn.json(); setVendors(Array.isArray(d) ? d : d.results || []); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, [id]);

  const openCreate = () => { setForm({ ...emptyForm, issue_date: new Date().toISOString().split("T")[0] }); setFile(null); setDialogOpen(true); };

  const csvRef = useRef<HTMLInputElement>(null);
  const pdfRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);

  const importCsv = async (file: File) => {
    setImporting(true);
    try {
      const raw = await file.text();
      const r = await fetch(`/api/v1/finance/invoices/import/?project=${id}`, {
        method: "POST", headers: { ...headers, "Content-Type": "text/csv" }, body: raw,
      });
      if (r.ok) { const d = await r.json(); toast.success(`${pt("Imported")}: ${d.created} ${pt("created")}, ${d.skipped} ${pt("skipped")}`); fetchData(); }
      else toast.error(pt("Import failed"));
    } catch { toast.error(pt("Import failed")); }
    finally { setImporting(false); if (csvRef.current) csvRef.current.value = ""; }
  };

  const importPdf = async (file: File) => {
    setImporting(true);
    try {
      const fd = new FormData(); fd.append("file", file); fd.append("project", String(id));
      const r = await fetch(`/api/v1/finance/invoices/import-pdf/`, { method: "POST", headers, body: fd });
      if (r.ok) { const d = await r.json(); toast.success(d.had_text ? pt("PDF imported — verify the extracted fields") : pt("PDF attached — please fill the fields")); fetchData(); }
      else toast.error(pt("Import failed"));
    } catch { toast.error(pt("Import failed")); }
    finally { setImporting(false); if (pdfRef.current) pdfRef.current.value = ""; }
  };

  const ensureVendor = async (): Promise<string | null> => {
    if (form.vendorId) return form.vendorId;
    if (!form.vendorName.trim()) { toast.error(pt("Pick or name a vendor")); return null; }
    const r = await fetch(`/api/v1/finance/vendors/`, {
      method: "POST", headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.vendorName.trim() }),
    });
    if (!r.ok) { toast.error(pt("Vendor create failed")); return null; }
    const v = await r.json(); return String(v.id);
  };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      const vendorId = await ensureVendor();
      if (!vendorId) { setSubmitting(false); return; }
      const fd = new FormData();
      fd.append("vendor", vendorId);
      fd.append("project", String(id));
      fd.append("invoice_number", form.invoice_number);
      if (form.issue_date) fd.append("issue_date", form.issue_date);
      if (form.due_date) fd.append("due_date", form.due_date);
      fd.append("currency", form.currency);
      fd.append("total_amount", form.total_amount || "0");
      if (form.vat_amount) fd.append("vat_amount", form.vat_amount);
      if (form.paid_amount) fd.append("paid_amount", form.paid_amount);
      fd.append("status", form.status);
      if (file) fd.append("attachment", file);
      const r = await fetch(`/api/v1/finance/invoices/`, { method: "POST", headers, body: fd });
      if (r.ok) { toast.success(pt("Saved")); setDialogOpen(false); fetchData(); }
      else { const e = await r.json().catch(() => ({})); toast.error(JSON.stringify(e).slice(0, 120) || pt("Save failed")); }
    } catch { toast.error(pt("Save failed")); }
    finally { setSubmitting(false); }
  };

  const markPaid = async (inv: any) => {
    const r = await fetch(`/api/v1/finance/invoices/${inv.id}/mark_paid/`, { method: "POST", headers });
    if (r.ok) { toast.success(pt("Marked paid")); fetchData(); } else toast.error(pt("Failed"));
  };
  const handleDelete = async (iid: any) => {
    if (!confirm(pt("Are you sure you want to delete this?"))) return;
    const r = await fetch(`/api/v1/finance/invoices/${iid}/`, { method: "DELETE", headers });
    if (r.ok || r.status === 204) { toast.success(pt("Deleted")); fetchData(); }
  };

  const statusColor = (s: string) => ({ paid: "bg-green-100 text-green-700", received: "bg-blue-100 text-blue-700", approved: "bg-indigo-100 text-indigo-700", disputed: "bg-red-100 text-red-700", draft: "bg-gray-100 text-gray-600", cancelled: "bg-gray-100 text-gray-500" }[s] || "bg-gray-100");
  const num = (v: any) => Number(v || 0).toLocaleString("nl-NL", { minimumFractionDigits: 2 });
  const totalExternal = invoices.reduce((s, i) => s + Number(i.total_amount || 0), 0);
  const totalPaid = invoices.reduce((s, i) => s + Number(i.paid_amount || 0), 0);

  const exportSections = [{ heading: "Invoices", rows: invoices.map((i) => [`${i.vendor_name || ""} ${i.invoice_number}`, `${num(i.total_amount)} ${i.currency} · ${i.status} · paid ${num(i.paid_amount)}`]) as [string, any][] }];

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-emerald-500" />
            <h1 className="text-2xl font-bold">{pt("Invoices")}</h1>
            <Badge variant="outline">{invoices.length}</Badge>
          </div>
          <div className="flex gap-2">
            {invoices.length > 0 && <ReportExportMenu title="Invoices" sections={exportSections} />}
            <input ref={csvRef} type="file" accept=".csv" className="hidden" onChange={(e) => e.target.files?.[0] && importCsv(e.target.files[0])} />
            <input ref={pdfRef} type="file" accept=".pdf" className="hidden" onChange={(e) => e.target.files?.[0] && importPdf(e.target.files[0])} />
            <Button variant="outline" className="gap-2" disabled={importing} onClick={() => csvRef.current?.click()}>{importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}{pt("Import CSV")}</Button>
            <Button variant="outline" className="gap-2" disabled={importing} onClick={() => pdfRef.current?.click()}><Paperclip className="h-4 w-4" />{pt("Import PDF")}</Button>
            <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" />{pt("New Invoice")}</Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4"><div className="text-xs text-muted-foreground">{pt("External total")}</div><div className="text-xl font-bold">€ {num(totalExternal)}</div></Card>
          <Card className="p-4"><div className="text-xs text-muted-foreground">{pt("Paid")}</div><div className="text-xl font-bold text-green-600">€ {num(totalPaid)}</div></Card>
          <Card className="p-4"><div className="text-xs text-muted-foreground">{pt("Outstanding")}</div><div className="text-xl font-bold text-amber-600">€ {num(totalExternal - totalPaid)}</div></Card>
        </div>

        <Card className="p-0 overflow-hidden">
          {invoices.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="mb-3">{pt("No invoices yet")}</p>
              <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />{pt("New Invoice")}</Button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/50"><tr>
                {["VENDOR", "NUMBER", "DATE", "TOTAL", "PAID", "STATUS", "DOC", ""].map((h) => <th key={h} className="text-left p-3 font-medium text-muted-foreground text-xs">{h}</th>)}
              </tr></thead>
              <tbody>
                {invoices.map((i) => (
                  <tr key={i.id} className="border-t">
                    <td className="p-3 font-medium">{i.vendor_name || "—"}</td>
                    <td className="p-3">{i.invoice_number}</td>
                    <td className="p-3">{i.issue_date}</td>
                    <td className="p-3">{num(i.total_amount)} {i.currency}</td>
                    <td className="p-3">{num(i.paid_amount)}</td>
                    <td className="p-3"><Badge className={`text-xs ${statusColor(i.status)}`}>{i.status}</Badge></td>
                    <td className="p-3">{i.attachment ? <a href={i.attachment} target="_blank" rel="noopener noreferrer" className="text-primary"><Paperclip className="h-4 w-4" /></a> : <span className="text-muted-foreground">—</span>}</td>
                    <td className="p-3"><div className="flex gap-1">
                      {i.status !== "paid" && <Button variant="ghost" size="sm" className="text-xs" onClick={() => markPaid(i)}>{pt("Mark paid")}</Button>}
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(i.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{pt("New Invoice")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{pt("Vendor")}</Label>
              <Select value={form.vendorId || "new"} onValueChange={(v) => setForm({ ...form, vendorId: v === "new" ? "" : v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">+ {pt("New vendor")}</SelectItem>
                  {vendors.map((v) => <SelectItem key={v.id} value={String(v.id)}>{v.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {!form.vendorId && <Input placeholder={pt("New vendor name")} value={form.vendorName} onChange={(e) => setForm({ ...form, vendorName: e.target.value })} />}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{pt("Invoice number")}</Label><Input value={form.invoice_number} onChange={(e) => setForm({ ...form, invoice_number: e.target.value })} /></div>
              <div className="space-y-2"><Label>{pt("Status")}</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{pt("Issue date")}</Label><Input type="date" value={form.issue_date} onChange={(e) => setForm({ ...form, issue_date: e.target.value })} /></div>
              <div className="space-y-2"><Label>{pt("Due date")}</Label><Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>{pt("Total")}</Label><Input type="number" value={form.total_amount} onChange={(e) => setForm({ ...form, total_amount: e.target.value })} /></div>
              <div className="space-y-2"><Label>{pt("VAT")}</Label><Input type="number" value={form.vat_amount} onChange={(e) => setForm({ ...form, vat_amount: e.target.value })} /></div>
              <div className="space-y-2"><Label>{pt("Paid")}</Label><Input type="number" value={form.paid_amount} onChange={(e) => setForm({ ...form, paid_amount: e.target.value })} /></div>
            </div>
            <div className="space-y-2">
              <Label>{pt("Attachment")} <span className="text-xs text-muted-foreground">(PDF/scan)</span></Label>
              <Input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button>
              <Button onClick={handleSave} disabled={submitting || !form.invoice_number}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FoundationInvoices;
