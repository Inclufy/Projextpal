import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Sparkles,
  User,
  Lightbulb,
  Target,
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  BarChart3,
  Users,
  Calendar,
  DollarSign,
  Shield,
  Zap,
  FileText,
  Clock,
  Star,
  ArrowRight,
  Info,
  ListChecks,
  Rocket,
  Brain,
  Building2,
  FolderKanban,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  MessageSquare,
  Code,
  Quote,
  List,
  Hash,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================
// BRAND COLORS
// ============================================
const BRAND = {
  purple: '#8B5CF6',
  purpleDark: '#7C3AED',
  pink: '#D946EF',
  pinkLight: '#F0ABFC',
  green: '#22C55E',
  blue: '#3B82F6',
  orange: '#F59E0B',
};

// ============================================
// TYPES
// ============================================
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

interface AIMessageRendererProps {
  message: Message;
  onCopy?: (content: string) => void;
  onRegenerate?: () => void;
  onFeedback?: (type: 'positive' | 'negative') => void;
  showActions?: boolean;
}

// ============================================
// SECTION DETECTION
// ============================================
const sectionConfig: Record<string, { icon: React.ElementType; color: string; bgColor: string }> = {
  'executive': { icon: Brain, color: 'text-purple-600', bgColor: 'bg-purple-50 dark:bg-purple-950/30' },
  'summary': { icon: FileText, color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-950/30' },
  'health': { icon: CheckCircle2, color: 'text-green-600', bgColor: 'bg-green-50 dark:bg-green-950/30' },
  'highlight': { icon: Star, color: 'text-amber-600', bgColor: 'bg-amber-50 dark:bg-amber-950/30' },
  'key': { icon: Lightbulb, color: 'text-yellow-600', bgColor: 'bg-yellow-50 dark:bg-yellow-950/30' },
  'risk': { icon: AlertTriangle, color: 'text-red-600', bgColor: 'bg-red-50 dark:bg-red-950/30' },
  'concern': { icon: AlertTriangle, color: 'text-orange-600', bgColor: 'bg-orange-50 dark:bg-orange-950/30' },
  'recommendation': { icon: Target, color: 'text-indigo-600', bgColor: 'bg-indigo-50 dark:bg-indigo-950/30' },
  'action': { icon: Rocket, color: 'text-orange-600', bgColor: 'bg-orange-50 dark:bg-orange-950/30' },
  'budget': { icon: DollarSign, color: 'text-emerald-600', bgColor: 'bg-emerald-50 dark:bg-emerald-950/30' },
  'timeline': { icon: Calendar, color: 'text-cyan-600', bgColor: 'bg-cyan-50 dark:bg-cyan-950/30' },
  'progress': { icon: TrendingUp, color: 'text-teal-600', bgColor: 'bg-teal-50 dark:bg-teal-950/30' },
  'team': { icon: Users, color: 'text-violet-600', bgColor: 'bg-violet-50 dark:bg-violet-950/30' },
  'status': { icon: BarChart3, color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-950/30' },
  'next': { icon: ArrowRight, color: 'text-pink-600', bgColor: 'bg-pink-50 dark:bg-pink-950/30' },
  'step': { icon: ListChecks, color: 'text-indigo-600', bgColor: 'bg-indigo-50 dark:bg-indigo-950/30' },
  'overview': { icon: Info, color: 'text-slate-600', bgColor: 'bg-slate-50 dark:bg-slate-950/30' },
  'program': { icon: Building2, color: 'text-purple-600', bgColor: 'bg-purple-50 dark:bg-purple-950/30' },
  'project': { icon: FolderKanban, color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-950/30' },
  'metric': { icon: BarChart3, color: 'text-cyan-600', bgColor: 'bg-cyan-50 dark:bg-cyan-950/30' },
  'conclusion': { icon: CheckCircle2, color: 'text-green-600', bgColor: 'bg-green-50 dark:bg-green-950/30' },
  'default': { icon: MessageSquare, color: 'text-slate-600', bgColor: 'bg-slate-50 dark:bg-slate-950/30' },
};

function detectSectionType(title: string): string {
  const titleLower = title.toLowerCase();
  for (const keyword of Object.keys(sectionConfig)) {
    if (keyword !== 'default' && titleLower.includes(keyword)) {
      return keyword;
    }
  }
  return 'default';
}

// ============================================
// MARKDOWN PARSING
// ============================================
interface ParsedBlock {
  type: 'header' | 'paragraph' | 'list' | 'code' | 'quote' | 'divider';
  level?: number;
  content: string;
  items?: string[];
  listType?: 'bullet' | 'numbered';
}

function parseMarkdown(text: string): ParsedBlock[] {
  const lines = text.split('\n');
  const blocks: ParsedBlock[] = [];
  let currentList: { items: string[]; type: 'bullet' | 'numbered' } | null = null;
  let codeBlock: string[] | null = null;
  let quoteBlock: string[] | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Code block
    if (trimmed.startsWith('```')) {
      if (codeBlock === null) {
        codeBlock = [];
      } else {
        blocks.push({ type: 'code', content: codeBlock.join('\n') });
        codeBlock = null;
      }
      continue;
    }

    if (codeBlock !== null) {
      codeBlock.push(line);
      continue;
    }

    // Quote block
    if (trimmed.startsWith('>')) {
      const quoteContent = trimmed.substring(1).trim();
      if (quoteBlock === null) {
        quoteBlock = [quoteContent];
      } else {
        quoteBlock.push(quoteContent);
      }
      continue;
    } else if (quoteBlock !== null) {
      blocks.push({ type: 'quote', content: quoteBlock.join('\n') });
      quoteBlock = null;
    }

    // Empty line - flush current list
    if (!trimmed) {
      if (currentList) {
        blocks.push({ type: 'list', content: '', items: currentList.items, listType: currentList.type });
        currentList = null;
      }
      continue;
    }

    // Divider
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      if (currentList) {
        blocks.push({ type: 'list', content: '', items: currentList.items, listType: currentList.type });
        currentList = null;
      }
      blocks.push({ type: 'divider', content: '' });
      continue;
    }

    // Headers
    const headerMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (headerMatch) {
      if (currentList) {
        blocks.push({ type: 'list', content: '', items: currentList.items, listType: currentList.type });
        currentList = null;
      }
      blocks.push({ type: 'header', level: headerMatch[1].length, content: headerMatch[2] });
      continue;
    }

    // Bullet list
    if (trimmed.match(/^[-*•]\s+/)) {
      const itemContent = trimmed.replace(/^[-*•]\s+/, '');
      if (currentList && currentList.type === 'bullet') {
        currentList.items.push(itemContent);
      } else {
        if (currentList) {
          blocks.push({ type: 'list', content: '', items: currentList.items, listType: currentList.type });
        }
        currentList = { items: [itemContent], type: 'bullet' };
      }
      continue;
    }

    // Numbered list
    const numberedMatch = trimmed.match(/^(\d+)[.)]\s+(.+)$/);
    if (numberedMatch) {
      const itemContent = numberedMatch[2];
      if (currentList && currentList.type === 'numbered') {
        currentList.items.push(itemContent);
      } else {
        if (currentList) {
          blocks.push({ type: 'list', content: '', items: currentList.items, listType: currentList.type });
        }
        currentList = { items: [itemContent], type: 'numbered' };
      }
      continue;
    }

    // Regular paragraph
    if (currentList) {
      blocks.push({ type: 'list', content: '', items: currentList.items, listType: currentList.type });
      currentList = null;
    }
    blocks.push({ type: 'paragraph', content: trimmed });
  }

  // Flush remaining blocks
  if (currentList) {
    blocks.push({ type: 'list', content: '', items: currentList.items, listType: currentList.type });
  }
  if (quoteBlock) {
    blocks.push({ type: 'quote', content: quoteBlock.join('\n') });
  }
  if (codeBlock) {
    blocks.push({ type: 'code', content: codeBlock.join('\n') });
  }

  return blocks;
}

