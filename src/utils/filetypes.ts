/**
 * Extension-based file type detection.
 * Returns a category string used for display styling.
 */

const CATEGORY_MAP: Record<string, string> = {
  // Documents
  '.txt': 'text',
  '.md': 'text',
  '.pdf': 'document',
  '.doc': 'document',
  '.docx': 'document',
  '.epub': 'document',
  '.mobi': 'document',
  '.azw3': 'document',

  // Images
  '.jpg': 'image',
  '.jpeg': 'image',
  '.png': 'image',
  '.gif': 'image',
  '.svg': 'image',
  '.webp': 'image',
  '.bmp': 'image',

  // Audio
  '.mp3': 'audio',
  '.wav': 'audio',
  '.flac': 'audio',
  '.ogg': 'audio',
  '.m4a': 'audio',
  '.aac': 'audio',

  // Video
  '.mp4': 'video',
  '.mkv': 'video',
  '.avi': 'video',
  '.mov': 'video',
  '.webm': 'video',

  // Archives
  '.zip': 'archive',
  '.tar': 'archive',
  '.gz': 'archive',
  '.bz2': 'archive',
  '.7z': 'archive',
  '.rar': 'archive',

  // Code
  '.ts': 'code',
  '.js': 'code',
  '.py': 'code',
  '.html': 'code',
  '.css': 'code',
  '.json': 'code',
  '.xml': 'code',
  '.yaml': 'code',
  '.yml': 'code',
  '.sh': 'code',
};

export function getFileCategory(extension: string): string {
  return CATEGORY_MAP[extension.toLowerCase()] ?? 'file';
}
