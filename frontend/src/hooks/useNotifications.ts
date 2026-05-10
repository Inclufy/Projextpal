import { useCallback, useEffect, useState } from 'react';

import { notificationsApi, type Notification } from '@/lib/api';

const POLL_INTERVAL_MS = 60_000; // 60s — cheap polling for v1; replace with WS later

export function useNotifications() {
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [list, count] = await Promise.all([
        notificationsApi.list(false),
        notificationsApi.unreadCount(),
      ]);
      const arr = Array.isArray(list) ? list : list.results ?? [];
      setItems(arr);
      setUnread(count.unread);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  const markRead = useCallback(async (id: number) => {
    try {
      await notificationsApi.markRead(id);
      setItems((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n)),
      );
      setUnread((u) => Math.max(0, u - 1));
    } catch {
      /* ignore — UI will refresh on next poll */
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await notificationsApi.markAllRead();
      setItems((prev) => prev.map((n) => ({ ...n, is_read: true, read_at: new Date().toISOString() })));
      setUnread(0);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    refresh();
    const handle = window.setInterval(refresh, POLL_INTERVAL_MS);
    return () => window.clearInterval(handle);
  }, [refresh]);

  return { items, unread, loading, error, refresh, markRead, markAllRead };
}
