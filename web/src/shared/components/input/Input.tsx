import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "@/shared/utils/cn";

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

export interface InputBaseProps {
  label?: string;
  error?: string;
  iconPrefix?: ReactNode;
  iconSuffix?: ReactNode;
}

export interface InputAsInput extends InputBaseProps, InputHTMLAttributes<HTMLInputElement> {
  multiline?: false | undefined;
}

export interface InputAsTextarea extends InputBaseProps, TextareaHTMLAttributes<HTMLTextAreaElement> {
  multiline: true;
}

export type InputProps = InputAsInput | InputAsTextarea;

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const baseStyles =
  "w-full bg-[var(--color-surface-base)] text-[var(--color-on-surface)] text-body placeholder:text-[var(--color-on-surface-variant)] " +
  "shadow-[inset_0_0_0_1px] shadow-[var(--color-on-surface)]/10 " +
  "focus:outline-none focus:shadow-[inset_0_0_0_2px] focus:shadow-[var(--color-brand)] " +
  "disabled:opacity-50 disabled:cursor-not-allowed " +
  "transition-all duration-[var(--duration-fast)] ease-[var(--ease-out-expo)]";

const errorStyles =
  "shadow-[inset_0_0_0_1.5px_var(--color-error)] focus:shadow-[inset_0_0_0_2px_var(--color-error)]";

const sizeStyles = "px-4 py-3 text-sm leading-6";
const inputRadius = "rounded-lg";
const textareaRadius = "rounded-lg";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  function Input(props, ref) {
    const {
      label,
      error,
      iconPrefix,
      iconSuffix,
      className,
      multiline,
      id: externalId,
      ...rest
    } = props;

    const autoId = useId();
    const inputId = externalId ?? autoId;
    const errorId = error ? `${inputId}-error` : undefined;

    const sharedStyles = cn(
      baseStyles,
      error && errorStyles,
      sizeStyles,
      multiline ? textareaRadius : inputRadius,
      iconPrefix && "pl-10",
      iconSuffix && "pr-10",
      className,
    );

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="font-label text-sm font-medium text-[var(--color-on-surface)]"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {iconPrefix && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)]">
              {iconPrefix}
            </span>
          )}

          {multiline ? (
            <textarea
              ref={ref as React.Ref<HTMLTextAreaElement>}
              id={inputId}
              aria-describedby={errorId}
              aria-invalid={!!error}
              className={cn(sharedStyles, "min-h-[100px] resize-y")}
              {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
            />
          ) : (
            <input
              ref={ref as React.Ref<HTMLInputElement>}
              id={inputId}
              aria-describedby={errorId}
              aria-invalid={!!error}
              className={sharedStyles}
              {...(rest as InputHTMLAttributes<HTMLInputElement>)}
            />
          )}

          {iconSuffix && (
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)]">
              {iconSuffix}
            </span>
          )}
        </div>

        {error && (
          <p id={errorId} role="alert" className="text-sm text-[var(--color-error)]">
            {error}
          </p>
        )}
      </div>
    );
  },
);
