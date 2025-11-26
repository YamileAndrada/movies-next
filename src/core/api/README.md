# Core API Layer

Central API layer for all HTTP requests to the Movies API.

## Purpose

**ALL API calls MUST go through this layer.** No direct fetch calls in features.

## Files Structure

```
/src/core/api/
├── index.ts           # Main export point
├── moviesApi.ts       # API functions implementation
├── types.ts           # TypeScript types and error classes
├── moviesApi.test.ts  # Comprehensive API tests
└── README.md          # This file
```

## Usage

### Import from index

```typescript
import { fetchMoviesPage, fetchAllMovies, type Movie } from '@/core/api';
```

### Fetch a Single Page

```typescript
import { fetchMoviesPage } from '@/core/api';

async function loadPage() {
  try {
    const response = await fetchMoviesPage(1);
    console.log(response.data); // Movie[]
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error('Invalid page number');
    } else if (error instanceof NetworkError) {
      console.error('Network failure');
    }
  }
}
```

### Fetch All Movies

```typescript
import { fetchAllMovies } from '@/core/api';

async function loadAllMovies() {
  try {
    const movies = await fetchAllMovies();
    console.log(`Loaded ${movies.length} movies`);
  } catch (error) {
    console.error('Failed to load movies', error);
  }
}
```

### Request Cancellation

```typescript
import { fetchMoviesPage } from '@/core/api';

const controller = new AbortController();

// Start request
fetchMoviesPage(1, controller.signal)
  .then(data => console.log(data))
  .catch(error => {
    if (error instanceof AbortError) {
      console.log('Request was cancelled');
    }
  });

// Cancel request
controller.abort();
```

## API Functions

### `fetchMoviesPage(page: number, signal?: AbortSignal): Promise<MoviesResponse>`

Fetches a single page of movies from the API.

**Parameters:**
- `page` - Page number (1-indexed, must be integer >= 1)
- `signal` - Optional AbortSignal for request cancellation

**Returns:** Promise<MoviesResponse>

**Throws:**
- `ValidationError` - Invalid page number
- `NetworkError` - Network request failed
- `ApiError` - API returned error status
- `AbortError` - Request was cancelled

**Features:**
- ✅ Request deduplication (multiple simultaneous calls to same page → single request)
- ✅ Automatic cleanup of in-flight requests
- ✅ Response validation

### `fetchAllMovies(signal?: AbortSignal): Promise<Movie[]>`

Fetches all movies from all available pages.

**Parameters:**
- `signal` - Optional AbortSignal for request cancellation

**Returns:** Promise<Movie[]>

**Throws:**
- `NetworkError` - Network request failed
- `ApiError` - API returned error status
- `AbortError` - Request was cancelled

**How it works:**
1. Fetches first page to get `total_pages`
2. Fetches remaining pages in parallel
3. Combines all movies into single array

### `cancelAllRequests(): void`

Cancels all in-flight requests. Useful for cleanup when component unmounts.

### `getInflightRequestCount(): number`

Returns the number of currently in-flight requests. Useful for debugging.

## Types

### Movie

```typescript
interface Movie {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
}
```

### MoviesResponse

```typescript
interface MoviesResponse {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  data: Movie[];
}
```

## Error Types

All errors extend `ApiError`:

### `ApiError`
Base error class for API operations.
- `message: string`
- `statusCode?: number`
- `originalError?: unknown`

### `NetworkError extends ApiError`
Thrown when network request fails (no connection, timeout, etc.)

### `ValidationError extends ApiError`
Thrown when input validation fails (invalid page number, etc.)

### `AbortError extends ApiError`
Thrown when request is cancelled via AbortSignal.

## API Endpoint

```
GET https://challenge.iugolabs.com/api/movies/search?page=<page>
```

**Response format:**
```json
{
  "page": 1,
  "per_page": 10,
  "total": 100,
  "total_pages": 10,
  "data": [
    {
      "Title": "The Matrix",
      "Year": "1999",
      "Rated": "R",
      "Released": "31 Mar 1999",
      "Runtime": "136 min",
      "Genre": "Action, Sci-Fi",
      "Director": "Lana Wachowski, Lilly Wachowski",
      "Writer": "Lilly Wachowski, Lana Wachowski",
      "Actors": "Keanu Reeves, Laurence Fishburne"
    }
  ]
}
```

## Request Deduplication

The API layer automatically deduplicates simultaneous requests to the same page:

```typescript
// All three calls will result in only ONE network request
const [a, b, c] = await Promise.all([
  fetchMoviesPage(1),
  fetchMoviesPage(1),
  fetchMoviesPage(1),
]);

console.log(a === b); // Same reference
```

**Benefits:**
- Reduces unnecessary network traffic
- Prevents race conditions
- Improves performance

**How it works:**
- In-flight requests are stored in a Map
- Subsequent requests to the same page return the existing Promise
- Request is removed from Map after completion

## Testing

Run API tests:
```bash
npm run test src/core/api/moviesApi.test.ts
```

**Test coverage:**
- ✅ Successful fetch
- ✅ Error handling (network, API, validation)
- ✅ Request cancellation
- ✅ Request deduplication
- ✅ Multiple page fetching
- ✅ Empty responses
- ✅ Malformed responses

## Best Practices

1. **Always use AbortSignal in React components**
   ```typescript
   useEffect(() => {
     const controller = new AbortController();

     fetchMoviesPage(1, controller.signal);

     return () => controller.abort();
   }, []);
   ```

2. **Handle all error types**
   ```typescript
   try {
     const movies = await fetchAllMovies();
   } catch (error) {
     if (error instanceof ValidationError) {
       // Show validation error to user
     } else if (error instanceof NetworkError) {
       // Show "check your connection" message
     } else if (error instanceof AbortError) {
       // Request was cancelled, ignore
     } else {
       // Unknown error
     }
   }
   ```

3. **Use TypeScript types**
   ```typescript
   import type { Movie, MoviesResponse } from '@/core/api';

   const movies: Movie[] = [];
   ```

## Troubleshooting

### Request not being cancelled
Make sure you're passing the AbortSignal:
```typescript
const controller = new AbortController();
await fetchMoviesPage(1, controller.signal); // ✅ Correct
await fetchMoviesPage(1); // ❌ Signal not passed
```

### Duplicate requests not being deduplicated
Check that requests are made simultaneously (in parallel):
```typescript
// ✅ Deduplicated
await Promise.all([fetchMoviesPage(1), fetchMoviesPage(1)]);

// ❌ Not deduplicated (sequential)
await fetchMoviesPage(1);
await fetchMoviesPage(1);
```

### TypeScript errors
Make sure you're importing from the index:
```typescript
import { Movie } from '@/core/api'; // ✅
import { Movie } from '@/core/api/types'; // ❌ Don't import directly
```
