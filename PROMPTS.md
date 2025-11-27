# PROMPTS.md

Prompts ordenados para desarrollar el proyecto Movies Challenge paso a paso.

---

## Fase 0: Configuración Inicial del Proyecto

### Prompt 1: Crear proyecto Next.js con TypeScript
```
Crea un nuevo proyecto Next.js 15 con TypeScript, configurado con:
- App Router
- ESLint
- Prettier
- src/ directory
- Tailwind CSS

Configura tsconfig.json en modo estricto y añade los scripts necesarios en package.json:
- dev, build, start, lint, typecheck, test

Crea .env.example con documentación de variables (aunque no usemos tokens aquí).
```

### Prompt 2: Configurar estructura de carpetas
```
Crea la estructura de carpetas según la arquitectura feature-based:
- /src/features/directors (con subcarpetas: components, hooks, aggregators, tests)
- /src/features/movies (con subcarpetas: components, hooks, filters, tests)
- /src/core/api
- /src/core/lib
- /src/core/ui

Incluye un README.md en cada carpeta explicando su propósito.
```

### Prompt 3: Configurar herramientas de testing
```
Instala y configura Vitest + Testing Library para unit tests y component tests.
Incluye configuración para:
- Coverage reports
- DOM testing environment
- Aliases de paths (@/ para src/)

Añade scripts en package.json: test, test:watch, test:coverage
```

---

## Fase 1: API Layer y Core Utilities

### Prompt 4: Implementar moviesApi.ts
```
Implementa /src/core/api/moviesApi.ts con:
- Función fetchMoviesPage(page: number): Promise<MoviesResponse>
- Función fetchAllMovies(): Promise<Movie[]> que recorre todas las páginas
- Manejo de errores con tipos específicos
- Request cancellation usando AbortController
- Request deduplication (evitar llamadas duplicadas simultáneas)
- TypeScript interfaces para MoviesResponse y Movie

URL del endpoint: https://challenge.iugolabs.com/api/movies/search?page=<page>

Campos de Movie: Title, Year, Rated, Released, Runtime, Genre, Director, Writer, Actors
```

### Prompt 5: Crear tests para moviesApi.ts
```
Crea tests unitarios para /src/core/api/moviesApi.ts:
- Test de fetchMoviesPage exitoso
- Test de manejo de errores de red
- Test de request cancellation
- Test de request deduplication
- Test de parsing correcto de campos de paginación

Usa MSW (Mock Service Worker) o fetch mock para simular las respuestas de la API.
```

### Prompt 6: Implementar mappers/DTOs (opcional)
```
Si es necesario normalizar datos, crea /src/core/lib/movieMapper.ts con:
- Función para normalizar campos de Movie (trim, lowercase para comparaciones, etc.)
- Manejo de valores null/undefined/vacíos
- Tipos TypeScript consistentes

Incluye tests unitarios para casos edge.
```

---

## Fase 2: Feature "Directores por Umbral"

### Prompt 7: Implementar aggregator de directores
```
Crea /src/features/directors/aggregators/directorsAggregator.ts como función pura:
- aggregateDirectors(movies: Movie[], threshold: number): DirectorCount[]
- Cuenta películas por director (case-insensitive, trimmed)
- Filtra directores con conteo ESTRICTAMENTE mayor al threshold
- Ordena alfabéticamente
- Maneja duplicados y valores malformados (null, undefined, empty)

Type DirectorCount = { name: string; count: number }
```

### Prompt 8: Tests para directorsAggregator
```
Crea tests exhaustivos para directorsAggregator:
- Caso con directores duplicados (diferentes casing)
- Caso con valores null/undefined/vacíos
- Caso threshold = 0, threshold = 5, threshold negativo
- Caso con múltiples páginas de películas
- Verificar orden alfabético
- Caso sin resultados (threshold muy alto)
```

