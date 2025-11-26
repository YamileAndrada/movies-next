# Core API Layer

Central API layer for all HTTP requests to the Movies API.

## Purpose

**ALL API calls MUST go through this layer.** No direct fetch calls in features.

## Files

### `moviesApi.ts`

Main API module with all movie-related endpoints.

**Functions:**

#### `fetchMoviesPage(page: number, signal?: AbortSignal): Promise<MoviesResponse>`
Fetches a single page of movies.

#### `fetchAllMovies(signal?: AbortSignal): Promise<Movie[]>`
Fetches all pages and returns complete movie list.

**Features:**
- Request cancellation with AbortController
- Request deduplication (prevent duplicate simultaneous calls)
- Error handling with typed errors
- Retry logic (optional)
- Request/response logging (dev mode)

## Types

```typescript
type MoviesResponse = {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  data: Movie[];
};

type Movie = {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
};
```

## API Endpoint

```
GET https://challenge.iugolabs.com/api/movies/search?page=<page>
```

## Guidelines

- Use AbortController for cancellable requests
- Implement request deduplication to avoid redundant calls
- Type all responses with TypeScript
- Handle network errors gracefully
- Log errors for debugging
- Consider rate limiting if needed

## Testing Requirements

- Successful fetch test
- Network error handling
- Request cancellation
- Request deduplication
- Correct pagination field parsing
- Multiple page fetching (fetchAllMovies)
