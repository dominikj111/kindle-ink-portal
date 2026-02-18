import { Router } from 'express';
import type { Request, Response } from 'express';

export const pomodoroRouter: ReturnType<typeof Router> = Router();

/**
 * GET /pomodoro
 * Pomodoro timer page — landscape-optimized countdown.
 */
pomodoroRouter.get('/', (_req: Request, res: Response): void => {
  res.render('pomodoro.njk', {
    title: 'Pomodoro',
  });
});
