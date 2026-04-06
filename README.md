# Nexus Talent

Nexus Talent es una aplicación web de reclutamiento de precisión asistida por IA para personas que buscan trabajo y equipos técnicos que quieren interpretar una vacante con criterio.

La primera capacidad del producto convierte una descripción de puesto en tres salidas accionables:

- un resumen estructurado del rol,
- una matriz de habilidades agrupada por señales relevantes,
- y un borrador de outreach editable antes de copiar.

## Stack

- React 19
- TypeScript
- Tailwind CSS 4
- Zod 4
- TanStack Query
- Supabase Auth
- React Router
- Vitest
- React Testing Library
- Vite

## Flujo de datos

El proyecto sigue este flujo obligatorio:

`Input del usuario -> Validación Zod -> Request a ai-client -> Respuesta IA -> Validación Zod -> Render en UI`

Si la IA devuelve algo inválido, la app no debe romperse: tiene que mostrar un estado de error claro y recuperable.

## Estructura principal

- `src/App.tsx`: shell principal de la app.
- `src/features/analysis/`: módulo de análisis de vacantes.
- `src/lib/ai-client.ts`: cliente local/adaptable para el análisis.
- `src/schemas/job-analysis.ts`: contratos Zod para entrada y salida.
- `openspec/`: artefactos SDD del proyecto.
- `AGENTS.md`: reglas de trabajo y contexto del proyecto.

## Scripts

```bash
npm install
npm run dev
npm run test
npm run test:coverage
npm run typecheck
npm run build
```

## Desarrollo local

1. Instalá dependencias con `npm install`.
2. Levantá la app con `npm run dev`.
3. Ejecutá `npm run test` y `npm run typecheck` antes de abrir un cambio.

## Calidad esperada

- Cobertura crítica objetivo: 90%+
- UX de pantallas principales: 95+ Lighthouse cuando aplique
- Estados asíncronos: loading, success, error y vacío
- Validación estricta de input y output con Zod

## SDD

Este repositorio usa un flujo Spec-Driven Development con artefactos en OpenSpec y memoria persistente en Engram.

Orden esperado para cambios grandes:

1. `sdd-init`
2. `sdd-explore`
3. `sdd-propose`
4. `sdd-spec`
5. `sdd-design`
6. `sdd-tasks`
7. `sdd-apply`
8. `sdd-verify`
9. `sdd-archive`

## AI Service

El segundo cambio SDD introduce una capa de orquestación para AI con Groq como primer proveedor concreto.

- El cliente de análisis sigue validando entrada y salida con Zod.
- La capa de orquestación centraliza retries, timeouts y normalización de errores.
- En desarrollo local, el adapter puede caer al transporte de respaldo para no exigir credenciales de Groq desde el primer día.
- El rate limiting client-side quedó diferido para evitar sobrediseño en la primera integración.

## Supabase Auth

La autenticación del módulo 07 usa Supabase como origen de verdad para la sesión.

- `VITE_SUPABASE_URL`: URL del proyecto de Supabase.
- `VITE_SUPABASE_ANON_KEY`: clave pública anon del proyecto.

Si estas variables faltan, la app se mantiene en el shell público de autenticación y no expone las rutas privadas.

La base mínima de esquema vive en `supabase/migrations/20260405_module_07_auth_users.sql`.

## CI/CD

- El repo ejecuta validación automática con GitHub Actions en pull requests y en pushes a `main`.
- El workflow corre `npm ci`, `npm run test`, `npm run typecheck` y `npm run build`.
- Node queda fijado con `.nvmrc` y `package.json` para evitar drift entre local y CI.
- El despliegue queda listo para Vercel mediante el build de Vite y `vercel.json`.

## Convenciones

- El UI está pensado en español primero.
- El outreach generado debe poder editarse antes de copiarse.
- Las dependencias sensibles deben fijarse explícitamente cuando corresponda.
- Los cambios importantes se trabajan en ramas dedicadas y con commits atómicos.

## Estado actual

El módulo `Job Analysis` ya está implementado, verificado y archivado como primer cambio SDD del proyecto.