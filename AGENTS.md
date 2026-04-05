# Nexus Talent - Workspace Instructions

Este proyecto emplea un flujo estricto de **Spec-Driven Development (SDD)** dictado por la **Gentle AI Persona**. El sistema debe comportarse como un programador Pair Senior, asegurando que toda decisión se toma _antes_ de escribir el código y que la ejecución respete a rajatabla la arquitectura y el diseño definido (The Precision Instrument).

## 1. Identidad y Contexto del Producto

**Nexus Talent**: Una aplicación web de reclutamiento de precisión asistida por IA para desarrolladores junior y personas en búsqueda activa.

- **Objetivo**: Transformar una "Job Description" (texto libre) en acciones concretas: resumen estructurado, matriz de skills, y un mensaje ganador para recruiters.
- **Diferenciador**: No es texto genérico, sino extracción técnica, cruces directos con requerimientos, y generación de argumentos técnicos irrefutables.

## 2. Stack Tecnológico y Arquitectura Core

El stack no se negocia. Soluciones simples y escalables:

- **Frontend**: React + TypeScript. Arquitectura "Feature-based" (Dominio aislado). Componentes UI desacoplados.
- **Estado**: `TanStack Query` (Server State) + Estado local mínimo.
- **Validación (Crítico)**: `Zod`. Todo input de usuario y todo output de la IA se valida rigurosamente.
- **DB/Backend**: Supabase (Autenticación y Persistencia).
- **Integración IA**: Cliente desacoplado (`ai-client`). Respuestas tipadas con Zod.
- **CI/CD**: Deploy en Vercel.

**Flujo de Datos Obligatorio**:
`Input Usuario -> Validación Zod -> Request IA -> Response IA -> Mapper -> Validación Zod -> Render`
_(Si el flujo se rompe o la IA alucina, la app no debe crashear, debe proveer feedback claro)._

## 3. Quality & Testing

- **Testing**: Unit tests para la lógica de mayor peso: Mappers, Validaciones (Zod schemas), y Servicios (Supabase/IA). La meta mínima es **90% de coverage** en el código crítico y una cobertura fuerte de rutas felices, bordes y fallos.
- **Performance / UX**: Las pantallas core y marketing deben apuntar a **95+ en Lighthouse** (Performance, Accessibility, Best Practices y SEO cuando aplique), sin sacrificar claridad visual.
- **Dependency Safety**: Si se usa `axios`, se debe fijar explícitamente a `1.14.0` y **NO** instalar `1.14.1` por ser una versión vulnerada.
- **UX States**: Todo proceso asíncrono debe tener un estado de UI asociado: _Loading, Success, Error, Vacío_. Nada roto o sin feedback visual.
- **Restricciones Generales**: Cero sobreingeniería. Cero complejidad sin justificación explícita. "Clear over clever".

## 4. The Precision Instrument (Design System)

Toda interfaz generada debe basarse en el `DESIGN.md` existente y las capturas de referencia (`docs/assets/`). Principios clave:

- **"Deep Space"**: Cero negros puros. Utilizar la pila de elevación dictada (`surface-container-lowest` hasta `highest`).
- **No-Line Rule**: Prohibidos los borders sólidos de 1px. Separar por contraste de backgrounds o "Ghost Borders" si es imprescindible (`outline_variant` 15%).
- **Tipografía Editorial**: Inter (jerarquía) + Space Grotesk (Labels, tags técnicos).
- **Cristales y Luces**: Botones primarios llevan gradientes ligeros, _glassmorphism_ para modales (`surface_variant` 60% + 24px blur), e indicadores de status con "Glow Pulse", no badgets toscos.
- **Elevación**: Crear volumen con luz (Drop shadows tintados), nunca sombras negras saturadas.

La fase final del roadmap debe dedicarse a **UI parity / visual polish**: alinear las pantallas existentes con `docs/assets/` y `DESIGN.md`, corrigiendo spacing, jerarquía, estados vacíos, loading y detalles responsivos. Esa fase **no** debe introducir features nuevas; su alcance es estrictamente visual.

## 5. El Flujo de Trabajo (SDD Protocol)

La ejecución DEBE orquestarse con SDD. Este proyecto utiliza un enfoque **Hybrid** (Engram + Openspec) para asegurar que las especificaciones sean tanto buscables como auditables en el repositorio.

Antes de modificar el código estructural, usa las siguientes fases:

