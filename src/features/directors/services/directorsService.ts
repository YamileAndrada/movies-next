import { fetchAllMovies } from "@/core/api/moviesApi";
import { aggregateDirectors, type DirectorCount } from "../aggregators";

/**
 * Directors Service
 *
 * Service layer that coordinates API calls and business logic for directors feature.
 * Provides clean separation between data fetching, business logic, and UI state.
 */
export const directorsService = {
  /**
   * Get directors filtered by minimum movie count threshold
   *
   * @param threshold - Minimum number of movies (directors must have > threshold)
   * @param signal - Optional AbortSignal for request cancellation
   * @returns Array of directors with movie counts above threshold, sorted alphabetically
   *
   * @throws {ApiError} If API request fails
   *
   * @example
   * ```typescript
   * const directors = await directorsService.getByThreshold(5);
   * // Returns directors with more than 5 movies
   * ```
   */
  async getByThreshold(
    threshold: number,
    signal?: AbortSignal
  ): Promise<DirectorCount[]> {
    // Validate threshold
    if (!Number.isFinite(threshold)) {
      throw new Error("Threshold must be a finite number");
    }

    // Fetch all movies from API
    const movies = await fetchAllMovies(signal);

    // Apply business logic (aggregation and filtering)
    const directors = aggregateDirectors(movies, threshold);

    return directors;
  },
};
