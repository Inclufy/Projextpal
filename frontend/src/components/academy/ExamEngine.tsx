import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2, XCircle, Trophy, RotateCcw, ChevronRight, ChevronLeft,
  Clock, AlertCircle, Flag, Eye, Award, ShieldCheck
} from "lucide-react";

// ============================================
// TYPES (reuses QuizEngine data structures)
// ============================================
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
  hint?: string;
}

interface ExamResult {
  question_id: number;
  correct: boolean;
  correct_answers: number[];
  selected_answers: number[];
  explanation: string;
}

interface ExamEngineProps {
  lessonId: number | string;
  courseSlug: string;
  apiBase: string;
  language: string;
  staticQuiz?: any[];
  timeLimit?: number; // Time limit in minutes (default: 30)
  passingScore?: number; // Passing percentage (default: 70)
  onComplete?: (passed: boolean, score: number) => void;
  onCertificateTrigger?: () => void;
}

// ============================================
// COMPONENT
// ============================================
export default function ExamEngine({
  lessonId,
  courseSlug,
  apiBase,
  language,
  staticQuiz,
  timeLimit = 30,
  passingScore = 70,
  onComplete,
  onCertificateTrigger,
}: ExamEngineProps) {
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
    results: ExamResult[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [showReview, setShowReview] = useState(false);
  const [examStarted, setExamStarted] = useState(false);

  // Ref to track latest selectedAnswers (avoids stale closure in timer)
  const selectedAnswersRef = useRef<Record<string, number[]>>(selectedAnswers);
  useEffect(() => {
    selectedAnswersRef.current = selectedAnswers;
  }, [selectedAnswers]);

  const isNL = language === "nl";

  // Correct answers for sample questions
  const SAMPLE_CORRECT: Record<number, number[]> = {
    1: [2], 2: [6], 3: [9], 4: [12], 5: [16],
    6: [22], 7: [25], 8: [29], 9: [34], 10: [37],
  };

  // ============================================
  // TIMER
  // ============================================
  useEffect(() => {
    if (examStarted && !results) {
      setTimeRemaining(timeLimit * 60);
    }
  }, [examStarted, timeLimit, results]);

  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0 && !results) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev === null) return null;
          if (prev <= 1) {
            handleSubmitWithAnswers(selectedAnswersRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeRemaining, results]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // ============================================
  // LOAD EXAM
  // ============================================
  useEffect(() => {
    loadExam();
  }, [lessonId]);

  const loadExam = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("access_token") || "";
      const res = await fetch(`${apiBase}/academy/exam/${lessonId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        setQuestions(generateSampleExamQuestions());
        return;
      }

      const data = await res.json();
      if (data.questions && Array.isArray(data.questions)) {
        const lang = language === "nl" ? "nl" : "en";
        const transformed = data.questions.map((q: any, idx: number) => ({
          id: q.id || idx,
          question: lang === "nl" ? (q.textNL || q.text) : q.text,
          type: q.type || "single",
          points: q.points || 1,
          answers: (lang === "nl" ? (q.optionsNL || q.options) : q.options || []).map(
            (opt: string, i: number) => ({
              id: i,
              text: opt,
              order: i,
            })
          ),
        }));
        setQuestions(transformed);
      } else {
        setQuestions(generateSampleExamQuestions());
      }
    } catch (err) {
      console.error("Exam load error:", err);
      setError(String(err));
      setQuestions(generateSampleExamQuestions());
    } finally {
      setLoading(false);
    }
  };

  const generateSampleExamQuestions = (): Question[] => {
    if (isNL) {
      return [
        { id: 1, question: "Wat is de primaire rol van een projectmanager?", type: "multiple_choice", points: 1, answers: [
          { id: 1, text: "Code schrijven", order: 0 }, { id: 2, text: "Het project plannen, uitvoeren en afsluiten", order: 1 },
          { id: 3, text: "Alleen de budget bewaken", order: 2 }, { id: 4, text: "Koffie halen voor het team", order: 3 },
        ]},
        { id: 2, question: "Welke fase komt na de planningsfase in waterfall?", type: "multiple_choice", points: 1, answers: [
          { id: 5, text: "Initiatie", order: 0 }, { id: 6, text: "Uitvoering", order: 1 },
          { id: 7, text: "Afsluiting", order: 2 }, { id: 8, text: "Monitoring", order: 3 },
        ]},
        { id: 3, question: "Een WBS helpt bij het opdelen van werk in beheersbare stukken.", type: "true_false", points: 1, answers: [
          { id: 9, text: "Waar", order: 0 }, { id: 10, text: "Niet waar", order: 1 },
        ]},
        { id: 4, question: "Wat hoort bij risicomanagement?", type: "multiple_choice", points: 1, answers: [
          { id: 11, text: "Risico's negeren", order: 0 }, { id: 12, text: "Risico's identificeren en mitigeren", order: 1 },
          { id: 13, text: "Alleen positieve risico's bijhouden", order: 2 }, { id: 14, text: "Wachten tot problemen zich voordoen", order: 3 },
        ]},
        { id: 5, question: "Wat is het doel van een lessons learned sessie?", type: "multiple_choice", points: 1, answers: [
          { id: 15, text: "Schuldigen aanwijzen", order: 0 }, { id: 16, text: "Toekomstige projecten verbeteren door te leren van ervaringen", order: 1 },
          { id: 17, text: "Het project verlengen", order: 2 }, { id: 18, text: "Extra budget aanvragen", order: 3 },
        ]},
        { id: 6, question: "Wat is het kritieke pad in projectmanagement?", type: "multiple_choice", points: 1, answers: [
          { id: 19, text: "Het pad met de meeste risico's", order: 0 }, { id: 20, text: "Het kortste pad door het netwerk", order: 1 },
          { id: 21, text: "Het pad met de minste resources", order: 2 }, { id: 22, text: "De langste opeenvolging van afhankelijke taken", order: 3 },
        ]},
        { id: 7, question: "Wat beschrijft de scope van een project?", type: "multiple_choice", points: 1, answers: [
          { id: 23, text: "Alleen het budget", order: 0 }, { id: 24, text: "Alleen de planning", order: 1 },
          { id: 25, text: "Het totale werk dat geleverd moet worden", order: 2 }, { id: 26, text: "De naam van het project", order: 3 },
        ]},
        { id: 8, question: "Welke methodologie gebruikt sprints?", type: "multiple_choice", points: 1, answers: [
          { id: 27, text: "Waterfall", order: 0 }, { id: 28, text: "PRINCE2", order: 1 },
          { id: 29, text: "Scrum", order: 2 }, { id: 30, text: "Lean", order: 3 },
        ]},
        { id: 9, question: "Een stakeholder is iedereen die belang heeft bij het project.", type: "true_false", points: 1, answers: [
          { id: 33, text: "Waar", order: 0 }, { id: 34, text: "Waar", order: 0 },
        ]},
        { id: 10, question: "Wat is earned value management (EVM)?", type: "multiple_choice", points: 1, answers: [
          { id: 35, text: "Een beloningssysteem", order: 0 }, { id: 36, text: "Een methode om scope te bepalen", order: 1 },
          { id: 37, text: "Een techniek om projectprestaties te meten", order: 2 }, { id: 38, text: "Een HR-methode", order: 3 },
        ]},
      ];
    }

    return [
      { id: 1, question: "What is the primary role of a project manager?", type: "multiple_choice", points: 1, answers: [
        { id: 1, text: "Writing code", order: 0 }, { id: 2, text: "Planning, executing and closing the project", order: 1 },
        { id: 3, text: "Only monitoring the budget", order: 2 }, { id: 4, text: "Getting coffee for the team", order: 3 },
      ]},
      { id: 2, question: "Which phase follows planning in waterfall?", type: "multiple_choice", points: 1, answers: [
        { id: 5, text: "Initiation", order: 0 }, { id: 6, text: "Execution", order: 1 },
        { id: 7, text: "Closure", order: 2 }, { id: 8, text: "Monitoring", order: 3 },
      ]},
      { id: 3, question: "A WBS helps divide work into manageable pieces.", type: "true_false", points: 1, answers: [
        { id: 9, text: "True", order: 0 }, { id: 10, text: "False", order: 1 },
      ]},
      { id: 4, question: "What belongs to risk management?", type: "multiple_choice", points: 1, answers: [
        { id: 11, text: "Ignoring risks", order: 0 }, { id: 12, text: "Identifying and mitigating risks", order: 1 },
        { id: 13, text: "Only tracking positive risks", order: 2 }, { id: 14, text: "Waiting for problems to occur", order: 3 },
      ]},
      { id: 5, question: "What is the purpose of a lessons learned session?", type: "multiple_choice", points: 1, answers: [
        { id: 15, text: "Blaming team members", order: 0 }, { id: 16, text: "Improving future projects by learning from experience", order: 1 },
        { id: 17, text: "Extending the project", order: 2 }, { id: 18, text: "Requesting additional budget", order: 3 },
      ]},
      { id: 6, question: "What is the critical path in project management?", type: "multiple_choice", points: 1, answers: [
        { id: 19, text: "The path with the most risks", order: 0 }, { id: 20, text: "The shortest path through the network", order: 1 },
        { id: 21, text: "The path with fewest resources", order: 2 }, { id: 22, text: "The longest sequence of dependent tasks", order: 3 },
      ]},
      { id: 7, question: "What describes the scope of a project?", type: "multiple_choice", points: 1, answers: [
        { id: 23, text: "Only the budget", order: 0 }, { id: 24, text: "Only the schedule", order: 1 },
        { id: 25, text: "The total work to be delivered", order: 2 }, { id: 26, text: "The project name", order: 3 },
      ]},
      { id: 8, question: "Which methodology uses sprints?", type: "multiple_choice", points: 1, answers: [
        { id: 27, text: "Waterfall", order: 0 }, { id: 28, text: "PRINCE2", order: 1 },
        { id: 29, text: "Scrum", order: 2 }, { id: 30, text: "Lean", order: 3 },
      ]},
      { id: 9, question: "A stakeholder is anyone who has an interest in the project.", type: "true_false", points: 1, answers: [
        { id: 33, text: "True", order: 0 }, { id: 34, text: "True", order: 0 },
      ]},
      { id: 10, question: "What is earned value management (EVM)?", type: "multiple_choice", points: 1, answers: [
        { id: 35, text: "A reward system", order: 0 }, { id: 36, text: "A method to determine scope", order: 1 },
        { id: 37, text: "A technique to measure project performance", order: 2 }, { id: 38, text: "An HR method", order: 3 },
      ]},
    ];
  };

  // ============================================
  // ANSWER SELECTION
  // ============================================
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

  // ============================================
  // FLAG QUESTION
  // ============================================
  const toggleFlag = (questionId: number) => {
    setFlagged(prev => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };

  // ============================================
  // SUBMIT
  // ============================================
  const handleSubmitWithAnswers = async (answers: Record<string, number[]>) => {
    setSubmitting(true);
    setShowReview(false);
    try {
      const token = localStorage.getItem("access_token") || "";
      const res = await fetch(`${apiBase}/academy/exam/${lessonId}/submit/`, {
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
        if (data.passed) onCertificateTrigger?.();
      } else {
        scoreLocally(answers);
      }
    } catch {
      scoreLocally(answers);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = () => handleSubmitWithAnswers(selectedAnswers);

  const scoreLocally = (answers: Record<string, number[]> = selectedAnswers) => {
    let score = 0;
    const maxScore = questions.length;
    const questionResults: ExamResult[] = [];

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
        explanation: "",
      });
    }

    const percentage = Math.round((score / maxScore) * 100);
    const passed = percentage >= passingScore;
    setResults({ score, max_score: maxScore, percentage, passed, results: questionResults });
    onComplete?.(passed, percentage);
    if (passed) onCertificateTrigger?.();
  };

  // ============================================
  // RESET
  // ============================================
  const resetExam = () => {
    setResults(null);
    setSelectedAnswers({});
    setCurrentIdx(0);
    setFlagged(new Set());
    setShowReview(false);
    setExamStarted(false);
    setTimeRemaining(null);
  };

  // ============================================
  // RENDER: LOADING
  // ============================================
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // ============================================
  // RENDER: START SCREEN
  // ============================================
  if (!examStarted && !results) {
    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <Card className="border-2 border-purple-200 dark:border-purple-800">
          <CardContent className="pt-8 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-purple-500/20">
              <ShieldCheck className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {isNL ? "Examen" : "Exam"}
            </h2>
            <p className="text-muted-foreground mb-6">
              {isNL
                ? "Lees de instructies zorgvuldig door voordat je begint."
                : "Read the instructions carefully before you begin."}
            </p>

            <div className="grid grid-cols-2 gap-4 text-left mb-8 max-w-sm mx-auto">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{timeLimit} {isNL ? "minuten" : "minutes"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                <span>{questions.length} {isNL ? "vragen" : "questions"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Trophy className="h-4 w-4 text-muted-foreground" />
                <span>{totalPoints} {isNL ? "punten" : "points"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Award className="h-4 w-4 text-muted-foreground" />
                <span>{passingScore}% {isNL ? "nodig" : "to pass"}</span>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-amber-800 dark:text-amber-200 font-medium mb-2">
                {isNL ? "Belangrijke informatie:" : "Important information:"}
              </p>
              <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                <li>- {isNL ? "De timer start zodra je begint" : "The timer starts as soon as you begin"}</li>
                <li>- {isNL ? "Je kunt tussen vragen navigeren" : "You can navigate between questions"}</li>
                <li>- {isNL ? "Markeer vragen om later te herzien" : "Flag questions to review later"}</li>
                <li>- {isNL ? "Het examen wordt automatisch ingeleverd als de tijd op is" : "The exam auto-submits when time runs out"}</li>
              </ul>
            </div>

            <Button
              size="lg"
              onClick={() => setExamStarted(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
            >
              {isNL ? "Start Examen" : "Start Exam"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ============================================
  // RENDER: RESULTS
  // ============================================
  if (results) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <Card className={results.passed
          ? "border-green-300 bg-green-50 dark:bg-green-950/20"
          : "border-red-300 bg-red-50 dark:bg-red-950/20"
        }>
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
              {results.passed
                ? (isNL ? "Geslaagd" : "Passed")
                : (isNL ? `Niet geslaagd (${passingScore}% nodig)` : `Not passed (${passingScore}% needed)`)}
            </Badge>

            {results.passed && (
              <div className="mt-6 p-4 bg-green-100 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
                <Award className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  {isNL
                    ? "Je certificaat is beschikbaar! Ga naar het certificaat-tabblad."
                    : "Your certificate is available! Go to the certificate tab."}
                </p>
              </div>
            )}
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
                              {isCorrectAnswer && " \u2713"}
                              {wasSelected && !isCorrectAnswer && " \u2717"}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex gap-4 mt-6 justify-center">
          <Button variant="outline" onClick={resetExam}>
            <RotateCcw className="w-4 h-4 mr-2" />
            {isNL ? "Opnieuw proberen" : "Try Again"}
          </Button>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER: REVIEW BEFORE SUBMIT
  // ============================================
  if (showReview) {
    const answeredCount = questions.filter(q => (selectedAnswers[String(q.id)] || []).length > 0).length;
    const unanswered = questions.filter(q => (selectedAnswers[String(q.id)] || []).length === 0);
    const flaggedQuestions = questions.filter(q => flagged.has(q.id));

    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        {/* Timer */}
        {timeRemaining !== null && (
          <div className={`mb-4 p-4 rounded-lg border-2 ${
            timeRemaining < 300
              ? "bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-800"
              : "bg-blue-50 dark:bg-blue-950/20 border-blue-300 dark:border-blue-800"
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className={`h-5 w-5 ${timeRemaining < 300 ? "text-red-600" : "text-blue-600"}`} />
                <span className="font-medium text-sm">{isNL ? "Tijd over" : "Time remaining"}</span>
              </div>
              <span className={`text-2xl font-bold ${timeRemaining < 300 ? "text-red-600 animate-pulse" : "text-blue-600"}`}>
                {formatTime(timeRemaining)}
              </span>
            </div>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              {isNL ? "Examen overzicht" : "Exam Review"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-4">
                {isNL
                  ? `Je hebt ${answeredCount} van de ${questions.length} vragen beantwoord.`
                  : `You have answered ${answeredCount} of ${questions.length} questions.`}
              </p>

              {/* Question grid */}
              <div className="grid grid-cols-5 gap-2 mb-6">
                {questions.map((q, idx) => {
                  const isAnswered = (selectedAnswers[String(q.id)] || []).length > 0;
                  const isFlagged = flagged.has(q.id);
                  return (
                    <button
                      key={q.id}
                      onClick={() => { setCurrentIdx(idx); setShowReview(false); }}
                      className={`relative p-2 rounded-lg text-sm font-medium transition-all ${
                        isAnswered
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
                          : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
                      }`}
                    >
                      {idx + 1}
                      {isFlagged && (
                        <Flag className="absolute -top-1 -right-1 w-3 h-3 text-orange-500 fill-orange-500" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Unanswered warning */}
              {unanswered.length > 0 && (
                <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                    <AlertCircle className="h-4 w-4 inline mr-1" />
                    {isNL
                      ? `${unanswered.length} ${unanswered.length === 1 ? "vraag" : "vragen"} nog niet beantwoord`
                      : `${unanswered.length} ${unanswered.length === 1 ? "question" : "questions"} unanswered`}
                  </p>
                </div>
              )}

              {/* Flagged questions */}
              {flaggedQuestions.length > 0 && (
                <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                  <p className="text-sm text-orange-800 dark:text-orange-200 font-medium">
                    <Flag className="h-4 w-4 inline mr-1" />
                    {isNL
                      ? `${flaggedQuestions.length} ${flaggedQuestions.length === 1 ? "vraag" : "vragen"} gemarkeerd voor review`
                      : `${flaggedQuestions.length} ${flaggedQuestions.length === 1 ? "question" : "questions"} flagged for review`}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={() => setShowReview(false)}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                {isNL ? "Terug naar vragen" : "Back to questions"}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {submitting
                  ? (isNL ? "Inleveren..." : "Submitting...")
                  : (isNL ? "Examen inleveren" : "Submit Exam")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ============================================
  // RENDER: EXAM QUESTIONS
  // ============================================
  const currentQ = questions[currentIdx];
  const answered = Object.keys(selectedAnswers).filter(k => (selectedAnswers[k] || []).length > 0).length;
  const showTimeWarning = timeRemaining !== null && timeRemaining < 300;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Timer */}
      {timeRemaining !== null && (
        <div className={`mb-4 p-4 rounded-lg border-2 ${
          showTimeWarning
            ? "bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-800"
            : "bg-blue-50 dark:bg-blue-950/20 border-blue-300 dark:border-blue-800"
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className={`h-5 w-5 ${showTimeWarning ? "text-red-600" : "text-blue-600"}`} />
              <span className="font-medium text-sm">{isNL ? "Tijd over" : "Time remaining"}</span>
            </div>
            <span className={`text-2xl font-bold ${showTimeWarning ? "text-red-600 animate-pulse" : "text-blue-600"}`}>
              {formatTime(timeRemaining)}
            </span>
          </div>
          {showTimeWarning && (
            <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {isNL ? "Minder dan 5 minuten over!" : "Less than 5 minutes remaining!"}
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
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {currentQ.type === "true_false"
                    ? (isNL ? "Waar/Niet waar" : "True/False")
                    : (isNL ? "Meerkeuze" : "Multiple Choice")}
                </Badge>
                <Badge variant="secondary">
                  {currentQ.points} {currentQ.points === 1 ? (isNL ? "punt" : "point") : (isNL ? "punten" : "points")}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleFlag(currentQ.id)}
                className={flagged.has(currentQ.id) ? "text-orange-500" : "text-muted-foreground"}
              >
                <Flag className={`h-4 w-4 ${flagged.has(currentQ.id) ? "fill-orange-500" : ""}`} />
              </Button>
            </div>
            <CardTitle className="text-lg">{currentQ.question}</CardTitle>
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
          <ChevronLeft className="w-4 h-4 mr-1" />
          {isNL ? "Vorige" : "Previous"}
        </Button>

        <div className="flex gap-2">
          {questions.map((q, idx) => (
            <button
              key={q.id}
              onClick={() => setCurrentIdx(idx)}
              className={`relative w-8 h-8 rounded-full text-xs font-medium transition-all ${
                idx === currentIdx
                  ? "bg-primary text-white"
                  : (selectedAnswers[String(q.id)] || []).length > 0
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {idx + 1}
              {flagged.has(q.id) && (
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-orange-500" />
              )}
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
            onClick={() => setShowReview(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Eye className="w-4 h-4 mr-2" />
            {isNL ? "Nakijken" : "Review"}
          </Button>
        )}
      </div>
    </div>
  );
}