1. `sdd-init` - Preparar el directorio de memoria y la estructura `openspec/`.
2. `sdd-explore` - Investigar el approach, arquitectura o integración del LLM.
3. `sdd-propose` - Plan de acción general.
4. `sdd-spec` & `sdd-design` - Definir las interfaces, el contrato Zod, y cómo funcionará Supabase.
5. `sdd-tasks` - Crear el checklist técnico detallado.
6. `sdd-apply` - Ejecutar la implementación (Acá es donde se codifica, NO antes).
7. `sdd-verify` - Comprobar con la Spec original y el estándar de diseño.
8. `sdd-archive` - Guardar los deltas terminados al master-spec.

## 6. Mapa de Módulos (Roadmap)

Para asegurar entregas atómicas y calidad comercial, el proyecto se divide en estos hitos:

- **01 Job Analysis (core)**: Parseo de job description -> resumen, skills, mensaje sugerido.
- **02 AI Service / Orchestrator**: Cliente `ai-client`, llamadas a LLM, retries, rate limiting.
- **03 CI / CD**: Añadir CI / CD.
- **04 Validation & Mappers**: Zod schemas, transformadores entre IA <-> dominio.
- **05 Persistence / History**: Supabase: guardar análisis, notas, historial.
- **06 UI/UX Feature Shells**: `features/analysis`, `features/history`, componentes desacoplados.
- **07 Auth & Users**: Supabase auth, perfiles, permisos.
- **08 Integrations**: GitHub (stack detection), export outreach.
- **09 CI / Tests / Tooling**: unit tests (mappers, validation), e2e básica, linters.
- **10 Admin / Settings**: App settings, tokens, consumo.
- **11 Observability & Errors**: Logging, error states amigables para el usuario.
- **12 UI Parity / Visual Polish**: Ajuste final de todas las pantallas para calcar `docs/assets/` y cerrar inconsistencias visuales sin sumar features.

## 7. Flujo de Git y Organización

- **Branches por Fase**: Cada nueva funcionalidad o fase debe ejecutarse en su propia rama de Git.
- **Commits Atómicos**: Se debe realizar un commit descriptivo por cada tarea individual completada.
- **Convención de Commits y PRs**: Los títulos de los commits y de los pull requests deben escribirse en **inglés**, y la descripción en **español**.
- **Push Obligatorio**: Después de cada commit relevante, se debe sincronizar los cambios con `push`.
- **Repositorio Remoto**: El repositorio central es `https://github.com/ezefernandezyf/nexus-talent`.
- **README Actualizado**: El `README.md` se mantendrá actualizado, explicando el proyecto de forma clara y orientada a onboarding.
- **Separación de Carpetas (Clean UI)**:
  - `src/components/`: UI pura (dumb components).
  - `src/features/`: Lógica de negocio y contenedores (smart components).
  - **Prohibición**: Queda terminantemente **prohibido** mezclar lógica compleja (fetching, cálculos pesados, mutations) directamente dentro de la UI sin la debida abstracción en hooks o servicios.

## 7. Responsabilidades Clínicas (Orchestrator vs Agents)

- **El Orquestador Principal** coordina la conversación, la creación de ramas y los commits.
- **Los Sub-agentes SDD** se limitan estrictamente a explorar, proponer, especificar, diseñar y desglosar tareas de forma asíncrona.
- La creación de carpetas, archivos y código corresponde a la fase de implementación (`sdd-apply`).
- Antes de commitear, el cambio debe respetar este `AGENTS.md` y pasar la validación pertinente.
- **Regla de Hierro**: Los sub-agentes **no deben** crear ramas ni hacer commits por su cuenta. Son ejecutores de fases.

## 8. Protocolo Engram y Ubicación de Skills

- **Memoria Persistente (Engram Protocol)**: Todo el conocimiento arquitectónico, decisiones clave, logs de bugs y el estado del SDD se guardan forzosamente usando las tools de memoria (`mem_save`, `mem_search`, etc.). No se confía en el contexto temporal volátil del chat.
- **Skills del Sistema (Globales)**: Las plantillas de trabajo (`sdd-init`, `sdd-apply`, etc. ) se cargan desde el registro global (ej: `c:\Users\ezefe\.copilot\skills\`).
- **Skills del Proyecto (Locales)**: Este proyecto cuenta con skills específicas en `./skills/` que deben priorizarse para tareas de dominio:
  - `frontend-design`: Para interfaces de alto impacto (The Precision Instrument).
  - `react-19`: Convenciones de la última versión de React.
  - `tailwind-4`: Estilado moderno y performance.
  - `typescript`: Tipado fuerte y avanzado.
  - `zod-4`: Validaciones rigurasa de esquemas.
