import useSWR from "swr";
import { fetchAllMovies } from "@/core/api/moviesApi";
import { getUniqueDirectors, getUniqueGenres } from "@/core/lib/movieMapper";

/**
 * Result from useFilterOptions hook
 */
export interface UseFilterOptionsResult {
  directors: string[];
  genres: string[];
  loading: boolean;
  error: Error | null;
}

/**
 * Hook to fetch and extract unique directors and genres for filter options
 * Fetches all movies once and caches the result
 *
 * @returns Object with directors array, genres array, loading state, and error
 *
 * @example
 * ```typescript
 * function MoviesPage() {
 *   const { directors, genres, loading } = useFilterOptions();
 *
 *   return (
 *     <MoviesFilters
 *       availableDirectors={directors}
 *       availableGenres={genres}
 *     />
 *   );
 * }
 * ```
 */
export function useFilterOptions(): UseFilterOptionsResult {
  const { data, error, isLoading } = useSWR(
    "filter-options",
    async () => {
      const movies = await fetchAllMovies();
      return {
        directors: getUniqueDirectors(movies),
        genres: getUniqueGenres(movies),
      };
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // Cache for 1 minute
    }
  );

  return {
    directors: data?.directors ?? [],
    genres: data?.genres ?? [],
    loading: isLoading,
    error: error ?? null,
  };
}
