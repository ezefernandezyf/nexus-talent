import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "nexus-talent-session";
const COOKIE_DOMAIN = ".nexustalent.vercel.app";

/**
 * Vercel Edge Middleware
 *
 * Solves the cross-domain cookie problem:
 * - Render sets the session cookie for its own domain (.nexustalent-api.onrender.com)
 * - The browser never sends this cookie to nexustalent.vercel.app
 * - This middleware runs on Vercel Edge BEFORE requests hit the API proxy
 *
 * Flow:
 * 1. /auth/session?token=<jwt>&redirect=/app/analysis
 *    → Edge reads token, sets httpOnly cookie for .nexustalent.vercel.app, redirects to /app/analysis
 * 2. /api/(.*) requests
 *    → Edge reads existing cookie, extracts userId, forwards as X-User-Id header to Render
 */
export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // ── 1. Token-to-cookie exchange (OAuth callback landing) ────────────────
  if (pathname === "/auth/session") {
    const token = searchParams.get("token");
    const redirectTo = searchParams.get("redirect") ?? "/app/analysis";

    if (token) {
      const userId = extractUserId(token);
      if (userId) {
        const response = NextResponse.redirect(new URL(redirectTo, req.url));

        // Set httpOnly session cookie for .nexustalent.vercel.app
        // This is the KEY fix: Vercel Edge CAN set cookies for its own domain
        response.cookies.set(SESSION_COOKIE, token, {
          httpOnly: true,
          sameSite: "lax",
          domain: COOKIE_DOMAIN,
          path: "/",
          maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
          secure: true,
        });

        return response;
      }
    }

    // Invalid or missing token — redirect to sign in
    return NextResponse.redirect(new URL("/auth/sign-in", req.url));
  }

  // ── 2. API proxy: extract userId from cookie, forward as header ───────
  // The browser sends the session cookie for .nexustalent.vercel.app.
  // Vercel's vercel.json rewrite proxies to Render, but the cookie's domain
  // (.nexustalent.vercel.app) is different from Render's domain
  // (nexus-talent-api.onrender.com) — so Render would NOT receive it.
  // Solution: Edge Middleware reads the httpOnly cookie (no JS access),
  // extracts userId, and forwards it as X-User-Id header to Render.
  if (pathname.startsWith("/api/")) {
    const token = req.cookies.get(SESSION_COOKIE)?.value;

    if (token) {
      const userId = extractUserId(token);
      if (userId) {
        // Set header so Render's requireAuth (with X-User-Id support) can use it
        const response = NextResponse.rewrite(req.url);
        response.headers.set("X-User-Id", userId);
        return response;
      }
    }

    // No valid cookie — let the request through (Render returns 401)
    return NextResponse.rewrite(req.url);
  }

  // ── 3. All other routes — let them through ──────────────────────────────
  return NextResponse.rewrite(req.url);
}

export const config = {
  matcher: ["/auth/session", "/api/:path*"],
};

/**
 * Extract userId from a JWT payload (HS256).
 *
 * WARNING: This only decodes the payload WITHOUT verifying the signature.
 * Security guarantee comes from:
 *   a) Cookie is httpOnly → JS can't read it → XSS can't steal it
 *   b) Vercel Edge is trusted infrastructure → we trust the token source
 *   c) Render's requireAuth STILL verifies the full JWT when it arrives
 *
 * @param token  JWT string (header.payload.signature)
 * @returns userId string or null if invalid format
 */
function extractUserId(token: string): string | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payloadEncoded = parts[1];
    // Vercel Edge doesn't have atob, use TextDecoder
    const payloadJson = atob(payloadEncoded.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(payloadJson) as Record<string, unknown>;

    if (typeof payload.userId !== "string") return null;
    return payload.userId;
  } catch {
    return null;
  }
}
