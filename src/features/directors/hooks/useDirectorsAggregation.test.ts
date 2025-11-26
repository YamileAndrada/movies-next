import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useDirectorsAggregation } from "./useDirectorsAggregation";
import * as moviesApi from "@/core/api/moviesApi";
import type { Movie } from "@/core/api/types";
import { ApiError, NetworkError, AbortError } from "@/core/api/types";

// Mock the API module
vi.mock("@/core/api/moviesApi", () => ({
  fetchAllMovies: vi.fn(),
}));

// Helper to create mock movie
const createMovie = (director: string): Movie => ({
  Title: "Test Movie",
  Year: "2023",
  Rated: "PG-13",
  Released: "01 Jan 2023",
  Runtime: "120 min",
  Genre: "Action",
  Director: director,
  Writer: "Test Writer",
  Actors: "Test Actor",
});

describe("useDirectorsAggregation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should fetch and aggregate directors on mount", async () => {
    const mockMovies: Movie[] = [
      createMovie("Christopher Nolan"),
      createMovie("Christopher Nolan"),
      createMovie("Christopher Nolan"),
      createMovie("Quentin Tarantino"),
      createMovie("Quentin Tarantino"),
      createMovie("Steven Spielberg"),
    ];

    vi.mocked(moviesApi.fetchAllMovies).mockResolvedValue(mockMovies);

    const { result } = renderHook(() => useDirectorsAggregation(1));

    // Initially loading
    expect(result.current.loading).toBe(true);
    expect(result.current.directors).toEqual([]);
    expect(result.current.error).toBeNull();

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should have aggregated directors with count > 1
    expect(result.current.directors).toEqual([
      { name: "Christopher Nolan", count: 3 },
      { name: "Quentin Tarantino", count: 2 },
    ]);
    expect(result.current.error).toBeNull();
  });

  it("should filter directors by threshold", async () => {
    const mockMovies: Movie[] = [
      createMovie("Christopher Nolan"),
      createMovie("Christopher Nolan"),
      createMovie("Christopher Nolan"),
      createMovie("Quentin Tarantino"),
      createMovie("Quentin Tarantino"),
      createMovie("Steven Spielberg"),
    ];

    vi.mocked(moviesApi.fetchAllMovies).mockResolvedValue(mockMovies);

    const { result } = renderHook(() => useDirectorsAggregation(2));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Only directors with count > 2
    expect(result.current.directors).toEqual([
      { name: "Christopher Nolan", count: 3 },
    ]);
  });

  it("should return all directors with threshold = 0", async () => {
    const mockMovies: Movie[] = [
      createMovie("Christopher Nolan"),
      createMovie("Quentin Tarantino"),
      createMovie("Steven Spielberg"),
    ];

    vi.mocked(moviesApi.fetchAllMovies).mockResolvedValue(mockMovies);

    const { result } = renderHook(() => useDirectorsAggregation(0));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // All directors with count > 0
    expect(result.current.directors).toHaveLength(3);
  });

  it("should return empty array when threshold is very high", async () => {
    const mockMovies: Movie[] = [
      createMovie("Christopher Nolan"),
      createMovie("Christopher Nolan"),
    ];

    vi.mocked(moviesApi.fetchAllMovies).mockResolvedValue(mockMovies);

    const { result } = renderHook(() => useDirectorsAggregation(100));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.directors).toEqual([]);
  });

  it("should handle API errors", async () => {
    const mockError = new NetworkError("Network error");
    vi.mocked(moviesApi.fetchAllMovies).mockRejectedValue(mockError);

    const { result } = renderHook(() => useDirectorsAggregation(5));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(mockError);
    expect(result.current.directors).toEqual([]);
  });

  it("should handle empty movie list", async () => {
    vi.mocked(moviesApi.fetchAllMovies).mockResolvedValue([]);

    const { result } = renderHook(() => useDirectorsAggregation(5));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.directors).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("should cancel previous request when threshold changes", async () => {
    const mockMovies1: Movie[] = [
      createMovie("Christopher Nolan"),
      createMovie("Christopher Nolan"),
    ];

    const mockMovies2: Movie[] = [
      createMovie("Quentin Tarantino"),
      createMovie("Quentin Tarantino"),
      createMovie("Quentin Tarantino"),
    ];

    // First call resolves slowly
    vi.mocked(moviesApi.fetchAllMovies).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve(mockMovies1), 100);
        })
    );

    // Second call resolves quickly
    vi.mocked(moviesApi.fetchAllMovies).mockImplementationOnce(
      async () => mockMovies2
    );

    const { result, rerender } = renderHook(
      ({ threshold }) => useDirectorsAggregation(threshold),
      { initialProps: { threshold: 1 } }
    );

    // Change threshold before first request completes
    rerender({ threshold: 2 });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should have results from second request only
    expect(result.current.directors).toEqual([
      { name: "Quentin Tarantino", count: 3 },
    ]);

    // Should have called fetchAllMovies twice
    expect(moviesApi.fetchAllMovies).toHaveBeenCalledTimes(2);

    // First call should have been cancelled
    const firstCall = vi.mocked(moviesApi.fetchAllMovies).mock.calls[0];
    const firstSignal = firstCall[0] as AbortSignal;
    expect(firstSignal?.aborted).toBe(true);
  });

  it("should pass AbortSignal to fetchAllMovies", async () => {
    const mockMovies: Movie[] = [createMovie("Christopher Nolan")];
    vi.mocked(moviesApi.fetchAllMovies).mockResolvedValue(mockMovies);

    renderHook(() => useDirectorsAggregation(5));

    await waitFor(() => {
      expect(moviesApi.fetchAllMovies).toHaveBeenCalled();
    });

    const calls = vi.mocked(moviesApi.fetchAllMovies).mock.calls;
    expect(calls[0][0]).toBeInstanceOf(AbortSignal);
  });

  it("should not update state after unmount", async () => {
    const mockMovies: Movie[] = [createMovie("Christopher Nolan")];

    vi.mocked(moviesApi.fetchAllMovies).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve(mockMovies), 100);
        })
    );

    const { result, unmount } = renderHook(() => useDirectorsAggregation(5));

    expect(result.current.loading).toBe(true);

    // Unmount before request completes
    unmount();

    // Wait for the promise to resolve
    await new Promise((resolve) => setTimeout(resolve, 150));

    // State should still be loading (not updated after unmount)
    expect(result.current.loading).toBe(true);
    expect(result.current.directors).toEqual([]);
  });

  it("should handle invalid threshold (non-number)", async () => {
    const { result } = renderHook(() =>
      useDirectorsAggregation(NaN as number)
    );

    // Should not make API call
    expect(moviesApi.fetchAllMovies).not.toHaveBeenCalled();

    // Should return empty state
    expect(result.current.loading).toBe(false);
    expect(result.current.directors).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("should handle Infinity threshold", async () => {
    const { result } = renderHook(() =>
      useDirectorsAggregation(Infinity as number)
    );

    // Should not make API call for Infinity
    expect(moviesApi.fetchAllMovies).not.toHaveBeenCalled();

    expect(result.current.loading).toBe(false);
    expect(result.current.directors).toEqual([]);
  });

  it("should handle negative threshold", async () => {
    const mockMovies: Movie[] = [
      createMovie("Christopher Nolan"),
      createMovie("Quentin Tarantino"),
    ];

    vi.mocked(moviesApi.fetchAllMovies).mockResolvedValue(mockMovies);

    const { result } = renderHook(() => useDirectorsAggregation(-1));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // All directors have count > -1
    expect(result.current.directors).toHaveLength(2);
  });

  it("should re-fetch when threshold changes", async () => {
    const mockMovies: Movie[] = [
      createMovie("Christopher Nolan"),
      createMovie("Christopher Nolan"),
      createMovie("Christopher Nolan"),
      createMovie("Quentin Tarantino"),
      createMovie("Quentin Tarantino"),
    ];

    vi.mocked(moviesApi.fetchAllMovies).mockResolvedValue(mockMovies);

    const { result, rerender } = renderHook(
      ({ threshold }) => useDirectorsAggregation(threshold),
      { initialProps: { threshold: 0 } }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should have 2 directors
    expect(result.current.directors).toHaveLength(2);

    // Change threshold
    rerender({ threshold: 2 });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should have 1 director (only Nolan with count > 2)
    expect(result.current.directors).toHaveLength(1);
    expect(result.current.directors[0].name).toBe("Christopher Nolan");

    // Should have called API twice
    expect(moviesApi.fetchAllMovies).toHaveBeenCalledTimes(2);
  });

  it("should not ignore AbortError", async () => {
    vi.mocked(moviesApi.fetchAllMovies).mockRejectedValue(new AbortError());

    const { result } = renderHook(() => useDirectorsAggregation(5));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // AbortError should not set error state (request was cancelled)
    expect(result.current.error).toBeInstanceOf(AbortError);
    expect(result.current.directors).toEqual([]);
  });

  it("should handle API error with details", async () => {
    const mockError = new ApiError("API Error", 500);
    vi.mocked(moviesApi.fetchAllMovies).mockRejectedValue(mockError);

    const { result } = renderHook(() => useDirectorsAggregation(5));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(mockError);
    expect(result.current.error?.statusCode).toBe(500);
  });

  it("should aggregate comma-separated directors", async () => {
    const mockMovies: Movie[] = [
      createMovie("Lana Wachowski, Lilly Wachowski"),
      createMovie("Lana Wachowski, Lilly Wachowski"),
      createMovie("Lana Wachowski"),
    ];

    vi.mocked(moviesApi.fetchAllMovies).mockResolvedValue(mockMovies);

    const { result } = renderHook(() => useDirectorsAggregation(1));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Both directors have count > 1
    expect(result.current.directors).toEqual([
      { name: "Lana Wachowski", count: 3 },
      { name: "Lilly Wachowski", count: 2 },
    ]);
  });

  it("should maintain alphabetical sorting", async () => {
    const mockMovies: Movie[] = [
      createMovie("Tarantino"),
      createMovie("Tarantino"),
      createMovie("Nolan"),
      createMovie("Nolan"),
      createMovie("Anderson"),
      createMovie("Anderson"),
    ];

    vi.mocked(moviesApi.fetchAllMovies).mockResolvedValue(mockMovies);

    const { result } = renderHook(() => useDirectorsAggregation(0));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.directors.map((d) => d.name)).toEqual([
      "Anderson",
      "Nolan",
      "Tarantino",
    ]);
  });
});
