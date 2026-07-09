# Design: P14 — User Profiles

## Technical Approach

Three-layer implementation mirroring the existing profile architecture but replacing inline validation with Zod, enriching the Groq prompt pipeline, and adding a new RHF-based ProfileEditorCard to Settings. The Profile model gains 7 nullable `String?` columns. The analysis flow now fetches profile before Groq — extra ~50ms latency, amortized by the 90s Groq timeout.

## Architecture Decisions

| # | Choice | Alternatives | Rationale |
|---|--------|-------------|-----------|
| AD-1 | Profile fields are flat `String?` columns, not JSONB | Single JSONB `profileData` column | Flat is Prisma-idiomatic, typed, and allows partial `SET skills = $1` updates. JSONB adds no value for 7 known fields. |
| AD-2 | `profileContext` as string param injected into `buildGroqMessages()`, not a service-layer abstraction | ProfileManager service | Overengineering for a ~200 char string. The function already accepts a DTO — one more param is cleaner. |
| AD-3 | Controller catches `getProfileByUserId()` failure, logs warn, proceeds with null context | Fail entire analysis | Analysis is the core value. A missing profile should not block it. |
| AD-4 | ProfileEditorCard uses `useForm` from RHF, not vanilla `useState` like SettingsForm | Port SettingsForm to RHF retroactively | SettingsForm works and is stable. Only the new card gets RHF. No breaking change. |
| AD-5 | No `Textarea` component for skills — use `Input` with type="text" | New Textarea component | Skills is a comma-separated string, not a paragraph. Input is sufficient. |

## Data Flow: Profile → Groq Prompt Enrichment

```
POST /api/ai/analyze
        │
        ▼
analysis.router.ts ──► requireAuth middleware ──► req.userId
        │
        ▼
analysis.controller.ts::analyze()
        │
        ├──(1)──► profileService.getProfileByUserId(req.userId!)
        │              │
        │              ├── ok ──► profileContext = buildProfileContext(profile)
        │              └── err ──► logger.warn, profileContext = null
        │
        ├──(2)──► analysisService.analyze(input, profileContext)
        │              │
        │              ▼
        │         buildGroqMessages(input, profileContext?)
        │              │
        │              ├── profileContext null ──► identical system prompt (byte-for-byte)
        │              └── profileContext exists ──► append "\nSobre el postulante:\n{context}"
        │
        └──(3)──► historyService.saveAnalysis(...)  // best-effort, unchanged
```

**`buildProfileContext()` serialization** (in `analysis.controller.ts`):
```ts
function buildProfileContext(p: ProfileDTO): string {
  const parts: string[] = [];
  if (p.roleTitle) parts.push(`Rol: ${p.roleTitle}`);
  if (p.experienceLevel) parts.push(`Experiencia: ${p.experienceLevel}`);
  if (p.skills) parts.push(`Skills: ${p.skills}`);
  if (p.location) parts.push(`Ubicación: ${p.location}`);
  return parts.length > 0 ? parts.join(". ") + "." : "";
}
// Truncated to ~200 chars by Groq's JSON schema token budget — implicit,
// no explicit slice needed for 7 short text fields.
```

## Prisma Migration

Add to `Profile` model:

```prisma
skills           String?   // REQ-PF-001
experienceLevel  String?   // REQ-PF-002
roleTitle        String?   // REQ-PF-003
resumeLink       String?   // REQ-PF-004
linkedinUrl      String?   // REQ-PF-005
githubUrl        String?   // REQ-PF-006
location         String?   // REQ-PF-007
```

**Migration name**: `20250708_add_profile_fields`  
**Strategy**: `prisma migrate dev` generates `ALTER TABLE "Profile" ADD COLUMN ...` — all nullable, no default needed. Backward compatible: existing rows get NULL for all 7 columns. Prisma client regenerates types — `ProfileDTO` return shape must be updated to include nullable fields.

## Server Architecture

### `profile.service.ts` — replaced `updateDisplayName()` with `updateProfile()`
```ts
export async function updateProfile(
  userId: string,
  data: ProfileUpdateDTO
): Promise<ProfileDTO> {
  const existing = await prisma.profile.findUnique({ where: { id: userId } });
  if (!existing) throw new AppError(404, "Profile not found");

  const updated = await prisma.profile.update({
    where: { id: userId },
    data, // Prisma filters out undefined fields automatically
  });

  return toProfileDTO(updated); // new helper extracting all 10 fields
}
```

`getProfileByUserId()` now calls `toProfileDTO(profile)` returning all 10 fields.

