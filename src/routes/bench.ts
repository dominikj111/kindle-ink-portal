import { Router } from 'express';
import type { Request, Response } from 'express';

export const benchRouter: ReturnType<typeof Router> = Router();

/**
 * GET /bench
 * JS performance benchmark page.
 */
benchRouter.get('/', (_req: Request, res: Response): void => {
  res.render('bench.njk', {
    title: 'JS Benchmark',
  });
});
