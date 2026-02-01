import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export function CashFlowChart() {
  const data = [
    { quarter: "Q1", value: 12.5, percentage: 30 },
    { quarter: "Q2", value: 18.2, percentage: 45 },
    { quarter: "Q3", value: 22.8, percentage: 57 },
    { quarter: "Q4", value: 35.6, percentage: 89 },
  ];

  return (
    <Card className="border-border/50 hover:shadow-lg transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Quarterly Cash Flow</span>
          <div className="flex items-center gap-1 text-sm font-normal text-success">
            <TrendingUp className="h-4 w-4" />
            <span>+24%</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Bar Chart */}
          <div className="flex items-end justify-between h-48 gap-3">
            {data.map((item, index) => (
              <div key={item.quarter} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full relative group">
                  {/* Bar */}
                  <div 
                    className="w-full bg-gradient-to-t from-primary to-primary/60 rounded-t-lg transition-all duration-500 hover:from-primary hover:to-primary/80 relative overflow-hidden"
                    style={{ 
                      height: `${item.percentage}%`,
                      minHeight: '40px'
                    }}
                  >
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-transparent" />
                  </div>
                  
                  {/* Value tooltip */}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover text-popover-foreground px-2 py-1 rounded text-xs font-semibold whitespace-nowrap shadow-lg">
                    ${item.value}K
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Labels */}
          <div className="flex justify-between px-1">
            {data.map((item) => (
              <div key={item.quarter} className="flex-1 text-center">
                <div className="text-sm font-medium text-foreground">{item.quarter}</div>
                <div className="text-xs text-muted-foreground">${item.value}K</div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <span className="text-sm text-muted-foreground">Total Cash Flow</span>
            <span className="text-lg font-bold text-foreground">$89.1K</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
