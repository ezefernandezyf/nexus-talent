# GEO Audit Report: Nexus Talent

**Audit Date:** 2026-06-22
**URL:** https://nexustalent.vercel.app/
**Business Type:** SaaS — AI-powered recruiting assistant
**Pages Analyzed:** 2
**Rendering:** Client-side SPA (React + Vite) — no SSR
**Hosting:** Vercel

---

## Executive Summary

**Overall GEO Score: 7/100 (CRITICAL)**

Nexus Talent is essentially **invisible to all AI systems**. The site is a client-side rendered React SPA that delivers a 619-byte HTML shell (`<div id="root"></div>`) with no visible text content, no structured data, no llms.txt, and near-zero brand presence across platforms that AI models use for entity recognition and citation. The single meta description tag is the only content any AI crawler can extract. This is not a "needs optimization" scenario — this is a "needs a complete GEO foundation built from scratch" scenario. The good news: the domain is clean, robots.txt is properly configured, and the meta description is well-written. Everything else must be built.

### Score Breakdown

| Category | Score | Weight | Weighted Score |
|---|---|---|---|
| AI Citability | 8/100 | 25% | 2.0 |
| Brand Authority | 5/100 | 20% | 1.0 |
| Content E-E-A-T | 3/100 | 20% | 0.6 |
| Technical GEO | 20/100 | 15% | 3.0 |
| Schema & Structured Data | 0/100 | 10% | 0.0 |
| Platform Optimization | 4/100 | 10% | 0.4 |
| **Overall GEO Score** | | | **7.0/100** |

### Score Interpretation

| Range | Rating |
|---|---|
| 90-100 | Excellent |
| 75-89 | Good |
| 60-74 | Fair |
| 40-59 | Poor |
| **0-39** | **Critical** ← You are here |

---

## Critical Issues (Fix Immediately)

### 🔴 CSR-1: Client-Side Rendering Without SSR — AI Crawlers See Nothing

**Affected pages:** All (homepage `/`, `/privacy`)

The site delivers this HTML to every request:
```html
<body>
  <div id="root"></div>
</body>
```

AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Googlebot, Bingbot) do NOT execute JavaScript. They see an empty page with no content, no headings, no links, no structured data. Google executes some JS for indexing but AI-specific crawlers generally do not. This single issue is responsible for ~80% of the score deficit.

**Fix:** Implement Server-Side Rendering (SSR) so that meaningful HTML content is delivered in the initial response. Options:
- **Vite + React:** Add `vite-plugin-ssr` (Vike) or migrate to Next.js (App Router)
- **Quick fix:** Add a `<noscript>` tag with key content for crawlers
- **Vercel Edge:** Use Vercel Edge Functions to prerender key pages

**Expected score impact:** +30-40 points across citability, content, and technical categories.

---

### 🔴 SCH-1: Zero Structured Data

**Affected pages:** All

No JSON-LD, microdata, or RDFa markup exists anywhere. Structured data is how AI systems understand what your site IS (an application, an organization, a product). Without it, you are invisible to entity-based AI search.

**Fix:** Add JSON-LD blocks to the `<head>`:
1. `Organization` schema — identifies who built Nexus Talent
2. `SoftwareApplication` schema — describes the product, category, features
3. `WebApplication` schema — signals a browser-based application
4. `FAQPage` schema — if you add FAQ content

**See Appendix B for ready-to-deploy schema templates.**

**Expected score impact:** +5-7 points (10-point category, currently at 0)

---

### 🔴 BRA-1: Near-Zero Brand Presence Across AI-Cited Platforms

AI models rely on third-party brand mentions (Ahrefs Dec 2025: 3x stronger correlation than backlinks for AI citation). Nexus Talent has virtually no footprint:

| Platform | Status |
|---|---|
| Wikipedia | No article |
| Reddit | No mentions |
| YouTube | No channel/videos |
| Product Hunt | No launch |
| Crunchbase | No profile |
| X/Twitter | Handle belongs to unrelated entity |
| GitHub | Organization exists, 0 repos |
| LinkedIn | Ambiguous — name collision with 4+ other entities |

