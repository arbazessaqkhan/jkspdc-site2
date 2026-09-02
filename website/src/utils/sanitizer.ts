/**
 * OWASP & GIGW 3.0 compliant HTML sanitizer for rendering rich text content safely.
 * Strips script tags, dangerous tags, inline event handlers (onerror, onload, onclick), and javascript: URIs.
 */
export function sanitizeHtml(htmlString?: string | null): string {
  if (!htmlString) return '';

  let clean = htmlString;

  // 1. Remove script tags and their contents
  clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // 2. Remove inline event handlers (e.g. onerror="...", onload="...", onclick="...")
  clean = clean.replace(/\s*on\w+\s*=\s*(["'])[\s\S]*?\1/gi, '');
  clean = clean.replace(/\s*on\w+\s*=\s*[^>\s]+/gi, '');

  // 3. Remove javascript: pseudo-protocol in href or src attributes
  clean = clean.replace(/(href|src)\s*=\s*(["'])\s*javascript:[\s\S]*?\2/gi, '$1="#"');
  clean = clean.replace(/(href|src)\s*=\s*javascript:[^\s>]+/gi, '$1="#"');

  // 4. Remove dangerous tags: iframe, object, embed, applet, form, base, meta
  clean = clean.replace(/<\/?(iframe|object|embed|applet|form|base|meta)\b[^>]*>/gi, '');

  return clean;
}
