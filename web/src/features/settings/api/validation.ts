import { z } from "zod";

const PROFILE_DISPLAY_NAME_INPUT_SCHEMA = z.string().trim().max(120);
const PROFILE_ISO_DATETIME_SCHEMA = z
  .string()
  .trim()
  .refine((value) => !Number.isNaN(Date.parse(value)), "Invalid ISO datetime")
  .transform((value) => new Date(value).toISOString());

const PROFILE_URL_SCHEMA = z.string().url().nullable().or(z.literal(""));

export const PROFILE_RECORD_SCHEMA = z.object({
  created_at: PROFILE_ISO_DATETIME_SCHEMA,
  display_name: z.string().nullable(),
  email: z.string().trim().email(),
  id: z.string().trim().min(1),
  updated_at: PROFILE_ISO_DATETIME_SCHEMA,
  // P14: professional profile fields (snake_case from DB)
  skills: z.string().nullable(),
  experience_level: z.string().nullable(),
  role_title: z.string().nullable(),
  resume_link: PROFILE_URL_SCHEMA,
  linkedin_url: PROFILE_URL_SCHEMA,
  github_url: PROFILE_URL_SCHEMA,
  location: z.string().nullable(),
});

export const PROFILE_SAVE_INPUT_SCHEMA = z.object({
  displayName: PROFILE_DISPLAY_NAME_INPUT_SCHEMA.transform((value) => (value.length > 0 ? value : null)),
  email: z.string().trim().email(),
  userId: z.string().trim().min(1),
  // P14: professional profile fields (camelCase for form/save)
  skills: z.string().trim().optional(),
  experienceLevel: z.string().trim().optional(),
  roleTitle: z.string().trim().optional(),
  resumeLink: z.string().url().optional().or(z.literal("")),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  githubUrl: z.string().url().optional().or(z.literal("")),
  location: z.string().trim().optional(),
});

export const PROFILE_FORM_SCHEMA = z.object({
  displayName: PROFILE_DISPLAY_NAME_INPUT_SCHEMA.transform((value) => (value.length > 0 ? value : null)),
});

export type ProfileRecord = z.infer<typeof PROFILE_RECORD_SCHEMA>;
export type ProfileSaveInput = z.infer<typeof PROFILE_SAVE_INPUT_SCHEMA>;
export type ProfileFormInput = z.infer<typeof PROFILE_FORM_SCHEMA>;