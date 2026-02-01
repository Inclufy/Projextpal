// ============================================================
// TOAST HOOK - Simple implementation
// Replace with shadcn/ui toast when available
// ============================================================

import { useState, useCallback } from 'react';

interface Toast {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export function useToast() {
  const toast = useCallback(({ title, description, variant }: Toast) => {
    // Simple alert for now - replace with proper toast
    console.log(`[${variant || 'info'}] ${title}: ${description || ''}`);
    
    // Or use browser notification
    if (variant !== 'destructive') {
      // You can replace this with a proper toast library
      console.log('✅', title, description);
    } else {
      console.error('❌', title, description);
    }
  }, []);

  return { toast };
}
