import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ProjectHeader } from '@/components/ProjectHeader';
import { 
  Plus, MoreHorizontal, Clock, MessageSquare,
  Paperclip, CheckSquare, AlertTriangle, Zap, Loader2
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001/api/v1';

interface Task {
  id: number;
  title: string;
  name?: string;
  type: string;
  points: number;
  story_points?: number;
  assignee?: { initials: string; color: string };
  assignee_name?: string;
  labels: string[];
  comments: number;
  attachments: number;
  subtasks?: { done: number; total: number };
  blocked?: boolean;
  daysInColumn?: number;
  status: string;
}

const fetchIterationData = async (projectId: string) => {
  const token = localStorage.getItem("access_token");
  
  // Try to get active sprint/iteration
  const sprintResponse = await fetch(`${API_BASE_URL}/agile/projects/${projectId}/sprints/active/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  let iteration = null;
  if (sprintResponse.ok) {
    iteration = await sprintResponse.json();
  }
  
  // Get tasks
  const tasksResponse = await fetch(`${API_BASE_URL}/projects/${projectId}/tasks/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  const tasks = tasksResponse.ok ? await tasksResponse.json() : [];
  
  return {
    iteration,
    tasks: Array.isArray(tasks) ? tasks : tasks.results || [],
  };
};

const AgileIterationBoard = () => {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ['agile-iteration', id],
    queryFn: () => fetchIterationData(id!),
    enabled: !!id,
  });

  const iteration = data?.iteration || {
    name: 'Current Iteration',
    goal: 'Complete sprint goals',
    daysRemaining: 0,
  };

  const allTasks: Task[] = (data?.tasks || []).map((t: any) => ({
    ...t,
    title: t.title || t.name,
    points: t.points || t.story_points || 0,
    type: t.type || 'task',
    labels: t.labels || [],
    comments: t.comment_count || 0,
    attachments: t.attachment_count || 0,
  }));

  // Group tasks by status into columns
  const columns = [
    {
      id: 'todo',
      name: 'To Do',
      color: 'bg-gray-100',
      headerColor: 'text-gray-700',
      statuses: ['todo', 'backlog', 'pending'],
    },
    {
      id: 'in_progress',
      name: 'In Progress',
      color: 'bg-blue-50',
      headerColor: 'text-blue-700',
      statuses: ['in_progress', 'in progress', 'active'],
    },
    {
      id: 'review',
      name: 'In Review',
      color: 'bg-yellow-50',
      headerColor: 'text-yellow-700',
      statuses: ['review', 'in_review', 'testing'],
    },
    {
      id: 'done',
      name: 'Done',
      color: 'bg-green-50',
      headerColor: 'text-green-700',
      statuses: ['done', 'completed', 'closed'],
    },
  ].map(col => ({
    ...col,
    tasks: allTasks.filter(t => col.statuses.includes(t.status?.toLowerCase() || '')),
  }));

  const totalPoints = allTasks.reduce((sum, t) => sum + (t.points || 0), 0);
  const donePoints = columns.find(c => c.id === 'done')?.tasks.reduce((sum, t) => sum + (t.points || 0), 0) || 0;
  const inProgressPoints = columns.find(c => c.id === 'in_progress')?.tasks.reduce((sum, t) => sum + (t.points || 0), 0) || 0;

  const getTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'bug': return 'bg-red-100 text-red-700 border-red-200';
      case 'task': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-green-100 text-green-700 border-green-200';
    }
  };

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
        {/* Iteration Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-6 w-6" />
                <h1 className="text-2xl font-bold">{iteration.name}</h1>
              </div>
              <p className="text-emerald-100">{iteration.goal}</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">{iteration.daysRemaining || '-'}</div>
              <div className="text-emerald-100">days remaining</div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-4">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-2xl font-bold">{totalPoints}</div>
              <div className="text-sm text-emerald-100">Total Points</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-2xl font-bold">{donePoints}</div>
              <div className="text-sm text-emerald-100">Completed</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-2xl font-bold">{inProgressPoints}</div>
              <div className="text-sm text-emerald-100">In Progress</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="text-2xl font-bold">
                {totalPoints > 0 ? Math.round((donePoints / totalPoints) * 100) : 0}%
              </div>
              <div className="text-sm text-emerald-100">Progress</div>
            </div>
          </div>
        </div>

        {/* Board */}
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((column) => (
            <div key={column.id} className={`flex-shrink-0 w-80 rounded-lg ${column.color}`}>
              <div className="p-3 border-b">
                <div className="flex items-center justify-between">
                  <h3 className={`font-semibold ${column.headerColor}`}>{column.name}</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{column.tasks.length}</Badge>
                    <Badge variant="outline">{column.tasks.reduce((sum, t) => sum + (t.points || 0), 0)} pts</Badge>
                  </div>
                </div>
              </div>
              <div className="p-3 space-y-3 min-h-[400px]">
                {column.tasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No tasks
                  </div>
                ) : (
                  column.tasks.map((task) => (
                    <Card key={task.id} className={`cursor-pointer hover:shadow-md transition-shadow ${task.blocked ? 'border-red-300 bg-red-50' : ''}`}>
                      <CardContent className="p-3">
                        {task.blocked && (
                          <div className="flex items-center gap-1 text-red-600 text-xs mb-2">
                            <AlertTriangle className="h-3 w-3" />
                            <span>Blocked</span>
                          </div>
                        )}
                        <div className="flex items-start justify-between mb-2">
                          <Badge className={`${getTypeColor(task.type)} text-xs`}>{task.type}</Badge>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                        <h4 className="font-medium text-sm mb-2">{task.title}</h4>
                        
                        {/* Labels */}
                        {task.labels.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {task.labels.map((label, i) => (
                              <Badge key={i} variant="outline" className="text-xs">{label}</Badge>
                            ))}
                          </div>
                        )}

                        {/* Subtasks Progress */}
                        {task.subtasks && (
                          <div className="mb-2">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                              <CheckSquare className="h-3 w-3" />
                              <span>{task.subtasks.done}/{task.subtasks.total} subtasks</span>
                            </div>
                            <Progress value={(task.subtasks.done / task.subtasks.total) * 100} className="h-1" />
                          </div>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between mt-3 pt-2 border-t">
                          <div className="flex items-center gap-3 text-muted-foreground">
                            {task.comments > 0 && (
                              <div className="flex items-center gap-1 text-xs">
                                <MessageSquare className="h-3 w-3" />
                                {task.comments}
                              </div>
                            )}
                            {task.attachments > 0 && (
                              <div className="flex items-center gap-1 text-xs">
                                <Paperclip className="h-3 w-3" />
                                {task.attachments}
                              </div>
                            )}
                            {task.daysInColumn && (
                              <div className="flex items-center gap-1 text-xs">
                                <Clock className="h-3 w-3" />
                                {task.daysInColumn}d
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono text-xs">{task.points}</Badge>
                            {(task.assignee || task.assignee_name) && (
                              <div className={`h-6 w-6 rounded-full ${task.assignee?.color || 'bg-primary'} flex items-center justify-center text-white text-xs`}>
                                {task.assignee?.initials || (task.assignee_name || '').substring(0, 2).toUpperCase()}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
                
                {/* Add Task Button */}
                <Button variant="ghost" className="w-full justify-start text-muted-foreground">
                  <Plus className="h-4 w-4 mr-2" />
                  Add task
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AgileIterationBoard;
