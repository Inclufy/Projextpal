import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ProjectHeader } from '@/components/ProjectHeader';
import { useProject } from '@/hooks/useApi';
import { prince2Api, ProjectBrief } from '@/lib/prince2Api';
import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
import { 
  ClipboardList, Edit, Save, CheckCircle2, Plus, 
  RefreshCw, AlertTriangle, Target, Users, Clock
} from 'lucide-react';

const Prince2ProjectBrief = () => {
  const { id } = useParams<{ id: string }>();
  const { data: project } = useProject(id);
  
  const [brief, setBrief] = useState<ProjectBrief | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<ProjectBrief>>({});

  useEffect(() => {
    if (id) loadBrief();
  }, [id]);

  const loadBrief = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const briefs = await prince2Api.brief.get(id);
      if (briefs.length > 0) {
        setBrief(briefs[0]);
        setFormData(briefs[0]);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createBrief = async () => {
    if (!id) return;
    try {
      setSaving(true);
      const newBrief = await prince2Api.brief.create(id, {
        project_definition: 'Enter project definition...',
        project_approach: 'Enter project approach...',
        outline_business_case: 'Enter outline business case...',
      });
      setBrief(newBrief);
      setFormData(newBrief);
      setIsEditing(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const saveBrief = async () => {
    if (!id || !brief) return;
    try {
      setSaving(true);
      const updated = await prince2Api.brief.update(id, brief.id, formData);
      setBrief(updated);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const approveBrief = async () => {
    if (!id || !brief) return;
    try {
      setSaving(true);
      const updated = await prince2Api.brief.approve(id, brief.id);
      setBrief(updated);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const submitForReview = async () => {
    if (!id || !brief) return;
    try {
      setSaving(true);
      const updated = await prince2Api.brief.submitForReview(id, brief.id);
      setBrief(updated);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  // No brief yet
  if (!brief) {
    return (
      <div className="min-h-full bg-background">
        <ProjectHeader project={project} />
        <div className="p-6">
          <Card className="max-w-lg mx-auto">
            <CardContent className="pt-6 text-center">
              <ClipboardList className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">No Project Brief</h2>
              <p className="text-muted-foreground mb-4">Create a project brief to define the project scope and approach.</p>
              <Button onClick={createBrief} disabled={saving}>
                {saving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                Create Project Brief
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
              <ClipboardList className="h-6 w-6 text-purple-600" />
              Project Brief
            </h1>
            <p className="text-muted-foreground">PRINCE2 Pre-Project Document</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={
              brief.status === 'approved' ? 'bg-green-500 text-white' : 
              brief.status === 'submitted' ? 'bg-blue-500 text-white' : 
              'bg-yellow-500 text-white'
            }>
              {brief.status}
            </Badge>
            {brief.status === 'draft' && (
              <Button variant="outline" size="sm" onClick={submitForReview} disabled={saving}>
                Submit for Review
              </Button>
            )}
            {brief.status === 'submitted' && (
              <Button variant="outline" size="sm" onClick={approveBrief} disabled={saving}>
                <CheckCircle2 className="h-4 w-4 mr-2" />Approve
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => isEditing ? saveBrief() : setIsEditing(true)} disabled={saving}>
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

        {/* Project Definition */}
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
                placeholder="Define what the project will deliver..."
              />
            ) : (
              <p className="whitespace-pre-line">{brief.project_definition}</p>
            )}
          </CardContent>
        </Card>

        {/* Objectives & Scope */}
        <div className="grid grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-lg">Project Objectives</CardTitle></CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea 
                  value={formData.project_objectives || ''} 
                  onChange={(e) => setFormData({...formData, project_objectives: e.target.value})}
                  rows={4}
                  placeholder="List the project objectives..."
                />
              ) : (
                <p className="whitespace-pre-line">{brief.project_objectives || 'Not defined'}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Project Scope</CardTitle></CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea 
                  value={formData.project_scope || ''} 
                  onChange={(e) => setFormData({...formData, project_scope: e.target.value})}
                  rows={4}
                  placeholder="Define what's in and out of scope..."
                />
              ) : (
                <p className="whitespace-pre-line">{brief.project_scope || 'Not defined'}</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Project Approach */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Project Approach
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <Textarea 
                value={formData.project_approach || ''} 
                onChange={(e) => setFormData({...formData, project_approach: e.target.value})}
                rows={4}
                placeholder="Describe how the project will be delivered..."
              />
            ) : (
              <p className="whitespace-pre-line">{brief.project_approach}</p>
            )}
          </CardContent>
        </Card>

        {/* Outline Business Case */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-green-600" />
              Outline Business Case
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <Textarea 
                value={formData.outline_business_case || ''} 
                onChange={(e) => setFormData({...formData, outline_business_case: e.target.value})}
                rows={4}
                placeholder="Summary of business justification..."
              />
            ) : (
              <p className="whitespace-pre-line">{brief.outline_business_case}</p>
            )}
          </CardContent>
        </Card>

        {/* Team Structure & Constraints */}
        <div className="grid grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-orange-600" />
                Project Team Structure
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea 
                  value={formData.project_team_structure || ''} 
                  onChange={(e) => setFormData({...formData, project_team_structure: e.target.value})}
                  rows={4}
                  placeholder="Describe the team structure..."
                />
              ) : (
                <p className="whitespace-pre-line">{brief.project_team_structure || 'Not defined'}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Constraints & Assumptions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label>Constraints</Label>
                    <Textarea 
                      value={formData.constraints || ''} 
                      onChange={(e) => setFormData({...formData, constraints: e.target.value})}
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label>Assumptions</Label>
                    <Textarea 
                      value={formData.assumptions || ''} 
                      onChange={(e) => setFormData({...formData, assumptions: e.target.value})}
                      rows={2}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">Constraints:</p>
                    <p className="text-muted-foreground">{brief.constraints || 'None specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Assumptions:</p>
                    <p className="text-muted-foreground">{brief.assumptions || 'None specified'}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Information Card */}
        <Card>
          <CardHeader><CardTitle className="text-lg">About the Project Brief</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              The Project Brief is created during the Starting Up a Project (SU) process. 
              It provides a full and firm foundation for the initiation of the project and answers the question: 
              "What is the project aiming to achieve and why?" The brief is used to request authorization 
              to initiate the project from the Project Board.
            </p>
          </CardContent>
        </Card>
      </div>

          {/* Methodology Help Panel */}
          <MethodologyHelpPanel methodology="prince2" />
    </div>
  );
};

export default Prince2ProjectBrief;
