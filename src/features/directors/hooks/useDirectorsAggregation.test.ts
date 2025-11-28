import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@/test/test-utils";
import { useDirectorsAggregation } from "./useDirectorsAggregation";
import * as directorsService from "../services/directorsService";
import type { DirectorCount } from "../aggregators";
import { ApiError, NetworkError } from "@/core/api/types";

// Mock the directors service
vi.mock("../services/directorsService", () => ({
  directorsService: {
    getByThreshold: vi.fn(),
  },
}));

describe("useDirectorsAggregation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should fetch and aggregate directors on mount", async () => {
    const mockDirectors: DirectorCount[] = [
      { name: "Christopher Nolan", count: 3 },
      { name: "Quentin Tarantino", count: 2 },
    ];

    vi.mocked(directorsService.directorsService.getByThreshold).mockResolvedValue(mockDirectors);

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
    const mockDirectors: DirectorCount[] = [
      { name: "Christopher Nolan", count: 3 },
    ];

    vi.mocked(directorsService.directorsService.getByThreshold).mockResolvedValue(mockDirectors);

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
    const mockDirectors: DirectorCount[] = [
      { name: "Christopher Nolan", count: 1 },
      { name: "Quentin Tarantino", count: 1 },
      { name: "Steven Spielberg", count: 1 },
    ];

    vi.mocked(directorsService.directorsService.getByThreshold).mockResolvedValue(mockDirectors);

    const { result } = renderHook(() => useDirectorsAggregation(0));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // All directors with count > 0
    expect(result.current.directors).toHaveLength(3);
  });

  it("should return empty array when threshold is very high", async () => {
    vi.mocked(directorsService.directorsService.getByThreshold).mockResolvedValue([]);

    const { result } = renderHook(() => useDirectorsAggregation(100));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.directors).toEqual([]);
  });

  it("should handle API errors", async () => {
    const mockError = new NetworkError("Network error");
    vi.mocked(directorsService.directorsService.getByThreshold).mockRejectedValue(mockError);

    const { result } = renderHook(() => useDirectorsAggregation(5));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(mockError);
    expect(result.current.directors).toEqual([]);
  });

  it("should handle empty movie list", async () => {
    vi.mocked(directorsService.directorsService.getByThreshold).mockResolvedValue([]);

    const { result } = renderHook(() => useDirectorsAggregation(5));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.directors).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("should handle invalid threshold (non-number)", async () => {
    const { result } = renderHook(() =>
      useDirectorsAggregation(NaN as number)
    );

    // Should not make API call
    expect(directorsService.directorsService.getByThreshold).not.toHaveBeenCalled();

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
    expect(directorsService.directorsService.getByThreshold).not.toHaveBeenCalled();

    expect(result.current.loading).toBe(false);
    expect(result.current.directors).toEqual([]);
  });

  it("should handle negative threshold", async () => {
    const { result } = renderHook(() => useDirectorsAggregation(-1));

    // Requirement: threshold < 0 should not fetch (no error)
    expect(directorsService.directorsService.getByThreshold).not.toHaveBeenCalled();
    expect(result.current.directors).toHaveLength(0);
    expect(result.current.loading).toBe(false);
  });

  it("should re-fetch when threshold changes", async () => {
    const mockDirectors1: DirectorCount[] = [
      { name: "Christopher Nolan", count: 3 },
      { name: "Quentin Tarantino", count: 2 },
    ];

    const mockDirectors2: DirectorCount[] = [
      { name: "Christopher Nolan", count: 3 },
    ];

    vi.mocked(directorsService.directorsService.getByThreshold)
      .mockResolvedValueOnce(mockDirectors1)
      .mockResolvedValueOnce(mockDirectors2);

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

    // Should have called service twice
    expect(directorsService.directorsService.getByThreshold).toHaveBeenCalledTimes(2);
  });

  it("should handle API error with details", async () => {
    const mockError = new ApiError("API Error", 500);
    vi.mocked(directorsService.directorsService.getByThreshold).mockRejectedValue(mockError);

    const { result } = renderHook(() => useDirectorsAggregation(5));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(mockError);
    expect(result.current.error?.statusCode).toBe(500);
  });

});
