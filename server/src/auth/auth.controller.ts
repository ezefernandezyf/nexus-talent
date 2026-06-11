import type { Request, Response, NextFunction } from "express";
import * as authService from "./auth.service.js";

const SEVEN_DAYS_SECONDS = 7 * 24 * 60 * 60;

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: SEVEN_DAYS_SECONDS,
};

/**
 * POST /api/auth/register
 */
export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password, displayName } = req.body;
    const result = await authService.register(email, password, displayName);

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

    res.cookie("nexus-talent-session", result.token, COOKIE_OPTIONS);
    res.status(200).json({ user: result.user });
  } catch (err) {
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
export async function logout(_req: Request, res: Response): Promise<void> {
  res.cookie("nexus-talent-session", "", {
    ...COOKIE_OPTIONS,
    maxAge: 0,
  });
  res.status(200).json({ message: "Logged out" });
}
