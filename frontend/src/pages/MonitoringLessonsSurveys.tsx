import { Card } from "@/components/ui/card";
import { ProjectHeader } from "@/components/ProjectHeader";
import { Button } from "@/components/ui/button";
import { Archive, Edit, Trash2, Plus, FileText } from "lucide-react";

const MonitoringLessonsSurveys = () => {
  const archivedLessons = [
    {
      title: "Archived Lesson",
      archivedDate: "October 10, 2025",
      keyInsights: ["We should communicate effectively new omscholing"],
    },
  ];

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Lessons Learned & Surveys</h1>
          <p className="text-muted-foreground">Collect feedback, analyze performance, and archive project insights</p>
        </div>

        <div className="space-y-8">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Lessons Learned</h2>
                <p className="text-sm text-muted-foreground">Archive and manage project insights and lessons learned</p>
              </div>
              <Button className="bg-success hover:bg-success/90">
                <Plus className="h-4 w-4 mr-2" />
                Archive New Lesson
              </Button>
            </div>

            <div>
              <h3 className="text-base font-semibold text-foreground mb-4">Archived Lessons</h3>
              <div className="space-y-4">
                {archivedLessons.map((lesson, index) => (
                  <Card key={index} className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Archive className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-1">{lesson.title}</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Archived on {lesson.archivedDate}
                        </p>
                        <div className="mb-3">
                          <p className="text-sm font-medium text-foreground mb-2">Key Insights:</p>
                          <ul className="list-disc list-inside space-y-1">
                            {lesson.keyInsights.map((insight, idx) => (
                              <li key={idx} className="text-sm text-muted-foreground">
                                {insight}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4 text-primary" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Surveys</h2>
                <p className="text-sm text-muted-foreground">Create and manage project surveys</p>
              </div>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Create Survey
              </Button>
            </div>

            <Card className="p-12">
              <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
                <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-6">
                  <FileText className="h-12 w-12 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-6">No surveys yet. Create surveys to collect feedback from your team.</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonitoringLessonsSurveys;