### `profile.router.ts` — Zod replaces typeof
```ts
profileRouter.put("/", requireAuth, async (req, res) => {
  const parsed = profileUpdateSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.issues }); return; }
  const profile = await service.updateProfile(req.userId!, parsed.data);
  res.json(profile);
});
```
Same try/catch/404/500 pattern kept. GET endpoint unchanged — it now returns 10 fields automatically.

### `analysis.controller.ts` — inject profile fetch
```ts
import * as profileService from "../profile/profile.service.js";

export async function analyze(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = req.body as AnalysisRequestDTO;

    // NEW: fetch profile context for prompt enrichment
    let profileContext: string | null = null;
    if (req.userId) {
      try {
        const profile = await profileService.getProfileByUserId(req.userId);
        profileContext = buildProfileContext(profile);
      } catch (err) {
        logger.warn({ err, userId: req.userId }, "Profile fetch failed, proceeding without context");
      }
    }

    const result = await analysisService.analyze(input, profileContext);

    // Best-effort persistence unchanged
    if (req.userId) { /* ... same ... */ }

    res.status(200).json(result);
  } catch (error) { /* ... unchanged ... */ }
}
```

### `analysis.service.ts` — profileContext in pipeline
- `analyze(input: AnalysisRequestDTO, profileContext?: string | null)`: adds param
- `buildGroqMessages(input: AnalysisRequestDTO, profileContext?: string | null)`: appends context block to system message when non-null
- Context appended at line ~117 (before `REGLAS DE ORO`):
```ts
${profileContext ? `\nSobre el postulante:\n${profileContext}\n` : ""}
```
When `profileContext` is null/empty, the system prompt is byte-identical to pre-P14.

## Frontend Component Architecture

### New files in `web/src/features/settings/`
```
components/
  ProfileEditorCard.tsx         ← RHF form, 7 fields + skeleton states
  ProfileEditorCard.test.tsx    ← renders, validates, submits, loading/error states
api/
  validation.ts                 ← MODIFIED: export profileUpdateSchema from shared
```

### `ProfileEditorCard` component tree
```
<Card>
  <AnimatedMount>
    04  ← number badge
    <h2>Perfil Profesional</h2>
    <p>Subtitle</p>
    <form onSubmit={handleSubmit(onSubmit)}>  ← RHF
      <div className="grid gap-4 md:grid-cols-2">
        <Label>Rol actual → <Input {...register("roleTitle")} />
        <Label>Nivel de experiencia → <Input {...register("experienceLevel")} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Label>Skills → <Input {...register("skills")} placeholder="React, TypeScript, Node.js" />
        <Label>Ubicación → <Input {...register("location")} />
      </div>
      <Label>LinkedIn → <Input {...register("linkedinUrl")} type="url" />
      <Label>GitHub → <Input {...register("githubUrl")} type="url" />
      <Label>CV/Resume link → <Input {...register("resumeLink")} type="url" />
      {errors.* && <p role="alert">error per field</p>}
      <Button type="submit" disabled={isSubmitting || isLoading}>
        {isSubmitting ? "Guardando..." : "Guardar cambios"}
      </Button>
    </form>
    <Toast messages for success/error />  ← via useToastStore
  </AnimatedMount>
</Card>
```

### State machine
```
LOADING (isLoading && !data)  →  skeleton bars (pulsing gray <div> with animate-pulse)
EMPTY   (data exists, all null) → form renders, placeholders show, no error
POPULATED (data has values)    → inputs pre-filled via reset(data)
ERROR   (isError)             → error message banner, retry button
```

### API integration in `profile-repository.ts`
- `ProfileRecord` type gains 7 new fields (snake_case from DB: `skills`, `experience_level`, `role_title`, `resume_link`, `linkedin_url`, `github_url`, `location`)
- `PROFILE_SAVE_INPUT_SCHEMA` extended with 7 optional fields
- `save()` method sends `PUT /api/profile` with all fields (Zod strips undefined)
- `get()` returns `GET /api/profile` — backend now returns 10 fields

### `SettingsFeature.tsx` — wire 4th card
After the `</Card>` closing tag for Data (card 03), add:
```tsx
{/* ═══ 04 Perfil Profesional ═══ */}
<ProfileEditorCard
  profile={profile}
  isLoading={profileLoading && !profile}
  onSave={saveProfile}
  isPending={saveProfilePending}
/>
```

## Shared Contracts

