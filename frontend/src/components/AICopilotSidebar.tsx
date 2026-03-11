import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Sparkles,
  Loader2,
  X,
  Maximize2,
  Minimize2,
  FolderKanban,
  Building2,
  ListChecks,
  BarChart3,
  AlertTriangle,
  TrendingUp,
  ChevronRight,
  Plus,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import DynamicForm from "@/components/chat/DynamicForm";
import { AIMessageRenderer } from "@/components/AIMessageRenderer";
import { useCopilot } from "@/contexts/CopilotContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  formSchema?: any;
}

interface ChatResponse {
  id: number;
  title: string;
  updated_at: string;
  messages: Array<{
    id: number;
    role: string;
    content: string;
    created_at: string;
    original_ai_response?: string;
  }>;
}

interface SendMessageResponse {
  user_message: { id: number; content: string };
  ai_response: { id: number; content: string; original_ai_response?: string };
}

// Suggestions data
const suggestionsData = {
  en: [
    {
      icon: AlertTriangle,
      title: "Project risks",
      description: "Analyze current project risks and suggest mitigations.",
    },
    {
      icon: TrendingUp,
      title: "Performance report",
      description: "Generate a summary of project performance metrics.",
    },
  ],
  nl: [
    {
      icon: AlertTriangle,
      title: "Projectrisico's",
      description: "Analyseer huidige projectrisico's en stel mitigaties voor.",
    },
    {
      icon: TrendingUp,
      title: "Prestatierapport",
      description: "Genereer een samenvatting van projectprestaties.",
    },
  ],
};

// Quick actions
const quickActionsData = {
  en: [
    { icon: BarChart3, label: "Monthly report" },
    { icon: TrendingUp, label: "Portfolio analysis" },
    { icon: AlertTriangle, label: "Risk scan" },
  ],
  nl: [
    { icon: BarChart3, label: "Maandrapportage" },
    { icon: TrendingUp, label: "Portfolio analyse" },
    { icon: AlertTriangle, label: "Risico scan" },
  ],
};

