import { useState } from 'react';
import { Plus, Trash2, GripVertical, Save, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import DraggableList from './DraggableList';

const BRAND = {
  purple: '#8B5CF6',
  pink: '#D946EF',
  green: '#22C55E',
};

interface Answer {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  text: string;
  explanation: string;
  points: number;
  answers: Answer[];
}

interface Quiz {
  title: string;
  description: string;
  passingScore: number;
  timeLimitMinutes: number | null;
  allowRetakes: boolean;
  showCorrectAnswers: boolean;
  questions: Question[];
}

interface QuizBuilderProps {
  lessonId: number;
  initialQuiz?: Quiz;
  onSave: (quiz: Quiz) => void;
}

const QuizBuilder: React.FC<QuizBuilderProps> = ({ 
  lessonId, 
  initialQuiz,
  onSave 
}) => {
  const [quiz, setQuiz] = useState<Quiz>(initialQuiz || {
    title: '',
    description: '',
    passingScore: 70,
    timeLimitMinutes: null,
    allowRetakes: true,
    showCorrectAnswers: true,
    questions: [],
  });

  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());

  const updateQuiz = (updates: Partial<Quiz>) => {
    setQuiz(prev => ({ ...prev, ...updates }));
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Math.random().toString(36).substring(7),
      type: 'multiple_choice',
      text: '',
      explanation: '',
      points: 1,
      answers: [
        { id: '1', text: '', isCorrect: true },
        { id: '2', text: '', isCorrect: false },
      ],
    };
    
    updateQuiz({ questions: [...quiz.questions, newQuestion] });
    setExpandedQuestions(new Set([...expandedQuestions, newQuestion.id]));
  };

  const updateQuestion = (questionId: string, updates: Partial<Question>) => {
    updateQuiz({
      questions: quiz.questions.map(q => 
        q.id === questionId ? { ...q, ...updates } : q
      ),
    });
  };

  const deleteQuestion = (questionId: string) => {
    if (confirm('Deze vraag verwijderen?')) {
      updateQuiz({
        questions: quiz.questions.filter(q => q.id !== questionId),
      });
      setExpandedQuestions(prev => {
        const next = new Set(prev);
        next.delete(questionId);
        return next;
      });
    }
  };

  const addAnswer = (questionId: string) => {
    const question = quiz.questions.find(q => q.id === questionId);
    if (!question) return;

    const newAnswer: Answer = {
      id: Math.random().toString(36).substring(7),
      text: '',
      isCorrect: false,
    };

    updateQuestion(questionId, {
      answers: [...question.answers, newAnswer],
    });
  };

  const updateAnswer = (questionId: string, answerId: string, updates: Partial<Answer>) => {
    const question = quiz.questions.find(q => q.id === questionId);
    if (!question) return;

    updateQuestion(questionId, {
      answers: question.answers.map(a => 
        a.id === answerId ? { ...a, ...updates } : a
      ),
    });
  };

  const deleteAnswer = (questionId: string, answerId: string) => {
    const question = quiz.questions.find(q => q.id === questionId);
    if (!question || question.answers.length <= 2) {
      alert('Een vraag moet minimaal 2 antwoorden hebben');
      return;
    }

    updateQuestion(questionId, {
      answers: question.answers.filter(a => a.id !== answerId),
    });
  };

  const toggleCorrectAnswer = (questionId: string, answerId: string) => {
    const question = quiz.questions.find(q => q.id === questionId);
    if (!question) return;

    if (question.type === 'multiple_choice') {
      // For multiple choice, only one can be correct
      updateQuestion(questionId, {
        answers: question.answers.map(a => ({
          ...a,
          isCorrect: a.id === answerId,
        })),
      });
    } else {
      // For others, toggle individually
      updateAnswer(questionId, answerId, {
        isCorrect: !question.answers.find(a => a.id === answerId)?.isCorrect,
      });
    }
  };

  const changeQuestionType = (questionId: string, type: Question['type']) => {
    const question = quiz.questions.find(q => q.id === questionId);
    if (!question) return;

    let answers = question.answers;

    if (type === 'true_false') {
      answers = [
        { id: '1', text: 'Waar', isCorrect: true },
        { id: '2', text: 'Onwaar', isCorrect: false },
      ];
    } else if (type === 'short_answer') {
      answers = [];
    }

    updateQuestion(questionId, { type, answers });
  };

  const toggleQuestionExpanded = (questionId: string) => {
    setExpandedQuestions(prev => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };

  const handleSave = async () => {
    // Validation
    if (!quiz.title.trim()) {
      alert('Voeg een titel toe aan de quiz');
      return;
    }

    if (quiz.questions.length === 0) {
      alert('Voeg minimaal 1 vraag toe');
      return;
    }

    for (const question of quiz.questions) {
      if (!question.text.trim()) {
        alert('Alle vragen moeten tekst hebben');
        return;
      }

      if (question.type !== 'short_answer') {
        const hasCorrect = question.answers.some(a => a.isCorrect);
        if (!hasCorrect) {
          alert(`Vraag "${question.text}" moet minimaal 1 correct antwoord hebben`);
          return;
        }
      }
    }

    onSave(quiz);
  };

  return (
    <div className="space-y-6">
      {/* Quiz Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Quiz Instellingen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Titel *</Label>
            <Input
              value={quiz.title}
              onChange={(e) => updateQuiz({ title: e.target.value })}
              placeholder="Bijv. Module 1 Quiz"
            />
          </div>

          <div>
            <Label>Beschrijving</Label>
            <Textarea
              value={quiz.description}
              onChange={(e) => updateQuiz({ description: e.target.value })}
              placeholder="Beschrijf wat deze quiz test..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Slagingspercentage (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={quiz.passingScore}
                onChange={(e) => updateQuiz({ passingScore: parseInt(e.target.value) })}
              />
            </div>

            <div>
              <Label>Tijdslimiet (minuten)</Label>
              <Input
                type="number"
                min={0}
                value={quiz.timeLimitMinutes || ''}
                onChange={(e) => updateQuiz({ 
                  timeLimitMinutes: e.target.value ? parseInt(e.target.value) : null 
                })}
                placeholder="Optioneel"
              />
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <Switch
                checked={quiz.allowRetakes}
                onCheckedChange={(checked) => updateQuiz({ allowRetakes: checked })}
              />
              <Label>Herkansing toestaan</Label>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={quiz.showCorrectAnswers}
                onCheckedChange={(checked) => updateQuiz({ showCorrectAnswers: checked })}
              />
              <Label>Correcte antwoorden tonen</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Vragen ({quiz.questions.length})</CardTitle>
            <Button
              onClick={addQuestion}
              size="sm"
              className="text-white"
              style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})` }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Vraag Toevoegen
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {quiz.questions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nog geen vragen. Voeg de eerste vraag toe!</p>
            </div>
          ) : (
            <DraggableList
              items={quiz.questions}
              onReorder={(questions) => updateQuiz({ questions })}
              getItemId={(q) => q.id}
              renderItem={(question, index) => (
                <div className="space-y-4">
                  {/* Question Header */}
                  <div className="flex items-start justify-between">
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => toggleQuestionExpanded(question.id)}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Badge>{index + 1}</Badge>
                        <span className="font-medium">
                          {question.text || 'Nieuwe vraag'}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {question.type === 'multiple_choice' && 'Meerkeuze'}
                          {question.type === 'true_false' && 'Waar/Onwaar'}
                          {question.type === 'short_answer' && 'Kort antwoord'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {question.points} {question.points === 1 ? 'punt' : 'punten'}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteQuestion(question.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>

                  {/* Question Details (Expanded) */}
                  {expandedQuestions.has(question.id) && (
                    <div className="space-y-4 pl-4 border-l-2 border-purple-200">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Type</Label>
                          <Select
                            value={question.type}
                            onValueChange={(value) => changeQuestionType(question.id, value as Question['type'])}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="multiple_choice">Meerkeuze</SelectItem>
                              <SelectItem value="true_false">Waar/Onwaar</SelectItem>
                              <SelectItem value="short_answer">Kort Antwoord</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Punten</Label>
                          <Input
                            type="number"
                            min={1}
                            value={question.points}
                            onChange={(e) => updateQuestion(question.id, { 
                              points: parseInt(e.target.value) || 1 
                            })}
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Vraag *</Label>
                        <Textarea
                          value={question.text}
                          onChange={(e) => updateQuestion(question.id, { text: e.target.value })}
                          placeholder="Type hier de vraag..."
                          rows={2}
                        />
                      </div>

                      {/* Answers */}
                      {question.type !== 'short_answer' && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label>Antwoorden</Label>
                            {question.type === 'multiple_choice' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => addAnswer(question.id)}
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Antwoord
                              </Button>
                            )}
                          </div>

                          <div className="space-y-2">
                            {question.answers.map((answer) => (
                              <div key={answer.id} className="flex items-center gap-2">
                                <Button
                                  variant={answer.isCorrect ? "default" : "outline"}
                                  size="icon"
                                  className="flex-shrink-0"
                                  onClick={() => toggleCorrectAnswer(question.id, answer.id)}
                                  style={answer.isCorrect ? {
                                    backgroundColor: BRAND.green,
                                    borderColor: BRAND.green,
                                  } : {}}
                                >
                                  {answer.isCorrect ? (
                                    <CheckCircle2 className="w-4 h-4" />
                                  ) : (
                                    <XCircle className="w-4 h-4" />
                                  )}
                                </Button>

                                <Input
                                  value={answer.text}
                                  onChange={(e) => updateAnswer(question.id, answer.id, { 
                                    text: e.target.value 
                                  })}
                                  placeholder="Antwoord tekst..."
                                  disabled={question.type === 'true_false'}
                                />

                                {question.type === 'multiple_choice' && question.answers.length > 2 && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => deleteAnswer(question.id, answer.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Explanation */}
                      <div>
                        <Label>Uitleg (optioneel)</Label>
                        <Textarea
                          value={question.explanation}
                          onChange={(e) => updateQuestion(question.id, { explanation: e.target.value })}
                          placeholder="Leg uit waarom dit het juiste antwoord is..."
                          rows={2}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            />
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button
          onClick={handleSave}
          size="lg"
          className="text-white"
          style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})` }}
        >
          <Save className="w-5 h-5 mr-2" />
          Quiz Opslaan
        </Button>
      </div>
    </div>
  );
};

export default QuizBuilder;
