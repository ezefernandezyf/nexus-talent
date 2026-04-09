import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("El email debe ser válido."),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
});

export const signupSchema = loginSchema.extend({
  // future fields (name, company) can be added here
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignupFormValues = z.infer<typeof signupSchema>;
