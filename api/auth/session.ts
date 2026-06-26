/**
 * Vercel Serverless Function — Session Cookie Exchange
 *
 * Sets an httpOnly cookie for .nexustalent.vercel.app so the browser
 * sends it on all /api/* requests through Vercel's proxy to Render.
 *
 * Flow: OAuth/login/register redirect here with ?token=<jwt>
 * → sets cookie → redirects to app
 */

const SEVEN_DAYS = 7 * 24 * 60 * 60;

export default function handler(request: Request): Response {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const redirectTo = url.searchParams.get("redirect") ?? "/app/analysis";

  if (!token) {
    return Response.redirect(url.origin + "/auth/sign-in", 302);
  }

  const response = Response.redirect(url.origin + safePath(redirectTo), 302);

  response.headers.set(
    "Set-Cookie",
    `nexus-talent-session=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Domain=.nexustalent.vercel.app; Max-Age=${SEVEN_DAYS}`,
  );

  return response;
}

export const config = {
  runtime: "edge",
};

function safePath(path: string): string {
  if (path.includes("://") || path.startsWith("//")) return "/app/analysis";
  if (!path.startsWith("/")) return "/app/analysis";
  return path;
}
