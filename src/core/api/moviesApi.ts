import {
  Movie,
  MoviesResponse,
  ApiError,
  NetworkError,
  ValidationError,
  AbortError,
} from "./types";

const API_BASE_URL = "https://challenge.iugolabs.com/api/movies/search";

/**
 * Cache for in-flight requests to prevent duplicate calls
 * Key: page number, Value: Promise<MoviesResponse>
 */
const inflightRequests = new Map<number, Promise<MoviesResponse>>();

/**
 * Fetches a single page of movies from the API
 *
 * @param page - Page number to fetch (1-indexed)
 * @param signal - Optional AbortSignal for request cancellation
 * @returns Promise resolving to MoviesResponse
 * @throws {ValidationError} If page number is invalid
 * @throws {NetworkError} If network request fails
 * @throws {ApiError} If API returns error status
 * @throws {AbortError} If request is cancelled
 */
export async function fetchMoviesPage(
  page: number,
  signal?: AbortSignal
): Promise<MoviesResponse> {
  // Validate page number
  if (!Number.isInteger(page) || page < 1) {
    throw new ValidationError(`Invalid page number: ${page}. Must be >= 1`);
  }

  // Check if request is already in flight (deduplication)
  const existingRequest = inflightRequests.get(page);
  if (existingRequest) {
    return existingRequest;
  }

  // Create new request
  const requestPromise = (async () => {
    try {
      const url = `${API_BASE_URL}?page=${page}`;

      const response = await fetch(url, {
        signal,
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Handle non-OK responses
      if (!response.ok) {
        throw new ApiError(
          `API request failed: ${response.statusText}`,
          response.status
        );
      }

      const data: MoviesResponse = await response.json();

      // Validate response structure
      if (!data || typeof data !== "object") {
        throw new ApiError("Invalid response format from API");
      }

      if (!Array.isArray(data.data)) {
        throw new ApiError("Invalid response: missing or invalid 'data' array");
      }

      return data;
    } catch (error) {
      // Handle AbortError (DOMException or Error with name AbortError)
      if (
        error instanceof DOMException &&
        error.name === "AbortError"
      ) {
        throw new AbortError();
      }

      if (error instanceof Error && error.name === "AbortError") {
        throw new AbortError();
      }

      // Handle network errors
      if (error instanceof TypeError) {
        throw new NetworkError("Network request failed", error);
      }

      // Re-throw custom errors
      if (error instanceof ApiError) {
        throw error;
      }

      // Wrap unknown errors
      throw new ApiError(
        "Unexpected error during API request",
        undefined,
        error
      );
    } finally {
      // Clean up in-flight request
      inflightRequests.delete(page);
    }
  })();

  // Store in-flight request for deduplication
  inflightRequests.set(page, requestPromise);

  return requestPromise;
}

/**
 * Fetches all movies from all available pages
 *
 * @param signal - Optional AbortSignal for request cancellation
 * @returns Promise resolving to array of all movies
 * @throws {NetworkError} If network request fails
 * @throws {ApiError} If API returns error status
 * @throws {AbortError} If request is cancelled
 */
export async function fetchAllMovies(signal?: AbortSignal): Promise<Movie[]> {
  // Fetch first page to get total pages
  const firstPage = await fetchMoviesPage(1, signal);

  const { total_pages } = firstPage;
  const allMovies: Movie[] = [...firstPage.data];

  // If only one page, return immediately
  if (total_pages <= 1) {
    return allMovies;
  }

  // Fetch remaining pages in parallel
  const pagePromises: Promise<MoviesResponse>[] = [];

  for (let page = 2; page <= total_pages; page++) {
    pagePromises.push(fetchMoviesPage(page, signal));
  }

  try {
    const responses = await Promise.all(pagePromises);

    // Collect all movies from all pages
    for (const response of responses) {
      allMovies.push(...response.data);
    }

    return allMovies;
  } catch (error) {
    // If any request fails or is cancelled, throw the error
    throw error;
  }
}

/**
 * Cancels all in-flight requests
 * Useful for cleanup when component unmounts or filters change
 */
export function cancelAllRequests(): void {
  inflightRequests.clear();
}

/**
 * Gets the number of currently in-flight requests
 * Useful for debugging and testing
 */
export function getInflightRequestCount(): number {
  return inflightRequests.size;
}
