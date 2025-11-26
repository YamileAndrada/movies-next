import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useMoviesSearch } from "./useMoviesSearch";
import * as moviesApi from "@/core/api/moviesApi";
import type { Movie, MoviesResponse } from "@/core/api/types";
import { NetworkError } from "@/core/api/types";

// Mock the API module
vi.mock("@/core/api/moviesApi", () => ({
  fetchMoviesPage: vi.fn(),
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

      const mockResponse: MoviesResponse = {
        page: 1,
        per_page: 10,
        total: 2,
        total_pages: 1,
        data: mockMovies,
      };

      vi.mocked(moviesApi.fetchMoviesPage).mockResolvedValue(mockResponse);

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
      const mockResponse: MoviesResponse = {
        page: 2,
        per_page: 10,
        total: 50,
        total_pages: 5,
        data: [createMovie()],
      };

      vi.mocked(moviesApi.fetchMoviesPage).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useMoviesSearch({}, 2));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.currentPage).toBe(2);
      expect(result.current.totalPages).toBe(5);
      expect(moviesApi.fetchMoviesPage).toHaveBeenCalledWith(2, expect.any(AbortSignal));
    });

    it("should pass AbortSignal to API", async () => {
      const mockResponse: MoviesResponse = {
        page: 1,
        per_page: 10,
        total: 1,
        total_pages: 1,
        data: [createMovie()],
      };

      vi.mocked(moviesApi.fetchMoviesPage).mockResolvedValue(mockResponse);

      renderHook(() => useMoviesSearch({}, 1));

      await waitFor(() => {
        expect(moviesApi.fetchMoviesPage).toHaveBeenCalled();
      });

      const calls = vi.mocked(moviesApi.fetchMoviesPage).mock.calls;
      expect(calls[0][1]).toBeInstanceOf(AbortSignal);
    });
  });

  describe("Title filtering", () => {
    it("should filter movies by title", async () => {
      const mockMovies: Movie[] = [
        createMovie({ Title: "The Matrix" }),
        createMovie({ Title: "The Matrix Reloaded" }),
        createMovie({ Title: "Inception" }),
      ];

      const mockResponse: MoviesResponse = {
        page: 1,
        per_page: 10,
        total: 3,
        total_pages: 1,
        data: mockMovies,
      };

      vi.mocked(moviesApi.fetchMoviesPage).mockResolvedValue(mockResponse);

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

      const mockResponse: MoviesResponse = {
        page: 1,
        per_page: 10,
        total: 1,
        total_pages: 1,
        data: mockMovies,
      };

      vi.mocked(moviesApi.fetchMoviesPage).mockResolvedValue(mockResponse);

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

      const mockResponse: MoviesResponse = {
        page: 1,
        per_page: 10,
        total: 1,
        total_pages: 1,
        data: mockMovies,
      };

      vi.mocked(moviesApi.fetchMoviesPage).mockResolvedValue(mockResponse);

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

      const mockResponse: MoviesResponse = {
        page: 1,
        per_page: 10,
        total: 2,
        total_pages: 1,
        data: mockMovies,
      };

      vi.mocked(moviesApi.fetchMoviesPage).mockResolvedValue(mockResponse);

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

      const mockResponse: MoviesResponse = {
        page: 1,
        per_page: 10,
        total: 2,
        total_pages: 1,
        data: mockMovies,
      };

      vi.mocked(moviesApi.fetchMoviesPage).mockResolvedValue(mockResponse);

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

      const mockResponse: MoviesResponse = {
        page: 1,
        per_page: 10,
        total: 3,
        total_pages: 1,
        data: mockMovies,
      };

      vi.mocked(moviesApi.fetchMoviesPage).mockResolvedValue(mockResponse);

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

      const mockResponse: MoviesResponse = {
        page: 1,
        per_page: 10,
        total: 2,
        total_pages: 1,
        data: mockMovies,
      };

      vi.mocked(moviesApi.fetchMoviesPage).mockResolvedValue(mockResponse);

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

      const mockResponse: MoviesResponse = {
        page: 1,
        per_page: 10,
        total: 3,
        total_pages: 1,
        data: mockMovies,
      };

      vi.mocked(moviesApi.fetchMoviesPage).mockResolvedValue(mockResponse);

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

      const mockResponse: MoviesResponse = {
        page: 1,
        per_page: 10,
        total: 1,
        total_pages: 1,
        data: mockMovies,
      };

      vi.mocked(moviesApi.fetchMoviesPage).mockResolvedValue(mockResponse);

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

      const mockResponse: MoviesResponse = {
        page: 1,
        per_page: 10,
        total: 2,
        total_pages: 1,
        data: mockMovies,
      };

      vi.mocked(moviesApi.fetchMoviesPage).mockResolvedValue(mockResponse);

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

      const mockResponse: MoviesResponse = {
        page: 1,
        per_page: 10,
        total: 1,
        total_pages: 1,
        data: mockMovies,
      };

      vi.mocked(moviesApi.fetchMoviesPage).mockResolvedValue(mockResponse);

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

      const mockResponse: MoviesResponse = {
        page: 1,
        per_page: 10,
        total: 3,
        total_pages: 1,
        data: mockMovies,
      };

      vi.mocked(moviesApi.fetchMoviesPage).mockResolvedValue(mockResponse);

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
      vi.mocked(moviesApi.fetchMoviesPage).mockRejectedValue(mockError);

      const { result } = renderHook(() => useMoviesSearch({}, 1));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe(mockError);
      expect(result.current.movies).toEqual([]);
      expect(result.current.totalPages).toBe(0);
    });

    it("should handle invalid page number", () => {
      const { result } = renderHook(() => useMoviesSearch({}, -1));

      expect(result.current.loading).toBe(false);
      expect(result.current.movies).toEqual([]);
      expect(result.current.totalPages).toBe(0);
      expect(moviesApi.fetchMoviesPage).not.toHaveBeenCalled();
    });

    it("should handle page = 0", () => {
      const { result } = renderHook(() => useMoviesSearch({}, 0));

      expect(result.current.loading).toBe(false);
      expect(result.current.movies).toEqual([]);
      expect(result.current.totalPages).toBe(0);
    });
  });

  describe("Request cancellation", () => {
    it("should cancel previous request when filters change", async () => {
      const mockResponse: MoviesResponse = {
        page: 1,
        per_page: 10,
        total: 1,
        total_pages: 1,
        data: [createMovie()],
      };

      vi.mocked(moviesApi.fetchMoviesPage).mockResolvedValue(mockResponse);

      const { rerender } = renderHook(
        ({ filters, page }) => useMoviesSearch(filters, page),
        { initialProps: { filters: { title: "Matrix" }, page: 1 } }
      );

      // Change filters
      rerender({ filters: { title: "Inception" }, page: 1 });

      await waitFor(() => {
        expect(moviesApi.fetchMoviesPage).toHaveBeenCalledTimes(2);
      });

      // First call should have been cancelled
      const firstCall = vi.mocked(moviesApi.fetchMoviesPage).mock.calls[0];
      const firstSignal = firstCall[1] as AbortSignal;
      expect(firstSignal?.aborted).toBe(true);
    });

    it("should cancel request when page changes", async () => {
      const mockResponse: MoviesResponse = {
        page: 1,
        per_page: 10,
        total: 1,
        total_pages: 1,
        data: [createMovie()],
      };

      vi.mocked(moviesApi.fetchMoviesPage).mockResolvedValue(mockResponse);

      const { rerender } = renderHook(
        ({ filters, page }) => useMoviesSearch(filters, page),
        { initialProps: { filters: {}, page: 1 } }
      );

      // Change page
      rerender({ filters: {}, page: 2 });

      await waitFor(() => {
        expect(moviesApi.fetchMoviesPage).toHaveBeenCalledTimes(2);
      });

      const firstCall = vi.mocked(moviesApi.fetchMoviesPage).mock.calls[0];
      const firstSignal = firstCall[1] as AbortSignal;
      expect(firstSignal?.aborted).toBe(true);
    });
  });

  describe("Memoization", () => {
    it("should not re-fetch when filter object changes but values are same", async () => {
      const mockResponse: MoviesResponse = {
        page: 1,
        per_page: 10,
        total: 1,
        total_pages: 1,
        data: [createMovie()],
      };

      vi.mocked(moviesApi.fetchMoviesPage).mockResolvedValue(mockResponse);

      const { rerender } = renderHook(
        ({ filters, page }) => useMoviesSearch(filters, page),
        { initialProps: { filters: { title: "Matrix" }, page: 1 } }
      );

      await waitFor(() => {
        expect(moviesApi.fetchMoviesPage).toHaveBeenCalledTimes(1);
      });

      // Create new object with same values
      rerender({ filters: { title: "Matrix" }, page: 1 });

      // Should not trigger new fetch (memoized)
      expect(moviesApi.fetchMoviesPage).toHaveBeenCalledTimes(1);
    });

    it("should normalize genre array order for memoization", async () => {
      const mockResponse: MoviesResponse = {
        page: 1,
        per_page: 10,
        total: 1,
        total_pages: 1,
        data: [createMovie()],
      };

      vi.mocked(moviesApi.fetchMoviesPage).mockResolvedValue(mockResponse);

      const { rerender } = renderHook(
        ({ filters, page }) => useMoviesSearch(filters, page),
        { initialProps: { filters: { genres: ["Action", "Drama"] }, page: 1 } }
      );

      await waitFor(() => {
        expect(moviesApi.fetchMoviesPage).toHaveBeenCalledTimes(1);
      });

      // Same genres in different order
      rerender({ filters: { genres: ["Drama", "Action"] }, page: 1 });

      // Should not trigger new fetch (memoized - sorted)
      expect(moviesApi.fetchMoviesPage).toHaveBeenCalledTimes(1);
    });
  });

  describe("Empty results", () => {
    it("should return empty array when no movies match filters", async () => {
      const mockMovies: Movie[] = [createMovie({ Title: "The Matrix" })];

      const mockResponse: MoviesResponse = {
        page: 1,
        per_page: 10,
        total: 1,
        total_pages: 1,
        data: mockMovies,
      };

      vi.mocked(moviesApi.fetchMoviesPage).mockResolvedValue(mockResponse);

      const { result } = renderHook(() =>
        useMoviesSearch({ title: "Inception" }, 1)
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.movies).toEqual([]);
      expect(result.current.totalPages).toBe(1);
    });
  });
});
