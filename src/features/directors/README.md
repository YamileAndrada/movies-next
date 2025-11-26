# Directors Feature

This feature implements the "Directors by Threshold" functionality.

## Purpose

Allows users to search for directors who have directed more than a specified number of movies by:
1. Accepting a threshold input (integer ≥ 0)
2. Fetching all movie pages from the API
3. Aggregating movies by director
4. Filtering directors with movie count strictly above the threshold
5. Displaying results alphabetically sorted

## Structure

- **components/** - UI components for the directors threshold form and results display
- **hooks/** - Custom React hooks like `useDirectorsAggregation` ✅ Implemented
- **aggregators/** - Pure functions for director aggregation logic ✅ Implemented
- **tests/** - Unit and component tests for this feature

## Files

### `aggregators/directorsAggregator.ts` ✅ Implemented

Pure function for aggregating directors by movie count.

**Main Function:**

#### `aggregateDirectors(movies: Movie[], threshold: number): DirectorCount[]`

Aggregates directors and filters by threshold (strictly greater than).

**Behavior:**
- Counts movies per director (case-insensitive, trimmed)
- Handles comma-separated directors in a single movie
- Filters directors with count > threshold (strictly greater)
- Sorts alphabetically (case-insensitive)
- Preserves original name casing from first occurrence

**Type:**
```typescript
interface DirectorCount {
  name: string;
  count: number;
}
```

**Example:**
```typescript
import { aggregateDirectors } from '@/features/directors/aggregators';

const movies = [...]; // Array of Movie objects
const directors = aggregateDirectors(movies, 5);
// Returns directors with > 5 movies, sorted A-Z
// [
//   { name: "Christopher Nolan", count: 8 },
//   { name: "Quentin Tarantino", count: 6 }
// ]
```

**Edge Cases Handled:**
- Empty movie array → returns []
- Null/undefined/empty directors → skipped
- Case-insensitive deduplication ("Nolan" === "NOLAN")
- Whitespace trimming and normalization
- Negative threshold → returns all directors
- Exact threshold match → NOT included (strictly greater)

**Tests:** 19 tests covering all edge cases ✅

---

### `hooks/useDirectorsAggregation.ts` ✅ Implemented

React hook for fetching and aggregating directors with threshold filtering.

**Main Hook:**

#### `useDirectorsAggregation(threshold: number): UseDirectorsAggregationResult`

Fetches all movies and aggregates directors by threshold.

**Behavior:**
- Validates threshold (must be a finite number)
- Fetches all movies using `fetchAllMovies()`
- Aggregates using `aggregateDirectors()`
- Cancels previous request when threshold changes
- Returns loading/error/data states
- Memoizes results (re-runs only when threshold changes)

**Return Type:**
```typescript
interface UseDirectorsAggregationResult {
  directors: DirectorCount[];
  loading: boolean;
  error: ApiError | null;
}
```

**Example:**
```typescript
import { useDirectorsAggregation } from '@/features/directors/hooks';

function DirectorsPage() {
  const [threshold, setThreshold] = useState(5);
  const { directors, loading, error } = useDirectorsAggregation(threshold);

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorMessage error={error} />;
  if (directors.length === 0) return <EmptyState />;

  return <DirectorsList directors={directors} />;
}
```

**Features:**
- ✅ Request cancellation with AbortController
- ✅ Automatic cleanup on unmount
- ✅ No state updates after unmount
- ✅ Validates threshold (rejects NaN, Infinity)
- ✅ Memoization via useEffect dependency array

**Edge Cases Handled:**
- Invalid threshold (NaN, Infinity) → no API call, empty result
- Request cancelled → no state update
- Component unmounted → request cancelled, no state update
- API error → sets error state, clears directors
- Empty movie list → returns empty directors array

**Tests:** 17 tests covering all scenarios ✅

---

## Key Requirements

- Input validation (non-numeric shows error, negative shows empty result)
- Loading, error, empty, and success UI states
- Full accessibility support (ARIA labels, keyboard navigation)
- Request cancellation when threshold changes
