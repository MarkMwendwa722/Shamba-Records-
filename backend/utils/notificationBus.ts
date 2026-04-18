import type { Response } from 'express';
import crypto from 'crypto';

export interface NotificationPayload {
  id: string;
  type: 'observation' | 'stage_change' | 'assignment' | 'at_risk' | 'connected';
  title: string;
  message: string;
  fieldId?: number;
  timestamp: string;
}

// Map: userId -> Set of SSE response objects (supports multiple tabs per user)
const clients = new Map<number, Set<Response>>();

export const addClient = (userId: number, res: Response): void => {
  if (!clients.has(userId)) clients.set(userId, new Set());
  clients.get(userId)!.add(res);
};

export const removeClient = (userId: number, res: Response): void => {
  const set = clients.get(userId);
  if (!set) return;
  set.delete(res);
  if (set.size === 0) clients.delete(userId);
};

export const sendToUsers = (userIds: number[], payload: NotificationPayload): void => {
  const data = `data: ${JSON.stringify(payload)}\n\n`;
  for (const userId of userIds) {
    const set = clients.get(userId);
    if (!set) continue;
    for (const res of set) {
      res.write(data);
    }
  }
};

export const makeNotification = (
  type: NotificationPayload['type'],
  title: string,
  message: string,
  fieldId?: number,
): NotificationPayload => ({
  id: crypto.randomUUID(),
  type,
  title,
  message,
  ...(fieldId !== undefined ? { fieldId } : {}),
  timestamp: new Date().toISOString(),
});