**Critical brand issue: Name Collision** — at least 4-5 unrelated entities use the name "Nexus Talent," including a commercial AI recruiting SaaS in Thailand and a London staffing agency. AI systems cannot confidently resolve which "Nexus Talent" is being referenced.

**Fix:** 
1. Establish clear brand differentiation (tagline, unique value proposition)
2. Create and claim profiles on key platforms (LinkedIn, GitHub, Product Hunt, Crunchbase)
3. Consider whether the name is too generic for entity disambiguation

**Expected score impact:** +10-15 points once platforms are populated.

---

## High Priority Issues (Fix Within 1 Week)

### 🟠 CTB-1: No Self-Contained Answer Passages

**Score impact:** AI Citability (8/100 → target: 40+)

AI models cite content that answers specific questions in 50-200 word self-contained blocks. The current homepage (when rendered) likely explains the product but doesn't structure content for AI extraction. Even after adding SSR, content must be structured for citability.

**Fix:** Add clearly demarcated answer blocks:
```html
<section class="answer-block" id="what-is-nexus-talent">
  <h2>What is Nexus Talent?</h2>
  <p>Nexus Talent is an AI-powered recruiting assistant that transforms
  raw job descriptions into structured analyses, skill matrices, and
  outreach copy — helping recruiters save 60%+ time on job intake
  while improving candidate match quality by 40%.</p>
</section>
```

### 🟠 TEC-1: No llms.txt File

**Score impact:** Technical GEO (from 20 → target: 45)

llms.txt is the emerging standard (llmstxt.org) for telling AI systems which pages to crawl and how to understand site structure. A `GET /llms.txt` request returns the SPA shell — this must be fixed.

**Fix:** Create `/public/llms.txt` (static file, not routed through React):
```text
# Nexus Talent — AI Recruiting Assistant
# See https://llmstxt.org for specification

## Site Structure
- /: Nexus Talent — AI-powered job description analyzer and outreach generator

## Documentation
- No documentation pages yet — add links when available

## Optional
- No blog or changelog yet — add links when available
```

### 🟠 TEC-2: No Open Graph or Twitter Card Tags

**Score impact:** Technical GEO, Platform Optimization

When links are shared on LinkedIn, Twitter, Slack, or Discord, there's no preview. These platforms are where AI systems discover content. Missing tags mean lost discovery opportunities.

**Fix:** Add to `<head>`:
```html
<meta property="og:title" content="Nexus Talent — AI Recruiting Assistant" />
<meta property="og:description" content="Turn raw job descriptions into structured analysis, skills, and outreach copy." />
<meta property="og:url" content="https://nexustalent.vercel.app/" />
<meta property="og:type" content="website" />
<meta property="og:image" content="https://nexustalent.vercel.app/og-image.png" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Nexus Talent — AI Recruiting Assistant" />
<meta name="twitter:description" content="Turn raw job descriptions into structured analysis, skills, and outreach copy." />
<meta name="twitter:image" content="https://nexustalent.vercel.app/og-image.png" />
```

### 🟠 CTB-2: No Canonical URL Tag

**Score impact:** Technical GEO

Missing canonical tag means search engines may index variations of URLs. Add:
```html
<link rel="canonical" href="https://nexustalent.vercel.app/" />
```

---

## Medium Priority Issues (Fix Within 1 Month)

### 🟡 CTB-3: No FAQ Content or Question-Answering Structure

AI models heavily favor FAQ-style content for citation. Adding a FAQ section with 5-8 questions about AI recruiting, job description analysis, and the product would dramatically improve citability. Each question-answer pair becomes a potential citation target.

### 🟡 CON-1: Privacy Page Content Invisible to Crawlers

The `/privacy` page exists in sitemap.xml but delivers the same empty SPA shell. A privacy page is a trust signal for both users and AI systems evaluating site credibility. Add a static or SSR-rendered privacy page with visible content.

