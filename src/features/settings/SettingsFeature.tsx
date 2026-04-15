import { useMemo, useState, type ReactNode } from "react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { useAuth, AUTH_STATUS } from "../auth";
import { getOAuthProviderConfig } from "../../lib/supabase";
import { type ProfileRepository } from "../../lib/repositories";
import { getDisplayName, getLinkedAccounts, getLocation } from "./settings-export";
import { SettingsForm } from "./components/SettingsForm";
import { useSettings } from "./hooks/useSettings";

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}

function StatusPill({ connected }: { connected: boolean }) {
  return (
    <span
      className={connected ? "label-chip bg-success/10 text-success" : "label-chip bg-on-surface/5 text-on-surface-variant"}
      data-state={connected ? "connected" : "disconnected"}
    >
      {connected ? "Conectado" : "No conectado"}
    </span>
  );
}

function SectionHeader({ action, description, eyebrow, title }: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <div className="space-y-2">
        <span className="label-chip">{eyebrow}</span>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-[-0.02em] text-white sm:text-[2rem]">{title}</h2>
          <p className="max-w-2xl text-base leading-7 text-on-surface-variant">{description}</p>
        </div>
      </div>
      {action ? <div className="pt-1 sm:pt-0">{action}</div> : null}
    </div>
  );
}

interface SettingsFeatureProps {
  repository?: ProfileRepository;
}

export function SettingsFeature({ repository }: SettingsFeatureProps) {
  const { status, user, isConfigured } = useAuth();
  const { profile, profileError, profileLoading, saveProfile, saveProfileError, saveProfilePending, saveProfileSuccess, theme } = useSettings({ repository });
  const [isDeletePromptOpen, setIsDeletePromptOpen] = useState(false);

  const linkedAccounts = useMemo(() => getLinkedAccounts(user), [user]);
  const displayName = profile?.display_name ?? getDisplayName(user);
  const location = getLocation(user) ?? "Sin ubicación registrada";
  const profileLoadErrorMessage = useMemo(() => {
    if (profileError instanceof Error) {
      return profileError.message;
    }

    return null;
  }, [profileError]);

  const saveProfileErrorMessage = useMemo(() => {
    if (saveProfileError instanceof Error) {
      return saveProfileError.message;
    }

    return null;
  }, [saveProfileError]);

  if (status === AUTH_STATUS.LOADING) {
    return (
      <Card className="flex min-h-80 items-center justify-center p-6 text-center" tone="low">
        <div className="max-w-xl space-y-3">
          <span className="label-chip">Configuración</span>
          <p className="text-base leading-7 text-on-surface-variant">Estamos cargando tu espacio de cuenta y conexiones.</p>
        </div>
      </Card>
    );
  }

  if (!isConfigured || !user) {
    return (
      <Card className="flex min-h-80 items-center justify-center p-6 text-center" role="alert" tone="low">
        <div className="max-w-xl space-y-3">
          <span className="label-chip">Perfil no disponible</span>
          <p className="text-base leading-7 text-on-surface-variant">
            No hay una sesión de usuario lista para mostrar información de cuenta. Iniciá sesión para ver tus datos y preferencias.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="flex flex-col gap-7 p-6 sm:gap-8 sm:p-8" tone="low">
        <SectionHeader
          action={<span className="label-chip">Tema {theme === "dark" ? "oscuro" : "claro"}</span>}
          description="Revisá tu email, editá el nombre visible y guardá el perfil en la base de datos compartida."
          eyebrow="Account Information"
          title="Tu identidad visible en el producto"
        />

        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl bg-surface-container-lowest/60 p-4">
            <p className="text-[10px] font-label uppercase tracking-[0.28em] text-on-surface-variant">Email</p>
            <p className="mt-2 text-sm leading-6 text-on-surface">{user.email ?? "Sin correo"}</p>
          </article>
          <article className="rounded-2xl bg-surface-container-lowest/60 p-4">
            <p className="text-[10px] font-label uppercase tracking-[0.28em] text-on-surface-variant">Nombre visible</p>
            <p className="mt-2 text-sm leading-6 text-on-surface">{displayName}</p>
          </article>
          <article className="rounded-2xl bg-surface-container-lowest/60 p-4">
            <p className="text-[10px] font-label uppercase tracking-[0.28em] text-on-surface-variant">Ubicación</p>
            <p className="mt-2 text-sm leading-6 text-on-surface">{location}</p>
          </article>
        </div>

        <SettingsForm
          displayName={displayName}
          email={user.email ?? "Sin correo"}
          errorMessage={profileLoadErrorMessage ?? saveProfileErrorMessage}
          isLoading={profileLoading && !profile}
          isPending={saveProfilePending}
          isUnavailable={Boolean(profileLoadErrorMessage)}
          successMessage={saveProfileSuccess ? "Perfil guardado correctamente." : null}
          onSubmit={async (payload) => {
            try {
              await saveProfile({
                displayName: payload.displayName,
                email: user.email ?? "",
                userId: user.id,
              });
            } catch {
              // Error state is handled by the hook; avoid unhandled rejections.
            }
          }}
        />
      </Card>

      <Card className="flex flex-col gap-7 p-6 sm:gap-8 sm:p-8" tone="low">
        <SectionHeader
          description="Solo mostramos el estado actual. No hay flujo de vinculación ni desvinculación en esta pantalla."
          eyebrow="Linked Accounts"
          title="Estado de conexión por proveedor"
        />

        <div className="grid gap-4 md:grid-cols-3">
          {linkedAccounts.map((account) => {
            const providerConfig = getOAuthProviderConfig(account.provider);

            return (
              <article key={account.provider} className="rounded-2xl bg-surface-container-lowest/60 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-medium text-on-surface">{providerConfig.label}</p>
                    <p className="mt-1 text-sm leading-6 text-on-surface-variant">Estado de la cuenta conectada en la sesión actual.</p>
                  </div>
                  <StatusPill connected={account.connected} />
                </div>
              </article>
            );
          })}
        </div>
      </Card>

      <Card className="flex flex-col gap-6 p-6 sm:p-8" tone="lowest">
        <SectionHeader
          description="La eliminación no corre automáticamente. El usuario tiene que abrir la confirmación y volver a aceptar la acción antes de continuar."
          eyebrow="Danger Zone"
          title="Eliminar cuenta requiere confirmación explícita"
        />

        {!isDeletePromptOpen ? (
          <div>
            <Button className="text-error" variant="secondary" type="button" onClick={() => setIsDeletePromptOpen(true)}>
              Eliminar cuenta
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4 rounded-2xl bg-surface-container-lowest/70 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-6 text-on-surface-variant">
              Confirmá si realmente querés continuar. Cancelar deja la cuenta sin cambios.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="secondary" type="button" onClick={() => setIsDeletePromptOpen(false)}>
                Cancelar
              </Button>
              <Button type="button" onClick={() => setIsDeletePromptOpen(false)}>
                Confirmar eliminación
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
