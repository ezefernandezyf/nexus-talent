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
  "w-full bg-surface text-text-primary text-sm placeholder:text-text-tertiary " +
  "border border-border " +
  "focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] " +
  "disabled:opacity-50 disabled:cursor-not-allowed " +
  "transition-colors duration-200";

const errorStyles =
  "border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[var(--color-error)]";

const sizeStyles = "h-11 px-4";
const inputRadius = "rounded-md";
const textareaRadius = "rounded-md";

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
            className="text-sm font-medium text-text-primary"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {iconPrefix && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
              {iconPrefix}
            </span>
          )}

          {multiline ? (
            <textarea
              ref={ref as React.Ref<HTMLTextAreaElement>}
              id={inputId}
              aria-describedby={errorId}
              aria-invalid={!!error}
              className={cn(sharedStyles, "min-h-32 resize-y font-sans")}
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
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary">
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
