/**
 * Core API module - Central export point for all API functions and types
 */

export {
  fetchMoviesPage,
  fetchAllMovies,
  cancelAllRequests,
  getInflightRequestCount,
} from "./moviesApi";

export type { Movie, MoviesResponse } from "./types";

export {
  ApiError,
  NetworkError,
  ValidationError,
  AbortError,
} from "./types";
