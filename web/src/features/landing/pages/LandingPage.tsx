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
  "border border-[var(--color-brand)] text-[var(--color-brand)]",
  "hover:bg-[var(--color-brand-container)] active:scale-[0.98]",
  "h-10 px-4 text-label text-base gap-2",
);

const linkBtnPrimary = cn(
  "inline-flex items-center justify-center rounded-md font-medium select-none",
  "transition-all duration-[var(--duration-fast)] ease-[var(--ease-out-expo)]",
  "bg-[var(--color-brand)] text-white hover:opacity-90 active:scale-[0.98]",
  "h-10 px-4 text-label text-base gap-2",
);

const ctaOutline = cn(
  "inline-flex items-center justify-center rounded-md font-medium select-none",
  "transition-all duration-[var(--duration-fast)] ease-[var(--ease-out-expo)]",
  "border border-[var(--color-brand)] text-[var(--color-brand)]",
  "hover:bg-[var(--color-brand-container)] active:scale-[0.98]",
  "h-12 px-6 text-label text-lg gap-2.5",
);

const publicDrawerItems = [
  { label: "Home", to: "/" },
  { label: "Analysis", to: "/app/analysis" },
  { label: "History", to: "/app/history" },
] as const;

// ── Component ──

export function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const prefersReducedMotion =
    typeof window !== "undefined" ? useReducedMotion() : true;
  const anim = !prefersReducedMotion;

  return (
    <main className="relative bg-[var(--color-surface-base)] text-[var(--color-on-surface)]">
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
              Sign In
            </Link>
            <Link
              className={cn(linkBtnPrimary, "hidden md:inline-flex")}
              to="/auth/sign-up"
            >
              Get Started Free
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
              <motion.div
                initial={anim ? { opacity: 0, y: 16 } : undefined}
                animate={anim ? { opacity: 1, y: 0 } : undefined}
                transition={{ duration: 0.7, ease: EASE }}
              >
                <Eyebrow>For modern recruiters</Eyebrow>
              </motion.div>

              <motion.h1
                initial={anim ? { opacity: 0, y: 20 } : undefined}
                animate={anim ? { opacity: 1, y: 0 } : undefined}
                transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
                className="text-display mt-6"
              >
                Transform job descriptions
                <br />
                into{" "}
                <span className="accent-underline">actionable insights</span>.
              </motion.h1>

              <motion.p
                initial={anim ? { opacity: 0, y: 20 } : undefined}
                animate={anim ? { opacity: 1, y: 0 } : undefined}
                transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
                className="mt-8 text-lg text-[var(--color-on-surface-variant)] max-w-xl"
              >
                Paste any JD. Get a structured breakdown of skills, keywords,
                gaps, and outreach messages — in seconds, not hours.
              </motion.p>

              <motion.div
                initial={anim ? { opacity: 0, y: 20 } : undefined}
                animate={anim ? { opacity: 1, y: 0 } : undefined}
                transition={{ duration: 0.8, ease: EASE, delay: 0.3 }}
                className="mt-10"
              >
                <Link className={ctaOutline} to="/app/analysis">
                  Start Analyzing <ArrowRight size={18} weight="regular" />
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
              Recruiting is signal detection.
            </h2>
          </Reveal>

          <div className="mt-20 grid gap-16 lg:grid-cols-2 lg:gap-24 items-start max-w-5xl mx-auto">
            <Reveal delay={0.1}>
              <p className="text-lg leading-relaxed text-[var(--color-on-surface-variant)]">
                Every job description hides intent — what the hiring manager
                actually needs versus what HR wrote down. Nexus Talent
                distinguishes the two. It surfaces skills, gaps, and outreach
                angles so you can move on candidates before your competitors
                have finished reading.
              </p>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="border-l-2 border-[var(--color-brand)] pl-8">
                <div
                  className="font-display font-black text-[var(--color-on-surface)]"
                  style={{ fontSize: "clamp(3rem, 5vw, 4.5rem)" }}
                >
                  12s
                </div>
                <div className="mt-3 text-caption max-w-xs text-[var(--color-on-surface-variant)]">
                  Average time to a full structured analysis, from paste to
                  exportable outreach.
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
            <Eyebrow>The workflow</Eyebrow>
            <h2 className="text-h1 mt-4 max-w-2xl">
              Three moves. Every candidate.
            </h2>
          </Reveal>

          <div className="mt-16 grid gap-6 md:grid-cols-3 md:grid-rows-2">
            {/* ── Large bento cell — 2 cols x 2 rows ── */}
            <Reveal delay={0.05} className="md:col-span-2 md:row-span-2">
              <Card
                variant="interactive"
                padding="lg"
                className="flex h-full flex-col"
              >
                <div className="flex items-start justify-between">
                  <div className="font-display font-black text-6xl text-[var(--color-on-surface)]/90">
                    01
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-brand)]/10 text-[var(--color-brand)]">
                    <ListMagnifyingGlass size={24} weight="regular" />
                  </div>
                </div>
                <h3 className="text-h3 mt-8">Paste the description</h3>
                <p className="mt-4 max-w-md leading-relaxed text-[var(--color-on-surface-variant)]">
                  Drop any job description — polished or messy, internal or
                  external. The parser normalizes it, identifies structure,
                  and prepares a clean analysis surface. No formatting
                  required.
                </p>
                <div className="mt-auto flex items-center gap-2 pt-10 text-xs text-[var(--color-on-surface-variant)]/60">
                  <div className="h-1 w-1 rounded-full bg-[var(--color-brand)]" />
                  <span>Averages 2s parse time</span>
                </div>
              </Card>
            </Reveal>

            {/* ── Small stacked cell 02 ── */}
            <Reveal delay={0.15}>
              <Card
                variant="interactive"
                padding="md"
                className="h-full"
              >
                <div className="flex items-start justify-between">
                  <div className="font-display font-black text-4xl text-[var(--color-on-surface)]">
                    02
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-brand)]/10 text-[var(--color-brand)]">
                    <Sparkle size={20} weight="regular" />
                  </div>
                </div>
                <h3 className="mt-6 font-display text-xl font-bold text-[var(--color-on-surface)]">
                  Get structured analysis
                </h3>
                <p className="mt-3 text-sm text-[var(--color-on-surface-variant)]">
                  Skills matrix, keywords, and gaps rendered as scannable
                  cards.
                </p>
              </Card>
            </Reveal>

            {/* ── Small stacked cell 03 ── */}
            <Reveal delay={0.25}>
              <Card
                variant="interactive"
                padding="md"
                className="h-full"
              >
                <div className="flex items-start justify-between">
                  <div className="font-display font-black text-4xl text-[var(--color-on-surface)]">
                    03
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-brand)]/10 text-[var(--color-brand)]">
                    <ChatCircleText size={20} weight="regular" />
                  </div>
                </div>
                <h3 className="mt-6 font-display text-xl font-bold text-[var(--color-on-surface)]">
                  Copy outreach messages
                </h3>
                <p className="mt-3 text-sm text-[var(--color-on-surface-variant)]">
                  Personalized opener drafts ready for LinkedIn or email.
                </p>
              </Card>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════ FEATURES ═══ */}
      <section
        id="features"
        className="py-24 md:py-32 bg-[var(--color-surface-elevated-1)]/50"
      >
        <div className="container-editorial">
          <Reveal>
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <Eyebrow>Capabilities</Eyebrow>
                <h2 className="text-h1 mt-4 max-w-xl">
                  Built for depth, not decoration.
                </h2>
              </div>
              <p className="max-w-sm text-[var(--color-on-surface-variant)]">
                Every feature earns its place. No dashboards you'll never
                open, no metrics that don't move.
              </p>
            </div>
          </Reveal>

          <div className="mt-16 grid gap-6 md:grid-cols-3 md:grid-rows-2">
            {/* ── Hero muted card — 2 cols x 2 rows ── */}
            <Reveal delay={0.05} className="md:col-span-2 md:row-span-2">
              <div
                className="flex h-full flex-col rounded-[var(--radius-lg)] p-10"
                style={{ backgroundColor: "#FDF0EB" }}
              >
                <Badge variant="brand" className="w-fit">
                  Flagship
                </Badge>
                <h3 className="text-h2 mt-8 max-w-md text-[var(--color-on-surface)]">
                  Skills matrix that ranks the ones that actually matter.
                </h3>
                <p className="mt-6 max-w-md leading-relaxed text-[var(--color-on-surface-variant)]">
                  Every extracted skill comes weighted by centrality to the
                  role — so you know which requirements are non-negotiable
                  and which are wishlist. No more chasing candidates who
                  match on the wrong axes.
                </p>
                <div className="mt-auto flex items-center gap-8 pt-10">
                  <StatBlock value="94%" label="Extraction accuracy" />
                  <StatBlock value="20+" label="Skill dimensions" />
                </div>
              </div>
            </Reveal>

            {/* ── Small feature cards ── */}
            <Reveal delay={0.15}>
              <Card
                variant="interactive"
                padding="md"
                className="h-full"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-brand)]/10 text-[var(--color-brand)]">
                  <Target size={22} weight="regular" />
                </div>
                <h3 className="mt-6 font-display text-lg font-bold text-[var(--color-on-surface)]">
                  Gap detection
                </h3>
                <p className="mt-2 text-sm text-[var(--color-on-surface-variant)]">
                  See where a candidate falls short — before the screening
                  call.
                </p>
              </Card>
            </Reveal>

            <Reveal delay={0.2}>
              <Card
                variant="interactive"
                padding="md"
                className="h-full"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-brand)]/10 text-[var(--color-brand)]">
                  <Lightning size={22} weight="regular" />
                </div>
                <h3 className="mt-6 font-display text-lg font-bold text-[var(--color-on-surface)]">
                  Instant outreach
                </h3>
                <p className="mt-2 text-sm text-[var(--color-on-surface-variant)]">
                  Ready-to-send drafts, tuned to the role and the candidate.
                </p>
              </Card>
            </Reveal>

            <Reveal delay={0.25}>
              <Card
                variant="interactive"
                padding="md"
                className="h-full"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-brand)]/10 text-[var(--color-brand)]">
                  <ShieldCheck size={22} weight="regular" />
                </div>
                <h3 className="mt-6 font-display text-lg font-bold text-[var(--color-on-surface)]">
                  Private by default
                </h3>
                <p className="mt-2 text-sm text-[var(--color-on-surface-variant)]">
                  Job descriptions never train models. Analyses stay yours.
                </p>
              </Card>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ FAQ ═══ */}
      <FAQ />

      {/* ═══════════════════════════════════════════════════ BOTTOM CTA ═══ */}
      <section className="py-24 md:py-32">
        <div className="container-editorial text-center">
          <Reveal>
            <h2 className="text-display mx-auto max-w-3xl">
              Ready to stop guessing?
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-10">
              <Link className={ctaOutline} to="/app/analysis">
                Start Analyzing Now{" "}
                <ArrowRight size={18} weight="regular" />
              </Link>
            </div>
            <div className="mt-4 text-caption text-[var(--color-on-surface-variant)]">
              Free, no credit card required.
            </div>
          </Reveal>
        </div>
      </section>

      <Footer variant="landing" />

      <MobileDrawer
        actions={
          <div className="space-y-3">
            <Link
              className={cn(linkBtnSecondary, "w-full justify-center")}
              to="/auth/sign-in"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Sign In
            </Link>
            <Link
              className={cn(linkBtnPrimary, "w-full justify-center")}
              to="/auth/sign-up"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Get Started Free
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
      <div className="font-display font-black text-3xl text-[var(--color-brand)]">
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
        className="absolute right-0 top-8 h-72 w-72 rounded-lg border border-[var(--color-outline)]"
        style={{ backgroundColor: "#F5F4F2" }}
      />

      {/* Overlapping analysis card */}
      <div
        className="absolute right-16 top-24 h-56 w-64 rounded-lg border border-[var(--color-outline)] bg-[var(--color-surface-elevated-1)] p-6"
        style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
      >
        <div className="text-xs font-medium uppercase tracking-[0.15em] text-[var(--color-brand)]">
          Analysis
        </div>
        <div className="mt-3 font-display text-lg font-bold leading-tight text-[var(--color-on-surface)]">
          Senior Backend Engineer
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {["Go", "PostgreSQL", "AWS", "K8s"].map((s) => (
            <Badge key={s} variant="brand" size="sm">
              {s}
            </Badge>
          ))}
        </div>
        {/* Skill progress bars */}
        <div className="mt-4 space-y-1.5">
          <div className="h-1.5 w-full rounded-full bg-[var(--color-outline)]/20">
            <div className="h-full w-4/5 rounded-full bg-[var(--color-brand)]" />
          </div>
          <div className="h-1.5 w-full rounded-full bg-[var(--color-outline)]/20">
            <div className="h-full w-3/5 rounded-full bg-[var(--color-brand)]" />
          </div>
          <div className="h-1.5 w-full rounded-full bg-[var(--color-outline)]/20">
            <div className="h-full w-2/5 rounded-full bg-[var(--color-brand)]" />
          </div>
        </div>
      </div>

      {/* Brand accent circle */}
      <div
        className="absolute left-4 top-4 h-24 w-24 rounded-full"
        style={{ backgroundColor: "var(--color-brand)" }}
      />

      {/* Small cream circle */}
      <div
        className="absolute bottom-8 left-24 h-16 w-16 rounded-full border border-[var(--color-outline)]"
        style={{ backgroundColor: "#FDF0EB" }}
      />

      {/* Vertical line detail */}
      <div className="absolute bottom-16 left-0 h-32 w-px bg-[var(--color-outline)]" />
    </div>
  );
}
