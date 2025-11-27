import { useMemo } from "react";
import useSWR from "swr";
import { fetchAllMovies } from "@/core/api/moviesApi";
import { normalizeMovie, type NormalizedMovie, removeAccents } from "@/core/lib";
import type { ApiError } from "@/core/api/types";

/**
 * Search filters for movies
 */
export interface MoviesSearchFilters {
  title?: string;
  yearFrom?: number;
  yearTo?: number;
  genres?: string[];
  director?: string;
}

/**
 * Result from useMoviesSearch hook
 */
export interface UseMoviesSearchResult {
  movies: NormalizedMovie[];
  loading: boolean;
  error: ApiError | null;
  totalPages: number;
  currentPage: number;
}

const ITEMS_PER_PAGE = 10;

/**
 * Hook for searching and filtering movies with pagination
 * Fetches all movies once, applies client-side filtering and pagination
 *
 * @param filters - Search filters (title, year range, genres, director)
 * @param page - Current page number (1-indexed)
 * @returns Object with movies array, loading state, error, and pagination info
 *
 * @example
 * ```typescript
 * function MoviesExplorer() {
 *   const [filters, setFilters] = useState({ title: "matrix" });
 *   const [page, setPage] = useState(1);
 *   const { movies, loading, error, totalPages } = useMoviesSearch(filters, page);
 *
 *   if (loading) return <Loading />;
 *   if (error) return <Error message={error.message} />;
 *   return <MoviesList movies={movies} />;
 * }
 * ```
 */
export function useMoviesSearch(
  filters: MoviesSearchFilters,
  page: number
): UseMoviesSearchResult {
  // Validate page number - ensure it's always a valid number
  const validPage = typeof page === 'number' && page >= 1 ? page : 1;

  // Fetch all movies once (cached by SWR)
  const { data: allMovies, error, isValidating } = useSWR(
    "all-movies",
    fetchAllMovies,
    {
      dedupingInterval: 30000, // Cache for 30 seconds
      revalidateOnFocus: false,
      errorRetryCount: 1,
    }
  );

  // Apply filters and pagination client-side
  const result = useMemo(() => {
    if (!allMovies) {
      return { movies: [], totalPages: 0 };
    }

    // Normalize and filter
    const normalized = allMovies.map(normalizeMovie);
    const filtered = normalized.filter((m) => matchesFilters(m, filters));

    // Calculate pagination
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const startIdx = (validPage - 1) * ITEMS_PER_PAGE;
    const endIdx = startIdx + ITEMS_PER_PAGE;
    const paginatedMovies = filtered.slice(startIdx, endIdx);

    return { movies: paginatedMovies, totalPages };
  }, [allMovies, filters, validPage]);

  return {
    movies: result.movies,
    loading: !!isValidating,
    error: (error as ApiError) ?? null,
    totalPages: result.totalPages,
    currentPage: validPage,
  };
}

/**
 * Checks if a movie matches the given filters
 */
function matchesFilters(
  movie: NormalizedMovie,
  filters: MoviesSearchFilters
): boolean {
  // Title filter (case-insensitive, partial match)
  if (filters.title) {
    const searchTitle = filters.title.toLowerCase().trim();
    if (!movie.title.toLowerCase().includes(searchTitle)) {
      return false;
    }
  }

  // Year range filter
  if (filters.yearFrom !== undefined && movie.year !== null) {
    if (movie.year < filters.yearFrom) {
      return false;
    }
  }

  if (filters.yearTo !== undefined && movie.year !== null) {
    if (movie.year > filters.yearTo) {
      return false;
    }
  }

  // Genres filter (movie must have at least one of the selected genres)
  if (filters.genres && filters.genres.length > 0) {
    const movieGenres = movie.genres.map((g) => g.toLowerCase());
    const hasMatchingGenre = filters.genres.some((filterGenre) =>
      movieGenres.includes(filterGenre.toLowerCase())
    );

    if (!hasMatchingGenre) {
      return false;
    }
  }

  // Director filter (case-insensitive, partial match, accent-insensitive)
  if (filters.director) {
    const searchDirector = removeAccents(filters.director.toLowerCase().trim());
    const hasMatchingDirector = movie.directors.some((director) =>
      removeAccents(director.toLowerCase()).includes(searchDirector)
    );

    if (!hasMatchingDirector) {
      return false;
    }
  }

  return true;
}
