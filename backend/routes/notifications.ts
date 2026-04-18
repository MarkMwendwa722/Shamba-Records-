import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { addClient, removeClient } from '../utils/notificationBus';

const router = Router();

// GET /api/notifications/stream
// EventSource (SSE) doesn't support custom headers, so the JWT is passed as ?token=
router.get('/stream', (req: Request, res: Response): void => {
  const token = req.query['token'] as string | undefined;
  if (!token) {
    res.status(401).end();
    return;
  }

  let userId: number;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET ?? 'smartseason_secret') as { id: number };
    userId = decoded.id;
  } catch {
    res.status(401).end();
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // disable Nginx / Render proxy buffering
  res.flushHeaders();

  addClient(userId, res);

  // Confirm connection to the client
  res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);

  // Heartbeat every 25 s to keep the connection alive through proxies
  const heartbeat = setInterval(() => res.write(':heartbeat\n\n'), 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
    removeClient(userId, res);
  });
});

export default router;
