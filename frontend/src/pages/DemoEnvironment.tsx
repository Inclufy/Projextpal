// src/pages/DemoEnvironment.tsx
// Standalone demo environment page for ProjectPal — purple themed
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Play, RotateCcw, ArrowRightLeft, Heart, HardHat, Cloud,
  Building2, Factory, Loader2, CheckCircle, AlertCircle,
  Sparkles, Database, Info, Trash2, Briefcase, ShoppingCart,
  GraduationCap, FolderKanban,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { projectPalDemoAgentService } from "@/services/demo-agent/demo-agent.service";
import type { DemoIndustry, SeedProgress } from "@/services/demo-agent/types";

const INDUSTRY_ICONS: Record<string, React.ElementType> = {
  Heart, HardHat, Cloud, Building2, Factory, Briefcase, ShoppingCart, GraduationCap,
};

export default function DemoEnvironment() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeIndustry, setActiveIndustry] = useState<string | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<string>('IT & Software');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<SeedProgress | null>(null);
  const [hasData, setHasData] = useState(false);

  const industries = projectPalDemoAgentService.getAvailableIndustries();

  // Load initial state
  useEffect(() => {
    (async () => {
      const active = await projectPalDemoAgentService.getActiveIndustry();
      setActiveIndustry(active);
      if (active) setSelectedIndustry(active);
      const exists = await projectPalDemoAgentService.hasDemoData();
      setHasData(exists);
    })();
  }, []);

  const handleSeed = async () => {
    setLoading(true);
    setProgress(null);
    try {
      await projectPalDemoAgentService.seedIndustryDemo(selectedIndustry, (p) => setProgress(p));
      setActiveIndustry(selectedIndustry);
      setHasData(true);
      await queryClient.invalidateQueries();
      toast({
        title: "Demo gegenereerd!",
        description: `${industries.find(i => i.id === selectedIndustry)?.name} projecten succesvol geladen.`,
      });
    } catch (err) {
      toast({ title: "Fout", description: String(err), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    setProgress(null);
    try {
      await projectPalDemoAgentService.resetDemo((p) => setProgress(p));
      setActiveIndustry(null);
      setHasData(false);
      await queryClient.invalidateQueries();
      queryClient.clear();
      toast({ title: "Demo gereset", description: "Alle demo projecten zijn verwijderd." });
    } catch (err) {
      toast({ title: "Fout", description: String(err), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSwitch = async () => {
    setLoading(true);
    setProgress(null);
    try {
      await projectPalDemoAgentService.switchIndustry(selectedIndustry, (p) => setProgress(p));
      setActiveIndustry(selectedIndustry);
      setHasData(true);
      await queryClient.invalidateQueries();
      toast({
        title: "Branche gewisseld!",
        description: `Nu actief: ${industries.find(i => i.id === selectedIndustry)?.name}`,
      });
    } catch (err) {
      toast({ title: "Fout", description: String(err), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const progressPercent = progress ? (progress.current / progress.total) * 100 : 0;

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-purple-600" />
          Demo Omgeving
        </h1>
        <p className="text-muted-foreground mt-1">
          Genereer industrie-specifieke demo data voor prospects
        </p>
      </div>

      {/* Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="h-4 w-4" />
            Organisatie & Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              {activeIndustry ? (
                <div className="flex items-center gap-3">
                  <Badge
                    className="text-sm text-white"
                    style={{ backgroundColor: industries.find(i => i.id === activeIndustry)?.color }}
                  >
                    {industries.find(i => i.id === activeIndustry)?.name}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Actief — demo data beschikbaar in alle modules
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-sm">Geen demo actief</Badge>
                  <span className="text-sm text-muted-foreground">
                    Selecteer een branche en klik op &quot;Genereer Demo&quot;
                  </span>
                </div>
              )}
            </div>
            {hasData && (
              <Badge variant="secondary" className="gap-1">
                <CheckCircle className="h-3 w-3" /> Data geladen
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Progress */}
      {loading && progress && (
        <Card className="border-purple-500/50">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                  {progress.step}
                </span>
                <span className="text-sm text-muted-foreground">
                  {progress.current} / {progress.total}
                </span>
              </div>
              <Progress value={progressPercent} className="h-2" />
              {progress.status === 'error' && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {progress.error}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Industry Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Kies een branche</CardTitle>
          <CardDescription>
            Elke branche genereert unieke projecten, taken, milestones en risico&apos;s
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {industries.map((ind) => {
              const IconComp = INDUSTRY_ICONS[ind.icon] ?? FolderKanban;
              const active = selectedIndustry === ind.id;
              const isCurrent = activeIndustry === ind.id;
              return (
                <button
                  key={ind.id}
                  onClick={() => !loading && setSelectedIndustry(ind.id)}
                  disabled={loading}
                  className={`relative flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                    active
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/20 shadow-sm ring-2 ring-purple-200 dark:ring-purple-800'
                      : 'border-border hover:border-purple-300 bg-card'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {isCurrent && (
                    <Badge
                      className="absolute -top-2 -right-2 text-[10px] px-1.5 text-white"
                      style={{ backgroundColor: ind.color }}
                    >
                      Actief
                    </Badge>
                  )}
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: ind.color + '20' }}
                  >
                    <IconComp className="h-5 w-5" style={{ color: ind.color }} />
                  </div>
                  <span className="text-sm font-medium text-center">{ind.name}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Acties</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {!activeIndustry ? (
            <Button
              onClick={handleSeed}
              disabled={loading}
              className="gap-2 bg-purple-600 hover:bg-purple-700"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              Genereer Demo
            </Button>
          ) : (
            <>
              <Button
                onClick={handleSwitch}
                disabled={loading || selectedIndustry === activeIndustry}
                className="gap-2 bg-purple-600 hover:bg-purple-700"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRightLeft className="h-4 w-4" />}
                Wissel naar {industries.find(i => i.id === selectedIndustry)?.name}
              </Button>
              <Button
                onClick={handleReset}
                disabled={loading}
                variant="destructive"
                className="gap-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Reset Demo
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Info */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Wat wordt er gegenereerd?</AlertTitle>
        <AlertDescription className="mt-2">
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><strong>1-2 projecten</strong> — branche-specifieke projecten met budget en planning</li>
            <li><strong>5+ milestones</strong> — fasering met start- en einddatums per project</li>
            <li><strong>8+ taken</strong> — realistische taken met prioriteit en toewijzing</li>
            <li><strong>3+ risico&apos;s</strong> — geidentificeerde risico&apos;s met categorie en impact</li>
          </ul>
          <p className="mt-2 text-muted-foreground text-xs">
            Alle data wordt gekoppeld aan uw organisatie en is zichtbaar in alle modules.
          </p>
        </AlertDescription>
      </Alert>
    </div>
  );
}
