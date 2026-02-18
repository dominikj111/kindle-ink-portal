import { Router } from 'express';
import type { Request, Response } from 'express';

export const demoRouter: ReturnType<typeof Router> = Router();

/**
 * GET /demo
 * E-ink refresh demonstration page.
 */
demoRouter.get('/', (_req: Request, res: Response): void => {
  res.render('demo.njk', {
    title: 'Refresh Demo',
  });
});
