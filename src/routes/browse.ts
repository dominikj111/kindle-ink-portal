import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import fs from 'node:fs';
import { listDirectory } from '../services/files.js';
import { safePath } from '../utils/paths.js';
import { paginate } from '../utils/pagination.js';

const ITEMS_PER_PAGE = 20;

export const browseRouter: ReturnType<typeof Router> = Router();

/**
 * Shared handler for browsing directories.
 */
function handleBrowse(requestedPath: string, req: Request, res: Response, next: NextFunction): void {
  try {
    const resolved = safePath(requestedPath);

    if (!resolved) {
      res.status(403).render('error.njk', {
        title: 'Forbidden',
        statusCode: 403,
        message: 'Access to this path is not allowed.',
      });
      return;
    }

    // Check the path exists
    let stat: fs.Stats;
    try {
      stat = fs.statSync(resolved);
    } catch {
      res.status(404).render('error.njk', {
        title: 'Not Found',
        statusCode: 404,
        message: `The path "/${requestedPath}" was not found.`,
      });
      return;
    }

    // If it's a file, send it for download
    if (!stat.isDirectory()) {
      res.sendFile(resolved);
      return;
    }

    const page = Math.max(1, parseInt(String(req.query['p'] ?? '1'), 10) || 1);
    const allItems = listDirectory(resolved);
    const { items, totalPages, currentPage } = paginate(allItems, page, ITEMS_PER_PAGE);

    const template = (res.locals['isAjax'] as boolean) ? 'partials/browse-ajax.njk' : 'browse.njk';

    res.render(template, {
      title: `/${requestedPath}` || '/',
      currentPath: requestedPath,
      items,
      page: currentPage,
      totalPages,
      hasPrev: currentPage > 1,
      hasNext: currentPage < totalPages,
      prevPage: currentPage - 1,
      nextPage: currentPage + 1,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /
 * Root directory listing.
 */
browseRouter.get('/', (req: Request, res: Response, next: NextFunction): void => {
  handleBrowse('', req, res, next);
});

/**
 * GET /*path
 * File browser — lists directory contents with pagination.
 * Express 5 requires named wildcard: *path captures the rest of the URL.
 */
browseRouter.get('/*path', (req: Request, res: Response, next: NextFunction): void => {
  const rawPath = (req.params as Record<string, string | string[]>)['path'] ?? '';
  const requestedPath = Array.isArray(rawPath) ? rawPath.join('/') : rawPath;
  handleBrowse(requestedPath, req, res, next);
});
