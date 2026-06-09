import { Router } from "express";

export const authRouter = Router();

authRouter.get("/test", (_req, res) => {
  res.json({ message: "Auth router OK" });
});
