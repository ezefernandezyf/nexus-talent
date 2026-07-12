import { prisma } from "../infra/prisma.js";
import { AppError } from "../infra/error-handler.js";
import type { WorkExperienceCreateDTO, WorkExperienceUpdateDTO, EducationCreateDTO, EducationUpdateDTO } from "../../../shared/src/schemas.js";

// ============================================================================
// Work Experience
// ============================================================================

export async function listExperience(userId: string) {
  return prisma.workExperience.findMany({
    where: { userId },
    orderBy: { startDate: "desc" },
  });
}

export async function getExperience(id: string, userId: string) {
  const item = await prisma.workExperience.findFirst({ where: { id, userId } });
  if (!item) throw new AppError(404, "Work experience not found");
  return item;
}

export async function createExperience(userId: string, data: WorkExperienceCreateDTO) {
  return prisma.workExperience.create({ data: { ...data, userId } });
}

export async function updateExperience(id: string, userId: string, data: WorkExperienceUpdateDTO) {
  const existing = await prisma.workExperience.findFirst({ where: { id, userId } });
  if (!existing) throw new AppError(404, "Work experience not found");
  return prisma.workExperience.update({ where: { id }, data });
}

export async function deleteExperience(id: string, userId: string) {
  const existing = await prisma.workExperience.findFirst({ where: { id, userId } });
  if (!existing) throw new AppError(404, "Work experience not found");
  await prisma.workExperience.delete({ where: { id } });
}

// ============================================================================
// Education
// ============================================================================

export async function listEducation(userId: string) {
  return prisma.education.findMany({
    where: { userId },
    orderBy: { startDate: "desc" },
  });
}

export async function getEducation(id: string, userId: string) {
  const item = await prisma.education.findFirst({ where: { id, userId } });
  if (!item) throw new AppError(404, "Education not found");
  return item;
}

export async function createEducation(userId: string, data: EducationCreateDTO) {
  return prisma.education.create({ data: { ...data, userId } });
}

export async function updateEducation(id: string, userId: string, data: EducationUpdateDTO) {
  const existing = await prisma.education.findFirst({ where: { id, userId } });
  if (!existing) throw new AppError(404, "Education not found");
  return prisma.education.update({ where: { id }, data });
}

export async function deleteEducation(id: string, userId: string) {
  const existing = await prisma.education.findFirst({ where: { id, userId } });
  if (!existing) throw new AppError(404, "Education not found");
  await prisma.education.delete({ where: { id } });
}
