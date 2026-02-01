import { Card } from "@/components/ui/card";
import { ProjectHeader } from "@/components/ProjectHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Upload, Tag } from "lucide-react";

const MonitoringAllDocuments = () => {
  const documents = [
    {
      title: "Inclufy Sales Pitch Deck Structure",
      type: "DOCX",
      size: "20.4 KB",
      date: "Oct 07, 2025",
      status: "In Review",
      tag: "planning",
    },
  ];

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">Document Library</h1>
          <Button className="bg-primary hover:bg-primary/90">
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </div>

        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">Documents</h2>
            
            <div className="mb-4">
              <h3 className="text-base font-semibold text-foreground mb-4">
                Current Project (1 document)
              </h3>
              <div className="space-y-3">
                {documents.map((doc, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-3">
                        <FileText className="h-5 w-5 text-primary mt-1" />
                        <div>
                          <h4 className="font-medium text-foreground mb-2">{doc.title}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{doc.type}</span>
                            <span>{doc.size}</span>
                            <span className="flex items-center gap-1">
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {doc.date}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Tag className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{doc.tag}</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                        {doc.status}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MonitoringAllDocuments;
