import { Router } from 'express';
import type { Request, Response } from 'express';

export const apiRouter: ReturnType<typeof Router> = Router();

/**
 * POST /api/log
 * Client-side error logging endpoint.
 */
apiRouter.post('/log', (req: Request, res: Response): void => {
  const { level, message, url, line, col } = req.body as Record<string, unknown>;
  const timestamp = new Date().toISOString();
  console.warn(`[CLIENT ${String(level ?? 'error').toUpperCase()}] ${timestamp}`, {
    message,
    url,
    line,
    col,
  });
  res.json({ ok: true });
});

/**
 * POST /api/theme
 * Sets theme cookie and returns success.
 */
apiRouter.post('/theme', (req: Request, res: Response): void => {
  const { theme } = req.body as Record<string, unknown>;

  if (theme !== 'grayscale' && theme !== 'color') {
    res.status(400).json({ error: 'Invalid theme. Use "grayscale" or "color".' });
    return;
  }

  res.cookie('theme', theme, {
    httpOnly: false,
    maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
    sameSite: 'lax',
  });

  res.json({ ok: true, theme });
});
