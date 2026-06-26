import type { Request, Response, NextFunction } from "express";

/**
 * Custom security headers middleware.
 *
 * Replaces the `helmet` dependency by manually setting security headers
 * on every response. This gives us full control over the header values
 * and avoids pulling in a large dependency for a simple task.
 *
 * Headers set:
 * - Content-Security-Policy: restricts script/style/connect sources
 * - X-Frame-Options: DENY (prevents clickjacking)
 * - X-Content-Type-Options: nosniff (prevents MIME sniffing)
 * - Referrer-Policy: strict-origin-when-cross-origin (privacy-preserving)
 * - X-Powered-By: removed (information disclosure prevention)
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  const isProduction = process.env.NODE_ENV === "production";

  // ── Content-Security-Policy ─────────────────────────────────
  // In dev/test, the frontend (Vite :5173) and backend (Express :3001)
  // run on different ports. A strict 'self' CSP would block cross-origin
  // fetch calls, breaking the session check and all API communication.
  // Production has a single origin (same host serves both).
  if (isProduction) {
    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "connect-src 'self'",
      "font-src 'self'",
    ];
    res.setHeader("Content-Security-Policy", cspDirectives.join("; "));
  }

  // ── Frame protection ────────────────────────────────────────
  res.setHeader("X-Frame-Options", "DENY");

  // ── MIME-sniffing protection ────────────────────────────────
  res.setHeader("X-Content-Type-Options", "nosniff");

  // ── Referrer policy ─────────────────────────────────────────
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // ── Remove fingerprinting header ────────────────────────────
  res.removeHeader("X-Powered-By");

  next();
}
