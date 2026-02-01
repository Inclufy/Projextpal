import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ProjectStatusChart() {
  const stats = [
    { label: "Completed", value: 3, color: "hsl(var(--success))", percentage: 30 },
    { label: "In Progress", value: 2, color: "hsl(var(--primary))", percentage: 20 },
    { label: "Pending", value: 2, color: "hsl(var(--warning))", percentage: 20 },
    { label: "Planning", value: 3, color: "hsl(var(--muted))", percentage: 30 },
  ];

  return (
    <Card className="border-border/50 hover:shadow-lg transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Project Status Distribution</span>
          <span className="text-sm font-normal text-muted-foreground">Total: 10 Projects</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* Donut Chart */}
          <div className="relative w-48 h-48 flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {stats.map((stat, index) => {
                const prevPercentages = stats.slice(0, index).reduce((sum, s) => sum + s.percentage, 0);
                const circumference = 2 * Math.PI * 35;
                const offset = (prevPercentages / 100) * circumference;
                const dashArray = `${(stat.percentage / 100) * circumference} ${circumference}`;
                
                return (
                  <circle
                    key={stat.label}
                    cx="50"
                    cy="50"
                    r="35"
                    fill="none"
                    stroke={stat.color}
                    strokeWidth="12"
                    strokeDasharray={dashArray}
                    strokeDashoffset={-offset}
                    className="transition-all duration-500 hover:opacity-80"
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">10</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 grid grid-cols-2 gap-4 w-full">
            {stats.map((stat) => (
              <div key={stat.label} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div 
                  className="w-4 h-4 rounded-full mt-0.5 flex-shrink-0" 
                  style={{ backgroundColor: stat.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground">{stat.label}</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-foreground">{stat.value}</span>
                    <span className="text-xs text-muted-foreground">({stat.percentage}%)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
