import { fetchAllMovies } from "@/core/api/moviesApi";
import { normalizeMovie, type NormalizedMovie } from "@/core/lib";
import { filterMovies, paginate, type PaginatedResult } from "../filters";
import type { MoviesSearchFilters } from "../hooks/useMoviesSearch";

/**
 * Movies Service
 *
 * Service layer that coordinates API calls, data transformation, filtering, and pagination
 * for the movies feature. Provides clean separation between data fetching and UI state.
 */
export const moviesService = {
  /**
   * Search movies with filters and pagination
   *
   * @param filters - Search filters (title, year range, genres, director)
   * @param page - Page number (1-indexed)
   * @param itemsPerPage - Number of items per page (default: 10)
   * @returns Paginated result with movies and metadata
   *
   * @throws {ApiError} If API request fails
   *
   * @example
   * ```typescript
   * const result = await moviesService.search(
   *   { title: "Matrix", yearFrom: 1999 },
   *   1,
   *   10
   * );
   * // Returns { items: [...], totalPages: 2, currentPage: 1, totalItems: 15 }
   * ```
   */
  async search(
    filters: MoviesSearchFilters,
    page: number = 1,
    itemsPerPage: number = 10
  ): Promise<PaginatedResult<NormalizedMovie>> {
    // Fetch all movies from API
    const rawMovies = await fetchAllMovies();

    // Normalize movies (transform API data to domain model)
    const normalizedMovies = rawMovies.map(normalizeMovie);

    // Apply filters (business logic)
    const filteredMovies = filterMovies(normalizedMovies, filters);

    // Apply pagination
    const result = paginate(filteredMovies, { page, itemsPerPage });

    return result;
  },

  /**
   * Get all movies without filters or pagination
   *
   * @returns Array of all normalized movies
   *
   * @throws {ApiError} If API request fails
   *
   * @example
   * ```typescript
   * const movies = await moviesService.getAll();
   * ```
   */
  async getAll(): Promise<NormalizedMovie[]> {
    const rawMovies = await fetchAllMovies();
    return rawMovies.map(normalizeMovie);
  },
};
