import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  RefreshCw,
  X,
  Sparkles,
  ChevronDown,
  ChevronRight,
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
  Copy,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AISummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
  title?: string;
  subtitle?: string;
  content: string;
  isLoading?: boolean;
}

// Icon mapping for different section types
const sectionIcons: Record<string, React.ElementType> = {
  'executive': Brain,
  'summary': FileText,
  'health': CheckCircle2,
  'highlight': Star,
  'key': Lightbulb,
  'risk': AlertTriangle,
  'recommendation': Target,
  'action': Rocket,
  'budget': DollarSign,
  'timeline': Calendar,
  'progress': TrendingUp,
  'team': Users,
  'status': BarChart3,
  'issue': AlertTriangle,
  'opportunity': Zap,
  'metric': BarChart3,
  'goal': Target,
  'milestone': CheckCircle2,
  'task': ListChecks,
  'priority': Shield,
  'insight': Lightbulb,
  'overview': Info,
  'performance': TrendingUp,
  'forecast': Clock,
  'analysis': Brain,
  'conclusion': CheckCircle2,
  'next': ArrowRight,
  'default': Sparkles,
};

// Color mapping for sections
const sectionColors: Record<string, string> = {
  'executive': 'from-purple-500/20 to-purple-500/5 border-purple-500/30',
  'summary': 'from-blue-500/20 to-blue-500/5 border-blue-500/30',
  'health': 'from-green-500/20 to-green-500/5 border-green-500/30',
  'highlight': 'from-amber-500/20 to-amber-500/5 border-amber-500/30',
  'key': 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/30',
  'risk': 'from-red-500/20 to-red-500/5 border-red-500/30',
  'recommendation': 'from-indigo-500/20 to-indigo-500/5 border-indigo-500/30',
  'action': 'from-orange-500/20 to-orange-500/5 border-orange-500/30',
  'budget': 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30',
  'timeline': 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/30',
  'progress': 'from-teal-500/20 to-teal-500/5 border-teal-500/30',
  'team': 'from-violet-500/20 to-violet-500/5 border-violet-500/30',
  'status': 'from-blue-500/20 to-blue-500/5 border-blue-500/30',
  'issue': 'from-rose-500/20 to-rose-500/5 border-rose-500/30',
  'opportunity': 'from-lime-500/20 to-lime-500/5 border-lime-500/30',
  'default': 'from-slate-500/20 to-slate-500/5 border-slate-500/30',
};

const iconColors: Record<string, string> = {
  'executive': 'text-purple-500',
  'summary': 'text-blue-500',
  'health': 'text-green-500',
  'highlight': 'text-amber-500',
  'key': 'text-yellow-500',
  'risk': 'text-red-500',
  'recommendation': 'text-indigo-500',
  'action': 'text-orange-500',
  'budget': 'text-emerald-500',
  'timeline': 'text-cyan-500',
  'progress': 'text-teal-500',
  'team': 'text-violet-500',
  'status': 'text-blue-500',
  'issue': 'text-rose-500',
  'opportunity': 'text-lime-500',
  'default': 'text-slate-500',
};

interface ParsedSection {
  id: string;
  title: string;
  content: string[];
  level: number;
  type: string;
}

