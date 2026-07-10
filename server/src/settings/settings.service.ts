import { prisma } from "../infra/prisma.js";
import type { UserSettingsDTO, UserSettingsUpdateDTO } from "../../../shared/src/schemas.js";

// ============================================================================
// Public API
// ============================================================================

/**
 * Get settings for a user. Auto-creates with defaults if no row exists.
 */
export async function getOrCreate(userId: string): Promise<UserSettingsDTO> {
  let settings = await prisma.userSettings.findUnique({ where: { userId } });

  if (!settings) {
    settings = await prisma.userSettings.create({
      data: { userId },
    });
  }

  return toDTO(settings);
}

/**
 * Upsert settings for a user. Only provided fields are updated.
 * If no row exists, creates one with defaults plus provided overrides.
 */
export async function upsert(
  userId: string,
  data: UserSettingsUpdateDTO,
): Promise<UserSettingsDTO> {
  const settings = await prisma.userSettings.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });

  return toDTO(settings);
}

/**
 * Lightweight read of only the rateLimitTier field.
 */
export async function getRateLimitTier(userId: string): Promise<string> {
  const settings = await prisma.userSettings.findUnique({
    where: { userId },
    select: { rateLimitTier: true },
  });

  return settings?.rateLimitTier ?? "default";
}

// ============================================================================
// Helpers
// ============================================================================

function toDTO(settings: {
  theme: string;
  emailDigest: boolean;
  rateLimitTier: string;
}): UserSettingsDTO {
  return {
    theme: settings.theme as "light" | "dark",
    emailDigest: settings.emailDigest,
    rateLimitTier: settings.rateLimitTier as "default" | "relaxed" | "strict",
  };
}
