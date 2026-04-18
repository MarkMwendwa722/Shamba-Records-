import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';

export type NotificationType = 'observation' | 'stage_change' | 'assignment' | 'at_risk';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  fieldId?: number;
  timestamp: string;
  read: boolean;
}

interface NotificationContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  markAllRead: () => void;
  markRead: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!user) {
      esRef.current?.close();
      esRef.current = null;
      setNotifications([]);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    const es = new EventSource(`/api/notifications/stream?token=${encodeURIComponent(token)}`);
    esRef.current = es;

    es.onmessage = (event: MessageEvent) => {
      try {
        const payload = JSON.parse(event.data as string) as { type: string } & Omit<AppNotification, 'read'>;
        // Ignore the initial handshake event
        if ((payload.type as string) === 'connected') return;
        setNotifications((prev) => [{ ...(payload as Omit<AppNotification, 'read'>), read: false }, ...prev].slice(0, 50));
      } catch { /* ignore parse errors */ }
    };

    // EventSource reconnects automatically on error — no manual handling needed

    return () => {
      es.close();
      esRef.current = null;
    };
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = useCallback(
    () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true }))),
    [],
  );

  const markRead = useCallback(
    (id: string) => setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n))),
    [],
  );

  const clearAll = useCallback(() => setNotifications([]), []);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAllRead, markRead, clearAll }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
