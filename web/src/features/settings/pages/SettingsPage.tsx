import { FeaturePageShell } from "@/shared/components";
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
      <h1 className="text-h1 mt-2">Settings</h1>

      <div className="mt-8">
        <SettingsFeature />
      </div>
    </FeaturePageShell>
  );
}
