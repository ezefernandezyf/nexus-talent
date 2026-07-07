import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
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
    const { displayName } = req.body;

    if (typeof displayName !== "string" || displayName.trim().length === 0) {
      res.status(400).json({ error: "displayName is required and must be a non-empty string" });
      return;
    }

    const profile = await service.updateDisplayName(req.userId!, displayName.trim());
    res.json(profile);
  } catch (err) {
    if (err && typeof err === "object" && "statusCode" in err && err.statusCode === 404) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }
    res.status(500).json({ error: "Internal server error" });
  }
});
