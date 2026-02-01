import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ProjectHeader } from '@/components/ProjectHeader';
import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
import { 
  Users, Plus, Edit2, Trash2, Target, Frown, 
  Smile, Heart, Loader2, Quote
} from 'lucide-react';

interface Persona {
  id: number;
  name: string;
  role: string;
  age: string;
  background: string;
  goals: string[];
  painPoints: string[];
  quote: string;
  avatar_color: string;
}

const AgileUserPersonas = () => {
  const { id } = useParams<{ id: string }>();
  
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null);
  
  const [form, setForm] = useState({
    name: '',
    role: '',
    age: '',
    background: '',
    goals: '',
    painPoints: '',
    quote: '',
  });

  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500', 'bg-teal-500'];

  useEffect(() => {
    loadPersonas();
  }, [id]);

  const loadPersonas = async () => {
    setLoading(true);
    setTimeout(() => {
      setPersonas([
        {
          id: 1,
          name: 'Sarah, the PM',
          role: 'Project Manager',
          age: '32-40',
          background: 'Experienced PM with 8+ years managing software projects. Works with distributed teams across multiple time zones.',
          goals: ['Get real-time visibility into project status', 'Reduce time spent on status meetings', 'Standardize reporting across projects'],
          painPoints: ['Juggling multiple tools for different methodologies', 'Manual effort to consolidate reports', 'Lack of predictive insights'],
          quote: 'I need to see the big picture without drowning in details.',
          avatar_color: 'bg-purple-500',
        },
        {
          id: 2,
          name: 'Mike, the Developer',
          role: 'Senior Developer',
          age: '25-35',
          background: 'Full-stack developer who values efficiency. Prefers minimal overhead and automated workflows.',
          goals: ['Focus on coding, not admin tasks', 'Clear understanding of priorities', 'Easy time tracking'],
          painPoints: ['Too many tools and context switching', 'Unclear requirements', 'Meetings that could be async'],
          quote: 'Just let me code. Give me clear tasks and get out of my way.',
          avatar_color: 'bg-blue-500',
        },
        {
          id: 3,
          name: 'Lisa, the Executive',
          role: 'VP of Engineering',
          age: '40-50',
          background: 'Executive overseeing multiple teams and programs. Needs strategic visibility without micromanaging.',
          goals: ['Portfolio-level visibility', 'Resource optimization', 'Risk identification'],
          painPoints: ['Information scattered across teams', 'Late surprises about project issues', 'Difficulty forecasting capacity'],
          quote: 'I need to make decisions quickly based on accurate data.',
          avatar_color: 'bg-green-500',
        },
      ]);
      setLoading(false);
    }, 500);
  };

  const handleSave = () => {
    const newPersona: Persona = {
      id: editingPersona?.id || Date.now(),
      name: form.name,
      role: form.role,
      age: form.age,
      background: form.background,
      goals: form.goals.split('\n').filter(g => g.trim()),
      painPoints: form.painPoints.split('\n').filter(p => p.trim()),
      quote: form.quote,
      avatar_color: colors[Math.floor(Math.random() * colors.length)],
    };

    if (editingPersona) {
      setPersonas(personas.map(p => p.id === editingPersona.id ? newPersona : p));
    } else {
      setPersonas([...personas, newPersona]);
    }

    setShowDialog(false);
    setEditingPersona(null);
    setForm({ name: '', role: '', age: '', background: '', goals: '', painPoints: '', quote: '' });
  };

  const openEdit = (persona: Persona) => {
    setEditingPersona(persona);
    setForm({
      name: persona.name,
      role: persona.role,
      age: persona.age,
      background: persona.background,
      goals: persona.goals.join('\n'),
      painPoints: persona.painPoints.join('\n'),
      quote: persona.quote,
    });
    setShowDialog(true);
  };

  const handleDelete = (personaId: number) => {
    if (!confirm('Delete this persona?')) return;
    setPersonas(personas.filter(p => p.id !== personaId));
  };

  if (loading) {
    return (
      <div className="min-h-full bg-background">
        <ProjectHeader />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
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
              <Users className="h-6 w-6 text-emerald-600" />
              User Personas
            </h1>
            <p className="text-muted-foreground">Understand your target users</p>
          </div>
          <Button onClick={() => { setEditingPersona(null); setShowDialog(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Persona
          </Button>
        </div>

        {/* Persona Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {personas.map((persona) => (
            <Card key={persona.id} className="overflow-hidden">
              <CardHeader className={`${persona.avatar_color} text-white`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 border-2 border-white">
                      <AvatarFallback className="bg-white/20 text-white text-xl">
                        {persona.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-bold">{persona.name}</h3>
                      <p className="opacity-90">{persona.role}</p>
                      <Badge variant="outline" className="mt-1 border-white/50 text-white">
                        Age: {persona.age}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => openEdit(persona)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => handleDelete(persona.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {/* Quote */}
                <div className="bg-muted/50 p-3 rounded-lg border-l-4 border-emerald-500">
                  <div className="flex items-start gap-2">
                    <Quote className="h-5 w-5 text-emerald-600 mt-0.5" />
                    <p className="italic text-muted-foreground">{persona.quote}</p>
                  </div>
                </div>

                {/* Background */}
                <div>
                  <h4 className="font-medium mb-1">Background</h4>
                  <p className="text-sm text-muted-foreground">{persona.background}</p>
                </div>

                {/* Goals */}
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4 text-green-600" />
                    Goals
                  </h4>
                  <ul className="space-y-1">
                    {persona.goals.map((goal, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <Smile className="h-4 w-4 text-green-500" />
                        {goal}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pain Points */}
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Frown className="h-4 w-4 text-red-600" />
                    Pain Points
                  </h4>
                  <ul className="space-y-1">
                    {persona.painPoints.map((pain, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <Heart className="h-4 w-4 text-red-500" />
                        {pain}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {personas.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No personas defined yet</p>
              <Button className="mt-4" onClick={() => setShowDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Persona
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        <Card className="bg-emerald-50 border-emerald-200">
          <CardContent className="pt-4">
            <h3 className="font-semibold text-emerald-900 mb-2">Creating Effective Personas</h3>
            <ul className="space-y-1 text-sm text-emerald-800">
              <li>• Base personas on real user research and data</li>
              <li>• Focus on goals and pain points, not demographics</li>
              <li>• Keep personas visible during backlog refinement</li>
              <li>• Use personas to validate user story acceptance criteria</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingPersona ? 'Edit Persona' : 'Create Persona'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input 
                value={form.name}
                onChange={(e) => setForm({...form, name: e.target.value})}
                placeholder="e.g., Sarah, the PM"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Role</label>
              <Input 
                value={form.role}
                onChange={(e) => setForm({...form, role: e.target.value})}
                placeholder="e.g., Project Manager"
              />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium">Age Range</label>
              <Input 
                value={form.age}
                onChange={(e) => setForm({...form, age: e.target.value})}
                placeholder="e.g., 30-40"
              />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium">Background</label>
              <Textarea 
                value={form.background}
                onChange={(e) => setForm({...form, background: e.target.value})}
                placeholder="Describe their background, experience, and context..."
                rows={2}
              />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium">Quote</label>
              <Input 
                value={form.quote}
                onChange={(e) => setForm({...form, quote: e.target.value})}
                placeholder="A quote that captures their mindset"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Goals (one per line)</label>
              <Textarea 
                value={form.goals}
                onChange={(e) => setForm({...form, goals: e.target.value})}
                placeholder="What do they want to achieve?"
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Pain Points (one per line)</label>
              <Textarea 
                value={form.painPoints}
                onChange={(e) => setForm({...form, painPoints: e.target.value})}
                placeholder="What frustrates them?"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.name || !form.role}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

          {/* Methodology Help Panel */}
          <MethodologyHelpPanel methodology="agile" />
    </div>
  );
};

export default AgileUserPersonas;
