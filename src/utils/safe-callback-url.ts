import { WEBSITE_URL, ADMIN_DASHBOARD_URL, BASE_URL } from '../functions/env';

/**
 * Normalizes a URL to its origin (protocol + host). Used for allowlist comparison.
 * @param url - Full URL string.
 * @returns Origin string (e.g. "https://example.com") or null if invalid/unsupported protocol.
 */
function toOrigin(url: string): string | null {
  try {
    const u = new URL(url.trim());
    return ['http:', 'https:'].includes(u.protocol) ? `${u.protocol}//${u.host}` : null;
  } catch {
    return null;
  }
}

const ALLOWED_ORIGINS = [WEBSITE_URL, ADMIN_DASHBOARD_URL, BASE_URL]
  .filter(Boolean)
  .map((u) => toOrigin(String(u)))
  .filter((o): o is string => o !== null);

/**
 * Checks whether a callback/redirect URL is allowed. Only same-origin or configured app origins (WEBSITE_URL, ADMIN_DASHBOARD_URL) are allowed.
 * Prevents open redirects.
 * @param url - Callback URL to validate (e.g. from query or body).
 * @returns true if the URL's origin is in the allowlist, false otherwise.
 */
export function isAllowedCallbackUrl(url: string | undefined): boolean {
  if (!url || typeof url !== 'string') return false;
  const origin = toOrigin(url.trim());
  return origin !== null && ALLOWED_ORIGINS.includes(origin);
}

/**
 * Returns a safe callback URL: the provided URL if allowed, otherwise the default.
 * Use for payment or OAuth redirects to avoid open redirect.
 * @param provided - User-supplied or query callback URL.
 * @param defaultUrl - Fallback URL when provided is not allowed.
 * @returns The provided URL (trimmed) if allowed, else defaultUrl, or undefined if both missing.
 */
export function getSafeCallbackUrl(
  provided: string | undefined,
  defaultUrl: string | undefined
): string | undefined {
  if (isAllowedCallbackUrl(provided)) return provided!.trim();
  return defaultUrl;
}
