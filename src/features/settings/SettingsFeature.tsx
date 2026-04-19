import { useMemo, useState, type ReactNode } from "react";
import { Modal } from "../../components/ui/Modal";
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
  icon: string;
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

function ProviderIcon({ provider }: { provider: "google" }) {
  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335" />
    </svg>
  );
}

function SectionHeader({ action, description, eyebrow, icon, title }: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <div className="space-y-3">
        <span className="label-chip">{eyebrow}</span>
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-surface-container-lowest/80 text-primary shadow-[0_16px_40px_rgba(0,0,0,0.16)]" aria-hidden="true">
            <span className="material-symbols-outlined text-[20px]">{icon}</span>
          </span>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-[-0.02em] text-white sm:text-[2rem]">{title}</h2>
            <p className="max-w-2xl text-base leading-7 text-on-surface-variant">{description}</p>
          </div>
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
  const {
    accountActionError,
    accountActionPending,
    accountDeletionAvailable,
    connectAccount,
    disconnectAccount,
    deleteAccount,
    deleteAccountError,
    deleteAccountPending,
    deleteAccountReset,
    identityLinkingAvailable,
    profile,
    profileError,
    profileLoading,
    saveProfile,
    saveProfileError,
    saveProfilePending,
    saveProfileSuccess,
    theme,
  } = useSettings({ repository });
  const [isDeletePromptOpen, setIsDeletePromptOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");

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

  const accountActionErrorMessage = useMemo(() => {
    return accountActionError;
  }, [accountActionError]);

  const deleteAccountErrorMessage = useMemo(() => {
    if (deleteAccountError instanceof Error) {
      return deleteAccountError.message;
    }

    return null;
  }, [deleteAccountError]);

  const canConfirmDelete = deleteConfirmationText.trim().toLowerCase() === "eliminar cuenta";

  function openDeleteModal() {
    deleteAccountReset();
    setDeleteConfirmationText("");
    setIsDeletePromptOpen(true);
  }

  function closeDeleteModal() {
    deleteAccountReset();
    setDeleteConfirmationText("");
    setIsDeletePromptOpen(false);
  }

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
          description="Gestioná tu identidad, conexiones de plataforma y preferencias de seguridad desde una sola vista."
          eyebrow="Cuenta y perfil"
          icon="person"
          title="Información de la cuenta"
        />

        <SettingsForm
          displayName={displayName}
          email={user.email ?? "Sin correo"}
          errorMessage={profileLoadErrorMessage ?? saveProfileErrorMessage}
          isLoading={profileLoading && !profile}
          isPending={saveProfilePending}
          isUnavailable={Boolean(profileLoadErrorMessage)}
          location={location}
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
          description="Gestioná tus conexiones sociales desde acá. Mostramos solo los proveedores que usás para iniciar sesión."
          eyebrow="Cuentas vinculadas"
          icon="link"
          title="Conexiones de plataforma"
        />

        <div className="grid gap-4 md:grid-cols-2">
          {linkedAccounts.map((account) => {
            const providerConfig = getOAuthProviderConfig(account.provider);
            const isPending = accountActionPending === account.provider;

            return (
              <article key={account.provider} className="ghost-frame rounded-2xl bg-surface-container-low/40 p-4 sm:p-5">
                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-surface-container-lowest text-on-surface">
                      <ProviderIcon provider={account.provider} />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-base font-semibold text-on-surface">{providerConfig.label}</p>
                          <p className="text-sm leading-6 text-on-surface-variant">
                            {account.connected ? "Cuenta conectada a esta sesión." : "Conectá este proveedor para habilitar el vínculo."}
                          </p>
                        </div>
                        <StatusPill connected={account.connected} />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs uppercase tracking-[0.18em] text-on-surface-variant">{account.connected ? "Vinculación activa" : "Sin vínculo"}</p>
                    <Button
                      className={account.connected ? "text-error" : ""}
                      disabled={isPending}
                      variant="secondary"
                      onClick={async () => {
                        try {
                          if (account.connected) {
                            await disconnectAccount(account.provider);
                            return;
                          }

                          await connectAccount(account.provider);
                        } catch {
                          // The hook owns the error state; keep the card interactive.
                        }
                      }}
                    >
                      {isPending
                          ? account.connected
                            ? "Desvinculando..."
                            : "Vinculando..."
                          : account.connected
                            ? "Desvincular"
                            : "Vincular"}
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {accountActionErrorMessage ? (
          <p className="rounded-2xl bg-error/10 px-4 py-3 text-sm leading-6 text-error" role="alert">
            {accountActionErrorMessage}
          </p>
        ) : null}
      </Card>

      <Card className="flex flex-col gap-6 p-6 sm:p-8" tone="lowest">
        <SectionHeader
          description="La eliminación pide una confirmación escrita para evitar borrados accidentales."
          eyebrow="Zona de peligro"
          icon="warning"
          title="Eliminar cuenta"
        />

        <div className="flex flex-col gap-5 rounded-2xl bg-surface-container-lowest/70 p-5 sm:p-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="text-sm leading-6 text-on-surface-variant">
              Esta acción borra tu cuenta y la información asociada. Vas a tener que escribir la frase exacta para habilitar la confirmación.
            </p>
            {deleteAccountErrorMessage ? (
              <p className="rounded-2xl bg-error/10 px-4 py-3 text-sm leading-6 text-error" role="alert">
                {deleteAccountErrorMessage}
              </p>
            ) : null}
          </div>
          <Button className="whitespace-nowrap text-error" variant="secondary" type="button" onClick={openDeleteModal}>
            Eliminar cuenta
          </Button>
        </div>
      </Card>

      {isDeletePromptOpen ? (
        <Modal onClose={closeDeleteModal} title="Eliminar cuenta">
          <div className="space-y-5">
            <p className="text-sm leading-7 text-on-surface-variant">
              Si seguís, tu cuenta y los datos vinculados se eliminarán permanentemente. Escribí <span className="font-semibold text-on-surface">eliminar cuenta</span> para confirmar.
            </p>

            <label className="block space-y-2">
              <span className="text-xs font-label uppercase tracking-[0.2em] text-on-surface-variant">Confirmación</span>
              <input
                autoComplete="off"
                className="field-surface w-full px-4 py-3 text-base text-on-surface placeholder:text-on-surface-variant/60"
                placeholder="eliminar cuenta"
                value={deleteConfirmationText}
                onChange={(event) => setDeleteConfirmationText(event.target.value)}
              />
            </label>

            <div className="flex flex-wrap items-center justify-end gap-3">
              <Button disabled={deleteAccountPending} variant="secondary" type="button" onClick={closeDeleteModal}>
                Cancelar
              </Button>
              <Button
                disabled={!canConfirmDelete || deleteAccountPending}
                type="button"
                onClick={async () => {
                  try {
                    await deleteAccount();
                    closeDeleteModal();
                  } catch {
                    // The hook exposes the error state; keep the modal open.
                  }
                }}
              >
                {deleteAccountPending ? "Eliminando..." : "Eliminar cuenta"}
              </Button>
            </div>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
