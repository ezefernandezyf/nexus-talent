import type { Request, Response, NextFunction } from "express";
import type { AnalysisRequestDTO, ProfileDTO } from "../../../shared/src/schemas.js";
import * as analysisService from "./analysis.service.js";
import * as historyService from "../history/history.service.js";
import * as profileService from "../profile/profile.service.js";
import { AppError } from "../infra/error-handler.js";
import { logger } from "../infra/logger.js";

// ============================================================================
// Helpers
// ============================================================================

/**
 * Build a short profile context string for AI prompt enrichment.
 * Truncated implicitly by Groq's token budget (~200 chars for 7 fields).
 */
function buildProfileContext(p: ProfileDTO): string {
  const parts: string[] = [];
  if (p.roleTitle) parts.push(`Rol: ${p.roleTitle}`);
  if (p.experienceLevel) parts.push(`Experiencia: ${p.experienceLevel}`);
  if (p.skills) parts.push(`Skills: ${p.skills}`);
  if (p.location) parts.push(`Ubicación: ${p.location}`);
  return parts.length > 0 ? parts.join(". ") + "." : "";
}

// ============================================================================
// Public API
// ============================================================================

/**
 * POST /api/ai/analyze
 *
 * Receives a validated job description, enriches with profile context,
 * calls the Groq analysis service, and returns the structured analysis result.
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

    // Fetch profile context for prompt enrichment (best-effort)
    let profileContext: string | null = null;
    if (req.userId) {
      try {
        const profile = await profileService.getProfileByUserId(req.userId);
        profileContext = buildProfileContext(profile);
      } catch (err) {
        logger.warn({ err, userId: req.userId }, "Profile fetch failed, proceeding without context");
      }
    }

    const result = await analysisService.analyze(input, profileContext);

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
