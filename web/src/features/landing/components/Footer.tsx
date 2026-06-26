import { Link } from "react-router-dom";
import { LayoutContainer } from "./LayoutContainer";

export function Footer() {
  return (
    <footer className="w-full border-t border-outline-variant/15 bg-surface-container-lowest px-8 py-12 text-xs uppercase tracking-widest text-on-surface-variant">
      <LayoutContainer className="flex flex-col items-center justify-between gap-6 font-label md:flex-row">
        <div className="text-lg font-black text-on-surface">Nexus Talent</div>
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
        <div className="text-on-surface-variant/60">© 2026 Nexus Talent. Built for the machine era.</div>
      </LayoutContainer>
    </footer>
  );
}
