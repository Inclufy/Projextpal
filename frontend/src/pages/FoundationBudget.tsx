import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectHeader } from "@/components/ProjectHeader";

const FoundationBudget = () => {
  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6">
      <Card className="p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Budget Management</h2>
              <p className="text-sm text-muted-foreground">Track project expenses and budget for Inclufy Website</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">Add Expense</Button>
              <Button className="bg-primary">Export</Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4 bg-muted/30">
            <p className="text-sm text-muted-foreground mb-1">Total Budget</p>
            <p className="text-2xl font-bold text-foreground">$10,000</p>
          </Card>
          <Card className="p-4 bg-muted/30">
            <p className="text-sm text-muted-foreground mb-1">Spent</p>
            <p className="text-2xl font-bold text-foreground">$3,100</p>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div className="h-full bg-primary rounded-full" style={{ width: "31%" }}></div>
            </div>
          </Card>
          <Card className="p-4 bg-muted/30">
            <p className="text-sm text-muted-foreground mb-1">Remaining</p>
            <p className="text-2xl font-bold text-success">$6,900</p>
            <p className="text-xs text-muted-foreground mt-1">69.0% of budget used</p>
          </Card>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-foreground mb-3">Expense Transactions</h3>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Labor Cost</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                    <div>
                      <p className="font-medium text-foreground">Developers</p>
                      <p className="text-xs text-muted-foreground">Date: 2025-10-08 • Amount: $2,000</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="bg-success/10 text-success">Paid</Badge>
                      <Button variant="ghost" size="sm">Edit</Button>
                      <Button variant="ghost" size="sm" className="text-destructive">Delete</Button>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-foreground mb-2">Material Cost</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                    <div>
                      <p className="font-medium text-foreground">AWS license</p>
                      <p className="text-xs text-muted-foreground">Date: 2025-10-08 • Amount: $500</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="bg-primary/10 text-primary">Recurring</Badge>
                      <Button variant="ghost" size="sm">Edit</Button>
                      <Button variant="ghost" size="sm" className="text-destructive">Delete</Button>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-foreground mb-2">Software</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                    <div>
                      <p className="font-medium text-foreground">Wordpress</p>
                      <p className="text-xs text-muted-foreground">Date: 2025-10-08 • Amount: $300</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="bg-primary/10 text-primary">Recurring</Badge>
                      <Button variant="ghost" size="sm">Edit</Button>
                      <Button variant="ghost" size="sm" className="text-destructive">Delete</Button>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-foreground mb-2">Other</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                    <div>
                      <p className="font-medium text-foreground">UX Designer</p>
                      <p className="text-xs text-muted-foreground">Date: 2025-10-08 • Amount: $300</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="bg-success/10 text-success">Paid</Badge>
                      <Button variant="ghost" size="sm">Edit</Button>
                      <Button variant="ghost" size="sm" className="text-destructive">Delete</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
    </div>
  );
};

export default FoundationBudget;
