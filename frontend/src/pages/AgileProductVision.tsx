import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ProjectHeader } from '@/components/ProjectHeader';
import { useProject } from '@/hooks/useApi';
import { Target, Users, Lightbulb, CheckCircle2, Edit, Save, Plus, Trash2 } from 'lucide-react';

const AgileProductVision = () => {
  const { id } = useParams<{ id: string }>();
  const { data: project } = useProject(id);
  const [isEditing, setIsEditing] = useState(false);
  
  const [vision, setVision] = useState({
    statement: "To create an innovative platform that empowers teams to collaborate effectively and deliver value faster.",
    forWho: "Project managers, team leads, and agile teams",
    need: "A unified tool to manage projects across different methodologies",
    product: "ProjectPal - An adaptive project management platform",
    unlike: "Traditional rigid PM tools that force one methodology",
    ourProduct: "Adapts to your chosen methodology with smart templates and dashboards"
  });

  const [personas, setPersonas] = useState([
    { id: 1, name: "Sarah - Product Owner", description: "Needs to prioritize backlog and track velocity", goals: ["Clear backlog visibility", "Stakeholder reporting"], pains: ["Scattered information", "Manual reporting"] },
    { id: 2, name: "Mike - Scrum Master", description: "Facilitates ceremonies and removes blockers", goals: ["Team velocity tracking", "Blocker management"], pains: ["No burndown charts", "Hard to track impediments"] },
    { id: 3, name: "Dev Team", description: "Delivers working software every sprint", goals: ["Clear sprint goals", "Easy task management"], pains: ["Context switching", "Unclear priorities"] },
  ]);

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        {/* Vision Statement */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Product Vision
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? <><Save className="h-4 w-4 mr-2" />Save</> : <><Edit className="h-4 w-4 mr-2" />Edit</>}
            </Button>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <Textarea 
                value={vision.statement} 
                onChange={(e) => setVision({...vision, statement: e.target.value})}
                className="text-lg"
                rows={3}
              />
            ) : (
              <p className="text-lg text-center italic text-muted-foreground border-l-4 border-primary pl-4 py-2">
                "{vision.statement}"
              </p>
            )}
          </CardContent>
        </Card>

        {/* Vision Template (Geoffrey Moore style) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Vision Statement Template</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">FOR (target customer)</label>
                {isEditing ? (
                  <Input value={vision.forWho} onChange={(e) => setVision({...vision, forWho: e.target.value})} />
                ) : (
                  <p className="p-2 bg-muted rounded">{vision.forWho}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">WHO (statement of need)</label>
                {isEditing ? (
                  <Input value={vision.need} onChange={(e) => setVision({...vision, need: e.target.value})} />
                ) : (
                  <p className="p-2 bg-muted rounded">{vision.need}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">THE (product name)</label>
                {isEditing ? (
                  <Input value={vision.product} onChange={(e) => setVision({...vision, product: e.target.value})} />
                ) : (
                  <p className="p-2 bg-muted rounded">{vision.product}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">UNLIKE (competitor)</label>
                {isEditing ? (
                  <Input value={vision.unlike} onChange={(e) => setVision({...vision, unlike: e.target.value})} />
                ) : (
                  <p className="p-2 bg-muted rounded">{vision.unlike}</p>
                )}
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-muted-foreground">OUR PRODUCT (key differentiator)</label>
                {isEditing ? (
                  <Textarea value={vision.ourProduct} onChange={(e) => setVision({...vision, ourProduct: e.target.value})} />
                ) : (
                  <p className="p-2 bg-muted rounded">{vision.ourProduct}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Personas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              User Personas
            </CardTitle>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Persona
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {personas.map((persona) => (
                <Card key={persona.id} className="bg-muted/30">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardTitle className="text-base">{persona.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{persona.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-green-600 mb-1">Goals</p>
                      <div className="flex flex-wrap gap-1">
                        {persona.goals.map((goal, i) => (
                          <Badge key={i} variant="outline" className="bg-green-50 text-green-700 text-xs">{goal}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-red-600 mb-1">Pain Points</p>
                      <div className="flex flex-wrap gap-1">
                        {persona.pains.map((pain, i) => (
                          <Badge key={i} variant="outline" className="bg-red-50 text-red-700 text-xs">{pain}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Success Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Success Metrics (OKRs)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Objective: Improve team productivity</h4>
                <div className="space-y-2 ml-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm">KR1: Reduce sprint planning time by 30%</span>
                    <Badge className="ml-auto">70%</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">KR2: Increase velocity by 20%</span>
                    <Badge variant="outline" className="ml-auto">45%</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-gray-300" />
                    <span className="text-sm">KR3: Achieve 90% sprint goal completion</span>
                    <Badge variant="outline" className="ml-auto">20%</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AgileProductVision;
