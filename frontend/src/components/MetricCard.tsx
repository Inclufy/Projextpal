import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: string;
  isNeutral?: boolean;
  className?: string;
}

export function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  isNeutral = false,
  className = "" 
}: MetricCardProps) {
  return (
    <Card className={cn(
      "group relative overflow-hidden border-border/50 bg-card hover:shadow-lg transition-all duration-300 hover:scale-[1.02]",
      className
    )}>
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardContent className="p-6 relative">
        <div className="flex items-start justify-between mb-4">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            {Icon && <Icon className="h-5 w-5" />}
          </div>
          {trend && (
            <span className={cn(
              "text-xs font-semibold px-2 py-1 rounded-full",
              isNeutral 
                ? "bg-muted text-muted-foreground" 
                : "bg-success/10 text-success"
            )}>
              {trend}
            </span>
          )}
        </div>
        
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <p className="text-3xl font-bold text-foreground tracking-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
