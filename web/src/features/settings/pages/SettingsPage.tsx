import { FeaturePageShell } from "@/shared/components";
import { Eyebrow } from "@/shared/components/eyebrow/Eyebrow";
import { SettingsPageSkeleton } from "@/features/settings/components/SettingsPageSkeleton";
import { useAuth } from "@/features/auth";
import { SettingsFeature } from "..";

export function SettingsPage() {
  const { status } = useAuth();

  if (status === "loading" || status === "unknown") {
    return <SettingsPageSkeleton />;
  }

  return (
    <FeaturePageShell>
      <Eyebrow>Configuración</Eyebrow>
      <h1 className="text-h1 mt-2">Settings</h1>

      <div className="mt-8">
        <SettingsFeature />
      </div>
    </FeaturePageShell>
  );
}
