import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectHeader } from "@/components/ProjectHeader";

const FoundationTeam = () => {
  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6">
      <Card className="p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Project Team (4 members)</h2>
              <p className="text-sm text-muted-foreground">Manage project team and roles</p>
            </div>
            <Button className="bg-primary">+ Add Member</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: "Ramail Naor", email: "ramail@gmail.com", role: "Project Manager" },
            { name: "Lucky #4", email: "lucky4@mail.com", role: "Admin" },
            { name: "Sams", email: "sams@gmail.com", role: "Project Manager" },
            { name: "Abraham", email: "abraham@mail.com", role: "Product Manager" },
          ].map((member) => (
            <Card key={member.email} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-semibold text-primary">
                    {member.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{member.name}</h3>
                  <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs">
                {member.role}
              </Badge>
            </Card>
          ))}
        </div>
      </Card>
    </div>
    </div>
  );
};

export default FoundationTeam;
