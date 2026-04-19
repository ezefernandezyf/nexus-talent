import { useEffect, useState, type FormEvent } from "react";
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
  location?: string | null;
  successMessage?: string | null;
}

export function SettingsForm({
  displayName,
  email,
  errorMessage,
  isLoading = false,
  isPending = false,
  isUnavailable = false,
  location,
  onSubmit,
  successMessage,
}: SettingsFormProps) {
  const [draftDisplayName, setDraftDisplayName] = useState(displayName);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  useEffect(() => {
    setDraftDisplayName(displayName);
  }, [displayName]);

  const resolvedLocation = location?.trim().length ? location.trim() : "Sin ubicación registrada";
  const initials =
    displayName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((value) => value[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "NT";

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
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] lg:items-start">
        <div className="flex flex-col items-start gap-4 rounded-3xl bg-surface-container-lowest/70 p-5 sm:flex-row sm:items-center lg:flex-col lg:items-start">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-surface-container-high text-2xl font-bold tracking-[-0.04em] text-white shadow-[0_20px_50px_rgba(0,0,0,0.22)]">
            {initials}
          </div>
          <div className="space-y-2">
            <span className="label-chip">Perfil</span>
            <h3 className="text-xl font-semibold tracking-[-0.02em] text-white">Actualizá tu perfil sin salir del panel.</h3>
            <p className="text-sm leading-6 text-on-surface-variant">El nombre visible sigue siendo editable y la ubicación se conserva como referencia del perfil.</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 sm:col-span-2">
            <span className="text-[10px] font-label uppercase tracking-[0.28em] text-on-surface-variant">Nombre visible</span>
            <input
              className="field-surface w-full px-4 py-3 text-base text-on-surface placeholder:text-on-surface-variant/60"
              disabled={isFormDisabled}
              maxLength={120}
              placeholder="Marcus Sterling"
              value={draftDisplayName}
              onChange={(event) => setDraftDisplayName(event.target.value)}
            />
          </label>

          <label className="space-y-2">
            <span className="text-[10px] font-label uppercase tracking-[0.28em] text-on-surface-variant">Email</span>
            <input
              aria-readonly="true"
              className="field-surface w-full px-4 py-3 text-base text-on-surface placeholder:text-on-surface-variant/60"
              readOnly
              value={email}
            />
          </label>

          <div className="space-y-2">
            <span className="text-[10px] font-label uppercase tracking-[0.28em] text-on-surface-variant">Ubicación</span>
            <div className="field-surface flex min-h-12 items-center px-4 py-3 text-base text-on-surface-variant">{resolvedLocation}</div>
          </div>
        </div>
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

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-2xl text-sm leading-6 text-on-surface-variant">Guardá los cambios para actualizar tu perfil visible.</p>
        <Button disabled={isFormDisabled} type="submit">
          {isPending ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
