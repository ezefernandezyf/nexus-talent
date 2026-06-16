import type { Request, Response, NextFunction } from "express";
import type { AnalysisRequestDTO } from "../../../shared/src/schemas.js";
import * as analysisService from "./analysis.service.js";
import { AppError } from "../infra/error-handler.js";

/**
 * POST /api/ai/analyze
 *
 * Receives a validated job description, calls the Groq analysis service,
 * and returns the structured analysis result.
 */
export async function analyze(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = req.body as AnalysisRequestDTO;
    const result = await analysisService.analyze(input);
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }

    // Unexpected errors — wrap as 502
    next(new AppError(502, "Analysis service encountered an unexpected error."));
  }
}
