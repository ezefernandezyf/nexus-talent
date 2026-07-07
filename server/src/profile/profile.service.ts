import { prisma } from "../infra/prisma.js";
import { AppError } from "../infra/error-handler.js";
import type { ProfileDTO } from "../../../shared/src/schemas.js";

// ============================================================================
// Public API
// ============================================================================

/**
 * Get a profile by user ID.
 * Throws 404 if not found.
 */
export async function getProfileByUserId(userId: string): Promise<ProfileDTO> {
  const profile = await prisma.profile.findUnique({ where: { id: userId } });

  if (!profile) {
    throw new AppError(404, "Profile not found");
  }

  return {
    id: profile.id,
    email: profile.email,
    displayName: profile.displayName,
  };
}

/**
 * Update the display name for a user.
 * Throws 404 if the user is not found.
 */
export async function updateDisplayName(userId: string, displayName: string): Promise<ProfileDTO> {
  const existing = await prisma.profile.findUnique({ where: { id: userId } });

  if (!existing) {
    throw new AppError(404, "Profile not found");
  }

  const updated = await prisma.profile.update({
    where: { id: userId },
    data: { displayName },
  });

  return {
    id: updated.id,
    email: updated.email,
    displayName: updated.displayName,
  };
}
