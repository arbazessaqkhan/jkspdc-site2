/**
 * OWASP & GIGW 3.0 compliant HTML sanitizer for rendering rich text content safely.
 * Strips script tags, dangerous tags, inline event handlers (onerror, onload, onclick), and javascript: URIs.
 * Automatically normalizes external links so they open directly without prepending the current domain.
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

  // 5. Fix links (href="...") so external domains don't get prepended with local site root:
  // e.g. href="www.google.com" -> href="https://www.google.com" target="_blank"
  // e.g. href="google.com" -> href="https://google.com" target="_blank"
  clean = clean.replace(/href=(["'])([^"']+)\1/gi, (match, quote, url) => {
    let trimmedUrl = url.trim();
    if (!trimmedUrl || trimmedUrl.startsWith('#') || trimmedUrl.startsWith('/') || trimmedUrl.startsWith('mailto:') || trimmedUrl.startsWith('tel:')) {
      return `href="${trimmedUrl}"`;
    }
    if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
      return `href="${trimmedUrl}" target="_blank" rel="noopener noreferrer"`;
    }
    // External link missing http/https protocol prefix: prepend https:// and set target="_blank"
    return `href="https://${trimmedUrl}" target="_blank" rel="noopener noreferrer"`;
  });

  return clean;
}
