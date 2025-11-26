import { useState, useEffect, useRef } from "react";
import { fetchMoviesPage } from "@/core/api/moviesApi";
import { normalizeMovie, type NormalizedMovie } from "@/core/lib";
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

/**
 * Hook for searching and filtering movies with pagination
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
  const [movies, setMovies] = useState<NormalizedMovie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [totalPages, setTotalPages] = useState(0);

  // Store AbortController to cancel previous requests
  const abortControllerRef = useRef<AbortController | null>(null);

  // Create stable filter key for memoization
  const filterKey = JSON.stringify({
    title: filters.title?.trim().toLowerCase() || "",
    yearFrom: filters.yearFrom || null,
    yearTo: filters.yearTo || null,
    genres: filters.genres?.map((g) => g.toLowerCase()).sort() || [],
    director: filters.director?.trim().toLowerCase() || "",
  });

  useEffect(() => {
    // Validate page number
    if (!Number.isInteger(page) || page < 1) {
      setMovies([]);
      setTotalPages(0);
      setLoading(false);
      setError(null);
      return;
    }

    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new AbortController for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Async function to fetch and filter
    const fetchAndFilter = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch page from API
        const response = await fetchMoviesPage(page, abortController.signal);

        // Check if request was cancelled
        if (abortController.signal.aborted) {
          return;
        }

        // Normalize movies
        const normalizedMovies = response.data.map(normalizeMovie);

        // Apply client-side filters
        const filteredMovies = normalizedMovies.filter((movie) =>
          matchesFilters(movie, filters)
        );

        // Only update state if request wasn't cancelled
        if (!abortController.signal.aborted) {
          setMovies(filteredMovies);
          setTotalPages(response.total_pages);
          setError(null);
        }
      } catch (err) {
        // Only update error state if request wasn't cancelled
        if (!abortController.signal.aborted) {
          setError(err as ApiError);
          setMovies([]);
          setTotalPages(0);
        }
      } finally {
        // Only update loading state if request wasn't cancelled
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchAndFilter();

    // Cleanup: abort request on unmount or filter/page change
    return () => {
      abortController.abort();
    };
  }, [filterKey, page]); // Re-run when filters or page changes

  return {
    movies,
    loading,
    error,
    totalPages,
    currentPage: page,
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

  // Director filter (case-insensitive, partial match)
  if (filters.director) {
    const searchDirector = filters.director.toLowerCase().trim();
    const hasMatchingDirector = movie.directors.some((director) =>
      director.toLowerCase().includes(searchDirector)
    );

    if (!hasMatchingDirector) {
      return false;
    }
  }

  return true;
}
