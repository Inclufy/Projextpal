import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ProjectHeader } from '@/components/ProjectHeader';
import { useProject } from '@/hooks/useApi';
import { prince2Api, HighlightReport, Stage } from '@/lib/prince2Api';
import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
import { 
  BarChart3, Plus, Calendar, AlertTriangle, CheckCircle2, 
  Clock, RefreshCw, FileText, TrendingUp
} from 'lucide-react';

const Prince2HighlightReport = () => {
  const { id } = useParams<{ id: string }>();
  const { data: project } = useProject(id);
  
  const [reports, setReports] = useState<HighlightReport[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState<HighlightReport | null>(null);
  
  const [newReport, setNewReport] = useState<Partial<HighlightReport>>({
    overall_status: 'green'
  });

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [reportData, stageData] = await Promise.all([
        prince2Api.highlightReports.getAll(id),
        prince2Api.stages.getAll(id)
      ]);
      setReports(reportData);
      setStages(stageData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createReport = async () => {
    if (!id || !newReport.stage) return;
    try {
      await prince2Api.highlightReports.create(id, {
        ...newReport,
        report_date: new Date().toISOString().split('T')[0]
      });
      setShowCreateDialog(false);
      setNewReport({ overall_status: 'green' });
      await loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; icon: any }> = {
      green: { bg: 'bg-green-500', icon: CheckCircle2 },
      amber: { bg: 'bg-amber-500', icon: AlertTriangle },
      red: { bg: 'bg-red-500', icon: AlertTriangle }
    };
    const style = styles[status] || styles.green;
    const Icon = style.icon;
    return (
      <Badge className={`${style.bg} text-white flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status.toUpperCase()}
      </Badge>
    );
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader project={project} />
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-blue-600" />
              Highlight Reports
            </h1>
            <p className="text-muted-foreground">Regular status reports to Project Board</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadData}>
              <RefreshCw className="h-4 w-4 mr-2" />Refresh
            </Button>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" />New Report</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader><DialogTitle>Create Highlight Report</DialogTitle></DialogHeader>
                <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Stage</Label>
                      <Select value={newReport.stage?.toString() || ''} onValueChange={(v) => setNewReport({...newReport, stage: parseInt(v)})}>
                        <SelectTrigger><SelectValue placeholder="Select stage" /></SelectTrigger>
                        <SelectContent>
                          {stages.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Overall Status</Label>
                      <Select value={newReport.overall_status || 'green'} onValueChange={(v) => setNewReport({...newReport, overall_status: v as any})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="green">🟢 Green - On Track</SelectItem>
                          <SelectItem value="amber">🟡 Amber - At Risk</SelectItem>
                          <SelectItem value="red">🔴 Red - Off Track</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Period Start</Label>
                      <Input type="date" value={newReport.period_start || ''} onChange={(e) => setNewReport({...newReport, period_start: e.target.value})} />
                    </div>
                    <div>
                      <Label>Period End</Label>
                      <Input type="date" value={newReport.period_end || ''} onChange={(e) => setNewReport({...newReport, period_end: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <Label>Status Summary</Label>
                    <Textarea value={newReport.status_summary || ''} onChange={(e) => setNewReport({...newReport, status_summary: e.target.value})} rows={3} />
                  </div>
                  <div>
                    <Label>Work Completed This Period</Label>
                    <Textarea value={newReport.work_completed || ''} onChange={(e) => setNewReport({...newReport, work_completed: e.target.value})} rows={3} />
                  </div>
                  <div>
                    <Label>Work Planned Next Period</Label>
                    <Textarea value={newReport.work_planned_next_period || ''} onChange={(e) => setNewReport({...newReport, work_planned_next_period: e.target.value})} rows={3} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Issues Summary</Label>
                      <Textarea value={newReport.issues_summary || ''} onChange={(e) => setNewReport({...newReport, issues_summary: e.target.value})} rows={2} />
                    </div>
                    <div>
                      <Label>Risks Summary</Label>
                      <Textarea value={newReport.risks_summary || ''} onChange={(e) => setNewReport({...newReport, risks_summary: e.target.value})} rows={2} />
                    </div>
                  </div>
                  <Button onClick={createReport} className="w-full">Create Report</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="text-red-700">{error}</span>
            </CardContent>
          </Card>
        )}

        {/* Reports List */}
        {reports.length > 0 ? (
          <div className="space-y-4">
            {reports.map((report) => (
              <Card key={report.id} className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => setSelectedReport(report)}>
                <CardContent className="py-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-12 rounded-full ${
                      report.overall_status === 'green' ? 'bg-green-500' :
                      report.overall_status === 'amber' ? 'bg-amber-500' : 'bg-red-500'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{report.stage_name}</h3>
                        {getStatusBadge(report.overall_status)}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{report.status_summary}</p>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <div className="flex items-center gap-1 justify-end">
                        <Calendar className="h-4 w-4" />
                        {report.report_date}
                      </div>
                      <p className="mt-1">Period: {report.period_start} - {report.period_end}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">No highlight reports yet</p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />Create First Report
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Report Detail Dialog */}
        <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            {selectedReport && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-3">
                    <DialogTitle>Highlight Report - {selectedReport.stage_name}</DialogTitle>
                    {getStatusBadge(selectedReport.overall_status)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Report Date: {selectedReport.report_date} | Period: {selectedReport.period_start} - {selectedReport.period_end}
                  </p>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Status Summary</h4>
                    <p className="text-muted-foreground whitespace-pre-line">{selectedReport.status_summary}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />Work Completed
                      </h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">{selectedReport.work_completed}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-500" />Planned Next
                      </h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">{selectedReport.work_planned_next_period}</p>
                    </div>
                  </div>
                  {(selectedReport.issues_summary || selectedReport.risks_summary) && (
                    <div className="grid grid-cols-2 gap-4">
                      {selectedReport.issues_summary && (
                        <div>
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-500" />Issues
                          </h4>
                          <p className="text-sm text-muted-foreground whitespace-pre-line">{selectedReport.issues_summary}</p>
                        </div>
                      )}
                      {selectedReport.risks_summary && (
                        <div>
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-500" />Risks
                          </h4>
                          <p className="text-sm text-muted-foreground whitespace-pre-line">{selectedReport.risks_summary}</p>
                        </div>
                      )}
                    </div>
                  )}
                  {selectedReport.budget_spent && (
                    <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                      <TrendingUp className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Budget Spent</p>
                        <p className="font-medium">€{Number(selectedReport.budget_spent).toLocaleString()}</p>
                      </div>
                      {selectedReport.budget_forecast && (
                        <div className="ml-8">
                          <p className="text-sm text-muted-foreground">Forecast</p>
                          <p className="font-medium">€{Number(selectedReport.budget_forecast).toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Information */}
        <Card>
          <CardHeader><CardTitle className="text-lg">About Highlight Reports</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Highlight Reports provide regular status updates from the Project Manager to the Project Board.
              They are typically produced at intervals defined in the Communication Management Approach 
              (often weekly or bi-weekly) and summarize stage progress, issues, and risks.
            </p>
          </CardContent>
        </Card>
      </div>

          {/* Methodology Help Panel */}
          <MethodologyHelpPanel methodology="prince2" />
    </div>
  );
};

export default Prince2HighlightReport;
