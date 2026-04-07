import { useMemo, useState } from "react";
import { createDefaultSettings, type AppSettingsInput } from "../../lib/validation/settings";
import { SettingsForm } from "./components/SettingsForm";
import { useSettings } from "./hooks/useSettings";
import type { SettingsRepository } from "../../lib/repositories";

interface SettingsFeatureProps {
  repository?: SettingsRepository;
}

export function SettingsFeature({ repository }: SettingsFeatureProps) {
  const settingsQuery = useSettings({ repository });
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const currentSettings = useMemo(() => settingsQuery.data ?? createDefaultSettings(), [settingsQuery.data]);

  async function handleSubmit(payload: AppSettingsInput) {
    setFeedbackMessage(null);
    await settingsQuery.saveSettings(payload);
    setFeedbackMessage("Configuración guardada correctamente.");
  }

  if (settingsQuery.isPending) {
    return (
      <div className="surface-panel flex min-h-80 items-center justify-center p-6 text-center">
        <p className="text-base leading-7 text-on-surface-variant">Estamos cargando la configuración global.</p>
      </div>
    );
  }

  if (settingsQuery.error) {
    const errorMessage = settingsQuery.error instanceof Error ? settingsQuery.error.message : "No se pudo cargar la configuración.";

    return (
      <div className="surface-panel flex min-h-80 items-center justify-center p-6 text-center" role="alert">
        <p className="text-base leading-7 text-on-surface-variant">{errorMessage}</p>
      </div>
    );
  }

  return (
    <section className="surface-panel flex flex-col gap-6 p-6 sm:p-8">
      <div className="space-y-2">
        <span className="label-chip">Panel admin</span>
        <h1 className="text-3xl font-semibold tracking-[-0.02em] text-white sm:text-4xl">Settings</h1>
      </div>

      <SettingsForm
        errorMessage={settingsQuery.saveSettingsError instanceof Error ? settingsQuery.saveSettingsError.message : null}
        isPending={settingsQuery.saveSettingsPending}
        onSubmit={handleSubmit}
        settings={currentSettings}
        successMessage={feedbackMessage}
      />
    </section>
  );
}
