# Movies Filters

Filter logic and utilities for the Movies feature.

## Purpose

Pure functions and utilities for filtering movie data.

## Functions

### `filterMovies(movies: Movie[], filters: MovieFilters): Movie[]`

Applies all filters to a movie list.

### `filterByTitle(movies: Movie[], title: string): Movie[]`

Case-insensitive title search.

### `filterByYearRange(movies: Movie[], from?: number, to?: number): Movie[]`

Filters movies within year range (inclusive).

### `filterByGenres(movies: Movie[], genres: string[]): Movie[]`

Filters movies that match ANY of the selected genres.

### `filterByDirector(movies: Movie[], director: string): Movie[]`

Filters movies by director name (case-insensitive).

### `extractUniqueGenres(movies: Movie[]): string[]`

Extracts unique genres from loaded movies for multi-select.

### `extractUniqueDirectors(movies: Movie[]): string[]`

Extracts unique directors for autocomplete.

## Guidelines

- **Pure functions only** - no side effects
- Well-typed with TypeScript
- Handle edge cases (null values, empty strings)
- Efficient algorithms for large datasets
- Unit tested thoroughly

## Types

```typescript
type MovieFilters = {
  title?: string;
  yearFrom?: number;
  yearTo?: number;
  genres?: string[];
  director?: string;
};
```
