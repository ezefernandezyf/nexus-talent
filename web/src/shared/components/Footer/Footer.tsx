import { Link } from "react-router-dom";
import { cn } from "@/shared/utils/cn";

export interface FooterProps {
  variant: "landing" | "app";
  className?: string;
}

export function Footer({ variant, className }: FooterProps) {
  return (
    <footer
      className={cn(
        "w-full border-t border-outline-variant/15 bg-surface-container-lowest px-8 py-12 text-xs uppercase tracking-widest text-on-surface-variant",
        className,
      )}
    >
      <div className="mx-auto flex max-w-screen-2xl flex-col items-center justify-between gap-6 font-label sm:flex-row">
        <div className="font-display text-lg font-black text-on-surface">Nexus Talent</div>

        {variant === "landing" && (
          <div className="flex items-center gap-8">
            <Link className="text-on-surface-variant/60 transition-colors hover:text-primary" to="/privacy">
              Privacy
            </Link>
            <a
              className="text-on-surface-variant/60 transition-colors hover:text-primary"
              href="https://github.com/nexustalent"
              rel="noopener noreferrer"
              target="_blank"
            >
              GitHub
            </a>
          </div>
        )}

        <div className={cn(variant === "app" ? "text-on-surface-variant" : "text-on-surface-variant/60")}>
          © 2026 Nexus Talent. Built for the machine era.
        </div>
      </div>
    </footer>
  );
}