### Prompt 9: Hook useDirectorsAggregation
```
Implementa /src/features/directors/hooks/useDirectorsAggregation.ts:
- Acepta threshold como parámetro
- Usa fetchAllMovies() y aggregateDirectors()
- Devuelve: { directors, loading, error }
- Cancela request anterior si threshold cambia
- Memoiza resultados cuando threshold no cambia
- Valida threshold (número >= 0)
```

### Prompt 10: Componente DirectorsThresholdForm
```
Crea /src/features/directors/components/DirectorsThresholdForm.tsx:
- Input numérico para threshold con label accesible
- Validación en cliente: no-numérico muestra error sin llamar API
- Botón "Calcular" que trigger la agregación
- Estados: loading (skeleton), error (mensaje), vacío, éxito
- Lista de resultados con nombre de director y conteo
- Navegación por teclado completa
- ARIA attributes apropiados
```

### Prompt 11: Tests para DirectorsThresholdForm
```
Crea component tests para DirectorsThresholdForm:
- Render inicial correcto
- Validación de input no-numérico (no llama API)
- Threshold < 0 muestra lista vacía
- Loading state muestra skeleton
- Error state muestra mensaje
- Success state muestra lista ordenada
- Accesibilidad: roles, labels, keyboard navigation
```

### Prompt 12: Página/Route de Directores
```
Crea la página /src/app/directors/page.tsx (App Router) que:
- Renderiza DirectorsThresholdForm
- Incluye Error Boundary
- Tiene metadata para SEO
- Layout responsive
```

---

## Fase 3: Feature "Explorar Películas"

### Prompt 13: Hook useMoviesSearch
```
Implementa /src/features/movies/hooks/useMoviesSearch.ts:
- Acepta filters: { title?: string, yearFrom?: number, yearTo?: number, genres?: string[], director?: string }
- Acepta page number
- Fetches incremental por página (no todo de golpe)
- Devuelve: { movies, loading, error, totalPages, currentPage }
- Cancela request al cambiar filtros
- Memoiza resultados
- Opcional: integrar React Query o SWR para cache
```

### Prompt 14: Componente MoviesFilters
```
Crea /src/features/movies/components/MoviesFilters.tsx:
- Input de texto para título
- Range inputs para año (from/to)
- Multi-select para géneros (extraer géneros únicos de data cargada)
- Autocomplete para director (de data cargada)
- Botón "Aplicar Filtros" o filtrado en tiempo real (debounced)
- Accesibilidad completa
```

### Prompt 15: Componente MoviesTable con paginación
```
Crea /src/features/movies/components/MoviesTable.tsx:
- Usa TanStack Table para renderizar lista de películas
- Columnas: Title, Year, Genre, Director
- Paginación con botones Prev/Next
- Loading skeleton mientras carga
- Click en fila abre modal de detalles
- Responsive (en mobile puede ser cards en vez de table)
```

### Prompt 16: Componente MovieDetailsModal
```
Crea /src/features/movies/components/MovieDetailsModal.tsx:
- modal (role="dialog")
- Muestra todos los campos: Title, Year, Rated, Released, Runtime, Genre, Director, Writer, Actors
- Botón cerrar con keyboard support (Escape key)
- Focus trap dentro del modal
- ARIA attributes apropiados
```

### Prompt 17: Tests para Movies components
```
Crea component tests para:
- MoviesFilters: cambio de filtros, validación, accessibility
- MoviesTable: paginación, loading, error, click en fila
- MovieDetailsModal: open/close, keyboard navigation, role="dialog"
```

### Prompt 18: Página/Route de Movies Explorer
```
Crea /src/app/movies/page.tsx que:
- Compone MoviesFilters + MoviesTable + MovieDetailsModal
- Incluye Error Boundary
- Metadata para SEO
- Layout responsive
```

---

## Fase 4: Mejoras de Performance

### Prompt 19: Optimizar con React.memo y useMemo
```
Revisa todos los componentes y hooks para:
- Envolver componentes pesados en React.memo
- Usar useMemo para cálculos costosos (filtrado, sorting)
- Usar useCallback para callbacks estables
- Evitar re-renders innecesarios
```

