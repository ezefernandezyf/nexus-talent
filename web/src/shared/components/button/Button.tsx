import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  iconPrefix?: ReactNode;
  iconSuffix?: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--color-brand)] text-[var(--color-on-brand)] hover:brightness-105 hover:-translate-y-0.5 active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]/40",
  secondary:
    "bg-[var(--color-accent)] text-[var(--color-on-accent)] hover:brightness-105 hover:-translate-y-0.5 active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/40",
  ghost:
    "bg-transparent text-[var(--color-on-surface)] hover:bg-[var(--color-surface-elevated-1)] hover:-translate-y-0.5 active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-[var(--color-on-surface)]/20",
  danger:
    "bg-[var(--color-error)] text-white hover:brightness-105 hover:-translate-y-0.5 active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-[var(--color-error)]/40",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-label text-sm gap-1.5",
  md: "h-10 px-4 text-label text-base gap-2",
  lg: "h-12 px-6 text-label text-lg gap-2.5",
};

const Spinner = () => (
  <svg
    className="animate-spin h-4 w-4"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-label="Loading"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
);

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant = "primary",
    size = "md",
    loading = false,
    disabled,
    iconPrefix,
    iconSuffix,
    children,
    ...props
  },
  ref,
) {
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      type="button"
      disabled={isDisabled}
      className={cn(
        "inline-flex items-center justify-center rounded-full font-label select-none transition-all duration-[var(--duration-fast)] ease-[var(--ease-out-expo)]",
        "disabled:opacity-50 disabled:pointer-events-none disabled:hover:translate-y-0 disabled:active:scale-100",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {loading && <Spinner />}
      {!loading && iconPrefix}
      {children}
      {!loading && iconSuffix}
    </button>
  );
});
