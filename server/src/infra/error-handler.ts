import type { Request, Response, NextFunction } from "express";
import { logger } from "./logger.js";

/**
 * Application-level error with an HTTP status code.
 * Throw this from services/controllers and the error handler
 * will respond with the appropriate status and message.
 */
export class AppError extends Error {
  public readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
  }
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  logger.error({ err, path: _req.path }, "Unhandled error");

  res.status(500).json({ error: "Internal server error" });
}
