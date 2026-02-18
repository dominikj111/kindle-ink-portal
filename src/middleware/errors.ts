import type { Request, Response, NextFunction } from 'express';

/**
 * 404 handler — renders a not-found page.
 */
export function notFoundHandler(req: Request, res: Response, _next: NextFunction): void {
  res.status(404).render('error.njk', {
    title: 'Not Found',
    statusCode: 404,
    message: `The path "${req.path}" was not found.`,
  });
}

/**
 * Global error handler — renders a generic error page.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  console.error('[ERROR]', err.stack ?? err.message);

  const statusCode = 500;
  res.status(statusCode).render('error.njk', {
    title: 'Server Error',
    statusCode,
    message:
      process.env['NODE_ENV'] === 'production'
        ? 'An internal error occurred.'
        : err.message,
  });
}
