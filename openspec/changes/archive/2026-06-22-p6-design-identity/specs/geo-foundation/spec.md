# geo-foundation Specification

## Purpose
Static GEO/SEO assets ensuring AI crawlers and search engines can discover, understand, and cite Nexus Talent content.

## Requirements

### Requirement: Schema JSON-LD in Head
The system MUST include three JSON-LD blocks in `<head>`: `Organization`, `SoftwareApplication`, and `WebSite` types, following the templates from the GEO audit (Appendix B).

#### Scenario: Crawler extracts structured data
- GIVEN an AI crawler fetches any public page
- WHEN it parses the HTML `<head>`
- THEN it finds valid JSON-LD for Organization, SoftwareApplication, and WebSite

### Requirement: Social Meta Tags
The system MUST include Open Graph and Twitter Card meta tags with correct image paths, a canonical `<link>` tag, and the title "Nexus Talent - AI Recruiting Assistant | Transform Job Descriptions into Insights".

#### Scenario: Link shared on social platforms
- GIVEN a user shares the site URL on LinkedIn, Twitter, or Slack
- WHEN the platform fetches the page
- THEN a rich preview renders with title, description, and OG image

### Requirement: AI Discovery Files
The system MUST serve static `llms.txt` at `/public/llms.txt` (bypassing SPA router), `robots.txt` with explicit GPTBot/Claude-Web/PerplexityBot directives, stable `favicon.ico`, and `og-image.png` at `/public/`.

#### Scenario: AI crawler requests llms.txt
- GIVEN an AI crawler requests `/llms.txt`
- WHEN the server responds
- THEN the static file is served (not the SPA shell)

### Requirement: Noscript Fallback
The system MUST include a `<noscript>` block in `index.html` with the site name, tagline, and privacy link.

#### Scenario: JavaScript is disabled
- GIVEN a crawler or user with JS disabled visits the site
- WHEN the page loads without executing JS
- THEN the noscript content is visible in the HTML source
