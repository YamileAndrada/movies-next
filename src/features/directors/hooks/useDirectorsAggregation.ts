import useSWR from "swr";
import { directorsService } from "../services";
import type { DirectorCount } from "../aggregators";
import type { ApiError } from "@/core/api/types";

/**
 * Result from useDirectorsAggregation hook
 */
export interface UseDirectorsAggregationResult {
  directors: DirectorCount[];
  loading: boolean;
  error: ApiError | null;
}

/**
 * Hook for aggregating directors by movie count with threshold filtering
 *
 * Uses SWR for automatic caching, deduplication, and revalidation.
 * All business logic and API calls are delegated to the directorsService layer.
 *
 * @param threshold - Minimum movie count (directors must have > threshold movies)
 * @returns Object with directors array, loading state, and error
 *
 * @example
 * ```typescript
 * function DirectorsPage() {
 *   const [threshold, setThreshold] = useState(5);
 *   const { directors, loading, error } = useDirectorsAggregation(threshold);
 *
 *   if (loading) return <Loading />;
 *   if (error) return <Error message={error.message} />;
 *   return <DirectorsList directors={directors} />;
 * }
 * ```
 */
export function useDirectorsAggregation(
  threshold: number
): UseDirectorsAggregationResult {
  // Only fetch when threshold is valid (finite and non-negative)
  const shouldFetch = Number.isFinite(threshold) && threshold >= 0;

  const { data, error, isValidating } = useSWR(
    shouldFetch ? `directors-threshold-${threshold}` : null,
    () => directorsService.getByThreshold(threshold),
    {
      dedupingInterval: 30000, // Dedupe requests within 30 seconds
      revalidateOnFocus: false, // Don't refetch on window focus
      errorRetryCount: 1, // Only retry failed requests once
    }
  );

  return {
    directors: data ?? [],
    loading: isValidating,
    error: (error as ApiError) ?? null,
  };
}
