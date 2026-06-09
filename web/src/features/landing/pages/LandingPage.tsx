import { useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { HeroSection } from "../components/HeroSection";
import { FeatureSection } from "../components/FeatureSection";
import { CTASection } from "../components/CTASection";
import { Footer } from "../components/Footer";
import { MobileDrawer } from "../../../components/ui/MobileDrawer";
import { MobileMenuButton } from "../../../components/ui/MobileMenuButton";

const publicDrawerItems = [
  { label: "Inicio", to: "/" },
  { label: "Análisis", to: "/app/analysis" },
] as const;

export function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <main className="relative bg-surface-container-lowest text-on-surface">
      <Navbar
        brand="Nexus Talent"
        brandHref="/"
        actions={
          <div className="flex items-center gap-4">
            <MobileMenuButton isOpen={isMobileMenuOpen} onClick={() => setIsMobileMenuOpen((current) => !current)} />
            <Link className="secondary-button hidden md:inline-flex" to="/auth/sign-in">
              Ingresar
            </Link>
            <Link className="primary-button hidden md:inline-flex" to="/auth/sign-up">
              Crear cuenta
            </Link>
          </div>
        }
      />

      <HeroSection />
      <FeatureSection />
      <CTASection />
      <Footer />

      <MobileDrawer
        actions={
          <div className="space-y-3">
            <Link className="secondary-button w-full justify-center" to="/auth/sign-in" onClick={() => setIsMobileMenuOpen(false)}>
              Ingresar
            </Link>
            <Link className="primary-button w-full justify-center" to="/auth/sign-up" onClick={() => setIsMobileMenuOpen(false)}>
              Crear cuenta
            </Link>
          </div>
        }
        heading="Nexus Talent"
        isOpen={isMobileMenuOpen}
        items={publicDrawerItems}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </main>
  );
}
