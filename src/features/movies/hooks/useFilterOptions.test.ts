import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@/test/test-utils";
import { useFilterOptions } from "./useFilterOptions";
import * as moviesApi from "@/core/api/moviesApi";
import type { Movie } from "@/core/api/types";

// Mock the API module
vi.mock("@/core/api/moviesApi", () => ({
  fetchAllMovies: vi.fn(),
}));

// Helper to create mock movie
const createMovie = (overrides: Partial<Movie> = {}): Movie => ({
  Title: "The Matrix",
  Year: "1999",
  Rated: "R",
  Released: "31 Mar 1999",
  Runtime: "136 min",
  Genre: "Action, Sci-Fi",
  Director: "Lana Wachowski, Lilly Wachowski",
  Writer: "Lilly Wachowski, Lana Wachowski",
  Actors: "Keanu Reeves, Laurence Fishburne",
  ...overrides,
});

describe("useFilterOptions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch and return unique directors and genres", async () => {
    const mockMovies: Movie[] = [
      createMovie({
        Title: "The Matrix",
        Genre: "Action, Sci-Fi",
        Director: "Lana Wachowski, Lilly Wachowski",
      }),
      createMovie({
        Title: "Inception",
        Genre: "Action, Thriller",
        Director: "Christopher Nolan",
      }),
      createMovie({
        Title: "The Dark Knight",
        Genre: "Action, Crime, Drama",
        Director: "Christopher Nolan",
      }),
    ];

    vi.mocked(moviesApi.fetchAllMovies).mockResolvedValue(mockMovies);

    const { result } = renderHook(() => useFilterOptions());

    // Initially loading
    expect(result.current.loading).toBe(true);
    expect(result.current.directors).toEqual([]);
    expect(result.current.genres).toEqual([]);

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should have unique directors (alphabetically sorted)
    expect(result.current.directors).toContain("Christopher Nolan");
    expect(result.current.directors.length).toBeGreaterThan(0);

    // Should have unique genres (alphabetically sorted)
    expect(result.current.genres).toContain("Action");
    expect(result.current.genres).toContain("Sci-Fi");
    expect(result.current.genres.length).toBeGreaterThan(0);

    expect(result.current.error).toBeNull();
  });

  it("should handle empty movies list", async () => {
    vi.mocked(moviesApi.fetchAllMovies).mockResolvedValue([]);

    const { result } = renderHook(() => useFilterOptions());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.directors).toEqual([]);
    expect(result.current.genres).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("should handle API errors", async () => {
    const mockError = new Error("Network error");
    vi.mocked(moviesApi.fetchAllMovies).mockRejectedValue(mockError);

    const { result } = renderHook(() => useFilterOptions());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(mockError);
    expect(result.current.directors).toEqual([]);
    expect(result.current.genres).toEqual([]);
  });

  it("should deduplicate directors with different casing", async () => {
    const mockMovies: Movie[] = [
      createMovie({
        Director: "Christopher Nolan",
      }),
      createMovie({
        Director: "christopher nolan", // Different casing
      }),
      createMovie({
        Director: "CHRISTOPHER NOLAN", // All caps
      }),
    ];

    vi.mocked(moviesApi.fetchAllMovies).mockResolvedValue(mockMovies);

    const { result } = renderHook(() => useFilterOptions());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should only have one entry despite different casing
    const nolanCount = result.current.directors.filter((d) =>
      d.toLowerCase().includes("christopher nolan")
    ).length;
    expect(nolanCount).toBe(1);
  });

  it("should sort directors and genres alphabetically", async () => {
    const mockMovies: Movie[] = [
      createMovie({
        Genre: "Thriller, Action, Drama",
        Director: "Zack Snyder",
      }),
      createMovie({
        Genre: "Comedy, Romance",
        Director: "Aaron Sorkin",
      }),
    ];

    vi.mocked(moviesApi.fetchAllMovies).mockResolvedValue(mockMovies);

    const { result } = renderHook(() => useFilterOptions());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Directors should be sorted alphabetically
    const directors = result.current.directors;
    expect(directors[0] < directors[directors.length - 1]).toBe(true);

    // Genres should be sorted alphabetically
    const genres = result.current.genres;
    expect(genres[0] < genres[genres.length - 1]).toBe(true);
  });
});
