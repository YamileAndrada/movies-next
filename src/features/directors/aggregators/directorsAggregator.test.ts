import { describe, it, expect } from "vitest";
import type { Movie } from "@/core/api/types";
import { aggregateDirectors } from "./directorsAggregator";

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

describe("directorsAggregator", () => {
  describe("aggregateDirectors", () => {
    it("should aggregate directors and count movies", () => {
      const movies: Movie[] = [
        createMovie("Christopher Nolan"),
        createMovie("Christopher Nolan"),
        createMovie("Christopher Nolan"),
        createMovie("Quentin Tarantino"),
        createMovie("Quentin Tarantino"),
        createMovie("Steven Spielberg"),
      ];

      const result = aggregateDirectors(movies, 0);

      expect(result).toEqual([
        { name: "Christopher Nolan", count: 3 },
        { name: "Quentin Tarantino", count: 2 },
        { name: "Steven Spielberg", count: 1 },
      ]);
    });

    it("should filter directors by threshold (strictly greater than)", () => {
      const movies: Movie[] = [
        createMovie("Christopher Nolan"), // 3 movies
        createMovie("Christopher Nolan"),
        createMovie("Christopher Nolan"),
        createMovie("Quentin Tarantino"), // 2 movies
        createMovie("Quentin Tarantino"),
        createMovie("Steven Spielberg"), // 1 movie
      ];

      // threshold = 1: only directors with count > 1 (2 or more)
      const result = aggregateDirectors(movies, 1);

      expect(result).toEqual([
        { name: "Christopher Nolan", count: 3 },
        { name: "Quentin Tarantino", count: 2 },
      ]);
      expect(result).not.toContainEqual({
        name: "Steven Spielberg",
        count: 1,
      });
    });

    it("should filter with threshold = 2 (only count > 2)", () => {
      const movies: Movie[] = [
        createMovie("Christopher Nolan"), // 3 movies
        createMovie("Christopher Nolan"),
        createMovie("Christopher Nolan"),
        createMovie("Quentin Tarantino"), // 2 movies
        createMovie("Quentin Tarantino"),
        createMovie("Steven Spielberg"), // 1 movie
      ];

      // threshold = 2: only directors with count > 2 (3 or more)
      const result = aggregateDirectors(movies, 2);

      expect(result).toEqual([{ name: "Christopher Nolan", count: 3 }]);
    });

    it("should handle case-insensitive director names", () => {
      const movies: Movie[] = [
        createMovie("Christopher Nolan"),
        createMovie("CHRISTOPHER NOLAN"),
        createMovie("christopher nolan"),
        createMovie("Christopher NOLAN"),
      ];

      const result = aggregateDirectors(movies, 0);

      expect(result).toHaveLength(1);
      expect(result[0].count).toBe(4);
      // Should keep first occurrence's casing
      expect(result[0].name).toBe("Christopher Nolan");
    });

    it("should handle comma-separated directors", () => {
      const movies: Movie[] = [
        createMovie("Lana Wachowski, Lilly Wachowski"),
        createMovie("Lana Wachowski"),
        createMovie("Lilly Wachowski"),
        createMovie("Christopher Nolan"),
      ];

      const result = aggregateDirectors(movies, 0);

      expect(result).toEqual([
        { name: "Christopher Nolan", count: 1 },
        { name: "Lana Wachowski", count: 2 },
        { name: "Lilly Wachowski", count: 2 },
      ]);
    });

    it("should sort results alphabetically", () => {
      const movies: Movie[] = [
        createMovie("Tarantino"),
        createMovie("Tarantino"),
        createMovie("Nolan"),
        createMovie("Nolan"),
        createMovie("Anderson"),
        createMovie("Anderson"),
      ];

      const result = aggregateDirectors(movies, 0);

      expect(result.map((d) => d.name)).toEqual([
        "Anderson",
        "Nolan",
        "Tarantino",
      ]);
    });

    it("should sort alphabetically with case-insensitive comparison", () => {
      const movies: Movie[] = [
        createMovie("tarantino"),
        createMovie("tarantino"),
        createMovie("Nolan"),
        createMovie("Nolan"),
        createMovie("ANDERSON"),
        createMovie("ANDERSON"),
      ];

      const result = aggregateDirectors(movies, 0);

      // Should sort by name ignoring case
      expect(result.map((d) => d.name)).toEqual([
        "ANDERSON",
        "Nolan",
        "tarantino",
      ]);
    });

    it("should handle empty movie array", () => {
      const result = aggregateDirectors([], 5);

      expect(result).toEqual([]);
    });

    it("should handle null/undefined directors", () => {
      const movies: Movie[] = [
        { ...createMovie("Christopher Nolan"), Director: "" },
        { ...createMovie("Quentin Tarantino"), Director: "N/A" },
        { ...createMovie("Steven Spielberg"), Director: "   " },
        createMovie("Valid Director"),
        createMovie("Valid Director"),
      ];

      const result = aggregateDirectors(movies, 0);

      // Should only count "Valid Director"
      expect(result).toEqual([{ name: "Valid Director", count: 2 }]);
    });

    it("should handle directors with extra whitespace", () => {
      const movies: Movie[] = [
        createMovie("  Christopher Nolan  "),
        createMovie("Christopher Nolan"),
        createMovie("  CHRISTOPHER NOLAN"),
      ];

      const result = aggregateDirectors(movies, 0);

      expect(result).toHaveLength(1);
      expect(result[0].count).toBe(3);
      expect(result[0].name).toBe("Christopher Nolan"); // Trimmed
    });

    it("should handle directors with multiple spaces in name", () => {
      const movies: Movie[] = [
        createMovie("Martin   Scorsese"),
        createMovie("Martin Scorsese"),
        createMovie("MARTIN  SCORSESE"),
      ];

      const result = aggregateDirectors(movies, 0);

      expect(result).toHaveLength(1);
      expect(result[0].count).toBe(3);
    });

    it("should return empty array when all directors are below threshold", () => {
      const movies: Movie[] = [
        createMovie("Director A"),
        createMovie("Director B"),
        createMovie("Director C"),
      ];

      // threshold = 5: all have count = 1, which is NOT > 5
      const result = aggregateDirectors(movies, 5);

      expect(result).toEqual([]);
    });

    it("should handle negative threshold", () => {
      const movies: Movie[] = [
        createMovie("Christopher Nolan"),
        createMovie("Quentin Tarantino"),
      ];

      // threshold = -1: all directors with count > -1 (all of them)
      const result = aggregateDirectors(movies, -1);

      expect(result).toHaveLength(2);
    });

    it("should handle threshold = 0", () => {
      const movies: Movie[] = [
        createMovie("Christopher Nolan"),
        createMovie("Christopher Nolan"),
        createMovie("Quentin Tarantino"),
      ];

      // threshold = 0: all directors with count > 0
      const result = aggregateDirectors(movies, 0);

      expect(result).toEqual([
        { name: "Christopher Nolan", count: 2 },
        { name: "Quentin Tarantino", count: 1 },
      ]);
    });

    it("should handle large threshold", () => {
      const movies: Movie[] = [
        createMovie("Christopher Nolan"),
        createMovie("Christopher Nolan"),
        createMovie("Christopher Nolan"),
      ];

      // threshold = 100: no directors have count > 100
      const result = aggregateDirectors(movies, 100);

      expect(result).toEqual([]);
    });

    it("should handle exact threshold match (should NOT be included)", () => {
      const movies: Movie[] = [
        createMovie("Christopher Nolan"), // count = 3
        createMovie("Christopher Nolan"),
        createMovie("Christopher Nolan"),
        createMovie("Quentin Tarantino"), // count = 2
        createMovie("Quentin Tarantino"),
      ];

      // threshold = 3: only directors with count > 3 (strictly greater)
      const result = aggregateDirectors(movies, 3);

      // Christopher Nolan has exactly 3, should NOT be included
      expect(result).toEqual([]);
    });

    it("should preserve original director name casing (first occurrence)", () => {
      const movies: Movie[] = [
        createMovie("Christopher NOLAN"),
        createMovie("CHRISTOPHER NOLAN"),
        createMovie("christopher nolan"),
      ];

      const result = aggregateDirectors(movies, 0);

      // Should keep first occurrence: "Christopher NOLAN"
      expect(result[0].name).toBe("Christopher NOLAN");
    });

    it("should handle complex real-world scenario", () => {
      const movies: Movie[] = [
        createMovie("Christopher Nolan"),
        createMovie("Christopher Nolan"),
        createMovie("Christopher Nolan"),
        createMovie("Christopher Nolan"),
        createMovie("Christopher Nolan"),
        createMovie("Quentin Tarantino"),
        createMovie("Quentin Tarantino"),
        createMovie("Quentin Tarantino"),
        createMovie("Lana Wachowski, Lilly Wachowski"),
        createMovie("Lana Wachowski, Lilly Wachowski"),
        createMovie("Steven Spielberg"),
        createMovie("Steven Spielberg"),
        createMovie("Martin Scorsese"),
      ];

      // threshold = 2: only directors with > 2 movies
      const result = aggregateDirectors(movies, 2);

      expect(result).toEqual([
        { name: "Christopher Nolan", count: 5 },
        { name: "Quentin Tarantino", count: 3 },
      ]);
    });

    it("should handle movies with mixed valid and invalid directors", () => {
      const movies: Movie[] = [
        createMovie("Christopher Nolan, , Quentin Tarantino"),
        createMovie("Christopher Nolan"),
        createMovie("  , Quentin Tarantino,  "),
      ];

      const result = aggregateDirectors(movies, 0);

      expect(result).toEqual([
        { name: "Christopher Nolan", count: 2 },
        { name: "Quentin Tarantino", count: 2 },
      ]);
    });
  });
});
