/**
 * Rate Limit Service — RESUMEX // AI
 * Tracks and broadcasts real-time API rate limits and remaining optimizer scans.
 */

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  used: number;
  resetInSeconds: number;
  resetTime?: string;
  windowMinutes: number;
}

const DEFAULT_RATE_LIMIT: RateLimitInfo = {
  limit: 30,
  remaining: 30,
  used: 0,
  resetInSeconds: 900,
  windowMinutes: 15,
};

let cachedRateLimit: RateLimitInfo = { ...DEFAULT_RATE_LIMIT };

/**
 * Fetch current rate limit status from server without consuming a scan
 */
export const fetchRateLimit = async (): Promise<RateLimitInfo> => {
  try {
    const res = await fetch('/api/rate-limit');
    if (res.ok) {
      const data = await res.json();
      const info: RateLimitInfo = {
        limit: typeof data.limit === 'number' ? data.limit : 30,
        remaining: typeof data.remaining === 'number' ? data.remaining : 30,
        used: typeof data.used === 'number' ? data.used : 0,
        resetInSeconds: typeof data.resetInSeconds === 'number' ? data.resetInSeconds : 900,
        resetTime: data.resetTime,
        windowMinutes: typeof data.windowMinutes === 'number' ? data.windowMinutes : 15,
      };
      cachedRateLimit = info;
      broadcastRateLimit(info);
      return info;
    }
  } catch (err) {
    console.warn('[RateLimitService] Failed to fetch rate limit:', err);
  }
  return cachedRateLimit;
};

/**
 * Broadcast rate limit updates to all components
 */
export const broadcastRateLimit = (info: RateLimitInfo): void => {
  cachedRateLimit = info;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('resumex:rate_limit_updated', { detail: info }));
  }
};

/**
 * Inspect standard rate limit headers from fetch response and broadcast updates
 */
export const updateRateLimitFromHeaders = (headers: Headers): void => {
  const limitHeader = headers.get('ratelimit-limit') || headers.get('x-ratelimit-limit');
  const remainingHeader = headers.get('ratelimit-remaining') || headers.get('x-ratelimit-remaining');
  const resetHeader = headers.get('ratelimit-reset') || headers.get('x-ratelimit-reset');

  if (limitHeader !== null && remainingHeader !== null) {
    const limit = parseInt(limitHeader, 10);
    const remaining = parseInt(remainingHeader, 10);
    const reset = resetHeader ? parseInt(resetHeader, 10) : 900;

    const info: RateLimitInfo = {
      limit: isNaN(limit) ? 30 : limit,
      remaining: isNaN(remaining) ? 30 : Math.max(0, remaining),
      used: Math.max(0, (isNaN(limit) ? 30 : limit) - (isNaN(remaining) ? 30 : remaining)),
      resetInSeconds: isNaN(reset) ? 900 : Math.max(0, reset),
      windowMinutes: 15,
    };
    broadcastRateLimit(info);
  }
};

export const getCachedRateLimit = (): RateLimitInfo => cachedRateLimit;
