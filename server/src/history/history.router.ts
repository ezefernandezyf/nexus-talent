import { Router } from "express";

export const historyRouter = Router();

historyRouter.get("/test", (_req, res) => {
  res.json({ message: "History router OK" });
});
