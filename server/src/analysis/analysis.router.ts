import { Router } from "express";
import { analysisRequestSchema } from "../../../shared/src/schemas.js";
import { validate } from "../infra/validate.js";
import { rateLimiter } from "../infra/rate-limiter.js";
import * as controller from "./analysis.controller.js";

export const analysisRouter = Router();

analysisRouter.get("/test", (_req, res) => {
  res.json({ message: "Analysis router OK" });
});

analysisRouter.post(
  "/analyze",
  rateLimiter({ windowMs: 60_000, max: 20 }),
  validate(analysisRequestSchema),
  controller.analyze,
);
