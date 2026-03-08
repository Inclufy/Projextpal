import { useState, useEffect, useRef } from "react";
import { Sparkles, Mic, MicOff, X, Send, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCopilot } from "@/contexts/CopilotContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// ============================================
// VOICE CHAT DIALOG
// ============================================
interface VoiceChatDialogProps {
  open: boolean;
  onClose: () => void;
  isNL: boolean;
}

const callAI = async (prompt: string): Promise<string> => {
  const token = localStorage.getItem("access_token");
  if (!token) throw new Error("Not authenticated");
  const createRes = await fetch("/api/v1/bot/chats/", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ title: "Voice Command" }),
  });
  if (!createRes.ok) throw new Error("Failed to create chat");
  const chatData = await createRes.json();
  const msgRes = await fetch(`/api/v1/bot/chats/${chatData.id}/send_message/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ message: prompt }),
  });
  if (!msgRes.ok) throw new Error("AI service unavailable");
  const data = await msgRes.json();
  return data.ai_response?.content || "";
};

const VoiceChatDialog = ({ open, onClose, isNL }: VoiceChatDialogProps) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputText, setInputText] = useState("");
  const recognitionRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const SpeechRecognition = typeof window !== "undefined"
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : null;

  const startListening = () => {
    if (!SpeechRecognition) {
      toast.error(isNL ? "Spraakherkenning niet ondersteund in deze browser" : "Speech recognition not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = isNL ? "nl-NL" : "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: any) => {
      const current = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join("");
      setTranscript(current);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      if (event.error !== "aborted") {
        toast.error(isNL ? "Spraakherkenning fout" : "Speech recognition error");
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handleSend = async (text?: string) => {
    const message = text || transcript || inputText;
    if (!message.trim()) return;

    setIsProcessing(true);
    setAiResponse("");
    try {
      const response = await callAI(message);
      setAiResponse(response);
      // Speak the response
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(response.replace(/[#*_`]/g, "").substring(0, 500));
        utterance.lang = isNL ? "nl-NL" : "en-US";
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
      }
    } catch {
      toast.error(isNL ? "Fout bij verwerken" : "Processing error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setTranscript("");
    setAiResponse("");
    setInputText("");
    window.speechSynthesis?.cancel();
  };

  useEffect(() => {
    if (!open) {
      stopListening();
      window.speechSynthesis?.cancel();
    }
  }, [open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-lg mx-4 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header gradient */}
        <div className="bg-gradient-to-r from-purple-500 to-violet-600 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Mic className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">
                {isNL ? "Praat met PX" : "Talk to PX"}
              </h3>
              <p className="text-white/70 text-xs">
                {isNL ? "Spraakgestuurde AI assistent" : "Voice-powered AI assistant"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors">
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Mic button */}
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={isListening ? stopListening : startListening}
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
                isListening
                  ? "bg-red-500 shadow-[0_0_40px_rgba(239,68,68,0.4)] animate-pulse"
                  : "bg-gradient-to-br from-purple-500 to-violet-600 shadow-xl hover:shadow-2xl hover:scale-105"
              }`}
            >
              {isListening ? (
                <MicOff className="h-10 w-10 text-white" />
              ) : (
                <Mic className="h-10 w-10 text-white" />
              )}
            </button>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isListening
                ? (isNL ? "Luistert... Tik om te stoppen" : "Listening... Tap to stop")
                : (isNL ? "Tik op de microfoon om te spreken" : "Tap the microphone to speak")}
            </p>
          </div>

          {/* Transcript */}
          {transcript && (
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-4 border border-purple-100 dark:border-purple-800">
              <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1">
                {isNL ? "Je zei:" : "You said:"}
              </p>
              <p className="text-gray-900 dark:text-gray-100 font-medium">{transcript}</p>
            </div>
          )}

          {/* Text input fallback */}
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend(inputText)}
              placeholder={isNL ? "Of typ je vraag hier..." : "Or type your question here..."}
              className="flex-1 h-11 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-purple-300"
            />
            <Button
              onClick={() => handleSend(inputText || transcript)}
              disabled={isProcessing || (!transcript && !inputText.trim())}
              className="h-11 px-4 rounded-xl bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white"
            >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>

          {/* AI Response */}
          {aiResponse && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 max-h-48 overflow-y-auto">
              <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-2">
                {isNL ? "PX antwoord:" : "PX response:"}
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {aiResponse.replace(/[#*_`]/g, "")}
              </p>
            </div>
          )}

          {/* Processing */}
          {isProcessing && (
            <div className="flex items-center justify-center gap-3 py-4">
              <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
              <span className="text-sm text-gray-500">{isNL ? "Verwerkt..." : "Processing..."}</span>
            </div>
          )}

          {/* Reset */}
          {(transcript || aiResponse) && !isProcessing && (
            <button onClick={handleReset} className="w-full text-sm text-gray-500 hover:text-purple-600 transition-colors py-2">
              {isNL ? "Nieuwe vraag" : "New question"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT - AI Chat + Voice Cards
// ============================================
const HomeAIVoiceCards = () => {
  const { open: openCopilot } = useCopilot();
  const { language } = useLanguage();
  const { user } = useAuth();
  const [voiceOpen, setVoiceOpen] = useState(false);
  const isNL = language === "nl";

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return isNL ? "Goedenacht" : "Good night";
    if (hour < 12) return isNL ? "Goedemorgen" : "Good morning";
    if (hour < 18) return isNL ? "Goedemiddag" : "Good afternoon";
    return isNL ? "Goedenavond" : "Good evening";
  };

  const firstName = user?.firstName || user?.email?.split("@")[0] || "User";

  return (
    <>
      {/* Greeting + quick access icons */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{greeting()},</p>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{firstName}!</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setVoiceOpen(true)}
            className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
          >
            <Mic className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </button>
          <button
            onClick={openCopilot}
            className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
          >
            <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </button>
        </div>
      </div>

      {/* AI Chat + Voice Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* AI Chat Card */}
        <Card
          className="border-0 cursor-pointer overflow-hidden group transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
          onClick={openCopilot}
        >
          <CardContent className="p-0">
            <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-pink-500 p-5 h-full">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg leading-tight">AI Chat</h3>
                  <p className="text-white/70 text-sm mt-0.5">
                    {isNL ? "Stel je vragen" : "Ask your questions"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Voice Card */}
        <Card
          className="border-0 cursor-pointer overflow-hidden group transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
          onClick={() => setVoiceOpen(true)}
        >
          <CardContent className="p-0">
            <div className="bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 p-5 h-full">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Mic className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg leading-tight">Voice</h3>
                  <p className="text-white/70 text-sm mt-0.5">
                    {isNL ? "Praat met PX" : "Talk to PX"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Voice Dialog */}
      <VoiceChatDialog open={voiceOpen} onClose={() => setVoiceOpen(false)} isNL={isNL} />
    </>
  );
};

export default HomeAIVoiceCards;
