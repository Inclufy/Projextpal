import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  X, 
  Command,
  Loader2,
  FolderKanban,
  AlertTriangle,
  Users,
  Plus,
  Zap,
  Lightbulb,
  Building2,
  GraduationCap,
  Timer,
  Brain,
  LayoutDashboard,
  Play,
  StopCircle,
  RefreshCw,
  Copy,
  CheckCircle2,
  ArrowRight,
  Target,
  History,
  Clock,
  Trash2,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// ============================================
// TYPES
// ============================================
interface Program {
  id: string;
  name: string;
  status: string;
  methodology?: string;
  health_status?: string;
  project_count?: number;
  total_budget?: number;
  progress?: number;
}

interface Project {
  id: string;
  name: string;
  status: string;
  health_status?: string;
  progress?: number;
  budget?: number;
  end_date?: string;
}

interface QuickAction {
  id: string;
  icon: typeof Building2;
  label: string;
  labelNL: string;
  action: string;
  color: string;
  keywords: string[];
}

interface SuggestedAction {
  icon: typeof Building2;
  label: string;
  route: string;
  color: string;
}

interface HistoryItem {
  id: string;
  query: string;
  timestamp: number;
  response?: string;
}

interface AICommanderProps {
  className?: string;
  isNL?: boolean;
  programs?: Program[];
  projects?: Project[];
  onAIQuery?: (query: string, context: any) => Promise<string>;
}

// ============================================
// STORAGE KEY
// ============================================
const HISTORY_STORAGE_KEY = 'aicommander_history';
const MAX_HISTORY_ITEMS = 20;

