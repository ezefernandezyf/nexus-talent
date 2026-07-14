import { useEffect, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileUpdateSchema } from "@nexus-talent/shared/schemas";
import type { ProfileUpdateDTO } from "@nexus-talent/shared/schemas";
import { AnimatedMount } from "@/shared/components/AnimatedMount";
import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import { Input } from "@/shared/components/Input";
import { Label } from "@/shared/components/label/Label";
import { useToastStore } from "@/shared/components/toast";
import type { ProfileRecord, ProfileSaveInput } from "../api/validation";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ProfileEditorCardProps {
  profile: ProfileRecord | null;
  isLoading: boolean;
  isPending: boolean;
  onSave: (input: ProfileSaveInput) => Promise<ProfileRecord>;
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      className={`h-11 animate-pulse rounded-md bg-surface-muted ${className ?? ""}`}
      aria-hidden="true"
    />
  );
}

function SkeletonForm() {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <div className="mb-2 h-4 w-24 animate-pulse rounded bg-surface-muted" />
          <SkeletonBar />
        </div>
        <div className="space-y-2">
          <div className="mb-2 h-4 w-36 animate-pulse rounded bg-surface-muted" />
          <SkeletonBar />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <div className="mb-2 h-4 w-16 animate-pulse rounded bg-surface-muted" />
          <SkeletonBar />
        </div>
        <div className="space-y-2">
          <div className="mb-2 h-4 w-20 animate-pulse rounded bg-surface-muted" />
          <SkeletonBar />
        </div>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="mb-2 h-4 w-20 animate-pulse rounded bg-surface-muted" />
          <SkeletonBar />
        </div>
        <div className="space-y-2">
          <div className="mb-2 h-4 w-16 animate-pulse rounded bg-surface-muted" />
          <SkeletonBar />
        </div>
        <div className="space-y-2">
          <div className="mb-2 h-4 w-28 animate-pulse rounded bg-surface-muted" />
          <SkeletonBar />
        </div>
      </div>
      <div className="h-11 w-40 animate-pulse rounded-md bg-surface-muted" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ProfileEditorCard({
  profile,
  isLoading,
  isPending,
  onSave,
}: ProfileEditorCardProps) {
  const addToast = useToastStore((s) => s.addToast);

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<ProfileUpdateDTO>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      skills: "",
      experienceLevel: "",
      roleTitle: "",
      resumeLink: "",
      linkedinUrl: "",
      githubUrl: "",
      location: "",
    },
  });

  // Pre-fill form when profile data is available
  useEffect(() => {
    if (profile) {
      reset({
        skills: profile.skills ?? "",
        experienceLevel: profile.experience_level ?? "",
        roleTitle: profile.role_title ?? "",
        resumeLink: profile.resume_link ?? "",
        linkedinUrl: profile.linkedin_url ?? "",
        githubUrl: profile.github_url ?? "",
        location: profile.location ?? "",
      });
    }
  }, [profile, reset]);

  async function onSubmit(data: ProfileUpdateDTO) {
    try {
      await onSave({
        displayName: profile?.display_name ?? "",
        email: profile?.email ?? "",
        userId: profile?.id ?? "",
        ...data,
      });
      addToast({ message: "Perfil profesional guardado correctamente.", variant: "success" });
    } catch {
      addToast({ message: "Error al guardar el perfil profesional.", variant: "error" });
    }
  }

  const isFormDisabled = isPending || isSubmitting || isLoading;
  const submitLabel = isPending || isSubmitting ? "Guardando..." : "Guardar cambios";

  // ── Loading state ─────────────────────────────────────────────────
  if (isLoading && !profile) {
    return (
      <Card>
        <div className="font-display font-black text-4xl text-text-primary/90">04</div>
        <h2 className="text-h3 mt-2">Perfil Profesional</h2>
        <p className="text-body text-text-secondary mt-1">
          Completá tus datos profesionales para que el análisis pueda personalizar los mensajes.
        </p>
        <div className="mt-6">
          <SkeletonForm />
        </div>
      </Card>
    );
  }

  // ── Error state ───────────────────────────────────────────────────
  // (handled externally via SettingsFeature; form renders regardless)

  // ── Form ──────────────────────────────────────────────────────────
  return (
    <Card>
      <AnimatedMount>
        <div className="font-display font-black text-4xl text-text-primary/90">04</div>
        <h2 className="text-h3 mt-2">Perfil Profesional</h2>
        <p className="text-body text-text-secondary mt-1">
          Completá tus datos profesionales para que el análisis pueda personalizar los mensajes.
        </p>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          {/* Row 1: Role + Experience */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ped-role">Rol actual</Label>
              <Input
                id="ped-role"
                placeholder="Full-Stack Developer"
                disabled={isFormDisabled}
                {...register("roleTitle")}
              />
              {errors.roleTitle && (
                <p className="text-sm text-[var(--color-error)]" role="alert">
                  {errors.roleTitle.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="ped-exp">Nivel de experiencia</Label>
              <Input
                id="ped-exp"
                placeholder="Senior, 5+ años"
                disabled={isFormDisabled}
                {...register("experienceLevel")}
              />
              {errors.experienceLevel && (
                <p className="text-sm text-[var(--color-error)]" role="alert">
                  {errors.experienceLevel.message}
                </p>
              )}
            </div>
          </div>

          {/* Row 2: Skills + Location */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ped-skills">Skills</Label>
              <Input
                id="ped-skills"
                placeholder="React, TypeScript, Node.js"
                disabled={isFormDisabled}
                {...register("skills")}
              />
              {errors.skills && (
                <p className="text-sm text-[var(--color-error)]" role="alert">
                  {errors.skills.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="ped-location">Ubicación</Label>
              <Input
                id="ped-location"
                placeholder="Ciudad, País"
                disabled={isFormDisabled}
                {...register("location")}
              />
              {errors.location && (
                <p className="text-sm text-[var(--color-error)]" role="alert">
                  {errors.location.message}
                </p>
              )}
            </div>
          </div>

          {/* Row 3: LinkedIn */}
          <div className="space-y-2">
            <Label htmlFor="ped-linkedin">LinkedIn</Label>
            <Input
              id="ped-linkedin"
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

          {/* Row 4: GitHub */}
          <div className="space-y-2">
            <Label htmlFor="ped-github">GitHub</Label>
            <Input
              id="ped-github"
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

          {/* Row 5: Resume link */}
          <div className="space-y-2">
            <Label htmlFor="ped-resume">CV / Resume link</Label>
            <Input
              id="ped-resume"
              placeholder="https://drive.google.com/..."
              type="url"
              disabled={isFormDisabled}
              {...register("resumeLink")}
            />
            {errors.resumeLink && (
              <p className="text-sm text-[var(--color-error)]" role="alert">
                {errors.resumeLink.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-2xl text-sm leading-6 text-text-secondary">
              Estos datos se usan para personalizar los mensajes de outreach que genera el análisis.
            </p>
            <Button className="w-full sm:w-auto" disabled={isFormDisabled} type="submit">
              {submitLabel}
            </Button>
          </div>
        </form>
      </AnimatedMount>
    </Card>
  );
}
