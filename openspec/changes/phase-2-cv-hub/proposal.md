# Proposal: Phase 2 — CV Hub in Settings

## Intent

Settings hoy tiene un Card por sección y el perfil profesional está mezclado en un solo formulario. El usuario necesita editar su CV completo (education, experiencia, skills, contacto) sin salir de Settings, igual que en un hub de CV. Unificamos la edición de datos profesionales en un solo lugar con accordion, reutilizando los hooks de CRUD que ya existen en `features/cv/`.

## Scope

### In Scope
- `Accordion` shared component (single-expand, ARIA-compliant, animación con CSS grid)
- `phone` + `portfolioUrl` en Profile (Prisma + Zod schemas + service)
- `ContactSection` — email readonly, phone, portfolio, LinkedIn, GitHub
- `SkillsSection` — text input + Tag display (skills guardadas como string separado por comas)
- `ExperienceSection` — CRUD inline usando `useExperience()` existente
- `EducationSection` — CRUD inline usando `useEducation()` existente
- Restructurar `SettingsFeature.tsx`: reemplazar Cards por Accordion
- Tooltips + help text en Experience/Education forms (modo profesor)

### Out of Scope
- Eliminar CV manager pages (`/app/cv/*`) — ambos caminos conviven
- Reemplazar ProfileEditorCard (se reemplaza al migrar a las secciones nuevas)
- Migración de datos — `phone`/`portfolioUrl` arrancan como null
- Sistema de niveles/rating para skills
- Validación server-side extra (solo Zod schemas)

## Capabilities

### New Capabilities
- `ui-accordion`: Componente Accordion reutilizable (single-expand, ARIA, animación grid)
- `settings-cv-hub`: Punto de entrada SettingsFeature con accordion y secciones de CV

### Modified Capabilities
- `profile-fields`: Agregar `phone` y `portfolioUrl` al schema de Profile (Prisma + Zod)
- `profile-editor`: Se reemplaza ProfileEditorCard por secciones separadas (Contact + Skills)
- `shared-contracts`: Agregar `phone` y `portfolioUrl` a `profileSchema` y `profileUpdateSchema`

## Approach

### Accordion component (nuevo)
Creamos `web/src/shared/components/accordion/Accordion.tsx` con patrón de composición: `Accordion.Root`, `Accordion.Item`, `Accordion.Trigger`, `Accordion.Content`. Single-expand controlado por estado local. Animación con `grid-template-rows: [0 1fr]` en CSS — evita framer-motion, es cero JS overhead. ARIA: `role=region`, `aria-controls`, `aria-expanded`.

**Por qué CSS grid en vez de max-height hack**: grid permite animar `grid-template-rows` de `0fr` a `1fr` con `transition`, cosa que max-height no puede hacer limpiamente sin magic numbers. Más performante y predecible.

### phone + portfolioUrl (Prisma + shared)
Se agregan dos columnas nullable al modelo Profile: `phone` (String) y `portfolioUrl` (String). En `shared/contracts/schemas.ts` se agregan a `profileSchema` como `z.string().nullable()` y a `profileUpdateSchema` como `z.string().optional().or(z.literal(""))`. Phone sin validación de formato específico — solo texto libre (el usuario pone lo que quiera: `+54 11 5555-5555`, `1555555555`, etc.). PortfolioUrl se valida como URL cuando no está vacío.

**Por qué phone libre sin formato**: validar números de teléfono internacionales es un infierno de regex y prefijos. Mejor dejar texto libre y que el usuario escriba como prefiera. El CV lo muestra tal cual.

### ContactSection
Formulario de 5 campos: email (readonly, desde auth), phone, portfolioUrl, linkedinUrl, githubUrl. Usa `useForm` con `zodResolver(profileUpdateSchema)`. Los 3 URL existentes ya están en `profileUpdateSchema`. Los cambios se guardan vía `saveProfile` desde `useSettings()`.

### SkillsSection
Input de texto donde el usuario escribe skills separadas por comas. Debajo del input se renderizan Tags con las skills existentes. Al guardar se persiste como string en `profile.skills`. El parseo split/join es solo visual — el string se almacena tal cual.

**Por qué string y no tabla separada**: simplifica enormemente el schema, no requiere migración de datos, y las skills se usan solo para el análisis — no hay búsqueda por skill, ni relaciones, ni niveles. Cuando se necesite, se escala.

