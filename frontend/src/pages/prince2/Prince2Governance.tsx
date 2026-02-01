import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjectHeader } from '@/components/ProjectHeader';
import { useProject } from '@/hooks/useApi';
import { prince2Api, ProjectInitiationDocument } from '@/lib/prince2Api';
import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
import { 
  FileText, Edit, Save, CheckCircle2, Plus, RefreshCw, 
  AlertTriangle, Shield, Target, Users, Clock, DollarSign
} from 'lucide-react';

const Prince2Governance = () => {
  const { id } = useParams<{ id: string }>();
  const { data: project } = useProject(id);
  
  const [pid, setPid] = useState<ProjectInitiationDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<ProjectInitiationDocument>>({});

  useEffect(() => {
    if (id) loadPid();
  }, [id]);

  const loadPid = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const pids = await prince2Api.pid.get(id);
      if (pids.length > 0) {
        setPid(pids[0]);
        setFormData(pids[0]);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createPid = async () => {
    if (!id) return;
    try {
      setSaving(true);
      const newPid = await prince2Api.pid.create(id, {
        project_definition: 'Enter project definition...',
        project_approach: 'Enter project approach...',
        quality_management_approach: 'Enter quality management approach...',
        risk_management_approach: 'Enter risk management approach...',
        change_control_approach: 'Enter change control approach...',
        communication_management_approach: 'Enter communication management approach...',
      });
      setPid(newPid);
      setFormData(newPid);
      setIsEditing(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const savePid = async () => {
    if (!id || !pid) return;
    try {
      setSaving(true);
      const updated = await prince2Api.pid.update(id, pid.id, formData);
      setPid(updated);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const baselinePid = async () => {
    if (!id || !pid) return;
    try {
      setSaving(true);
      const updated = await prince2Api.pid.baseline(id, pid.id);
      setPid(updated);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  // No PID yet
  if (!pid) {
    return (
      <div className="min-h-full bg-background">
        <ProjectHeader project={project} />
        <div className="p-6">
          <Card className="max-w-lg mx-auto">
            <CardContent className="pt-6 text-center">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">No PID Created</h2>
              <p className="text-muted-foreground mb-4">Create a Project Initiation Document to define project governance.</p>
              <Button onClick={createPid} disabled={saving}>
                {saving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                Create PID
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader project={project} />
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6 text-green-600" />
              Project Initiation Document
            </h1>
            <p className="text-muted-foreground">PRINCE2 Governance & Control Framework</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={pid.status === 'baselined' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'}>
              {pid.status}
            </Badge>
            <Badge variant="outline">v{pid.version}</Badge>
            {pid.status === 'draft' && (
              <Button variant="outline" size="sm" onClick={baselinePid} disabled={saving}>
                <CheckCircle2 className="h-4 w-4 mr-2" />Baseline
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => isEditing ? savePid() : setIsEditing(true)} disabled={saving}>
              {isEditing ? <><Save className="h-4 w-4 mr-2" />Save</> : <><Edit className="h-4 w-4 mr-2" />Edit</>}
            </Button>
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

        <Tabs defaultValue="definition" className="space-y-4">
          <TabsList>
            <TabsTrigger value="definition">Project Definition</TabsTrigger>
            <TabsTrigger value="approaches">Management Approaches</TabsTrigger>
            <TabsTrigger value="controls">Controls</TabsTrigger>
          </TabsList>

          {/* Project Definition Tab */}
          <TabsContent value="definition" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  Project Definition
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea 
                    value={formData.project_definition || ''} 
                    onChange={(e) => setFormData({...formData, project_definition: e.target.value})}
                    rows={4}
                  />
                ) : (
                  <p className="whitespace-pre-line">{pid.project_definition}</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Project Approach</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea 
                    value={formData.project_approach || ''} 
                    onChange={(e) => setFormData({...formData, project_approach: e.target.value})}
                    rows={4}
                  />
                ) : (
                  <p className="whitespace-pre-line">{pid.project_approach}</p>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader><CardTitle className="text-lg">Project Objectives</CardTitle></CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Textarea 
                      value={formData.project_objectives || ''} 
                      onChange={(e) => setFormData({...formData, project_objectives: e.target.value})}
                      rows={3}
                    />
                  ) : (
                    <p className="whitespace-pre-line">{pid.project_objectives || 'Not defined'}</p>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-lg">Success Criteria</CardTitle></CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Textarea 
                      value={formData.success_criteria || ''} 
                      onChange={(e) => setFormData({...formData, success_criteria: e.target.value})}
                      rows={3}
                    />
                  ) : (
                    <p className="whitespace-pre-line">{pid.success_criteria || 'Not defined'}</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Management Approaches Tab */}
          <TabsContent value="approaches" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    Quality Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Textarea 
                      value={formData.quality_management_approach || ''} 
                      onChange={(e) => setFormData({...formData, quality_management_approach: e.target.value})}
                      rows={4}
                    />
                  ) : (
                    <p className="whitespace-pre-line">{pid.quality_management_approach}</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    Risk Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Textarea 
                      value={formData.risk_management_approach || ''} 
                      onChange={(e) => setFormData({...formData, risk_management_approach: e.target.value})}
                      rows={4}
                    />
                  ) : (
                    <p className="whitespace-pre-line">{pid.risk_management_approach}</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Edit className="h-5 w-5 text-orange-600" />
                    Change Control
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Textarea 
                      value={formData.change_control_approach || ''} 
                      onChange={(e) => setFormData({...formData, change_control_approach: e.target.value})}
                      rows={4}
                    />
                  ) : (
                    <p className="whitespace-pre-line">{pid.change_control_approach}</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-green-600" />
                    Communication Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Textarea 
                      value={formData.communication_management_approach || ''} 
                      onChange={(e) => setFormData({...formData, communication_management_approach: e.target.value})}
                      rows={4}
                    />
                  ) : (
                    <p className="whitespace-pre-line">{pid.communication_management_approach}</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Controls Tab */}
          <TabsContent value="controls" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader><CardTitle className="text-lg">Project Controls</CardTitle></CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Textarea 
                      value={formData.project_controls || ''} 
                      onChange={(e) => setFormData({...formData, project_controls: e.target.value})}
                      rows={4}
                    />
                  ) : (
                    <p className="whitespace-pre-line">{pid.project_controls || 'Not defined'}</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-lg">Tailoring</CardTitle></CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Textarea 
                      value={formData.tailoring || ''} 
                      onChange={(e) => setFormData({...formData, tailoring: e.target.value})}
                      rows={4}
                    />
                  ) : (
                    <p className="whitespace-pre-line">{pid.tailoring || 'Not defined'}</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Timestamps */}
            <Card>
              <CardHeader><CardTitle className="text-lg">Document Information</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Version</p>
                    <p className="font-medium">{pid.version}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-medium">{pid.status}</p>
                  </div>
                  {pid.baseline_date && (
                    <div>
                      <p className="text-sm text-muted-foreground">Baselined</p>
                      <p className="font-medium">{pid.baseline_date}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Info Card */}
        <Card>
          <CardHeader><CardTitle className="text-lg">About the PID</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              The Project Initiation Document (PID) is created during the Initiating a Project process. 
              It defines how the project will be managed and controlled, including all management approaches 
              (quality, risk, change, communication), project controls, and the business case. 
              Once approved and baselined by the Project Board, it becomes the baseline against which 
              project performance is measured.
            </p>
          </CardContent>
        </Card>
      </div>

          {/* Methodology Help Panel */}
          <MethodologyHelpPanel methodology="prince2" />
    </div>
  );
};

export default Prince2Governance;
