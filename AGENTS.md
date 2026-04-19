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

Las capturas de `docs/assets/` fueron generadas con Stitch sobre una base Material UI. Deben tomarse como referencia visual de composición, spacing y jerarquía, no como una obligación de implementar Material UI en la app.

Material UI puede usarse solo como excepción justificada para casos puntuales; no debe convertirse en la base del sistema visual ni reemplazar `DESIGN.md`.

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

El roadmap activo se organiza por módulos pequeños y secuenciales. Cada módulo debe entrar por su propio corte SDD para evitar mezclar shell, auth, settings, navegación y UI polish en el mismo cambio.

### Módulos cerrados

- **13 Auth y acceso social**: Supabase login con email/password más GitHub, Google y LinkedIn; wiring de los botones de acceso de landing y signup.
- **14 Settings rewrite**: Rehacer la página de settings desde la referencia, incluyendo theme toggle, export y controles de cuenta/persistencia.
- **15 History interactions**: Hacer clickeables las cards/items del historial, abrir el detalle completo, revisar si `matchIndex` aporta valor real y eliminarlo si no tiene fundamento.
- **16 Shell y navegación**: Conectar el logo de Nexus Talent a home, cerrar el switch light/dark de la navbar, corregir el layout mobile de la homepage y terminar la navegación global.
- **17 Pages públicas**: Crear `privacy` y `404` para que el footer y las rutas rotas tengan destino real.
- **18 Limpieza de legado**: Eliminar o mover a `old/` los componentes y pages que ya no se usan, solo después de confirmar reemplazo funcional.
- **19 UI parity y responsive polish**: Corregir overlaps, spacing, jerarquía, estados vacíos y detalles mobile sin introducir features nuevas.

### Nuevo bloque de hardening

- **20 Landing mobile y drawer**: Corregir el solapamiento de la landing en mobile, limpiar el menú hamburguesa y ordenar los accesos públicos sin duplicados.
- **21 Auth UX y proveedores sociales**: Arreglar signup/signin, confirmación de contraseña, iconografía, estilos light/dark y habilitación real de GitHub, Google y LinkedIn con Supabase.
- **22 Navegación y shell global**: Llevar el logo a la home, exponer settings y logout en desktop, y revisar el mapa de navegación completo.
- **23 Análisis y fiabilidad IA**: Corregir el selector de tono en light mode, validar que los outputs cambien por vacante y revisar el flujo de análisis para evitar respuestas repetidas.
- **24 Historial avanzado**: Permitir reanálisis, edición de resumen/nota de la vacante y generación de un nuevo mensaje para la misma vacante.
- **25 Settings y cuenta**: Asegurar que settings sea accesible desde todos los puntos esperados y completar los controles de cuenta/persistencia que falten.

### Bloque Final: Polish, UX y Cierre de Producto

- **26 History & Sidebar Polish**: Truncar títulos largos de vacantes, hacer clickeables los items del sidebar izquierdo, e implementar la paginación real del historial (10 items por página).
- **27 Analysis Alignment**: Eliminar la barra y porcentaje de compatibilidad (cálculo sin base real actual).
- **28 Copy, Landing & Branding**: Ajustar claims de la landing a la realidad (arquitectura, IDE, CV "próximamente", ajustar número de devs), integrar el nuevo `faviconreference`, y purgar textos de desarrollo/instrucciones de la interfaz (ej. Settings). Definir flujo del botón "Demo".
- **29 Settings Hardening**: Solucionar el error 404 al desvincular identidades sociales en Supabase (`DELETE /auth/v1/user/identities/...`).
- **30 UX Motion & Micro-interactions**: Implementar animaciones y transiciones (ej. Framer Motion) para feedback visual, menús (hamburger), modales y hovers, mejorando la visibilidad del estado del sistema.

Regla operativa: antes de implementar un módulo, hacer una exploración corta del área afectada y confirmar qué ya existe, qué falta, qué depende de Supabase y qué puede reutilizarse.

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

## 9. Fase Activa: Funcionalidad Pendiente y Hardening

La UI base ya está migrada en varias áreas. La fase activa ahora es cerrar huecos de producto, corregir navegación, resolver dependencias de autenticación y Supabase, y terminar el hardening responsive sin abrir frentes mezclados.

### Prioridad Actual

- **Settings pixel perfect**: ajustar la pantalla de settings lo más cerca posible de `docs/assets/referenciaSetting.html`, sin introducir cambios funcionales fuera del diseño.
- **Settings funcional**: asegurar que vincular, desvincular, guardar cambios de perfil y eliminar cuenta funcionen de punta a punta para usuario final.
- **Permisos de perfil**: resolver el error `permission denied for table profiles` cuando el usuario actualiza el nombre visible.
- **IA de análisis**: mejorar el resumen estructurado y reescribir el message generator para que el mensaje sirva como carta de presentación o texto para reclutamiento, sin salidas recortadas ni plantillas repetidas entre vacantes.
- **Ejecución por módulos**: mantener settings y análisis de IA como frentes separados, cada uno con su exploración, propuesta, spec, diseño, tareas, implementación y verificación.

### Principios de Ejecución

- Los assets de `docs/assets/` siguen siendo la referencia visual cuando exista una pantalla nueva o una reescritura.
- No mezclar lógica compleja dentro de componentes presentacionales.
- Cada interacción visible debe tener una ruta o acción real, o una decisión explícita de por qué se mantiene solo visual.
- Las integraciones externas como Supabase Auth deben tratarse como dependencia explícita del módulo, no como detalle implícito del frontend.
- Antes de borrar componentes o pages viejas, confirmar reemplazo funcional y cobertura mínima.

### Secuencia de Trabajo Recomendada

1. **Exploración del módulo**
  - Revisar la pantalla, componentes, hooks, rutas y servicios relacionados.
  - Identificar qué ya funciona y qué está solo en UI.

2. **Implementación funcional**
  - Conectar handlers, rutas, providers o servicios sin romper la composición visual existente.

3. **Limpieza controlada**
  - Mover a `old/` o eliminar solo lo que quedó sin uso comprobado.

4. **Verificación**
  - Confirmar rutas, tests y comportamiento responsive mínimo.

### Orden Recomendado

- **20 Landing mobile y drawer** primero, porque corrige el primer impacto público y limpia la entrada.
- **21 Auth UX y proveedores sociales** después, porque estabiliza el acceso y evita errores de proveedor.
- **22 Navegación y shell global** luego, porque ordena el acceso a settings, logout y home.
- **23 Análisis y fiabilidad IA** una vez que la navegación y el acceso estén sanos.
- **24 Historial avanzado** después, porque depende del análisis estable y del modelo de persistencia.
- **25 Settings y cuenta** al final, cuando las rutas y la autenticación ya estén cerradas.
