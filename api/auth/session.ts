/**
 * Vercel Edge Function — Session Cookie Exchange
 *
 * Sets an httpOnly cookie for .nexustalent.vercel.app so the browser
 * sends it on all /api/* requests through Vercel's proxy to Render.
 *
 * Flow: OAuth/login/register redirect here with ?token=<jwt>
 * → sets cookie → redirects to app
 */

export default function handler(request: Request): Response {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const rawRedirect = url.searchParams.get("redirect") ?? "/app/analysis";
  const redirectTo = safeOrigin(url.origin, rawRedirect);

  if (!token) {
    return new Response(null, {
      status: 302,
      headers: {
        Location: url.origin + "/auth/sign-in",
      },
    });
  }

  const cookieHeader = [
    `nexus-talent-session=${token}`,
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    "Path=/",
    "Domain=.nexustalent.vercel.app",
    "Max-Age=604800",
  ].join("; ");

  return new Response(null, {
    status: 302,
    headers: {
      Location: redirectTo,
      "Set-Cookie": cookieHeader,
    },
  });
}

export const config = {
  runtime: "edge",
};

/**
 * Ensure redirect stays on the same origin (prevent open redirect).
 */
function safeOrigin(origin: string, path: string): string {
  // Only allow absolute paths starting with /
  if (!path.startsWith("/")) {
    return origin + "/app/analysis";
  }
  return origin + path;
}
