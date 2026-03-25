import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, HelpCircle, Trophy, RotateCcw, ChevronRight, Clock, AlertCircle } from "lucide-react";

interface Answer {
  id: number;
  text: string;
  order: number;
}

interface Question {
  id: number;
  question: string;
  type: string;
  points: number;
  answers: Answer[];
  hint?: string; // ADDED: Optional hint for each question
}

interface QuizResult {
  question_id: number;
  correct: boolean;
  correct_answers: number[];
  selected_answers: number[];
  explanation: string;
}

interface QuizProps {
  lessonId: number | string;
  courseSlug: string;
  apiBase: string;
  language: string;
  staticQuiz?: any[];
  timeLimit?: number; // ADDED: Time limit in minutes (optional)
  onComplete?: (passed: boolean, score: number) => void;
}

export default function QuizEngine({ 
  lessonId, 
  courseSlug, 
  apiBase, 
  language, 
  staticQuiz, 
  timeLimit, // ADDED
  onComplete 
}: QuizProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number[]>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<{
    score: number;
    max_score: number;
    percentage: number;
    passed: boolean;
    results: QuizResult[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [staticCorrectMap, setStaticCorrectMap] = useState<Record<number, number[]>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null); // ADDED: Timer state (in seconds)
  const [showHint, setShowHint] = useState<Record<number, boolean>>({}); // ADDED: Hint visibility per question

  // Ref to track latest selectedAnswers for use in timer callback (avoids stale closure)
  const selectedAnswersRef = useRef<Record<string, number[]>>(selectedAnswers);
  useEffect(() => {
    selectedAnswersRef.current = selectedAnswers;
  }, [selectedAnswers]);

  const isNL = language === "nl";

  // ADDED: Initialize timer when quiz loads
  useEffect(() => {
    if (timeLimit && !results) {
      setTimeRemaining(timeLimit * 60); // Convert minutes to seconds
    }
  }, [timeLimit, results]);

  // ADDED: Timer countdown
  // Uses selectedAnswersRef to avoid stale closure over selectedAnswers
  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0 && !results) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev === null) return null;
          if (prev <= 1) {
            // Auto-submit when time's up using ref to get latest answers
            handleSubmitWithAnswers(selectedAnswersRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeRemaining, results]);

  // ADDED: Format time remaining as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    loadQuiz();
  }, [lessonId]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("access_token") || "";
      const res = await fetch(`${apiBase}/academy/quiz/${lessonId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        setQuestions(generateSampleQuestions());
        return;
      }
      
      const data = await res.json();
      
      // Transform API response to frontend format
      if (data.questions && Array.isArray(data.questions)) {
        const lang = language === 'nl' ? 'nl' : 'en';
        const transformed = data.questions.map((q: any, idx: number) => ({
          id: q.id || idx,
          question: lang === 'nl' ? (q.textNL || q.text) : q.text,
          type: q.type || 'single',
          answers: (lang === 'nl' ? (q.optionsNL || q.options) : q.options || []).map((opt: string, i: number) => ({
            id: i,
            text: opt,
            correct: i === q.correct
          })),
          explanation: lang === 'nl' ? (q.explanationNL || q.explanation || '') : (q.explanation || ''),
          hint: lang === 'nl' ? (q.hintNL || q.hint) : q.hint, // ADDED: Hint support
        }));
        setQuestions(transformed);
      } else {
        setQuestions(generateSampleQuestions());
      }
    } catch (err) {
      console.error('Quiz load error:', err);
      setError(String(err));
      setQuestions(generateSampleQuestions());
    } finally {
      setLoading(false);
    }
  };

  const generateSampleQuestions = (): Question[] => {
    if (isNL) {
      return [
        {
          id: 1, 
          question: "Wat is de primaire rol van een projectmanager?", 
          type: "multiple_choice", 
          points: 1,
          hint: "Denk aan planning en coördinatie", // ADDED
          answers: [
            { id: 1, text: "Code schrijven", order: 0 },
            { id: 2, text: "Het project plannen, uitvoeren en afsluiten", order: 1 },
            { id: 3, text: "Alleen de budget bewaken", order: 2 },
            { id: 4, text: "Koffie halen voor het team", order: 3 },
          ],
        },
        {
          id: 2, 
          question: "Welke fase komt na de planningsfase in waterfall?", 
          type: "multiple_choice", 
          points: 1,
          hint: "Wat doe je nadat je een plan hebt gemaakt?",
          answers: [
            { id: 5, text: "Initiatie", order: 0 },
            { id: 6, text: "Uitvoering", order: 1 },
            { id: 7, text: "Afsluiting", order: 2 },
            { id: 8, text: "Monitoring", order: 3 },
          ],
        },
        {
          id: 3, 
          question: "Een Work Breakdown Structure (WBS) helpt bij het opdelen van werk in beheersbare stukken.", 
          type: "true_false", 
          points: 1,
          hint: "WBS staat voor Work Breakdown Structure",
          answers: [
            { id: 9, text: "Waar", order: 0 },
            { id: 10, text: "Niet waar", order: 1 },
          ],
        },
        {
          id: 4, 
          question: "Wat hoort bij risicomanagement?", 
          type: "multiple_choice", 
          points: 1,
          hint: "Risicomanagement is proactief, niet reactief",
          answers: [
            { id: 11, text: "Risico's negeren", order: 0 },
            { id: 12, text: "Risico's identificeren en mitigeren", order: 1 },
            { id: 13, text: "Alleen positieve risico's bijhouden", order: 2 },
            { id: 14, text: "Wachten tot problemen zich voordoen", order: 3 },
          ],
        },
        {
          id: 5, 
          question: "Wat is het doel van een lessons learned sessie?", 
          type: "multiple_choice", 
          points: 1,
          hint: "Het gaat om continu verbeteren",
          answers: [
            { id: 15, text: "Schuldigen aanwijzen", order: 0 },
            { id: 16, text: "Toekomstige projecten verbeteren door te leren van ervaringen", order: 1 },
            { id: 17, text: "Het project verlengen", order: 2 },
            { id: 18, text: "Extra budget aanvragen", order: 3 },
          ],
        },
      ];
    }
    return [
      {
        id: 1, 
        question: "What is the primary role of a project manager?", 
        type: "multiple_choice", 
        points: 1,
        hint: "Think about planning and coordination",
        answers: [
          { id: 1, text: "Writing code", order: 0 },
          { id: 2, text: "Planning, executing and closing the project", order: 1 },
          { id: 3, text: "Only monitoring the budget", order: 2 },
          { id: 4, text: "Getting coffee for the team", order: 3 },
        ],
      },
      {
        id: 2, 
        question: "Which phase follows planning in waterfall?", 
        type: "multiple_choice", 
        points: 1,
        hint: "What do you do after making a plan?",
        answers: [
          { id: 5, text: "Initiation", order: 0 },
          { id: 6, text: "Execution", order: 1 },
          { id: 7, text: "Closure", order: 2 },
          { id: 8, text: "Monitoring", order: 3 },
        ],
      },
      {
        id: 3, 
        question: "A Work Breakdown Structure (WBS) helps divide work into manageable pieces.", 
        type: "true_false", 
        points: 1,
        hint: "WBS stands for Work Breakdown Structure",
        answers: [
          { id: 9, text: "True", order: 0 },
          { id: 10, text: "False", order: 1 },
        ],
      },
      {
        id: 4, 
        question: "What belongs to risk management?", 
        type: "multiple_choice", 
        points: 1,
        hint: "Risk management is proactive, not reactive",
        answers: [
          { id: 11, text: "Ignoring risks", order: 0 },
          { id: 12, text: "Identifying and mitigating risks", order: 1 },
          { id: 13, text: "Only tracking positive risks", order: 2 },
          { id: 14, text: "Waiting for problems to occur", order: 3 },
        ],
      },
      {
        id: 5, 
        question: "What is the purpose of a lessons learned session?", 
        type: "multiple_choice", 
        points: 1,
        hint: "It's about continuous improvement",
        answers: [
          { id: 15, text: "Blaming team members", order: 0 },
          { id: 16, text: "Improving future projects by learning from experience", order: 1 },
          { id: 17, text: "Extending the project", order: 2 },
          { id: 18, text: "Requesting additional budget", order: 3 },
        ],
      },
    ];
  };

  // Correct answers for sample questions
  const SAMPLE_CORRECT: Record<number, number[]> = {
    1: [2], 2: [6], 3: [9], 4: [12], 5: [16],
  };

  const toggleAnswer = (questionId: number, answerId: number, type: string) => {
    const key = String(questionId);
    const current = selectedAnswers[key] || [];
    
    if (type === "multiple_select") {
      const newSelection = current.includes(answerId)
        ? current.filter((a) => a !== answerId)
        : [...current, answerId];
      setSelectedAnswers({ ...selectedAnswers, [key]: newSelection });
    } else {
      setSelectedAnswers({ ...selectedAnswers, [key]: [answerId] });
    }
  };

  // Core submit function that accepts answers explicitly (avoids stale closure in timer)
  const handleSubmitWithAnswers = async (answers: Record<string, number[]>) => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem("access_token") || "";
      const res = await fetch(`${apiBase}/academy/quiz/${lessonId}/submit/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ answers, lang: language }),
      });

      if (res.ok) {
        const data = await res.json();
        setResults(data);
        onComplete?.(data.passed, data.percentage);
      } else {
        // Fallback: score locally with sample correct answers
        scoreLocally(answers);
      }
    } catch {
      scoreLocally(answers);
    } finally {
      setSubmitting(false);
    }
  };

  // Wrapper that uses current state (safe for direct user clicks)
  const handleSubmit = () => handleSubmitWithAnswers(selectedAnswers);

  const scoreLocally = (answers: Record<string, number[]> = selectedAnswers) => {
    let score = 0;
    const maxScore = questions.length;
    const questionResults: QuizResult[] = [];

    for (const q of questions) {
      const selected = answers[String(q.id)] || [];
      const correct = SAMPLE_CORRECT[q.id] || [q.answers[1]?.id];
      const isCorrect = JSON.stringify(selected.sort()) === JSON.stringify(correct.sort());
      if (isCorrect) score++;
      questionResults.push({
        question_id: q.id,
        correct: isCorrect,
        correct_answers: correct,
        selected_answers: selected,
        explanation: q.hint || "", // Use hint as fallback explanation
      });
    }
    
    const percentage = Math.round((score / maxScore) * 100);
    const passed = percentage >= 70;
    setResults({ score, max_score: maxScore, percentage, passed, results: questionResults });
    onComplete?.(passed, percentage);
  };

  const resetQuiz = () => {
    setResults(null);
    setSelectedAnswers({});
    setCurrentIdx(0);
    setShowHint({});
    if (timeLimit) {
      setTimeRemaining(timeLimit * 60);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // RESULTS VIEW
  if (results) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <Card className={results.passed ? "border-green-300 bg-green-50 dark:bg-green-950/20" : "border-red-300 bg-red-50 dark:bg-red-950/20"}>
          <CardContent className="pt-8 text-center">
            {results.passed ? (
              <Trophy className="w-16 h-16 text-green-500 mx-auto mb-4" />
            ) : (
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            )}
            <h2 className="text-2xl font-bold mb-2">
              {results.passed 
                ? (isNL ? "Gefeliciteerd! Je bent geslaagd!" : "Congratulations! You passed!") 
                : (isNL ? "Helaas, probeer het opnieuw" : "Not quite, try again")}
            </h2>
            <div className="text-4xl font-bold my-4">{results.percentage}%</div>
            <p className="text-muted-foreground mb-2">
              {results.score} / {results.max_score} {isNL ? "correct" : "correct"}
            </p>
            <Progress value={results.percentage} className="h-3 my-4" />
            <Badge variant={results.passed ? "default" : "destructive"} className="text-sm">
              {results.passed ? (isNL ? "Geslaagd" : "Passed") : (isNL ? "Niet geslaagd (70% nodig)" : "Not passed (70% needed)")}
            </Badge>
          </CardContent>
        </Card>

        {/* Question Review */}
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-semibold">{isNL ? "Overzicht" : "Review"}</h3>
          {questions.map((q, idx) => {
            const r = results.results[idx];
            return (
              <Card key={q.id} className={r?.correct ? "border-green-200 dark:border-green-800" : "border-red-200 dark:border-red-800"}>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    {r?.correct ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium mb-2">{q.question}</p>
                      <div className="space-y-1">
                        {q.answers.map((a) => {
                          const wasSelected = r?.selected_answers.includes(a.id);
                          const isCorrectAnswer = r?.correct_answers.includes(a.id);
                          return (
                            <div key={a.id} className={`px-3 py-1.5 rounded text-sm ${
                              isCorrectAnswer ? "bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-300 font-medium" :
                              wasSelected ? "bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-300" :
                              "text-muted-foreground"
                            }`}>
                              {a.text}
                              {isCorrectAnswer && " ✓"}
                              {wasSelected && !isCorrectAnswer && " ✗"}
                            </div>
                          );
                        })}
                      </div>
                      {r?.explanation && (
                        <p className="mt-2 text-sm text-muted-foreground italic">{r.explanation}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex gap-4 mt-6 justify-center">
          <Button variant="outline" onClick={resetQuiz}>
            <RotateCcw className="w-4 h-4 mr-2" />
            {isNL ? "Opnieuw proberen" : "Try Again"}
          </Button>
        </div>
      </div>
    );
  }

  // QUIZ VIEW
  const currentQ = questions[currentIdx];
  const answered = Object.keys(selectedAnswers).length;
  const allAnswered = questions.every((q) => (selectedAnswers[String(q.id)] || []).length > 0);

  // ADDED: Timer warning (when less than 5 minutes remaining)
  const showTimeWarning = timeRemaining !== null && timeRemaining < 300;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* ADDED: Timer Display */}
      {timeRemaining !== null && (
        <div className={`mb-4 p-4 rounded-lg border-2 ${
          showTimeWarning 
            ? 'bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-800' 
            : 'bg-blue-50 dark:bg-blue-950/20 border-blue-300 dark:border-blue-800'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className={`h-5 w-5 ${showTimeWarning ? 'text-red-600' : 'text-blue-600'}`} />
              <span className="font-medium text-sm">
                {isNL ? 'Tijd over' : 'Time remaining'}
              </span>
            </div>
            <span className={`text-2xl font-bold ${showTimeWarning ? 'text-red-600 animate-pulse' : 'text-blue-600'}`}>
              {formatTime(timeRemaining)}
            </span>
          </div>
          {showTimeWarning && (
            <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {isNL ? 'Minder dan 5 minuten over!' : 'Less than 5 minutes remaining!'}
            </p>
          )}
        </div>
      )}

      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-muted-foreground">
          {isNL ? "Vraag" : "Question"} {currentIdx + 1} / {questions.length}
        </span>
        <span className="text-sm text-muted-foreground">
          {answered} / {questions.length} {isNL ? "beantwoord" : "answered"}
        </span>
      </div>
      <Progress value={(answered / questions.length) * 100} className="h-2 mb-6" />

      {/* Question */}
      {currentQ && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">{currentQ.type === "true_false" ? (isNL ? "Waar/Niet waar" : "True/False") : (isNL ? "Meerkeuze" : "Multiple Choice")}</Badge>
              <Badge variant="secondary">{currentQ.points} {currentQ.points === 1 ? "punt" : "punten"}</Badge>
            </div>
            <CardTitle className="text-lg">{currentQ.question}</CardTitle>
            
            {/* ADDED: Hint Button */}
            {currentQ.hint && (
              <div className="mt-3">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowHint({ ...showHint, [currentQ.id]: !showHint[currentQ.id] })}
                  className="gap-2"
                >
                  <HelpCircle className="h-4 w-4" />
                  {showHint[currentQ.id] 
                    ? (isNL ? "Verberg hint" : "Hide hint")
                    : (isNL ? "Toon hint" : "Show hint")
                  }
                </Button>
                {showHint[currentQ.id] && (
                  <p className="mt-2 text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                    💡 {currentQ.hint}
                  </p>
                )}
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentQ.answers.map((a) => {
                const isSelected = (selectedAnswers[String(currentQ.id)] || []).includes(a.id);
                return (
                  <button
                    key={a.id}
                    onClick={() => toggleAnswer(currentQ.id, a.id, currentQ.type)}
                    className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5 font-medium"
                        : "border-border hover:border-primary/40 hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        isSelected ? "border-primary bg-primary" : "border-muted-foreground/30"
                      }`}>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <span>{a.text}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          disabled={currentIdx === 0}
          onClick={() => setCurrentIdx(currentIdx - 1)}
        >
          {isNL ? "Vorige" : "Previous"}
        </Button>
        
        <div className="flex gap-2">
          {/* Question dots */}
          {questions.map((q, idx) => (
            <button
              key={q.id}
              onClick={() => setCurrentIdx(idx)}
              className={`w-8 h-8 rounded-full text-xs font-medium transition-all ${
                idx === currentIdx
                  ? "bg-primary text-white"
                  : (selectedAnswers[String(q.id)] || []).length > 0
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>

        {currentIdx < questions.length - 1 ? (
          <Button onClick={() => setCurrentIdx(currentIdx + 1)}>
            {isNL ? "Volgende" : "Next"}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={!allAnswered || submitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {submitting
              ? (isNL ? "Controleren..." : "Checking...")
              : (isNL ? "Inleveren" : "Submit")}
          </Button>
        )}
      </div>
    </div>
  );
}