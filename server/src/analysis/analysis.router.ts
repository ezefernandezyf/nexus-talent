import { Router } from "express";

export const analysisRouter = Router();

analysisRouter.get("/test", (_req, res) => {
  res.json({ message: "Analysis router OK" });
});
