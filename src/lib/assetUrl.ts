/** Absolute URL for API-hosted files (e.g. PDF certificates under `/uploads/...`). */
export function resolveUploadedFileUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const base =
    (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/api\/?$/, '') || 'http://localhost:5000';
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
}