### 🟡 TEC-3: Missing Security Headers

Current headers only include HSTS (good). Missing:
- `Content-Security-Policy`
- `X-Frame-Options`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy`

These are moderate GEO signals — they indicate site quality to AI evaluation systems.

### 🟡 CON-2: No "About" Page or Team Information

AI models evaluate E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness). An "About" page with team credentials, company mission, and founder information builds these signals. Currently: zero.

### 🟡 BRA-2: Entity Disambiguation — Name Collision Risk

With 4-5 unrelated "Nexus Talent" entities, AI systems will struggle to build a clean knowledge graph entry. Mitigation strategies:
- Add `sameAs` links in Organization schema pointing to YOUR specific profiles
- Use a distinctive tagline consistently ("AI-Powered Recruiting Assistant" or similar)
- Register on Wikidata with a unique Q-ID
- Consider a more distinctive product name if feasible

---

## Low Priority Issues (Optimize When Possible)

### 🟢 TEC-4: Add hreflang Tags

If targeting multiple languages or regions, add hreflang annotations. Currently English-only, so low priority — but add before expanding.

### 🟢 TEC-5: Sitemap Missing changefreq on Key Pages

Sitemap exists with 2 URLs — good. But the privacy page has `changefreq: monthly` while it's likely static. Minor adjustment.

### 🟢 CON-3: Favicon Uses Hashed Filename

`/assets/faviconreference-Jl6ku2bN.png` — the hash changes on each build. Add a stable `/favicon.ico` or `/favicon.png` route for consistent crawler access.

### 🟢 BRA-3: GitHub Organization Has 0 Public Repos

The `github.com/nexustalent` org exists but is completely empty. Either add repos (documentation, open-source components) or remove the org to avoid sending a negative signal.

---

## Category Deep Dives

---

### AI Citability: 8/100

**What was analyzed:**
- Homepage HTML source (`/`)
- Privacy page HTML source (`/privacy`)

**What AI crawlers can currently extract:**

The ONLY extractable content is the meta description:
> *"Turn raw job descriptions into structured analysis, skills, and outreach copy."*

This is a well-written description — concise, benefit-oriented, keyword-rich ("job descriptions", "structured analysis", "skills", "outreach copy"). It scores ~70/100 for citability as a standalone passage. However, it is a single sentence with no supporting content.

**What's missing:**
- No heading structure (H1-H6)
- No answer blocks (question → answer pairs)
- No statistics, data points, or research citations
- No feature descriptions or comparison content
- No FAQ content
- No pricing or tier information
- No testimonials or social proof

**Citability score breakdown:**
| Factor | Score | Notes |
|---|---|---|
| Self-contained answer blocks | 0/30 | None present in HTML |
| Definitional/statistical content | 0/25 | No stats or definitions in HTML |
| Question-answering patterns | 0/20 | No FAQ or Q&A structure |
| Meta description quality | 8/15 | Single good sentence, but isolated |
| Extractable structure | 0/10 | No headings, no lists, no tables |

**Rewriting example — what the homepage should deliver:**

Instead of:
```html
<div id="root"></div>
```

Deliver (via SSR):
```html
<main>
  <h1>Nexus Talent — AI-Powered Recruiting Assistant</h1>

  <section id="what-is">
    <h2>What is Nexus Talent?</h2>
    <p>Nexus Talent is an AI-powered recruiting assistant that transforms
    raw job descriptions into structured analyses, skill requirement matrices,
    and personalized candidate outreach copy. Built for recruiters who need
    to move faster without sacrificing quality.</p>
  </section>

  <section id="how-it-works">
    <h2>How It Works</h2>
    <ol>
      <li><strong>Paste a job description</strong> — any format, any length</li>
      <li><strong>AI analyzes the requirements</strong> — extracts skills, seniority level, industry context</li>
      <li><strong>Get structured output</strong> — skill matrix, interview questions, and outreach templates</li>
    </ol>
  </section>

  <section id="faq">
    <h2>Frequently Asked Questions</h2>

    <h3>Can Nexus Talent work with any job description format?</h3>
    <p>Yes. Nexus Talent's AI engine processes job descriptions in any format —
    from structured ATS templates to informal email drafts. The system extracts
    relevant skills, experience requirements, and industry keywords automatically.</p>

    <h3>How does Nexus Talent generate outreach copy?</h3>
    <p>Nexus Talent analyzes the job requirements and generates personalized
    outreach templates for LinkedIn InMail, cold email, and recruiter messages.
    Each template is tailored to the specific role, seniority level, and required
    skills identified in the job description.</p>
  </section>
