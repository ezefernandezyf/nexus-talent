import type { Request, Response, NextFunction } from "express";
import type { AnalysisRequestDTO } from "../../../shared/src/schemas.js";
import * as analysisService from "./analysis.service.js";
import * as historyService from "../history/history.service.js";
import { AppError } from "../infra/error-handler.js";
import { logger } from "../infra/logger.js";

/**
 * POST /api/ai/analyze
 *
 * Receives a validated job description, calls the Groq analysis service,
 * and returns the structured analysis result.
 * On success, best-effort persists the result to the database (P3 coupling).
 * A DB save failure will NOT fail the HTTP response.
 */
export async function analyze(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = req.body as AnalysisRequestDTO;

    req.log.info({
      event: "analysis_request",
      userId: req.userId,
      inputLength: input.jobDescription?.length ?? 0,
    }, "Analysis requested");

    const result = await analysisService.analyze(input);

    // Best-effort persistence: save to DB if the user is authenticated
    if (req.userId) {
      historyService
        .saveAnalysis(req.userId, { result, jobDescription: input.jobDescription })
        .catch((err) => {
          logger.warn({ err }, "Failed to persist analysis result to DB");
        });
    }

    res.status(200).json(result);
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }

    // Unexpected errors - wrap as 502
    next(new AppError(502, "Analysis service encountered an unexpected error."));
  }
}
