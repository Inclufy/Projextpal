import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ProjectHeader } from '@/components/ProjectHeader';
import { useProject } from '@/hooks/useApi';
import { scrumApi } from '@/lib/scrumApi';
import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
import { 
  Package, Plus, Loader2, Rocket, CheckCircle, 
  GitBranch, Calendar, Tag, FileText, TrendingUp
} from 'lucide-react';

interface Increment {
  id: number;
  version: string;
  sprint_number: number;
  release_date: string;
  deployed: boolean;
  items_completed: string[];
  features_added: string[];
  bugs_fixed: string[];
  release_notes: string;
  quality_metrics: {
    tests_passing: number;
    code_coverage: number;
    bugs_found: number;
  };
}

const ScrumIncrement = () => {
  const { id } = useParams<{ id: string }>();
  const { data: project } = useProject(id);
  
  const [increments, setIncrements] = useState<Increment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  
  const [form, setForm] = useState({
    version: '',
    release_notes: '',
    features: '',
    bugs_fixed: '',
  });

  useEffect(() => {
    if (id) {
      loadIncrements();
    }
  }, [id]);

  const loadIncrements = async () => {
    try {
      setLoading(true);
      const data = await scrumApi.increments.getAll(id!);
      setIncrements(data);
    } catch (err: any) {
      // Mock data
      setIncrements([
        {
          id: 1,
          version: 'v1.3.0',
          sprint_number: 3,
          release_date: new Date().toISOString().split('T')[0],
          deployed: true,
          items_completed: ['User Authentication', 'Dashboard Improvements', 'Performance Optimization'],
          features_added: [
            'Secure login with JWT tokens',
            'Improved dashboard layout with widgets',
            'Faster page load times (50% improvement)',
            'Real-time notifications'
          ],
          bugs_fixed: [
            'Fixed login session timeout issue',
            'Resolved dashboard loading error',
            'Fixed mobile responsiveness bugs'
          ],
          release_notes: 'Major update with enhanced security and performance improvements. Users can now enjoy faster load times and a more intuitive dashboard experience.',
          quality_metrics: {
            tests_passing: 98,
            code_coverage: 85,
            bugs_found: 2
          }
        },
        {
          id: 2,
          version: 'v1.2.0',
          sprint_number: 2,
          release_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          deployed: true,
          items_completed: ['User Registration', 'Email Verification', 'Profile Management'],
          features_added: [
            'User registration flow',
            'Email verification system',
            'Profile editing capabilities',
            'Avatar upload'
          ],
          bugs_fixed: [
            'Fixed email delivery issues',
            'Resolved validation errors'
          ],
          release_notes: 'Added complete user registration and profile management system.',
          quality_metrics: {
            tests_passing: 95,
            code_coverage: 82,
            bugs_found: 3
          }
        },
        {
          id: 3,
          version: 'v1.1.0',
          sprint_number: 1,
          release_date: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          deployed: true,
          items_completed: ['Landing Page', 'Basic Navigation', 'Initial Setup'],
          features_added: [
            'Responsive landing page',
            'Navigation menu',
            'Project setup and configuration'
          ],
          bugs_fixed: [],
          release_notes: 'Initial release with basic functionality.',
          quality_metrics: {
            tests_passing: 100,
            code_coverage: 78,
            bugs_found: 0
          }
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIncrement = async () => {
    try {
      const incrementData = {
        ...form,
        features_added: form.features.split('\n').filter(f => f.trim()),
        bugs_fixed: form.bugs_fixed.split('\n').filter(b => b.trim()),
      };
      
      await scrumApi.increments.create(id!, incrementData);
      setShowDialog(false);
      setForm({ version: '', release_notes: '', features: '', bugs_fixed: '' });
      loadIncrements();
    } catch (err: any) {
      alert(err.message || 'Failed to create increment');
    }
  };

  const handleDeploy = async (incrementId: number) => {
    if (!confirm('Deploy this increment to production?')) return;
    try {
      await scrumApi.increments.deploy(id!, incrementId);
      loadIncrements();
    } catch (err: any) {
      alert(err.message || 'Failed to deploy increment');
    }
  };

  if (loading) {
    return (
      <div className="min-h-full bg-background">
        <ProjectHeader />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      </div>
    );
  }

  const latestIncrement = increments[0];
  const totalFeatures = increments.reduce((sum, inc) => sum + inc.features_added.length, 0);
  const totalBugsFix = increments.reduce((sum, inc) => sum + inc.bugs_fixed.length, 0);

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Package className="h-6 w-6 text-purple-600" />
              Product Increment
            </h1>
            <p className="text-muted-foreground">Track potentially shippable product increments</p>
          </div>
          <Button onClick={() => setShowDialog(true)} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            New Increment
          </Button>
        </div>

        {/* Info Card */}
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="pt-4">
            <div className="flex gap-4">
              <Package className="h-6 w-6 text-purple-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-purple-900">What is an Increment?</h3>
                <p className="text-sm text-purple-800 mt-1">
                  The Increment is the sum of all Product Backlog items completed during a Sprint and all previous Sprints.
                  At the end of a Sprint, the new Increment must be "Done" and in a useable condition, regardless of whether the Product Owner decides to release it.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Total Releases</p>
              <p className="text-2xl font-bold">{increments.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Latest Version</p>
              <p className="text-2xl font-bold text-purple-600">{latestIncrement?.version || '-'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Features Delivered</p>
              <p className="text-2xl font-bold text-green-600">{totalFeatures}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Bugs Fixed</p>
              <p className="text-2xl font-bold text-blue-600">{totalBugsFix}</p>
            </CardContent>
          </Card>
        </div>

        {/* Latest Increment Highlight */}
        {latestIncrement && (
          <Card className="border-purple-300 bg-gradient-to-br from-purple-50 to-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="h-5 w-5 text-purple-600" />
                  Latest Increment: {latestIncrement.version}
                </CardTitle>
                {latestIncrement.deployed ? (
                  <Badge className="bg-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Deployed
                  </Badge>
                ) : (
                  <Button size="sm" onClick={() => handleDeploy(latestIncrement.id)}>
                    <Rocket className="h-3 w-3 mr-1" />
                    Deploy
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(latestIncrement.release_date).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2">
                  <GitBranch className="h-4 w-4" />
                  Sprint {latestIncrement.sprint_number}
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  {latestIncrement.features_added.length} features
                </div>
              </div>

              <div>
                <p className="font-medium mb-2">Release Notes</p>
                <p className="text-muted-foreground">{latestIncrement.release_notes}</p>
              </div>

              {/* Quality Metrics */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Tests Passing</p>
                  <p className="text-2xl font-bold text-green-600">{latestIncrement.quality_metrics.tests_passing}%</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Code Coverage</p>
                  <p className="text-2xl font-bold text-blue-600">{latestIncrement.quality_metrics.code_coverage}%</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Bugs Found</p>
                  <p className="text-2xl font-bold text-orange-600">{latestIncrement.quality_metrics.bugs_found}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Increments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Release History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {increments.map((increment, idx) => (
                <div key={increment.id} className="relative">
                  {/* Timeline connector */}
                  {idx < increments.length - 1 && (
                    <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-purple-200" />
                  )}
                  
                  <div className="flex gap-4">
                    {/* Version Badge */}
                    <div className="relative z-10">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-600 text-white font-bold">
                        {increment.version.replace('v', '')}
                      </div>
                    </div>

                    {/* Content */}
                    <Card className="flex-1">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold">{increment.version}</h3>
                            <Badge variant="outline">Sprint {increment.sprint_number}</Badge>
                            {increment.deployed && (
                              <Badge className="bg-green-600">
                                <Rocket className="h-3 w-3 mr-1" />
                                Deployed
                              </Badge>
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(increment.release_date).toLocaleDateString()}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {/* Release Notes */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <p className="text-sm font-medium">Release Notes</p>
                          </div>
                          <p className="text-sm text-muted-foreground pl-6">{increment.release_notes}</p>
                        </div>

                        {/* Features & Bugs */}
                        <div className="grid grid-cols-2 gap-4">
                          {increment.features_added.length > 0 && (
                            <div>
                              <p className="text-sm font-medium mb-2">
                                ✨ Features Added ({increment.features_added.length})
                              </p>
                              <ul className="space-y-1 text-sm text-muted-foreground">
                                {increment.features_added.slice(0, 3).map((feature, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                                    <span>{feature}</span>
                                  </li>
                                ))}
                                {increment.features_added.length > 3 && (
                                  <li className="text-xs italic">
                                    +{increment.features_added.length - 3} more features
                                  </li>
                                )}
                              </ul>
                            </div>
                          )}
                          
                          {increment.bugs_fixed.length > 0 && (
                            <div>
                              <p className="text-sm font-medium mb-2">
                                🐛 Bugs Fixed ({increment.bugs_fixed.length})
                              </p>
                              <ul className="space-y-1 text-sm text-muted-foreground">
                                {increment.bugs_fixed.slice(0, 3).map((bug, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <span>{bug}</span>
                                  </li>
                                ))}
                                {increment.bugs_fixed.length > 3 && (
                                  <li className="text-xs italic">
                                    +{increment.bugs_fixed.length - 3} more fixes
                                  </li>
                                )}
                              </ul>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {increments.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No increments created yet</p>
              <Button onClick={() => setShowDialog(true)} variant="outline" className="mt-4">
                Create First Increment
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Increment Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Product Increment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div>
              <label className="text-sm font-medium">Version</label>
              <Input 
                value={form.version}
                onChange={(e) => setForm({...form, version: e.target.value})}
                placeholder="e.g., v1.4.0"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Release Notes</label>
              <Textarea 
                value={form.release_notes}
                onChange={(e) => setForm({...form, release_notes: e.target.value})}
                placeholder="Describe what's new in this increment..."
                rows={4}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Features Added (one per line)</label>
              <Textarea 
                value={form.features}
                onChange={(e) => setForm({...form, features: e.target.value})}
                placeholder="New user dashboard&#10;Real-time notifications&#10;Performance improvements"
                rows={5}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Bugs Fixed (one per line)</label>
              <Textarea 
                value={form.bugs_fixed}
                onChange={(e) => setForm({...form, bugs_fixed: e.target.value})}
                placeholder="Fixed login timeout issue&#10;Resolved dashboard loading error"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleCreateIncrement} 
              disabled={!form.version || !form.release_notes}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Create Increment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <MethodologyHelpPanel methodology="scrum" />
    </div>
  );
};

export default ScrumIncrement;