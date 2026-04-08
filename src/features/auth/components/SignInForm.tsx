import { useState } from "react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { useAuth } from "../hooks/useAuth";

export function SignInForm() {
  const { isConfigured, signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedEmail = email.trim();
    if (normalizedEmail.length === 0 || password.length === 0) {
      setErrorMessage("Completá email y contraseña para iniciar sesión.");
      setMessage(null);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setMessage(null);

    try {
      const response = await signIn(normalizedEmail, password);
      setMessage(response.message);
      setEmail("");
      setPassword("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo iniciar sesión.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="label-chip" htmlFor="sign-in-email">
          Email
        </label>
        <Input
          id="sign-in-email"
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
          aria-describedby="sign-in-status"
        />
      </div>

      <div className="space-y-2">
        <label className="label-chip" htmlFor="sign-in-password">
          Contraseña
        </label>
        <Input
          id="sign-in-password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setErrorMessage(null);
            setMessage(null);
          }}
          placeholder="Tu contraseña segura"
          aria-describedby="sign-in-status"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p id="sign-in-status" className="min-h-6 text-sm leading-6 text-on-surface-variant" aria-live="polite">
          {errorMessage ?? message ?? (isConfigured ? " " : "Configurá Supabase para habilitar el acceso.")}
        </p>
        <Button className="sm:min-w-44" type="submit" disabled={isSubmitting || !isConfigured}>
          {isSubmitting ? "Ingresando..." : "Iniciar sesión"}
        </Button>
      </div>
    </form>
  );
}
