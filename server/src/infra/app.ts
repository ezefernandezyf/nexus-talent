import express from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { authRouter } from "../auth/auth.router.js";
import { analysisRouter } from "../analysis/analysis.router.js";
import { profileRouter } from "../profile/profile.router.js";
import { historyRouter } from "../history/history.router.js";
import { settingsRouter } from "../settings/settings.router.js";
import { errorHandler } from "./error-handler.js";
import { requestId } from "./request.js";
import { securityHeaders } from "./security-headers.js";
import { logger } from "./logger.js";

export function createApp() {
  const app = express();

  // ── Security headers ──────────────────────────────────────
  app.use(securityHeaders);

  // ── CORS ──────────────────────────────────────────────────
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || "http://localhost:5173",
      credentials: true,
    }),
  );

  // ── Body parsing ──────────────────────────────────────────
  app.use(express.json());

  // ── Request logging ───────────────────────────────────────
  app.use(pinoHttp({ logger }));

  // ── Request ID ────────────────────────────────────────────
  app.use(requestId);

  // ── Health check ──────────────────────────────────────────
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // ── Routers ───────────────────────────────────────────────
  app.use("/api/auth", authRouter);
  app.use("/api/ai", analysisRouter);
  app.use("/api/profile", profileRouter);
  app.use("/api/analyses", historyRouter);
  app.use("/api/settings", settingsRouter);

  // ── Error handler (must be last) ─────────────────────────
  app.use(errorHandler);

  return app;
}
