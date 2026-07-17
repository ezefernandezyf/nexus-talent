import { AnimatePresence } from "framer-motion";
import { useMemo, useState, type ReactNode } from "react";
import { Modal } from "@/shared/components/Modal";
import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import { Badge } from "@/shared/components/Badge";
import { Accordion } from "@/shared/components/accordion";
import { useAuth, AUTH_STATUS } from "@/features/auth";
import { LogoutButton } from "@/features/auth/components/LogoutButton";
import { getOAuthProviderConfig } from "./api/oauth-config";
import type { ProfileRepository } from "./api/profile-repository";
import {
  buildSettingsExportPayload,
  getDisplayName,
  getLinkedAccounts,
} from "./settings-export";
import { SettingsForm } from "./components/SettingsForm";
import { ContactSection } from "./components/ContactSection";
import { SkillsSection } from "./components/SkillsSection";
import { ExperienceSection } from "./components/ExperienceSection";
import { EducationSection } from "./components/EducationSection";
import { useSettings } from "./hooks/useSettings";
import { useTheme } from "@/core/theme";

function ProviderIcon({ provider }: { provider: "google" }) {
  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function StatusPill({ connected }: { connected: boolean }) {
  return (
    <Badge
      className={connected ? "bg-success/10 text-success" : "bg-[--color-surface-muted] text-text-secondary"}
      data-state={connected ? "connected" : "disconnected"}
    >
      {connected ? "Conectado" : "No conectado"}
    </Badge>
  );
}

interface SettingsFeatureProps {
  repository?: ProfileRepository;
}

export function SettingsFeature({ repository }: SettingsFeatureProps) {
  const { status, user, isConfigured } = useAuth();
  const { theme } = useTheme();
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
  } = useSettings({ repository });
  const [isDeletePromptOpen, setIsDeletePromptOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [showOAuthSection, setShowOAuthSection] = useState(false);

  const linkedAccounts = useMemo(() => getLinkedAccounts(user), [user]);
  const displayName = profile?.display_name ?? getDisplayName(user);

  const profileLoadErrorMessage = useMemo(() => {
    if (profileError instanceof Error) return profileError.message;
    return null;
  }, [profileError]);

  const saveProfileErrorMessage = useMemo(() => {
    if (saveProfileError instanceof Error) return saveProfileError.message;
    return null;
  }, [saveProfileError]);

  const accountActionErrorMessage = useMemo(() => {
    return accountActionError;
  }, [accountActionError]);

  const deleteAccountErrorMessage = useMemo(() => {
    if (deleteAccountError instanceof Error) return deleteAccountError.message;
    return null;
  }, [deleteAccountError]);

  const canConfirmDelete =
    deleteConfirmationText.trim().toLowerCase() === "eliminar cuenta";

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

  function handleExport() {
    const { content, filename } = buildSettingsExportPayload({
      session: user,
      theme,
      user,
    });
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  if (status === AUTH_STATUS.LOADING) {
    return (
      <Card className="flex min-h-80 items-center justify-center p-6 text-center">
        <div className="max-w-xl space-y-3">
          <Badge>Configuración</Badge>
          <p className="text-body text-text-secondary">
            Estamos cargando tu espacio de cuenta y conexiones.
          </p>
        </div>
      </Card>
    );
  }

  if (!isConfigured || !user) {
    return (
      <Card
        className="flex min-h-80 items-center justify-center p-6 text-center"
        role="alert"
      >
        <div className="max-w-xl space-y-3">
          <Badge>Perfil no disponible</Badge>
          <p className="text-body text-text-secondary">
            No hay una sesión de usuario lista para mostrar información de
            cuenta. Iniciá sesión para ver tus datos y preferencias.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <>
      {/* ═══ Accordion-based Settings CV Hub ═══ */}
      <Accordion.Root
        defaultOpen="01"
        className="divide-y divide-border rounded-xl border border-border bg-surface"
      >
        {/* ─── 01 Account ─── */}
        <Accordion.Item id="01">
          <Accordion.Trigger>
            <span className="flex items-center gap-3">
              <span className="font-mono text-sm font-semibold text-text-tertiary">
                01
              </span>
              Account
            </span>
          </Accordion.Trigger>
          <Accordion.Content className="p-4">
            <p className="text-body text-text-secondary mb-6">
              Gestioná tu identidad y datos de perfil desde una sola vista.
            </p>
            <SettingsForm
              displayName={displayName}
              email={user.email ?? "Sin correo"}
              errorMessage={profileLoadErrorMessage ?? saveProfileErrorMessage}
              isLoading={profileLoading && !profile}
              isPending={saveProfilePending}
              isUnavailable={Boolean(profileLoadErrorMessage)}
              successMessage={
                saveProfileSuccess ? "Perfil guardado correctamente." : null
              }
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
          </Accordion.Content>
        </Accordion.Item>

        {/* ─── 02 Appearance ─── */}
        <Accordion.Item id="02">
          <Accordion.Trigger>
            <span className="flex items-center gap-3">
              <span className="font-mono text-sm font-semibold text-text-tertiary">
                02
              </span>
              Appearance
            </span>
          </Accordion.Trigger>
          <Accordion.Content className="p-4">
            <p className="text-body text-text-secondary mb-6">
              El tema sigue la configuración del sistema automáticamente. No es
              necesario cambiarlo manualmente – se adapta solo.
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-secondary">Tema actual:</span>
              <Badge>{theme === "dark" ? "oscuro" : "claro"}</Badge>
            </div>
          </Accordion.Content>
        </Accordion.Item>

        {/* ─── 03 Data ─── */}
        <Accordion.Item id="03">
          <Accordion.Trigger>
            <span className="flex items-center gap-3">
              <span className="font-mono text-sm font-semibold text-text-tertiary">
                03
              </span>
              Data
            </span>
          </Accordion.Trigger>
          <Accordion.Content className="p-4">
            <p className="text-body text-text-secondary mb-6">
              Exportá tu información o gestioná conexiones y cuenta.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button variant="outline" type="button" onClick={handleExport}>
                Exportar datos
              </Button>
              <LogoutButton variant="ghost" />
            </div>

            {/* OAuth linking — expandable section */}
            {identityLinkingAvailable && linkedAccounts.length > 0 && (
              <div className="mt-6 border-t border-border pt-6">
                <button
                  type="button"
                  onClick={() => setShowOAuthSection(!showOAuthSection)}
                  className="flex items-center gap-2 text-sm font-medium text-text-primary hover:text-accent transition-colors"
                >
                  <span
                    className={`transition-transform duration-200 ${showOAuthSection ? "rotate-90" : ""}`}
                  >
                    &#9654;
                  </span>
                  Cuentas vinculadas ({linkedAccounts.length})
                </button>

                {showOAuthSection && (
                  <div className="mt-4 space-y-4">
                    {linkedAccounts.map((account) => {
                      const providerConfig = getOAuthProviderConfig(
                        account.provider,
                      );
                      const isPending =
                        accountActionPending === account.provider;

                      return (
                        <article
                          key={account.provider}
                          className="flex items-start justify-between gap-4 rounded-md border border-border bg-surface-muted p-4"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-surface">
                              <ProviderIcon provider={account.provider} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-text-primary">
                                {providerConfig.label}
                              </p>
                              <p className="text-xs text-text-secondary mt-0.5">
                                {account.connected
                                  ? "Cuenta conectada a esta sesión."
                                  : "Conectá este proveedor para habilitar el vínculo."}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <StatusPill connected={account.connected} />
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={isPending}
                              onClick={async () => {
                                try {
                                  if (account.connected) {
                                    await disconnectAccount(account.provider);
                                  } else {
                                    await connectAccount(account.provider);
                                  }
                                } catch {
                                  // The hook owns the error state
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
                        </article>
                      );
                    })}

                    {accountActionErrorMessage ? (
                      <p
                        className="rounded-lg bg-[var(--color-error)]/10 px-4 py-3 text-sm leading-6 text-[var(--color-error)]"
                        role="alert"
                      >
                        {accountActionErrorMessage}
                      </p>
                    ) : null}
                  </div>
                )}
              </div>
            )}

            {/* Delete account section */}
            {accountDeletionAvailable && (
              <div className="mt-6 border-t border-border pt-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="max-w-xl">
                    <p className="text-sm font-medium text-text-primary">
                      Eliminar cuenta
                    </p>
                    <p className="text-xs text-text-secondary mt-1">
                      Esta acción borra tu cuenta y la información asociada. Vas
                      a tener que escribir la frase exacta para habilitar la
                      confirmación.
                    </p>
                    {deleteAccountErrorMessage ? (
                      <p
                        className="mt-2 rounded-lg bg-[var(--color-error)]/10 px-4 py-3 text-sm leading-6 text-[var(--color-error)]"
                        role="alert"
                      >
                        {deleteAccountErrorMessage}
                      </p>
                    ) : null}
                  </div>
                  <Button
                    className="whitespace-nowrap shrink-0"
                    variant="outline"
                    type="button"
                    onClick={openDeleteModal}
                  >
                    Eliminar cuenta
                  </Button>
                </div>
              </div>
            )}
          </Accordion.Content>
        </Accordion.Item>

        {/* ─── Contact ─── */}
        <Accordion.Item id="contact">
          <Accordion.Trigger>Contact</Accordion.Trigger>
          <Accordion.Content className="p-4">
            <p className="text-body text-text-secondary mb-6">
              Tu información de contacto se usa en el CV y en los mensajes
              generados.
            </p>
            <ContactSection
              profile={profile}
              userEmail={user.email ?? ""}
              isLoading={profileLoading && !profile}
              isPending={saveProfilePending}
              onSave={saveProfile}
            />
          </Accordion.Content>
        </Accordion.Item>

        {/* ─── Skills ─── */}
        <Accordion.Item id="skills">
          <Accordion.Trigger>Skills</Accordion.Trigger>
          <Accordion.Content className="p-4">
            <p className="text-body text-text-secondary mb-6">
              Agregá tus habilidades técnicas separadas por coma. Se mostrarán
              como etiquetas en el CV.
            </p>
            <SkillsSection
              profile={profile}
              isPending={saveProfilePending}
              onSave={saveProfile}
            />
          </Accordion.Content>
        </Accordion.Item>

        {/* ─── Experience ─── */}
        <Accordion.Item id="experience">
          <Accordion.Trigger>Experience</Accordion.Trigger>
          <Accordion.Content className="p-4">
            <ExperienceSection />
          </Accordion.Content>
        </Accordion.Item>

        {/* ─── Education ─── */}
        <Accordion.Item id="education">
          <Accordion.Trigger>Education</Accordion.Trigger>
          <Accordion.Content className="p-4">
            <EducationSection />
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>

      {/* Delete account confirmation modal */}
      <AnimatePresence>
        {isDeletePromptOpen ? (
          <Modal onClose={closeDeleteModal} title="Eliminar cuenta">
            <div className="space-y-5">
              <p className="text-sm leading-7 text-text-secondary">
                Si seguís, tu cuenta y los datos vinculados se eliminarán
                permanentemente. Escribí{" "}
                <span className="font-semibold text-text-primary">
                  eliminar cuenta
                </span>{" "}
                para confirmar.
              </p>

              <label className="block space-y-2">
                <span className="text-xs font-medium uppercase tracking-[0.2em] text-text-secondary">
                  Confirmación
                </span>
                <input
                  autoComplete="off"
                  className="w-full rounded-md border border-border bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
                  placeholder="eliminar cuenta"
                  value={deleteConfirmationText}
                  onChange={(event) =>
                    setDeleteConfirmationText(event.target.value)
                  }
                />
              </label>

              <div className="flex flex-wrap items-center justify-end gap-3">
                <Button
                  disabled={deleteAccountPending}
                  variant="outline"
                  type="button"
                  onClick={closeDeleteModal}
                >
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
      </AnimatePresence>
    </>
  );
}
