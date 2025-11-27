import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@/test/test-utils";
import { useMoviesSearch } from "./useMoviesSearch";
import * as moviesApi from "@/core/api/moviesApi";
import type { Movie } from "@/core/api/types";
import { NetworkError } from "@/core/api/types";

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

describe("useMoviesSearch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic functionality", () => {
    it("should fetch and return movies", async () => {
      const mockMovies: Movie[] = [
        createMovie(),
        createMovie({ Title: "The Matrix Reloaded", Year: "2003" }),
      ];

      vi.mocked(moviesApi.fetchAllMovies).mockResolvedValue(mockMovies);

      const { result } = renderHook(() => useMoviesSearch({}, 1));

      // Initially loading
      expect(result.current.loading).toBe(true);
      expect(result.current.movies).toEqual([]);

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.movies).toHaveLength(2);
      expect(result.current.totalPages).toBe(1);
      expect(result.current.currentPage).toBe(1);
      expect(result.current.error).toBeNull();
    });

    it("should handle pagination", async () => {
      // Create 25 movies for pagination testing (10 per page)
      const mockMovies: Movie[] = Array.from({ length: 25 }, (_, i) =>
        createMovie({ Title: `Movie ${i + 1}` })
      );

      vi.mocked(moviesApi.fetchAllMovies).mockResolvedValue(mockMovies);

      const { result } = renderHook(() => useMoviesSearch({}, 2));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.currentPage).toBe(2);
      expect(result.current.totalPages).toBe(3); // 25 movies / 10 per page = 3 pages
      expect(result.current.movies).toHaveLength(10); // Page 2 should have 10 movies
    });

    it("should call fetchAllMovies via SWR", async () => {
      vi.mocked(moviesApi.fetchAllMovies).mockResolvedValue([createMovie()]);

      renderHook(() => useMoviesSearch({}, 1));

      await waitFor(() => {
        expect(moviesApi.fetchAllMovies).toHaveBeenCalled();
      });

      // SWR calls the fetcher function with the key and fetcherOptions
      const calls = vi.mocked(moviesApi.fetchAllMovies).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
    });
  });

  describe("Title filtering", () => {
    it("should filter movies by title", async () => {
      const mockMovies: Movie[] = [
        createMovie({ Title: "The Matrix" }),
        createMovie({ Title: "The Matrix Reloaded" }),
        createMovie({ Title: "Inception" }),
      ];

      vi.mocked(moviesApi.fetchAllMovies).mockResolvedValue(mockMovies);

      const { result } = renderHook(() =>
        useMoviesSearch({ title: "Matrix" }, 1)
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.movies).toHaveLength(2);
      expect(result.current.movies[0].title).toContain("Matrix");
      expect(result.current.movies[1].title).toContain("Matrix");
    });

    it("should handle case-insensitive title search", async () => {
      const mockMovies: Movie[] = [createMovie({ Title: "The Matrix" })];

      vi.mocked(moviesApi.fetchAllMovies).mockResolvedValue(mockMovies);

      const { result } = renderHook(() =>
        useMoviesSearch({ title: "MATRIX" }, 1)
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.movies).toHaveLength(1);
    });

    it("should trim whitespace from title filter", async () => {
      const mockMovies: Movie[] = [createMovie({ Title: "The Matrix" })];

      vi.mocked(moviesApi.fetchAllMovies).mockResolvedValue(mockMovies);

      const { result } = renderHook(() =>
        useMoviesSearch({ title: "  Matrix  " }, 1)
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.movies).toHaveLength(1);
    });
  });

  describe("Year filtering", () => {
    it("should filter by yearFrom", async () => {
      const mockMovies: Movie[] = [
        createMovie({ Title: "Old Movie", Year: "1990" }),
        createMovie({ Title: "Recent Movie", Year: "2020" }),
      ];

      vi.mocked(moviesApi.fetchAllMovies).mockResolvedValue(mockMovies);

      const { result } = renderHook(() =>
        useMoviesSearch({ yearFrom: 2000 }, 1)
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.movies).toHaveLength(1);
      expect(result.current.movies[0].title).toBe("Recent Movie");
    });

    it("should filter by yearTo", async () => {
      const mockMovies: Movie[] = [
        createMovie({ Title: "Old Movie", Year: "1990" }),
        createMovie({ Title: "Recent Movie", Year: "2020" }),
      ];

      vi.mocked(moviesApi.fetchAllMovies).mockResolvedValue(mockMovies);

      const { result } = renderHook(() =>
        useMoviesSearch({ yearTo: 2000 }, 1)
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.movies).toHaveLength(1);
      expect(result.current.movies[0].title).toBe("Old Movie");
    });

    it("should filter by year range", async () => {
      const mockMovies: Movie[] = [
        createMovie({ Title: "Old Movie", Year: "1990" }),
        createMovie({ Title: "Mid Movie", Year: "2000" }),
        createMovie({ Title: "Recent Movie", Year: "2020" }),
      ];

      vi.mocked(moviesApi.fetchAllMovies).mockResolvedValue(mockMovies);

      const { result } = renderHook(() =>
        useMoviesSearch({ yearFrom: 1995, yearTo: 2005 }, 1)
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.movies).toHaveLength(1);
      expect(result.current.movies[0].title).toBe("Mid Movie");
    });
  });

  describe("Genre filtering", () => {
    it("should filter by single genre", async () => {
      const mockMovies: Movie[] = [
        createMovie({ Title: "Action Movie", Genre: "Action, Thriller" }),
        createMovie({ Title: "Drama Movie", Genre: "Drama" }),
      ];

      vi.mocked(moviesApi.fetchAllMovies).mockResolvedValue(mockMovies);

      const { result } = renderHook(() =>
        useMoviesSearch({ genres: ["Action"] }, 1)
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.movies).toHaveLength(1);
      expect(result.current.movies[0].title).toBe("Action Movie");
    });

    it("should filter by multiple genres (OR logic)", async () => {
      const mockMovies: Movie[] = [
        createMovie({ Title: "Action Movie", Genre: "Action" }),
        createMovie({ Title: "Drama Movie", Genre: "Drama" }),
        createMovie({ Title: "Comedy Movie", Genre: "Comedy" }),
      ];

      vi.mocked(moviesApi.fetchAllMovies).mockResolvedValue(mockMovies);

      const { result } = renderHook(() =>
        useMoviesSearch({ genres: ["Action", "Drama"] }, 1)
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.movies).toHaveLength(2);
    });

    it("should handle case-insensitive genre matching", async () => {
      const mockMovies: Movie[] = [
        createMovie({ Title: "Action Movie", Genre: "Action, Sci-Fi" }),
      ];

      vi.mocked(moviesApi.fetchAllMovies).mockResolvedValue(mockMovies);

      const { result } = renderHook(() =>
        useMoviesSearch({ genres: ["action"] }, 1)
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.movies).toHaveLength(1);
    });
  });

  describe("Director filtering", () => {
    it("should filter by director name", async () => {
      const mockMovies: Movie[] = [
        createMovie({
          Title: "Inception",
          Director: "Christopher Nolan",
        }),
        createMovie({
          Title: "Pulp Fiction",
          Director: "Quentin Tarantino",
        }),
      ];

      vi.mocked(moviesApi.fetchAllMovies).mockResolvedValue(mockMovies);

      const { result } = renderHook(() =>
        useMoviesSearch({ director: "Nolan" }, 1)
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.movies).toHaveLength(1);
      expect(result.current.movies[0].title).toBe("Inception");
    });

    it("should handle case-insensitive director search", async () => {
      const mockMovies: Movie[] = [
        createMovie({
          Title: "Inception",
          Director: "Christopher Nolan",
        }),
      ];

      vi.mocked(moviesApi.fetchAllMovies).mockResolvedValue(mockMovies);

      const { result } = renderHook(() =>
        useMoviesSearch({ director: "NOLAN" }, 1)
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.movies).toHaveLength(1);
    });
  });

  describe("Combined filters", () => {
    it("should apply multiple filters together (AND logic)", async () => {
      const mockMovies: Movie[] = [
        createMovie({
          Title: "The Dark Knight",
          Year: "2008",
          Genre: "Action, Crime, Drama",
          Director: "Christopher Nolan",
        }),
        createMovie({
          Title: "Inception",
          Year: "2010",
          Genre: "Action, Sci-Fi",
          Director: "Christopher Nolan",
        }),
        createMovie({
          Title: "Interstellar",
          Year: "2014",
          Genre: "Adventure, Drama, Sci-Fi",
          Director: "Christopher Nolan",
        }),
      ];

      vi.mocked(moviesApi.fetchAllMovies).mockResolvedValue(mockMovies);

      const { result } = renderHook(() =>
        useMoviesSearch(
          {
            director: "Nolan",
            yearFrom: 2008,
            yearTo: 2010,
            genres: ["Action"],
          },
          1
        )
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.movies).toHaveLength(2);
      expect(result.current.movies.map((m) => m.title)).toEqual([
        "The Dark Knight",
        "Inception",
      ]);
    });
  });

  describe("Error handling", () => {
    it("should handle API errors", async () => {
      const mockError = new NetworkError("Network error");
      vi.mocked(moviesApi.fetchAllMovies).mockRejectedValue(mockError);

      const { result } = renderHook(() => useMoviesSearch({}, 1));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe(mockError);
      expect(result.current.movies).toEqual([]);
      expect(result.current.totalPages).toBe(0);
    });

    it("should handle invalid page number", async () => {
      const mockMovies: Movie[] = [createMovie()];
      vi.mocked(moviesApi.fetchAllMovies).mockResolvedValue(mockMovies);

      const { result } = renderHook(() => useMoviesSearch({}, -1));

      // Hook normalizes invalid page to 1, so it will load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.currentPage).toBe(1);
      expect(result.current.movies).toHaveLength(1);
    });

    it("should handle page = 0", async () => {
      const mockMovies: Movie[] = [createMovie()];
      vi.mocked(moviesApi.fetchAllMovies).mockResolvedValue(mockMovies);

      const { result } = renderHook(() => useMoviesSearch({}, 0));

      // Hook normalizes 0 to 1, so it will load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.currentPage).toBe(1);
      expect(result.current.movies).toHaveLength(1);
    });
  });

  describe("Request cancellation", () => {
    it("should not re-fetch when filters change (client-side filtering)", async () => {
      const mockMovies: Movie[] = [
        createMovie({ Title: "The Matrix" }),
        createMovie({ Title: "Inception" }),
      ];

      vi.mocked(moviesApi.fetchAllMovies).mockResolvedValue(mockMovies);

      const { rerender } = renderHook(
        ({ filters, page }) => useMoviesSearch(filters, page),
        { initialProps: { filters: { title: "Matrix" }, page: 1 } }
      );

      await waitFor(() => {
        expect(moviesApi.fetchAllMovies).toHaveBeenCalledTimes(1);
      });

      // Change filters - should not trigger new API call (client-side filtering)
      rerender({ filters: { title: "Inception" }, page: 1 });

      // Should still only have one API call
      expect(moviesApi.fetchAllMovies).toHaveBeenCalledTimes(1);
    });

    it("should not re-fetch when page changes (client-side pagination)", async () => {
      const mockMovies: Movie[] = Array.from({ length: 25 }, (_, i) =>
        createMovie({ Title: `Movie ${i + 1}` })
      );

      vi.mocked(moviesApi.fetchAllMovies).mockResolvedValue(mockMovies);

      const { rerender } = renderHook(
        ({ filters, page }) => useMoviesSearch(filters, page),
        { initialProps: { filters: {}, page: 1 } }
      );

      await waitFor(() => {
        expect(moviesApi.fetchAllMovies).toHaveBeenCalledTimes(1);
      });

      // Change page - should not trigger new API call (client-side pagination)
      rerender({ filters: {}, page: 2 });

      // Should still only have one API call
      expect(moviesApi.fetchAllMovies).toHaveBeenCalledTimes(1);
    });
  });

  describe("Memoization", () => {
    it("should not re-fetch when filter object changes but values are same", async () => {
      const mockMovies: Movie[] = [createMovie()];

      vi.mocked(moviesApi.fetchAllMovies).mockResolvedValue(mockMovies);

      const { rerender } = renderHook(
        ({ filters, page }) => useMoviesSearch(filters, page),
        { initialProps: { filters: { title: "Matrix" }, page: 1 } }
      );

      await waitFor(() => {
        expect(moviesApi.fetchAllMovies).toHaveBeenCalledTimes(1);
      });

      // Create new object with same values
      rerender({ filters: { title: "Matrix" }, page: 1 });

      // Should not trigger new fetch (SWR caching)
      expect(moviesApi.fetchAllMovies).toHaveBeenCalledTimes(1);
    });

    it("should return same filtered results for different genre order", async () => {
      const mockMovies: Movie[] = [
        createMovie({ Title: "Action Drama", Genre: "Action, Drama" }),
      ];

      vi.mocked(moviesApi.fetchAllMovies).mockResolvedValue(mockMovies);

      const { result, rerender } = renderHook(
        ({ filters, page }) => useMoviesSearch(filters, page),
        { initialProps: { filters: { genres: ["Action", "Drama"] }, page: 1 } }
      );

      await waitFor(() => {
        expect(moviesApi.fetchAllMovies).toHaveBeenCalledTimes(1);
      });

      const firstResult = result.current.movies;

      // Same genres in different order - should return same filtered results
      rerender({ filters: { genres: ["Drama", "Action"] }, page: 1 });

      expect(result.current.movies).toEqual(firstResult);
      // Should not trigger new fetch (SWR caching)
      expect(moviesApi.fetchAllMovies).toHaveBeenCalledTimes(1);
    });
  });

  describe("Empty results", () => {
    it("should return empty array when no movies match filters", async () => {
      const mockMovies: Movie[] = [createMovie({ Title: "The Matrix" })];

      vi.mocked(moviesApi.fetchAllMovies).mockResolvedValue(mockMovies);

      const { result } = renderHook(() =>
        useMoviesSearch({ title: "Inception" }, 1)
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.movies).toEqual([]);
      expect(result.current.totalPages).toBe(0); // 0 pages when no movies match filters
    });
  });
});
