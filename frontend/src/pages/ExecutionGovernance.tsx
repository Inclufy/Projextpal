import { Card } from "@/components/ui/card";
import { ProjectHeader } from "@/components/ProjectHeader";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Save, Building2, AlertCircle, Users, Briefcase, Calendar } from "lucide-react";
import { useState } from "react";

const ExecutionGovernance = () => {
  const [isStructureOpen, setIsStructureOpen] = useState(true);
  const [isImpactOpen, setIsImpactOpen] = useState(true);

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Governance Setup</h1>
            <p className="text-muted-foreground">Communication Flow and Stakeholder Management</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>

        <Collapsible open={isStructureOpen} onOpenChange={setIsStructureOpen} className="mb-6">
          <Card>
            <CollapsibleTrigger className="w-full p-6 flex items-center justify-between hover:bg-accent/50 transition-colors">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Governance Structure</h2>
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${isStructureOpen ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="p-6 pt-0">
                <div className="bg-muted/20 rounded-lg p-6">
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    Define your governance hierarchy structure here
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button variant="outline" size="sm">Add Hierarchy Level</Button>
                    <Button variant="outline" size="sm">Add Team</Button>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        <Collapsible open={isImpactOpen} onOpenChange={setIsImpactOpen}>
          <Card>
            <CollapsibleTrigger className="w-full p-6 flex items-center justify-between hover:bg-accent/50 transition-colors">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-warning" />
                <h2 className="text-lg font-semibold text-foreground">Project Impact Analysis</h2>
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${isImpactOpen ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="p-6 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Users className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-foreground">User Impact</h3>
                    </div>
                    <p className="text-sm text-muted-foreground text-center mb-4">
                      No user impact items added
                    </p>
                    <Button variant="link" className="text-primary p-0 h-auto">
                      + Add Item
                    </Button>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Briefcase className="h-5 w-5 text-success" />
                      <h3 className="font-semibold text-foreground">Business Impact</h3>
                    </div>
                    <p className="text-sm text-muted-foreground text-center mb-4">
                      No business impact items added
                    </p>
                    <Button variant="link" className="text-primary p-0 h-auto">
                      + Add Item
                    </Button>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Calendar className="h-5 w-5 text-purple-500" />
                      <h3 className="font-semibold text-foreground">Timeline Impact</h3>
                    </div>
                    <p className="text-sm text-muted-foreground text-center mb-4">
                      No timeline impact items added
                    </p>
                    <Button variant="link" className="text-primary p-0 h-auto">
                      + Add Item
                    </Button>
                  </Card>
                </div>
              </div>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>
    </div>
  );
};

export default ExecutionGovernance;
