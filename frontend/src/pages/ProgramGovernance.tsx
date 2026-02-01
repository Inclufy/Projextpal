import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProjectHeader } from '@/components/ProjectHeader';
import { Shield, Users, Calendar, FileText, CheckCircle2, Clock, AlertCircle, Loader2, Plus } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001/api/v1';

const fetchProgramGovernance = async (programId: string) => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_BASE_URL}/programs/${programId}/governance/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) return null;
  return response.json();
};

const fetchProgramRisks = async (programId: string) => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_BASE_URL}/programs/${programId}/risks/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) return [];
  return response.json();
};

const ProgramGovernance = () => {
  const { id } = useParams<{ id: string }>();

  const { data: governance, isLoading: govLoading } = useQuery({
    queryKey: ['program-governance', id],
    queryFn: () => fetchProgramGovernance(id!),
    enabled: !!id,
  });

  const { data: risks = [], isLoading: risksLoading } = useQuery({
    queryKey: ['program-risks', id],
    queryFn: () => fetchProgramRisks(id!),
    enabled: !!id,
  });

  const isLoading = govLoading || risksLoading;

  // Extract data from governance or use defaults
  const governanceBoard = governance?.board_members || [];
  const meetings = governance?.meetings || [];
  const decisions = governance?.decisions || [];
  const escalations = risks.filter((r: any) => r.type === 'escalation' || r.severity === 'high');

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="h-6 w-6 text-indigo-600" />
              Program Governance
            </h1>
            <p className="text-muted-foreground">Governance structure and decision making</p>
          </div>
        </div>

        {/* Governance Board */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-600" />
                Program Board
              </CardTitle>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {governanceBoard.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No board members defined yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {governanceBoard.map((member: any, i: number) => (
                  <div key={i} className={`p-4 border rounded-lg ${member.role === 'sponsor' ? 'border-indigo-300 bg-indigo-50' : ''}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
                        member.role === 'sponsor' ? 'bg-indigo-600' : 
                        member.role === 'director' ? 'bg-purple-600' : 
                        member.role === 'manager' ? 'bg-blue-600' : 'bg-gray-500'
                      }`}>
                        {member.name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                      </div>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                        {member.organization && (
                          <Badge variant="outline" className="text-xs mt-1">{member.organization}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-6">
          {/* Meetings */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-indigo-600" />
                  Governance Meetings
                </CardTitle>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {meetings.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No meetings scheduled</p>
                </div>
              ) : (
                meetings.map((meeting: any, i: number) => (
                  <div key={i} className={`p-3 border rounded-lg ${meeting.status === 'today' ? 'border-indigo-300 bg-indigo-50' : ''}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{meeting.type || meeting.title}</p>
                        <p className="text-sm text-muted-foreground">{meeting.frequency}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{meeting.next_date || meeting.date}</p>
                        <Badge className={meeting.status === 'today' ? 'bg-indigo-600' : 'bg-gray-400'}>
                          {meeting.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Escalations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                Active Escalations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {escalations.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4" />
                  <p className="text-muted-foreground">No active escalations</p>
                </div>
              ) : (
                escalations.map((esc: any) => (
                  <div key={esc.id} className={`p-3 border rounded-lg ${esc.status === 'open' ? 'border-red-200 bg-red-50' : ''}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-sm">ESC-{esc.id}</span>
                      <div className="flex gap-2">
                        <Badge className={esc.severity === 'high' ? 'bg-red-500' : 'bg-yellow-500'}>{esc.severity}</Badge>
                        <Badge className={esc.status === 'open' ? 'bg-red-500' : 'bg-green-500'}>{esc.status}</Badge>
                      </div>
                    </div>
                    <p className="text-sm">{esc.description || esc.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{esc.project_name} • Raised: {esc.created_at}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Decisions Log */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-600" />
                Decision Log
              </CardTitle>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Decision
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {decisions.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No decisions logged yet</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3">ID</th>
                    <th className="pb-3">Decision</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Impact</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {decisions.map((dec: any) => (
                    <tr key={dec.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 font-mono text-sm">DEC-{dec.id}</td>
                      <td className="py-3">{dec.description || dec.title}</td>
                      <td className="py-3 text-sm text-muted-foreground">{dec.date || dec.created_at}</td>
                      <td className="py-3">
                        <Badge className={dec.impact === 'high' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}>
                          {dec.impact || 'medium'}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <Badge className={dec.status === 'approved' ? 'bg-green-500' : 'bg-yellow-500'}>
                          {dec.status === 'approved' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                          {dec.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                          {dec.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProgramGovernance;
