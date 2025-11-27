import { useState, useEffect, useRef } from "react";
import { fetchAllMovies } from "@/core/api/moviesApi";
import { aggregateDirectors, type DirectorCount } from "../aggregators";
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
  const [directors, setDirectors] = useState<DirectorCount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  // Store AbortController to cancel previous requests
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Validate threshold
    if (!Number.isFinite(threshold)) {
      setError(null);
      setDirectors([]);
      setLoading(false);
      return;
    }

    // No module-level cache: keep behavior predictable for tests and freshness

    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new AbortController for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Async function to fetch and aggregate
    const fetchAndAggregate = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch all movies with cancellation support
        const movies = await fetchAllMovies(abortController.signal);

        // Check if request was cancelled
        if (abortController.signal.aborted) {
          return;
        }

        // Aggregate directors
        const aggregatedDirectors = aggregateDirectors(movies, threshold);

        // Only update state if request wasn't cancelled
        if (!abortController.signal.aborted) {
          setDirectors(aggregatedDirectors);
          setError(null);
        }
      } catch (err) {
        // Only update error state if request wasn't cancelled
        if (!abortController.signal.aborted) {
          setError(err as ApiError);
          setDirectors([]);
        }
      } finally {
        // Only update loading state if request wasn't cancelled
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchAndAggregate();

    // Cleanup: abort request on unmount or threshold change
    return () => {
      abortController.abort();
    };
  }, [threshold]); // Re-run when threshold changes

  return { directors, loading, error };
}
