import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ListMagnifyingGlass,
  Sparkle,
  ChatCircleText,
  ShieldCheck,
  Lightning,
  Target,
} from "@phosphor-icons/react";
import { cn } from "@/shared/utils/cn";
import { Card } from "@/shared/components/card";
import { Badge } from "@/shared/components/badge";
import { Eyebrow } from "@/shared/components/eyebrow";
import { Reveal } from "@/shared/components/reveal";
import { Navbar } from "@/features/landing/components/Navbar";
import { Footer } from "@/shared/components/Footer";
import { FAQ } from "@/features/landing/components/FAQ";
import { MobileDrawer } from "@/shared/components/MobileDrawer";
import { MobileMenuButton } from "@/shared/components/MobileMenuButton";

// ── Constants ──

const EASE = [0.16, 1, 0.3, 1] as const;

const linkBtnSecondary = cn(
  "inline-flex items-center justify-center rounded-md font-medium select-none",
  "transition-all duration-[var(--duration-fast)] ease-[var(--ease-out-expo)]",
  "border border-[var(--accent)] text-[var(--accent)]",
  "hover:bg-[var(--color-brand-container)] active:scale-[0.98]",
  "h-10 px-4 text-label text-base gap-2",
);

const linkBtnPrimary = cn(
  "inline-flex items-center justify-center rounded-md font-medium select-none",
  "transition-all duration-[var(--duration-fast)] ease-[var(--ease-out-expo)]",
  "bg-[var(--accent)] text-white hover:opacity-90 active:scale-[0.98]",
  "h-10 px-4 text-label text-base gap-2",
);

const ctaOutline = cn(
  "inline-flex items-center justify-center rounded-md font-medium select-none",
  "transition-all duration-[var(--duration-fast)] ease-[var(--ease-out-expo)]",
  "border border-[var(--accent)] text-[var(--accent)]",
  "hover:bg-[var(--color-brand-container)] active:scale-[0.98]",
  "h-12 px-6 text-label text-lg gap-2.5",
);

const publicDrawerItems = [
  { label: "Inicio", to: "/" },
  { label: "Análisis", to: "/app/analysis" },
  { label: "Historial", to: "/app/history" },
] as const;

// ── Component ──