function parseMarkdownToSections(markdown: string): ParsedSection[] {
  const lines = markdown.split('\n');
  const sections: ParsedSection[] = [];
  let currentSection: ParsedSection | null = null;
  let sectionId = 0;

  for (const line of lines) {
    // Check for headers (# ## ### ####)
    const headerMatch = line.match(/^(#{1,4})\s+(.+)$/);
    
    if (headerMatch) {
      // Save previous section
      if (currentSection) {
        sections.push(currentSection);
      }
      
      const level = headerMatch[1].length;
      const title = headerMatch[2].trim();
      
      // Determine section type based on title keywords
      const titleLower = title.toLowerCase();
      let type = 'default';
      
      for (const keyword of Object.keys(sectionIcons)) {
        if (titleLower.includes(keyword)) {
          type = keyword;
          break;
        }
      }
      
      currentSection = {
        id: `section-${sectionId++}`,
        title,
        content: [],
        level,
        type,
      };
    } else if (currentSection && line.trim()) {
      currentSection.content.push(line);
    } else if (!currentSection && line.trim()) {
      // Content before any header - create intro section
      currentSection = {
        id: `section-${sectionId++}`,
        title: 'Overview',
        content: [line],
        level: 1,
        type: 'overview',
      };
    }
  }
  
  // Don't forget the last section
  if (currentSection) {
    sections.push(currentSection);
  }
  
  return sections;
}

function formatContent(content: string[]): React.ReactNode[] {
  return content.map((line, idx) => {
    const trimmed = line.trim();
    
    // Bullet points
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const text = trimmed.substring(2);
      return (
        <div key={idx} className="flex items-start gap-2 py-1">
          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
          <span className="text-sm text-foreground/90">{formatInlineStyles(text)}</span>
        </div>
      );
    }
    
    // Numbered lists
    const numberedMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
    if (numberedMatch) {
      return (
        <div key={idx} className="flex items-start gap-2 py-1">
          <span className="text-xs font-semibold text-primary bg-primary/10 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
            {numberedMatch[1]}
          </span>
          <span className="text-sm text-foreground/90">{formatInlineStyles(numberedMatch[2])}</span>
        </div>
      );
    }
    
    // Regular paragraph
    return (
      <p key={idx} className="text-sm text-foreground/80 leading-relaxed py-1">
        {formatInlineStyles(trimmed)}
      </p>
    );
  });
}

function formatInlineStyles(text: string): React.ReactNode {
  // Handle **bold**, *italic*, and `code`
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;
  
  while (remaining.length > 0) {
    // Bold
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    // Italic
    const italicMatch = remaining.match(/(?<!\*)\*([^*]+?)\*(?!\*)/);
    // Code
    const codeMatch = remaining.match(/`([^`]+)`/);
    
    // Find the earliest match
    let earliestMatch: { match: RegExpMatchArray; type: string } | null = null;
    let earliestIndex = remaining.length;
    
    if (boldMatch && boldMatch.index !== undefined && boldMatch.index < earliestIndex) {
      earliestIndex = boldMatch.index;
      earliestMatch = { match: boldMatch, type: 'bold' };
    }
    if (italicMatch && italicMatch.index !== undefined && italicMatch.index < earliestIndex) {
      earliestIndex = italicMatch.index;
      earliestMatch = { match: italicMatch, type: 'italic' };
    }
    if (codeMatch && codeMatch.index !== undefined && codeMatch.index < earliestIndex) {
      earliestIndex = codeMatch.index;
      earliestMatch = { match: codeMatch, type: 'code' };
    }
    
    if (earliestMatch) {
      // Add text before match
      if (earliestIndex > 0) {
        parts.push(<span key={key++}>{remaining.substring(0, earliestIndex)}</span>);
      }
      
      // Add formatted text
      const content = earliestMatch.match[1];
      switch (earliestMatch.type) {
        case 'bold':
          parts.push(<strong key={key++} className="font-semibold text-foreground">{content}</strong>);
          break;
        case 'italic':
          parts.push(<em key={key++} className="italic">{content}</em>);
          break;
        case 'code':
          parts.push(
            <code key={key++} className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">
              {content}
            </code>
          );
          break;
      }
      
      remaining = remaining.substring(earliestIndex + earliestMatch.match[0].length);
    } else {
      // No more matches, add remaining text
      parts.push(<span key={key++}>{remaining}</span>);
      break;
    }
  }
  
  return parts.length === 1 ? parts[0] : <>{parts}</>;
}

function SectionCard({ section, defaultOpen = true }: { section: ParsedSection; defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  const Icon = sectionIcons[section.type] || sectionIcons.default;
  const colorClass = sectionColors[section.type] || sectionColors.default;
  const iconColorClass = iconColors[section.type] || iconColors.default;
  
  // Main sections (level 1-2) are collapsible cards
  if (section.level <= 2) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <Card className={cn(
          "overflow-hidden border transition-all duration-200",
          colorClass.split(' ')[2], // border color
          isOpen && "shadow-md"
        )}>
          <CollapsibleTrigger asChild>
            <button className={cn(
              "w-full flex items-center gap-3 p-4 text-left transition-colors",
              "bg-gradient-to-r",
              colorClass.split(' ').slice(0, 2).join(' '),
              "hover:opacity-90"
            )}>
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                "bg-background/80 shadow-sm"
              )}>
                <Icon className={cn("h-5 w-5", iconColorClass)} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate">
                  {section.title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {section.content.length} items
                </p>
              </div>
              {isOpen ? (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 pb-4 px-4">
              <div className="pl-[52px] space-y-1">
                {formatContent(section.content)}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    );
  }
  
  // Sub-sections (level 3-4) are inline
  return (
    <div className="py-2">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn("h-4 w-4", iconColorClass)} />
        <h4 className="font-medium text-sm text-foreground">{section.title}</h4>
      </div>
      <div className="pl-6 space-y-1">
        {formatContent(section.content)}
      </div>
    </div>
  );
}

export function AISummaryModal({
  isOpen,
  onClose,
  onRefresh,
  title = "AI Summary",
  subtitle = "Powered by AI analysis",
  content,
  isLoading = false,
}: AISummaryModalProps) {
  const [copied, setCopied] = useState(false);
  
  const sections = useMemo(() => parseMarkdownToSections(content), [content]);
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 px-6 py-5">
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]" />
          <div className="relative flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                  {title}
                </DialogTitle>
                <DialogDescription className="text-white/70 text-sm">
                  {subtitle}
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopy}
                className="text-white/70 hover:text-white hover:bg-white/20"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              {onRefresh && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onRefresh}
                  disabled={isLoading}
                  className="text-white/70 hover:text-white hover:bg-white/20"
                >
                  <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white/70 hover:text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Quick stats */}
          <div className="relative flex gap-4 mt-4">
            <Badge variant="secondary" className="bg-white/20 text-white border-0 backdrop-blur-sm">
              <FileText className="h-3 w-3 mr-1" />
              {sections.length} sections
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white border-0 backdrop-blur-sm">
              <Brain className="h-3 w-3 mr-1" />
              AI Generated
            </Badge>
          </div>
        </div>
        
        {/* Content */}
        <ScrollArea className="flex-1 max-h-[calc(85vh-180px)]">
          <div className="p-6 space-y-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                  <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-primary" />
                </div>
                <p className="mt-4 text-sm text-muted-foreground">Generating AI summary...</p>
              </div>
            ) : sections.length === 0 ? (
              <div className="text-center py-12">
                <Info className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No content available</p>
              </div>
            ) : (
              sections.map((section, idx) => (
                <SectionCard 
                  key={section.id} 
                  section={section} 
                  defaultOpen={idx < 3} // First 3 sections open by default
                />
              ))
            )}
          </div>
        </ScrollArea>
        
        {/* Footer */}
        <div className="border-t bg-muted/30 px-6 py-3 flex items-center justify-between">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            AI-generated content may require verification
          </p>
          <div className="flex gap-2">
            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
                <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
                Refresh
              </Button>
            )}
            <Button size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AISummaryModal;