### Extended `profileSchema` (in `shared/src/schemas.ts`)
```ts
export const profileSchema = z.object({
  id: z.string(),
  email: z.string(),
  displayName: z.string().nullable(),
  // P14 additions:
  skills: z.string().nullable(),
  experienceLevel: z.string().nullable(),
  roleTitle: z.string().nullable(),
  resumeLink: z.string().url().nullable().or(z.literal("")),
  linkedinUrl: z.string().url().nullable().or(z.literal("")),
  githubUrl: z.string().url().nullable().or(z.literal("")),
  location: z.string().nullable(),
});
```

### New `profileUpdateSchema` (same file)
```ts
export const profileUpdateSchema = z.object({
  skills: z.string().trim().min(1).optional().or(z.literal("").transform(() => undefined)),
  experienceLevel: z.string().trim().optional().or(z.literal("").transform(() => undefined)),
  roleTitle: z.string().trim().optional().or(z.literal("").transform(() => undefined)),
  resumeLink: z.string().url().optional().or(z.literal("")),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  githubUrl: z.string().url().optional().or(z.literal("")),
  location: z.string().trim().optional().or(z.literal("").transform(() => undefined)),
});
export type ProfileUpdateDTO = z.infer<typeof profileUpdateSchema>;
```
`or(z.literal("").transform(...))` handles form empty string → null/nil so Prisma doesn't write `""` URLs. Optional at the schema level means `{}` is valid.

### Exports to add in `shared/src/index.ts`
- `profileUpdateSchema` + `ProfileUpdateDTO` type

## Key Files Changed

| File | Action | Description |
|------|--------|-------------|
| `server/prisma/schema.prisma` | Modify | +7 nullable String fields on Profile |
| `shared/src/schemas.ts` | Modify | Expand `profileSchema`, add `profileUpdateSchema`, add `ProfileUpdateDTO` type |
| `shared/src/index.ts` | Modify | Export `profileUpdateSchema`, `ProfileUpdateDTO` |
| `server/src/profile/profile.service.ts` | Modify | Rename `updateDisplayName` → `updateProfile`, add `toProfileDTO()` helper, return all 10 fields |
| `server/src/profile/profile.router.ts` | Modify | PUT: Zod validation replaces typeof; rename call to `updateProfile` |
| `server/src/analysis/analysis.controller.ts` | Modify | Fetch profile before analysis, inject `profileContext` into `analyze()` |
| `server/src/analysis/analysis.service.ts` | Modify | `analyze()` accepts `profileContext?`, `buildGroqMessages()` appends it |
| `web/src/features/settings/api/validation.ts` | Modify | Extend `PROFILE_RECORD_SCHEMA` and `PROFILE_SAVE_INPUT_SCHEMA` with 7 new fields |
| `web/src/features/settings/api/profile-repository.ts` | Modify | Types reflect new fields; save sends all fields |
| `web/src/features/settings/components/ProfileEditorCard.tsx` | **Create** | New RHF form component with 7 fields, skeleton states |
| `web/src/features/settings/components/ProfileEditorCard.test.tsx` | **Create** | Tests: render, validate, submit, loading/error states |
| `web/src/features/settings/SettingsFeature.tsx` | Modify | Wire ProfileEditorCard as 4th card after Data |
| `web/src/features/settings/hooks/useSettings.ts` | Modify | Updated `ProfileSaveInput` type — hook unchanged, mutation signature updated |

## Testing Strategy

| Layer | What | How |
|-------|------|-----|
| **Server — Service** | `updateProfile()` with partial data, full data, empty data; `toProfileDTO()` maps all fields; 404 on missing user | `vitest`, mock prisma (pattern from `auth.controller.test.ts`) |
| **Server — Router** | PUT accepts valid Zod input, rejects invalid URLs, rejects empty skills string, returns 400 with Zod issues | `vitest` + `mockReqRes` helper |
| **Server — Controller integration** | `analyze()` calls `getProfileByUserId()` before `analyze()`, injects context; profile fetch failure → warn log + null context | Mock `profileService`, `analysisService` |
| **Web — Form rendering** | ProfileEditorCard renders 7 inputs, skeleton on loading, values on populated, placeholder on empty | `vitest` + `@testing-library/react`, mock `useForm`, wrap in `QueryClientProvider` |
| **Web — Validation** | client-side Zod rejects `linkedinUrl: "invalid"` before API call; empty skills rejected | `vitest`, test `zodResolver(profileUpdateSchema)` |
| **Web — Submission** | form calls `onSave` prop with correct shape; button shows "Guardando..." during pending | `vitest` + userEvent |

## Open Questions

- None. All decisions resolved in AD-1 through AD-5.
