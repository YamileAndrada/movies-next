import type { Movie } from "@/core/api/types";
import { parseCommaSeparated, normalizeDirectorName } from "@/core/lib";

/**
 * Director with movie count
 */
export interface DirectorCount {
  name: string;
  count: number;
}

/**
 * Aggregates directors by movie count and filters by threshold
 *
 * @param movies - Array of movies to aggregate
 * @param threshold - Minimum movie count (directors must have STRICTLY MORE than this)
 * @returns Array of directors with count > threshold, sorted alphabetically
 *
 * @example
 * ```typescript
 * const directors = aggregateDirectors(movies, 5);
 * // Returns directors with > 5 movies, sorted A-Z
 * // [
 * //   { name: "Christopher Nolan", count: 8 },
 * //   { name: "Quentin Tarantino", count: 6 }
 * // ]
 * ```
 */
export function aggregateDirectors(
  movies: Movie[],
  threshold: number
): DirectorCount[] {
  // Handle edge cases
  if (!movies || movies.length === 0) {
    return [];
  }

  // Requirement: threshold < 0 should return empty list (no error)
  if (threshold < 0) {
    return [];
  }

  // Aggregate movie counts per director
  // Map: normalized name -> { original name, count }
  const directorMap = new Map<
    string,
    { originalName: string; count: number }
  >();

  movies.forEach((movie) => {
    const directors = parseCommaSeparated(movie.Director);

    directors.forEach((director) => {
      const normalized = normalizeDirectorName(director);

      // Skip empty directors
      if (!normalized) {
        return;
      }

      const existing = directorMap.get(normalized);

      if (existing) {
        // Increment count
        existing.count += 1;
      } else {
        // Add new director (keep original casing)
        directorMap.set(normalized, {
          originalName: director.trim(),
          count: 1,
        });
      }
    });
  });

  // Filter by threshold (STRICTLY greater than)
  // Convert to DirectorCount array
  const result: DirectorCount[] = [];

  directorMap.forEach((value) => {
    if (value.count > threshold) {
      result.push({
        name: value.originalName,
        count: value.count,
      });
    }
  });

  // Sort alphabetically by name (case-insensitive)
  result.sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
  );

  return result;
}
