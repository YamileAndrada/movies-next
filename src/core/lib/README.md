# Core Library

Shared utilities, helpers, and data transformation functions.

## Purpose

Reusable utility functions used across features.

## Files

### `movieMapper.ts` ✅ Implemented

Data transformation functions for movie objects.

**Main Functions:**

#### `normalizeMovie(movie: Movie): NormalizedMovie`
Normalizes a movie object with clean, consistent values.
- Trims whitespace
- Parses numeric values (year, runtime)
- Splits comma-separated values into arrays
- Handles null/undefined/empty values

```typescript
const normalized = normalizeMovie(movie);
// {
//   title: "The Matrix",
//   year: 1999,
//   runtime: 136,
//   genres: ["Action", "Sci-Fi"],
//   directors: ["Lana Wachowski", "Lilly Wachowski"],
//   ...
// }
```

#### `parseYear(yearStr: string): number | null`
Parses year from string, handles ranges and N/A.

#### `parseRuntime(runtimeStr: string): number | null`
Parses runtime to minutes. Handles "136 min", "2h 16min", etc.

#### `parseCommaSeparated(value: string): string[]`
Splits comma-separated values, trims, filters empty.

#### `normalizeDirectorName(director: string): string`
Normalizes director name for comparison (lowercase, single spaces).

#### `movieMatchesQuery(movie: Movie, query: string): boolean`
Checks if movie matches search query (case-insensitive).

#### `getUniqueDirectors(movies: Movie[]): string[]`
Extracts unique directors, deduplicated (case-insensitive), sorted.

#### `getUniqueGenres(movies: Movie[]): string[]`
Extracts unique genres, deduplicated (case-insensitive), sorted.

#### `getYearRange(movies: Movie[]): { min: number; max: number } | null`
Gets year range from movie list.

**Types:**

```typescript
interface NormalizedMovie {
  title: string;
  year: number | null;
  rated: string;
  released: string;
  runtime: number | null; // in minutes
  genres: string[];
  directors: string[];
  writers: string[];
  actors: string[];
  original: Movie; // Keep original data
}
```

**Usage:**

```typescript
import { normalizeMovie, getUniqueDirectors } from '@/core/lib/movieMapper';

// Normalize single movie
const normalized = normalizeMovie(movie);
console.log(normalized.genres); // ["Action", "Sci-Fi"]

// Get unique directors
const directors = getUniqueDirectors(movies);
console.log(directors); // ["Christopher Nolan", "Quentin Tarantino"]
```

**Tests:** 47 tests covering all edge cases ✅

---

## Future Utilities

### `validators.ts` (Not yet implemented)
Input validation functions.

```typescript
isValidThreshold(value: unknown): boolean
isValidYear(year: unknown): boolean
isValidPageNumber(page: unknown): boolean
```

### `formatters.ts` (Not yet implemented)
Data formatting utilities.

```typescript
formatRuntime(minutes: number): string // "2h 16min"
formatYear(year: number): string
formatDate(dateStr: string): string
```

### `debounce.ts` (Not yet implemented)
Debounce utility for text inputs.

```typescript
function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void
```

---

## Guidelines

- **Pure functions** - no side effects
- **Well-typed** - TypeScript with proper generics
- **Tested** - unit tests for all utilities
- **Documented** - JSDoc comments
- **Small and focused** - single responsibility

## Testing

All utilities in this folder must have unit tests covering:
- ✅ Happy path
- ✅ Edge cases (null, undefined, empty strings)
- ✅ Invalid inputs
- ✅ Boundary conditions
- ✅ Type safety

Run tests:
```bash
npm run test src/core/lib/
```

## Best Practices

1. **Always handle null/undefined**
   ```typescript
   // ✅ Good
   export function safeString(value: unknown): string {
     if (value === null || value === undefined) return "";
     return String(value).trim();
   }

   // ❌ Bad
   export function getString(value: string): string {
     return value.trim(); // Crashes on null
   }
   ```

2. **Use TypeScript generics when appropriate**
   ```typescript
   // ✅ Good
   function debounce<T extends (...args: any[]) => any>(
     fn: T,
     delay: number
   ): (...args: Parameters<T>) => void
   ```

3. **Document with JSDoc**
   ```typescript
   /**
    * Parses year from string to number
    * @param yearStr - Year string from API
    * @returns Year as number or null if invalid
    */
   export function parseYear(yearStr: string): number | null
   ```

4. **Write comprehensive tests**
   - Test with valid inputs
   - Test with invalid inputs (null, undefined, empty, malformed)
   - Test edge cases
   - Test boundary conditions
