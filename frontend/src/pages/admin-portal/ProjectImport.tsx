// ============================================================
// PROJECT IMPORT - Admin Portal
// Import projects from CSV into client environments
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
  FolderUp, Upload, Download, Loader2, CheckCircle2, XCircle, FileSpreadsheet, Building2,
} from 'lucide-react';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001/api/v1';

interface Company {
  id: number;
  name: string;
}

export default function ProjectImport() {
  const { language } = useLanguage();
  const isNL = language === 'nl';

  const [companies, setCompanies] = useState<Company[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importCompanyId, setImportCompanyId] = useState<string>('');
  const [importResults, setImportResults] = useState<{ created: number; errors: string[] } | null>(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return { 'Authorization': `Bearer ${token}` };
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const r = await fetch(`${API_BASE_URL}/admin/tenants/`, {
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      });
      if (r.ok) {
        const data = await r.json();
        setCompanies(data.results || data);
      }
    } catch (err) {
      console.error('Error fetching companies:', err);
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      toast.error(isNL ? 'Selecteer een bestand' : 'Select a file');
      return;
    }
    setImportLoading(true);
    setImportResults(null);
    try {
      const formData = new FormData();
      formData.append('file', importFile);
      if (importCompanyId && importCompanyId !== 'all') {
        formData.append('company_id', importCompanyId);
      }
      const r = await fetch(`${API_BASE_URL}/admin/projects/import/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData,
      });
      if (r.ok) {
        const data = await r.json();
        setImportResults({ created: data.created || 0, errors: data.errors || [] });
        if (data.created > 0) {
          toast.success(isNL ? `${data.created} projecten geïmporteerd` : `${data.created} projects imported`);
        }
        if (data.errors?.length > 0) {
          toast.error(isNL ? `${data.errors.length} fouten bij import` : `${data.errors.length} import errors`);
        }
      } else {
        const errData = await r.json().catch(() => ({}));
        toast.error(errData.error || (isNL ? 'Import mislukt' : 'Import failed'));
      }
    } catch (err: any) {
      toast.error(err.message || (isNL ? 'Import mislukt' : 'Import failed'));
    } finally {
      setImportLoading(false);
    }
  };

  const downloadTemplate = () => {
    const csv = 'name,project_type,methodology,budget,start_date,end_date,status,description,company_id\nWebsite Redesign,software,agile,50000,2025-01-01,2025-06-30,planning,Redesign the company website,\nERP Implementation,software,waterfall,150000,2025-03-01,2025-12-31,pending,Full ERP rollout,\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'projects_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Card className="border-dashed border-2 hover:border-purple-300 transition-colors cursor-pointer" onClick={() => setIsDialogOpen(true)}>
        <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-3">
          <div className="p-3 rounded-full bg-purple-100">
            <FolderUp className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold">{isNL ? 'Projecten Importeren' : 'Import Projects'}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {isNL ? 'Importeer projecten vanuit CSV naar een klant omgeving' : 'Import projects from CSV into a client environment'}
            </p>
          </div>
          <Button size="sm" variant="outline" className="gap-2">
            <Upload className="h-3.5 w-3.5" />
            {isNL ? 'CSV Importeren' : 'Import CSV'}
          </Button>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderUp className="h-5 w-5 text-purple-600" />
              {isNL ? 'Projecten Importeren' : 'Import Projects'}
            </DialogTitle>
            <DialogDescription>
              {isNL
                ? 'Upload een CSV bestand om projecten in bulk te importeren naar een klant omgeving.'
                : 'Upload a CSV file to bulk import projects into a client environment.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Template download */}
            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div>
                <p className="text-sm font-medium text-blue-900">
                  <FileSpreadsheet className="h-4 w-4 inline mr-1" />
                  {isNL ? 'CSV Template' : 'CSV Template'}
                </p>
                <p className="text-xs text-blue-700 mt-0.5">
                  name, project_type, methodology, budget, start_date, end_date, status
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={downloadTemplate} className="border-blue-300 text-blue-700 hover:bg-blue-100">
                <Download className="h-3.5 w-3.5 mr-1" />
                Template
              </Button>
            </div>

            {/* Target Company */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                {isNL ? 'Importeer naar organisatie' : 'Import into organization'}
              </Label>
              <Select value={importCompanyId} onValueChange={setImportCompanyId}>
                <SelectTrigger>
                  <SelectValue placeholder={isNL ? 'Selecteer organisatie...' : 'Select organization...'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isNL ? 'Per CSV kolom (company_id)' : 'Per CSV column (company_id)'}</SelectItem>
                  {companies.map(c => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* File upload */}
            <div className="space-y-2">
              <Label>{isNL ? 'CSV Bestand' : 'CSV File'}</Label>
              <Input
                type="file"
                accept=".csv,.txt"
                onChange={(e) => {
                  setImportFile(e.target.files?.[0] || null);
                  setImportResults(null);
                }}
              />
              {importFile && (
                <p className="text-xs text-muted-foreground">
                  {importFile.name} ({(importFile.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>

            {/* Field info */}
            <div className="p-3 bg-gray-50 border rounded-lg text-xs space-y-1">
              <p className="font-medium">{isNL ? 'Beschikbare velden:' : 'Available fields:'}</p>
              <div className="flex flex-wrap gap-1.5">
                {['name*', 'project_type', 'methodology', 'budget', 'start_date', 'end_date', 'status', 'description'].map(f => (
                  <Badge key={f} variant="outline" className="text-xs">{f}</Badge>
                ))}
              </div>
              <p className="mt-1">{isNL ? 'Types:' : 'Types:'} software, design, research, other</p>
              <p>{isNL ? 'Methodologieën:' : 'Methodologies:'} prince2, agile, scrum, kanban, waterfall</p>
            </div>

            {/* Import results */}
            {importResults && (
              <div className="space-y-2">
                {importResults.created > 0 && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{importResults.created} {isNL ? 'projecten succesvol geïmporteerd' : 'projects imported successfully'}</span>
                  </div>
                )}
                {importResults.errors.length > 0 && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800 space-y-1">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 shrink-0" />
                      <span className="font-medium">{importResults.errors.length} {isNL ? 'fouten:' : 'errors:'}</span>
                    </div>
                    <ul className="ml-6 list-disc space-y-0.5 text-xs max-h-32 overflow-y-auto">
                      {importResults.errors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {isNL ? 'Sluiten' : 'Close'}
            </Button>
            <Button onClick={handleImport} disabled={!importFile || importLoading}>
              {importLoading ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" />{isNL ? 'Importeren...' : 'Importing...'}</>
              ) : (
                <><Upload className="h-4 w-4 mr-2" />{isNL ? 'Importeren' : 'Import'}</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
