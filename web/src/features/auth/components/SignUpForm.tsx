import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { useAuth } from "../hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupFormValues } from "../schemas/auth";
import { useState } from "react";

export function SignUpForm() {
  const { isConfigured, signInWithOAuth, signUp } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SignupFormValues>({ resolver: zodResolver(signupSchema) });

  const [serverError, setServerError] = useState<string | null>(null);
  const [isOAuthSubmitting, setIsOAuthSubmitting] = useState(false);

  async function onSubmit(values: SignupFormValues) {
    setServerError(null);
    try {
      await signUp(values.email.trim(), values.password);
      reset();
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "No se pudo crear la cuenta.");
    }
  }

  async function handleOAuthSignIn() {
    setServerError(null);
    setIsOAuthSubmitting(true);

    try {
      await signInWithOAuth("google");
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "No se pudo continuar con el proveedor seleccionado.");
    } finally {
      setIsOAuthSubmitting(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-4">
        <button
          type="button"
          className="w-full flex items-center justify-center gap-3 rounded-xl border border-surface-container bg-white p-0.5 text-[#0B0E14] transition-opacity duration-200 hover:opacity-90"
          disabled={isOAuthSubmitting || !isConfigured}
          onClick={handleOAuthSignIn}
        >
          <span className="flex items-center gap-3 px-4 py-3 text-[#0B0E14]">
            <svg className="w-5 h-5" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M23 9.5c3.6 0 6.1 1.6 7.5 2.9l5.5-5.5C33.1 4 28.5 2 23 2 14.9 2 7.8 6.7 4.1 13.6l6.6 5.1C12.9 13.2 17.5 9.5 23 9.5z" fill="#EA4335"/>
              <path d="M38.9 18.1c.3 1.5.5 3.1.5 4.4 0 1.2-.2 2.1-.6 3.1-.6 1.6-1.6 3-2.8 4.2-1.3 1.2-2.9 2.1-4.7 2.7-1.7.6-3.6.9-5.5.9-3.6 0-6.1-1.6-7.5-2.9l-5.5 5.5C12.9 42 17.5 46 23 46c8.1 0 15.2-4.7 18.9-11.6 0 0-6.6-5.1-6.6-5.1 0 0 1.8-5.2 3.6-6.4.9-.6 1.9-1.2 2.1-2.8.1-.9.1-1.7.1-2.7 0-1.3-.2-2.6-.6-3.8L38.9 18.1z" fill="#4285F4"/>
              <path d="M9.5 30.9c-.6-1.6-.9-3.3-.9-5 0-1.7.3-3.4.9-5l-6.6-5.1C1.1 18.4 0 20.6 0 23c0 2.4 1.1 4.6 2.9 6.2l6.6 1.7z" fill="#FBBC05"/>
              <path d="M23 37c4.5 0 8.1-1.6 10.7-3.9 1.1-.9 2.1-2 2.8-3.2.5-.9.9-1.9 1.1-2.9.1-.9.1-1.7.1-2.6 0-1.3-.2-2.6-.6-3.8L23 37z" fill="#34A853"/>
            </svg>
            <span className="font-headline tracking-tight text-[#0B0E14]">{isOAuthSubmitting ? "Redirigiendo..." : "Continuar con Google"}</span>
          </span>
        </button>

      </div>

      <div className="space-y-2">
        <label className="label-chip" htmlFor="sign-up-email">
          Email
        </label>
        <Input id="sign-up-email" {...register("email")} type="email" autoComplete="email" placeholder="vos@empresa.com" aria-describedby="sign-up-status" />
        {errors.email && <p className="text-sm text-red-400">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="label-chip" htmlFor="sign-up-password">
          Contraseña
        </label>
        <Input id="sign-up-password" {...register("password")} type="password" autoComplete="new-password" placeholder="Elegí una contraseña robusta" aria-describedby="sign-up-status" />
        {errors.password && <p className="text-sm text-red-400">{errors.password.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="label-chip" htmlFor="sign-up-confirm-password">
          Confirmar contraseña
        </label>
        <Input
          id="sign-up-confirm-password"
          {...register("confirmPassword")}
          type="password"
          autoComplete="new-password"
          placeholder="Repetí la contraseña"
          aria-describedby="sign-up-status"
        />
        {errors.confirmPassword && <p className="text-sm text-red-400">{errors.confirmPassword.message}</p>}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p id="sign-up-status" className="min-h-6 text-sm leading-6 text-on-surface-variant" aria-live="polite">
          {serverError ?? (isConfigured ? " " : "Configurá Supabase para habilitar el acceso.")}
        </p>
        <Button className="sm:min-w-44" type="submit" disabled={isSubmitting || isOAuthSubmitting || !isConfigured}>
          {isSubmitting ? "Creando..." : "Crear cuenta"}
        </Button>
      </div>
    </form>
  );
}
