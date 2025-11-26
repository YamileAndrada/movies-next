# Copilot Instructions — Movies Challenge (Frontend Architecture Guide)

These are the permanent rules and constraints Copilot must follow when generating code for this repository.

---

## 1. Stack & General Rules
- Framework: **Next.js 14/15 + TypeScript**.
- Use **strict TypeScript** and follow ESLint + Prettier formatting.
- Keep components small, typed, and focused on rendering only.
- Move business logic into services, hooks, or pure functions.

---

## 2. API Contract
Single backend endpoint:

GET https://challenge.iugolabs.com/api/movies/search?page=<page>


- Response: `page`, `per_page`, `total`, `total_pages`, `data[]`.
- Each movie includes: `Title, Year, Rated, Released, Runtime, Genre, Director, Writer, Actors`.
- **No director endpoint exists → Director aggregation must be done client-side across all pages.**

---

## 3. Required Architecture (Feature-Based)
All code must follow this structure:

/features
/directors
components/
hooks/
aggregators/
pages or routes/
tests/

/features
/movies
components/
hooks/
filters/
pages or routes/
tests/

/core
/api → API layer (moviesApi.ts)
/lib → shared utilities, mappers, helpers
/ui → shared UI components (optional)


### Architecture rules:
- All API calls must go through **/core/api/moviesApi.ts**.
- Implement pagination helpers and request cancellation in the API layer.
- Use **mappers/DTOs** if needed to normalize movie data.
- Heavy logic is **not allowed inside components**.

---

## 4. Required Custom Hooks
Copilot should prefer generating reusable hooks:

- `useMoviesSearch()`  
  Handles paging, filters, memoization, caching (React Query/SWR optional).

- `usePaginatedMovies()`  
  For incremental loading / virtual scroll.

- `useDirectorsAggregation()`  
  Fetches all pages, aggregates directors, applies threshold filtering.

Hooks must handle:
- loading / error / empty states  
- request cancellation  
- memoization  
- stable dependencies  

---

## 5. Functional Requirements

### 5.1 Directors by Threshold
- Input: integer ≥ 0.
- Validation:
  - non-numeric → form error (no API request)
  - < 0 → empty result
- On "Calculate":
  - fetch all pages
  - aggregate movie count per director
  - filter directors strictly above threshold
  - sort alphabetically
- UI states: loading skeleton, error message, empty, success.
- Accessibility: labels, focus management, keyboard navigation.

### 5.2 Movies Explorer
- Table/grid with pagination or virtual scrolling.
- Filters:
  - title (text)
  - year range
  - genre (multi-select)
  - director (autocomplete from loaded data)
- Incremental loading by pages.
- Movie details shown in modal/drawer.

---

## 6. Performance Requirements
- Deduplicate API requests.
- Cancel requests when threshold or filters change.
- Avoid unnecessary re-renders using memoization & stable callbacks.
- Code-splitting and lazy-loading per feature.
- Virtualized lists for large datasets (TanStack Table).

---

## 7. Error Handling
- Each feature should have its own **Error Boundary**.
- Show user-friendly error messages.
- Fail gracefully on network or parsing issues.

---

## 8. UI/UX Guidelines
- Responsive layouts.
- Accessible components: semantic markup, ARIA attributes, keyboard-friendly.
- Provide skeletons for loading states.
- Optional minimal i18n (English/Spanish).

---

## 9. Testing Expectations
Use **Vitest or Jest** + **Testing Library**.

### Unit tests:
- Director aggregator:
  - duplicates
  - trimming
  - casing differences
  - unexpected values
- API utilities
- Data mappers/DTOs

### Component tests:
- Directors screen:
  - loading / error / empty / success
  - validation behavior
  - accessibility (roles, labels, keyboard)
- Movies explorer:
  - pagination behavior
  - filtering logic
  - modal/drawer behavior### Unit tests:
- Director aggregator (pure function):
  - duplicates
  - trimming
  - casing differences
  - unexpected values (null, undefined, empty, malformed)
  - multi-page inputs
  - alphabetical sorting
- API utilities (`/core/api/moviesApi.ts`):
  - successful fetch
  - network error handling
  - request cancellation
  - request deduplication
  - correct parsing of pagination fields
- Data mappers/DTOs:
  - normalization of fields
  - handling of missing/invalid values
  - consistent output types

### Component tests:
- Directors screen:
  - loading / error / empty / success states
  - validation behavior (numeric, non-numeric, threshold < 0)
  - no API call on invalid input
  - accessibility (roles, labels, keyboard navigation, focus)
- Movies explorer:
  - pagination behavior (next/prev, incremental loading)
  - filtering logic (title, year range, genre multi-select, director autocomplete)
  - modal/drawer behavior (open/close, metadata shown, role="dialog")
  - loading / error states

---

## 10. Copilot Behavioral Rules
- Always follow the folder architecture above.
- Prefer generating:
  - reusable hooks
  - pure functions
  - typed service-layer functions
  - clean UI components with proper states
- Avoid logic inside components.
- Suggest tests together with features when appropriate.
- Avoid unused abstractions and over-engineering.
- Prefer clarity, type safety, and maintainability.

---
