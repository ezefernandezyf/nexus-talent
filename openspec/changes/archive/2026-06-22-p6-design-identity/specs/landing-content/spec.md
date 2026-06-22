# landing-content Specification

## Purpose
AI-citable, structured landing page content replacing the current ~87-word visual-only page.

## Requirements

### Requirement: Structured Content
The landing page MUST deliver: an H1 with keyword-rich title, H2 sections with self-contained answer blocks (50–200 words each), a FAQ section with 5–8 Q&A pairs, and a minimum of 300 words total. Content SHALL be English with neutral/professional tone.

#### Scenario: Crawler extracts landing content
- GIVEN an AI crawler or `curl` requests `/`
- WHEN it parses the HTML
- THEN it finds an H1, at least 3 H2 answer blocks, and 5–8 FAQ Q&A pairs
- AND total visible word count exceeds 300

### Requirement: Strategic CTAs
The system MUST place CTA buttons at strategic points (after Hero, after Features, after FAQ) pointing to signup or analysis.

#### Scenario: User reads the landing page
- GIVEN a visitor scrolls through the landing page
- WHEN they reach the end of each major section
- THEN a relevant CTA button is visible and clickable

### Requirement: Content in HTML Source
All landing content MUST be present in the raw HTML source (not dependent on JavaScript execution). Content SHALL be rendered by SSR or `<noscript>` fallback.

#### Scenario: JavaScript is disabled
- GIVEN JavaScript is disabled or the request comes from a crawler
- WHEN the page HTML is fetched
- THEN H1, H2 blocks, FAQ, and CTAs are all present in the source