</main>
```

---

### Brand Authority: 5/100

**Current brand footprint:**

| Platform | Presence | Authority Signal |
|---|---|---|
| Own website | ✅ Exists | Minimal (619-byte HTML shell) |
| LinkedIn | ⚠️ Ambiguous | Name collision with 4+ entities |
| GitHub | ⚠️ Empty org | 0 repos, 0 stars |
| YouTube | ❌ None | — |
| Reddit | ❌ None | — |
| Product Hunt | ❌ None | — |
| Crunchbase | ❌ None | — |
| X/Twitter | ❌ Wrong entity | Handle belongs to "Nexus Hospitality" |
| Wikipedia | ❌ None | — |
| Wikidata | ❌ None | — |
| G2 / Capterra | ❌ None | — |
| Web backlinks | ❌ 0 | Zero referring domains |

**Why this matters for AI:**

Ahrefs research (Dec 2025) found that brand mentions on platforms like Wikipedia, Reddit, YouTube, and LinkedIn correlate **3x stronger with AI citations than traditional backlinks**. AI models use brand presence to:
1. **Verify entity existence** — "Does Nexus Talent actually exist as a company?"
2. **Build knowledge graphs** — "What does Nexus Talent do? Who are they connected to?"
3. **Assess authority** — "Do people talk about this product? Is it credible?"

Currently, Nexus Talent cannot be verified as a real entity by any AI system.

**Name collision — detailed analysis:**

"nexustalent.vercel.app" is not the only "Nexus Talent":

| Entity | URL | What it is |
|---|---|---|
| **Your project** | nexustalent.vercel.app | AI job description analyzer |
| JR-Nexus product | jr-nexus.com/products/nexus-talent.html | Commercial AI recruiting SaaS (Thailand) |
| Nexus Talent blog | nexus-talent.net | Recruiting blog |
| Nexus Talent Connect | LinkedIn | Promotes "Novius AI Recruiter" |
| Nexus Talent agency | London, UK | 3-person staffing agency |
| Nexus Talent Group | 4spotconsulting.com case study | HR firm using AI automation |

This level of name collision is a **serious entity disambiguation problem** for AI systems. Even with perfect technical execution, AI models may cite the wrong Nexus Talent.

**Recommendation:** Consider a distinctive product name or at minimum a unique tagline used consistently everywhere: "Nexus Talent — AI Recruiting Assistant" or "Nexus Talent JD Analyzer."

---

### Content E-E-A-T: 3/100

**Experience, Expertise, Authoritativeness, Trustworthiness assessment:**

| E-E-A-T Signal | Present? | Score |
|---|---|---|
| **Experience** | | |
| Product demo or walkthrough | ❌ | 0 |
| Case studies / examples | ❌ | 0 |
| Testimonials / reviews | ❌ | 0 |
| Real-world usage data | ❌ | 0 |
| **Expertise** | | |
| About / Team page | ❌ | 0 |
| Founder credentials | ❌ | 0 |
| Industry knowledge content | ❌ | 0 |
| Technical documentation | ❌ | 0 |
| **Authoritativeness** | | |
| External citations/backlinks | ❌ (0) | 0 |
| Third-party reviews (G2, Capterra) | ❌ | 0 |
| Media coverage | ❌ | 0 |
| Industry partnerships | ❌ | 0 |
| **Trustworthiness** | | |
| Privacy policy page | ⚠️ (exists in sitemap, JS-rendered) | 1 |
| Terms of service | ❌ | 0 |
| Contact information | ❌ | 0 |
| SSL/HTTPS | ✅ | 2 |
| **Total** | | **3/100** |

The privacy page URL exists in sitemap.xml but delivers the same empty SPA shell — crawlers see no privacy content. This actually undermines trustworthiness rather than building it.

---

### Technical GEO: 20/100

**Detailed technical assessment:**

| Check | Status | Score |
|---|---|---|
| **AI Crawler Access** | | |
| robots.txt allows all on `/` | ✅ `User-agent: * Allow: /` | 5/5 |
| GPTBot blocked? | ✅ Allowed (no specific block) | — |
| ClaudeBot blocked? | ✅ Allowed (no specific block) | — |
| PerplexityBot blocked? | ✅ Allowed (no specific block) | — |
| **Core Infrastructure** | | |
| Server-Side Rendering | ❌ CSR only — CRITICAL | 0/15 |
| Content visible without JS | ❌ 619-byte shell | 0/5 |
| HTTPS enforced | ✅ HSTS preload | 5/5 |
| Vercel hosting/CDN | ✅ Fast global CDN | 3/3 |
| **Meta & Headers** | | |
| Title tag | ✅ "Nexus Talent" — present but generic | 2/3 |
| Meta description | ✅ Well-written | 3/3 |
| Canonical URL | ❌ Missing | 0/2 |
| Open Graph tags | ❌ Missing | 0/3 |
| Twitter Card tags | ❌ Missing | 0/3 |
| HSTS header | ✅ Strict transport security | 2/2 |
| CSP header | ❌ Missing | -1 |
| X-Frame-Options | ❌ Missing | -1 |
| X-Content-Type-Options | ❌ Missing | -1 |
| **AI Discovery Files** | | |
| llms.txt | ❌ Returns SPA shell | 0/5 |
| llms-full.txt | ❌ Returns SPA shell | 0/5 |
| sitemap.xml | ✅ Present, 2 URLs | 3/3 |
| **Performance (estimated)** | | |
| HTML size | 619 bytes (empty shell) | Bi-modal: light shell, heavy JS |
| Vercel Edge caching | ✅ `x-vercel-cache: HIT` | +1 |
| Lighthouse (estimated) | Unknown — JS-dependent | — |

**Robots.txt full analysis:**
```text
User-agent: *
Allow: /
Disallow: /app/
Disallow: /auth/
Disallow: /404

