import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { cn } from "@/shared/utils/cn";
import { Navbar } from "@/features/landing/components/Navbar";
import { Footer } from "@/shared/components/Footer";
import { LandingIcon } from "@/features/landing/components/LandingIcon";
import { FAQ } from "@/features/landing/components/FAQ";
import { MobileDrawer } from "@/shared/components/MobileDrawer";
import { MobileMenuButton } from "@/shared/components/MobileMenuButton";
import { Card } from "@/shared/components/card";
import { Badge } from "@/shared/components/badge";
import { scaleInVariants } from "@/shared/components/motion";

// ── Constants ──

const linkBtnPrimary = cn(
  "inline-flex items-center justify-center rounded-full font-label select-none",
  "transition-all duration-[var(--duration-fast)] ease-[var(--ease-out-expo)]",
  "bg-[var(--color-brand)] text-[var(--color-on-brand)]",
  "hover:brightness-105 hover:-translate-y-0.5 active:scale-[0.97]",
  "h-10 px-4 text-label text-base gap-2",
);

const linkBtnSecondary = cn(
  "inline-flex items-center justify-center rounded-full font-label select-none",
  "transition-all duration-[var(--duration-fast)] ease-[var(--ease-out-expo)]",
  "bg-[var(--color-accent)] text-[var(--color-on-accent)]",
  "hover:brightness-105 hover:-translate-y-0.5 active:scale-[0.97]",
  "h-10 px-4 text-label text-base gap-2",
);

const publicDrawerItems = [
  { label: "Home", to: "/" },
  { label: "Analysis", to: "/app/analysis" },
  { label: "History", to: "/app/history" },
] as const;

// ── Animation Variants ──

const staggerFade: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.06 },
  },
};

const fadeOnly: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
};

const slideUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

const slideRight: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

const slideLeft: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

const staggerCards: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.08 },
  },
};

// ── Data ──

const howItWorksSteps = [
  {
    icon: "description" as const,
    step: "01",
    title: "Paste the Job Description",
    description:
      "Copy and paste any job description from LinkedIn, Indeed, or anywhere else. Nexus Talent accepts plain text, no PDF upload needed.",
  },
  {
    icon: "psychology" as const,
    step: "02",
    title: "AI Analyzes the Signals",
    description:
      "Server-side Groq AI extracts required skills, seniority, responsibilities, and key requirements from the job description.",
  },
  {
    icon: "auto_awesome" as const,
    step: "03",
    title: "Get Structured Output",
    description:
      "Receive a complete analysis: summary, skills matrix, keywords, gap detection, and outreach messages ready to edit.",
  },
] as const;

const mainFeatures = [
  {
    icon: "analytics" as const,
    title: "Skills Matrix",
    description:
      "Skills categorized as core, strong, or adjacent across technical and soft categories.",
  },
  {
    icon: "search" as const,
    title: "Keywords & ATS Terms",
    description:
      "Hard skills, soft skills, and domain keywords extracted for resume and cover letter optimization.",
  },
  {
    icon: "tune" as const,
    title: "Gap Analysis",
    description:
      "Missing skills identified with mitigation advice and framing tips for interviews.",
  },
] as const;

// ── Component ──

