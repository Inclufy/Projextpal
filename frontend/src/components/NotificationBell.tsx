import { Bell, CheckCheck } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNotifications } from '@/hooks/useNotifications';

const KIND_LABEL: Record<string, string> = {
  task_assigned: 'Task assigned',
  comment_mention: 'Mention',
  project_member_added: 'Added to project',
  deadline_approaching: 'Deadline',
};

function formatRelative(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.round(ms / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}

export function NotificationBell() {
  const { items, unread, markRead, markAllRead } = useNotifications();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label={unread > 0 ? `${unread} unread notifications` : 'Notifications'}
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground/70 hover:bg-accent hover:text-foreground transition-colors"
          type="button"
        >
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
              {unread > 99 ? '99+' : unread}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[360px] max-h-[480px] overflow-y-auto">
        <div className="flex items-center justify-between px-2 py-1">
          <DropdownMenuLabel className="px-0 py-0">Notifications</DropdownMenuLabel>
          {unread > 0 && (
            <button
              type="button"
              onClick={() => markAllRead()}
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <CheckCheck className="h-3 w-3" />
              Mark all read
            </button>
          )}
        </div>
        <DropdownMenuSeparator />

        {items.length === 0 ? (
          <div className="px-3 py-8 text-center text-sm text-muted-foreground">
            No notifications yet.
          </div>
        ) : (
          items.slice(0, 12).map((n) => (
            <DropdownMenuItem
              key={n.id}
              asChild
              className={`flex flex-col items-start gap-0.5 ${n.is_read ? '' : 'bg-primary/5'}`}
            >
              <a
                href={n.target_url || '#'}
                onClick={() => !n.is_read && markRead(n.id)}
                className="block w-full px-3 py-2"
              >
                <div className="flex items-center gap-2 w-full">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {KIND_LABEL[n.kind] ?? n.kind}
                  </span>
                  <span className="ml-auto text-[10px] text-muted-foreground">
                    {formatRelative(n.created_at)}
                  </span>
                </div>
                <div className="text-sm font-medium text-foreground">{n.title}</div>
                {n.body && (
                  <div className="text-xs text-muted-foreground line-clamp-2">{n.body}</div>
                )}
              </a>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default NotificationBell;
