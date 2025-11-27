import { normalizeMovie, removeAccents, type NormalizedMovie } from "@/core/lib";
import type { MoviesSearchFilters } from "../hooks/useMoviesSearch";

/**
 * Check if a movie matches the given filters
 *
 * @param movie - Normalized movie to check
 * @param filters - Search filters to apply
 * @returns true if movie matches all filters
 */
export function matchesFilters(
  movie: NormalizedMovie,
  filters: MoviesSearchFilters
): boolean {
  // Title filter (case-insensitive, partial match, accent-insensitive)
  if (filters.title) {
    const normalizedTitle = removeAccents(movie.title.toLowerCase());
    const normalizedFilter = removeAccents(filters.title.toLowerCase().trim());
    if (!normalizedTitle.includes(normalizedFilter)) {
      return false;
    }
  }

  // Year from filter
  if (filters.yearFrom !== undefined && movie.year !== null) {
    if (movie.year < filters.yearFrom) {
      return false;
    }
  }

  // Year to filter
  if (filters.yearTo !== undefined && movie.year !== null) {
    if (movie.year > filters.yearTo) {
      return false;
    }
  }

  // Genres filter (movie must have at least one of the selected genres)
  if (filters.genres && filters.genres.length > 0) {
    const hasMatchingGenre = filters.genres.some((filterGenre) =>
      movie.genres.some(
        (movieGenre) =>
          removeAccents(movieGenre.toLowerCase()) ===
          removeAccents(filterGenre.toLowerCase())
      )
    );
    if (!hasMatchingGenre) {
      return false;
    }
  }

  // Director filter (accent-insensitive, case-insensitive, partial match)
  if (filters.director) {
    const normalizedFilter = removeAccents(filters.director.toLowerCase());
    const hasMatchingDirector = movie.directors.some((director) => {
      const normalizedDirector = removeAccents(director.toLowerCase());
      return normalizedDirector.includes(normalizedFilter);
    });
    if (!hasMatchingDirector) {
      return false;
    }
  }

  return true;
}

/**
 * Apply filters to a list of movies
 *
 * @param movies - Array of movies to filter
 * @param filters - Search filters to apply
 * @returns Filtered array of movies
 */
export function filterMovies(
  movies: NormalizedMovie[],
  filters: MoviesSearchFilters
): NormalizedMovie[] {
  return movies.filter((movie) => matchesFilters(movie, filters));
}

/**
 * Pagination configuration
 */
export interface PaginationConfig {
  page: number;
  itemsPerPage: number;
}

/**
 * Paginated result
 */
export interface PaginatedResult<T> {
  items: T[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
}

/**
 * Apply pagination to a list of items
 *
 * @param items - Array of items to paginate
 * @param config - Pagination configuration
 * @returns Paginated result with items and metadata
 */
export function paginate<T>(
  items: T[],
  config: PaginationConfig
): PaginatedResult<T> {
  const { page, itemsPerPage } = config;
  const validPage = typeof page === "number" && page >= 1 ? page : 1;

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIdx = (validPage - 1) * itemsPerPage;
  const paginatedItems = items.slice(startIdx, startIdx + itemsPerPage);

  return {
    items: paginatedItems,
    totalPages,
    currentPage: validPage,
    totalItems: items.length,
  };
}
