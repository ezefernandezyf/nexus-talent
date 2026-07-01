# Product

## Register

product

## Users

- **Recruiters and hiring managers** who receive a job description and need to act on it immediately. They are time-constrained, review-driven professionals — not power users of recruitment software, but domain experts who know what a good candidate looks like.
- **Agency and in-house talent teams** who must balance speed with precision. Every JD processed, every outreach sent, every skills matrix compiled reduces time-to-fill.
- **Solo recruiters at startups or small agencies** who wear many hats. The product must deliver value in under 60 seconds with zero training.

## Product Purpose

Nexus Talent transforms a raw job description into a structured analysis, skills matrix, and recruiter-ready outreach message — all through AI, all under your control.

- **Input**: A job description (URL, text, or file)
- **Output**: Structured summary, extracted skills, marketability assessment, and personalized candidate outreach
- **Outcome**: A recruiter goes from JD to ready-to-send message in under a minute, with full transparency into how the AI arrived at each conclusion

Success looks like a recruiter who never opens a blank document again.

## Brand Personality

**Precise. Bold. Direct.**

- **Precise** — Every pixel, every word, every interaction serves a purpose. No decoration for decoration's sake. The UI respects the user's time.
- **Bold** — Unapologetic visual choices. Dark-first, high-contrast, intentional. Not another generic SaaS that fades into the background.
- **Direct** — The interface speaks the language of recruiting, not the language of software. "Analyze this JD" not "Initiate job description processing pipeline."

The voice is confident but not arrogant. Technical when it needs to be, human when it counts.

**Emotional goals**: The user should feel:
- **In control** — The AI is an assistant, not a black box. Every output is inspectable and editable.
- **Efficient** — The tool gets out of the way. Fast loads, minimal clicks, instant feedback.
- **Confident** — The output is professional, precise, and ready to send to a candidate or client.

## Anti-references

- **Generic AI SaaS** — No violet/blue gradients on white backgrounds. No "Inter + slate-900" default. No glassmorphism for its own sake. No purple button glows.
- **The "warm craft" premium default** — No beige/cream/sand body backgrounds with brass/clay accents and espresso-dark text. This is a B2B tool, not an artisanal cookware brand.
- **Over-designed toy UIs** — No extreme animations, no gamification, no decorative illustrations that add zero information. Every visual decision has a job.
- **Enterprise Clarity™ monotony** — No over-flat gray-on-white designs that signal "we're serious" by being visually boring. Precision is not the same as austerity.
- **"The Signal" (V1.1)** — No Indigo/Chartreuse palette, no Cabinet Grotesk/Satoshi fonts. Clean break from the old identity. No carry-over.

## Design Principles

1. **Dark first, light derived** — The dark palette is the primary design target. Light mode is an accessible adaptation, not a separate design. Both modes receive equal accessibility attention (WCAG AA min, AAA target for body text).

2. **Information over ornamentation** — Every visual decision must answer: "Does this help the recruiter do their job?" If it doesn't, it doesn't belong. Cards are for hierarchy, not decoration.

3. **One accent, one voice** — A single accent color carries the brand across the entire app. No secondary accent competing for attention. No color switches between sections or pages.

4. **Typography as hierarchy** — Font weight, size, and tracking are the primary tools for establishing information hierarchy. Color is secondary. The type scale uses clamping for fluid readability from 320px to 1440px+.

5. **Motion with purpose** — Animations serve state transitions, feedback, and focus. No decorative motion, no infinite loops, no parallax for parallax's sake. Every transition answers "What changed?"

6. **Convergence is the enemy** — Before committing any visual decision, ask: "Would an LLM trained on the web default to this?" If the answer is yes, find a different approach. The goal is an interface that feels considered, not generated.

## Accessibility & Inclusion

- WCAG 2.2 AA minimum (4.5:1 body, 3:1 large text). AAA target where feasible.
- Full dark + light mode support via `data-theme="light"`. System preference respected on first visit.
- `prefers-reduced-motion` honored globally — all animations collapse to instant state changes.
- Focus-visible rings on all interactive elements.
- Semantic HTML with proper heading hierarchy, landmark roles, and ARIA labels where native semantics don't cover the pattern.
- Color is never the sole carrier of information — icons, text, and patterns supplement all color-coded states.
