import express from "express";
import helmet from "helmet";
import cors from "cors";
import { authRouter } from "../auth/auth.router.js";
import { analysisRouter } from "../analysis/analysis.router.js";
import { profileRouter } from "../profile/profile.router.js";
import { historyRouter } from "../history/history.router.js";
import { errorHandler } from "./error-handler.js";
import { requestId } from "./request.js";

export function createApp() {
  const app = express();

  // ── Security ──────────────────────────────────────────────
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }),
  );

  // ── CORS ──────────────────────────────────────────────────
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || "http://localhost:5173",
      credentials: true,
    }),
  );

  // ── Body parsing ──────────────────────────────────────────
  app.use(express.json());

  // ── Request ID ────────────────────────────────────────────
  app.use(requestId);

  // ── Health check ──────────────────────────────────────────
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // ── Routers ───────────────────────────────────────────────
  app.use("/api/auth", authRouter);
  app.use("/api/analysis", analysisRouter);
  app.use("/api/profile", profileRouter);
  app.use("/api/history", historyRouter);

  // ── Error handler (must be last) ─────────────────────────
  app.use(errorHandler);

  return app;
}
