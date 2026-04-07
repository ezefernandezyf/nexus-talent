import { useEffect, useMemo, useState, type FormEvent } from "react";
import { APP_SETTINGS_INPUT_SCHEMA, type AppSettings, type AppSettingsInput } from "../../../lib/validation/settings";

interface SettingsFormProps {
  errorMessage?: string | null;
  isPending?: boolean;
  onSubmit: (settings: AppSettingsInput) => Promise<void> | void;
  settings: AppSettings;
  successMessage?: string | null;
}

function toTextareaValue(domains: string[]) {
  return domains.join("\n");
}

function parseAllowedDomains(value: string) {
  return value
    .split(/\r?\n/)
    .map((domain) => domain.trim())
    .filter(Boolean);
}

export function SettingsForm({ errorMessage, isPending = false, onSubmit, settings, successMessage }: SettingsFormProps) {
  const [maintenanceMode, setMaintenanceMode] = useState(settings.maintenanceMode);
  const [allowedDomains, setAllowedDomains] = useState(() => toTextareaValue(settings.allowedDomains));
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  useEffect(() => {
    setMaintenanceMode(settings.maintenanceMode);
    setAllowedDomains(toTextareaValue(settings.allowedDomains));
  }, [settings]);

  const helperText = useMemo(
    () => "Escribí un dominio por línea. El formulario valida la estructura antes de guardar.",
    [],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = APP_SETTINGS_INPUT_SCHEMA.safeParse({
      allowedDomains: parseAllowedDomains(allowedDomains),
      maintenanceMode,
    });

    if (!payload.success) {
      setValidationMessage("Revisá los dominios permitidos y el estado de mantenimiento.");
      return;
    }

    setValidationMessage(null);
    await onSubmit(payload.data);
  }

  return (
    <form className="surface-panel flex flex-col gap-6 p-6 sm:p-8" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <span className="label-chip">Configuración global</span>
        <h2 className="text-2xl font-semibold tracking-[-0.02em] text-white sm:text-3xl">Administrá ajustes operativos sin tocar código.</h2>
        <p className="text-base leading-7 text-on-surface-variant">{helperText}</p>
      </div>

      {errorMessage ? <p className="text-sm leading-6 text-error" role="alert">{errorMessage}</p> : null}
      {validationMessage ? <p className="text-sm leading-6 text-error" role="alert">{validationMessage}</p> : null}
      {successMessage ? <p className="text-sm leading-6 text-success" role="status">{successMessage}</p> : null}

      <label className="flex items-center gap-3">
        <input
          checked={maintenanceMode}
          className="h-5 w-5 rounded border border-outline_variant bg-surface-container-lowest accent-white"
          disabled={isPending}
          type="checkbox"
          onChange={(event) => setMaintenanceMode(event.target.checked)}
        />
        <span className="text-sm font-medium uppercase tracking-[0.2em] text-on-surface-variant">Modo mantenimiento</span>
      </label>

      <label className="space-y-2">
        <span className="text-sm font-medium uppercase tracking-[0.2em] text-on-surface-variant">Dominios permitidos</span>
        <textarea
          className="min-h-36 w-full rounded-3xl border-0 bg-surface-container-lowest px-4 py-3 text-base text-on-surface outline-none ring-1 ring-inset ring-outline_variant/40 placeholder:text-on-surface-variant/60 focus:ring-surface-bright"
          disabled={isPending}
          placeholder="empresa.com\npartners.dev"
          value={allowedDomains}
          onChange={(event) => setAllowedDomains(event.target.value)}
        />
      </label>

      <button
        className="inline-flex items-center justify-center rounded-full bg-surface-bright px-5 py-3 text-sm font-semibold text-surface-container-highest transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isPending}
        type="submit"
      >
        {isPending ? "Guardando..." : "Guardar configuración"}
      </button>
    </form>
  );
}
