import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProjectHeader } from '@/components/ProjectHeader';
import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
import { 
  Palette, Plus, Edit2, Trash2, FileText, 
  ExternalLink, Loader2, Layers, Database, Monitor
} from 'lucide-react';

interface DesignDocument {
  id: number;
  title: string;
  type: 'architecture' | 'database' | 'ui' | 'api' | 'security';
  version: string;
  status: 'draft' | 'in_review' | 'approved';
  author: string;
  lastUpdated: string;
  description: string;
  url?: string;
}

const WaterfallDesign = () => {
  const { id } = useParams<{ id: string }>();
  
  const [documents, setDocuments] = useState<DesignDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, [id]);

  const loadDocuments = async () => {
    setLoading(true);
    setTimeout(() => {
      setDocuments([
        { id: 1, title: 'System Architecture Document', type: 'architecture', version: '2.1', status: 'approved', author: 'David Chen', lastUpdated: '2024-11-15', description: 'High-level system architecture including component diagrams and integration patterns.' },
        { id: 2, title: 'Database Design Specification', type: 'database', version: '1.3', status: 'approved', author: 'James Brown', lastUpdated: '2024-11-20', description: 'Entity-relationship diagrams, table schemas, and indexing strategies.' },
        { id: 3, title: 'UI/UX Design System', type: 'ui', version: '3.0', status: 'approved', author: 'Lisa Garcia', lastUpdated: '2024-11-18', description: 'Component library, style guide, and interaction patterns.' },
        { id: 4, title: 'REST API Specification', type: 'api', version: '1.2', status: 'in_review', author: 'Mike Johnson', lastUpdated: '2024-12-01', description: 'OpenAPI specification for all REST endpoints with request/response schemas.' },
        { id: 5, title: 'Security Design Document', type: 'security', version: '1.0', status: 'in_review', author: 'David Chen', lastUpdated: '2024-12-05', description: 'Authentication, authorization, and data protection mechanisms.' },
      ]);
      setLoading(false);
    }, 500);
  };

  const getTypeBadge = (type: DesignDocument['type']) => {
    const config: Record<string, { color: string; icon: any; label: string }> = {
      architecture: { color: 'bg-purple-500', icon: Layers, label: 'Architecture' },
      database: { color: 'bg-blue-500', icon: Database, label: 'Database' },
      ui: { color: 'bg-pink-500', icon: Monitor, label: 'UI/UX' },
      api: { color: 'bg-orange-500', icon: FileText, label: 'API' },
      security: { color: 'bg-red-500', icon: FileText, label: 'Security' },
    };
    const c = config[type];
    return <Badge className={c.color}>{c.label}</Badge>;
  };

  const getStatusBadge = (status: DesignDocument['status']) => {
    switch (status) {
      case 'approved': return <Badge className="bg-green-500">Approved</Badge>;
      case 'in_review': return <Badge className="bg-yellow-500">In Review</Badge>;
      default: return <Badge variant="outline">Draft</Badge>;
    }
  };

  const handleDelete = (docId: number) => {
    if (!confirm('Delete this design document?')) return;
    setDocuments(documents.filter(d => d.id !== docId));
  };

  const stats = {
    total: documents.length,
    approved: documents.filter(d => d.status === 'approved').length,
    inReview: documents.filter(d => d.status === 'in_review').length,
    draft: documents.filter(d => d.status === 'draft').length,
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

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Palette className="h-6 w-6 text-purple-600" />
              Design Phase
            </h1>
            <p className="text-muted-foreground">Technical design documents and specifications</p>
          </div>
          <Button onClick={() => setShowDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Document
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Total Documents</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Approved</p>
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">In Review</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.inReview}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Draft</p>
              <p className="text-2xl font-bold text-gray-600">{stats.draft}</p>
            </CardContent>
          </Card>
        </div>

        {/* Phase Status */}
        <Card className={stats.approved === stats.total ? 'border-green-300 bg-green-50' : 'border-yellow-300 bg-yellow-50'}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">
                  {stats.approved === stats.total ? 'Design Phase Complete' : 'Design Phase In Progress'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {stats.approved} of {stats.total} documents approved
                </p>
              </div>
              {stats.approved === stats.total ? (
                <Badge className="bg-green-500">Ready for Development</Badge>
              ) : (
                <Badge className="bg-yellow-500">Awaiting Approval</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Documents List */}
        <div className="space-y-4">
          {documents.map((doc) => (
            <Card key={doc.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getTypeBadge(doc.type)}
                      <span className="font-semibold text-lg">{doc.title}</span>
                      {getStatusBadge(doc.status)}
                      <Badge variant="outline">v{doc.version}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{doc.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Author: {doc.author}</span>
                      <span>Last Updated: {new Date(doc.lastUpdated).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {doc.url && (
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    )}
                    <Button variant="ghost" size="icon">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-600" onClick={() => handleDelete(doc.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Design Artifacts */}
        <Card>
          <CardHeader>
            <CardTitle>Required Design Artifacts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Layers className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="font-medium">System Architecture</p>
                  <p className="text-sm text-muted-foreground">Component and deployment diagrams</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Database className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="font-medium">Data Model</p>
                  <p className="text-sm text-muted-foreground">ERD and database schemas</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Monitor className="h-8 w-8 text-pink-500" />
                <div>
                  <p className="font-medium">UI/UX Design</p>
                  <p className="text-sm text-muted-foreground">Wireframes and prototypes</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <FileText className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="font-medium">API Specification</p>
                  <p className="text-sm text-muted-foreground">Endpoint documentation</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="pt-4">
            <h3 className="font-semibold text-purple-900 mb-2">Design Phase Best Practices</h3>
            <ul className="space-y-1 text-sm text-purple-800">
              <li>• Ensure all designs trace back to approved requirements</li>
              <li>• Conduct design reviews with technical stakeholders</li>
              <li>• Document design decisions and rationale</li>
              <li>• Get formal sign-off before proceeding to development</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Add Document Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Design Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input placeholder="Document title" />
            </div>
            <div>
              <label className="text-sm font-medium">Type</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="architecture">Architecture</SelectItem>
                  <SelectItem value="database">Database</SelectItem>
                  <SelectItem value="ui">UI/UX</SelectItem>
                  <SelectItem value="api">API</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea placeholder="Brief description of the document..." rows={3} />
            </div>
            <div>
              <label className="text-sm font-medium">Document URL (optional)</label>
              <Input placeholder="https://..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button>Save Document</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

          {/* Methodology Help Panel */}
          <MethodologyHelpPanel methodology="waterfall" />
    </div>
  );
};

export default WaterfallDesign;
