import { Router } from "express";

export const profileRouter = Router();

profileRouter.get("/test", (_req, res) => {
  res.json({ message: "Profile router OK" });
});
