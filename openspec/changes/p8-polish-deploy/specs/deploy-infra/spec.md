# Deploy Infrastructure Specification

## Purpose

Define the production deploy configuration: Vercel-to-Render API proxy rewrites, Render Blueprint (render.yaml), and health check verification. Frontend serves static assets; backend runs on Render.

## Requirements

### Requirement: Vercel API Proxy Rewrites

The `vercel.json` rewrites MUST proxy all `/api/*` requests to the Render backend. The SPA fallback MUST remain for client-side routes. The proxy rewrite MUST appear before the catch-all SPA rule.

#### Scenario: API request proxied to Render

- GIVEN the app is deployed on Vercel
- WHEN a request hits `/api/auth/me`
- THEN Vercel MUST rewrite the request to `https://nexus-talent.onrender.com/api/auth/me`
- AND the response MUST be returned to the client

#### Scenario: SPA fallback still works

- GIVEN the app is deployed on Vercel
- WHEN a request hits `/app/analysis`
- THEN the catch-all rewrite MUST serve `index.html`
- AND the React Router SPA MUST handle the route client-side

#### Scenario: Prerendered routes still work

- GIVEN the app is deployed on Vercel
- WHEN a request hits `/` or `/privacy`
- THEN the static prerendered HTML MUST be served
- AND the `/api/` proxy MUST NOT match these paths

### Requirement: Render Blueprint (render.yaml)

The project MUST include a `render.yaml` at the repo root that defines a Render web service with Dockerfile path, health check endpoint, and required environment variables.

#### Scenario: Render Blueprint validates

- GIVEN `render.yaml` is committed to the repo
- WHEN Render reads the Blueprint
- THEN the service definition MUST include a valid Dockerfile path
- AND the health check path MUST point to `/health`
- AND JWT_SECRET MUST be listed as an env var (generated on first deploy)

#### Scenario: Health check responds 200

- GIVEN the backend Docker container is running on Render
- WHEN Render polls the health check endpoint
- THEN the endpoint MUST return HTTP 200
- AND the response body MUST NOT expose internal state
