import type { Request, Response, NextFunction } from "express";
import { parseCookies } from "../infra/request.js";
import { verify } from "../infra/http.js";

const COOKIE_NAME = "nexus-talent-session";

/**
 * Extract and verify the JWT from the session cookie.
 * Returns the userId if valid, or null otherwise.
 */
function getUserIdFromCookie(cookieHeader: string | undefined): string | null {
  const cookies = parseCookies(cookieHeader);
  const token = cookies[COOKIE_NAME];
  if (!token) return null;

  const secret = process.env.JWT_SECRET;
  if (!secret) return null;

  const payload = verify(token, secret);
  if (!payload || typeof payload.userId !== "string") return null;

  return payload.userId;
}

/**
 * Require a valid authenticated session.
 * Responds with 401 if the session cookie is missing, expired, or invalid.
 *
 * Supports two auth mechanisms:
 * 1. Cookie: standard httpOnly cookie (browser → Vercel proxy → here)
 * 2. X-User-Id header: set by Vercel Edge Middleware after reading the httpOnly cookie
 *    This solves the cross-domain cookie issue where the browser can't send
 *    a cookie set by Render (.nexustalent-api.onrender.com) to Vercel (.nexustalent.vercel.app).
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  // Primary: X-User-Id header from trusted Vercel Edge Middleware
  const headerUserId = req.headers["x-user-id"];
  if (typeof headerUserId === "string" && headerUserId.length > 0) {
    req.userId = headerUserId;
    next();
    return;
  }

  // Fallback: direct cookie (for local dev or direct Render access)
  const cookieUserId = getUserIdFromCookie(req.headers.cookie);
  if (cookieUserId) {
    req.userId = cookieUserId;
    next();
    return;
  }

  res.status(401).json({ error: "Authentication required" });
}

/**
 * Optionally attach the authenticated user if a valid session exists.
 * Continues silently - req.userId remains undefined when unauthenticated.
 *
 * Supports both X-User-Id header (Vercel Edge) and direct cookie.
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  const headerUserId = req.headers["x-user-id"];
  if (typeof headerUserId === "string" && headerUserId.length > 0) {
    req.userId = headerUserId;
    next();
    return;
  }

  const cookieUserId = getUserIdFromCookie(req.headers.cookie);
  if (cookieUserId) {
    req.userId = cookieUserId;
  }

  next();
}
