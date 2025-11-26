# Movies Hooks

Custom React hooks for the Movies feature.

## Hooks

### `useMoviesSearch(filters, page)`

Main hook for fetching filtered and paginated movies.

**Parameters:**
```typescript
filters: {
  title?: string;
  yearFrom?: number;
  yearTo?: number;
  genres?: string[];
  director?: string;
}
page: number
```

**Returns:**
```typescript
{
  movies: Movie[];
  loading: boolean;
  error: Error | null;
  totalPages: number;
  currentPage: number;
}
```

**Responsibilities:**
- Fetches movies by page
- Applies client-side filtering
- Handles loading and error states
- Cancels requests when filters change
- Memoizes results
- Optional: Integrates React Query/SWR for caching

### `usePaginatedMovies()`

Hook for incremental loading and virtual scrolling scenarios.

### `useMovieFilters()`

Hook for managing filter state and logic.

## Guidelines

- Implement request cancellation with AbortController
- Debounce text inputs (title filter)
- Memoize expensive computations
- Use stable callbacks with useCallback
- Consider React Query/SWR for advanced caching
