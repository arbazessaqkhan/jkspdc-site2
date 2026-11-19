/**
 * Derive a human-readable file format (e.g. "PDF") from a document URL.
 * Used as a fallback for records uploaded before formats were captured.
 */
export function detectFileFormat(url?: string | null): string | null {
  if (!url) return null;
  const clean = url.split('?')[0].split('#')[0];
  const dot = clean.lastIndexOf('.');
  if (dot === -1) return null;
  const ext = clean.slice(dot + 1);
  if (!ext || ext.length > 5 || !/^[a-z0-9]+$/i.test(ext)) return null;
  return ext.toUpperCase();
}
