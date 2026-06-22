import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { LandingIcon } from "../components/LandingIcon";
import { FAQ } from "../components/FAQ";
import { MobileDrawer } from "../../../components/ui/MobileDrawer";
import { MobileMenuButton } from "../../../components/ui/MobileMenuButton";
import { fadeUpVariants, scaleInVariants } from "../../../components/ui/motion";

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

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.04 },
  },
};

export function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

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

      {/* Hero Section */}
      <section
        className="relative mx-auto max-w-screen-2xl overflow-hidden px-4 pb-14 pt-16 sm:px-6 sm:pb-16 sm:pt-20 lg:px-8 lg:pt-24"
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
            className="mt-6 text-4xl font-bold leading-[1.08] tracking-tight text-on-surface sm:text-5xl md:text-6xl lg:text-7xl"
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
            Paste any job description and get a structured skills matrix, role analysis, and personalized
            outreach copy in seconds. Nexus Talent turns raw job postings into your competitive edge.
          </motion.p>

          <motion.div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center" variants={fadeUpVariants}>
            <Link
              className="primary-button inline-flex items-center justify-center gap-2 px-8 py-4 text-base"
              to="/auth/sign-up"
            >
              Start Analyzing Now
              <LandingIcon className="h-5 w-5" name="trending_flat" />
            </Link>
            <Link
              className="secondary-button inline-flex items-center justify-center gap-2 px-8 py-4 text-base"
              to="/auth/sign-in"
            >
              Sign In
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* What Is Section */}
      <section
        className="mx-auto max-w-screen-2xl px-4 py-20 sm:px-6 lg:px-8"
        id="what-is"
      >
        <motion.div
          animate={prefersReducedMotion ? undefined : "visible"}
          className="mx-auto max-w-3xl"
          initial={prefersReducedMotion ? false : "hidden"}
          variants={fadeUpContainer}
        >
          <motion.h2
            className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary"
            variants={fadeUpVariants}
          >
            What Is Nexus Talent
          </motion.h2>
          <motion.p
            className="mt-6 text-lg leading-relaxed text-on-surface-variant"
            variants={fadeUpVariants}
          >
            Nexus Talent is an AI-powered job intelligence platform designed for job seekers who want to
            apply smarter, not harder. Instead of manually parsing job descriptions to figure out what
            recruiters actually want, you paste the JD and our AI extracts the key signals: required
            skills, seniority level, experience duration, role responsibilities, and cultural fit
            indicators. The result is a structured breakdown you can act on — complete with a skills
            matrix and personalized outreach copy tailored to both recruiters and hiring managers.
            Built for developers, engineers, and technical professionals who value precision over
            guesswork.
          </motion.p>
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section className="bg-surface-container-low/50 py-20" id="how-it-works">
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

          <motion.div
            animate={prefersReducedMotion ? undefined : "visible"}
            className="mt-16 grid gap-8 md:grid-cols-3"
            initial={prefersReducedMotion ? false : "hidden"}
            variants={staggerContainer}
          >
            {[
              {
                icon: "description" as const,
                step: "01",
                title: "Paste the Job Description",
                description:
                  "Copy and paste any job description from LinkedIn, Indeed, or any other source. Nexus Talent accepts plain text, HTML, and PDF formats.",
              },
              {
                icon: "psychology" as const,
                step: "02",
                title: "AI Analyzes the Signals",
                description:
                  "Our AI extracts skills, seniority, experience requirements, and key responsibilities. Each signal comes with a confidence score so you know what to prioritize.",
              },
              {
                icon: "auto_awesome" as const,
                step: "03",
                title: "Get Structured Output",
                description:
                  "Receive a complete skills matrix, role summary, and ready-to-edit outreach messages for recruiters and hiring managers — all in seconds.",
              },
            ].map((step) => (
              <motion.div
                key={step.step}
                className="surface-panel flex flex-col gap-5 p-8"
                variants={scaleInVariants}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <LandingIcon className="h-6 w-6" name={step.icon} />
                </div>
                <span className="font-label text-xs tracking-widest text-on-surface-variant">
                  {step.step}
                </span>
                <h3 className="text-xl font-semibold tracking-[-0.03em] text-on-surface">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-on-surface-variant">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20" id="features">
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
              Features
            </motion.h2>
            <motion.p
              className="mt-4 text-3xl font-bold tracking-tight text-on-surface sm:text-4xl"
              variants={fadeUpVariants}
            >
              Everything you need to land the role
            </motion.p>
          </motion.div>

          <motion.div
            animate={prefersReducedMotion ? undefined : "visible"}
            className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4"
            initial={prefersReducedMotion ? false : "hidden"}
            variants={staggerContainer}
          >
            {[
              {
                icon: "search" as const,
                title: "Smart Signal Extraction",
                description:
                  "Our AI identifies technical skills, soft skills, experience levels, and role-specific requirements from any job description.",
              },
              {
                icon: "analytics" as const,
                title: "Structured Skills Matrix",
                description:
                  "Get a clear visual breakdown of required vs. preferred skills, ranked by relevance and organized by category.",
              },
              {
                icon: "bolt" as const,
                title: "Instant Outreach Copy",
                description:
                  "Generate personalized messages for recruiters and hiring managers that reference specific JD signals and your strengths.",
              },
              {
                icon: "security" as const,
                title: "Private & Secure",
                description:
                  "Your data is encrypted in transit and at rest. We never share or train on your job descriptions or analysis history.",
              },
            ].map((feature) => (
              <motion.div
                key={feature.title}
                className="surface-panel flex flex-col gap-5 p-6"
                variants={scaleInVariants}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <LandingIcon className="h-6 w-6" name={feature.icon} />
                </div>
                <h3 className="text-lg font-semibold tracking-[-0.03em] text-on-surface">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-on-surface-variant">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            animate={prefersReducedMotion ? undefined : "visible"}
            className="mt-12 text-center"
            initial={prefersReducedMotion ? false : "hidden"}
            variants={fadeUpVariants}
          >
            <Link
              className="primary-button inline-flex items-center justify-center gap-2 px-8 py-4 text-base"
              to="/auth/sign-up"
            >
              Try Nexus Talent Free
              <LandingIcon className="h-5 w-5" name="trending_flat" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-surface-container-low/50 py-20" id="faq-section">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <motion.div
            animate={prefersReducedMotion ? undefined : "visible"}
            initial={prefersReducedMotion ? false : "hidden"}
            variants={fadeUpContainer}
          >
            <FAQ />
          </motion.div>

          <motion.div
            animate={prefersReducedMotion ? undefined : "visible"}
            className="mt-12 text-center"
            initial={prefersReducedMotion ? false : "hidden"}
            variants={fadeUpVariants}
          >
            <Link
              className="primary-button inline-flex items-center justify-center gap-2 px-8 py-4 text-base"
              to="/auth/sign-up"
            >
              Start Your First Analysis
              <LandingIcon className="h-5 w-5" name="trending_flat" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
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
              Join thousands of developers who use Nexus Talent to decode job descriptions, highlight
              their strengths, and write outreach that gets replies.
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
