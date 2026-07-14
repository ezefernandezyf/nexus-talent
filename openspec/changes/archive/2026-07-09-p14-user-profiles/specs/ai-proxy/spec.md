# Delta for ai-proxy

## ADDED Requirements

### Requirement: Profile context enrichment

`analysis.controller.ts` MUST fetch the authenticated user's profile via `profileService.getProfileByUserId()` BEFORE calling `analysisService.analyze()`. `analysis.service.ts` MUST accept an optional `profileContext` parameter. `buildGroqMessages()` MUST inject a "Sobre el postulante" section into the system prompt when profile data exists, limited to ~200 chars.

#### Scenario: Profile injected into prompt
- GIVEN `req.userId` maps to a profile with `skills: "React, TypeScript"` and `roleTitle: "Full-Stack Developer"`
- WHEN the analysis is requested
- THEN the system prompt MUST include a section like "Sobre el postulante: Rol: Full-Stack Developer. Skills: React, TypeScript. Experiencia: ..."
- AND the profile context text MUST NOT exceed 200 characters

#### Scenario: No profile — prompt unchanged
- GIVEN user has no profile data (all fields null) OR profile fetch fails
- WHEN the analysis is requested
- THEN `buildGroqMessages()` MUST NOT modify the system prompt
- AND the existing system prompt text MUST match the pre-P14 version byte-for-byte

#### Scenario: Profile fetch fails gracefully
- GIVEN `profileService.getProfileByUserId()` throws
- WHEN the controller catches the error
- THEN analysis MUST proceed with `profileContext: null`
- AND the error MUST be logged at `warn` level
