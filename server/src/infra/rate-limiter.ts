import type { Request, Response, NextFunction } from "express";

interface Entry {
  count: number;
  resetAt: number;
}

export interface RateLimiterOptions {
  windowMs: number;
  max: number;
}

/**
 * Creates an in-memory rate limiter middleware.
 *
 * Tracks requests by IP, sets standard `X-RateLimit-*` headers, and
 * returns 429 with `Retry-After` when the limit is exceeded.
 * Stale entries are periodically cleaned up via a detached interval.
 */
export function rateLimiter({ windowMs, max }: RateLimiterOptions) {
  const clients = new Map<string, Entry>();

  // Periodic cleanup - .unref() so it doesn't keep the process alive
  const cleanup = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of clients) {
      if (now > entry.resetAt) {
        clients.delete(key);
      }
    }
  }, windowMs);
  cleanup.unref();

  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip ?? req.socket.remoteAddress ?? "unknown";
    const now = Date.now();

    let entry = clients.get(ip);

    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + windowMs };
      clients.set(ip, entry);
    }

    entry.count++;

    const remaining = Math.max(0, max - entry.count);
    const resetEpoch = Math.ceil(entry.resetAt / 1000);

    res.setHeader("X-RateLimit-Limit", max);
    res.setHeader("X-RateLimit-Remaining", remaining);
    res.setHeader("X-RateLimit-Reset", resetEpoch);

    if (entry.count > max) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      res.setHeader("Retry-After", retryAfter);
      res.status(429).json({ error: "Too many requests, please try again later." });
      return;
    }

    next();
  };
}
