import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ProjectHeader } from '@/components/ProjectHeader';
import { useProject } from '@/hooks/useApi';
import { scrumApi, DefinitionOfDone } from '@/lib/scrumApi';
import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
import { 
  CheckSquare, Plus, Trash2, Edit2, Loader2, 
  CheckCircle, AlertCircle, GripVertical
} from 'lucide-react';

const ScrumDefinitionOfDone = () => {
  const { id } = useParams<{ id: string }>();
  const { data: project } = useProject(id);
  
  const [items, setItems] = useState<DefinitionOfDone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<DefinitionOfDone | null>(null);
  
  const [form, setForm] = useState({
    description: '',
    category: 'development',
    is_required: true,
  });

  useEffect(() => {
    if (id) {
      loadDoD();
    }
  }, [id]);

  const loadDoD = async () => {
    try {
      setLoading(true);
      const data = await scrumApi.dod.getAll(id!);
      setItems(data);
    } catch (err: any) {
      // Mock data
      setItems([
        { id: 1, description: 'Code is written and follows coding standards', category: 'development', is_required: true, order: 1 },
        { id: 2, description: 'Unit tests written and passing', category: 'testing', is_required: true, order: 2 },
        { id: 3, description: 'Integration tests passing', category: 'testing', is_required: true, order: 3 },
        { id: 4, description: 'Code reviewed by at least one other developer', category: 'review', is_required: true, order: 4 },
        { id: 5, description: 'Documentation updated', category: 'documentation', is_required: true, order: 5 },
        { id: 6, description: 'No critical or high severity bugs', category: 'quality', is_required: true, order: 6 },
        { id: 7, description: 'Deployed to staging environment', category: 'deployment', is_required: true, order: 7 },
        { id: 8, description: 'Product Owner acceptance', category: 'acceptance', is_required: true, order: 8 },
        { id: 9, description: 'Performance benchmarks met', category: 'quality', is_required: false, order: 9 },
        { id: 10, description: 'Security scan completed', category: 'security', is_required: false, order: 10 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaults = async () => {
    try {
      await scrumApi.dod.initializeDefaults(id!);
      loadDoD();
    } catch (err: any) {
      alert(err.message || 'Failed to initialize defaults');
    }
  };

  const handleSave = async () => {
    try {
      if (editingItem) {
        await scrumApi.dod.update(id!, editingItem.id, form);
      } else {
        await scrumApi.dod.create(id!, form);
      }
      setShowDialog(false);
      setEditingItem(null);
      setForm({ description: '', category: 'development', is_required: true });
      loadDoD();
    } catch (err: any) {
      alert(err.message || 'Failed to save item');
    }
  };

  const handleDelete = async (itemId: number) => {
    if (!confirm('Delete this Definition of Done item?')) return;
    try {
      await scrumApi.dod.delete(id!, itemId);
      loadDoD();
    } catch (err: any) {
      alert(err.message || 'Failed to delete item');
    }
  };

  const openEdit = (item: DefinitionOfDone) => {
    setEditingItem(item);
    setForm({
      description: item.description,
      category: item.category,
      is_required: item.is_required,
    });
    setShowDialog(true);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      development: 'bg-blue-500',
      testing: 'bg-green-500',
      review: 'bg-purple-500',
      documentation: 'bg-yellow-500',
      quality: 'bg-red-500',
      deployment: 'bg-cyan-500',
      acceptance: 'bg-pink-500',
      security: 'bg-orange-500',
    };
    return colors[category] || 'bg-gray-500';
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

  const requiredItems = items.filter(i => i.is_required);
  const optionalItems = items.filter(i => !i.is_required);
  const categories = [...new Set(items.map(i => i.category))];

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <CheckSquare className="h-6 w-6 text-purple-600" />
              Definition of Done
            </h1>
            <p className="text-muted-foreground">Checklist for completing user stories</p>
          </div>
          <div className="flex gap-2">
            {items.length === 0 && (
              <Button variant="outline" onClick={initializeDefaults}>
                Initialize Defaults
              </Button>
            )}
            <Button onClick={() => { setEditingItem(null); setForm({ description: '', category: 'development', is_required: true }); setShowDialog(true); }} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </div>

        {/* Info Card */}
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="pt-4">
            <div className="flex gap-4">
              <CheckSquare className="h-6 w-6 text-purple-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-purple-900">What is Definition of Done?</h3>
                <p className="text-sm text-purple-800 mt-1">
                  The Definition of Done (DoD) is a shared understanding of what it means for work to be complete.
                  Every user story must meet ALL required criteria before it can be considered "Done".
                  This ensures consistency and quality across the team.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Total Items</p>
              <p className="text-2xl font-bold">{items.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Required</p>
              <p className="text-2xl font-bold text-red-600">{requiredItems.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Categories</p>
              <p className="text-2xl font-bold">{categories.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Required Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Required Criteria ({requiredItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {requiredItems.map((item) => (
                <div 
                  key={item.id}
                  className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50"
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                  <Checkbox checked disabled className="data-[state=checked]:bg-purple-600" />
                  <span className="flex-1">{item.description}</span>
                  <Badge className={getCategoryColor(item.category)}>{item.category}</Badge>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-600" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {requiredItems.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No required items defined</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Optional Items */}
        {optionalItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Optional Criteria ({optionalItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {optionalItems.map((item) => (
                  <div 
                    key={item.id}
                    className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50"
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                    <Checkbox disabled />
                    <span className="flex-1 text-muted-foreground">{item.description}</span>
                    <Badge variant="outline">{item.category}</Badge>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-600" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* By Category */}
        <Card>
          <CardHeader>
            <CardTitle>Items by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Badge key={cat} variant="outline" className="text-sm py-1 px-3">
                  <span className={`w-2 h-2 rounded-full mr-2 ${getCategoryColor(cat)}`} />
                  {cat}: {items.filter(i => i.category === cat).length}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit DoD Item' : 'Add DoD Item'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input 
                value={form.description}
                onChange={(e) => setForm({...form, description: e.target.value})}
                placeholder="e.g., Code is reviewed by at least one developer"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <select 
                value={form.category}
                onChange={(e) => setForm({...form, category: e.target.value})}
                className="w-full border rounded-md p-2"
              >
                <option value="development">Development</option>
                <option value="testing">Testing</option>
                <option value="review">Review</option>
                <option value="documentation">Documentation</option>
                <option value="quality">Quality</option>
                <option value="deployment">Deployment</option>
                <option value="acceptance">Acceptance</option>
                <option value="security">Security</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox 
                checked={form.is_required}
                onCheckedChange={(checked) => setForm({...form, is_required: !!checked})}
              />
              <label className="text-sm">Required (must be completed for every story)</label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.description} className="bg-purple-600 hover:bg-purple-700">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

          {/* Methodology Help Panel */}
          <MethodologyHelpPanel methodology="scrum" />
    </div>
  );
};

export default ScrumDefinitionOfDone;
