# Security Hardening Specification

## Purpose
Defines HTTP security headers, rate limiting, and input sanitization requirements for the Nexus Talent server and client.

## Requirements

### Requirement: HTTP Security Headers
Every server response MUST include the following security headers:

| Header | Value |
|--------|-------|
| Content-Security-Policy | `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self'` |
| X-Frame-Options | DENY |
| X-Content-Type-Options | nosniff |
| Referrer-Policy | strict-origin-when-cross-origin |

#### Scenario: Headers present on every response
- GIVEN the server is running
- WHEN any endpoint is requested via `curl -I`
- THEN all four headers MUST appear in the response
- AND CSP SHALL NOT include `unsafe-eval`

#### Scenario: CSP blocks inline scripts
- GIVEN an attempted XSS injection via inline script tag
- WHEN the browser renders the page
- THEN the CSP directive SHALL block execution

### Requirement: Rate Limiting on Auth Endpoints
The server MUST apply rate limiting of 5 requests per 15-minute window to POST /api/auth/login and POST /api/auth/register.

#### Scenario: Normal auth usage
- GIVEN a user attempts login
- WHEN they make up to 5 attempts within 15 minutes
- THEN requests are processed normally

#### Scenario: Brute-force blocked
- GIVEN a user exceeds 5 auth requests in 15 minutes
- WHEN the 6th request arrives
- THEN the server responds 429 Too Many Requests
- AND the response includes Retry-After header

### Requirement: Rate Limiting on Analysis Endpoint
The server MUST apply rate limiting of 10 requests per minute to POST /api/ai/analyze.

#### Scenario: Normal analysis usage
- GIVEN a user submits analysis requests
- WHEN they make up to 10 requests per minute
- THEN requests are processed normally

#### Scenario: Analysis rate exceeded
- GIVEN a user exceeds 10 analysis requests in one minute
- WHEN the 11th request arrives
- THEN the server responds 429 Too Many Requests

### Requirement: Input Sanitization
All user input MUST be validated and sanitized before processing. Every feature's API layer SHALL include a Zod validation schema that strips dangerous content (HTML tags, script injections, SQL fragments).

#### Scenario: Sanitized job description
- GIVEN a user submits a job description containing `<script>alert(1)</script>`
- WHEN the Zod schema validates the input
- THEN HTML tags are stripped or the request is rejected
- AND no raw HTML reaches the AI processing pipeline

#### Scenario: Sanitized auth input
- GIVEN a user submits email with SQL injection payload
- WHEN the auth validation schema processes the input
- THEN the payload is rejected as invalid email
- AND no malicious string reaches the database layer

#### Scenario: Sanitized update payload
- GIVEN a user edits an analysis displayName with HTML content
- WHEN the PATCH /api/analyses/:id validation runs
- THEN tags are stripped or the request is rejected
