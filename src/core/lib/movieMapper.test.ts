import { describe, it, expect } from "vitest";
import type { Movie } from "@/core/api/types";
import {
  normalizeMovie,
  normalizeMovies,
  safeString,
  parseYear,
  parseRuntime,
  parseCommaSeparated,
  normalizeDirectorName,
  normalizeGenreName,
  movieMatchesQuery,
  getUniqueDirectors,
  getUniqueGenres,
  getYearRange,
} from "./movieMapper";

// Mock movie data
const mockMovie: Movie = {
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

describe("movieMapper", () => {
  describe("normalizeMovie", () => {
    it("should normalize a complete movie object", () => {
      const result = normalizeMovie(mockMovie);

      expect(result.title).toBe("The Matrix");
      expect(result.year).toBe(1999);
      expect(result.rated).toBe("R");
      expect(result.runtime).toBe(136);
      expect(result.genres).toEqual(["Action", "Sci-Fi"]);
      expect(result.directors).toEqual(["Lana Wachowski", "Lilly Wachowski"]);
      expect(result.actors).toHaveLength(3);
      expect(result.original).toBe(mockMovie);
    });

    it("should handle movies with N/A values", () => {
      const movieWithNA: Movie = {
        ...mockMovie,
        Year: "N/A",
        Runtime: "N/A",
        Genre: "N/A",
      };

      const result = normalizeMovie(movieWithNA);

      expect(result.year).toBeNull();
      expect(result.runtime).toBeNull();
      expect(result.genres).toEqual([]);
    });

    it("should handle empty/whitespace values", () => {
      const movieWithEmpty: Movie = {
        Title: "  Test Movie  ",
        Year: "",
        Rated: "   ",
        Released: "",
        Runtime: "",
        Genre: " , , ",
        Director: "",
        Writer: "",
        Actors: "",
      };

      const result = normalizeMovie(movieWithEmpty);

      expect(result.title).toBe("Test Movie");
      expect(result.year).toBeNull();
      expect(result.rated).toBe("");
      expect(result.genres).toEqual([]);
      expect(result.directors).toEqual([]);
    });
  });

  describe("normalizeMovies", () => {
    it("should normalize multiple movies", () => {
      const movies = [mockMovie, mockMovie];
      const result = normalizeMovies(movies);

      expect(result).toHaveLength(2);
      expect(result[0].title).toBe("The Matrix");
      expect(result[1].title).toBe("The Matrix");
    });
  });

  describe("safeString", () => {
    it("should handle normal strings", () => {
      expect(safeString("hello")).toBe("hello");
      expect(safeString("  trim me  ")).toBe("trim me");
    });

    it("should handle null and undefined", () => {
      expect(safeString(null)).toBe("");
      expect(safeString(undefined)).toBe("");
    });

    it("should convert numbers to strings", () => {
      expect(safeString(123)).toBe("123");
      expect(safeString(0)).toBe("0");
    });
  });

  describe("parseYear", () => {
    it("should parse valid year strings", () => {
      expect(parseYear("1999")).toBe(1999);
      expect(parseYear("2023")).toBe(2023);
      expect(parseYear("1895")).toBe(1895);
    });

    it("should handle year ranges", () => {
      expect(parseYear("1999–2000")).toBe(1999);
      expect(parseYear("2020-2021")).toBe(2020);
    });

    it("should handle N/A and empty strings", () => {
      expect(parseYear("N/A")).toBeNull();
      expect(parseYear("")).toBeNull();
      expect(parseYear("   ")).toBeNull();
    });

    it("should handle invalid years", () => {
      expect(parseYear("abc")).toBeNull();
      expect(parseYear("99")).toBeNull(); // Too short
    });

    it("should validate year range (1800-2100)", () => {
      expect(parseYear("1799")).toBeNull(); // Too old
      expect(parseYear("2101")).toBeNull(); // Too far in future
      expect(parseYear("1800")).toBe(1800); // Valid edge
      expect(parseYear("2100")).toBe(2100); // Valid edge
    });
  });

  describe("parseRuntime", () => {
    it("should parse minutes format", () => {
      expect(parseRuntime("136 min")).toBe(136);
      expect(parseRuntime("90min")).toBe(90);
      expect(parseRuntime("120 MIN")).toBe(120);
    });

    it("should parse hours and minutes format", () => {
      expect(parseRuntime("2h 16min")).toBe(136);
      expect(parseRuntime("1h 30min")).toBe(90);
      expect(parseRuntime("3h 0min")).toBe(180);
    });

    it("should handle hours only", () => {
      expect(parseRuntime("2h")).toBe(120);
      expect(parseRuntime("1h")).toBe(60);
    });

    it("should handle N/A and empty strings", () => {
      expect(parseRuntime("N/A")).toBeNull();
      expect(parseRuntime("")).toBeNull();
      expect(parseRuntime("   ")).toBeNull();
    });

    it("should handle invalid formats", () => {
      expect(parseRuntime("abc")).toBeNull();
      expect(parseRuntime("0 min")).toBeNull();
    });
  });

  describe("parseCommaSeparated", () => {
    it("should parse comma-separated values", () => {
      expect(parseCommaSeparated("Action, Sci-Fi, Thriller")).toEqual([
        "Action",
        "Sci-Fi",
        "Thriller",
      ]);
    });

    it("should trim whitespace", () => {
      expect(parseCommaSeparated("  Action  ,  Drama  ")).toEqual([
        "Action",
        "Drama",
      ]);
    });

    it("should filter empty values", () => {
      expect(parseCommaSeparated("Action, , Drama")).toEqual([
        "Action",
        "Drama",
      ]);
      expect(parseCommaSeparated(" , , ")).toEqual([]);
    });

    it("should handle N/A and empty strings", () => {
      expect(parseCommaSeparated("N/A")).toEqual([]);
      expect(parseCommaSeparated("")).toEqual([]);
    });

    it("should handle single value", () => {
      expect(parseCommaSeparated("Action")).toEqual(["Action"]);
    });
  });

  describe("normalizeDirectorName", () => {
    it("should normalize director names", () => {
      expect(normalizeDirectorName("Christopher Nolan")).toBe(
        "christopher nolan"
      );
      expect(normalizeDirectorName("  QUENTIN TARANTINO  ")).toBe(
        "quentin tarantino"
      );
    });

    it("should handle multiple spaces", () => {
      expect(normalizeDirectorName("Martin   Scorsese")).toBe(
        "martin scorsese"
      );
    });

    it("should handle empty values", () => {
      expect(normalizeDirectorName("")).toBe("");
      expect(normalizeDirectorName("   ")).toBe("");
    });
  });

  describe("normalizeGenreName", () => {
    it("should normalize genre names", () => {
      expect(normalizeGenreName("Action")).toBe("action");
      expect(normalizeGenreName("Sci-Fi")).toBe("sci-fi");
      expect(normalizeGenreName("  THRILLER  ")).toBe("thriller");
    });

    it("should handle multiple spaces", () => {
      expect(normalizeGenreName("Science   Fiction")).toBe("science fiction");
    });
  });

  describe("movieMatchesQuery", () => {
    it("should match movie title", () => {
      expect(movieMatchesQuery(mockMovie, "matrix")).toBe(true);
      expect(movieMatchesQuery(mockMovie, "Matrix")).toBe(true);
      expect(movieMatchesQuery(mockMovie, "THE MATRIX")).toBe(true);
    });

    it("should match director", () => {
      expect(movieMatchesQuery(mockMovie, "wachowski")).toBe(true);
      expect(movieMatchesQuery(mockMovie, "Lana")).toBe(true);
    });

    it("should match actors", () => {
      expect(movieMatchesQuery(mockMovie, "keanu")).toBe(true);
      expect(movieMatchesQuery(mockMovie, "reeves")).toBe(true);
    });

    it("should match genre", () => {
      expect(movieMatchesQuery(mockMovie, "action")).toBe(true);
      expect(movieMatchesQuery(mockMovie, "sci-fi")).toBe(true);
    });

    it("should not match unrelated query", () => {
      expect(movieMatchesQuery(mockMovie, "batman")).toBe(false);
      expect(movieMatchesQuery(mockMovie, "spielberg")).toBe(false);
    });

    it("should handle empty query", () => {
      expect(movieMatchesQuery(mockMovie, "")).toBe(true);
      expect(movieMatchesQuery(mockMovie, "   ")).toBe(true);
    });

    it("should handle partial matches", () => {
      expect(movieMatchesQuery(mockMovie, "matr")).toBe(true);
      expect(movieMatchesQuery(mockMovie, "kean")).toBe(true);
    });
  });

  describe("getUniqueDirectors", () => {
    it("should extract unique directors", () => {
      const movies: Movie[] = [
        { ...mockMovie, Director: "Christopher Nolan" },
        { ...mockMovie, Director: "Christopher Nolan" },
        { ...mockMovie, Director: "Quentin Tarantino" },
      ];

      const result = getUniqueDirectors(movies);

      expect(result).toEqual(["Christopher Nolan", "Quentin Tarantino"]);
    });

    it("should handle comma-separated directors", () => {
      const movies: Movie[] = [
        { ...mockMovie, Director: "Lana Wachowski, Lilly Wachowski" },
        { ...mockMovie, Director: "Lana Wachowski" },
      ];

      const result = getUniqueDirectors(movies);

      expect(result).toEqual(["Lana Wachowski", "Lilly Wachowski"]);
    });

    it("should normalize and deduplicate (case-insensitive)", () => {
      const movies: Movie[] = [
        { ...mockMovie, Director: "Christopher Nolan" },
        { ...mockMovie, Director: "CHRISTOPHER NOLAN" },
        { ...mockMovie, Director: "christopher nolan" },
      ];

      const result = getUniqueDirectors(movies);

      expect(result).toHaveLength(1);
    });

    it("should sort alphabetically", () => {
      const movies: Movie[] = [
        { ...mockMovie, Director: "Tarantino" },
        { ...mockMovie, Director: "Nolan" },
        { ...mockMovie, Director: "Anderson" },
      ];

      const result = getUniqueDirectors(movies);

      expect(result).toEqual(["Anderson", "Nolan", "Tarantino"]);
    });

    it("should handle empty directors", () => {
      const movies: Movie[] = [
        { ...mockMovie, Director: "" },
        { ...mockMovie, Director: "N/A" },
      ];

      const result = getUniqueDirectors(movies);

      expect(result).toEqual([]);
    });
  });

  describe("getUniqueGenres", () => {
    it("should extract unique genres", () => {
      const movies: Movie[] = [
        { ...mockMovie, Genre: "Action, Drama" },
        { ...mockMovie, Genre: "Action, Thriller" },
        { ...mockMovie, Genre: "Drama" },
      ];

      const result = getUniqueGenres(movies);

      expect(result).toContain("Action");
      expect(result).toContain("Drama");
      expect(result).toContain("Thriller");
      expect(result).toHaveLength(3);
    });

    it("should normalize and deduplicate (case-insensitive)", () => {
      const movies: Movie[] = [
        { ...mockMovie, Genre: "Action" },
        { ...mockMovie, Genre: "ACTION" },
        { ...mockMovie, Genre: "action" },
      ];

      const result = getUniqueGenres(movies);

      expect(result).toHaveLength(1);
    });

    it("should sort alphabetically", () => {
      const movies: Movie[] = [
        { ...mockMovie, Genre: "Thriller" },
        { ...mockMovie, Genre: "Action" },
        { ...mockMovie, Genre: "Drama" },
      ];

      const result = getUniqueGenres(movies);

      expect(result).toEqual(["Action", "Drama", "Thriller"]);
    });
  });

  describe("getYearRange", () => {
    it("should calculate year range", () => {
      const movies: Movie[] = [
        { ...mockMovie, Year: "1999" },
        { ...mockMovie, Year: "2023" },
        { ...mockMovie, Year: "2010" },
      ];

      const result = getYearRange(movies);

      expect(result).toEqual({ min: 1999, max: 2023 });
    });

    it("should handle single year", () => {
      const movies: Movie[] = [{ ...mockMovie, Year: "1999" }];

      const result = getYearRange(movies);

      expect(result).toEqual({ min: 1999, max: 1999 });
    });

    it("should return null for no valid years", () => {
      const movies: Movie[] = [
        { ...mockMovie, Year: "N/A" },
        { ...mockMovie, Year: "" },
      ];

      const result = getYearRange(movies);

      expect(result).toBeNull();
    });

    it("should ignore invalid years", () => {
      const movies: Movie[] = [
        { ...mockMovie, Year: "1999" },
        { ...mockMovie, Year: "N/A" },
        { ...mockMovie, Year: "2023" },
      ];

      const result = getYearRange(movies);

      expect(result).toEqual({ min: 1999, max: 2023 });
    });

    it("should handle empty array", () => {
      const result = getYearRange([]);

      expect(result).toBeNull();
    });
  });
});
