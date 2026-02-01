import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Calendar,
  Users,
  ArrowRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";

interface Survey {
  id: string;
  title: string;
  description: string;
  status: "active" | "closed";
  dueDate: string;
  responses: number;
  totalParticipants: number;
}

export default function Surveys() {
  const { t } = useLanguage();
  
  // Fallback translations
  const ts = t.surveys || {
    title: 'Available Surveys',
    subtitle: 'Complete surveys to provide feedback and help improve project outcomes.',
    allSurveys: 'All Surveys',
    activeOnly: 'Active Only',
    closed: 'Closed',
    noSurveys: 'No surveys available',
    noSurveysDesc: 'There are no surveys available for you to complete at this time.',
    takeSurvey: 'Take Survey',
    due: 'Due',
    responses: 'responses',
  };
  const tt = t.team || { active: 'Active' };
  
  const [filter, setFilter] = useState<"all" | "active" | "closed">("all");
  const [surveys] = useState<Survey[]>([
    // Add sample surveys here when needed
  ]);

  const filteredSurveys = surveys.filter((survey) => {
    if (filter === "all") return true;
    return survey.status === filter;
  });

  return (
    <div className="min-h-full bg-background">
      <div className="py-12 px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {ts.title}
            </h1>
            <p className="text-muted-foreground text-base">
              {ts.subtitle}
            </p>
          </div>

          {/* Filters */}
          <div className="mb-8">
            <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
              <TabsList className="bg-card border border-border">
                <TabsTrigger 
                  value="all"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {ts.allSurveys}
                </TabsTrigger>
                <TabsTrigger 
                  value="active"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {ts.activeOnly}
                </TabsTrigger>
                <TabsTrigger 
                  value="closed"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {ts.closed}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Surveys List */}
          {filteredSurveys.length > 0 ? (
            <div className="grid gap-6">
              {filteredSurveys.map((survey) => (
                <Card
                  key={survey.id}
                  className="group relative overflow-hidden border-border bg-card hover:shadow-lg transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <CardContent className="p-6 relative">
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-start gap-4 mb-3">
                          <div className="p-3 rounded-lg bg-primary/10">
                            <FileText className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-foreground">
                                {survey.title}
                              </h3>
                              <Badge
                                variant="secondary"
                                className={
                                  survey.status === "active"
                                    ? "bg-success/10 text-success border-success/20"
                                    : "bg-muted text-muted-foreground"
                                }
                              >
                                {survey.status === "active" ? tt.active : ts.closed}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">
                              {survey.description}
                            </p>
                            <div className="flex items-center gap-6 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>{ts.due}: {survey.dueDate}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                <span>
                                  {survey.responses}/{survey.totalParticipants} {ts.responses}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {survey.status === "active" && (
                        <Button className="bg-primary hover:bg-primary-hover text-primary-foreground">
                          {ts.takeSurvey}
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            /* Empty State */
            <Card className="border-border bg-card">
              <CardContent className="py-16">
                <div className="text-center max-w-md mx-auto">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {ts.noSurveys}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {ts.noSurveysDesc}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}