# Delta for Auth

## Exclusions
This change does not rewrite settings, account preferences, or the email/password baseline.

## ADDED Requirements

### Requirement: Social Provider Sign-In Wiring
The system MUST expose GitHub and Google sign-in actions on the existing auth entry points and MUST preserve the current email/password flow. LinkedIn MAY be exposed only when provider setup is verified and enabled.

#### Scenario: GitHub sign-in is available
- GIVEN a user is on the login or signup entry point
- WHEN the user selects GitHub sign-in
- THEN the system MUST start the GitHub OAuth flow
- AND the user MUST return to the current authenticated flow after success

#### Scenario: Google sign-in is available
- GIVEN a user is on the login or signup entry point
- WHEN the user selects Google sign-in
- THEN the system MUST start the Google OAuth flow
- AND the user MUST return to the current authenticated flow after success

#### Scenario: LinkedIn is not verified
- GIVEN LinkedIn provider configuration is not confirmed
- WHEN the auth entry point renders
- THEN LinkedIn MUST NOT be shown as an available provider
- AND GitHub plus Google MUST remain available

### Requirement: OAuth Misconfiguration Fallback
The system MUST fail gracefully when a provider is misconfigured, unavailable, or rejects the callback.

#### Scenario: OAuth setup is broken
- GIVEN a provider redirect or callback is misconfigured
- WHEN the user attempts social sign-in
- THEN the system MUST show a clear error state
- AND the system MUST NOT crash or navigate away unexpectedly
- AND the email/password flow MUST remain available as fallback