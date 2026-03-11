import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Sparkles, Wand2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePageTranslations } from '@/hooks/usePageTranslations';

interface AISmartHelperProps {
  type: "portfolio" | "board" | "stakeholder";
  onSuggestion: (data: any) => void;
  context?: string;
}

const portfolioSuggestions = [
  { name: "Digital Transformation Initiative 2025", description: "Strategic portfolio focused on modernizing legacy systems, implementing cloud infrastructure, and enhancing digital customer experiences. Includes data analytics platform, mobile app development, and AI/ML capabilities. Expected ROI: 25% within 18 months." },
  { name: "Sustainability & Green Operations", description: "Portfolio dedicated to reducing carbon footprint and implementing sustainable business practices. Covers energy-efficient infrastructure, supply chain optimization, and ESG compliance initiatives." },
  { name: "Customer Experience Innovation", description: "Strategic portfolio aimed at transforming customer touchpoints through omnichannel integration, personalization engines, and self-service platforms. Target: 40% improvement in NPS score." },
];

const boardSuggestions = [
  { name: "Strategic Investment Review Board", description: "Governance body responsible for reviewing and approving strategic investments, monitoring portfolio performance, and ensuring alignment with organizational objectives. Meets bi-weekly to assess progress and make funding decisions." },
  { name: "Risk & Compliance Committee", description: "Board focused on identifying, assessing, and mitigating strategic risks across all portfolios. Reviews compliance status, audit findings, and regulatory changes on a monthly basis." },
  { name: "Innovation Advisory Panel", description: "Advisory board that evaluates emerging technologies and innovation proposals. Provides guidance on R&D investments and partnership opportunities. Meets quarterly." },
];

const stakeholderSuggestions = [
  { name: "Sarah Johnson", email: "sarah.johnson@example.com", role: "executive_sponsor", organization: "Technology Division", interest_level: "high", influence_level: "high" },
  { name: "Mark de Vries", email: "mark.devries@example.com", role: "senior_responsible_owner", organization: "Operations", interest_level: "high", influence_level: "medium" },
  { name: "Lisa van der Berg", email: "lisa.vdberg@example.com", role: "business_change_manager", organization: "HR & Change Management", interest_level: "medium", influence_level: "high" },
];

const callAI = async (prompt: string): Promise<string | null> => {
  const token = localStorage.getItem("access_token");
  try {
    const response = await fetch("/api/v1/governance/ai/generate/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ prompt }),
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.response || null;
  } catch {
    return null;
  }
};

const AISmartHelper: React.FC<AISmartHelperProps> = ({ type, onSuggestion, context }) => {
  const [generating, setGenerating] = useState(false);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [customPrompt, setCustomPrompt] = useState("");
  const { toast } = useToast();
  const { pt } = usePageTranslations();

  const getFallbackSuggestions = () => {
    switch (type) {
      case "portfolio": return portfolioSuggestions;
      case "board": return boardSuggestions;
      case "stakeholder": return stakeholderSuggestions;
    }
  };

  const generateWithAI = async (promptText: string) => {
    const typeLabel = type === "portfolio" ? "portfolio" : type === "board" ? "governance board" : "stakeholder";
    const aiPrompt = `Generate a ${typeLabel} based on this description: "${promptText}". Respond in JSON format with "name" and "description" fields only. Be professional and specific.`;

    const aiResponse = await callAI(aiPrompt);
    if (aiResponse) {
      try {
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch { /* fall through to fallback */ }
    }
    return null;
  };

  const generateSmartSuggestions = async (promptText?: string) => {
    setGenerating(true);

    try {
      let suggestion: any = null;

      // Try AI generation first if there's a prompt
      if (promptText) {
        suggestion = await generateWithAI(promptText);
      }

      // Fallback to predefined suggestions
      if (!suggestion) {
        const suggestions = getFallbackSuggestions();
        suggestion = suggestions[suggestionIndex % suggestions.length];
        setSuggestionIndex(prev => prev + 1);
      }

      onSuggestion({ ...suggestion });
      setCustomPrompt("");

      toast({
        title: pt("AI Suggestions Generated"),
        description: pt("Smart fields have been populated. Review and adjust as needed."),
      });
    } catch (error) {
      toast({
        title: pt("Error"),
        description: pt("Failed to generate AI suggestions."),
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const getPromptExamples = () => {
    switch (type) {
      case "portfolio":
        return [
          pt("Create a digital transformation portfolio"),
          pt("Build a sustainability initiative"),
          pt("Setup innovation program"),
        ];
      case "board":
        return [
          pt("Investment review board"),
          pt("Risk oversight committee"),
          pt("Strategic planning board"),
        ];
      case "stakeholder":
        return [
          pt("Add executive sponsor"),
          pt("Include technical lead"),
          pt("Add business owner"),
        ];
    }
  };

  return (
    <Card className="border-2 border-dashed border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-900/20 dark:to-pink-900/20">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg flex-shrink-0">
            <Wand2 className="h-6 w-6 text-white" />
          </div>

          <div className="flex-1">
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              {pt("AI Smart Creation")}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {pt("Let AI help you get started with intelligent suggestions")}
            </p>

            <div className="flex gap-2 mb-4">
              <Input
                placeholder={pt("Describe what you want to create...")}
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && customPrompt.trim()) {
                    generateSmartSuggestions(customPrompt.trim());
                  }
                }}
                disabled={generating}
                className="flex-1"
              />
              <Button
                onClick={() => generateSmartSuggestions(customPrompt.trim() || undefined)}
                disabled={generating}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold"
              >
                {generating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase">{pt("Quick Prompts")}:</p>
              <div className="flex flex-wrap gap-2">
                {getPromptExamples().map((example, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    onClick={() => generateSmartSuggestions(example)}
                    disabled={generating}
                    className="text-xs h-8 border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/30"
                  >
                    {example}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AISmartHelper;
