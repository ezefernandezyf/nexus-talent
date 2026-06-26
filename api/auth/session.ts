/**
 * Vercel Edge Function — Session Cookie Exchange
 *
 * Solves the cross-domain cookie problem:
 * - Render can ONLY set cookies for its own domain (nexus-talent-api.onrender.com)
 * - The browser never sends cookies set by Render to Vercel (nexustalent.vercel.app)
 * - This Edge Function runs ON Vercel, so it CAN set cookies for .nexustalent.vercel.app
 *
 * Flow:
 * 1. Auth endpoints (OAuth/login/register) redirect to
 *    /api/auth/session?token=<jwt>&redirect=/app/analysis
 * 2. This function reads the JWT from query params
 * 3. Sets httpOnly cookie for .nexustalent.vercel.app
 * 4. Redirects to the destination (without token in URL)
 *
 * Security: cookie is httpOnly → JavaScript can't read it → XSS-safe
 */

const SEVEN_DAYS = 7 * 24 * 60 * 60;

export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const redirectTo = url.searchParams.get("redirect");

  // Validate redirect: must be a local path (no external URLs)
  const safeRedirect = validateRedirect(redirectTo ?? "/app/analysis");

  if (!token) {
    return Response.redirect(new URL("/auth/sign-in", request.url).toString(), 302);
  }

  // Decode JWT payload to validate structure (signature verification happens on Render)
  const userId = extractUserId(token);
  if (!userId) {
    return Response.redirect(new URL("/auth/sign-in", request.url).toString(), 302);
  }

  const response = Response.redirect(
    new URL(safeRedirect, request.url).toString(),
    302,
  );

  // Set httpOnly session cookie for .nexustalent.vercel.app
  response.headers.append(
    "Set-Cookie",
    `nexus-talent-session=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Domain=.nexustalent.vercel.app; Max-Age=${SEVEN_DAYS}`,
  );

  return response;
}

export const config = {
  runtime: "edge",
};

/**
 * Only allow same-origin paths as redirect targets.
 * Prevents open redirect attacks.
 */
function validateRedirect(redirect: string): string {
  // Block external URLs
  if (redirect.includes("://") || redirect.startsWith("//")) {
    return "/app/analysis";
  }
  // Must start with /
  if (!redirect.startsWith("/")) {
    return "/app/analysis";
  }
  // Block protocol-relative URLs and double slashes
  if (redirect.includes("\\\\")) {
    return "/app/analysis";
  }
  return redirect;
}

/**
 * Extract userId from JWT payload (base64 decode only, no signature verification).
 * Trust model: this runs on Vercel's trusted Edge infrastructure.
 * Render's requireAuth STILL verifies the full JWT signature on every request.
 */
function extractUserId(token: string): string | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payloadEncoded = parts[1];
    const payloadJson = atob(
      payloadEncoded.replace(/-/g, "+").replace(/_/g, "/"),
    );
    const payload = JSON.parse(payloadJson) as Record<string, unknown>;

    if (typeof payload.userId !== "string") return null;
    return payload.userId;
  } catch {
    return null;
  }
}