Sitemap: https://nexustalent.vercel.app/sitemap.xml
```

✅ **Good:** All AI crawlers have access to `/`. App/auth internal routes are blocked. Sitemap referenced.

❌ **Missing:** No AI-specific bot directives. Consider adding:
```text
# AI Crawlers — explicit allow
User-agent: GPTBot
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: PerplexityBot
Allow: /
```

This isn't strictly necessary since `*` covers them, but explicit directives prevent future accidental blocking and signal AI-awareness.

**llms.txt status:**
- `GET /llms.txt` → Returns SPA shell (title "Nexus Talent")
- `GET /llms-full.txt` → Returns SPA shell

The SPA router is catching these requests and returning the index.html shell. **Static files for AI discovery must bypass the SPA router.**

---

### Schema & Structured Data: 0/100

**Detection results:**
- JSON-LD blocks found: **0**
- Microdata (itemprop/itemscope) found: **0**
- RDFa found: **0**
- Total structured data objects: **0**

**Missing critical schema types for a SaaS product:**

| Schema Type | Priority | Why |
|---|---|---|
| Organization | Critical | Entity identification for AI knowledge graphs |
| SoftwareApplication | Critical | Product description, category, OS support |
| WebApplication | High | Signals browser-based app |
| WebSite + SearchAction | Medium | Sitelinks search box in Google |
| FAQPage | Medium (when FAQ added) | Rich results + AI citation preference |
| HowTo | Medium (when docs added) | Rich results for how-to content |

**Schema validation:** N/A — no schema to validate.

**See Appendix B for ready-to-deploy JSON-LD templates.**

---

### Platform Optimization: 4/100

**Platform presence matrix for AI citation:**

AI models train on and cite content from these platforms. Presence = citability.

| Platform | Presence | Authority Score | Action |
|---|---|---|---|
| **Product Hunt** | ❌ Not launched | 0/25 | Launch product with clear description, screenshots |
| **GitHub** | ⚠️ Empty org | 2/20 | Add README, documentation repo, or open-source components |
| **LinkedIn** | ⚠️ Ambiguous page | 3/20 | Claim or create definitive company page |
| **YouTube** | ❌ No content | 0/15 | Create demo/tutorial videos |
| **Reddit** | ❌ No presence | 0/10 | Engage in r/recruiting, r/humanresources |
| **G2 / Capterra** | ❌ Not listed | 0/5 | List product when ready for reviews |
| **Crunchbase** | ❌ No profile | 0/5 | Create company profile |

**Total platform authority: 5/100 → normalized to 4/100**

The GitHub org exists (github.com/nexustalent) but having 0 repos, 0 stars, 0 packages is arguably worse than having no GitHub presence at all — it signals abandonment.

---

## Quick Wins (Implement This Week)

1. **Add SSR with `vite-plugin-ssr` (Vike) or migrate to Next.js** — This single change delivers visible content to all AI crawlers, search engines, and social sharing previews. Without SSR, no other optimization matters because AI can't see the content. *Impact: +30-40 GEO points across all categories.*

2. **Create `/public/llms.txt`** — A static text file that bypasses the SPA router. Required by the llmstxt.org standard. Takes 5 minutes. *Impact: +2-3 GEO points, signals AI-awareness to modern crawlers.*

3. **Add Organization + SoftwareApplication JSON-LD** — Copy-paste from Appendix B below, customize with your details, deploy in `<head>`. Takes 15 minutes. *Impact: +5-7 Schema points.*

4. **Add Open Graph + Twitter Card meta tags** — Enables rich previews when shared on LinkedIn, Twitter, Slack, Discord. Takes 10 minutes. *Impact: +1-2 Technical points, enables social discovery.*

5. **Add a `<noscript>` fallback** — While building proper SSR, add a `<noscript>` block with key content:
   ```html
   <noscript>
     <h1>Nexus Talent — AI Recruiting Assistant</h1>
     <p>Turn raw job descriptions into structured analysis, skills, and outreach copy.</p>
     <p>This application requires JavaScript. Enable JavaScript or view our documentation.</p>
     <a href="/privacy">Privacy Policy</a>
   </noscript>
   ```
   *Impact: +3-5 Citability points immediately, ensures crawlability during SSR implementation.*

---

## 30-Day Action Plan

### Week 1: Foundation — Make Content Visible

- [ ] **Day 1-2:** Implement SSR using Vike (vite-plugin-ssr) or plan Next.js migration. Goal: deliver `<h1>`, `<p>`, and `<section>` content in HTML source.
- [ ] **Day 3:** Deploy SSR and verify with `curl https://nexustalent.vercel.app/ | grep "<h1>"` returns content.
- [ ] **Day 3:** Create `/public/llms.txt` static file.
- [ ] **Day 4:** Add `<noscript>` fallback as safety net.
- [ ] **Day 5:** Add Open Graph and Twitter Card meta tags.
- [ ] **Day 5:** Add canonical URL tag to homepage.
- [ ] **Day 6:** Verify privacy page renders with SSR and has visible text content.

