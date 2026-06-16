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
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const userId = getUserIdFromCookie(req.headers.cookie);

  if (!userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  req.userId = userId;
  next();
}

/**
 * Optionally attach the authenticated user if a valid session exists.
 * Continues silently — req.userId remains undefined when unauthenticated.
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  const userId = getUserIdFromCookie(req.headers.cookie);

  if (userId) {
    req.userId = userId;
  }

  next();
}
