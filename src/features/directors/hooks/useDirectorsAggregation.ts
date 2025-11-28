import { useState, useEffect, useRef } from "react";
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
 * This hook only manages React state and side effects. All business logic
 * and API calls are delegated to the directorsService layer.
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
    // Validate threshold - must be finite and non-negative
    if (!Number.isFinite(threshold) || threshold < 0) {
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

    // Async function to fetch directors using service layer
    const fetchDirectors = async () => {
      setLoading(true);
      setError(null);

      try {
        // Delegate to service layer (no business logic here)
        const result = await directorsService.getByThreshold(
          threshold,
          abortController.signal
        );

        // Only update state if request wasn't cancelled
        if (!abortController.signal.aborted) {
          setDirectors(result);
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

    fetchDirectors();

    // Cleanup: abort request on unmount or threshold change
    return () => {
      abortController.abort();
    };
  }, [threshold]); // Re-run when threshold changes

  return { directors, loading, error };
}
