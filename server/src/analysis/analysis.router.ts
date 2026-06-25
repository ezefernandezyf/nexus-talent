import { Router } from "express";
import { analysisRequestSchema } from "../../../shared/src/schemas.js";
import { validate } from "../infra/validate.js";
import { rateLimiter } from "../infra/rate-limiter.js";
import { requireAuth } from "../auth/auth.middleware.js";
import * as controller from "./analysis.controller.js";

export const analysisRouter = Router();

analysisRouter.get("/test", (_req, res) => {
  res.json({ message: "Analysis router OK" });
});

analysisRouter.post(
  "/analyze",
  requireAuth,
  rateLimiter({ windowMs: 60_000, max: 10 }),
  validate(analysisRequestSchema),
  controller.analyze,
);
