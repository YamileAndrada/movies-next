import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  fetchMoviesPage,
  fetchAllMovies,
  cancelAllRequests,
  getInflightRequestCount,
} from "./moviesApi";
import {
  ApiError,
  NetworkError,
  ValidationError,
  AbortError,
  type MoviesResponse,
} from "./types";

// Mock data
const mockMovie = {
  Title: "The Matrix",
  Year: "1999",
  Rated: "R",
  Released: "31 Mar 1999",
  Runtime: "136 min",
  Genre: "Action, Sci-Fi",
  Director: "Lana Wachowski, Lilly Wachowski",
  Writer: "Lilly Wachowski, Lana Wachowski",
  Actors: "Keanu Reeves, Laurence Fishburne, Carrie-Anne Moss",
};

const mockResponse: MoviesResponse = {
  page: 1,
  per_page: 10,
  total: 25,
  total_pages: 3,
  data: [mockMovie],
};

describe("moviesApi", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    cancelAllRequests();
  });

  afterEach(() => {
    // Restore fetch after each test
    vi.restoreAllMocks();
  });

  describe("fetchMoviesPage", () => {
    it("should fetch a single page successfully", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await fetchMoviesPage(1);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://challenge.iugolabs.com/api/movies/search?page=1",
        expect.objectContaining({
          headers: { "Content-Type": "application/json" },
        })
      );
    });

    it("should throw ValidationError for invalid page number", async () => {
      await expect(fetchMoviesPage(0)).rejects.toThrow(ValidationError);
      await expect(fetchMoviesPage(-1)).rejects.toThrow(ValidationError);
      await expect(fetchMoviesPage(1.5)).rejects.toThrow(ValidationError);
    });

    it("should throw ApiError for non-OK response", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: "Not Found",
      });

      await expect(fetchMoviesPage(1)).rejects.toThrow(ApiError);
    });

    it("should throw NetworkError for network failure", async () => {
      global.fetch = vi.fn().mockRejectedValue(new TypeError("Network error"));

      await expect(fetchMoviesPage(1)).rejects.toThrow(NetworkError);
    });

    it("should throw AbortError when request is cancelled", async () => {
      const controller = new AbortController();

      global.fetch = vi.fn().mockImplementation(() => {
        controller.abort();
        return Promise.reject(new DOMException("Aborted", "AbortError"));
      });

      await expect(fetchMoviesPage(1, controller.signal)).rejects.toThrow(
        AbortError
      );
    });

    it("should throw ApiError for invalid response format", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ invalid: "response" }),
      });

      await expect(fetchMoviesPage(1)).rejects.toThrow(ApiError);
    });

    it("should handle AbortSignal correctly", async () => {
      const controller = new AbortController();

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      await fetchMoviesPage(1, controller.signal);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          signal: controller.signal,
        })
      );
    });
  });

  describe("fetchAllMovies", () => {
    it("should fetch all pages when multiple pages exist", async () => {
      const page1Response: MoviesResponse = {
        ...mockResponse,
        page: 1,
        total_pages: 3,
        data: [{ ...mockMovie, Title: "Movie 1" }],
      };

      const page2Response: MoviesResponse = {
        ...mockResponse,
        page: 2,
        total_pages: 3,
        data: [{ ...mockMovie, Title: "Movie 2" }],
      };

      const page3Response: MoviesResponse = {
        ...mockResponse,
        page: 3,
        total_pages: 3,
        data: [{ ...mockMovie, Title: "Movie 3" }],
      };

      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => page1Response,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => page2Response,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => page3Response,
        });

      const result = await fetchAllMovies();

      expect(result).toHaveLength(3);
      expect(result[0].Title).toBe("Movie 1");
      expect(result[1].Title).toBe("Movie 2");
      expect(result[2].Title).toBe("Movie 3");
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it("should return single page when total_pages is 1", async () => {
      const singlePageResponse: MoviesResponse = {
        ...mockResponse,
        page: 1,
        total_pages: 1,
        data: [mockMovie],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => singlePageResponse,
      });

      const result = await fetchAllMovies();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockMovie);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it("should cancel all requests when AbortSignal is triggered", async () => {
      const controller = new AbortController();

      global.fetch = vi.fn().mockImplementation(() => {
        setTimeout(() => controller.abort(), 10);
        return new Promise((_, reject) => {
          setTimeout(
            () => reject(new DOMException("Aborted", "AbortError")),
            50
          );
        });
      });

      await expect(fetchAllMovies(controller.signal)).rejects.toThrow();
    });

    it("should handle empty pages gracefully", async () => {
      const emptyResponse: MoviesResponse = {
        ...mockResponse,
        total_pages: 1,
        data: [],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => emptyResponse,
      });

      const result = await fetchAllMovies();

      expect(result).toEqual([]);
    });
  });

  describe("Request Deduplication", () => {
    it("should deduplicate simultaneous requests to the same page", async () => {
      global.fetch = vi.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => mockResponse,
                }),
              50
            );
          })
      );

      // Make 3 simultaneous requests to the same page
      const [result1, result2, result3] = await Promise.all([
        fetchMoviesPage(1),
        fetchMoviesPage(1),
        fetchMoviesPage(1),
      ]);

      // Should only call fetch once due to deduplication
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(result1).toEqual(result2);
      expect(result2).toEqual(result3);
    });

    it("should not deduplicate requests to different pages", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      await Promise.all([fetchMoviesPage(1), fetchMoviesPage(2)]);

      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it("should clear in-flight request after completion", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      expect(getInflightRequestCount()).toBe(0);

      await fetchMoviesPage(1);

      expect(getInflightRequestCount()).toBe(0);
    });
  });

  describe("Utility functions", () => {
    it("cancelAllRequests should clear in-flight requests", () => {
      // This is tested indirectly through beforeEach
      expect(getInflightRequestCount()).toBe(0);
      cancelAllRequests();
      expect(getInflightRequestCount()).toBe(0);
    });

    it("getInflightRequestCount should return correct count", async () => {
      global.fetch = vi.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => mockResponse,
                }),
              100
            );
          })
      );

      const promise = fetchMoviesPage(1);
      expect(getInflightRequestCount()).toBe(1);

      await promise;
      expect(getInflightRequestCount()).toBe(0);
    });
  });

  describe("Error handling", () => {
    it("should parse API errors correctly", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      });

      try {
        await fetchMoviesPage(1);
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).statusCode).toBe(500);
      }
    });

    it("should handle malformed JSON response", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => {
          throw new SyntaxError("Unexpected token");
        },
      });

      await expect(fetchMoviesPage(1)).rejects.toThrow(ApiError);
    });
  });
});
