import { Router } from 'express';
import type { Request, Response } from 'express';

export const countdownRouter: ReturnType<typeof Router> = Router();

/**
 * GET /countdown
 * Simple countdown timer page.
 */
countdownRouter.get('/', (_req: Request, res: Response): void => {
  res.render('countdown.njk', {
    title: 'Countdown',
  });
});
