import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ProjectHeader } from '@/components/ProjectHeader';
import { 
  ListChecks, Plus, GripVertical, ChevronDown, ChevronRight, 
  Circle, CheckCircle2, Clock, AlertCircle, Filter, Search, Loader2
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001/api/v1';

interface Story {
  id: number;
  title: string;
  name?: string;
  type: 'story' | 'bug' | 'task';
  status: string;
  priority: string;
  points: number;
  story_points?: number;
  epic?: string;
  epic_id?: number;
  assignee?: string;
  assignee_name?: string;
  labels: string[];
}

interface Epic {
  id: string | number;
  name: string;
  color: string;
  progress: number;
}

const fetchBacklogItems = async (projectId: string) => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_BASE_URL}/agile/projects/${projectId}/backlog/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    // Fallback to tasks
    const tasksResponse = await fetch(`${API_BASE_URL}/projects/${projectId}/tasks/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!tasksResponse.ok) return { epics: [], stories: [] };
    const tasks = await tasksResponse.json();
    return { 
      epics: [], 
      stories: Array.isArray(tasks) ? tasks : tasks.results || [] 
    };
  }
  return response.json();
};

const AgileBacklog = () => {
  const { id } = useParams<{ id: string }>();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedEpics, setExpandedEpics] = useState<string[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ['agile-backlog', id],
    queryFn: () => fetchBacklogItems(id!),
    enabled: !!id,
  });

  const epics: Epic[] = data?.epics || [];
  const stories: Story[] = (data?.stories || data?.items || []).map((s: any) => ({
    ...s,
    title: s.title || s.name,
    points: s.points || s.story_points || 0,
    labels: s.labels || [],
    type: s.type || 'story',
    status: s.status || 'backlog',
    priority: s.priority || 'medium',
  }));

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'done':
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'in_progress':
      case 'in progress': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'ready': return <Circle className="h-4 w-4 text-yellow-500" />;
      default: return <Circle className="h-4 w-4 text-gray-300" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      default: return 'bg-gray-200 text-gray-700';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'bug': return 'bg-red-100 text-red-700';
      case 'task': return 'bg-blue-100 text-blue-700';
      default: return 'bg-green-100 text-green-700';
    }
  };

  const toggleEpic = (epicId: string) => {
    setExpandedEpics(prev => 
      prev.includes(epicId) ? prev.filter(id => id !== epicId) : [...prev, epicId]
    );
  };

  const filteredStories = stories.filter(s => 
    (s.title || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPoints = stories.reduce((sum, s) => sum + (s.points || 0), 0);
  const completedPoints = stories
    .filter(s => s.status?.toLowerCase() === 'done' || s.status?.toLowerCase() === 'completed')
    .reduce((sum, s) => sum + (s.points || 0), 0);

  if (isLoading) {
    return (
      <div className="min-h-full bg-background">
        <ProjectHeader />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
              <ListChecks className="h-6 w-6 text-primary" />
              Product Backlog
            </h1>
            <p className="text-muted-foreground">Manage your epics, stories, and tasks</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Story
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{stories.length}</div>
              <div className="text-sm text-muted-foreground">Total Items</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{totalPoints}</div>
              <div className="text-sm text-muted-foreground">Total Points</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-green-600">{completedPoints}</div>
              <div className="text-sm text-muted-foreground">Completed Points</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">
                {totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0}%
              </div>
              <div className="text-sm text-muted-foreground">Progress</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search stories, epics, labels..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Backlog Items */}
        {epics.length > 0 ? (
          <div className="space-y-4">
            {epics.map((epic) => {
              const epicStories = filteredStories.filter(s => 
                s.epic === epic.id.toString() || s.epic_id === epic.id
              );
              const epicPoints = epicStories.reduce((sum, s) => sum + (s.points || 0), 0);
              const epicDonePoints = epicStories
                .filter(s => s.status?.toLowerCase() === 'done')
                .reduce((sum, s) => sum + (s.points || 0), 0);
              const isExpanded = expandedEpics.includes(epic.id.toString());

              return (
                <Card key={epic.id}>
                  <CardHeader 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => toggleEpic(epic.id.toString())}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                        <div className={`h-3 w-3 rounded-full ${epic.color || 'bg-blue-500'}`} />
                        <CardTitle className="text-lg">{epic.name}</CardTitle>
                        <Badge variant="outline">{epicStories.length} items</Badge>
                        <Badge variant="outline">{epicPoints} pts</Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${epic.color || 'bg-blue-500'}`}
                            style={{ width: `${epicPoints > 0 ? (epicDonePoints / epicPoints) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {epicPoints > 0 ? Math.round((epicDonePoints / epicPoints) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  {isExpanded && (
                    <CardContent>
                      <div className="space-y-2">
                        {epicStories.map((story) => (
                          <div 
                            key={story.id}
                            className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                          >
                            <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                            {getStatusIcon(story.status)}
                            <Badge className={`${getTypeColor(story.type)} text-xs`}>{story.type}</Badge>
                            <span className="flex-1 font-medium">{story.title}</span>
                            <div className="flex items-center gap-2">
                              {(story.labels || []).map((label, i) => (
                                <Badge key={i} variant="outline" className="text-xs">{label}</Badge>
                              ))}
                            </div>
                            <Badge className={getPriorityColor(story.priority)}>{story.priority}</Badge>
                            <Badge variant="outline" className="font-mono">{story.points} pts</Badge>
                            {(story.assignee || story.assignee_name) && (
                              <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center text-white text-xs">
                                {(story.assignee || story.assignee_name || '').substring(0, 2).toUpperCase()}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        ) : (
          /* Show all stories without epic grouping */
          <Card>
            <CardHeader>
              <CardTitle>Backlog Items</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredStories.length === 0 ? (
                <div className="text-center py-8">
                  <ListChecks className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No backlog items yet</p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Story
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredStories.map((story) => (
                    <div 
                      key={story.id}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                      {getStatusIcon(story.status)}
                      <Badge className={`${getTypeColor(story.type)} text-xs`}>{story.type}</Badge>
                      <span className="flex-1 font-medium">{story.title}</span>
                      <Badge className={getPriorityColor(story.priority)}>{story.priority}</Badge>
                      <Badge variant="outline" className="font-mono">{story.points} pts</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AgileBacklog;
