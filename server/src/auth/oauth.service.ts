import { randomBytes } from "node:crypto";
import { prisma } from "../infra/prisma.js";
import { sign } from "../infra/http.js";
import { AppError } from "../infra/error-handler.js";

// ── Types ──────────────────────────────────────────────────────

interface GoogleTokens {
  access_token: string;
  id_token: string;
}

interface GoogleUser {
  sub: string;
  email: string;
  name: string;
  picture: string;
}

export interface OAuthResult {
  token: string;
  redirectTo: string;
}

// ── Helpers ────────────────────────────────────────────────────

function getOAuthConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new AppError(500, "Missing Google OAuth configuration");
  }

  return { clientId, clientSecret, redirectUri };
}

// ── Public API ─────────────────────────────────────────────────

/**
 * Generate a cryptographically random anti-CSRF state string.
 */
export function generateState(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Build the Google OAuth 2.0 authorization URL.
 */
export function getGoogleAuthURL(state: string): string {
  const { clientId, redirectUri } = getOAuthConfig();

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "offline",
    prompt: "consent",
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

/**
 * Exchange an authorization code for access and ID tokens.
 * Throws if the code is invalid or expired.
 */
export async function exchangeCodeForTokens(code: string): Promise<GoogleTokens> {
  const { clientId, clientSecret, redirectUri } = getOAuthConfig();

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new AppError(401, `Google token exchange failed: ${body.slice(0, 200)}`);
  }

  return response.json() as Promise<GoogleTokens>;
}

/**
 * Fetch the authenticated user's profile from Google.
 */
export async function getGoogleUser(accessToken: string): Promise<GoogleUser> {
  const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new AppError(401, "Google userinfo request failed");
  }

  return response.json() as Promise<GoogleUser>;
}

/**
 * Find an existing user by Google ID or email, or create a new one.
 * Links a Google account to an existing email/password user when the
 * email matches (graceful account linking).
 */
export async function findOrCreateGoogleUser(googleUser: GoogleUser) {
  // 1 — Try by Google ID first
  const byGoogle = await prisma.profile.findUnique({
    where: { googleId: googleUser.sub },
  });

  if (byGoogle) {
    const updated = await prisma.profile.update({
      where: { id: byGoogle.id },
      data: {
        displayName: googleUser.name,
        avatarUrl: googleUser.picture,
      },
    });

    return { id: updated.id, email: updated.email, displayName: updated.displayName };
  }

  // 2 — Try by email (link Google to existing password account)
  const byEmail = await prisma.profile.findUnique({
    where: { email: googleUser.email },
  });

  if (byEmail) {
    const updated = await prisma.profile.update({
      where: { id: byEmail.id },
      data: {
        googleId: googleUser.sub,
        avatarUrl: googleUser.picture,
        displayName: googleUser.name ?? byEmail.displayName,
        authProvider: "google",
      },
    });

    return { id: updated.id, email: updated.email, displayName: updated.displayName };
  }

  // 3 — Create a brand-new OAuth-only user (no password)
  const created = await prisma.profile.create({
    data: {
      id: randomBytes(16).toString("hex"),
      email: googleUser.email,
      displayName: googleUser.name,
      googleId: googleUser.sub,
      avatarUrl: googleUser.picture,
      authProvider: "google",
    },
  });

  return { id: created.id, email: created.email, displayName: created.displayName };
}

/**
 * Full OAuth callback flow: exchange code → fetch user → upsert → JWT → cookie.
 */
export async function handleOAuthCallback(code: string): Promise<OAuthResult> {
  const tokens = await exchangeCodeForTokens(code);
  const googleUser = await getGoogleUser(tokens.access_token);
  const user = await findOrCreateGoogleUser(googleUser);

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new AppError(500, "Server configuration error");
  }

  const token = sign({ userId: user.id }, secret, "7d");

  const clientUrl = process.env.CLIENT_URL ?? "http://localhost:5173";

  return {
    token,
    redirectTo: `${clientUrl}/app/analysis`,
  };
}
