import type { Request, Response, NextFunction } from "express";
import * as authService from "./auth.service.js";
import * as oauthService from "./oauth.service.js";
import { parseCookies } from "../infra/request.js";
import { codeStore } from "./code-store.js";

const SEVEN_DAYS_SECONDS = 7 * 24 * 60 * 60;
const SEVEN_DAYS_MS = SEVEN_DAYS_SECONDS * 1000;

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: SEVEN_DAYS_MS,
};

/**
 * POST /api/auth/register
 */
export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password, displayName } = req.body;
    const result = await authService.register(email, password, displayName);

    req.log.info({ event: "register", userId: result.user.id }, "User registered");

    res.cookie("nexus-talent-session", result.token, COOKIE_OPTIONS);
    res.status(201).json({ user: result.user });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 */
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);

    req.log.info({ event: "login_success", userId: result.user.id }, "User logged in");

    res.cookie("nexus-talent-session", result.token, COOKIE_OPTIONS);
    res.status(200).json({ user: result.user });
  } catch (err) {
    // Log failure before forwarding - email is the attempted login
    req.log.warn({ event: "login_failure", email: req.body?.email }, "Failed login attempt");
    next(err);
  }
}

/**
 * GET /api/auth/me
 */
export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await authService.getUserById(req.userId!);
    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/logout
 */
export async function logout(req: Request, res: Response): Promise<void> {
  req.log.info({ event: "logout", userId: req.userId }, "User logged out");

  res.cookie("nexus-talent-session", "", {
    ...COOKIE_OPTIONS,
    maxAge: 0,
  });
  res.status(200).json({ message: "Logged out" });
}

// ── OAuth ──────────────────────────────────────────────────────

/**
 * GET /api/auth/oauth/google
 *
 * Generates an anti-CSRF state, stores it in a short-lived cookie,
 * and redirects the browser to the Google OAuth consent screen.
 */
export async function googleLogin(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const state = oauthService.generateState();

    res.cookie("nexus-talent-oauth-state", state, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 10 * 60 * 1000, // 10 minutes in milliseconds
    });

    const url = oauthService.getGoogleAuthURL(state);
    res.redirect(url);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/oauth/google/callback
 *
 * Validates the OAuth callback, exchanges the code for tokens,
 * creates or links the user, and sets the session cookie.
 */
export async function googleCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { code, state } = req.query;

    // Validate state to prevent CSRF
    const cookies = parseCookies(req.headers.cookie);
    const expectedState = cookies["nexus-talent-oauth-state"];
    if (!expectedState || expectedState !== state) {
      res.status(403).json({ message: "Invalid OAuth state" });
      return;
    }

    // Clear the state cookie immediately
    res.cookie("nexus-talent-oauth-state", "", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    if (typeof code !== "string") {
      res.status(400).json({ message: "Missing authorization code" });
      return;
    }

    const result = await oauthService.handleOAuthCallback(code);

    const clientUrl = process.env.CLIENT_URL ?? "http://localhost:5173";
    // Generate one-time code and store JWT, no JWT in redirect URL
    const oneTimeCode = codeStore.set(result.token);
    res.redirect(`${clientUrl}/api/auth/session?code=${oneTimeCode}&redirect=/app/analysis`);
  } catch (err) {
    next(err);
  }
}

// ── Code Exchange ─────────────────────────────────────────────

/**
 * POST /api/auth/exchange
 *
 * Exchanges a one-time code for a JWT.
 * Protected by X-Exchange-Secret header matching EXCHANGE_SECRET env var.
 */
export async function exchangeCode(req: Request, res: Response): Promise<void> {
  const secret = process.env.EXCHANGE_SECRET;
  const provided = req.headers["x-exchange-secret"];

  if (!secret) {
    console.error("EXCHANGE_SECRET is not configured. OAuth code exchange will fail all requests");
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  if (!provided || provided !== secret) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { code } = req.body;

  if (typeof code !== "string") {
    res.status(404).json({ error: "Code not found or expired" });
    return;
  }

  const token = codeStore.get(code);

  if (!token) {
    res.status(404).json({ error: "Code not found or expired" });
    return;
  }

  res.status(200).json({ token });
}
