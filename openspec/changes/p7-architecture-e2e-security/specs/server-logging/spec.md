# Server Logging Specification

## Purpose
Defines structured JSON request logging via pino for the Express 5 server. Supersedes console-based logging on the server side.

## Requirements

### Requirement: Structured JSON Logging via Pino
The server MUST use `pino` as its exclusive logger for all request and application logging. Logs SHALL be structured JSON with timestamp, level, and message fields.

#### Scenario: Log output is valid JSON
- GIVEN the server is running
- WHEN any request is processed
- THEN log lines MUST be parseable JSON objects
- AND each entry MUST include `time`, `level`, and `msg` fields

### Requirement: HTTP Request Logging Middleware
Every HTTP request MUST be logged via pino-http middleware with method, path, status code, and response duration.

#### Scenario: Successful request logged
- GIVEN GET /api/auth/me returns 200
- WHEN the response is sent
- THEN a log entry MUST contain `method: "GET"`, `path: "/api/auth/me"`, `status: 200`
- AND include `responseTime` in milliseconds

#### Scenario: Failed request logged
- GIVEN POST /api/auth/login returns 401
- WHEN the response is sent
- THEN a log entry MUST contain `status: 401`
- AND the error message MUST be included

### Requirement: Auth Event Logging
Auth-critical events MUST be logged at appropriate levels. Login success (info), login failure (warn), register (info), logout (info).

#### Scenario: Login failure logged
- GIVEN a user attempts login with wrong password
- WHEN POST /api/auth/login returns 401
- THEN the log entry MUST include `event: "login_failure"`, the attempted email
- AND `level` MUST be `warn`

#### Scenario: Registration logged
- GIVEN a new user registers successfully
- WHEN POST /api/auth/register returns 201
- THEN the log entry MUST include `event: "register"`, the new user ID
- AND level MUST be `info`

### Requirement: Analysis Request Logging
Every POST /api/ai/analyze request MUST be logged with the authenticated user ID and request size.

#### Scenario: Analysis request logged
- GIVEN an authenticated user submits a job description
- WHEN POST /api/ai/analyze is processed
- THEN a log entry MUST include `event: "analysis_request"`, `userId`, and `inputLength`

### Requirement: Error Stack in Development, Sanitized in Production
Errors logged via pino MUST include full stack traces when `NODE_ENV=development`. In production, error messages SHALL be sanitized — no stack traces, no internal paths.

#### Scenario: Development error with stack
- GIVEN NODE_ENV is "development"
- WHEN an unhandled error occurs
- THEN the log entry MUST include `stack` field with full trace

#### Scenario: Production error sanitized
- GIVEN NODE_ENV is "production"
- WHEN an unhandled error occurs
- THEN the log entry MUST include `msg` with a sanitized message
- AND MUST NOT include stack traces or internal file paths