// ============================================
// INLINE FORMATTING
// ============================================
function formatInlineText(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  // Regex patterns for inline formatting
  const patterns = [
    { regex: /\*\*(.+?)\*\*/g, render: (content: string, k: number) => <strong key={k} className="font-semibold text-foreground">{content}</strong> },
    { regex: /\*(.+?)\*/g, render: (content: string, k: number) => <em key={k} className="italic">{content}</em> },
    { regex: /`([^`]+)`/g, render: (content: string, k: number) => <code key={k} className="px-1.5 py-0.5 bg-muted rounded text-sm font-mono text-primary">{content}</code> },
    { regex: /\[([^\]]+)\]\(([^)]+)\)/g, render: (content: string, k: number, url?: string) => <a key={k} href={url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">{content}<ExternalLink className="h-3 w-3" /></a> },
  ];

  // Simple approach: process text sequentially
  while (remaining.length > 0) {
    let earliestMatch: { index: number; length: number; rendered: React.ReactNode } | null = null;

    // Bold
    const boldMatch = /\*\*(.+?)\*\*/.exec(remaining);
    if (boldMatch && boldMatch.index !== undefined) {
      if (!earliestMatch || boldMatch.index < earliestMatch.index) {
        earliestMatch = {
          index: boldMatch.index,
          length: boldMatch[0].length,
          rendered: <strong key={key++} className="font-semibold text-foreground">{boldMatch[1]}</strong>,
        };
      }
    }

    // Italic (not bold)
    const italicMatch = /(?<!\*)\*([^*]+?)\*(?!\*)/.exec(remaining);
    if (italicMatch && italicMatch.index !== undefined) {
      if (!earliestMatch || italicMatch.index < earliestMatch.index) {
        earliestMatch = {
          index: italicMatch.index,
          length: italicMatch[0].length,
          rendered: <em key={key++} className="italic">{italicMatch[1]}</em>,
        };
      }
    }

    // Code
    const codeMatch = /`([^`]+)`/.exec(remaining);
    if (codeMatch && codeMatch.index !== undefined) {
      if (!earliestMatch || codeMatch.index < earliestMatch.index) {
        earliestMatch = {
          index: codeMatch.index,
          length: codeMatch[0].length,
          rendered: <code key={key++} className="px-1.5 py-0.5 bg-muted rounded text-sm font-mono text-primary">{codeMatch[1]}</code>,
        };
      }
    }

    // Link
    const linkMatch = /\[([^\]]+)\]\(([^)]+)\)/.exec(remaining);
    if (linkMatch && linkMatch.index !== undefined) {
      if (!earliestMatch || linkMatch.index < earliestMatch.index) {
        earliestMatch = {
          index: linkMatch.index,
          length: linkMatch[0].length,
          rendered: <a key={key++} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">{linkMatch[1]}<ExternalLink className="h-3 w-3" /></a>,
        };
      }
    }

    if (earliestMatch) {
      // Add text before match
      if (earliestMatch.index > 0) {
        parts.push(<span key={key++}>{remaining.substring(0, earliestMatch.index)}</span>);
      }
      // Add formatted text
      parts.push(earliestMatch.rendered);
      // Continue with remaining text
      remaining = remaining.substring(earliestMatch.index + earliestMatch.length);
    } else {
      // No more matches, add remaining text
      parts.push(<span key={key++}>{remaining}</span>);
      break;
    }
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>;
}

