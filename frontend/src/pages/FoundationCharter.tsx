import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProjectHeader } from "@/components/ProjectHeader";

const FoundationCharter = () => {
  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6">
      <Card className="p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Project Charter Reporting</h2>
              <p className="text-sm text-muted-foreground">Inclufy Website - Project Orchestrator: Samir Usuile</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">Version 1</Button>
              <Button className="bg-primary">+ Feedback</Button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-4 rounded-lg bg-primary text-primary-foreground">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Scope/Capabilities</h3>
              <Button variant="secondary" size="sm">+ Add</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-primary-foreground/20">
                    <th className="text-left py-2">Capability</th>
                    <th className="text-left py-2">Description</th>
                    <th className="text-left py-2">End Game</th>
                    <th className="text-right py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2">Solutions, Consulting & Academy</td>
                    <td className="py-2">Solutions, Consulting & Academy</td>
                    <td className="py-2">A full functional website with SaaS/Incr functionality to manage the content of the website</td>
                    <td className="py-2 text-right">
                      <Button variant="ghost" size="sm">Edit</Button>
                      <Button variant="ghost" size="sm">Delete</Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-primary text-primary-foreground">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Critical Interdependencies</h3>
              <Button variant="secondary" size="sm">+ Add</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-primary-foreground/20">
                    <th className="text-left py-2">Item</th>
                    <th className="text-left py-2">Description</th>
                    <th className="text-right py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2">The Inclufy AI Procurement & Sales portal</td>
                    <td className="py-2">The Inclufy AI Procurement & Sales portal</td>
                    <td className="py-2 text-right">
                      <Button variant="ghost" size="sm">Edit</Button>
                      <Button variant="ghost" size="sm">Delete</Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-primary text-primary-foreground">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Key Risks</h3>
                <Button variant="secondary" size="sm">+ Add</Button>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1 border-b border-primary-foreground/20">
                  <span>Risk</span>
                  <span>Description</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Delay in development</span>
                  <span>Missing the market opportunities due to non active presentation</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-primary text-primary-foreground">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Key Deliverables</h3>
                <Button variant="secondary" size="sm">+ Add</Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-primary-foreground/20">
                      <th className="text-left py-2">Deliverable</th>
                      <th className="text-left py-2">Description</th>
                      <th className="text-left py-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-1">A functional website with SaaS/Incr</td>
                      <td className="py-1">A functional website with SaaS/Incr</td>
                      <td className="py-1">8-10-2025</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-primary text-primary-foreground">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Resources</h3>
              <Button variant="secondary" size="sm">+ Add</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-primary-foreground/20">
                    <th className="text-left py-2">Name</th>
                    <th className="text-left py-2">Role</th>
                    <th className="text-left py-2">Required</th>
                    <th className="text-left py-2">FTE</th>
                    <th className="text-right py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2">Ramail Naor</td>
                    <td className="py-2">Project Manager</td>
                    <td className="py-2">Yes</td>
                    <td className="py-2">1.0</td>
                    <td className="py-2 text-right">
                      <Button variant="ghost" size="sm">Edit</Button>
                      <Button variant="ghost" size="sm">Delete</Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Card>
    </div>
    </div>
  );
};

export default FoundationCharter;