export default function AICopilotSidebar() {
  const { isOpen, close } = useCopilot();
  const { language } = useLanguage();
  const { pt } = usePageTranslations();
  const [expanded, setExpanded] = useState(false);

  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [activeForm, setActiveForm] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = language === "nl" ? suggestionsData.nl : suggestionsData.en;
  const quickActions = language === "nl" ? quickActionsData.nl : quickActionsData.en;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSendMessage = async (customMessage?: string) => {
    const messageContent = customMessage || inputValue;
    if (!messageContent.trim() || isSending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageContent,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsSending(true);
    setActiveForm(null);

    try {
      let chatId = currentChatId;

      if (!chatId) {
        const newChat = await api.post<{ id: string; title: string }>("/bot/chats/", {
          title: messageContent.substring(0, 50),
        });
        chatId = newChat.id.toString();
        setCurrentChatId(chatId);
      }

      const response = await api.post<SendMessageResponse>(
        `/bot/chats/${chatId}/send_message/`,
        { message: messageContent, language }
      );

      let formSchema = null;
      if (response.ai_response?.original_ai_response) {
        try {
          const parsed = JSON.parse(response.ai_response.original_ai_response);
          if (parsed.form_type && parsed.fields) {
            formSchema = parsed;
            setActiveForm(parsed);
          }
        } catch {}
      }

      const aiResponse: Message = {
        id: (response.ai_response?.id || Date.now() + 1).toString(),
        role: "assistant",
        content: response.ai_response?.content || "Sorry, I could not process your request.",
        timestamp: new Date(),
        formSchema,
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch (error: any) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  const handleFormSubmit = async (result: any) => {
    setActiveForm(null);
    const successMessage: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: `## Success\n\n${result.message || "Operation completed successfully!"}`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, successMessage]);
  };

  const handleFormCancel = () => {
    setActiveForm(null);
    const cancelMessage: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: language === "nl" ? "Formulier geannuleerd. Hoe kan ik verder helpen?" : "Form cancelled. How else can I help you?",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, cancelMessage]);
  };

  const handleNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
    setActiveForm(null);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success(language === "nl" ? "Gekopieerd" : "Copied to clipboard");
  };

  const handleFeedback = (type: "positive" | "negative") => {
    toast.success(type === "positive" ? "Thanks for the feedback!" : "We'll work to improve");
  };

  if (!isOpen) return null;

  const sidebarWidth = expanded ? "w-[600px]" : "w-[380px]";

  return (
    <div
      className={cn(
        "h-full border-l border-border bg-card flex flex-col transition-all duration-300 relative",
        sidebarWidth
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-foreground">AI Copilot</span>
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 py-0 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0"
              >
                Online
              </Badge>
            </div>
            <span className="text-[11px] text-muted-foreground">ProjeXtPal AI</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => setExpanded(!expanded)}
            title={expanded ? "Minimize" : "Expand"}
          >
            {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={close}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {messages.length === 0 ? (
            /* Welcome / Empty State */
            <div className="space-y-6">
              {/* Welcome Icon & Text */}
              <div className="text-center pt-6 pb-2">
                <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-1">
                  {language === "nl" ? "Hallo! Ik ben uw AI Copilot" : "Hello! I'm your AI Copilot"}
                </h3>
                <p className="text-xs text-muted-foreground max-w-[260px] mx-auto">
                  {language === "nl"
                    ? "Ik help u met overzicht van uw projecten en programma's"
                    : "I help you with insights on your projects and programs"}
                </p>
              </div>

              {/* Suggestions */}
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  {language === "nl" ? "Suggesties" : "Suggestions"}
                </p>
                <div className="space-y-2">
                  {suggestions.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(item.description)}
                      className="w-full flex items-start gap-3 p-3 rounded-lg border border-border bg-background hover:bg-accent/50 hover:border-primary/20 transition-all text-left group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <item.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{item.title}</p>
                        <p className="text-[11px] text-muted-foreground line-clamp-2">{item.description}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors mt-1 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  {language === "nl" ? "Snelle Acties" : "Quick Actions"}
                </p>
                <div className="space-y-1.5">
                  {quickActions.map((action, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(action.label)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent/50 transition-colors text-left"
                    >
                      <action.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Messages */
            <div className="space-y-1">
              {messages.map((message) => (
                <AIMessageRenderer
                  key={message.id}
                  message={{
                    id: message.id,
                    role: message.role,
                    content: message.content,
                  }}
                  onCopy={handleCopyMessage}
                  onFeedback={handleFeedback}
                  showActions={message.role === "assistant"}
                />
              ))}

              {/* Active Form */}
              {activeForm && (
                <div className="mt-3">
                  <DynamicForm
                    schema={activeForm}
                    onSubmit={handleFormSubmit}
                    onCancel={handleFormCancel}
                  />
                </div>
              )}

              {/* Loading indicator */}
              {isSending && (
                <div className="flex items-start gap-2 mt-3">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                    <Loader2 className="h-4 w-4 text-white animate-spin" />
                  </div>
                  <div className="bg-muted/50 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                      <span className="text-xs text-muted-foreground ml-1">
                        {language === "nl" ? "Denken..." : "Thinking..."}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={scrollRef} />
            </div>
          )}
        </div>
      </ScrollArea>

      {/* New Chat Button (when messages exist) */}
      {messages.length > 0 && (
        <div className="px-4 pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNewChat}
            className="w-full text-xs text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            {language === "nl" ? "Nieuw gesprek" : "New conversation"}
          </Button>
        </div>
      )}

      {/* Input Area */}
      <div className="p-3 border-t border-border bg-card">
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && !isSending && !activeForm && handleSendMessage()}
            placeholder={language === "nl" ? "Stel een vraag..." : "Ask a question..."}
            disabled={isSending || !!activeForm}
            className="h-10 text-sm bg-background"
          />
          <Button
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isSending || !!activeForm}
            size="icon"
            className="h-10 w-10 flex-shrink-0 bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
          >
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        <p className="text-[10px] text-center text-muted-foreground mt-1.5">
          ProjeXtPal AI &middot; {language === "nl" ? "Aangedreven door gespecialiseerde agents" : "Powered by specialized agents"}
        </p>
      </div>
    </div>
  );
}
