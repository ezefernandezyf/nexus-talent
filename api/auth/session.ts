/**
 * Vercel Edge Function — Session Cookie Exchange
 *
 * Sets an httpOnly cookie for .nexustalent.vercel.app so the browser
 * sends it on all /api/* requests through Vercel's proxy to Render.
 *
 * Flow: OAuth callback redirects here with ?code=<64hex>&redirect=/path
 * → POSTs code to Render exchange endpoint → gets JWT → sets cookie → redirects
 */

const RENDER_URL = process.env.RENDER_URL ?? "https://nexus-talent-api.onrender.com";
const EXCHANGE_SECRET = process.env.EXCHANGE_SECRET ?? "";

export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const rawRedirect = url.searchParams.get("redirect") ?? "/app/analysis";
  const redirectTo = safeOrigin(url.origin, rawRedirect);

  if (!code) {
    return new Response(null, {
      status: 302,
      headers: { Location: url.origin + "/auth/sign-in" },
    });
  }

  // Exchange the one-time code for the JWT (server-to-server)
  try {
    const exchangeResponse = await fetch(`${RENDER_URL}/api/auth/exchange`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Exchange-Secret": EXCHANGE_SECRET,
      },
      body: JSON.stringify({ code }),
    });

    if (!exchangeResponse.ok) {
      return new Response(null, {
        status: 302,
        headers: { Location: url.origin + "/auth/sign-in?error=exchange_failed" },
      });
    }

    const { token } = (await exchangeResponse.json()) as { token: string };

    if (!token) {
      return new Response(null, {
        status: 302,
        headers: { Location: url.origin + "/auth/sign-in?error=exchange_failed" },
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
  } catch {
    // Network error or exchange failure
    return new Response(null, {
      status: 302,
      headers: { Location: url.origin + "/auth/sign-in?error=exchange_failed" },
    });
  }
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
