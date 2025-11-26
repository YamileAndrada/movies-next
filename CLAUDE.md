# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Next.js 14/15 + TypeScript application for movie search and director analysis. The app fetches movie data from a single API endpoint and provides:
- Director aggregation by movie count threshold
- Movie explorer with filtering and pagination

## Tech Stack
- Next.js 14/15 with App Router (or Pages Router)
- TypeScript (strict mode)
- ESLint + Prettier for code quality

## API Integration
Single backend endpoint:
```
GET https://challenge.iugolabs.com/api/movies/search?page=<page>
```

Response structure: `page`, `per_page`, `total`, `total_pages`, `data[]`

Movie fields: `Title, Year, Rated, Released, Runtime, Genre, Director, Writer, Actors`

**Critical constraint**: No director-specific endpoint exists. All director aggregation must be done client-side by fetching and processing all movie pages.

## Architecture

### Feature-Based Structure
```
/features
  /directors
    components/
    hooks/
    aggregators/
    pages or routes/
    tests/
  /movies
    components/
    hooks/
    filters/
    pages or routes/
    tests/

/core
  /api         # API layer (moviesApi.ts)
  /lib         # shared utilities, mappers, helpers
  /ui          # shared UI components
```

### Core Principles
- All API calls MUST go through `/core/api/moviesApi.ts`
- Implement pagination helpers and request cancellation in the API layer
- Use mappers/DTOs to normalize movie data
- Keep components focused on rendering only - no business logic
- Move logic into services, hooks, or pure functions

## Key Custom Hooks

### `useMoviesSearch()`
Handles paging, filters, memoization, and optional caching (React Query/SWR).

### `usePaginatedMovies()`
For incremental loading and virtual scrolling scenarios.

### `useDirectorsAggregation()`
Fetches all pages, aggregates directors, applies threshold filtering.

All hooks must handle:
- loading / error / empty states
- request cancellation
- memoization
- stable dependencies

## Feature Requirements

### Directors by Threshold
- Input validation:
  - Non-numeric → form error (no API request)
  - Negative values → empty result
- On "Calculate":
  - Fetch all pages from API
  - Aggregate movie count per director
  - Filter directors **strictly above** threshold
  - Sort alphabetically
- UI states: loading skeleton, error message, empty state, success
- Full accessibility support

### Movies Explorer
- Table/grid with pagination or virtual scrolling
- Filters: title (text), year range, genre (multi-select), director (autocomplete)
- Incremental loading by pages
- Movie details in modal/drawer

## Performance Requirements
- Deduplicate API requests
- Cancel requests when threshold or filters change
- Memoize expensive computations and callbacks
- Code-splitting and lazy-loading per feature
- Virtualized lists for large datasets (consider TanStack Table)

## Error Handling
- Each feature should have its own Error Boundary
- Display user-friendly error messages
- Fail gracefully on network or parsing issues

## Testing Strategy
Use Vitest or Jest + Testing Library.

### Unit Tests
- Director aggregator: test duplicates, trimming, casing, edge cases
- API utilities and data mappers

### Component Tests
- Directors screen: loading/error/empty/success states, validation, accessibility
- Movies explorer: pagination, filtering, modal behavior
- Verify ARIA roles, labels, keyboard navigation

## Development Guidelines
- Use strict TypeScript
- Follow ESLint + Prettier formatting
- Keep components small and focused
- Prefer reusable hooks and pure functions
- Avoid logic inside components
- Ensure responsive layouts
- Implement semantic HTML with proper ARIA attributes
- Avoid unused abstractions and over-engineering
