import { prisma } from "../infra/prisma.js";
import { AppError } from "../infra/error-handler.js";
import type { ProfileDTO, ProfileUpdateDTO } from "../../../shared/src/schemas.js";

// ============================================================================
// Helpers
// ============================================================================

/**
 * Map a Prisma Profile row to the shared ProfileDTO shape.
 */
function toProfileDTO(profile: {
  id: string;
  email: string;
  displayName: string | null;
  skills: string | null;
  experienceLevel: string | null;
  roleTitle: string | null;
  resumeLink: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  phone: string | null;
  portfolioUrl: string | null;
  location: string | null;
}): ProfileDTO {
  return {
    id: profile.id,
    email: profile.email,
    displayName: profile.displayName,
    skills: profile.skills,
    experienceLevel: profile.experienceLevel,
    roleTitle: profile.roleTitle,
    resumeLink: profile.resumeLink,
    linkedinUrl: profile.linkedinUrl,
    githubUrl: profile.githubUrl,
    phone: profile.phone,
    portfolioUrl: profile.portfolioUrl,
    location: profile.location,
  };
}

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

  return toProfileDTO(profile);
}

/**
 * Update profile fields for the given user.
 * Accepts a partial ProfileUpdateDTO — only provided fields are updated.
 * Throws 404 if the user is not found.
 */
export async function updateProfile(
  userId: string,
  data: ProfileUpdateDTO,
): Promise<ProfileDTO> {
  const existing = await prisma.profile.findUnique({ where: { id: userId } });

  if (!existing) {
    throw new AppError(404, "Profile not found");
  }

  const updated = await prisma.profile.update({
    where: { id: userId },
    data,
  });

  return toProfileDTO(updated);
}
