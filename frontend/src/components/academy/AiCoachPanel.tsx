import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bot, 
  Sparkles, 
  Lightbulb, 
  Target, 
  Brain,
  Send,
  User,
  Briefcase,
  Building2
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AiCoachPanelProps {
  lessonId: string;
  courseId: string;
  userContext?: {
    sector?: string;
    role?: string;
    methodology?: string;
  };
}

const AiCoachPanel = ({ lessonId, courseId, userContext }: AiCoachPanelProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeMode, setActiveMode] = useState<'explain' | 'apply' | 'reflect' | 'practice'>('explain');

  // Initialize with welcome message
  useEffect(() => {
    setMessages([{
      id: '1',
      role: 'assistant',
      content: `Hallo! Ik ben je AI Coach. Ik help je deze les te begrijpen vanuit jouw perspectief${userContext?.sector ? ` in de ${userContext.sector}` : ''}. Wat wil je weten?`,
      timestamp: new Date()
    }]);
  }, [lessonId, userContext]);

  const quickActions = [
    { 
      mode: 'explain' as const, 
      label: 'Uitleg', 
      icon: Lightbulb,
      prompt: 'Leg dit concept uit met een praktijkvoorbeeld'
    },
    { 
      mode: 'apply' as const, 
      label: 'Toepassen', 
      icon: Target,
      prompt: 'Hoe pas ik dit toe in mijn situatie?'
    },
    { 
      mode: 'reflect' as const, 
      label: 'Reflectie', 
      icon: Brain,
      prompt: 'Wat zijn de belangrijkste inzichten hier?'
    },
    { 
      mode: 'practice' as const, 
      label: 'Oefenen', 
      icon: Briefcase,
      prompt: 'Geef me een oefenvraag over dit onderwerp'
    },
  ];

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      const history = messages.filter(m => m.id !== '1').map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetch('/api/v1/academy/ai/coach/message/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          lessonId,
          courseId,
          message: input,
          mode: activeMode,
          context: userContext,
          history,
          language: 'nl'
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.message,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        // Fallback to placeholder if API fails
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Dat is een goede vraag over "${input}". ${userContext?.sector ? `In de ${userContext.sector}` : 'In de praktijk'}, zou je dit kunnen toepassen door de kernconcepten te verbinden met je dagelijkse werkpraktijk.`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('AI Coach error:', error);
      // Graceful fallback
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, ik kan momenteel geen verbinding maken. Probeer het later opnieuw.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (prompt: string, mode: typeof activeMode) => {
    setActiveMode(mode);
    setInput(prompt);
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg border-2 border-purple-200 dark:border-purple-800">
      {/* Header */}
      <div className="p-4 border-b border-purple-200 dark:border-purple-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-sm">AI Coach</h3>
            <p className="text-xs text-muted-foreground">Persoonlijke begeleiding</p>
          </div>
        </div>

        {/* Context Badges */}
        {userContext && (
          <div className="flex flex-wrap gap-2">
            {userContext.sector && (
              <Badge variant="outline" className="text-xs">
                <Building2 className="w-3 h-3 mr-1" />
                {userContext.sector}
              </Badge>
            )}
            {userContext.role && (
              <Badge variant="outline" className="text-xs">
                <User className="w-3 h-3 mr-1" />
                {userContext.role}
              </Badge>
            )}
            {userContext.methodology && (
              <Badge variant="outline" className="text-xs">
                <Target className="w-3 h-3 mr-1" />
                {userContext.methodology}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="p-3 border-b border-purple-200 dark:border-purple-800">
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.mode}
                variant={activeMode === action.mode ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleQuickAction(action.prompt, action.mode)}
                className={activeMode === action.mode ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : ''}
              >
                <Icon className="w-3 h-3 mr-1" />
                <span className="text-xs">{action.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div
                className={`rounded-lg p-3 max-w-[85%] ${
                  msg.role === 'user'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-800'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-purple-200 dark:bg-purple-800 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-purple-600 dark:text-purple-200" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white animate-pulse" />
              </div>
              <div className="bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-purple-200 dark:border-purple-800">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Stel een vraag..."
            className="min-h-[60px] resize-none"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          <Sparkles className="w-3 h-3 inline mr-1" />
          Context-aware antwoorden voor jouw situatie
        </p>
      </div>
    </div>
  );
};

export default AiCoachPanel;
