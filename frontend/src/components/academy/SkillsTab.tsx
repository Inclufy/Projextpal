import React, { useState } from 'react';
import { useSkills } from '@/hooks/useSkills';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Trophy, Target, Award, Zap, Calendar, Users, AlertCircle, Crown, TrendingUp, Briefcase, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SkillsTabProps {
  isNL: boolean;
}

export const SkillsTab: React.FC<SkillsTabProps> = ({ isNL }) => {
  const { categories, userSkills, goals, summary, loading, createGoal, deleteGoal } = useSkills();
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<any>(null);
  const [targetLevel, setTargetLevel] = useState(2);
  const [deadline, setDeadline] = useState('');
  const [reason, setReason] = useState('');

  const categoryIcons: Record<string, any> = {
    Calendar, Users, AlertCircle, Crown, TrendingUp, Briefcase
  };

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1: return 'from-gray-400 to-gray-600';
      case 2: return 'from-blue-400 to-blue-600';
      case 3: return 'from-purple-400 to-purple-600';
      case 4: return 'from-yellow-400 to-orange-600';
      case 5: return 'from-pink-500 via-purple-500 to-blue-500';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const handleCreateGoal = async () => {
    if (!selectedSkill) return;
    await createGoal(selectedSkill.id, targetLevel, deadline || undefined, reason || undefined);
    setGoalDialogOpen(false);
    setSelectedSkill(null);
    setTargetLevel(2);
    setDeadline('');
    setReason('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary?.total_points || 0}</p>
                <p className="text-xs text-muted-foreground">{isNL ? 'Totaal Punten' : 'Total Points'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary?.skills_started || 0}/{summary?.total_skills || 0}</p>
                <p className="text-xs text-muted-foreground">{isNL ? 'Skills Gestart' : 'Skills Started'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{summary?.avg_level?.toFixed(1) || '0.0'}</p>
                <p className="text-xs text-muted-foreground">{isNL ? 'Gemiddeld Niveau' : 'Average Level'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{goals.length}</p>
                <p className="text-xs text-muted-foreground">{isNL ? 'Actieve Doelen' : 'Active Goals'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Goals */}
      {goals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-600" />
              {isNL ? 'Actieve Doelen' : 'Active Goals'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {goals.map((goal) => (
              <div key={goal.id} className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 rounded-lg p-4 border-2 border-yellow-200">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold">{isNL ? goal.skill.name_nl : goal.skill.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {isNL ? 'Niveau' : 'Level'} {goal.current_level} → {goal.target_level}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => deleteGoal(goal.id)}>
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
                <Progress value={(1 - goal.points_needed / 100) * 100} className="h-2 mb-2" />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{goal.points_needed} {isNL ? 'punten nodig' : 'points needed'}</span>
                  <span>≈ {goal.estimated_lessons} {isNL ? 'lessen' : 'lessons'}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Skills by Category */}
      <div className="space-y-4">
        {categories.map((category) => {
          const IconComponent = categoryIcons[category.icon] || Target;
          
          return (
            <Card key={category.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconComponent className={`w-5 h-5 text-${category.color}-600`} />
                  {isNL ? category.name_nl : category.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {category.skills.map((skill) => {
                  const userSkill = userSkills.find(us => us.skill.id === skill.id);
                  const level = userSkill?.level || 1;
                  const points = userSkill?.points || 0;
                  const progress = userSkill?.progress_to_next_level || 0;

                  return (
                    <div key={skill.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-sm">{isNL ? skill.name_nl : skill.name}</p>
                        <Badge className={cn('bg-gradient-to-r text-white', getLevelColor(level))}>
                          {isNL ? 'Niveau' : 'Level'} {level}
                        </Badge>
                      </div>
                      <Progress value={progress} className="h-2 mb-2" />
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{points} {isNL ? 'punten' : 'points'}</span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedSkill(skill);
                            setTargetLevel(level < 5 ? level + 1 : 5);
                            setGoalDialogOpen(true);
                          }}
                        >
                          + {isNL ? 'Doel' : 'Goal'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Goal Dialog */}
      <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-600" />
              {isNL ? 'Nieuw Doel Stellen' : 'Set New Goal'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">{'Skill'}</label>
              <p className="text-lg">{selectedSkill && (isNL ? selectedSkill.name_nl : selectedSkill.name)}</p>
            </div>
            <div>
              <label className="text-sm font-medium">{isNL ? 'Doelniveau' : 'Target Level'}</label>
              <select 
                value={targetLevel} 
                onChange={(e) => setTargetLevel(Number(e.target.value))}
                className="w-full mt-1 p-2 border rounded-md"
              >
                {[2, 3, 4, 5].map(lvl => (
                  <option key={lvl} value={lvl}>{isNL ? 'Niveau' : 'Level'} {lvl}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">{isNL ? 'Deadline (optioneel)' : 'Deadline (optional)'}</label>
              <input 
                type="date" 
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full mt-1 p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="text-sm font-medium">{isNL ? 'Reden (optioneel)' : 'Reason (optional)'}</label>
              <Textarea 
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={isNL ? 'Waarom wil je dit doel bereiken?' : 'Why do you want to achieve this goal?'}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGoalDialogOpen(false)}>
              {isNL ? 'Annuleren' : 'Cancel'}
            </Button>
            <Button onClick={handleCreateGoal} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              {isNL ? 'Doel Aanmaken' : 'Create Goal'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
