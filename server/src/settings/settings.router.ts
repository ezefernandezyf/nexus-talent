import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import { validate } from "../infra/validate.js";
import { userSettingsUpdateSchema } from "../../../shared/src/schemas.js";
import * as service from "./settings.service.js";

export const settingsRouter = Router();

settingsRouter.get("/", requireAuth, async (req, res) => {
  try {
    const settings = await service.getOrCreate(req.userId!);
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

settingsRouter.put("/", requireAuth, validate(userSettingsUpdateSchema), async (req, res) => {
  try {
    const settings = await service.upsert(req.userId!, req.body);
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});