export function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const prefersReducedMotion =
    typeof window !== "undefined" ? useReducedMotion() : true;
  const anim = !prefersReducedMotion;

  return (
    <main className="relative bg-[var(--color-surface-base)] text-[var(--text-primary)]">
      <Navbar
        brand="Nexus Talent"
        brandHref="/"
        actions={
          <div className="flex items-center gap-4">
            <MobileMenuButton
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen((c) => !c)}
            />
            <Link
              className={cn(linkBtnSecondary, "hidden md:inline-flex")}
              to="/auth/sign-in"
            >
              Iniciar sesión
            </Link>
            <Link
              className={cn(linkBtnPrimary, "hidden md:inline-flex")}
              to="/auth/sign-up"
            >
              Empieza gratis
            </Link>
          </div>
        }
      />

      {/* ═══════════════════════════════════════════════════════ HERO ═══ */}
      <section className="relative overflow-hidden">
        {/* Barely-there warm radial blob on right */}
        <div
          className="pointer-events-none absolute -top-40 right-0 h-[700px] w-[700px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(196,107,79,0.08) 0%, transparent 70%)",
          }}
          aria-hidden
        />

        <div className="container-editorial relative pt-24 pb-32 md:pt-40 md:pb-40">
          <div className="grid gap-16 lg:grid-cols-12 lg:gap-8 items-center">
            {/* ── Text column — 7 cols ── */}
            <div className="lg:col-span-7">
              <motion.h1
                initial={anim ? { opacity: 0, y: 20 } : undefined}
                animate={anim ? { opacity: 1, y: 0 } : undefined}
                transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
                className="text-display mt-6"
              >
                Transforma descripciones de trabajo
                <br />
                en{" "}
                <span className="accent-underline">información procesable</span>.
              </motion.h1>

              <motion.p
                initial={anim ? { opacity: 0, y: 20 } : undefined}
                animate={anim ? { opacity: 1, y: 0 } : undefined}
                transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
                className="mt-8 text-lg text-[var(--color-on-surface-variant)] max-w-xl"
              >
                Pega cualquier descripción de trabajo. Obtén un desglose estructurado de habilidades, palabras clave,
                brechas y mensajes de contacto: en segundos, no en horas.
              </motion.p>

              <motion.div
                initial={anim ? { opacity: 0, y: 20 } : undefined}
                animate={anim ? { opacity: 1, y: 0 } : undefined}
                transition={{ duration: 0.8, ease: EASE, delay: 0.3 }}
                className="mt-10"
              >
                <Link className={ctaOutline} to="/app/analysis">
                  Empieza a analizar <ArrowRight size={18} weight="regular" />
                </Link>
              </motion.div>
            </div>

            {/* ── Visual column — 5 cols ── */}
            <div className="lg:col-span-5">
              <motion.div
                initial={anim ? { opacity: 0, scale: 0.96 } : undefined}
                animate={anim ? { opacity: 1, scale: 1 } : undefined}
                transition={{ duration: 1, ease: EASE, delay: 0.2 }}
                className="relative h-[440px] w-full"
              >
                <HeroComposition />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════ MANIFESTO ═══ */}
      <section className="relative overflow-hidden py-32 md:py-40">
        <div className="container-editorial">
          <Reveal>
            <h2 className="text-h1 text-center max-w-5xl mx-auto">
              El recruiting es detección de señales.
            </h2>
          </Reveal>

          <div className="mt-20 grid gap-16 lg:grid-cols-2 lg:gap-24 items-start max-w-5xl mx-auto">
            <Reveal delay={0.1}>
              <p className="text-lg leading-relaxed text-[var(--color-on-surface-variant)]">
                Cada descripción de trabajo esconde una intención: lo que el hiring manager
                realmente necesita versus lo que Recursos Humanos escribió. Nexus Talent
                distingue ambas. Revela habilidades, brechas y ángulos de contacto
                para que puedas avanzar sobre candidatos antes de que tus competidores
                terminen de leer.
              </p>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="border-l-2 border-[var(--accent)] pl-8">
                <div
                  className="font-display font-black text-[var(--text-primary)]"
                  style={{ fontSize: "clamp(3rem, 5vw, 4.5rem)" }}
                >
                  12s
                </div>
                <div className="mt-3 text-caption max-w-xs text-[var(--color-on-surface-variant)]">
                  Tiempo promedio para un análisis estructurado completo, desde pegar
                  hasta un contacto exportable.
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════ HOW IT WORKS ═══ */}
      <section id="how" className="py-24 md:py-32">
        <div className="container-editorial">
          <Reveal>
            <Eyebrow>El flujo de trabajo</Eyebrow>
            <h2 className="text-h1 mt-4 max-w-2xl">
              Tres pasos. Cada candidato.
            </h2>
          </Reveal>

          <div className="mt-16 grid gap-6 md:grid-cols-3 md:grid-rows-2">
            {/* ── Large bento cell — 2 cols x 2 rows ── */}
            <Reveal delay={0.05} className="md:col-span-2 md:row-span-2">
              <Card
                interactive
                padding="lg"
                className="flex h-full flex-col"
              >
                <div className="flex items-start justify-between">
                  <div className="font-display font-black text-6xl text-[var(--text-primary)]/90">
                    01
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent)]/10 text-[var(--accent)]">
                    <ListMagnifyingGlass size={24} weight="regular" />
                  </div>
                </div>
                <h3 className="text-h3 mt-8">Pega la descripción</h3>
                <p className="mt-4 max-w-md leading-relaxed text-[var(--color-on-surface-variant)]">
                  Pega cualquier descripción de trabajo, pulida o desordenada, interna o
                  externa. El parser la normaliza, identifica la estructura
                  y prepara una superficie de análisis limpia. Sin necesidad
                  de formato.
                </p>
                <div className="mt-auto flex items-center gap-2 pt-10 text-xs text-[var(--color-on-surface-variant)]/60">
                  <div className="h-1 w-1 rounded-full bg-[var(--accent)]" />
                  <span>Promedia 2s de parseo</span>
                </div>
              </Card>
            </Reveal>

            {/* ── Small stacked cell 02 ── */}
            <Reveal delay={0.15}>
              <Card
                interactive
                padding="md"
                className="h-full"
              >
                <div className="flex items-start justify-between">
                  <div className="font-display font-black text-4xl text-[var(--text-primary)]">
                    02
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent)]/10 text-[var(--accent)]">
                    <Sparkle size={20} weight="regular" />
                  </div>
                </div>
                <h3 className="mt-6 font-display text-xl font-bold text-[var(--text-primary)]">
                  Obtén análisis estructurado
                </h3>
                <p className="mt-3 text-sm text-[var(--color-on-surface-variant)]">
                  Matriz de habilidades, palabras clave y brechas presentadas como
                  tarjetas escaneables.
                </p>
              </Card>
            </Reveal>

            {/* ── Small stacked cell 03 ── */}
            <Reveal delay={0.25}>
              <Card
                interactive
                padding="md"
                className="h-full"
              >
                <div className="flex items-start justify-between">
                  <div className="font-display font-black text-4xl text-[var(--text-primary)]">
                    03
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent)]/10 text-[var(--accent)]">
                    <ChatCircleText size={20} weight="regular" />
                  </div>
                </div>
                <h3 className="mt-6 font-display text-xl font-bold text-[var(--text-primary)]">
                  Copia mensajes de contacto
                </h3>
                <p className="mt-3 text-sm text-[var(--color-on-surface-variant)]">
                  Borradores personalizados listos para LinkedIn o correo electrónico.
                </p>
              </Card>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════ FEATURES ═══ */}
      <section
        id="features"
        className="py-24 md:py-32 bg-surface/50"
      >
        <div className="container-editorial">
          <Reveal>
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <Eyebrow>Capacidades</Eyebrow>
                <h2 className="text-h1 mt-4 max-w-xl">
                  Construido para profundidad, no decoración.
                </h2>
              </div>
              <p className="max-w-sm text-[var(--color-on-surface-variant)]">
                Cada funcionalidad se gana su lugar. Sin paneles que nunca
                abrirás, sin métricas que no se mueven.
              </p>
            </div>
          </Reveal>

          <div className="mt-16 grid gap-6 md:grid-cols-3 md:grid-rows-3">
            {/* ── Hero muted card — 2 cols x 3 rows ── */}
            <Reveal delay={0.05} className="md:col-span-2 md:row-span-3">
              <div
                className="flex h-full flex-col rounded-[var(--radius-lg)] p-10"
                style={{ backgroundColor: "#FDF0EB" }}
              >
                <Badge className="w-fit">
                  Insignia
                </Badge>
                <h3 className="text-h2 mt-8 max-w-md text-[#1A1714]">
                  Matriz de habilidades que clasifica las que realmente importan.
                </h3>
                <p className="mt-6 max-w-md leading-relaxed text-[#5C5956]">
                  Cada habilidad extraída viene ponderada por su centralidad en el
                  rol, para que sepas qué requisitos son innegociables
                  y cuáles son deseables. No más perseguir candidatos que
                  coinciden en los ejes equivocados.
                </p>
                <div className="mt-auto flex items-center gap-8 pt-10">
                  <StatBlock value="94%" label="Precisión de extracción" />
                  <StatBlock value="20+" label="Dimensiones de habilidad" />
                </div>
              </div>
            </Reveal>

            {/* ── Small feature cards ── */}
            <Reveal delay={0.15}>
              <Card
                interactive
                padding="md"
                className="h-full"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent)]/10 text-[var(--accent)]">
                  <Target size={22} weight="regular" />
                </div>
                <h3 className="mt-6 font-display text-lg font-bold text-[var(--text-primary)]">
                  Detección de brechas
                </h3>
                <p className="mt-2 text-sm text-[var(--color-on-surface-variant)]">
                  Ve dónde un candidato se queda corto, antes de la llamada
                  de preselección.
                </p>
              </Card>
            </Reveal>

            <Reveal delay={0.2}>
              <Card
                interactive
                padding="md"
                className="h-full"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent)]/10 text-[var(--accent)]">
                  <Lightning size={22} weight="regular" />
                </div>
                <h3 className="mt-6 font-display text-lg font-bold text-[var(--text-primary)]">
                  Contacto instantáneo
                </h3>
                <p className="mt-2 text-sm text-[var(--color-on-surface-variant)]">
                  Borradores listos para enviar, ajustados al rol y al candidato.
                </p>
              </Card>
            </Reveal>

            <Reveal delay={0.25}>
              <Card
                interactive
                padding="md"
                className="h-full"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent)]/10 text-[var(--accent)]">
                  <ShieldCheck size={22} weight="regular" />
                </div>
                <h3 className="mt-6 font-display text-lg font-bold text-[var(--text-primary)]">
                  Privado por defecto
                </h3>
                <p className="mt-2 text-sm text-[var(--color-on-surface-variant)]">
                  Las descripciones de trabajo nunca entrenan modelos. Los análisis se quedan contigo.
                </p>
              </Card>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ FAQ ═══ */}
      <section className="py-24 md:py-32">
        <div className="container-editorial">
          <FAQ />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════ BOTTOM CTA ═══ */}
      <section className="py-24 md:py-32">
        <div className="container-editorial text-center">
          <Reveal>
            <h2 className="text-display mx-auto max-w-3xl">
              ¿Listo para dejar de adivinar?
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-10">
              <Link className={ctaOutline} to="/app/analysis">
                Empieza a analizar ahora{" "}
                <ArrowRight size={18} weight="regular" />
              </Link>
            </div>
            <div className="mt-4 text-caption text-[var(--color-on-surface-variant)]">
              Gratis, sin necesidad de tarjeta de crédito.
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />

      <MobileDrawer
        actions={
          <div className="space-y-3">
            <Link
              className={cn(linkBtnSecondary, "w-full justify-center")}
              to="/auth/sign-in"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Iniciar sesión
            </Link>
            <Link
              className={cn(linkBtnPrimary, "w-full justify-center")}
              to="/auth/sign-up"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Empieza gratis
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

/* ── Stat block for features ── */

function StatBlock({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-display font-black text-3xl text-[var(--accent)]">
        {value}
      </div>
      <div className="mt-1 text-xs text-[var(--color-on-surface-variant)]">
        {label}
      </div>
    </div>
  );
}

/* ── Editorial hero composition (card mockup + shapes) ── */

function HeroComposition() {
  return (
    <div className="relative h-full w-full">
      {/* Large off-white rectangle */}
      <div
        className="absolute right-0 top-8 h-72 w-72 rounded-lg border border-[var(--border)]"
        style={{ backgroundColor: "#F5F4F2" }}
      />

      {/* Overlapping analysis card */}
      <div
        className="absolute right-16 top-24 h-56 w-64 rounded-lg border border-border bg-surface p-6"
        style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
      >
        <div className="text-eyebrow">
          Analysis
        </div>
        <div className="mt-3 font-display text-lg font-bold leading-tight text-[var(--text-primary)]">
          Senior Backend Engineer
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {["Go", "PostgreSQL", "AWS", "K8s"].map((s) => (
            <Badge key={s}>
              {s}
            </Badge>
          ))}
        </div>
        {/* Skill progress bars */}
        <div className="mt-4 space-y-1.5">
          <div className="h-1.5 w-full rounded-full bg-surface-muted">
            <div className="h-full w-4/5 rounded-full bg-[var(--accent)]" />
          </div>
          <div className="h-1.5 w-full rounded-full bg-surface-muted">
            <div className="h-full w-3/5 rounded-full bg-[var(--accent)]" />
          </div>
          <div className="h-1.5 w-full rounded-full bg-surface-muted">
            <div className="h-full w-2/5 rounded-full bg-[var(--accent)]" />
          </div>
        </div>
      </div>

      {/* Brand accent circle */}
      <div
        className="absolute left-4 top-4 h-24 w-24 rounded-full"
        style={{ backgroundColor: "var(--accent)" }}
      />

      {/* Small cream circle */}
      <div
        className="absolute bottom-8 left-24 h-16 w-16 rounded-full border border-[var(--border)]"
        style={{ backgroundColor: "#FDF0EB" }}
      />

      {/* Vertical line detail */}
      <div className="absolute bottom-16 left-0 h-32 w-px bg-[var(--border)]" />
    </div>
  );
}
