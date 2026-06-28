/**
 * Returns a safe in-app path for post-login redirect. Rejects open redirects and protocol-relative URLs.
 */
export function getSafeRedirectUrl(raw: string | null): string | null {
  if (raw == null || typeof raw !== 'string') return null;
  let s = raw.trim();
  try {
    s = decodeURIComponent(s);
  } catch {
    return null;
  }
  if (!s.startsWith('/') || s.startsWith('//')) return null;
  if (s.includes('\n') || s.includes('\r')) return null;
  return s;
}
