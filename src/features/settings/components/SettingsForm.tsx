import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { PROFILE_FORM_SCHEMA, type ProfileFormInput } from "../../../lib/validation/profile";

interface SettingsFormProps {
  errorMessage?: string | null;
  isLoading?: boolean;
  isUnavailable?: boolean;
  isPending?: boolean;
  onSubmit: (settings: ProfileFormInput) => Promise<void> | void;
  displayName: string;
  email: string;
  successMessage?: string | null;
}

export function SettingsForm({
  displayName,
  email,
  errorMessage,
  isLoading = false,
  isPending = false,
  isUnavailable = false,
  onSubmit,
  successMessage,
}: SettingsFormProps) {
  const [draftDisplayName, setDraftDisplayName] = useState(displayName);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  useEffect(() => {
    setDraftDisplayName(displayName);
  }, [displayName]);

  const helperText = useMemo(
    () => "Editá el nombre visible. El email queda de referencia y la persistencia corre por Supabase.",
    [],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = PROFILE_FORM_SCHEMA.safeParse({
      displayName: draftDisplayName,
    });

    if (!payload.success) {
      setValidationMessage("Revisá el nombre visible antes de guardar.");
      return;
    }

    setValidationMessage(null);
    await onSubmit(payload.data);
  }

  const isFormDisabled = isPending || isUnavailable || isLoading;

  return (
    <form className="flex flex-col gap-5 p-6 sm:gap-6 sm:p-8" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <span className="label-chip">Cuenta y perfil</span>
        <h2 className="text-2xl font-semibold tracking-[-0.02em] text-white sm:text-3xl">Actualizá tu perfil sin salir del panel.</h2>
        <p className="max-w-2xl text-base leading-7 text-on-surface-variant">{helperText}</p>
      </div>

      {errorMessage ? (
        <p className="ghost-frame rounded-2xl bg-error/10 px-4 py-3 text-sm leading-6 text-error" role="alert">
          {errorMessage}
        </p>
      ) : null}
      {isLoading ? (
        <p className="ghost-frame rounded-2xl bg-primary/10 px-4 py-3 text-sm leading-6 text-on-surface-variant" role="status">
          Estamos cargando el perfil guardado para sincronizar el formulario.
        </p>
      ) : null}
      {isUnavailable ? (
        <p className="ghost-frame rounded-2xl bg-error/10 px-4 py-3 text-sm leading-6 text-error" role="alert">
          El almacenamiento del perfil no está disponible en este momento.
        </p>
      ) : null}
      {validationMessage ? (
        <p className="ghost-frame rounded-2xl bg-error/10 px-4 py-3 text-sm leading-6 text-error" role="alert">
          {validationMessage}
        </p>
      ) : null}
      {successMessage ? (
        <p className="ghost-frame rounded-2xl bg-success/10 px-4 py-3 text-sm leading-6 text-success" role="status">
          {successMessage}
        </p>
      ) : null}

      <label className="space-y-2">
        <span className="text-sm font-medium uppercase tracking-[0.2em] text-on-surface-variant">Email</span>
        <input
          aria-readonly="true"
          className="field-surface px-4 py-3 text-base text-on-surface placeholder:text-on-surface-variant/60"
          readOnly
          value={email}
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm font-medium uppercase tracking-[0.2em] text-on-surface-variant">Nombre visible</span>
        <input
          className="field-surface px-4 py-3 text-base text-on-surface placeholder:text-on-surface-variant/60"
          disabled={isFormDisabled}
          maxLength={120}
          placeholder="Marcus Sterling"
          value={draftDisplayName}
          onChange={(event) => setDraftDisplayName(event.target.value)}
        />
      </label>

      <p className="text-sm leading-6 text-on-surface-variant">El nombre visible se guarda en public.profiles y queda listo para la siguiente visita.</p>

      <Button disabled={isFormDisabled} type="submit">
        {isPending ? "Guardando..." : "Guardar perfil"}
      </Button>
    </form>
  );
}