### ExperienceSection + EducationSection
Reutilizan `useExperience()` y `useEducation()` de `features/cv/hooks/`. Inline CRUD: formulario expandible inline para crear/editar items, botón de eliminar con confirmación. Los forms ya existen en las páginas standalone (`ExperienceManagerPage`, `EducationManagerPage`) — se extraen los subcomponentes `ExperienceForm` e `EducationForm` como componentes compartidos o se reimplementan inline en Settings.

Cada sección tiene help text arriba y tooltips en campos clave (date format, description hints).

**Por qué inline CRUD vs modal**: el accordion ya provee aislamiento visual. Un modal adentro de un accordion es jerarquía UI extraña. El inline form es más rápido, menos contexto switching.

### SettingsFeature restructure
Se reemplazan los 4 Cards numerados por un Accordion con secciones: Account (01), Appearance (02), Data (03), Contact, Skills, Experience, Education. Account/Appearance/Data mantienen su contenido actual. Las secciones nuevas (Contact/Skills/Experience/Education) remplazan al ProfileEditorCard.

ProfileEditorCard se elimina al final (no en esta phase — se elimina cuando las secciones nuevas están firmes).

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `server/prisma/schema.prisma` | Modified | +`phone`, +`portfolioUrl` en Profile |
| `shared/src/schemas.ts` | Modified | +`phone`, +`portfolioUrl` en schemas |
| `shared/src/index.ts` | Modified | Exportar nuevos tipos |
| `server/src/profile/profile.service.ts` | Modified | Mapear +2 campos en toProfileDTO |
| `server/src/profile/profile.router.ts` | None | Schema-driven, no necesita cambios |
| `web/src/shared/components/accordion/` | New | Accordion component |
| `web/src/features/settings/SettingsFeature.tsx` | Modified | Cards → Accordion layout |
| `web/src/features/settings/components/ContactSection.tsx` | New | Formulario contacto 5 campos |
| `web/src/features/settings/components/SkillsSection.tsx` | New | Input + Tag display |
| `web/src/features/settings/components/ExperienceSection.tsx` | New | Inline CRUD experience |
| `web/src/features/settings/components/EducationSection.tsx` | New | Inline CRUD education |
| `web/src/features/settings/hooks/useSettings.ts` | Modified | +phone/+portfolioUrl en save |
| `web/src/features/settings/api/validation.ts` | Modified | +phone/+portfolioUrl en schemas locales |
| `web/src/features/cv/hooks/` | None | Reutilizados tal cual |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| ProfileEditorCard duplica estado con nuevas secciones | Medium | Migrar gradual: nuevas secciones conviven hasta que reemplacen al card viejo |
| phone/portfolioUrl no migrados para perfiles existentes | Low | Arrancan como null, el usuario los completa |
| Accordion animation bug en Safari | Low | CSS grid animation ya tiene buena cobertura. Test en Safari antes de merge |
| Inline CRUD en Settings diverge de CV manager pages | Medium | Los hooks son compartidos. Si diverge UI, es aceptable — son contextos diferentes |

## Rollback Plan

1. Revert migrations de `phone`/`portfolioUrl` → `prisma migrate reset` en develop
2. Restaurar `SettingsFeature.tsx` a versión anterior con Cards
3. Eliminar `web/src/shared/components/accordion/` y nuevas section components
4. ProfileEditorCard vuelve a ser la sección 04

## Dependencies

- Prisma migration para `phone` + `portfolioUrl`
- Zod schemas actualizados en `shared/` (requiere rebuild de types)
- `useExperience()` y `useEducation()` ya existen — sin cambios

## Success Criteria

- [ ] Accordion expande/colapsa una sección por vez con animación
- [ ] ContactSection guarda y muestra phone + portfolio + LinkedIn + GitHub
- [ ] SkillsSection parsea comas en Tags visuales, guarda string plano
- [ ] ExperienceSection crea/edita/elimina experiencia inline sin recargar
- [ ] EducationSection crea/edita/elimina educación inline sin recargar
- [ ] ProfileEditorCard ya no se renderiza (reemplazado por Contact + Skills)
- [ ] No se rompen CV manager pages existentes (`/app/cv/experience`, `/app/cv/education`)
