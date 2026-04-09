import { Link } from "react-router-dom";
import { Navbar } from "../components/landing/Navbar";
import { HeroSection } from "../components/landing/HeroSection";
import { FeatureSection } from "../components/landing/FeatureSection";
import { CTASection } from "../components/landing/CTASection";
import { LandingFooter } from "../components/landing/Footer";

export function LandingPage() {
  return (
    <main className="relative bg-surface-container-lowest text-on-surface">
      <Navbar
        brand="Nexus Talent"
        links={
          <div className="hidden items-center gap-8 md:flex">
            <a className="text-sm font-medium text-on-surface-variant transition-colors hover:text-on-surface" href="#hero">
              Hero
            </a>
            <a className="text-sm font-medium text-on-surface-variant transition-colors hover:text-on-surface" href="#features">
              Features
            </a>
            <a className="text-sm font-medium text-on-surface-variant transition-colors hover:text-on-surface" href="#security">
              Security
            </a>
            <a className="text-sm font-medium text-on-surface-variant transition-colors hover:text-on-surface" href="#contact">
              Contact
            </a>
          </div>
        }
        actions={
          <div className="flex items-center gap-4">
            <Link className="secondary-button" to="/auth/sign-in">
              Ingresar
            </Link>
            <Link className="primary-button" to="/auth/sign-up">
              Crear cuenta
            </Link>
          </div>
        }
      />

      <HeroSection />
      <FeatureSection />
      <CTASection />
      <LandingFooter />
    </main>
  );
}
