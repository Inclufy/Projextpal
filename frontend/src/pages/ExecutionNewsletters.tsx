import { Card } from "@/components/ui/card";
import { ProjectHeader } from "@/components/ProjectHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Plus, Eye, Calendar, Clock, User } from "lucide-react";

const ExecutionNewsletters = () => {
  const newsletters = [
    {
      subject: "Inclufy Newsletter",
      recipients: { type: "Custom Recipients", count: 3 },
      status: "Sent",
      createdBy: "Lucky Ali",
      date: "07 Oct 2025",
      sentDate: "07 Oct 2025",
    },
  ];

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Mail className="h-6 w-6 text-foreground" />
            <h1 className="text-2xl font-bold text-foreground">Newsletters</h1>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Create Newsletter
          </Button>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium text-muted-foreground text-sm">SUBJECT</th>
                  <th className="text-left p-4 font-medium text-muted-foreground text-sm">RECIPIENTS</th>
                  <th className="text-left p-4 font-medium text-muted-foreground text-sm">STATUS</th>
                  <th className="text-left p-4 font-medium text-muted-foreground text-sm">CREATED BY</th>
                  <th className="text-left p-4 font-medium text-muted-foreground text-sm">DATE</th>
                  <th className="text-left p-4 font-medium text-muted-foreground text-sm">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {newsletters.map((newsletter, index) => (
                  <tr key={index} className="border-t border-border">
                    <td className="p-4 text-foreground font-medium">{newsletter.subject}</td>
                    <td className="p-4">
                      <div>
                        <p className="text-foreground">{newsletter.recipients.type}</p>
                        <p className="text-sm text-muted-foreground">{newsletter.recipients.count} recipients</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                        {newsletter.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">{newsletter.createdBy}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-foreground">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {newsletter.date}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          Sent: {newsletter.sentDate}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4 text-primary" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ExecutionNewsletters;
