import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Send, 
  Trash2, 
  User,
  Bot,
  Loader2,
  Sparkles,
  MessageSquare,
  Clock,
  Search,
  MoreHorizontal,
  Copy,
  Check,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
  FolderKanban,
  Building2,
  ListChecks,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import DynamicForm from "@/components/chat/DynamicForm";
import { AIMessageRenderer } from "@/components/AIMessageRenderer";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

// Brand colors
const BRAND = {
  purple: '#8B5CF6',
  purpleDark: '#7C3AED',
  pink: '#D946EF',
  pinkLight: '#F0ABFC',
  green: '#22C55E',
  blue: '#3B82F6',
};

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  formSchema?: any;
}

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  updatedAt: Date;
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

// Quick action suggestions
const quickActions = [
  { icon: FolderKanban, label: "Create a new project", prompt: "Create a new project" },
  { icon: Building2, label: "Analyze my portfolio", prompt: "Analyze my current portfolio and provide insights" },
  { icon: ListChecks, label: "List all projects", prompt: "List all my projects with their status" },
  { icon: BarChart3, label: "Generate report", prompt: "Generate an executive summary of my programs" },
];

export default function AIAssistant() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [activeForm, setActiveForm] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Get current language from context
  const { language } = useLanguage();

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (currentConversation) {
      fetchMessages(currentConversation);
    }
  }, [currentConversation]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const fetchConversations = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<{ chats: ChatResponse[] }>('/bot/chats/');
      const chats = response.chats || [];
      const convs: Conversation[] = chats.map((chat: ChatResponse) => ({
        id: chat.id.toString(),
        title: chat.title || "New conversation",
        lastMessage: "",
        updatedAt: new Date(chat.updated_at),
      }));
      setConversations(convs);
      if (convs.length > 0 && !currentConversation) {
        setCurrentConversation(convs[0].id);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (chatId: string) => {
    try {
      const response = await api.get<ChatResponse>(`/bot/chats/${chatId}/`);
      const msgs: Message[] = (response.messages || []).map((msg) => {
        // Check if message contains a form schema
        let formSchema = null;
        if (msg.original_ai_response) {
          try {
            const parsed = JSON.parse(msg.original_ai_response);
            if (parsed.form_type) {
              formSchema = parsed;
            }
          } catch {}
        }
        
        return {
          id: msg.id.toString(),
          role: msg.role as "user" | "assistant",
          content: msg.content,
          timestamp: new Date(msg.created_at),
          formSchema,
        };
      });
      setMessages(msgs);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

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
      let chatId = currentConversation;

      if (!chatId) {
        const newChat = await api.post<{ id: string; title: string }>('/bot/chats/', {
          title: messageContent.substring(0, 50),
        });
        chatId = newChat.id.toString();
        setCurrentConversation(chatId);
        setConversations((prev) => [
          {
            id: chatId!,
            title: messageContent.substring(0, 50),
            lastMessage: "",
            updatedAt: new Date(),
          },
          ...prev,
        ]);
      }

      const response = await api.post<SendMessageResponse>(
        `/bot/chats/${chatId}/send_message/`,
        { message: messageContent, language: language }
      );

      // Check if response contains a form schema
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

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === chatId
            ? { ...conv, lastMessage: aiResponse.content, updatedAt: new Date() }
            : conv
        )
      );
    } catch (error: any) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "## Error\n\nSorry, I encountered an error processing your request. Please try again.",
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
      content: "Form cancelled. How else can I help you?",
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, cancelMessage]);
  };

  const handleNewChat = async () => {
    try {
      const newChat = await api.post<{ id: string; title: string }>('/bot/chats/', {
        title: "New conversation",
      });
      const newConv: Conversation = {
        id: newChat.id.toString(),
        title: "New conversation",
        lastMessage: "",
        updatedAt: new Date(),
      };
      setConversations([newConv, ...conversations]);
      setCurrentConversation(newConv.id);
      setMessages([]);
      setActiveForm(null);
      
      // Focus input
      setTimeout(() => inputRef.current?.focus(), 100);
    } catch (error) {
      console.error("Error creating new chat:", error);
      toast.error("Failed to create new chat");
    }
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      await api.delete(`/bot/chats/${id}/`);
      setConversations(conversations.filter((c) => c.id !== id));
      if (currentConversation === id) {
        const remaining = conversations.filter((c) => c.id !== id);
        if (remaining.length > 0) {
          setCurrentConversation(remaining[0].id);
        } else {
          setCurrentConversation(null);
          setMessages([]);
        }
      }
      toast.success("Conversation deleted");
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast.error("Failed to delete conversation");
    }
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard");
  };

  const handleFeedback = (type: 'positive' | 'negative') => {
    toast.success(type === 'positive' ? "Thanks for the feedback!" : "We'll work to improve");
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / 86400000);

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  // Filter conversations by search
  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full bg-background">
      {/* Conversations Sidebar */}
      <div className="w-80 border-r border-border bg-card flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-border space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Conversations</h2>
            <Button
              size="sm"
              onClick={handleNewChat}
              style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})` }}
              className="text-white"
            >
              <Plus className="h-4 w-4 mr-1" />
              New Chat
            </Button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="pl-9 h-9"
            />
          </div>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {isLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center p-8">
                <MessageSquare className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? "No matching conversations" : "No conversations yet"}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={handleNewChat}
                >
                  Start a new chat
                </Button>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <Card
                  key={conv.id}
                  className={cn(
                    "p-3 cursor-pointer transition-all hover:shadow-md group relative border-0",
                    currentConversation === conv.id
                      ? "bg-primary/10 ring-1 ring-primary/30"
                      : "bg-transparent hover:bg-accent/50"
                  )}
                  onClick={() => setCurrentConversation(conv.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <h3 className="text-sm font-medium text-foreground truncate">
                          {conv.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatTimestamp(conv.updatedAt)}
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteConversation(conv.id);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="h-16 border-b border-border bg-card/50 backdrop-blur px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="p-2.5 rounded-xl shadow-sm"
              style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})` }}
            >
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                ProjeXtPal Assistant
              </h1>
              <p className="text-xs text-muted-foreground">AI-powered project management</p>
            </div>
          </div>
          <Badge 
            variant="secondary" 
            className="text-xs"
            style={{ backgroundColor: `${BRAND.green}20`, color: BRAND.green }}
          >
            Online
          </Badge>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1">
          <div className="p-6">
            <div className="max-w-4xl mx-auto space-y-1">
              {messages.length === 0 ? (
                /* Welcome Screen */
                <div className="text-center py-12">
                  <div 
                    className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})` }}
                  >
                    <Sparkles className="h-10 w-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Welcome to ProjeXtPal AI</h2>
                  <p className="text-muted-foreground max-w-md mx-auto mb-8">
                    I'm your intelligent project management assistant. Ask me anything about your 
                    projects, programs, or portfolio.
                  </p>
                  
                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
                    {quickActions.map((action) => (
                      <Button
                        key={action.label}
                        variant="outline"
                        className="h-auto py-4 px-4 flex flex-col items-center gap-2 hover:bg-primary/5 hover:border-primary/30 transition-all"
                        onClick={() => handleSendMessage(action.prompt)}
                      >
                        <action.icon className="h-5 w-5 text-primary" />
                        <span className="text-xs font-medium">{action.label}</span>
                      </Button>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 mt-8 text-xs text-muted-foreground">
                    <Lightbulb className="h-4 w-4" />
                    <span>Tip: You can ask me to create projects, analyze data, or generate reports</span>
                  </div>
                </div>
              ) : (
                /* Messages */
                messages.map((message) => (
                  <AIMessageRenderer
                    key={message.id}
                    message={{
                      id: message.id,
                      role: message.role,
                      content: message.content,
                    }}
                    onCopy={handleCopyMessage}
                    onFeedback={handleFeedback}
                    showActions={message.role === 'assistant'}
                  />
                ))
              )}
              
              {/* Active Form */}
              {activeForm && (
                <div className="flex mb-6">
                  <div className="flex items-start gap-3 max-w-[90%]">
                    <div 
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
                      style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})` }}
                    >
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <DynamicForm
                      schema={activeForm}
                      onSubmit={handleFormSubmit}
                      onCancel={handleFormCancel}
                    />
                  </div>
                </div>
              )}
              
              {/* Loading indicator */}
              {isSending && (
                <div className="flex mb-6">
                  <div className="flex items-start gap-3">
                    <div 
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
                      style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})` }}
                    >
                      <Loader2 className="h-5 w-5 text-white animate-spin" />
                    </div>
                    <Card className="border-0 shadow-sm bg-card/50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                          <span className="text-sm text-muted-foreground ml-2">Thinking...</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
              
              <div ref={scrollRef} />
            </div>
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-border bg-card/50 backdrop-blur p-4">
          <div className="max-w-4xl mx-auto">
            <div className="relative flex gap-2">
              <div className="relative flex-1">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && !isSending && !activeForm && handleSendMessage()}
                  placeholder="Ask about your projects, programs, or portfolio..."
                  disabled={isSending || !!activeForm}
                  className="h-12 pr-4 text-base bg-background border-border focus:border-primary focus:ring-primary/20"
                />
              </div>
              <Button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isSending || !!activeForm}
                className="h-12 px-6"
                style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})` }}
              >
                {isSending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
            <p className="text-xs text-center text-muted-foreground mt-2">
              AI responses may not always be accurate. Verify important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}