import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

export function SignUpForm() {
  const { isConfigured, signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedEmail = email.trim();
    if (normalizedEmail.length === 0 || password.length === 0) {
      setErrorMessage("Completá email y contraseña para crear la cuenta.");
      setMessage(null);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setMessage(null);

    try {
      const response = await signUp(normalizedEmail, password);
      setMessage(response.message);
      setEmail("");
      setPassword("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo crear la cuenta.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="label-chip" htmlFor="sign-up-email">
          Email
        </label>
        <input
          id="sign-up-email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setErrorMessage(null);
            setMessage(null);
          }}
          placeholder="vos@empresa.com"
          className="field-surface px-4 py-3 text-sm leading-6 text-on-surface placeholder:text-on-surface-variant"
          aria-describedby="sign-up-status"
        />
      </div>

      <div className="space-y-2">
        <label className="label-chip" htmlFor="sign-up-password">
          Contraseña
        </label>
        <input
          id="sign-up-password"
          name="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setErrorMessage(null);
            setMessage(null);
          }}
          placeholder="Elegí una contraseña robusta"
          className="field-surface px-4 py-3 text-sm leading-6 text-on-surface placeholder:text-on-surface-variant"
          aria-describedby="sign-up-status"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p id="sign-up-status" className="min-h-6 text-sm leading-6 text-on-surface-variant" aria-live="polite">
          {errorMessage ?? message ?? (isConfigured ? " " : "Configurá Supabase para habilitar el acceso.")}
        </p>
        <button className="primary-button sm:min-w-44" type="submit" disabled={isSubmitting || !isConfigured}>
          {isSubmitting ? "Creando..." : "Crear cuenta"}
        </button>
      </div>
    </form>
  );
}
