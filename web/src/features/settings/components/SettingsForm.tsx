import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/shared/components/Button";
import { Label } from "@/shared/components/label/Label";
import { Input } from "@/shared/components/Input";
import { PROFILE_FORM_SCHEMA, type ProfileFormInput } from "@/features/settings/api/validation";

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
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="settings-name">Nombre visible</Label>
          <Input
            id="settings-name"
            disabled={isFormDisabled}
            maxLength={120}
            placeholder="Marcus Sterling"
            value={draftDisplayName}
            onChange={(event) => setDraftDisplayName(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="settings-email">Email</Label>
          <Input
            id="settings-email"
            aria-readonly="true"
            readOnly
            value={email}
          />
        </div>
      </div>

      {errorMessage ? (
        <p className="rounded-lg bg-[var(--color-error)]/10 px-4 py-3 text-sm leading-6 text-[var(--color-error)]" role="alert">
          {errorMessage}
        </p>
      ) : null}

      {isLoading ? (
        <p className="rounded-lg bg-[var(--accent)]/10 px-4 py-3 text-sm leading-6 text-text-secondary" role="status">
          Estamos cargando el perfil guardado para sincronizar el formulario.
        </p>
      ) : null}

      {isUnavailable ? (
        <p className="rounded-lg bg-[var(--color-error)]/10 px-4 py-3 text-sm leading-6 text-[var(--color-error)]" role="alert">
          El almacenamiento del perfil no está disponible en este momento.
        </p>
      ) : null}

      {validationMessage ? (
        <p className="rounded-lg bg-[var(--color-error)]/10 px-4 py-3 text-sm leading-6 text-[var(--color-error)]" role="alert">
          {validationMessage}
        </p>
      ) : null}

      {successMessage ? (
        <p className="rounded-lg bg-[var(--color-success)]/10 px-4 py-3 text-sm leading-6 text-[var(--color-success)]" role="status">
          {successMessage}
        </p>
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-2xl text-sm leading-6 text-text-secondary">Guardá los cambios para actualizar tu perfil visible.</p>
        <Button className="w-full sm:w-auto" disabled={isFormDisabled} type="submit">
          {isPending ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
