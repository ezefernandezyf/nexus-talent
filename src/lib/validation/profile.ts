import { z } from "zod";

const PROFILE_DISPLAY_NAME_INPUT_SCHEMA = z.string().trim().max(120);

export const PROFILE_RECORD_SCHEMA = z.object({
  created_at: z.string().datetime(),
  display_name: z.string().nullable(),
  email: z.string().trim().email(),
  id: z.string().trim().min(1),
  updated_at: z.string().datetime(),
});

export const PROFILE_SAVE_INPUT_SCHEMA = z.object({
  displayName: PROFILE_DISPLAY_NAME_INPUT_SCHEMA.transform((value) => (value.length > 0 ? value : null)),
  email: z.string().trim().email(),
  userId: z.string().trim().min(1),
});

export const PROFILE_FORM_SCHEMA = z.object({
  displayName: PROFILE_DISPLAY_NAME_INPUT_SCHEMA.transform((value) => (value.length > 0 ? value : null)),
});

export type ProfileRecord = z.infer<typeof PROFILE_RECORD_SCHEMA>;
export type ProfileSaveInput = z.infer<typeof PROFILE_SAVE_INPUT_SCHEMA>;
export type ProfileFormInput = z.infer<typeof PROFILE_FORM_SCHEMA>;