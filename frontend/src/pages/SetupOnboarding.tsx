// src/pages/SetupOnboarding.tsx
// Placeholder for the AI Setup Onboarding wizard
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function SetupOnboarding() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-fuchsia-50 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center space-y-6 max-w-md mx-auto p-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-fuchsia-600 flex items-center justify-center mx-auto">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welkom bij ProjeXtPal
        </h1>
        <p className="text-muted-foreground">
          De AI Setup Wizard wordt binnenkort beschikbaar. Ga nu naar het dashboard om aan de slag te gaan.
        </p>
        <Button
          onClick={() => navigate('/dashboard')}
          className="bg-purple-600 hover:bg-purple-700"
        >
          Ga naar Dashboard
        </Button>
      </div>
    </div>
  );
}
