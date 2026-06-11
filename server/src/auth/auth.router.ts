import { Router } from "express";
import { validate } from "../infra/validate.js";
import { rateLimiter } from "../infra/rate-limiter.js";
import { requireAuth } from "./auth.middleware.js";
import { authRegisterSchema, authLoginSchema } from "../../../shared/src/schemas.js";
import * as controller from "./auth.controller.js";

const authRateLimit = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
});

export const authRouter = Router();

authRouter.post("/register", validate(authRegisterSchema), authRateLimit, controller.register);
authRouter.post("/login", validate(authLoginSchema), authRateLimit, controller.login);
authRouter.get("/me", requireAuth, controller.me);
authRouter.post("/logout", requireAuth, controller.logout);
