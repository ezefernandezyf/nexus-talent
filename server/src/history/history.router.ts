import { Router } from "express";
import { analysisUpdateSchema } from "../../../shared/src/schemas.js";
import { validate } from "../infra/validate.js";
import { requireAuth } from "../auth/auth.middleware.js";
import * as controller from "./history.controller.js";

export const historyRouter = Router();

// Test route (keep for health checks)
historyRouter.get("/test", (_req, res) => {
  res.json({ message: "History router OK" });
});

// ── Authenticated CRUD ─────────────────────────────────────

// GET /api/analyses - list all analyses for the authenticated user
historyRouter.get("/", requireAuth, controller.list);

// GET /api/analyses/:id - get a single analysis
historyRouter.get("/:id", requireAuth, controller.detail);

// DELETE /api/analyses/:id - remove an analysis
historyRouter.delete("/:id", requireAuth, controller.remove);

// PATCH /api/analyses/:id - update displayName / notes
historyRouter.patch(
  "/:id",
  requireAuth,
  validate(analysisUpdateSchema),
  controller.patch,
);
