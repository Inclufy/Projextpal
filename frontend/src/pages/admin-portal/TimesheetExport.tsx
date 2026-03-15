// ============================================================
// TIMESHEET EXPORT - Admin Portal
// Export timesheets as CSV/JSON for admin & superadmin roles
// ============================================================

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Clock, Download, FileSpreadsheet, Building2, Loader2, Filter, Calendar, FileJson, Copy, Check, Eye, Key,
} from 'lucide-react';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001/api/v1';

interface Company {
  id: number;
  name: string;
}

export default function TimesheetExport() {
  const { language } = useLanguage();
  const isNL = language === 'nl';

  const [companies, setCompanies] = useState<Company[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isApiDialogOpen, setIsApiDialogOpen] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any[] | null>(null);
  const [copiedEndpoint, setCopiedEndpoint] = useState(false);

  // Filters
  const [companyId, setCompanyId] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [exportFormat, setExportFormat] = useState<string>('csv');

  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const r = await fetch(`${API_BASE_URL}/admin/tenants/`, { headers: getAuthHeaders() });
      if (r.ok) {
        const data = await r.json();
        setCompanies(data.results || data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const buildQueryParams = () => {
    const params = new URLSearchParams();
    if (companyId && companyId !== 'all') params.set('company_id', companyId);
    if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter);
    if (startDate) params.set('start_date', startDate);
    if (endDate) params.set('end_date', endDate);
    params.set('format', exportFormat);
    return params.toString();
  };

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const params = buildQueryParams();
      const r = await fetch(`${API_BASE_URL}/admin/timesheets/export/?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!r.ok) {
        toast.error(isNL ? 'Export mislukt' : 'Export failed');
        return;
      }

      if (exportFormat === 'json') {
        const data = await r.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `timesheets_export_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const blob = await r.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `timesheets_export_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
      toast.success(isNL ? 'Export gedownload' : 'Export downloaded');
    } catch (err: any) {
      toast.error(err.message || (isNL ? 'Export mislukt' : 'Export failed'));
    } finally {
      setExportLoading(false);
    }
  };

  const handlePreview = async () => {
    setExportLoading(true);
    try {
      const params = new URLSearchParams();
      if (companyId && companyId !== 'all') params.set('company_id', companyId);
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter);
      if (startDate) params.set('start_date', startDate);
      if (endDate) params.set('end_date', endDate);
      params.set('format', 'json');

      const r = await fetch(`${API_BASE_URL}/admin/timesheets/export/?${params}`, {
        headers: getAuthHeaders(),
      });
      if (r.ok) {
        const data = await r.json();
        setPreviewData(data.slice(0, 10));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setExportLoading(false);
    }
  };

  const copyApiEndpoint = () => {
    const url = `${window.location.origin}/api/v1/admin/timesheets/api/?page=1&page_size=100`;
    navigator.clipboard.writeText(url);
    setCopiedEndpoint(true);
    toast.success(isNL ? 'API endpoint gekopieerd' : 'API endpoint copied');
    setTimeout(() => setCopiedEndpoint(false), 2000);
  };

  return (
    <>
      {/* Export Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-purple-600" />
            {isNL ? 'Urenstaten Export' : 'Timesheet Export'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {isNL
              ? 'Exporteer urenstaten als CSV of JSON. Filter op organisatie, status, en datum.'
              : 'Export timesheets as CSV or JSON. Filter by organization, status, and date.'}
          </p>

          {/* Filters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">{isNL ? 'Organisatie' : 'Organization'}</Label>
              <Select value={companyId} onValueChange={setCompanyId}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder={isNL ? 'Alle' : 'All'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isNL ? 'Alle organisaties' : 'All organizations'}</SelectItem>
                  {companies.map(c => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder={isNL ? 'Alle' : 'All'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isNL ? 'Alle' : 'All'}</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{isNL ? 'Van datum' : 'Start date'}</Label>
              <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{isNL ? 'Tot datum' : 'End date'}</Label>
              <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="h-9" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={exportFormat} onValueChange={setExportFormat}>
              <SelectTrigger className="w-28 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleExport} disabled={exportLoading} size="sm" className="gap-2">
              {exportLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {isNL ? 'Exporteren' : 'Export'}
            </Button>
            <Button onClick={handlePreview} disabled={exportLoading} variant="outline" size="sm" className="gap-2">
              <Eye className="h-4 w-4" />
              {isNL ? 'Voorbeeld' : 'Preview'}
            </Button>
            <Button onClick={() => setIsApiDialogOpen(true)} variant="outline" size="sm" className="gap-2 ml-auto">
              <Key className="h-4 w-4" />
              {isNL ? 'API Endpoint' : 'API Endpoint'}
            </Button>
          </div>

          {/* Preview Table */}
          {previewData && previewData.length > 0 && (
            <div className="border rounded-lg overflow-auto max-h-64">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isNL ? 'Datum' : 'Date'}</TableHead>
                    <TableHead>{isNL ? 'Uren' : 'Hours'}</TableHead>
                    <TableHead>{isNL ? 'Gebruiker' : 'User'}</TableHead>
                    <TableHead>{isNL ? 'Project' : 'Project'}</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>{isNL ? 'Kosten' : 'Cost'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.map((entry: any, i: number) => (
                    <TableRow key={i}>
                      <TableCell className="text-xs">{entry.date}</TableCell>
                      <TableCell className="text-xs">{entry.hours}h</TableCell>
                      <TableCell className="text-xs">{entry.user_name || entry.user_email}</TableCell>
                      <TableCell className="text-xs">{entry.project_name}</TableCell>
                      <TableCell>
                        <Badge variant={entry.status === 'approved' ? 'default' : 'secondary'} className="text-xs">
                          {entry.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">&euro;{entry.labor_cost?.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {previewData && previewData.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              {isNL ? 'Geen urenstaten gevonden met deze filters.' : 'No timesheets found with these filters.'}
            </p>
          )}
        </CardContent>
      </Card>

      {/* API Endpoint Dialog */}
      <Dialog open={isApiDialogOpen} onOpenChange={setIsApiDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-purple-600" />
              {isNL ? 'Urenstaten API Endpoint' : 'Timesheet API Endpoint'}
            </DialogTitle>
            <DialogDescription>
              {isNL
                ? 'Gebruik dit API endpoint in je integraties om urenstaten op te halen.'
                : 'Use this API endpoint in your integrations to fetch timesheet data.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>{isNL ? 'API Endpoint' : 'API Endpoint'}</Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-2.5 bg-slate-100 rounded-md text-xs font-mono break-all">
                  GET /api/v1/admin/timesheets/api/
                </code>
                <Button variant="outline" size="sm" onClick={copyApiEndpoint}>
                  {copiedEndpoint ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{isNL ? 'Authenticatie' : 'Authentication'}</Label>
              <div className="p-3 bg-slate-50 border rounded-lg text-xs space-y-2">
                <p className="font-medium">{isNL ? 'Optie 1: API Key (header)' : 'Option 1: API Key (header)'}</p>
                <code className="block bg-white p-2 rounded border">X-API-Key: your_api_key_here</code>
                <p className="font-medium mt-2">{isNL ? 'Optie 2: Bearer Token' : 'Option 2: Bearer Token'}</p>
                <code className="block bg-white p-2 rounded border">Authorization: Bearer your_token_here</code>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{isNL ? 'Query Parameters' : 'Query Parameters'}</Label>
              <div className="p-3 bg-slate-50 border rounded-lg text-xs space-y-1">
                {[
                  { param: 'project_id', desc: isNL ? 'Filter op project' : 'Filter by project' },
                  { param: 'status', desc: 'draft | submitted | approved | rejected' },
                  { param: 'start_date', desc: 'YYYY-MM-DD' },
                  { param: 'end_date', desc: 'YYYY-MM-DD' },
                  { param: 'page', desc: isNL ? 'Paginanummer (standaard: 1)' : 'Page number (default: 1)' },
                  { param: 'page_size', desc: isNL ? 'Items per pagina (max: 500)' : 'Items per page (max: 500)' },
                ].map(({ param, desc }) => (
                  <div key={param} className="flex items-start gap-2">
                    <Badge variant="outline" className="text-xs shrink-0 font-mono">{param}</Badge>
                    <span className="text-muted-foreground">{desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
              <p className="font-medium">{isNL ? 'API Keys configureren' : 'Configure API Keys'}</p>
              <p className="mt-1">
                {isNL
                  ? 'Configureer API keys in Integraties > API Keys voor elke organisatie.'
                  : 'Configure API keys in Integrations > API Keys for each organization.'}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApiDialogOpen(false)}>
              {isNL ? 'Sluiten' : 'Close'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