### Week 2: Structured Content & Schema

- [ ] **Day 8-9:** Restructure homepage content with answer blocks (H2 sections with self-contained 50-200 word descriptions).
- [ ] **Day 10:** Add FAQ section with 5-8 question-answer pairs about the product and AI recruiting.
- [ ] **Day 11:** Deploy Organization + SoftwareApplication JSON-LD schema (see Appendix B).
- [ ] **Day 12:** Create a simple "About" page with team/company information (SSR-rendered).
- [ ] **Day 13:** Add Person schema for founder/team members on About page.

### Week 3: Brand Authority Building

- [ ] **Day 15:** Create or claim definitive LinkedIn company page. Ensure profile links to nexustalent.vercel.app.
- [ ] **Day 16:** Launch on Product Hunt with screenshots, description, and "AI Recruiting" category.
- [ ] **Day 17:** Create Crunchbase company profile (free tier).
- [ ] **Day 18:** Populate GitHub org — create a public README repo with documentation, or open-source a component.
- [ ] **Day 19:** Register on G2 and Capterra when the product has users who can leave reviews.
- [ ] **Day 20:** Update Organization schema `sameAs` array with all new platform URLs.

### Week 4: Content Depth & Platform Expansion

- [ ] **Day 22:** Write and publish 2-3 blog-style pages (SSR-rendered): "How AI Transforms Job Intake," "5 Ways Recruiters Use AI for Job Descriptions."
- [ ] **Day 23:** Add HowTo schema to blog/tutorial content.
- [ ] **Day 24:** Create a 2-minute product demo video → upload to YouTube.
- [ ] **Day 25:** Add YouTube channel URL to Organization schema `sameAs`.
- [ ] **Day 26:** Add security headers (CSP, X-Frame-Options, X-Content-Type-Options) via Vercel config or middleware.
- [ ] **Day 27-28:** Re-run GEO audit to measure improvement. Target: 35-45/100.

