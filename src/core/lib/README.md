# Core Library

Shared utilities, helpers, and data transformation functions.

## Purpose

Reusable utility functions used across features.

## Suggested Files

### `movieMapper.ts`
Data transformation functions for movie objects.

```typescript
// Normalize movie data
normalizeMovie(movie: Movie): NormalizedMovie

// Safe access to movie fields
getMovieYear(movie: Movie): number | null
getMovieGenres(movie: Movie): string[]
```

### `validators.ts`
Input validation functions.

```typescript
isValidThreshold(value: unknown): boolean
isValidYear(year: unknown): boolean
```

### `formatters.ts`
Data formatting utilities.

```typescript
formatMovieRuntime(runtime: string): string
formatMovieYear(year: string): number
```

### `debounce.ts`
Debounce utility for text inputs.

```typescript
function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void
```

### `errors.ts`
Custom error classes.

```typescript
class ApiError extends Error
class ValidationError extends Error
```

## Guidelines

- **Pure functions** - no side effects
- **Well-typed** - TypeScript with proper generics
- **Tested** - unit tests for all utilities
- **Documented** - JSDoc comments
- **Small and focused** - single responsibility

## Testing

All utilities in this folder must have unit tests covering:
- Happy path
- Edge cases
- Error cases
- Type safety
