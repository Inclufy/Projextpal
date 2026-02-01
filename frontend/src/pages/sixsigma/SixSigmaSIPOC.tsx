import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ProjectHeader } from '@/components/ProjectHeader';
import { useProject } from '@/hooks/useApi';
import { sixsigmaApi, SIPOCDiagram, SIPOCItem } from '@/lib/sixsigmaApi';
import { GitBranch, Plus, Trash2, ArrowRight, Save, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
type SIPOCCategory = 'supplier' | 'input' | 'process' | 'output' | 'customer';

const categoryConfig: Record<SIPOCCategory, { color: string; label: string; letter: string }> = {
  supplier: { color: 'bg-blue-500', label: 'Suppliers', letter: 'S' },
  input: { color: 'bg-green-500', label: 'Inputs', letter: 'I' },
  process: { color: 'bg-purple-500', label: 'Process', letter: 'P' },
  output: { color: 'bg-orange-500', label: 'Outputs', letter: 'O' },
  customer: { color: 'bg-red-500', label: 'Customers', letter: 'C' },
};

const SixSigmaSIPOC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: project } = useProject(id);
  const { toast } = useToast();

  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sipocDiagram, setSipocDiagram] = useState<SIPOCDiagram | null>(null);
  const [items, setItems] = useState<Record<SIPOCCategory, string[]>>({
    supplier: [],
    input: [],
    process: [],
    output: [],
    customer: [],
  });
  const [processStart, setProcessStart] = useState('');
  const [processEnd, setProcessEnd] = useState('');
  const [processName, setProcessName] = useState('');
  const [processDescription, setProcessDescription] = useState('');

  // Load data
  useEffect(() => {
    if (id) {
      loadSIPOC();
    }
  }, [id]);

  const loadSIPOC = async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const diagrams = await sixsigmaApi.sipoc.getAll(id);
      
      if (diagrams.length > 0) {
        const diagram = diagrams[0];
        setSipocDiagram(diagram);
        setProcessName(diagram.process_name || '');
        setProcessDescription(diagram.process_description || '');
        setProcessStart(diagram.process_start || '');
        setProcessEnd(diagram.process_end || '');
        
        // Group items by category
        const groupedItems: Record<SIPOCCategory, string[]> = {
          supplier: [],
          input: [],
          process: [],
          output: [],
          customer: [],
        };
        
        if (diagram.items) {
          diagram.items
            .sort((a, b) => a.order - b.order)
            .forEach(item => {
              if (groupedItems[item.category]) {
                groupedItems[item.category].push(item.name);
              }
            });
        }
        
        setItems(groupedItems);
      } else {
        // Initialize with empty data for new project
        setItems({
          supplier: [''],
          input: [''],
          process: [''],
          output: [''],
          customer: [''],
        });
      }
    } catch (err: any) {
      console.error('Error loading SIPOC:', err);
      setError(err.message || 'Failed to load SIPOC diagram');
      // Initialize with empty data on error
      setItems({
        supplier: [''],
        input: [''],
        process: [''],
        output: [''],
        customer: [''],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!id) return;
    
    setSaving(true);
    
    try {
      // Prepare items for bulk update
      const allItems: Partial<SIPOCItem>[] = [];
      
      (Object.keys(items) as SIPOCCategory[]).forEach(category => {
        items[category].forEach((name, index) => {
          if (name.trim()) {
            allItems.push({
              category,
              name: name.trim(),
              order: index,
            });
          }
        });
      });

      if (sipocDiagram) {
        // Update existing diagram
        await sixsigmaApi.sipoc.update(id, sipocDiagram.id, {
          process_name: processName,
          process_description: processDescription,
          process_start: processStart,
          process_end: processEnd,
        });
        
        // Bulk update items
        await sixsigmaApi.sipoc.bulkUpdateItems(id, sipocDiagram.id, allItems);
      } else {
        // Create new diagram
        const newDiagram = await sixsigmaApi.sipoc.create(id, {
          process_name: processName || 'Main Process',
          process_description: processDescription,
          process_start: processStart,
          process_end: processEnd,
        });
        
        setSipocDiagram(newDiagram);
        
        // Add items one by one
        for (const item of allItems) {
          await sixsigmaApi.sipocItems.create(id, {
            ...item,
            sipoc: newDiagram.id,
          });
        }
      }

      toast({
        title: 'SIPOC Saved',
        description: 'Your SIPOC diagram has been saved successfully.',
      });
      
      // Reload to get fresh data
      loadSIPOC();
    } catch (err: any) {
      console.error('Error saving SIPOC:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to save SIPOC diagram',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const addItem = (category: SIPOCCategory) => {
    setItems(prev => ({
      ...prev,
      [category]: [...prev[category], ''],
    }));
  };

  const removeItem = (category: SIPOCCategory, index: number) => {
    setItems(prev => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index),
    }));
  };

  const updateItem = (category: SIPOCCategory, index: number, value: string) => {
    setItems(prev => {
      const newItems = [...prev[category]];
      newItems[index] = value;
      return { ...prev, [category]: newItems };
    });
  };

  if (loading) {
    return (
      <div className="min-h-full bg-background">
        <ProjectHeader />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading SIPOC diagram...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <GitBranch className="h-6 w-6 text-green-600" />
              SIPOC Diagram
            </h1>
            <p className="text-muted-foreground">Suppliers, Inputs, Process, Outputs, Customers</p>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {saving ? 'Saving...' : 'Save SIPOC'}
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Process Name */}
        <Card>
          <CardHeader>
            <CardTitle>Process Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Process Name</label>
                <Input
                  value={processName}
                  onChange={(e) => setProcessName(e.target.value)}
                  placeholder="e.g., Order Fulfillment Process"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={processDescription}
                  onChange={(e) => setProcessDescription(e.target.value)}
                  placeholder="Brief description of the process"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SIPOC Flow */}
        <div className="grid grid-cols-5 gap-4">
          {(Object.keys(categoryConfig) as SIPOCCategory[]).map((category, idx) => (
            <div key={category} className="flex items-start gap-2">
              <Card className="flex-1">
                <CardHeader className={`${categoryConfig[category].color} text-white rounded-t-lg py-3`}>
                  <CardTitle className="text-center text-lg">
                    {categoryConfig[category].letter}
                  </CardTitle>
                  <p className="text-center text-sm opacity-90">
                    {categoryConfig[category].label}
                  </p>
                </CardHeader>
                <CardContent className="pt-4 space-y-2 min-h-[300px]">
                  {items[category].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 group">
                      <Input
                        value={item}
                        onChange={(e) => updateItem(category, i, e.target.value)}
                        className="text-sm"
                        placeholder={`Add ${categoryConfig[category].label.slice(0, -1).toLowerCase()}...`}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 text-red-500"
                        onClick={() => removeItem(category, i)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-2" 
                    onClick={() => addItem(category)}
                  >
                    <Plus className="h-4 w-4 mr-1" />Add
                  </Button>
                </CardContent>
              </Card>
              {idx < 4 && (
                <ArrowRight className="h-6 w-6 text-gray-400 mt-20 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>

        {/* Process Scope */}
        <Card>
          <CardHeader>
            <CardTitle>Process Scope Definition</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2 text-green-600">Process Start (Trigger)</h4>
                <Textarea
                  value={processStart}
                  onChange={(e) => setProcessStart(e.target.value)}
                  placeholder="What triggers this process? e.g., Customer places order"
                  className="bg-green-50 border-green-200"
                  rows={3}
                />
              </div>
              <div>
                <h4 className="font-medium mb-2 text-red-600">Process End (Deliverable)</h4>
                <Textarea
                  value={processEnd}
                  onChange={(e) => setProcessEnd(e.target.value)}
                  placeholder="What is the final output? e.g., Customer receives order confirmation"
                  className="bg-red-50 border-red-200"
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <h4 className="font-medium text-blue-800 mb-2">💡 SIPOC Tips</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>Suppliers:</strong> Who provides inputs to the process?</li>
              <li>• <strong>Inputs:</strong> What materials, information, or resources are needed?</li>
              <li>• <strong>Process:</strong> What are the high-level steps (5-7 steps)?</li>
              <li>• <strong>Outputs:</strong> What does the process produce?</li>
              <li>• <strong>Customers:</strong> Who receives the outputs?</li>
            </ul>
          </CardContent>
        </Card>
      </div>
      <MethodologyHelpPanel methodology="lean_six_sigma" />
    </div>
  );
};

export default SixSigmaSIPOC;