/**
 * Formats email addresses for government web standards & spam protection:
 * Replaces '@' with '[at]' and '.' with '[dot]'
 * Example: md-jkspdcl@jk.gov.in -> md-jkspdcl[at]jk[dot]gov[dot]in
 */
export function formatEmail(email?: string): string {
  if (!email) return '';
  return email.replace(/@/g, '[at]').replace(/\./g, '[dot]');
}
