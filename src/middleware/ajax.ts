import type { Request, Response, NextFunction } from 'express';

/**
 * Detects AJAX requests via the X-Requested-With header.
 * When a request is AJAX, templates render the partial (content block only)
 * instead of the full page layout.
 */
export function ajaxMiddleware(req: Request, res: Response, next: NextFunction): void {
  const isAjax = req.headers['x-requested-with'] === 'XMLHttpRequest';
  res.locals['isAjax'] = isAjax;
  next();
}
