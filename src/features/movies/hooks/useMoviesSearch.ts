import { useMemo } from "react";
import useSWR from "swr";
import { moviesService } from "../services";
import type { NormalizedMovie } from "@/core/lib";
import type { ApiError } from "@/core/api/types";
import { filterMovies, paginate } from "../filters";

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
 *
 * This hook only manages React state and SWR caching. All business logic
 * (filtering, pagination) is delegated to the moviesService and filter utilities.
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
  // Note: We use "all-movies" as key since we fetch all data once and filter client-side
  // This provides better performance than refetching on every filter change
  const { data: allMovies, error, isValidating } = useSWR(
    "all-movies", // Global cache key - all movies fetched once
    () => moviesService.getAll(),
    {
      dedupingInterval: 30000, // Cache for 30 seconds
      revalidateOnFocus: false,
      errorRetryCount: 1,
    }
  );

  // Apply filters and pagination client-side using service utilities
  const result = useMemo(() => {
    if (!allMovies) {
      return { movies: [], totalPages: 0 };
    }

    // Filter movies using business logic from filters module
    const filtered = filterMovies(allMovies, filters);

    // Paginate using pagination utility
    const paginated = paginate(filtered, { page: validPage, itemsPerPage: ITEMS_PER_PAGE });

    return { movies: paginated.items, totalPages: paginated.totalPages };
  }, [allMovies, filters, validPage]);

  return {
    movies: result.movies,
    loading: !!isValidating,
    error: (error as ApiError) ?? null,
    totalPages: result.totalPages,
    currentPage: validPage,
  };
}