export function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const prefersReducedMotion =
    typeof window !== "undefined" ? useReducedMotion() : true;
  const anim = !prefersReducedMotion;

  return (
    <main className="relative bg-surface-container-lowest text-on-surface">
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

      {/* ═══ HERO — Asymmetric: text left, Deep Teal visual right ═══ */}
      <section
        className="relative mx-auto max-w-screen-2xl overflow-hidden px-4 pb-20 pt-16 sm:px-6 sm:pb-24 sm:pt-20 lg:px-8 lg:pt-28"
        id="hero"
      >
        <div className="grid items-center gap-10 md:grid-cols-12 md:gap-8 lg:gap-12">
          {/* ── Text column ── */}
          <div className="md:col-span-5 lg:col-span-5">
            <motion.div
              animate={anim ? "visible" : undefined}
              className="flex flex-col items-start gap-6"
              initial={anim ? "hidden" : false}
              variants={staggerFade}
            >
              <motion.div
                className="inline-flex items-center gap-2 rounded-full border border-outline-variant/15 bg-surface-container px-3 py-1"
                variants={fadeOnly}
              >
                <span className="h-2 w-2 rounded-full bg-[var(--color-accent)] shadow-[0_0_10px_var(--color-accent)]" />
                <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant">
                  AI-Powered Job Intelligence
                </span>
              </motion.div>

              <motion.h1
                className="font-display text-display font-bold leading-[1.08] tracking-tight text-on-surface"
                variants={slideUp}
              >
                Transform Job Descriptions into{" "}
                <span className="text-accent">Actionable Insights</span>
              </motion.h1>

              <motion.p
                className="max-w-[50ch] text-body leading-relaxed text-on-surface-variant"
                variants={slideUp}
              >
                Paste any job description and get a structured analysis: role
                summary, skills matrix, keyword extraction, gap detection, and
                outreach messages. No fluff, just the signals that matter.
              </motion.p>

              <motion.div variants={fadeOnly}>
                <Link
                  className={cn(linkBtnPrimary, "px-8 py-4 text-base")}
                  to="/auth/sign-up"
                >
                  Start Analyzing Now
                  <LandingIcon className="h-5 w-5" name="trending_flat" />
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* ── Visual column — Deep Teal gradient block ── */}
          <motion.div
            animate={anim ? "visible" : undefined}
            className="md:col-span-7 lg:col-span-7"
            initial={anim ? "hidden" : false}
            variants={scaleInVariants}
          >
            <div className="relative flex h-full min-h-[18rem] w-full items-center justify-center overflow-hidden rounded-[var(--radius-xl)] bg-gradient-to-br from-[var(--color-brand)]/25 to-[var(--color-surface-elevated-1)] shadow-[inset_0_0_0_1px] shadow-[var(--color-on-surface)]/5 lg:min-h-[24rem]">
              {/* Top-right brand glow */}
              <div
                aria-hidden="true"
                className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-[var(--color-brand)]/20 blur-[60px]"
              />
              {/* Bottom-left accent glow */}
              <div
                aria-hidden="true"
                className="absolute -bottom-12 -left-12 h-36 w-36 rounded-full bg-[var(--color-accent)]/10 blur-[50px]"
              />
              {/* Concentric rings — radar/analysis metaphor */}
              <div
                aria-hidden="true"
                className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--color-brand)]/20"
              />
              <div
                aria-hidden="true"
                className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--color-brand)]/15"
              />
              <div
                aria-hidden="true"
                className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-brand)]/15"
              />
              {/* Dot grid — subtle data texture */}
              <div
                aria-hidden="true"
                className="absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, var(--color-brand) 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
              />
              {/* Warm Amber accent dot — statement highlight */}
              <div
                aria-hidden="true"
                className="absolute bottom-8 right-8 h-3 w-3 rounded-full bg-[var(--color-accent)] shadow-[0_0_20px_var(--color-accent)]"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ WHAT IS — Left-aligned with Deep Teal vertical accent ═══ */}
      <section
        className="bg-surface-container-low/50 py-24 sm:py-28"
        id="what-is"
      >
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <motion.div
            animate={anim ? "visible" : undefined}
            className="mx-auto max-w-4xl border-l-2 border-[var(--color-brand)]/30 pl-6 sm:pl-10"
            initial={anim ? "hidden" : false}
            variants={slideRight}
          >
            <Badge className="mb-6" variant="brand">
              What Is Nexus Talent
            </Badge>
            <p className="text-body leading-relaxed text-on-surface-variant sm:text-h4 sm:leading-[1.75]">
              Paste any job description and Nexus Talent returns a structured
              analysis: role summary, skills matrix, keyword extraction, gap
              detection, and outreach messages. The AI runs server-side through
              Groq. Your data is sent securely and never exposed to the browser.
              No PDFs, no team features, no paid tiers. Just a straightforward
              tool that helps you understand what a job posting actually asks
              for.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS — Staggered timeline with center line ═══ */}
      <section className="py-24 sm:py-28" id="how-it-works">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-primary">
              How It Works
            </h2>
            <p className="mt-4 text-h2 font-bold tracking-tight text-on-surface">
              Three steps to a smarter application
            </p>
          </div>

          {/* Timeline */}
          <div className="relative mx-auto mt-16 max-w-4xl">
            {/* Desktop: center vertical line */}
            <div
              aria-hidden="true"
              className="absolute left-1/2 top-0 hidden h-full -translate-x-1/2 md:block"
            >
              <div className="h-full w-px bg-gradient-to-b from-[var(--color-brand)]/40 via-[var(--color-brand)]/20 to-transparent" />
            </div>

            {/* Mobile: left-side vertical line */}
            <div
              aria-hidden="true"
              className="absolute left-[1.1rem] top-0 h-full w-px bg-gradient-to-b from-[var(--color-brand)]/30 via-[var(--color-brand)]/15 to-transparent md:hidden"
            />

            <div className="flex flex-col gap-12 md:gap-16">
              {howItWorksSteps.map((step, i) => {
                const isLeft = i % 2 === 0;

                return (
                  <motion.div
                    key={step.step}
                    animate={anim ? "visible" : undefined}
                    className={cn(
                      "relative flex items-start gap-5 md:gap-0",
                      isLeft ? "flex-row" : "flex-row",
                      "md:flex-row",
                    )}
                    initial={anim ? "hidden" : false}
                    variants={isLeft ? slideRight : slideLeft}
                  >
                    {/* ── Content ── */}
                    <div
                      className={cn(
                        "flex-1",
                        isLeft
                          ? "md:pr-14 md:text-right"
                          : "md:order-3 md:pl-14 md:text-left",
                      )}
                    >
                      {/* Mobile: row with badge + content */}
                      <div className="flex items-start gap-4 md:block">
                        {/* Mobile step dot */}
                        <div className="relative z-[var(--z-base)] flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-brand)]/10 text-[var(--color-brand)] md:hidden">
                          <span className="text-sm font-bold">
                            {step.step}
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          {/* Desktop: step header */}
                          <div
                            className={cn(
                              "mb-2 hidden items-center gap-2 md:flex",
                              isLeft ? "justify-end" : "justify-start",
                            )}
                          >
                            <span className="font-label text-xs tracking-widest text-[var(--color-brand)]">
                              Step {step.step}
                            </span>
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-brand)]/10 text-[var(--color-brand)]">
                              <LandingIcon
                                className="h-4 w-4"
                                name={step.icon}
                              />
                            </div>
                          </div>

                          {/* Mobile: step meta */}
                          <div className="flex items-center gap-2 md:hidden">
                            <span className="font-label text-xs tracking-widest text-[var(--color-brand)]">
                              Step {step.step}
                            </span>
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-brand)]/10 text-[var(--color-brand)]">
                              <LandingIcon
                                className="h-3 w-3"
                                name={step.icon}
                              />
                            </div>
                          </div>

                          <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-on-surface">
                            {step.title}
                          </h3>
                          <p
                            className={cn(
                              "mt-2 text-sm leading-relaxed text-on-surface-variant",
                              isLeft ? "md:ml-auto" : "md:mr-auto",
                              "max-w-[45ch]",
                            )}
                          >
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* ── Desktop timeline dot ── */}
                    <div
                      aria-hidden="true"
                      className={cn(
                        "relative z-[var(--z-base)] hidden flex-shrink-0 md:block",
                        "order-2",
                      )}
                    >
                      <div className="h-4 w-4 rounded-full bg-[var(--color-brand)] shadow-[0_0_12px_var(--color-brand)] ring-4 ring-surface-container-lowest" />
                    </div>

                    {/* ── Desktop spacer (right side, same width as content) ── */}
                    <div className="hidden flex-1 md:block md:order-1" />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ WHAT YOU GET — Featured-first grid ═══ */}
      <section
        className="bg-surface-container-low/50 py-24 sm:py-28"
        id="what-you-get"
      >
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-primary">
              What You Get
            </h2>
            <p className="mt-4 text-h2 font-bold tracking-tight text-on-surface">
              Every analysis, broken down
            </p>
          </div>

          {/* Featured card: Summary & Role Breakdown */}
          <motion.div
            animate={anim ? "visible" : undefined}
            className="mx-auto mt-16 max-w-4xl"
            initial={anim ? "hidden" : false}
            variants={scaleInVariants}
          >
            <Card variant="elevated" padding="lg">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--color-brand)]/10 text-[var(--color-brand)]">
                  <LandingIcon className="h-6 w-6" name="description" />
                </div>
                <div>
                  <Card.Header>Summary & Role Breakdown</Card.Header>
                  <Card.Body>
                    Role, seniority, modality, and key responsibilities
                    extracted and structured at a glance.
                  </Card.Body>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* 3-card grid */}
          <motion.div
            animate={anim ? "visible" : undefined}
            className="mx-auto mt-8 grid max-w-4xl gap-6 md:grid-cols-3"
            initial={anim ? "hidden" : false}
            variants={staggerCards}
          >
            {mainFeatures.map((item) => (
              <motion.div key={item.title} variants={scaleInVariants}>
                <Card variant="elevated" padding="lg">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-brand)]/10 text-[var(--color-brand)]">
                    <LandingIcon className="h-5 w-5" name={item.icon} />
                  </div>
                  <Card.Header className="mt-3">{item.title}</Card.Header>
                  <Card.Body>{item.description}</Card.Body>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Outreach Messages — full-width card */}
          <motion.div
            animate={anim ? "visible" : undefined}
            className="mx-auto mt-8 max-w-4xl"
            initial={anim ? "hidden" : false}
            variants={scaleInVariants}
          >
            <Card variant="elevated" padding="lg">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--color-brand)]/10 text-[var(--color-brand)]">
                  <LandingIcon className="h-5 w-5" name="bolt" />
                </div>
                <div>
                  <Card.Header>Outreach Messages</Card.Header>
                  <Card.Body>
                    Email and LinkedIn versions ready to edit and send to
                    recruiters and hiring managers.
                  </Card.Body>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* ═══ FAQ — Asymmetric: FAQ left, trust stat right ═══ */}
      <section className="py-24 sm:py-28" id="faq-section">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-16">
            {/* Left: FAQ accordion */}
            <div className="lg:col-span-7">
              <FAQ />
            </div>

            {/* Right: Trust stat — Deep Teal card */}
            <motion.div
              animate={anim ? "visible" : undefined}
              className="lg:col-span-5 lg:pt-14"
              initial={anim ? "hidden" : false}
              variants={slideLeft}
            >
              <div className="relative overflow-hidden rounded-[var(--radius-xl)] bg-gradient-to-br from-[var(--color-brand)]/20 to-[var(--color-surface-elevated-1)] p-8 shadow-[inset_0_0_0_1px] shadow-[var(--color-on-surface)]/5">
                {/* Decorative glow */}
                <div
                  aria-hidden="true"
                  className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[var(--color-brand)]/15 blur-[40px]"
                />
                <div className="relative z-[var(--z-base)]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-brand)]/15 text-[var(--color-brand)]">
                    <LandingIcon className="h-6 w-6" name="verified" />
                  </div>
                  <h3 className="mt-6 font-display text-h3 font-bold text-on-surface">
                    Fast. Free. Focused.
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
                    No sign-up fees. No credit card. No data training on your
                    analyses. Just a tool that does one thing well: decode job
                    descriptions so you walk into every opportunity prepared.
                  </p>
                  <div
                    aria-hidden="true"
                    className="mt-6 h-px w-16 bg-[var(--color-brand)]/30"
                  />
                  <div className="mt-6 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-accent)]/15 text-[var(--color-accent)]">
                      <span className="text-xs font-bold">100%</span>
                    </div>
                    <span className="text-sm font-medium text-on-surface">
                      Free, forever
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ BOTTOM CTA — Full-width Deep Teal block ═══ */}
      <section className="bg-[var(--color-brand)] py-24" id="cta">
        <div className="mx-auto max-w-4xl px-8 text-center">
          <h2 className="font-display text-h2 font-bold tracking-tight text-[var(--color-on-brand)]">
            Stop guessing. Start applying with precision.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-body leading-relaxed text-[var(--color-on-brand)]/80">
            Paste a job description, get the structured breakdown, and walk into
            every interview knowing exactly what they're looking for.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              className={cn(
                "inline-flex items-center justify-center rounded-full font-label select-none",
                "transition-all duration-[var(--duration-fast)] ease-[var(--ease-out-expo)]",
                "bg-[var(--color-on-brand)] text-[var(--color-brand)]",
                "hover:brightness-105 hover:-translate-y-0.5 active:scale-[0.97]",
                "h-12 px-10 text-base font-semibold gap-2",
              )}
              to="/auth/sign-up"
            >
              Start Analyzing Now
              <LandingIcon className="h-5 w-5" name="trending_flat" />
            </Link>
          </div>
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