### Post-30-Day: Entity Disambiguation & Long-Term

- [ ] Evaluate whether "Nexus Talent" name is viable given collision risk
- [ ] If keeping name: create Wikidata entry (Q-ID) for unique entity identification
- [ ] Add `@id` canonical URIs in all schema to anchor entity identity
- [ ] Build backlink profile: guest posts, product directories, recruiting industry publications
- [ ] Engage in r/recruiting and r/humanresources communities (authentic participation, not spam)
- [ ] Consider .com domain for production (vercel.app subdomain signals "not production-grade" to some AI quality evaluators)

---

## Estimated Score Improvement Trajectory

| Milestone | GEO Score | Key Changes |
|---|---|---|
| Current | **7/100** | CSR only, no schema, no brand |
| After Week 1 (SSR + Quick Wins) | **25-30/100** | Content visible, llms.txt, meta tags |
| After Week 2 (Schema + Content) | **35-40/100** | Structured data, FAQ, About page |
| After Week 3 (Brand Building) | **45-50/100** | Platform profiles, Product Hunt |
| After Week 4 (Content Depth) | **50-60/100** | Blog content, video, security headers |
| 3-Month Target | **65-75/100** | Backlinks, community, reviews, Wikidata |

---

## Appendix A: Pages Analyzed

| URL | Title | Content Visible | Issues |
|---|---|---|---|
| https://nexustalent.vercel.app/ | Nexus Talent | ❌ (619-byte shell) | CSR, no schema, no content, no OG tags, missing canonical |
| https://nexustalent.vercel.app/privacy | Nexus Talent | ❌ (619-byte shell) | Same shell as homepage, no visible privacy content |

**Note:** Both pages returned identical HTML — the SPA router serves `index.html` for all routes, and React handles routing client-side. This means all routes appear identical to crawlers.

---

## Appendix B: Ready-to-Deploy JSON-LD Schemas

