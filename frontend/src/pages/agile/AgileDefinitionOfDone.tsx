import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProjectHeader } from '@/components/ProjectHeader';
import { CheckCircle, Plus, Trash2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AgileDefinitionOfDone = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [dodItems, setDodItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoDItems();
  }, [id]);

  const fetchDoDItems = async () => {
    try {
      const response = await fetch(`/api/v1/projects/${id}/agile/dod/`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setDodItems(data);
    } catch (error) {
      console.error('Error fetching DoD:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaults = async () => {
    try {
      const response = await fetch(`/api/v1/projects/${id}/agile/dod/initialize_defaults/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setDodItems(data);
      toast({
        title: "Success",
        description: "Default Definition of Done items created",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initialize defaults",
        variant: "destructive"
      });
    }
  };

  const getScopeColor = (scope: string) => {
    const colors = {
      story: 'bg-blue-500',
      iteration: 'bg-purple-500',
      release: 'bg-green-500',
      project: 'bg-orange-500'
    };
    return colors[scope] || 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ProjectHeader projectId={id} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Definition of Done</h1>
            <p className="text-gray-600 mt-1">Quality criteria for completed work</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={initializeDefaults} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Initialize Defaults
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New DoD
            </Button>
          </div>
        </div>

        {dodItems.length === 0 && !loading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <CheckCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Definition of Done yet</h3>
              <p className="text-gray-600 mb-4">Get started by initializing default criteria</p>
              <Button onClick={initializeDefaults}>
                <Plus className="h-4 w-4 mr-2" />
                Initialize Defaults
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {dodItems.map((dod: any) => (
              <Card key={dod.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{dod.name}</CardTitle>
                      <Badge className={`mt-2 ${getScopeColor(dod.scope)}`}>
                        {dod.scope_display}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{dod.description}</p>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Checklist:</h4>
                    <ul className="space-y-2">
                      {dod.checklist.map((item: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgileDefinitionOfDone;
