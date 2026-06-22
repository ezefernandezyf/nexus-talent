import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { LandingIcon } from "../components/LandingIcon";
import { FAQ } from "../components/FAQ";
import { MobileDrawer } from "../../../components/ui/MobileDrawer";
import { MobileMenuButton } from "../../../components/ui/MobileMenuButton";
import { fadeUpVariants } from "../../../components/ui/motion";

const publicDrawerItems = [
  { label: "Home", to: "/" },
  { label: "Analysis", to: "/app/analysis" },
  { label: "History", to: "/app/history" },
] as const;

const fadeUpContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.06 },
  },
};

export function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // SSR-safe: gate framer-motion hook behind typeof window check
  const prefersReducedMotion = typeof window !== "undefined" ? useReducedMotion() : true;

  return (
    <main className="relative bg-surface-container-lowest text-on-surface">
      <Navbar
        brand="Nexus Talent"
        brandHref="/"
        actions={
          <div className="flex items-center gap-4">
            <MobileMenuButton isOpen={isMobileMenuOpen} onClick={() => setIsMobileMenuOpen((current) => !current)} />
            <Link className="secondary-button hidden md:inline-flex" to="/auth/sign-in">
              Sign In
            </Link>
            <Link className="primary-button hidden md:inline-flex" to="/auth/sign-up">
              Get Started Free
            </Link>
          </div>
        }
      />

      {/* ── Hero ── */}
      <section
        className="relative mx-auto max-w-screen-2xl overflow-hidden px-4 pb-20 pt-16 sm:px-6 sm:pb-24 sm:pt-20 lg:px-8 lg:pt-28"
        id="hero"
      >
        <motion.div
          animate={prefersReducedMotion ? undefined : "visible"}
          className="relative"
          initial={prefersReducedMotion ? false : "hidden"}
          variants={fadeUpContainer}
        >
          <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 -z-10 h-[30rem] w-[30rem] rounded-full bg-primary/5 blur-[120px]" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-24 -z-10 h-[25rem] w-[25rem] rounded-full bg-accent/5 blur-[100px]" />

          <motion.div
            className="inline-flex items-center gap-2 rounded-full border border-outline-variant/15 bg-surface-container px-3 py-1"
            variants={fadeUpVariants}
          >
            <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_10px_var(--color-accent)]" />
            <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant">
              AI-Powered Job Intelligence
            </span>
          </motion.div>

          <motion.h1
            className="mt-6 max-w-4xl text-4xl font-bold leading-[1.08] tracking-tight text-on-surface sm:text-5xl md:text-6xl lg:text-7xl"
            variants={fadeUpVariants}
          >
            Transform Job Descriptions into{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Actionable Insights
            </span>
          </motion.h1>

          <motion.p
            className="mt-6 max-w-2xl text-base leading-relaxed text-on-surface-variant sm:text-lg lg:text-xl"
            variants={fadeUpVariants}
          >
            Paste any job description and get a structured analysis: role summary, skills matrix, keyword extraction,
            gap detection, and outreach messages. No fluff, just the signals that matter.
          </motion.p>

          <motion.div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center" variants={fadeUpVariants}>
            <Link
              className="primary-button inline-flex items-center justify-center gap-2 px-8 py-4 text-base"
              to="/auth/sign-up"
            >
              Start Analyzing Now
              <LandingIcon className="h-5 w-5" name="trending_flat" />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ── What Is ── */}
      <section className="relative mx-auto max-w-screen-2xl overflow-hidden px-4 py-24 sm:px-6 lg:px-8 lg:py-32" id="what-is">
        {/* Background glow */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/4 top-1/2 -z-10 h-[28rem] w-[28rem] -translate-y-1/2 rounded-full bg-primary/5 blur-[140px]" />
        </div>
        <motion.div
          animate={prefersReducedMotion ? undefined : "visible"}
          className="mx-auto max-w-4xl lg:border-l-2 lg:border-primary/15 lg:pl-10"
          initial={prefersReducedMotion ? false : "hidden"}
          variants={fadeUpContainer}
        >
          <motion.div
            className="mb-6 inline-flex items-center gap-3 rounded-full border border-primary/15 bg-primary/5 px-4 py-1.5"
            variants={fadeUpVariants}
          >
            <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_var(--color-primary)]" />
            <span className="font-label text-xs font-bold uppercase tracking-widest text-primary">
              What Is Nexus Talent
            </span>
          </motion.div>
          <motion.p
            className="text-lg leading-relaxed text-on-surface-variant sm:text-xl sm:leading-[1.75]"
            variants={fadeUpVariants}
          >
            Paste any job description and Nexus Talent returns a structured analysis: role summary, skills matrix,
            keyword extraction, gap detection, and outreach messages. The AI runs server-side through Groq. Your data
            is sent securely and never exposed to the browser. No PDFs, no team features, no paid tiers. Just a
            straightforward tool that helps you understand what a job posting actually asks for.
          </motion.p>
        </motion.div>
      </section>

      {/* ── How It Works ── */}
      <section className="bg-surface-container-low/50 py-24" id="how-it-works">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <motion.div
            animate={prefersReducedMotion ? undefined : "visible"}
            className="mx-auto max-w-3xl text-center"
            initial={prefersReducedMotion ? false : "hidden"}
            variants={fadeUpContainer}
          >
            <motion.h2
              className="text-sm font-semibold uppercase tracking-widest text-primary"
              variants={fadeUpVariants}
            >
              How It Works
            </motion.h2>
            <motion.p
              className="mt-4 text-3xl font-bold tracking-tight text-on-surface sm:text-4xl"
              variants={fadeUpVariants}
            >
              Three steps to a smarter application
            </motion.p>
          </motion.div>

          <div className="mx-auto mt-16 grid max-w-4xl gap-12 md:grid-cols-3 md:gap-8">
            {[
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
            ].map((step) => (
              <motion.div
                key={step.step}
                animate={prefersReducedMotion ? undefined : "visible"}
                className="flex flex-col gap-4"
                initial={prefersReducedMotion ? false : "hidden"}
                variants={fadeUpVariants}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <LandingIcon className="h-5 w-5" name={step.icon} />
                  </div>
                  <span className="font-label text-xs tracking-widest text-primary">Step {step.step}</span>
                </div>
                <h3 className="text-xl font-semibold tracking-[-0.03em] text-on-surface">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-on-surface-variant">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What You Get ── */}
      <section className="py-24" id="what-you-get">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <motion.div
            animate={prefersReducedMotion ? undefined : "visible"}
            className="mx-auto max-w-3xl text-center"
            initial={prefersReducedMotion ? false : "hidden"}
            variants={fadeUpContainer}
          >
            <motion.h2
              className="text-sm font-semibold uppercase tracking-widest text-primary"
              variants={fadeUpVariants}
            >
              What You Get
            </motion.h2>
            <motion.p
              className="mt-4 text-3xl font-bold tracking-tight text-on-surface sm:text-4xl"
              variants={fadeUpVariants}
            >
              Every analysis, broken down
            </motion.p>
          </motion.div>

          <div className="mx-auto mt-16 grid max-w-4xl gap-x-12 gap-y-10 md:grid-cols-2">
            {[
              {
                icon: "description" as const,
                title: "Summary & Role Breakdown",
                description:
                  "Role, seniority, modality, and key responsibilities extracted and structured at a glance.",
              },
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
            ].map((item) => (
              <motion.div
                key={item.title}
                animate={prefersReducedMotion ? undefined : "visible"}
                className="flex gap-4"
                initial={prefersReducedMotion ? false : "hidden"}
                variants={fadeUpVariants}
              >
                <div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <LandingIcon className="h-5 w-5" name={item.icon} />
                </div>
                <div>
                  <h3 className="font-semibold text-on-surface">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            animate={prefersReducedMotion ? undefined : "visible"}
            className="mx-auto mt-8 flex max-w-lg gap-4"
            initial={prefersReducedMotion ? false : "hidden"}
            variants={fadeUpVariants}
          >
            <div className="flex gap-4">
              <div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <LandingIcon className="h-5 w-5" name="bolt" />
              </div>
              <div>
                <h3 className="font-semibold text-on-surface">Outreach Messages</h3>
                <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">
                  Email and LinkedIn versions ready to edit and send to recruiters and hiring managers.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-surface-container-low/50 py-24" id="faq-section">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <motion.div
            animate={prefersReducedMotion ? undefined : "visible"}
            initial={prefersReducedMotion ? false : "hidden"}
            variants={fadeUpContainer}
          >
            <FAQ />
          </motion.div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="py-24" id="cta">
        <div className="mx-auto max-w-4xl px-8 text-center">
          <motion.div
            animate={prefersReducedMotion ? undefined : "visible"}
            initial={prefersReducedMotion ? false : "hidden"}
            variants={fadeUpContainer}
          >
            <motion.h2
              className="text-3xl font-bold tracking-tight text-on-surface sm:text-4xl md:text-5xl"
              variants={fadeUpVariants}
            >
              Stop guessing. Start applying with precision.
            </motion.h2>
            <motion.p
              className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-on-surface-variant"
              variants={fadeUpVariants}
            >
              Paste a job description, get the structured breakdown, and walk into every interview knowing exactly
              what they're looking for.
            </motion.p>
            <motion.div className="mt-10" variants={fadeUpVariants}>
              <Link
                className="primary-button inline-flex items-center justify-center gap-3 px-10 py-5 text-lg"
                to="/auth/sign-up"
              >
                Start Analyzing Now
                <LandingIcon className="h-5 w-5" name="trending_flat" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />

      <MobileDrawer
        actions={
          <div className="space-y-3">
            <Link
              className="secondary-button w-full justify-center"
              to="/auth/sign-in"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Sign In
            </Link>
            <Link
              className="primary-button w-full justify-center"
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
