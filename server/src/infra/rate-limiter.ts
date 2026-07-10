import type { Request, Response, NextFunction } from "express";

interface Entry {
  count: number;
  resetAt: number;
}

export interface RateLimiterOptions {
  windowMs: number;
  max: number;
  getTier?: (userId: string) => Promise<string | undefined>;
}

// ── Tier-to-limits mapping ──────────────────────────────────

const TIER_LIMITS: Record<string, { windowMs: number; max: number }> = {
  relaxed: { windowMs: 60_000, max: 60 },
  default: { windowMs: 60_000, max: 30 },
  strict:  { windowMs: 60_000, max: 10 },
};

const IP_FALLBACK = { windowMs: 60_000, max: 20 };

// ── Middleware factory ───────────────────────────────────────

/**
 * Creates an in-memory rate limiter middleware.
 *
 * When `getTier` is provided and `req.userId` is present, resolves the user's
 * rate-limit tier and applies the corresponding per-user limits.
 *
 * Falls back to IP-based limiting when:
 *   - `getTier` is not provided (backward-compatible, uses the original `windowMs`/`max`)
 *   - The user is not authenticated (uses `IP_FALLBACK` — 20 req / 60s)
 *   - The tier lookup fails or returns an unknown tier (uses `IP_FALLBACK`)
 *
 * Sets standard `X-RateLimit-*` headers and returns 429 with `Retry-After`
 * when the limit is exceeded. Stale entries are periodically cleaned up via
 * a detached interval.
 */
export function rateLimiter({ windowMs, max, getTier }: RateLimiterOptions) {
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

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let key: string;
    let limits: { windowMs: number; max: number };

    if (getTier) {
      if (req.userId) {
        try {
          const tier = await getTier(req.userId);
          if (tier && TIER_LIMITS[tier]) {
            // Per-user tier: scope key by userId:tier
            key = `${req.userId}:${tier}`;
            limits = TIER_LIMITS[tier];
          } else {
            // Tier lookup succeeded but returned undefined/unknown → IP_FALLBACK
            key = req.ip ?? req.socket.remoteAddress ?? "unknown";
            limits = IP_FALLBACK;
          }
        } catch {
          // Tier lookup threw (e.g. DB error) → IP_FALLBACK
          key = req.ip ?? req.socket.remoteAddress ?? "unknown";
          limits = IP_FALLBACK;
        }
      } else {
        // Unauth'd with getTier provided → IP_FALLBACK (spec REQ-AI-004)
        key = req.ip ?? req.socket.remoteAddress ?? "unknown";
        limits = IP_FALLBACK;
      }
    } else {
      // No getTier → IP with original limits (backward compatible)
      key = req.ip ?? req.socket.remoteAddress ?? "unknown";
      limits = { windowMs, max };
    }

    const now = Date.now();

    let entry = clients.get(key);

    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + limits.windowMs };
      clients.set(key, entry);
    }

    entry.count++;

    const remaining = Math.max(0, limits.max - entry.count);
    const resetEpoch = Math.ceil(entry.resetAt / 1000);

    res.setHeader("X-RateLimit-Limit", limits.max);
    res.setHeader("X-RateLimit-Remaining", remaining);
    res.setHeader("X-RateLimit-Reset", resetEpoch);

    if (entry.count > limits.max) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      res.setHeader("Retry-After", retryAfter);
      res.status(429).json({ error: "Too many requests, please try again later." });
      return;
    }

    next();
  };
}