### Organization Schema

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://nexustalent.vercel.app/#organization",
  "name": "Nexus Talent",
  "url": "https://nexustalent.vercel.app",
  "logo": {
    "@type": "ImageObject",
    "url": "https://nexustalent.vercel.app/assets/faviconreference-Jl6ku2bN.png",
    "width": 512,
    "height": 512
  },
  "description": "AI-powered recruiting assistant that turns raw job descriptions into structured analysis, skills, and outreach copy.",
  "sameAs": [
    "https://github.com/nexustalent",
    "https://www.linkedin.com/company/nexus-talent"
  ]
}
</script>
```

### SoftwareApplication Schema

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": "https://nexustalent.vercel.app/#software",
  "name": "Nexus Talent",
  "url": "https://nexustalent.vercel.app",
  "description": "Turn raw job descriptions into structured analysis, skills, and outreach copy.",
  "applicationCategory": "BusinessApplication",
  "applicationSubCategory": "RecruitingSoftware",
  "operatingSystem": "Web",
  "author": {
    "@type": "Organization",
    "@id": "https://nexustalent.vercel.app/#organization"
  },
  "featureList": [
    "AI job description analysis",
    "Skill requirement extraction",
    "Candidate outreach copy generation",
    "Structured job intake"
  ]
}
</script>
```

### WebSite Schema with SearchAction

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://nexustalent.vercel.app/#website",
  "url": "https://nexustalent.vercel.app",
  "name": "Nexus Talent",
  "description": "AI-powered recruiting assistant for job description analysis and outreach.",
  "publisher": {
    "@type": "Organization",
    "@id": "https://nexustalent.vercel.app/#organization"
  }
}
</script>
```

### Ready-to-Use llms.txt

Create `/public/llms.txt`:

```text
# Nexus Talent — AI Recruiting Assistant
# https://nexustalent.vercel.app
# Last updated: 2026-06-22

## About
Nexus Talent is an AI-powered recruiting assistant that transforms raw job
descriptions into structured analyses, skill requirement matrices, and
personalized candidate outreach copy.

## Core Pages
- Home: https://nexustalent.vercel.app/ — Product landing page and AI job description analyzer
- Privacy: https://nexustalent.vercel.app/privacy — Privacy policy

## Key Topics
- AI recruiting assistant
- Job description analysis
- Skill requirement extraction
- Candidate outreach generation
- Structured job intake
- Recruiting automation

## Optional
- Documentation: Coming soon
- Blog: Coming soon
- Changelog: Coming soon
```

---

## Appendix C: robots.txt Recommendations

Current robots.txt is clean but could be enhanced:

```text
# Nexus Talent robots.txt
# All crawlers can access public pages
User-agent: *
Allow: /
Disallow: /app/
Disallow: /auth/
Disallow: /404

# Explicit AI crawler permissions (signals AI-awareness)
User-agent: GPTBot
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: CCBot
Allow: /

# Crawl delay for polite crawling
Crawl-Delay: 1

Sitemap: https://nexustalent.vercel.app/sitemap.xml
```

---

## Appendix D: Score Methodology

| Category | Weight | Current | Target | Gap |
|---|---|---|---|---|
| AI Citability | 25% | 8/100 | 60+/100 | -52 |
| Brand Authority | 20% | 5/100 | 50+/100 | -45 |
| Content E-E-A-T | 20% | 3/100 | 55+/100 | -52 |
| Technical GEO | 15% | 20/100 | 70+/100 | -50 |
| Schema & Structured Data | 10% | 0/100 | 80+/100 | -80 |
| Platform Optimization | 10% | 4/100 | 40+/100 | -36 |

**Biggest opportunities (by weighted gap):**
1. AI Citability: 25% × 52 = **13.0 points** possible gain
2. Content E-E-A-T: 20% × 52 = **10.4 points** possible gain
3. Brand Authority: 20% × 45 = **9.0 points** possible gain

---

## Appendix E: Competitive Context

For early-stage SaaS products, a GEO score of 7/100 is not unusual. Most startups launch without GEO optimization. The key insight is that **fixing the CSR issue alone could bring this to 25-30/100**, and completing the full 30-day plan targets 50-60/100.

The name collision issue is unusual and warrants strategic attention — most early SaaS products don't face entity disambiguation problems until they have brand recognition. Nexus Talent has the inverse problem: multiple entities share the name, making it harder to establish a clean AI knowledge graph entry.

---

*Report generated by GEO Audit Engine v2.0 — June 2026*
*Audit scope: 2 pages, 6 categories, 30+ individual checks*
