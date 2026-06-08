import { Button } from "@/components/ui/button";
import { LucideIcon, Inbox } from "lucide-react";

/** Consistent empty-state block: an icon, a title, a one-line explanation and
 *  (optionally) a primary call-to-action. Use on any list/board that can be
 *  empty so a first-time user always sees a clear next step, not a blank panel. */
export default function EmptyState({
  icon: Icon = Inbox, title, description, actionLabel, onAction, secondary,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondary?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-50 to-fuchsia-50 dark:from-purple-900/20 dark:to-fuchsia-900/20 flex items-center justify-center mb-4">
        <Icon className="h-7 w-7 text-purple-500" />
      </div>
      <h3 className="text-base font-semibold mb-1">{title}</h3>
      {description && <p className="text-sm text-muted-foreground max-w-sm mb-4">{description}</p>}
      {actionLabel && onAction && (
        <Button onClick={onAction} className="gap-1.5">{actionLabel}</Button>
      )}
      {secondary && <div className="mt-3">{secondary}</div>}
    </div>
  );
}
