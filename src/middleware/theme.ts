import type { Request, Response, NextFunction } from 'express';

export type Theme = 'grayscale' | 'color';

const VALID_THEMES: ReadonlySet<string> = new Set(['grayscale', 'color']);
const DEFAULT_THEME: Theme = 'grayscale';

/**
 * Reads theme from cookie, validates it, and exposes it to templates.
 * Sets `theme-grayscale` or `theme-color` class on body via res.locals.
 */
export function themeMiddleware(req: Request, res: Response, next: NextFunction): void {
  const cookieValue = req.cookies?.theme as string | undefined;
  const theme: Theme = cookieValue && VALID_THEMES.has(cookieValue)
    ? (cookieValue as Theme)
    : DEFAULT_THEME;

  res.locals['theme'] = theme;
  res.locals['themeClass'] = `theme-${theme}`;
  res.locals['themeCss'] = `/css/${theme}.css`;

  next();
}
