import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileUpdateSchema } from "@nexus-talent/shared/schemas";
import type { ProfileUpdateDTO } from "@nexus-talent/shared/schemas";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import { Label } from "@/shared/components/label/Label";
import { useToastStore } from "@/shared/components/toast";
import type { ProfileRecord, ProfileSaveInput } from "../api/validation";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ContactSectionProps {
  profile: ProfileRecord | null;
  userEmail: string;
  isLoading: boolean;
  isPending: boolean;
  onSave: (input: ProfileSaveInput) => Promise<ProfileRecord>;
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function SkeletonField() {
  return (
    <div className="space-y-2">
      <div className="h-4 w-24 animate-pulse rounded bg-surface-muted" />
      <div className="h-11 w-full animate-pulse rounded-md bg-surface-muted" />
    </div>
  );
}

function SkeletonContactForm() {
  return (
    <div className="space-y-5">
      <SkeletonField />
      <SkeletonField />
      <SkeletonField />
      <SkeletonField />
      <SkeletonField />
      <div className="h-11 w-40 animate-pulse rounded-md bg-surface-muted" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ContactSection({
  profile,
  userEmail,
  isLoading,
  isPending,
  onSave,
}: ContactSectionProps) {
  const addToast = useToastStore((s) => s.addToast);

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<ProfileUpdateDTO>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      phone: "",
      portfolioUrl: "",
      linkedinUrl: "",
      githubUrl: "",
    },
  });

  // ── Pre-fill form when profile data is available ──────────────
  useEffect(() => {
    if (profile) {
      reset({
        phone: profile.phone ?? "",
        portfolioUrl: profile.portfolio_url ?? "",
        linkedinUrl: profile.linkedin_url ?? "",
        githubUrl: profile.github_url ?? "",
      });
    }
  }, [profile, reset]);

  // ── Save handler ──────────────────────────────────────────────
  async function onSubmit(data: ProfileUpdateDTO) {
    try {
      await onSave({
        displayName: profile?.display_name ?? "",
        email: profile?.email ?? userEmail,
        userId: profile?.id ?? "",
        phone: data.phone,
        portfolioUrl: data.portfolioUrl,
        linkedinUrl: data.linkedinUrl,
        githubUrl: data.githubUrl,
      });
      addToast({
        message: "Contacto guardado correctamente.",
        variant: "success",
      });
    } catch {
      addToast({ message: "Error al guardar el contacto.", variant: "error" });
    }
  }

  const isFormDisabled = isPending || isSubmitting || isLoading;
  const submitLabel =
    isPending || isSubmitting ? "Guardando..." : "Guardar cambios";

  // ── Loading state (no cached profile) ─────────────────────────
  if (isLoading && !profile) {
    return <SkeletonContactForm />;
  }

  // ── Error state ───────────────────────────────────────────────
  // When profile fails to load, the form still renders so the user
  // can retry. Toast handles the communication.

  // ── Form ──────────────────────────────────────────────────────
  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      {/* Email — readonly from auth context */}
      <div className="space-y-2">
        <Label htmlFor="contact-email">Email</Label>
        <Input
          id="contact-email"
          aria-readonly="true"
          readOnly
          value={userEmail}
        />
      </div>

      {/* Phone — free text */}
      <div className="space-y-2">
        <Label htmlFor="contact-phone">Teléfono</Label>
        <Input
          id="contact-phone"
          placeholder="+54 11 1234-5678"
          disabled={isFormDisabled}
          {...register("phone")}
        />
        {errors.phone && (
          <p className="text-sm text-[var(--color-error)]" role="alert">
            {errors.phone.message}
          </p>
        )}
      </div>

      {/* Portfolio URL */}
      <div className="space-y-2">
        <Label htmlFor="contact-portfolio">Portfolio</Label>
        <Input
          id="contact-portfolio"
          placeholder="https://tusitio.com"
          type="url"
          disabled={isFormDisabled}
          {...register("portfolioUrl")}
        />
        {errors.portfolioUrl && (
          <p className="text-sm text-[var(--color-error)]" role="alert">
            {errors.portfolioUrl.message}
          </p>
        )}
      </div>

      {/* LinkedIn URL */}
      <div className="space-y-2">
        <Label htmlFor="contact-linkedin">LinkedIn</Label>
        <Input
          id="contact-linkedin"
          placeholder="https://linkedin.com/in/tu-perfil"
          type="url"
          disabled={isFormDisabled}
          {...register("linkedinUrl")}
        />
        {errors.linkedinUrl && (
          <p className="text-sm text-[var(--color-error)]" role="alert">
            {errors.linkedinUrl.message}
          </p>
        )}
      </div>

      {/* GitHub URL */}
      <div className="space-y-2">
        <Label htmlFor="contact-github">GitHub</Label>
        <Input
          id="contact-github"
          placeholder="https://github.com/tu-usuario"
          type="url"
          disabled={isFormDisabled}
          {...register("githubUrl")}
        />
        {errors.githubUrl && (
          <p className="text-sm text-[var(--color-error)]" role="alert">
            {errors.githubUrl.message}
          </p>
        )}
      </div>

      {/* Submit */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-2xl text-sm leading-6 text-text-secondary">
          Estos datos se usan para personalizar los mensajes de outreach que
          genera el análisis.
        </p>
        <Button
          className="w-full sm:w-auto"
          disabled={isFormDisabled}
          type="submit"
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
