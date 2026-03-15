// ============================================================
// INVOICE MANAGEMENT - COMPLETE FEATURE
// Generate, Send, Track, and Manage Invoices
// ============================================================

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  FileText,
  Search,
  Plus,
  MoreHorizontal,
  Download,
  Send,
  CheckCircle,
  AlertCircle,
  XCircle,
  RefreshCw,
  Mail,
  DollarSign,
  Calendar,
  Eye,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';


// ============================================================
// TYPES
// ============================================================

interface Invoice {
  id: number;
  uuid: string;
  invoice_number: string;
  company: number;
  company_name: string;
  status: string;
  status_display: string;
  invoice_date: string;
  due_date: string;
  period_start: string;
  period_end: string;
  billing_period: string;
  currency: string;
  total: string;
  customer_name: string;
  customer_email: string;
  sent_date: string | null;
  paid_date: string | null;
  is_overdue: boolean;
  days_overdue: number;
  auto_generated: boolean;
  pdf_url: string | null;
}

interface Company {
  id: number;
  name: string;
}

// ============================================================
// API CONFIG
// ============================================================

const API_BASE_URL = '/api/v1';

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

// ============================================================
// COMPONENT
// ============================================================

export default function InvoiceManagement() {
  const { language } = useLanguage();
  const isNL = language === 'nl';

  // State
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('all');
  const [companyFilter, setCompanyFilter] = useState('all');
  
  // Dialogs
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const [isMarkPaidDialogOpen, setIsMarkPaidDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  
  // Loading states
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);
  
  // Generate form
  const [generateForm, setGenerateForm] = useState({
    company_ids: [] as number[],
    billing_period: 'monthly',
    auto_send: false,
  });
  
  // Send form
  const [sendForm, setSendForm] = useState({
    email: '',
    subject: '',
    message: '',
  });
  
  // Mark paid form
  const [paidForm, setPaidForm] = useState({
    payment_method: '',
    payment_reference: '',
  });

  // ============================================================
  // FETCH DATA
  // ============================================================

  const fetchInvoices = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let url = `${API_BASE_URL}/admin/invoices/?`;
      
      if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;
      if (statusFilter !== 'all') url += `status=${statusFilter}&`;
      if (periodFilter !== 'all') url += `period=${periodFilter}&`;
      if (companyFilter !== 'all') url += `company=${companyFilter}&`;

      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch invoices: ${response.status}`);
      }

      const data = await response.json();
      setInvoices(data.results || data);
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setError(isNL ? 'Kon facturen niet laden' : 'Failed to load invoices');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await fetch(`/api/v1/admin/tenants/`, {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setCompanies(data.results || data);
      }
    } catch (err) {
      console.error('Error fetching companies:', err);
    }
  };

  useEffect(() => {
    fetchInvoices();
    fetchCompanies();
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchInvoices();
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, statusFilter, periodFilter, companyFilter]);

  // ============================================================
  // ACTIONS
  // ============================================================

  const handleGenerate = async () => {
    if (isGenerating) return;
    setIsGenerating(true);

    try {
      const response = await fetch(`${API_BASE_URL}/admin/invoices/generate/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(generateForm),
      });

      if (!response.ok) {
        throw new Error('Failed to generate invoices');
      }

      const data = await response.json();
      
      toast.success(
        isNL 
          ? `${data.generated_count} facturen gegenereerd` 
          : `${data.generated_count} invoices generated`
      );
      
      setIsGenerateDialogOpen(false);
      fetchInvoices();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSend = async () => {
    if (!selectedInvoice || isSending) return;
    setIsSending(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/invoices/${selectedInvoice.id}/send/`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(sendForm),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to send invoice');
      }

      toast.success(isNL ? 'Factuur verzonden' : 'Invoice sent');
      setIsSendDialogOpen(false);
      setSendForm({ email: '', subject: '', message: '' });
      fetchInvoices();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSending(false);
    }
  };

  const handleMarkPaid = async () => {
    if (!selectedInvoice || isMarkingPaid) return;
    setIsMarkingPaid(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/invoices/${selectedInvoice.id}/mark_paid/`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(paidForm),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to mark as paid');
      }

      toast.success(isNL ? 'Factuur gemarkeerd als betaald' : 'Invoice marked as paid');
      setIsMarkPaidDialogOpen(false);
      setPaidForm({ payment_method: '', payment_reference: '' });
      fetchInvoices();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsMarkingPaid(false);
    }
  };

  const handleDownloadPDF = async (invoice: Invoice) => {
    if (!invoice.pdf_url) {
      toast.error(isNL ? 'Geen PDF beschikbaar' : 'No PDF available');
      return;
    }

    try {
      window.open(invoice.pdf_url, '_blank');
    } catch (err) {
      toast.error(isNL ? 'Kon PDF niet openen' : 'Failed to open PDF');
    }
  };

  const handleGeneratePDF = async (invoice: Invoice) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/invoices/${invoice.id}/generate_pdf/`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const data = await response.json();
      toast.success(isNL ? 'PDF gegenereerd' : 'PDF generated');
      
      // Open PDF in new tab
      if (data.pdf_url) {
        window.open(data.pdf_url, '_blank');
      }
      
      fetchInvoices();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const openSendDialog = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setSendForm({
      email: invoice.customer_email,
      subject: `Invoice ${invoice.invoice_number}`,
      message: '',
    });
    setIsSendDialogOpen(true);
  };

  const openMarkPaidDialog = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPaidForm({ payment_method: '', payment_reference: '' });
    setIsMarkPaidDialogOpen(true);
  };

  // ============================================================
  // HELPERS
  // ============================================================

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatMoney = (amount: string, currency: string) => {
    const symbols: Record<string, string> = {
      EUR: '€',
      USD: '$',
      GBP: '£',
    };
    return `${symbols[currency] || currency} ${parseFloat(amount).toFixed(2)}`;
  };

  const getStatusBadge = (invoice: Invoice) => {
    if (invoice.is_overdue) {
      return (
        <Badge className="bg-red-100 text-red-700">
          <AlertCircle className="mr-1 h-3 w-3" />
          {isNL ? `${invoice.days_overdue}d achterstallig` : `${invoice.days_overdue}d overdue`}
        </Badge>
      );
    }

    const statusMap: Record<string, { color: string; icon: any }> = {
      draft: { color: 'bg-gray-100 text-gray-700', icon: FileText },
      sent: { color: 'bg-blue-100 text-blue-700', icon: Send },
      paid: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
      overdue: { color: 'bg-red-100 text-red-700', icon: AlertCircle },
      cancelled: { color: 'bg-gray-100 text-gray-700', icon: XCircle },
    };

    const config = statusMap[invoice.status] || statusMap.draft;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="mr-1 h-3 w-3" />
        {invoice.status_display}
      </Badge>
    );
  };

  const getPeriodLabel = (period: string) => {
    const labels: Record<string, string> = {
      monthly: isNL ? 'Maandelijks' : 'Monthly',
      quarterly: isNL ? 'Kwartaal' : 'Quarterly',
      yearly: isNL ? 'Jaarlijks' : 'Yearly',
    };
    return labels[period] || period;
  };

  // ============================================================
  // STATS
  // ============================================================

  const stats = {
    total: invoices.length,
    draft: invoices.filter(i => i.status === 'draft').length,
    sent: invoices.filter(i => i.status === 'sent').length,
    paid: invoices.filter(i => i.status === 'paid').length,
    overdue: invoices.filter(i => i.is_overdue).length,
    totalAmount: invoices
      .filter(i => i.status !== 'cancelled')
      .reduce((sum, i) => sum + parseFloat(i.total), 0),
    unpaidAmount: invoices
      .filter(i => i.status !== 'paid' && i.status !== 'cancelled')
      .reduce((sum, i) => sum + parseFloat(i.total), 0),
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isNL ? 'Facturen' : 'Invoices'}
          </h1>
          <p className="text-muted-foreground">
            {isNL ? 'Beheer en genereer facturen' : 'Manage and generate invoices'}
          </p>
        </div>
        <Button onClick={() => setIsGenerateDialogOpen(true)}>
          <Zap className="mr-2 h-4 w-4" />
          {isNL ? 'Genereer Facturen' : 'Generate Invoices'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {isNL ? 'Totaal Facturen' : 'Total Invoices'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {isNL ? 'Betaald' : 'Paid'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.paid}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {isNL ? 'Achterstallig' : 'Overdue'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {isNL ? 'Openstaand' : 'Outstanding'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{stats.unpaidAmount.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={isNL ? 'Zoek facturen...' : 'Search invoices...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder={isNL ? 'Status' : 'Status'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isNL ? 'Alle statussen' : 'All statuses'}</SelectItem>
                <SelectItem value="draft">{isNL ? 'Concept' : 'Draft'}</SelectItem>
                <SelectItem value="sent">{isNL ? 'Verzonden' : 'Sent'}</SelectItem>
                <SelectItem value="paid">{isNL ? 'Betaald' : 'Paid'}</SelectItem>
                <SelectItem value="overdue">{isNL ? 'Achterstallig' : 'Overdue'}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger>
                <SelectValue placeholder={isNL ? 'Period' : 'Period'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isNL ? 'Alle periodes' : 'All periods'}</SelectItem>
                <SelectItem value="monthly">{isNL ? 'Maandelijks' : 'Monthly'}</SelectItem>
                <SelectItem value="quarterly">{isNL ? 'Kwartaal' : 'Quarterly'}</SelectItem>
                <SelectItem value="yearly">{isNL ? 'Jaarlijks' : 'Yearly'}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={companyFilter} onValueChange={setCompanyFilter}>
              <SelectTrigger>
                <SelectValue placeholder={isNL ? 'Organisatie' : 'Company'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isNL ? 'Alle organisaties' : 'All companies'}</SelectItem>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id.toString()}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={fetchInvoices}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <div className="flex items-center justify-center p-8 text-red-500">
          <AlertCircle className="mr-2 h-5 w-5" />
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invoices Table */}
      {!isLoading && !error && (
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isNL ? 'Nummer' : 'Number'}</TableHead>
                  <TableHead>{isNL ? 'Klant' : 'Customer'}</TableHead>
                  <TableHead>{isNL ? 'Datum' : 'Date'}</TableHead>
                  <TableHead>{isNL ? 'Vervaldatum' : 'Due Date'}</TableHead>
                  <TableHead>{isNL ? 'Periode' : 'Period'}</TableHead>
                  <TableHead>{isNL ? 'Bedrag' : 'Amount'}</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">{isNL ? 'Acties' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      {isNL ? 'Geen facturen gevonden' : 'No invoices found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {invoice.invoice_number}
                        {invoice.auto_generated && (
                          <Zap className="inline ml-2 h-3 w-3 text-blue-500" />
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{invoice.customer_name}</p>
                          <p className="text-xs text-muted-foreground">{invoice.customer_email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(invoice.invoice_date)}</TableCell>
                      <TableCell>{formatDate(invoice.due_date)}</TableCell>
                      <TableCell>{getPeriodLabel(invoice.billing_period)}</TableCell>
                      <TableCell className="font-bold">
                        {formatMoney(invoice.total, invoice.currency)}
                      </TableCell>
                      <TableCell>{getStatusBadge(invoice)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {invoice.pdf_url ? (
                              <DropdownMenuItem onClick={() => handleDownloadPDF(invoice)}>
                                <Download className="mr-2 h-4 w-4" />
                                {isNL ? 'Download PDF' : 'Download PDF'}
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleGeneratePDF(invoice)}>
                                <FileText className="mr-2 h-4 w-4" />
                                {isNL ? 'Genereer PDF' : 'Generate PDF'}
                              </DropdownMenuItem>
                            )}
                            
                            {invoice.status !== 'paid' && (
                              <>
                                <DropdownMenuItem onClick={() => openSendDialog(invoice)}>
                                  <Send className="mr-2 h-4 w-4" />
                                  {isNL ? 'Verzenden' : 'Send'}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openMarkPaidDialog(invoice)}>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  {isNL ? 'Markeer Betaald' : 'Mark Paid'}
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Generate Invoices Dialog */}
      <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isNL ? 'Facturen Genereren' : 'Generate Invoices'}</DialogTitle>
            <DialogDescription>
              {isNL 
                ? 'Genereer automatisch facturen voor actieve abonnementen'
                : 'Automatically generate invoices for active subscriptions'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{isNL ? 'Facturatiecyclus' : 'Billing Period'}</Label>
              <Select
                value={generateForm.billing_period}
                onValueChange={(v) => setGenerateForm({ ...generateForm, billing_period: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">{isNL ? 'Maandelijks' : 'Monthly'}</SelectItem>
                  <SelectItem value="quarterly">{isNL ? 'Kwartaal' : 'Quarterly'}</SelectItem>
                  <SelectItem value="yearly">{isNL ? 'Jaarlijks' : 'Yearly'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="auto_send"
                checked={generateForm.auto_send}
                onChange={(e) => setGenerateForm({ ...generateForm, auto_send: e.target.checked })}
                className="h-4 w-4"
              />
              <label htmlFor="auto_send" className="text-sm">
                {isNL ? 'Automatisch verzenden via email' : 'Automatically send via email'}
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGenerateDialogOpen(false)} disabled={isGenerating}>
              {isNL ? 'Annuleren' : 'Cancel'}
            </Button>
            <Button onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? (isNL ? 'Bezig...' : 'Generating...') : (isNL ? 'Genereren' : 'Generate')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Invoice Dialog */}
      <Dialog open={isSendDialogOpen} onOpenChange={setIsSendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isNL ? 'Factuur Verzenden' : 'Send Invoice'}</DialogTitle>
            <DialogDescription>
              {selectedInvoice && `${selectedInvoice.invoice_number} - ${selectedInvoice.customer_name}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{isNL ? 'Email' : 'Email'}</Label>
              <Input
                type="email"
                value={sendForm.email}
                onChange={(e) => setSendForm({ ...sendForm, email: e.target.value })}
                disabled={isSending}
              />
            </div>
            <div className="space-y-2">
              <Label>{isNL ? 'Onderwerp' : 'Subject'}</Label>
              <Input
                value={sendForm.subject}
                onChange={(e) => setSendForm({ ...sendForm, subject: e.target.value })}
                disabled={isSending}
              />
            </div>
            <div className="space-y-2">
              <Label>{isNL ? 'Bericht (optioneel)' : 'Message (optional)'}</Label>
              <Textarea
                value={sendForm.message}
                onChange={(e) => setSendForm({ ...sendForm, message: e.target.value })}
                disabled={isSending}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSendDialogOpen(false)} disabled={isSending}>
              {isNL ? 'Annuleren' : 'Cancel'}
            </Button>
            <Button onClick={handleSend} disabled={!sendForm.email || isSending}>
              <Send className="mr-2 h-4 w-4" />
              {isSending ? (isNL ? 'Bezig...' : 'Sending...') : (isNL ? 'Verzenden' : 'Send')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mark Paid Dialog */}
      <Dialog open={isMarkPaidDialogOpen} onOpenChange={setIsMarkPaidDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isNL ? 'Markeer als Betaald' : 'Mark as Paid'}</DialogTitle>
            <DialogDescription>
              {selectedInvoice && `${selectedInvoice.invoice_number} - €${selectedInvoice.total}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{isNL ? 'Betaalmethode' : 'Payment Method'}</Label>
              <Input
                value={paidForm.payment_method}
                onChange={(e) => setPaidForm({ ...paidForm, payment_method: e.target.value })}
                placeholder={isNL ? 'Bijv. Bankoverschrijving' : 'e.g. Bank Transfer'}
                disabled={isMarkingPaid}
              />
            </div>
            <div className="space-y-2">
              <Label>{isNL ? 'Referentie' : 'Reference'}</Label>
              <Input
                value={paidForm.payment_reference}
                onChange={(e) => setPaidForm({ ...paidForm, payment_reference: e.target.value })}
                placeholder={isNL ? 'Optioneel' : 'Optional'}
                disabled={isMarkingPaid}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMarkPaidDialogOpen(false)} disabled={isMarkingPaid}>
              {isNL ? 'Annuleren' : 'Cancel'}
            </Button>
            <Button onClick={handleMarkPaid} disabled={isMarkingPaid}>
              <CheckCircle className="mr-2 h-4 w-4" />
              {isMarkingPaid ? (isNL ? 'Bezig...' : 'Saving...') : (isNL ? 'Markeer Betaald' : 'Mark Paid')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
