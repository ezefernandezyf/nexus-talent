import { Prisma } from "@prisma/client";
import { prisma } from "../infra/prisma.js";
import { AppError } from "../infra/error-handler.js";
import type { AnalysisResponseDTO } from "../../../shared/src/schemas.js";

// ============================================================================
// Save payload for P3 coupling
// (jobDescription is passed separately from the request body)
// ============================================================================

export interface SaveAnalysisPayload {
  result: AnalysisResponseDTO;
  jobDescription: string;
}

// ============================================================================
// CRUD - all scoped by userId
// ============================================================================

/**
 * List all analyses owned by the user, newest first.
 */
export async function getAll(userId: string) {
  const rows = await prisma.analysis.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return rows.map(deserialize);
}

/**
 * Get a single analysis by id, scoped to userId.
 * Throws 404 if not found or not owned by the user.
 */
export async function getById(userId: string, id: string) {
  const row = await prisma.analysis.findFirst({ where: { id, userId } });

  if (!row) {
    throw new AppError(404, "Analysis not found");
  }

  return deserialize(row);
}

/**
 * Delete an analysis by id, scoped to userId.
 * Throws 404 if not found or not owned by the user.
 */
export async function remove(userId: string, id: string): Promise<void> {
  const row = await prisma.analysis.findFirst({ where: { id, userId } });

  if (!row) {
    throw new AppError(404, "Analysis not found");
  }

  await prisma.analysis.delete({ where: { id } });
}

/**
 * Update mutable fields (displayName, notes) on an analysis.
 * Throws 404 if not found or not owned by the user.
 */
export async function update(
  userId: string,
  id: string,
  data: { displayName?: string; notes?: string },
) {
  const row = await prisma.analysis.findFirst({ where: { id, userId } });

  if (!row) {
    throw new AppError(404, "Analysis not found");
  }

  const updated = await prisma.analysis.update({
    where: { id },
    data,
  });

  return deserialize(updated);
}

/**
 * Save an analysis result to the database (called from P3 analysis controller).
 * Best-effort: caller is expected to catch errors.
 */
export async function saveAnalysis(userId: string, payload: SaveAnalysisPayload) {
  const { result, jobDescription } = payload;

  await prisma.analysis.create({
    data: {
      id: result.id,
      userId,
      jobDescription,
      summary: result.summary,
      vacancySummary: JSON.stringify(result.vacancySummary),
      // Prisma 7 stub types (no DATABASE_URL in CI) resolve Json fields as `string`.
      // Runtime values are valid JSON objects — InputJsonValue would work with a real client.
      // Revisit when Prisma improves stub type generation.
      skillGroups: result.skillGroups as any,
      keywords: result.keywords as any,
      gaps: result.gaps as any,
      recruiterMessages: result.recruiterMessages as any,
      outreachMessage:
        typeof result.outreachMessage === "object"
          ? JSON.stringify(result.outreachMessage)
          : (result.outreachMessage ?? ""),
      displayName: result.displayName ?? null,
      notes: result.notes ?? null,
      createdAt: new Date(result.createdAt),
    },
  });
}

// ============================================================================
// Internal helpers
// ============================================================================

interface AnalysisRow {
  id: string;
  userId: string;
  jobDescription: string;
  summary: string | null;
  vacancySummary: string;
  skillGroups: unknown;
  keywords: unknown;
  gaps: unknown;
  recruiterMessages: unknown;
  outreachMessage: string;
  displayName: string | null;
  notes: string | null;
  tone: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Deserialize a Prisma Analysis row into a JSON-safe response shape.
 * String fields that store JSON (vacancySummary, outreachMessage) are parsed.
 */
function deserialize(row: AnalysisRow) {
  let vacancySummary: unknown = {};
  try {
    vacancySummary = JSON.parse(row.vacancySummary);
  } catch {
    // leave as-is
  }

  let outreachMessage: unknown = "";
  try {
    outreachMessage = JSON.parse(row.outreachMessage);
  } catch {
    outreachMessage = row.outreachMessage;
  }

  return {
    id: row.id,
    jobDescription: row.jobDescription,
    summary: row.summary,
    vacancySummary,
    skillGroups: row.skillGroups,
    keywords: row.keywords,
    gaps: row.gaps,
    recruiterMessages: row.recruiterMessages,
    outreachMessage,
    displayName: row.displayName,
    notes: row.notes,
    tone: row.tone,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
