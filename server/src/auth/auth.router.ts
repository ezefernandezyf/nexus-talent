import { Router } from "express";
import { validate } from "../infra/validate.js";
import { rateLimiter } from "../infra/rate-limiter.js";
import { requireAuth } from "./auth.middleware.js";
import { prisma } from "../infra/prisma.js";
import { authRegisterSchema, authLoginSchema } from "../../../shared/src/schemas.js";
import * as controller from "./auth.controller.js";

const authRateLimit = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "test" ? 100 : 5,
});

export const authRouter = Router();

authRouter.post("/register", validate(authRegisterSchema), authRateLimit, controller.register);
authRouter.post("/login", validate(authLoginSchema), authRateLimit, controller.login);
authRouter.get("/me", requireAuth, controller.me);
authRouter.post("/logout", requireAuth, controller.logout);

// OAuth — Initiation
// When ?link=true, requireAuth runs first to ensure the user
// is already logged in before starting the Google OAuth flow.
authRouter.get("/oauth/google", (req, res, next) => {
  if (req.query.link === "true") return requireAuth(req, res, next);
  next();
}, controller.googleLogin);

// OAuth — Callback
authRouter.get("/oauth/google/callback", controller.googleCallback);

// OAuth — Unlink (remove Google identity from Profile)
authRouter.delete("/oauth/google", requireAuth, async (req, res) => {
  await prisma.profile.update({
    where: { id: req.userId },
    data: { googleId: null },
  });
  res.status(200).json({ message: "Google account unlinked" });
});

// Code exchange
authRouter.post("/exchange", controller.exchangeCode);
