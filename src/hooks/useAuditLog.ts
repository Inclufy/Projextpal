import { useCallback } from 'react';
import api from '../services/api';

interface AuditLogEntry {
  action: string;
  resource_type?: string;
  resource_id?: string;
  details?: Record<string, unknown>;
}

/**
 * Hook for logging user actions to the Django backend audit-logs endpoint.
 * Silently ignores errors to avoid breaking the calling flow.
 */
export function useAuditLog() {
  const log = useCallback(async (entry: AuditLogEntry) => {
    try {
      await api.post('/audit-logs/', {
        action: entry.action,
        resource_type: entry.resource_type ?? null,
        resource_id: entry.resource_id ?? null,
        details: entry.details ?? null,
        created_at: new Date().toISOString(),
      });
    } catch {
      // Audit logging must never throw — best effort only
    }
  }, []);

  return { log };
}
