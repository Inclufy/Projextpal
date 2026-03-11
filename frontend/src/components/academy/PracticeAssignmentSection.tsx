import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Briefcase, Sparkles, Loader2, Clock, CheckCircle2,
  Lightbulb, Building2, User, ListChecks, Target
} from 'lucide-react';

interface PracticeAssignment {
  title: string;
  scenario: string;
  instructions: string[];
  deliverables: string[];
  rubric: { criteria: string; points: number; description: string }[];
  tips: string[];
  estimatedTime: number;
}

interface PracticeAssignmentSectionProps {
  lessonTitle: string;
  lessonContent: string;
  courseTitle: string;
  sector?: string;
  role?: string;
  methodology?: string;
  isNL: boolean;
  onComplete: () => void;
}

const PracticeAssignmentSection = ({
  lessonTitle,
  lessonContent,
  courseTitle,
  sector,
  role,
  methodology,
  isNL,
  onComplete,
}: PracticeAssignmentSectionProps) => {
  const [assignment, setAssignment] = useState<PracticeAssignment | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');

  const generateAssignment = async () => {
    setIsGenerating(true);
    setError('');

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/v1/academy/ai/generate-practice/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          lessonTitle,
          courseTitle,
          lessonContent: lessonContent.slice(0, 2000),
          sector: sector || '',
          role: role || '',
          methodology: methodology || '',
          language: isNL ? 'nl' : 'en',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAssignment(data.assignment);
      } else {
        setError(isNL
          ? 'Kon opdracht niet genereren. Probeer het opnieuw.'
          : 'Could not generate assignment. Please try again.');
      }
    } catch {
      setError(isNL
        ? 'Verbindingsfout. Probeer het opnieuw.'
        : 'Connection error. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Show the generate button if no assignment yet
  if (!assignment) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-orange-600" />
            {isNL ? 'Praktijkopdracht' : 'Practice Assignment'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-6 text-center space-y-4">
            <Sparkles className="w-10 h-10 text-orange-500 mx-auto" />
            <h3 className="font-bold text-lg">
              {isNL
                ? 'AI genereert een opdracht op maat voor jou'
                : 'AI generates a custom assignment for you'}
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {isNL
                ? 'Op basis van je sector, functie en de lesinhoud maakt AI een realistische praktijkopdracht die je direct kunt toepassen.'
                : 'Based on your sector, role, and lesson content, AI creates a realistic practice assignment you can apply directly.'}
            </p>

            {/* Context badges */}
            <div className="flex flex-wrap gap-2 justify-center">
              {sector && (
                <Badge variant="outline" className="text-xs">
                  <Building2 className="w-3 h-3 mr-1" />
                  {sector}
                </Badge>
              )}
              {role && (
                <Badge variant="outline" className="text-xs">
                  <User className="w-3 h-3 mr-1" />
                  {role}
                </Badge>
              )}
              {methodology && (
                <Badge variant="outline" className="text-xs">
                  <Target className="w-3 h-3 mr-1" />
                  {methodology}
                </Badge>
              )}
            </div>

            <Button
              onClick={generateAssignment}
              disabled={isGenerating}
              className="bg-gradient-to-r from-orange-600 to-red-600 text-white"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isNL ? 'Opdracht genereren...' : 'Generating assignment...'}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  {isNL ? 'Genereer mijn praktijkopdracht' : 'Generate my practice assignment'}
                </>
              )}
            </Button>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show the generated assignment
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-orange-600" />
            {assignment.title}
          </CardTitle>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              ~{assignment.estimatedTime} min
            </span>
            {sector && (
              <Badge variant="outline" className="text-xs">
                <Building2 className="w-3 h-3 mr-1" />
                {sector}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Scenario */}
          <div className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-4">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-orange-600" />
              {isNL ? 'Scenario' : 'Scenario'}
            </h4>
            <p className="text-sm">{assignment.scenario}</p>
          </div>

          {/* Instructions */}
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-blue-600" />
              {isNL ? 'Instructies' : 'Instructions'}
            </h4>
            <ol className="list-decimal list-inside space-y-2">
              {assignment.instructions.map((step, i) => (
                <li key={i} className="text-sm">{step}</li>
              ))}
            </ol>
          </div>

          {/* Deliverables */}
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              {isNL ? 'Op te leveren' : 'Deliverables'}
            </h4>
            <ul className="space-y-1">
              {assignment.deliverables.map((d, i) => (
                <li key={i} className="text-sm flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  {d}
                </li>
              ))}
            </ul>
          </div>

          {/* Rubric */}
          {assignment.rubric && assignment.rubric.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">
                {isNL ? 'Beoordelingscriteria' : 'Grading Rubric'}
              </h4>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-2 font-medium">{isNL ? 'Criterium' : 'Criterion'}</th>
                      <th className="text-center p-2 font-medium w-16">{isNL ? 'Punten' : 'Points'}</th>
                      <th className="text-left p-2 font-medium">{isNL ? 'Beschrijving' : 'Description'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignment.rubric.map((r, i) => (
                      <tr key={i} className="border-t">
                        <td className="p-2 font-medium">{r.criteria}</td>
                        <td className="p-2 text-center">{r.points}</td>
                        <td className="p-2 text-muted-foreground">{r.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tips */}
          {assignment.tips && assignment.tips.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-blue-600" />
                {isNL ? 'Tips' : 'Tips'}
              </h4>
              <ul className="space-y-1">
                {assignment.tips.map((tip, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Answer section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {isNL ? 'Jouw uitwerking' : 'Your answer'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder={isNL ? 'Schrijf je uitwerking hier...' : 'Write your answer here...'}
            className="min-h-[300px]"
          />
          <div className="flex gap-2">
            <Button
              onClick={onComplete}
              className="bg-gradient-to-r from-orange-600 to-red-600 text-white"
            >
              {isNL ? 'Indienen' : 'Submit'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setAssignment(null);
                setAnswer('');
              }}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {isNL ? 'Nieuwe opdracht genereren' : 'Generate new assignment'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PracticeAssignmentSection;
