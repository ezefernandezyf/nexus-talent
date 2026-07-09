import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import { profileUpdateSchema } from "../../../shared/src/schemas.js";
import * as service from "./profile.service.js";

export const profileRouter = Router();

profileRouter.get("/", requireAuth, async (req, res) => {
  try {
    const profile = await service.getProfileByUserId(req.userId!);
    res.json(profile);
  } catch (err) {
    if (err && typeof err === "object" && "statusCode" in err && err.statusCode === 404) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

profileRouter.put("/", requireAuth, async (req, res) => {
  try {
    const parsed = profileUpdateSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues });
      return;
    }

    const profile = await service.updateProfile(req.userId!, parsed.data);
    res.json(profile);
  } catch (err) {
    if (err && typeof err === "object" && "statusCode" in err && err.statusCode === 404) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }
    res.status(500).json({ error: "Internal server error" });
  }
});
