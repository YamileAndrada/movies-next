/**
 * Movie data structure from the API
 */
export interface Movie {
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

/**
 * API response structure for paginated movies
 */
export interface MoviesResponse {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  data: Movie[];
}

/**
 * Custom error types for API operations
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class NetworkError extends ApiError {
  constructor(message: string, originalError?: unknown) {
    super(message, undefined, originalError);
    this.name = "NetworkError";
  }
}

export class ValidationError extends ApiError {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class AbortError extends ApiError {
  constructor(message = "Request was cancelled") {
    super(message);
    this.name = "AbortError";
  }
}
