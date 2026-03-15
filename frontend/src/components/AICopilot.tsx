// src/components/AICopilot.tsx
// AI Project Co-pilot — vaste sidebar rechts (320px) — paars thema

import { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Sparkles,
  Loader2,
  Trash2,
  Copy,
  Check,
  ChevronRight,
  FolderKanban,
  Shield,
  TrendingUp,
  Users,
  Calendar,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface CopilotInitialContext {
  systemPrompt: string;
  firstMessage?: string;
}

interface AICopilotProps {
  isOpen: boolean;
  onClose: () => void;
  initialContext?: CopilotInitialContext | null;
  onContextConsumed?: () => void;
}

const QUICK_PROMPTS = [
  { icon: FolderKanban, label: 'Project analyse', prompt: 'Analyseer de huidige status van mijn projecten en geef verbeterpunten' },
  { icon: Shield, label: 'Risico scan', prompt: 'Doe een risico-analyse van mijn actieve projecten' },
  { icon: Calendar, label: 'Planning advies', prompt: 'Geef advies over mijn projectplanning en deadlines' },
  { icon: Users, label: 'Team inzichten', prompt: 'Analyseer de teambelasting en resourceverdeling' },
];

const SUGGESTIONS = [
  { icon: BarChart3, title: 'Projectrisico\'s', desc: 'Analyseer huidige projectrisico\'s en stel mitigaties voor' },
  { icon: TrendingUp, title: 'Prestatierapport', desc: 'Genereer een samenvatting van projectprestaties' },
  { icon: Calendar, title: 'Maandrapportage', desc: 'Maak een maandelijks projectvoortgangsrapport' },
];

export default function AICopilot({ isOpen, onClose, initialContext, onContextConsumed }: AICopilotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const contextProcessedRef = useRef<string | null>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Handle initialContext
  useEffect(() => {
    if (!isOpen || !initialContext || isLoading) return;
    const contextKey = `${initialContext.systemPrompt}:${initialContext.firstMessage || ''}`;
    if (contextProcessedRef.current === contextKey) return;
    contextProcessedRef.current = contextKey;
    setMessages([]);
    if (initialContext.firstMessage) {
      setTimeout(() => {
        sendMessage(initialContext.firstMessage!);
      }, 400);
    }
    onContextConsumed?.();
  }, [isOpen, initialContext]); // eslint-disable-line react-hooks/exhaustive-deps

  const generateId = () => `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  const copyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // TODO: Connect to Django backend /api/v1/bot/ endpoint
      // For now, use fallback responses
      await new Promise(resolve => setTimeout(resolve, 1000));

      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: getFallbackResponse(messageText),
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('[AICopilot] Error:', err);
      const fallbackMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: 'Er is een fout opgetreden. Probeer het later opnieuw.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    contextProcessedRef.current = null;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Simple markdown-like rendering
  const renderContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      let rendered = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      if (rendered.startsWith('- ')) {
        return <p key={i} className="ml-2 text-[13px]" dangerouslySetInnerHTML={{ __html: rendered }} />;
      }
      if (rendered.startsWith('### ')) {
        return <p key={i} className="font-bold text-xs mt-2" dangerouslySetInnerHTML={{ __html: rendered.slice(4) }} />;
      }
      if (rendered.startsWith('## ')) {
        return <p key={i} className="font-bold text-sm mt-2" dangerouslySetInnerHTML={{ __html: rendered.slice(3) }} />;
      }
      if (rendered.trim() === '') return <br key={i} />;
      return <p key={i} className="text-[13px]" dangerouslySetInnerHTML={{ __html: rendered }} />;
    });
  };

  const hasMessages = messages.length > 0;

  if (!isOpen) return null;

  return (
    <aside
      className="fixed right-0 top-0 bottom-0 z-40 flex flex-col bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden"
      style={{ width: 320 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-fuchsia-600 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">AI Copilot</h3>
          </div>
          <span className="flex items-center gap-1 text-[10px] text-purple-600 bg-purple-50 dark:bg-purple-900/20 px-1.5 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
            Online
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          {hasMessages && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-gray-400 hover:text-gray-600"
              onClick={clearChat}
              title="Chat wissen"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-gray-400 hover:text-gray-600"
            onClick={onClose}
            title="Sluiten"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {!hasMessages ? (
          <div className="p-4 space-y-5">
            {/* Welcome */}
            <div className="flex flex-col items-center text-center pt-4 pb-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center mb-3">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                Hallo! Ik ben uw AI Copilot
              </h4>
              <p className="text-xs text-gray-500 mt-1 max-w-[220px]">
                Ik help u met overzicht van uw projecten en programma's
              </p>
            </div>

            {/* Suggestions */}
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Suggesties</p>
              <div className="space-y-2">
                {SUGGESTIONS.map((sug) => (
                  <button
                    key={sug.title}
                    onClick={() => sendMessage(sug.desc)}
                    className="w-full flex items-start gap-3 p-2.5 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center flex-shrink-0">
                      <sug.icon className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 dark:text-white">{sug.title}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">{sug.desc}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-400 mt-0.5 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Snelle Acties</p>
              <div className="space-y-1">
                {QUICK_PROMPTS.map((qp) => (
                  <button
                    key={qp.label}
                    onClick={() => sendMessage(qp.prompt)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                  >
                    <qp.icon className="h-4 w-4 text-purple-500 flex-shrink-0" />
                    <span className="text-xs text-gray-700 dark:text-gray-300">{qp.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="px-4 py-3 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-2.5",
                  msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                )}
              >
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sparkles className="h-3.5 w-3.5 text-white" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[85%] rounded-xl px-3 py-2 text-[13px] leading-relaxed group relative",
                    msg.role === 'user'
                      ? 'bg-purple-600 text-white rounded-br-sm'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-sm'
                  )}
                >
                  <div className="space-y-0.5">{renderContent(msg.content)}</div>
                  {msg.role === 'assistant' && (
                    <button
                      onClick={() => copyMessage(msg.id, msg.content)}
                      className="absolute -bottom-5 right-0 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-gray-400 hover:text-gray-600 flex items-center gap-0.5"
                    >
                      {copiedId === msg.id ? <Check className="h-2.5 w-2.5" /> : <Copy className="h-2.5 w-2.5" />}
                      {copiedId === msg.id ? 'Gekopieerd' : 'Kopieer'}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-xl rounded-bl-sm px-3 py-2">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Aan het nadenken...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="px-3 py-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Stel een vraag..."
            className="flex-1 h-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder:text-gray-400"
          />
          <Button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            size="sm"
            className="h-9 w-9 p-0 rounded-lg bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-[9px] text-gray-400 mt-1.5 text-center">
          ProjeXtPal AI Copilot &middot; Powered by AI
        </p>
      </div>
    </aside>
  );
}

// Fallback responses when API is not available
function getFallbackResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase();

  if (lower.includes('risico') || lower.includes('risk')) {
    return `Projectrisico Analyse:\n\n**Veelvoorkomende risico's**\n- Scope creep — Ongecontroleerde uitbreiding van projectomvang\n- Resource conflicten — Team overbelasting bij meerdere projecten\n- Technische schuld — Shortcuts die later problemen veroorzaken\n\n**Mitigatie strategieen**\n- Stel duidelijke change request procedures in\n- Plan buffers in voor onvoorziene vertragingen\n- Voer regelmatig risico-reviews uit (2-wekelijks)\n- Gebruik de RACI matrix voor duidelijke verantwoordelijkheden`;
  }

  if (lower.includes('prestatie') || lower.includes('performance') || lower.includes('voortgang')) {
    return `Projectprestaties Samenvatting:\n\n**KPI's om te monitoren**\n- Schedule Performance Index (SPI)\n- Cost Performance Index (CPI)\n- Scope voltooiingspercentage\n- Team velocity (per sprint)\n\n**Best practices**\n- Houd wekelijkse stand-ups voor voortgang\n- Gebruik earned value management (EVM)\n- Vergelijk planned vs. actual milestones\n- Rapporteer maandelijks aan stakeholders`;
  }

  if (lower.includes('planning') || lower.includes('deadline') || lower.includes('timeline')) {
    return `Planning & Timeline Advies:\n\n**Effectieve planning**\n- Gebruik work breakdown structure (WBS)\n- Identificeer het kritieke pad\n- Plan afhankelijkheden expliciet\n- Reserveer 15-20% buffer voor onvoorziene zaken\n\n**Deadline management**\n- Stel intermediaire milestones in\n- Gebruik traffic light rapportage (groen/oranje/rood)\n- Communiceer vertragingen proactief\n- Herplan in overleg met stakeholders`;
  }

  if (lower.includes('team') || lower.includes('resource') || lower.includes('belasting')) {
    return `Team & Resource Management:\n\n**Team optimalisatie**\n- Voorkom overbelasting (max 80% allocatie per persoon)\n- Balanceer expertise over projecten\n- Plan kennisoverdracht bij teamwisselingen\n\n**RACI Matrix**\n- **R**esponsible — Wie voert uit\n- **A**ccountable — Wie is eindverantwoordelijk\n- **C**onsulted — Wie wordt geraadpleegd\n- **I**nformed — Wie wordt geinformeerd`;
  }

  if (lower.includes('rapport') || lower.includes('maand')) {
    return `Maandrapportage Template:\n\n**1. Samenvatting**\n- Projectstatus (groen/oranje/rood)\n- Belangrijkste bereikte milestones\n- Komende deadlines\n\n**2. Voortgang**\n- Taken voltooid vs. gepland\n- Budget besteed vs. begroot\n- Risico's en issues\n\n**3. Actiepunten**\n- Openstaande beslissingen\n- Escalaties\n- Volgende stappen`;
  }

  return `Bedankt voor uw vraag! Hier zijn enkele dingen waar ik u mee kan helpen:\n\n- **"Project analyse"** — Status en verbeterpunten\n- **"Risico scan"** — Risico-identificatie en mitigatie\n- **"Planning advies"** — Timeline en deadlines\n- **"Team inzichten"** — Resourceverdeling en belasting\n- **"Maandrapportage"** — Voortgangsrapport\n\nProbeer een van deze suggesties!`;
}
