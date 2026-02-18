import path from 'node:path';
import { getBrowseRoot } from '../services/files.js';

/**
 * Validates and resolves a user-provided path against the browse root.
 * Returns the resolved absolute path if safe, or null if the path
 * attempts to escape the browse root (directory traversal).
 */
export function safePath(requestedPath: string): string | null {
  const root = getBrowseRoot();
  const resolved = path.resolve(root, requestedPath);

  // Ensure the resolved path is within the root
  if (!resolved.startsWith(root)) {
    return null;
  }

  return resolved;
}

/**
 * Splits a path into breadcrumb segments for navigation.
 */
export function breadcrumbs(requestedPath: string): Array<{ name: string; href: string }> {
  if (!requestedPath || requestedPath === '/') {
    return [];
  }

  const parts = requestedPath.split('/').filter(Boolean);
  const crumbs: Array<{ name: string; href: string }> = [];
  let href = '';

  for (const part of parts) {
    href += `/${part}`;
    crumbs.push({ name: part, href });
  }

  return crumbs;
}
