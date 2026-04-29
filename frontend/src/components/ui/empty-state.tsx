import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  /** Lucide icon component to render at the top */
  icon?: LucideIcon;
  /** Primary heading (e.g. "No milestones yet") */
  title: string;
  /** Optional descriptive paragraph below the title */
  description?: string;
  /** Optional CTA — usually a Button or anchor */
  action?: ReactNode;
  /** Render inside a Card wrapper (default true). When false, returns a plain div for inline use. */
  asCard?: boolean;
  /** Additional className for the outer wrapper */
  className?: string;
}

/**
 * Shared empty-state pattern. Replaces ad-hoc inline empty placeholders so
 * spacing, typography and CTA placement stay consistent across screens.
 *
 * Strings should be passed in already-translated; this component does not
 * call into the i18n layer itself.
 */
export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  asCard = true,
  className,
}: EmptyStateProps) => {
  const inner = (
    <>
      {Icon && <Icon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />}
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-muted-foreground mb-4">{description}</p>
      )}
      {action && <div className="flex justify-center">{action}</div>}
    </>
  );

  if (asCard) {
    return (
      <Card className={cn("p-8 text-center", className)}>{inner}</Card>
    );
  }
  return (
    <div className={cn("text-center py-8", className)}>{inner}</div>
  );
};

export default EmptyState;
