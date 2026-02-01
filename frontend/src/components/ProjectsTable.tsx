import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Project {
  id: string;
  name: string;
  completionDate: string;
  budget: string;
  totalPaid: string;
  progress: number;
  status: string;
}

const projects: Project[] = [
  {
    id: "1",
    name: "eSourcing module",
    completionDate: "15 Jan 2025",
    budget: "$10,000.00",
    totalPaid: "$0.00",
    progress: 0,
    status: "Pending",
  },
  {
    id: "2",
    name: "Onboarding ICT Tribe",
    completionDate: "25 Jan 2025",
    budget: "$15,000.00",
    totalPaid: "$0.00",
    progress: 0,
    status: "In Progress",
  },
  {
    id: "3",
    name: "Asperiores ipsam nam",
    completionDate: "5 Feb 2025",
    budget: "$12.00",
    totalPaid: "$0.00",
    progress: 0,
    status: "Planning",
  },
  {
    id: "4",
    name: "Aut est ut dolores a",
    completionDate: "10 Feb 2025",
    budget: "$23.00",
    totalPaid: "$0.00",
    progress: 0,
    status: "In Progress",
  },
  {
    id: "5",
    name: "Indufy Website",
    completionDate: "11 Jan 2025",
    budget: "$1,000.00",
    totalPaid: "$1,000.00",
    progress: 50,
    status: "In Progress",
  },
];

export function ProjectsTable() {
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-card-foreground">Projects Table</h2>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Completion Date</TableHead>
            <TableHead>Budget</TableHead>
            <TableHead>Total Paid</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id}>
              <TableCell className="font-medium">{project.name}</TableCell>
              <TableCell>{project.completionDate}</TableCell>
              <TableCell>{project.budget}</TableCell>
              <TableCell>{project.totalPaid}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground">{project.progress}%</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    project.status === "In Progress"
                      ? "default"
                      : project.status === "Pending"
                      ? "secondary"
                      : "outline"
                  }
                >
                  {project.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
