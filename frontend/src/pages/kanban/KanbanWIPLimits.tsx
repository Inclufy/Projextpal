import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ProjectHeader } from '@/components/ProjectHeader';
import { useProject } from '@/hooks/useApi';
import { kanbanApi, KanbanColumn } from '@/lib/kanbanApi';
import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
import { 
  CircleDot, AlertTriangle, CheckCircle, Save,
  Loader2, Info
} from 'lucide-react';

const KanbanWIPLimits = () => {
  const { id } = useParams<{ id: string }>();
  const { data: project } = useProject(id);
  
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [wipLimits, setWipLimits] = useState<Record<number, string>>({});

  useEffect(() => {
    if (id) {
      loadColumns();
    }
  }, [id]);

  const loadColumns = async () => {
    try {
      setLoading(true);
      const columnsRes = await kanbanApi.columns.getAll(id!);
      setColumns(columnsRes);
      
      // Initialize WIP limits state
      const limits: Record<number, string> = {};
      columnsRes.forEach(col => {
        limits[col.id] = col.wip_limit?.toString() || '';
      });
      setWipLimits(limits);
    } catch (err: any) {
      alert(err.message || 'Failed to load columns');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Update each column with new WIP limit
      await Promise.all(
        columns.map(col => 
          kanbanApi.columns.update(id!, col.id, {
            wip_limit: wipLimits[col.id] ? parseInt(wipLimits[col.id]) : null,
          })
        )
      );
      
      loadColumns();
      alert('WIP limits saved successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to save WIP limits');
    } finally {
      setSaving(false);
    }
  };

  const getStatus = (column: KanbanColumn) => {
    const limit = wipLimits[column.id] ? parseInt(wipLimits[column.id]) : null;
    const count = column.cards_count || 0;
    
    if (!limit) return { status: 'none', color: 'gray' };
    if (count > limit) return { status: 'exceeded', color: 'red' };
    if (count === limit) return { status: 'at_limit', color: 'yellow' };
    if (count >= limit * 0.8) return { status: 'warning', color: 'yellow' };
    return { status: 'healthy', color: 'green' };
  };

  if (loading) {
    return (
      <div className="min-h-full bg-background">
        <ProjectHeader />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  const exceededColumns = columns.filter(col => {
    const limit = wipLimits[col.id] ? parseInt(wipLimits[col.id]) : null;
    return limit && (col.cards_count || 0) > limit;
  });

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <CircleDot className="h-6 w-6 text-blue-600" />
              WIP Limits
            </h1>
            <p className="text-muted-foreground">Configure Work-In-Progress limits for each column</p>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900">About WIP Limits</h3>
                <p className="text-sm text-blue-800 mt-1">
                  Work-In-Progress limits help prevent overloading team members and identify bottlenecks.
                  When a column exceeds its WIP limit, it signals that work should not be added until
                  existing items are completed. Leave empty for no limit.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Violations Alert */}
        {exceededColumns.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-700 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                WIP Limit Violations ({exceededColumns.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {exceededColumns.map(col => (
                  <div key={col.id} className="flex items-center justify-between p-2 bg-white rounded border border-red-200">
                    <span className="font-medium">{col.name}</span>
                    <span className="text-red-600">
                      {col.cards_count} / {wipLimits[col.id]} items
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* WIP Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Column WIP Limits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {columns.map((column) => {
                const status = getStatus(column);
                const count = column.cards_count || 0;
                const limit = wipLimits[column.id] ? parseInt(wipLimits[column.id]) : 0;
                const percentage = limit > 0 ? (count / limit) * 100 : 0;
                
                return (
                  <div key={column.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: column.color }}
                        />
                        <span className="font-medium">{column.name}</span>
                        <Badge variant="outline">{count} items</Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">WIP Limit:</span>
                          <Input 
                            type="number"
                            min="0"
                            value={wipLimits[column.id]}
                            onChange={(e) => setWipLimits({...wipLimits, [column.id]: e.target.value})}
                            className="w-20 h-8"
                            placeholder="∞"
                          />
                        </div>
                        {status.status === 'exceeded' && (
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Exceeded
                          </Badge>
                        )}
                        {status.status === 'healthy' && limit > 0 && (
                          <Badge className="bg-green-500 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            OK
                          </Badge>
                        )}
                        {status.status === 'warning' && (
                          <Badge className="bg-yellow-500">Near Limit</Badge>
                        )}
                      </div>
                    </div>
                    {limit > 0 && (
                      <Progress 
                        value={Math.min(percentage, 100)} 
                        className={`h-2 ${
                          percentage > 100 ? 'bg-red-100' : 
                          percentage >= 80 ? 'bg-yellow-100' : 'bg-green-100'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Best Practices */}
        <Card>
          <CardHeader>
            <CardTitle>WIP Limit Best Practices</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Start with a higher limit and gradually reduce it as the team improves</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>A common starting point is (number of team members + 1) for the "In Progress" column</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Review and adjust limits based on cycle time and throughput metrics</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Backlog and Done columns typically don't need WIP limits</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

          {/* Methodology Help Panel */}
          <MethodologyHelpPanel methodology="kanban" />
    </div>
  );
};

export default KanbanWIPLimits;
