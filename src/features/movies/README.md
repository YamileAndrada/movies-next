# Movies Feature

This feature implements the "Explore Movies" functionality.

## Purpose

Provides a searchable, filterable movie explorer with:
1. Paginated table/grid display
2. Multiple filter options (title, year range, genre, director)
3. Incremental loading by pages
4. Detailed movie view in modal/drawer

## Structure

- **components/** - UI components for movies table, filters, and details modal
- **hooks/** - Custom React hooks like `useMoviesSearch` and `usePaginatedMovies` ✅ Implemented
- **filters/** - Filter logic and utilities
- **tests/** - Unit and component tests for this feature

## Files

### `components/MoviesFilters.tsx` ✅ Implemented

Comprehensive filter component for movies search with multiple input types.

**Props:**
```typescript
interface MoviesFiltersProps {
  filters: MoviesSearchFilters;
  onFiltersChange: (filters: MoviesSearchFilters) => void;
  availableGenres?: string[];
  availableDirectors?: string[];
  realtimeFiltering?: boolean;
  debounceMs?: number;
}
```

**Features:**
- ✅ Text input for title search (case-insensitive partial match)
- ✅ Number inputs for year range (from/to)
- ✅ Multi-select checkboxes for genres
- ✅ Autocomplete input for director with filtered suggestions
- ✅ Real-time filtering with debounce (300ms default)
- ✅ Optional "Apply Filters" button mode (when realtime disabled)
- ✅ "Clear all" button to reset all filters
- ✅ Complete accessibility (ARIA attributes, keyboard navigation)

**Example:**
```typescript
import { MoviesFilters } from '@/features/movies/components';

function MoviesPage() {
  const [filters, setFilters] = useState<MoviesSearchFilters>({});
  const { movies } = useMoviesSearch(filters, 1);

  return (
    <>
      <MoviesFilters
        filters={filters}
        onFiltersChange={setFilters}
        availableGenres={["Action", "Drama", "Comedy"]}
        availableDirectors={["Christopher Nolan", "Steven Spielberg"]}
        realtimeFiltering={true}
      />
      <MoviesList movies={movies} />
    </>
  );
}
```

**Tests:** 15 tests covering all input types, filtering modes, and accessibility ✅

---

### `hooks/useMoviesSearch.ts` ✅ Implemented

React hook for searching and filtering movies with incremental pagination.

**Main Hook:**

#### `useMoviesSearch(filters: MoviesSearchFilters, page: number): UseMoviesSearchResult`

Fetches movies page by page and applies client-side filtering.

**Parameters:**
- `filters`: Object with optional filters
  - `title?: string` - Case-insensitive partial match
  - `yearFrom?: number` - Minimum year (inclusive)
  - `yearTo?: number` - Maximum year (inclusive)
  - `genres?: string[]` - Array of genres (OR logic)
  - `director?: string` - Case-insensitive partial match
- `page`: Page number (1-indexed)

**Returns:**
```typescript
interface UseMoviesSearchResult {
  movies: NormalizedMovie[];
  loading: boolean;
  error: ApiError | null;
  totalPages: number;
  currentPage: number;
}
```

**Features:**
- ✅ Incremental loading (one page at a time, not all at once)
- ✅ Client-side filtering after fetching
- ✅ Request cancellation with AbortController
- ✅ Memoization via stable filter key
- ✅ Handles filter changes (cancels previous request)
- ✅ Handles page changes (cancels previous request)
- ✅ Normalized filter values for consistent memoization

**Example:**
```typescript
import { useMoviesSearch } from '@/features/movies/hooks';

function MoviesExplorer() {
  const [filters, setFilters] = useState({ title: "matrix" });
  const [page, setPage] = useState(1);

  const { movies, loading, error, totalPages } = useMoviesSearch(filters, page);

  if (loading) return <Loading />;
  if (error) return <Error message={error.message} />;

  return (
    <>
      <MoviesList movies={movies} />
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </>
  );
}
```

**Filter Behavior:**
- **Title**: Case-insensitive, partial match, trimmed
- **Year Range**: Both yearFrom and yearTo optional, inclusive
- **Genres**: OR logic (movie has ANY of selected genres), case-insensitive
- **Director**: Case-insensitive, partial match, searches all directors

**Memoization:**
- Normalizes filter values (lowercase, trim, sort)
- Creates stable key from normalized filters
- Prevents re-fetching when filter object reference changes but values are same
- Genre array order doesn't matter (sorted internally)

**Edge Cases Handled:**
- Invalid page number (< 1) → returns empty, no API call
- Empty filters → returns all movies from page
- No matches → returns empty array, preserves totalPages
- API errors → sets error state, clears movies

**Tests:** 23 tests covering all scenarios ✅

---

## Key Requirements

- Pagination or virtual scrolling support
- Filters: title (text), year range, genre (multi-select), director (autocomplete)
- Loading states with skeleton
- Error handling with user-friendly messages
- Modal/drawer with full movie metadata
- Accessibility (ARIA dialog, keyboard navigation, focus management)
