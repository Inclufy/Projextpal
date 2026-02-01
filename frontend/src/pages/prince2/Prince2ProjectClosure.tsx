import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjectHeader } from '@/components/ProjectHeader';
import { useProject } from '@/hooks/useApi';
import { prince2Api, EndProjectReport, LessonsLog } from '@/lib/prince2Api';
import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
import { 
  FileText, CheckCircle2, Plus, Edit, Save, RefreshCw, 
  AlertTriangle, Award, BookOpen, TrendingUp, DollarSign
} from 'lucide-react';

const Prince2ProjectClosure = () => {
  const { id } = useParams<{ id: string }>();
  const { data: project } = useProject(id);
  
  const [endReport, setEndReport] = useState<EndProjectReport | null>(null);
  const [lessons, setLessons] = useState<LessonsLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<EndProjectReport>>({});
  const [newLesson, setNewLesson] = useState<Partial<LessonsLog>>({});
  const [showAddLesson, setShowAddLesson] = useState(false);

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [reports, lessonsData] = await Promise.all([
        prince2Api.endProjectReport.getAll(id),
        prince2Api.lessons.getAll(id)
      ]);
      if (reports.length > 0) {
        setEndReport(reports[0]);
        setFormData(reports[0]);
      }
      setLessons(lessonsData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createEndReport = async () => {
    if (!id) return;
    try {
      setSaving(true);
      const newReport = await prince2Api.endProjectReport.create(id, {
        achievements_summary: 'Enter achievements summary...',
        performance_against_plan: 'Enter performance against plan...',
      });
      setEndReport(newReport);
      setFormData(newReport);
      setIsEditing(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const saveEndReport = async () => {
    if (!id || !endReport) return;
    try {
      setSaving(true);
      const updated = await prince2Api.endProjectReport.update(id, endReport.id, formData);
      setEndReport(updated);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const approveReport = async () => {
    if (!id || !endReport) return;
    try {
      setSaving(true);
      const updated = await prince2Api.endProjectReport.approve(id, endReport.id);
      setEndReport(updated);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const addLesson = async () => {
    if (!id || !newLesson.title || !newLesson.lesson_type) return;
    try {
      await prince2Api.lessons.create(id, newLesson);
      setShowAddLesson(false);
      setNewLesson({});
      await loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      process: 'bg-blue-100 text-blue-700',
      technology: 'bg-purple-100 text-purple-700',
      people: 'bg-green-100 text-green-700',
      supplier: 'bg-orange-100 text-orange-700',
      communication: 'bg-cyan-100 text-cyan-700',
      quality: 'bg-pink-100 text-pink-700',
      risk: 'bg-red-100 text-red-700'
    };
    return <Badge className={colors[category] || ''}>{category}</Badge>;
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
              <FileText className="h-6 w-6 text-slate-600" />
              Project Closure
            </h1>
            <p className="text-muted-foreground">End Project Report & Lessons Learned</p>
          </div>
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-2" />Refresh
          </Button>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="text-red-700">{error}</span>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="report" className="space-y-4">
          <TabsList>
            <TabsTrigger value="report">End Project Report</TabsTrigger>
            <TabsTrigger value="lessons">Lessons Log ({lessons.length})</TabsTrigger>
          </TabsList>

          {/* End Project Report Tab */}
          <TabsContent value="report" className="space-y-4">
            {!endReport ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground mb-4">No End Project Report created yet</p>
                  <Button onClick={createEndReport} disabled={saving}>
                    {saving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                    Create End Project Report
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Report Header */}
                <div className="flex items-center justify-end gap-3">
                  <Badge className={endReport.status === 'approved' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'}>
                    {endReport.status}
                  </Badge>
                  {endReport.status === 'draft' && (
                    <Button variant="outline" size="sm" onClick={approveReport} disabled={saving}>
                      <CheckCircle2 className="h-4 w-4 mr-2" />Approve
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => isEditing ? saveEndReport() : setIsEditing(true)} disabled={saving}>
                    {isEditing ? <><Save className="h-4 w-4 mr-2" />Save</> : <><Edit className="h-4 w-4 mr-2" />Edit</>}
                  </Button>
                </div>

                {/* Achievements */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-green-600" />
                      Achievements Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <Textarea 
                        value={formData.achievements_summary || ''} 
                        onChange={(e) => setFormData({...formData, achievements_summary: e.target.value})}
                        rows={4}
                      />
                    ) : (
                      <p className="whitespace-pre-line">{endReport.achievements_summary}</p>
                    )}
                  </CardContent>
                </Card>

                {/* Performance */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      Performance Against Plan
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <Textarea 
                        value={formData.performance_against_plan || ''} 
                        onChange={(e) => setFormData({...formData, performance_against_plan: e.target.value})}
                        rows={4}
                      />
                    ) : (
                      <p className="whitespace-pre-line">{endReport.performance_against_plan}</p>
                    )}
                  </CardContent>
                </Card>

                {/* Benefits & Quality */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader><CardTitle className="text-lg">Benefits Achieved</CardTitle></CardHeader>
                    <CardContent>
                      {isEditing ? (
                        <Textarea 
                          value={formData.benefits_achieved || ''} 
                          onChange={(e) => setFormData({...formData, benefits_achieved: e.target.value})}
                          rows={3}
                        />
                      ) : (
                        <p className="whitespace-pre-line">{endReport.benefits_achieved || 'Not documented'}</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader><CardTitle className="text-lg">Quality Review</CardTitle></CardHeader>
                    <CardContent>
                      {isEditing ? (
                        <Textarea 
                          value={formData.quality_review || ''} 
                          onChange={(e) => setFormData({...formData, quality_review: e.target.value})}
                          rows={3}
                        />
                      ) : (
                        <p className="whitespace-pre-line">{endReport.quality_review || 'Not documented'}</p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Financial Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      Financial Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Final Cost (€)</Label>
                        {isEditing ? (
                          <Input 
                            type="number"
                            value={formData.final_cost || ''} 
                            onChange={(e) => setFormData({...formData, final_cost: parseFloat(e.target.value)})}
                          />
                        ) : (
                          <p className="text-xl font-bold">€{Number(endReport.final_cost || 0).toLocaleString()}</p>
                        )}
                      </div>
                      <div>
                        <Label>Budget Variance (€)</Label>
                        {isEditing ? (
                          <Input 
                            type="number"
                            value={formData.budget_variance || ''} 
                            onChange={(e) => setFormData({...formData, budget_variance: parseFloat(e.target.value)})}
                          />
                        ) : (
                          <p className={`text-xl font-bold ${Number(endReport.budget_variance) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            €{Number(endReport.budget_variance || 0).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label>Schedule Variance</Label>
                        {isEditing ? (
                          <Input 
                            value={formData.schedule_variance || ''} 
                            onChange={(e) => setFormData({...formData, schedule_variance: e.target.value})}
                          />
                        ) : (
                          <p className="text-xl font-bold">{endReport.schedule_variance || 'N/A'}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Follow-on Actions */}
                <Card>
                  <CardHeader><CardTitle className="text-lg">Follow-on Actions</CardTitle></CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <Textarea 
                        value={formData.follow_on_actions || ''} 
                        onChange={(e) => setFormData({...formData, follow_on_actions: e.target.value})}
                        rows={3}
                        placeholder="List any follow-on actions required..."
                      />
                    ) : (
                      <p className="whitespace-pre-line">{endReport.follow_on_actions || 'None documented'}</p>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Lessons Log Tab */}
          <TabsContent value="lessons" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => setShowAddLesson(!showAddLesson)}>
                <Plus className="h-4 w-4 mr-2" />Add Lesson
              </Button>
            </div>

            {showAddLesson && (
              <Card>
                <CardHeader><CardTitle className="text-lg">Add New Lesson</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Title</Label>
                      <Input 
                        value={newLesson.title || ''} 
                        onChange={(e) => setNewLesson({...newLesson, title: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Select value={newLesson.category || ''} onValueChange={(v) => setNewLesson({...newLesson, category: v as any})}>
                        <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="process">Process</SelectItem>
                          <SelectItem value="technology">Technology</SelectItem>
                          <SelectItem value="people">People</SelectItem>
                          <SelectItem value="supplier">Supplier</SelectItem>
                          <SelectItem value="communication">Communication</SelectItem>
                          <SelectItem value="quality">Quality</SelectItem>
                          <SelectItem value="risk">Risk</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Type</Label>
                    <Select value={newLesson.lesson_type || ''} onValueChange={(v) => setNewLesson({...newLesson, lesson_type: v as any})}>
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="positive">Positive (What went well)</SelectItem>
                        <SelectItem value="negative">Negative (What could improve)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea 
                      value={newLesson.description || ''} 
                      onChange={(e) => setNewLesson({...newLesson, description: e.target.value})}
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label>Recommendation</Label>
                    <Textarea 
                      value={newLesson.recommendation || ''} 
                      onChange={(e) => setNewLesson({...newLesson, recommendation: e.target.value})}
                      rows={2}
                    />
                  </div>
                  <Button onClick={addLesson}>Add Lesson</Button>
                </CardContent>
              </Card>
            )}

            {lessons.length > 0 ? (
              <div className="space-y-3">
                {lessons.map((lesson) => (
                  <Card key={lesson.id}>
                    <CardContent className="py-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-full rounded ${lesson.lesson_type === 'positive' ? 'bg-green-500' : 'bg-red-500'}`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{lesson.title}</h3>
                            {lesson.category && getCategoryBadge(lesson.category)}
                            <Badge variant="outline">{lesson.lesson_type}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{lesson.description}</p>
                          {lesson.recommendation && (
                            <div className="p-2 bg-muted rounded text-sm">
                              <span className="font-medium">Recommendation: </span>
                              {lesson.recommendation}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No lessons logged yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Start capturing lessons learned throughout the project</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

          {/* Methodology Help Panel */}
          <MethodologyHelpPanel methodology="prince2" />
    </div>
  );
};

export default Prince2ProjectClosure;
