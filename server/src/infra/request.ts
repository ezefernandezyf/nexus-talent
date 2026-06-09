import type { Request, Response, NextFunction } from "express";
import { randomUUID } from "node:crypto";

/**
 * Attaches a unique request ID to every request.
 * Reads from X-Request-Id header if present, otherwise generates one.
 */
export function requestId(req: Request, res: Response, next: NextFunction) {
  const id = (req.headers["x-request-id"] as string) || randomUUID();
  req.requestId = id;
  res.setHeader("x-request-id", id);
  next();
}

// Augment Express Request type
declare global {
  namespace Express {
    interface Request {
      requestId: string;
    }
  }
}

/**
 * Parse a cookie string into a key-value map.
 * Avoids pulling in cookie-parser for a single utility.
 */
export function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  if (!cookieHeader) return {};

  return Object.fromEntries(
    cookieHeader.split(";").map((part) => {
      const eqIdx = part.indexOf("=");
      const key = eqIdx > -1 ? part.slice(0, eqIdx).trim() : part.trim();
      const val = eqIdx > -1 ? part.slice(eqIdx + 1).trim() : "";
      return [key, val];
    }),
  );
}