// ============================================
// BLOCK RENDERERS
// ============================================
function HeaderBlock({ level, content }: { level: number; content: string }) {
  const sectionType = detectSectionType(content);
  const config = sectionConfig[sectionType];
  const Icon = config.icon;

  if (level <= 2) {
    return (
      <div className={cn("flex items-center gap-3 p-3 rounded-lg mt-4 mb-2", config.bgColor)}>
        <div className={cn("p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm", config.color)}>
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="font-semibold text-lg">{formatInlineText(content)}</h3>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 mt-3 mb-1">
      <Icon className={cn("h-4 w-4", config.color)} />
      <h4 className="font-medium">{formatInlineText(content)}</h4>
    </div>
  );
}

function ListBlock({ items, listType }: { items: string[]; listType: 'bullet' | 'numbered' }) {
  return (
    <div className="space-y-2 my-2 pl-1">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-start gap-3">
          {listType === 'numbered' ? (
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center">
              {idx + 1}
            </span>
          ) : (
            <span className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-2" />
          )}
          <span className="text-sm text-foreground/90 leading-relaxed flex-1">
            {formatInlineText(item)}
          </span>
        </div>
      ))}
    </div>
  );
}

function CodeBlock({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-3 rounded-lg overflow-hidden border bg-slate-950 dark:bg-slate-900">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Code className="h-4 w-4 text-slate-400" />
          <span className="text-xs text-slate-400">Code</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-7 px-2 text-slate-400 hover:text-white"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        </Button>
      </div>
      <pre className="p-4 overflow-x-auto">
        <code className="text-sm text-slate-100 font-mono">{content}</code>
      </pre>
    </div>
  );
}