// ============================================
// AI API CALL
// ============================================
const callAI = async (prompt: string): Promise<string> => {
  const token = localStorage.getItem("access_token");
  if (!token) throw new Error("Not authenticated");

  const createChatResponse = await fetch("/api/v1/bot/chats/", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ title: "AI Commander Query" }),
  });
  
  if (!createChatResponse.ok) throw new Error("Failed to create chat");
  const chatData = await createChatResponse.json();
  
  const messageResponse = await fetch(`/api/v1/bot/chats/${chatData.id}/send_message/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ message: prompt }),
  });
  
  if (!messageResponse.ok) throw new Error("AI service unavailable");
  const data = await messageResponse.json();
  return data.ai_response?.content || "";
};

// ============================================
// QUICK ACTIONS
// ============================================
const quickActions: QuickAction[] = [
  { id: 'nav-dashboard', icon: LayoutDashboard, label: 'Dashboard', labelNL: 'Dashboard', action: 'navigate:/dashboard', color: '#8B5CF6', keywords: ['home', 'dashboard'] },
  { id: 'nav-programs', icon: Building2, label: 'Programs', labelNL: 'Programma\'s', action: 'navigate:/programs', color: '#8B5CF6', keywords: ['programs'] },
  { id: 'nav-projects', icon: FolderKanban, label: 'Projects', labelNL: 'Projecten', action: 'navigate:/projects', color: '#3B82F6', keywords: ['projects'] },
  { id: 'nav-academy', icon: GraduationCap, label: 'Academy', labelNL: 'Academy', action: 'navigate:/academy/marketplace', color: '#22C55E', keywords: ['academy', 'training'] },
  { id: 'nav-time', icon: Timer, label: 'Time', labelNL: 'Tijd', action: 'navigate:/time-tracking', color: '#F97316', keywords: ['time', 'uren'] },
  { id: 'nav-team', icon: Users, label: 'Team', labelNL: 'Team', action: 'navigate:/team', color: '#06B6D4', keywords: ['team'] },
  { id: 'create-program', icon: Plus, label: 'New Program', labelNL: 'Nieuw Programma', action: 'navigate:/programs/new', color: '#8B5CF6', keywords: ['new', 'program'] },
  { id: 'create-project', icon: Plus, label: 'New Project', labelNL: 'Nieuw Project', action: 'navigate:/projects/new', color: '#3B82F6', keywords: ['new', 'project'] },
  { id: 'time-start', icon: Play, label: 'Start Timer', labelNL: 'Start Timer', action: 'timer:start', color: '#22C55E', keywords: ['start'] },
  { id: 'time-stop', icon: StopCircle, label: 'Stop Timer', labelNL: 'Stop Timer', action: 'timer:stop', color: '#EF4444', keywords: ['stop'] },
];

const exampleQuestions = {
  en: ["Which projects are at risk?", "Training for Scrum?", "Portfolio summary", "Optimize workload"],
  nl: ["Welke projecten lopen risico?", "Training voor Scrum?", "Portfolio samenvatting", "Werkbelasting optimaliseren"],
};

// ============================================
// BUILD CONTEXT PROMPT
// ============================================
const buildContextPrompt = (query: string, programs: Program[], projects: Project[], isNL: boolean): string => {
  const noneLabel = isNL ? 'Geen' : 'None';

  const programSummary = programs.length > 0
    ? programs.map(p => `- ${p.name}: Status=${p.status}, Health=${p.health_status}, Progress=${p.progress}%`).join('\n')
    : noneLabel;

  const projectSummary = projects.length > 0
    ? projects.map(p => `- ${p.name}: Status=${p.status}, Health=${p.health_status}, Progress=${p.progress}%`).join('\n')
    : noneLabel;

  const programsLabel = isNL ? "programma's" : 'programs';
  const projectsLabel = isNL ? 'projecten' : 'projects';

  // Language instruction — placed at START and END to override backend system prompt
  // The backend says "respond in the same language as the user" but the user's UI language
  // should take priority, even if they type the query in a different language.
  const langStart = isNL
    ? "[TAAL: NEDERLANDS] Antwoord VERPLICHT in het Nederlands, ongeacht de taal van de vraag hieronder."
    : "[LANGUAGE: ENGLISH] You MUST respond in English, regardless of the query language below.";
  const langEnd = isNL
    ? "HERINNERING: Antwoord volledig in het NEDERLANDS. Gebruik Nederlandse headers, bullets en tekst."
    : "REMINDER: Respond entirely in ENGLISH. Use English headers, bullets and text.";

  return `${langStart}

## Context
- ${programs.length} ${programsLabel}, ${projects.length} ${projectsLabel}
- At-risk: ${projects.filter(p => p.health_status === 'at_risk').length}

### ${isNL ? "Programma's" : 'Programs'}
${programSummary}

### ${isNL ? 'Projecten' : 'Projects'}
${projectSummary}

## ${isNL ? 'Vraag van de gebruiker' : 'User question'}
${query}

## ${isNL ? 'Instructies' : 'Instructions'}
- ${isNL ? 'Geef specifiek, actionable advies' : 'Give specific, actionable advice'}
- ${isNL ? 'Gebruik headers met ## en bullets met -' : 'Use headers with ## and bullets with -'}
- ${isNL ? 'GEEN ** gebruiken, gewoon normale tekst' : 'Do NOT use ** for bold, use plain text'}
- Max 250 ${isNL ? 'woorden' : 'words'}
- ${isNL ? 'Eindig met concrete volgende stappen' : 'End with concrete next steps'}

${langEnd}`;
};

// ============================================
// DETECT SUGGESTED ACTIONS
// ============================================
const detectSuggestedActions = (response: string, query: string, isNL: boolean): SuggestedAction[] => {
  const actions: SuggestedAction[] = [];
  const lowerResponse = response.toLowerCase();
  const lowerQuery = query.toLowerCase();
  
  if (lowerResponse.includes('training') || lowerResponse.includes('cursus') || lowerQuery.includes('training') || lowerQuery.includes('scrum') || lowerQuery.includes('prince2')) {
    actions.push({ icon: GraduationCap, label: isNL ? 'Bekijk Academy' : 'View Academy', route: '/academy/marketplace', color: '#22C55E' });
  }
  if (lowerResponse.includes('project') || lowerQuery.includes('project')) {
    actions.push({ icon: FolderKanban, label: isNL ? 'Bekijk Projecten' : 'View Projects', route: '/projects', color: '#3B82F6' });
  }
  if (lowerResponse.includes('risico') || lowerResponse.includes('risk') || lowerResponse.includes('at-risk')) {
    actions.push({ icon: AlertTriangle, label: isNL ? 'Risico Projecten' : 'At-Risk Projects', route: '/projects?filter=at_risk', color: '#F97316' });
  }
  if (lowerResponse.includes('programma') || lowerResponse.includes('program')) {
    actions.push({ icon: Building2, label: isNL ? 'Bekijk Programma\'s' : 'View Programs', route: '/programs', color: '#8B5CF6' });
  }
  if (lowerResponse.includes('team') || lowerResponse.includes('resource') || lowerResponse.includes('werkbelasting')) {
    actions.push({ icon: Users, label: isNL ? 'Team Overzicht' : 'Team Overview', route: '/team', color: '#06B6D4' });
  }

  return actions.slice(0, 3);
};

// ============================================
// PARSE MARKDOWN
// ============================================
const parseMarkdown = (text: string): React.ReactNode[] => {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  
  lines.forEach((line, i) => {
    const parseBold = (text: string): React.ReactNode => {
      const parts = text.split(/\*\*(.*?)\*\*/g);
      if (parts.length === 1) return text;
      return parts.map((part, j) => j % 2 === 1 ? <strong key={j} className="font-semibold text-gray-900 dark:text-white">{part}</strong> : part);
    };
    
    if (line.startsWith('## ')) {
      elements.push(
        <div key={i} className="flex items-center gap-3 mt-5 mb-3 first:mt-0">
          <div className="h-8 w-1 rounded-full bg-gradient-to-b from-purple-500 to-pink-500" />
          <h3 className="text-base font-bold text-gray-900 dark:text-white">{parseBold(line.replace('## ', ''))}</h3>
        </div>
      );
      return;
    }
    
    if (line.startsWith('### ')) {
      elements.push(<h4 key={i} className="text-sm font-semibold text-purple-700 dark:text-purple-400 mt-4 mb-2">{parseBold(line.replace('### ', ''))}</h4>);
      return;
    }
    
    const numberedMatch = line.match(/^(\d+)[.)]\s*(.+)/);
    if (numberedMatch) {
      elements.push(
        <div key={i} className="flex items-start gap-3 mb-3 ml-1">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs font-bold flex items-center justify-center shadow-lg shadow-purple-500/30">{numberedMatch[1]}</span>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed pt-0.5">{parseBold(numberedMatch[2])}</p>
        </div>
      );
      return;
    }
    
    if (line.startsWith('- ') || line.startsWith('• ') || line.startsWith('* ')) {
      const content = line.replace(/^[-•*]\s*/, '');
      elements.push(
        <div key={i} className="flex items-start gap-3 mb-2 ml-1">
          <div className="flex-shrink-0 w-2 h-2 rounded-full bg-purple-400 mt-2" />
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{parseBold(content)}</p>
        </div>
      );
      return;
    }
    
    if (line.trim()) {
      elements.push(<p key={i} className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">{parseBold(line)}</p>);
    }
  });
  
  return elements;
};

// ============================================
// FORMAT TIME AGO
// ============================================
const formatTimeAgo = (timestamp: number, isNL: boolean): string => {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return isNL ? 'Zojuist' : 'Just now';
  if (minutes < 60) return isNL ? `${minutes} min geleden` : `${minutes}m ago`;
  if (hours < 24) return isNL ? `${hours} uur geleden` : `${hours}h ago`;
  if (days < 7) return isNL ? `${days} dagen geleden` : `${days}d ago`;
  
  const date = new Date(timestamp);
  return date.toLocaleDateString(isNL ? 'nl-NL' : 'en-US', { day: 'numeric', month: 'short' });
};

// ============================================
// MAIN COMPONENT
// ============================================
const AICommander = ({ 
  className, 
  isNL = false,
  programs = [],
  projects = [],
  onAIQuery
}: AICommanderProps) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'actions' | 'suggestions' | 'history'>('actions');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load history:', e);
    }
  }, []);

  // Save history to localStorage
  const saveHistory = (newHistory: HistoryItem[]) => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(newHistory));
      setHistory(newHistory);
    } catch (e) {
      console.error('Failed to save history:', e);
    }
  };

  // Add to history
  const addToHistory = (queryText: string, response?: string) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      query: queryText,
      timestamp: Date.now(),
      response,
    };
    
    // Remove duplicates and limit size
    const filtered = history.filter(h => h.query.toLowerCase() !== queryText.toLowerCase());
    const newHistory = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
    saveHistory(newHistory);
  };

  // Clear history
  const clearHistory = () => {
    saveHistory([]);
  };

  // Remove single history item
  const removeHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newHistory = history.filter(h => h.id !== id);
    saveHistory(newHistory);
  };

  // Suggested actions based on response
  const suggestedActions = useMemo(() => {
    if (!aiResponse) return [];
    return detectSuggestedActions(aiResponse, query, isNL);
  }, [aiResponse, query, isNL]);

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
        setIsFocused(true);
      }
      if (event.key === 'Escape') {
        setIsFocused(false);
        setQuery('');
        setAiResponse(null);
        setError(null);
        inputRef.current?.blur();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (!aiResponse) setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [aiResponse]);

  const filteredActions = quickActions.filter(action => {
    if (!query || query.length < 2) return true;
    const terms = query.toLowerCase().split(' ');
    const text = [action.label, action.labelNL, ...action.keywords].join(' ').toLowerCase();
    return terms.some(t => text.includes(t));
  });

  const isNavQuery = (q: string) => ['ga naar', 'go to', 'open', 'start', 'stop', 'nieuw', 'new', 'create'].some(k => q.toLowerCase().includes(k));

  const executeAction = (action: QuickAction) => {
    const [type, value] = action.action.split(':');
    if (type === 'navigate') navigate(value);
    else if (type === 'timer') window.dispatchEvent(new CustomEvent('ai-commander-timer', { detail: { action: value } }));
    setIsFocused(false);
    setQuery('');
    setAiResponse(null);
  };

  const handleSubmit = async (queryOverride?: string) => {
    const searchQuery = queryOverride || query;
    if (!searchQuery.trim()) return;
    setError(null);
    
    if (isNavQuery(searchQuery) && filteredActions.length <= 3) {
      executeAction(filteredActions[0]);
      return;
    }
    
    setIsProcessing(true);
    setAiResponse(null);
    setQuery(searchQuery);
    
    try {
      const prompt = buildContextPrompt(searchQuery, programs, projects, isNL);
      const response = onAIQuery ? await onAIQuery(searchQuery, { programs, projects }) : await callAI(prompt);
      setAiResponse(response);
      addToHistory(searchQuery, response);
    } catch (err) {
      setError(isNL ? 'Fout opgetreden. Ben je ingelogd?' : 'Error occurred. Are you logged in?');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleHistoryClick = (item: HistoryItem) => {
    setQuery(item.query);
    if (item.response) {
      setAiResponse(item.response);
    } else {
      handleSubmit(item.query);
    }
  };

  const copyResponse = () => {
    if (aiResponse) {
      navigator.clipboard.writeText(aiResponse);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const t = {
    placeholder: isNL ? 'Stel een vraag over projecten, training, methodologie...' : 'Ask about projects, training, methodology...',
    askAI: isNL ? 'Vraag Advies' : 'Ask Advice',
    thinking: isNL ? 'Denkt na...' : 'Thinking...',
    newQuestion: isNL ? 'Nieuwe vraag' : 'New question',
    copy: copied ? '✓' : (isNL ? 'Kopieer' : 'Copy'),
    actions: isNL ? 'Aanbevolen Acties' : 'Recommended Actions',
    quickActions: isNL ? 'Snelle Acties' : 'Quick Actions',
    tryAsking: isNL ? 'Suggesties' : 'Suggestions',
    history: isNL ? 'Geschiedenis' : 'History',
    clearHistory: isNL ? 'Wissen' : 'Clear',
    noHistory: isNL ? 'Nog geen zoekopdrachten' : 'No searches yet',
    noHistoryDesc: isNL ? 'Je recente vragen verschijnen hier' : 'Your recent questions will appear here',
  };

  const atRiskCount = projects.filter(p => p.health_status === 'at_risk' || p.health_status === 'critical').length;

  return (
    <div ref={containerRef} className={cn('relative w-full max-w-3xl mx-auto', className)}>
      {/* Search Input */}
      <div className={cn(
        'relative flex items-center bg-white dark:bg-gray-900 rounded-2xl border-2 transition-all duration-300',
        isFocused 
          ? 'border-purple-300 shadow-xl shadow-purple-500/10 ring-4 ring-purple-50 dark:ring-purple-900/20' 
          : 'border-purple-100 dark:border-purple-800/50 shadow-lg hover:border-purple-200 hover:shadow-xl'
      )}>
        <div className="pl-4">
          <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30">
            <Brain className="h-4 w-4 text-white" />
          </div>
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setAiResponse(null); setError(null); }}
          onFocus={() => setIsFocused(true)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder={t.placeholder}
          className="flex-1 h-12 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400 text-sm px-4"
        />

        {!isFocused && !query && (
          <div className="hidden md:flex items-center gap-1 px-2 py-1 mr-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg text-xs text-purple-600 dark:text-purple-400 font-medium">
            <Command className="h-3 w-3" /><span>K</span>
          </div>
        )}

        {query && (
          <button onClick={() => { setQuery(''); setAiResponse(null); setError(null); }} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg mr-1">
            <X className="h-4 w-4 text-gray-400" />
          </button>
        )}

        <Button
          onClick={() => handleSubmit()}
          disabled={!query.trim() || isProcessing}
          className="h-9 px-4 mr-1.5 rounded-xl text-white text-sm font-semibold shadow-lg shadow-purple-500/30 disabled:opacity-50 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          {isProcessing ? <><Loader2 className="h-4 w-4 animate-spin mr-1.5" />{t.thinking}</> : <><Sparkles className="h-4 w-4 mr-1.5" />{t.askAI}</>}
        </Button>
      </div>

      {/* Dropdown Panel */}
      {isFocused && (
        <Card className="absolute top-full left-0 right-0 mt-3 border-0 ring-1 ring-purple-100 dark:ring-purple-900/50 bg-white dark:bg-gray-900 shadow-2xl overflow-hidden z-50">
          
          {/* Error */}
          {error && (
            <div className="px-5 py-3 bg-red-50 dark:bg-red-900/20 border-b border-red-100">
              <p className="text-sm text-red-600 flex items-center gap-2"><AlertTriangle className="h-4 w-4" />{error}</p>
            </div>
          )}

          {/* AI Response */}
          {aiResponse && (
            <div className="border-b border-purple-100 dark:border-purple-900/30">
              {/* Header */}
              <div className="px-5 py-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-b border-purple-100 dark:border-purple-900/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <Brain className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white text-sm">AI Advisor</span>
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs">{isNL ? 'Gepersonaliseerd' : 'Personalized'}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={copyResponse} className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-white dark:bg-gray-800 rounded-lg ring-1 ring-purple-100 hover:ring-purple-200 transition-all">
                    {copied ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}{t.copy}
                  </button>
                  <button onClick={() => { setAiResponse(null); setQuery(''); inputRef.current?.focus(); }} className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-white dark:bg-gray-800 rounded-lg ring-1 ring-purple-100 hover:ring-purple-200 transition-all">
                    <RefreshCw className="h-3 w-3" />{t.newQuestion}
                  </button>
                </div>
              </div>
              
              {/* Response Content */}
              <CardContent className="px-5 py-4 max-h-[300px] overflow-y-auto">
                {parseMarkdown(aiResponse)}
              </CardContent>

              {/* Suggested Actions */}
              {suggestedActions.length > 0 && (
                <div className="px-5 py-4 bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-900/10 dark:to-pink-900/10 border-t border-purple-100 dark:border-purple-900/30">
                  <p className="text-xs font-bold text-purple-600 dark:text-purple-400 mb-3 uppercase tracking-widest flex items-center gap-2">
                    <Target className="h-3 w-3" />
                    {t.actions}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedActions.map((action, i) => (
                      <Button
                        key={i}
                        onClick={() => navigate(action.route)}
                        className="h-9 px-4 rounded-xl text-white text-sm font-semibold shadow-lg transition-all hover:scale-105"
                        style={{ 
                          background: `linear-gradient(135deg, ${action.color}, ${action.color}dd)`,
                          boxShadow: `0 4px 14px ${action.color}40`
                        }}
                      >
                        <action.icon className="h-4 w-4 mr-2" />
                        {action.label}
                        <ArrowRight className="h-3.5 w-3.5 ml-2" />
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tabs - When no response */}
          {!aiResponse && !isProcessing && (
            <>
              {/* Tab Headers */}
              <div className="flex border-b border-purple-100 dark:border-purple-900/30">
                <button
                  onClick={() => setActiveTab('actions')}
                  className={cn(
                    'flex-1 px-4 py-3 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all',
                    activeTab === 'actions'
                      ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-500 bg-purple-50/50 dark:bg-purple-900/20'
                      : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  )}
                >
                  <Zap className="h-3.5 w-3.5" />
                  {t.quickActions}
                </button>
                <button
                  onClick={() => setActiveTab('suggestions')}
                  className={cn(
                    'flex-1 px-4 py-3 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all',
                    activeTab === 'suggestions'
                      ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-500 bg-purple-50/50 dark:bg-purple-900/20'
                      : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  )}
                >
                  <Lightbulb className="h-3.5 w-3.5" />
                  {t.tryAsking}
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={cn(
                    'flex-1 px-4 py-3 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all',
                    activeTab === 'history'
                      ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-500 bg-purple-50/50 dark:bg-purple-900/20'
                      : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  )}
                >
                  <History className="h-3.5 w-3.5" />
                  {t.history}
                  {history.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-full">
                      {history.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Tab Content */}
              <div className="min-h-[200px]">
                {/* Quick Actions Tab */}
                {activeTab === 'actions' && (
                  <CardContent className="px-5 py-4">
                    <div className="grid grid-cols-5 gap-2">
                      {filteredActions.slice(0, 10).map((action) => (
                        <button
                          key={action.id}
                          onClick={() => executeAction(action)}
                          className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all group"
                        >
                          <div className="p-2.5 rounded-xl group-hover:scale-110 transition-transform shadow-lg" style={{ backgroundColor: `${action.color}15`, boxShadow: `0 4px 14px ${action.color}20` }}>
                            <action.icon className="h-4 w-4" style={{ color: action.color }} />
                          </div>
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 text-center">
                            {isNL ? action.labelNL : action.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                )}

                {/* Suggestions Tab */}
                {activeTab === 'suggestions' && (
                  <CardContent className="px-5 py-4">
                    <div className="grid gap-2">
                      {(isNL ? exampleQuestions.nl : exampleQuestions.en).map((q, i) => (
                        <button 
                          key={i} 
                          onClick={() => setQuery(q)} 
                          className="flex items-center gap-3 p-3 text-left bg-purple-50/50 dark:bg-purple-900/10 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-xl transition-all group"
                        >
                          <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/50 group-hover:scale-110 transition-transform">
                            <Search className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-purple-700 dark:group-hover:text-purple-400">
                            {q}
                          </span>
                          <ArrowRight className="h-4 w-4 text-gray-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  </CardContent>
                )}

                {/* History Tab */}
                {activeTab === 'history' && (
                  <div>
                    {history.length > 0 ? (
                      <>
                        {/* Clear History Button */}
                        <div className="px-5 py-2 border-b border-purple-50 dark:border-purple-900/30 flex justify-end">
                          <button
                            onClick={clearHistory}
                            className="text-xs text-gray-500 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-1 transition-colors"
                          >
                            <Trash2 className="h-3 w-3" />
                            {t.clearHistory}
                          </button>
                        </div>
                        
                        {/* History List */}
                        <div className="max-h-[250px] overflow-y-auto">
                          {history.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => handleHistoryClick(item)}
                              className="w-full flex items-center gap-3 px-5 py-3 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all group border-b border-purple-50 dark:border-purple-900/30 last:border-0"
                            >
                              <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/50 transition-colors">
                                <Clock className="h-4 w-4 text-gray-500 group-hover:text-purple-600 dark:group-hover:text-purple-400" />
                              </div>
                              <div className="flex-1 text-left min-w-0">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate group-hover:text-purple-700 dark:group-hover:text-purple-400">
                                  {item.query}
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                  {formatTimeAgo(item.timestamp, isNL)}
                                </p>
                              </div>
                              <button
                                onClick={(e) => removeHistoryItem(item.id, e)}
                                className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all"
                              >
                                <X className="h-3.5 w-3.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400" />
                              </button>
                              <ArrowRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="px-5 py-10 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
                          <History className="h-6 w-6 text-gray-400" />
                        </div>
                        <p className="font-medium text-gray-700 dark:text-gray-300">{t.noHistory}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t.noHistoryDesc}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Processing */}
          {isProcessing && (
            <CardContent className="py-10 flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-xl shadow-purple-500/30">
                  <Brain className="h-7 w-7 text-white animate-pulse" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-ping" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t.thinking}</p>
                <p className="text-xs text-gray-500 mt-1">{isNL ? `Analyseert ${programs.length} programma's en ${projects.length} projecten...` : `Analyzing ${programs.length} programs and ${projects.length} projects...`}</p>
              </div>
            </CardContent>
          )}

          {/* Footer */}
          <div className="px-5 py-2.5 bg-gray-50 dark:bg-gray-800/50 border-t border-purple-50 dark:border-purple-900/30 flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5 font-medium"><Building2 className="h-3.5 w-3.5 text-purple-500" />{programs.length} {isNL ? "programma's" : 'programs'}</span>
              <span className="flex items-center gap-1.5 font-medium"><FolderKanban className="h-3.5 w-3.5 text-blue-500" />{projects.length} {isNL ? 'projecten' : 'projects'}</span>
              {atRiskCount > 0 && <span className="flex items-center gap-1.5 font-medium text-orange-600"><AlertTriangle className="h-3.5 w-3.5" />{atRiskCount} {isNL ? 'risico' : 'at-risk'}</span>}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Sparkles className="h-3 w-3 text-purple-500" /><span>AI Advisor</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AICommander;