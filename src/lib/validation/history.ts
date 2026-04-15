import { z } from "zod";

export const HISTORY_DETAIL_FORM_SCHEMA = z.object({
  displayName: z.string({ error: "El nombre visible debe ser texto válido." }).trim().max(120),
  notes: z.string({ error: "Las notas deben ser texto válido." }).trim().max(2000),
});

export type HistoryDetailFormInput = z.infer<typeof HISTORY_DETAIL_FORM_SCHEMA>;