import { LayoutContainer } from "./LayoutContainer";

export function LandingFooter() {
  return (
    <footer className="w-full py-12 px-8 border-t border-outline-variant/15 bg-[#0B0E14] dark:bg-[#0B0E14]">
      <LayoutContainer className="flex flex-col md:flex-row justify-between items-center gap-6 font-['Space_Grotesk'] text-xs uppercase tracking-widest">
        <div className="text-lg font-black text-on-surface" style={{}}>
          Nexus talent
        </div>
        <div className="flex items-center gap-8">
          <a className="text-on-surface/50 hover:text-[#38BDF8] transition-colors opacity-80 hover:opacity-100" href="#features" style={{}}>Features</a>
          <a className="text-on-surface/50 hover:text-[#38BDF8] transition-colors opacity-80 hover:opacity-100" href="#security" style={{}}>Security</a>
          <a className="text-on-surface/50 hover:text-[#38BDF8] transition-colors opacity-80 hover:opacity-100" href="/auth/sign-in" style={{}}>Ingresar</a>
          <a className="text-on-surface/50 hover:text-[#38BDF8] transition-colors opacity-80 hover:opacity-100" href="/auth/sign-up" style={{}}>Crear cuenta</a>
        </div>
        <div className="text-on-surface/50" style={{}}>
          © 2026&nbsp; Nexus talent. Built for the machine era.
        </div>
      </LayoutContainer>
    </footer>
  );
}
