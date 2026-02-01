import { Card } from "@/components/ui/card";
import { ProjectHeader } from "@/components/ProjectHeader";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Eye } from "lucide-react";

const ExecutionReporting = () => {
  const reports = [
    {
      name: "test",
      frequency: "Bi-weekly",
      type: "Steering",
      startDate: "2025-12-12",
      document: "View",
    },
    {
      name: "Status reports",
      frequency: "Weekly",
      type: "Program Board",
      startDate: "2025-10-10",
      document: "View",
    },
  ];

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6">
        <h1 className="text-2xl font-bold text-foreground mb-6">Reporting</h1>

        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Reports</h2>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              New Report
            </Button>
          </div>

          <div className="flex gap-4 mb-6">
            <Select defaultValue="all-frequencies">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Frequencies" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-frequencies">All Frequencies</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="all-types">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-types">All Types</SelectItem>
                <SelectItem value="steering">Steering</SelectItem>
                <SelectItem value="program-board">Program Board</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="all-dates">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Dates" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-dates">All Dates</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="last-quarter">Last Quarter</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium text-muted-foreground text-sm">NAME</th>
                  <th className="text-left p-4 font-medium text-muted-foreground text-sm">FREQUENCY</th>
                  <th className="text-left p-4 font-medium text-muted-foreground text-sm">TYPE</th>
                  <th className="text-left p-4 font-medium text-muted-foreground text-sm">START DATE</th>
                  <th className="text-left p-4 font-medium text-muted-foreground text-sm">DOCUMENT</th>
                  <th className="text-left p-4 font-medium text-muted-foreground text-sm">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report, index) => (
                  <tr key={index} className="border-t border-border">
                    <td className="p-4 text-foreground font-medium">{report.name}</td>
                    <td className="p-4 text-foreground">{report.frequency}</td>
                    <td className="p-4 text-foreground">{report.type}</td>
                    <td className="p-4 text-foreground">{report.startDate}</td>
                    <td className="p-4">
                      <Button variant="link" className="text-primary p-0 h-auto">
                        <Eye className="h-4 w-4 mr-1" />
                        {report.document}
                      </Button>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                          Delete
                        </Button>
                      </div>
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

export default ExecutionReporting;
