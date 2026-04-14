import { FeaturePageShell, PageHeader } from "../components/ui";
import { Button } from "../components/ui/Button";
import { useAuth } from "../features/auth";
import { downloadTextFile } from "../features/analysis/export";
import { SettingsFeature } from "../features/settings";
import { buildSettingsExportPayload } from "../features/settings/settings-export";
import { useTheme } from "../lib/theme";

export function SettingsPage() {
  const { session, user, status } = useAuth();
  const { theme, toggleTheme } = useTheme();

  function handleExport() {
    if (status !== "authenticated") {
      return;
    }

    const exportPayload = buildSettingsExportPayload({ session, theme, user });

    downloadTextFile({
      content: exportPayload.content,
      filename: exportPayload.filename,
      mimeType: "application/json;charset=utf-8",
    });
  }

  const isExportDisabled = status !== "authenticated";

  return (
    <FeaturePageShell>
      <PageHeader
        action={
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="secondary" onClick={toggleTheme} type="button">
              <span className="material-symbols-outlined text-sm" aria-hidden="true">
                {theme === "dark" ? "light_mode" : "dark_mode"}
              </span>
              {theme === "dark" ? "Tema claro" : "Tema oscuro"}
            </Button>
            <Button disabled={isExportDisabled} type="button" onClick={handleExport}>
              <span className="material-symbols-outlined text-sm" aria-hidden="true">
                download
              </span>
              Exportar datos
            </Button>
          </div>
        }
        description="Gestioná identidad, conexiones y preferencias compartidas desde una sola vista."
        title="Configuración"
      />

      <SettingsFeature />
    </FeaturePageShell>
  );
}
