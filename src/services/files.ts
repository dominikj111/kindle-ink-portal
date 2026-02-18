import fs from 'node:fs';
import path from 'node:path';
import { getFileCategory } from '../utils/filetypes.js';

export interface FileItem {
  name: string;
  isDirectory: boolean;
  size: number;
  modified: Date;
  extension: string;
  category: string;
  href: string;
}

/**
 * Lists directory contents, returning sorted FileItem[].
 * Directories first, then files, both alphabetically.
 */
export function listDirectory(dirPath: string): FileItem[] {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const basePath = path.relative(getBrowseRoot(), dirPath);

  const items: FileItem[] = entries
    .filter((entry) => !entry.name.startsWith('.'))
    .map((entry): FileItem => {
      const fullPath = path.join(dirPath, entry.name);
      const stat = fs.statSync(fullPath);
      const ext = path.extname(entry.name).toLowerCase();
      const itemPath = basePath ? `${basePath}/${entry.name}` : entry.name;

      return {
        name: entry.name,
        isDirectory: entry.isDirectory(),
        size: stat.size,
        modified: stat.mtime,
        extension: ext,
        category: entry.isDirectory() ? 'folder' : getFileCategory(ext),
        href: `/${itemPath}${entry.isDirectory() ? '/' : ''}`,
      };
    });

  // Sort: directories first, then alphabetically
  items.sort((a, b) => {
    if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return items;
}

/**
 * Returns the configured root directory for browsing.
 * Defaults to the user's home directory.
 */
export function getBrowseRoot(): string {
  return process.env['BROWSE_ROOT'] ?? process.env['HOME'] ?? '/';
}
