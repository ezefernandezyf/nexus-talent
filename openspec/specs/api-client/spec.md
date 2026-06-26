# API Client Specification

## Purpose

Defines the centralized HTTP client for all frontend-to-backend communication. An Axios instance replaces raw `fetch()` calls, providing automatic cookie attachment and 401 interception.

## Requirements

### Requirement: Axios Instance (REQ-API-001)

The frontend MUST use a single Axios instance with `baseURL: "/api"`, `withCredentials: true`. This instance MUST replace all raw `fetch()` calls to backend endpoints.

#### Scenario: Cookie sent
- GIVEN the Axios instance with `withCredentials: true`
- WHEN any /api/* request is made
- THEN the httpOnly JWT cookie attaches automatically

### Requirement: 401 Interceptor (REQ-API-002)

The Axios instance MUST have a response interceptor. On 401 responses, it MUST clear the auth store and redirect to /auth/sign-in.

#### Scenario: 401 = logout
- GIVEN an expired or missing cookie
- WHEN any API call returns 401
- THEN the interceptor clears the auth store
- AND redirects the browser to /auth/sign-in

### Requirement: Typed Responses (REQ-API-003)

All API responses MUST be typed via shared Zod contracts. The `never` type MUST NOT be used for response data.

#### Scenario: Typed response
- GIVEN a GET /api/auth/me call via the Axios instance
- WHEN the response is received
- THEN it is typed as a Zod-inferred type (e.g. `MeResponse`)
- AND no `any` cast is used for the response body
