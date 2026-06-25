import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "../utils/cn";

type ButtonVariant = "primary" | "secondary" | "tertiary";

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "primary-button",
  secondary: "secondary-button",
  tertiary: "tertiary-button",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", type = "button", ...props },
  ref,
) {
  return <button ref={ref} className={cn(buttonVariants[variant], className)} type={type} {...props} />;
});