function QuoteBlock({ content }: { content: string }) {
  return (
    <div className="my-3 pl-4 border-l-4 border-primary/30 bg-primary/5 rounded-r-lg py-3 pr-4">
      <div className="flex items-start gap-2">
        <Quote className="h-4 w-4 text-primary/50 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-foreground/80 italic">{formatInlineText(content)}</p>
      </div>
    </div>
  );
}

function ParagraphBlock({ content }: { content: string }) {
  return (
    <p className="text-sm text-foreground/90 leading-relaxed my-2">
      {formatInlineText(content)}
    </p>
  );
}

// ============================================
// USER MESSAGE
// ============================================
function UserMessage({ content }: { content: string }) {
  return (
    <div className="flex justify-end mb-4">
      <div className="flex items-start gap-3 max-w-[80%]">
        <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-3">
          <p className="text-sm">{content}</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
          <User className="h-4 w-4 text-primary" />
        </div>
      </div>
    </div>
  );
}

// ============================================
// ASSISTANT MESSAGE
// ============================================
function AssistantMessage({ 
  content, 
  onCopy, 
  onRegenerate, 
  onFeedback,
  showActions = true 
}: { 
  content: string;
  onCopy?: (content: string) => void;
  onRegenerate?: () => void;
  onFeedback?: (type: 'positive' | 'negative') => void;
  showActions?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const blocks = useMemo(() => parseMarkdown(content), [content]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    onCopy?.(content);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex mb-6">
      <div className="flex items-start gap-3 max-w-[90%]">
        {/* AI Avatar */}
        <div 
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
          style={{ background: `linear-gradient(135deg, ${BRAND.purple}, ${BRAND.pink})` }}
        >
          <Sparkles className="h-5 w-5 text-white" />
        </div>

        {/* Message Content */}
        <div className="flex-1">
          <Card className="border-0 shadow-sm bg-card/50">
            <CardContent className="p-4">
              {/* Render blocks */}
              <div className="space-y-1">
                {blocks.map((block, idx) => {
                  switch (block.type) {
                    case 'header':
                      return <HeaderBlock key={idx} level={block.level || 2} content={block.content} />;
                    case 'list':
                      return <ListBlock key={idx} items={block.items || []} listType={block.listType || 'bullet'} />;
                    case 'code':
                      return <CodeBlock key={idx} content={block.content} />;
                    case 'quote':
                      return <QuoteBlock key={idx} content={block.content} />;
                    case 'divider':
                      return <hr key={idx} className="my-4 border-border" />;
                    case 'paragraph':
                    default:
                      return <ParagraphBlock key={idx} content={block.content} />;
                  }
                })}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          {showActions && (
            <div className="flex items-center gap-1 mt-2 ml-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-7 px-2 text-muted-foreground hover:text-foreground"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 mr-1" />
                ) : (
                  <Copy className="h-3.5 w-3.5 mr-1" />
                )}
                <span className="text-xs">{copied ? 'Copied' : 'Copy'}</span>
              </Button>
              
              {onRegenerate && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRegenerate}
                  className="h-7 px-2 text-muted-foreground hover:text-foreground"
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1" />
                  <span className="text-xs">Regenerate</span>
                </Button>
              )}

              <div className="flex-1" />

              {onFeedback && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onFeedback('positive')}
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-green-600"
                  >
                    <ThumbsUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onFeedback('negative')}
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-red-600"
                  >
                    <ThumbsDown className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN EXPORT
// ============================================
export function AIMessageRenderer({
  message,
  onCopy,
  onRegenerate,
  onFeedback,
  showActions = true,
}: AIMessageRendererProps) {
  if (message.role === 'user') {
    return <UserMessage content={message.content} />;
  }

  return (
    <AssistantMessage
      content={message.content}
      onCopy={onCopy}
      onRegenerate={onRegenerate}
      onFeedback={onFeedback}
      showActions={showActions}
    />
  );
}

// Export individual components for flexibility
export { UserMessage, AssistantMessage, parseMarkdown, formatInlineText };
export default AIMessageRenderer;
