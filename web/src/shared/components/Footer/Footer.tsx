import { Link } from "react-router-dom";
import { cn } from "@/shared/utils/cn";

export interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  return (
    <footer
      className={cn(
        "border-t border-border bg-surface py-12",
        className,
      )}
    >
      <div className="container-editorial flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div className="space-y-2">
          <div className="font-display text-lg font-black text-text-primary">Nexus Talent</div>
          <div className="text-sm text-text-secondary">
            © 2026 Nexus Talent. Built for the machine era.
          </div>
        </div>

        <div className="flex flex-col gap-4 text-sm text-text-secondary md:flex-row md:gap-8">
          <Link className="transition-colors hover:text-text-primary" to="/privacy">
            Privacy
          </Link>
          <a
            className="transition-colors hover:text-text-primary"
            href="https://github.com/nexustalent"
            rel="noopener noreferrer"
            target="_blank"
          >
            GitHub
          </a>
          <a
            className="transition-colors hover:text-text-primary"
            href="mailto:hello@nexustalent.dev"
          >
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