### Prompt 20: Implementar code-splitting y lazy loading
```
Implementa lazy loading para:
- Rutas con React.lazy() y Suspense
- Componentes pesados (modal, table)
- Split por feature (directors, movies)

Usa next/dynamic para componentes Next.js específicos.
```

### Prompt 21: Opcional - Integrar React Query o SWR
```
Si no se hizo antes, integra SWR para:
- Cache de requests
- Invalidación automática
- Refetch en background
- Deduplicación built-in
- Better loading/error states
```

---

## Fase 5: UI/UX y Accesibilidad

### Prompt 22: Implementar UI components compartidos
```
Crea componentes reutilizables en /src/core/ui:
- Button con variants y estados (loading, disabled)
- Input con label, error message, y tipos
- Select/Multi-select accesible
- Modal/Drawer base accesible
- Skeleton loaders
- Error message component

Todos con TypeScript props y accessibility built-in.
```

### Prompt 23: Mejorar accesibilidad global
```
Audita y mejora accesibilidad:
- Semantic HTML en todos los componentes
- ARIA labels, roles, describedby donde sea necesario
- Focus management (outline visible, focus trap en modals)
- Keyboard navigation completa (Tab, Enter, Escape)
- Color contrast (WCAG AA mínimo)
- Screen reader testing con announcements
```

### Prompt 24: Implementar diseño responsive
```
Asegura que toda la app sea responsive:
- Mobile-first approach
- Breakpoints: mobile (<640px), tablet (640-1024px), desktop (>1024px)
- Table → Cards en mobile
- Filters en drawer colapsable en mobile
- Touch-friendly (botones de 44x44px mínimo)
```

### Prompt 25: Opcional - i18n básico (en/es)
```
Si se requiere i18n, implementa next-intl o similar para:
- Strings en inglés y español
- Cambio de idioma con selector
- Números y fechas localizados
- Mensajes de error traducidos
```

---

## Fase 6: Testing E2E y Calidad Final

### Prompt 26: Configurar Playwright para E2E tests
```
Instala y configura Playwright para tests E2E:
- Test de flujo completo: Directors threshold → ver resultados
- Test de flujo completo: Movies explorer → filtrar → ver detalles
- Test de validaciones y errores
- Test de accesibilidad básica con axe-core
```

### Prompt 27: Escribir E2E tests principales
```
Crea tests E2E para:
1. Directors flow:
   - Navegar a /directors
   - Ingresar threshold válido
   - Click en Calcular
   - Verificar resultados ordenados

2. Movies flow:
   - Navegar a /movies
   - Aplicar filtros
   - Paginar resultados
   - Abrir modal de detalles
   - Cerrar modal
```

### Prompt 28: Configurar CI/CD básico
```
Crea .github/workflows/ci.yml para:
- Lint (ESLint)
- Type check (tsc --noEmit)
- Unit tests (Vitest)
- Build (next build)
- E2E tests (Playwright)

Ejecutar en cada push y PR.
```

### Prompt 29: Documentación final
```
Actualiza README.md con:
- Descripción del proyecto
- Tech stack usado
- Instrucciones de instalación (npm install)
- Scripts disponibles (dev, build, test, lint)
- Estructura de carpetas
- Decisiones arquitectónicas importantes
- Screenshots o demo link (opcional)
```

### Prompt 30: Auditoría final y refinamiento
```
Haz una auditoría final de:
- Todos los tests pasan (unit, component, E2E)
- No hay warnings de ESLint/TypeScript
- Build exitoso sin errores
- Lighthouse score (Performance, Accessibility, Best Practices)
- Revisar TODO/FIXME comments
- Code review de legibilidad
- Limpiar console.logs y código comentado
```

---

### Bonus 1: Dark mode
```
Implementa dark mode con next-themes:
- Toggle switch accesible
- Persiste preferencia en localStorage
- Smooth transition entre temas
- Respeta prefers-color-scheme del OS
```

