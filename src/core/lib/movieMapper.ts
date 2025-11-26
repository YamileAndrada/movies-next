import type { Movie } from "@/core/api/types";

/**
 * Normalized movie data with clean, consistent values
 */
export interface NormalizedMovie {
  title: string;
  year: number | null;
  rated: string;
  released: string;
  runtime: number | null; // in minutes
  genres: string[];
  directors: string[];
  writers: string[];
  actors: string[];
  // Keep original data for reference
  original: Movie;
}

/**
 * Normalizes a Movie object for consistent usage
 * - Trims whitespace
 * - Splits comma-separated values into arrays
 * - Parses numeric values
 * - Handles null/undefined/empty values
 *
 * @param movie - Raw movie data from API
 * @returns Normalized movie with clean data
 */
export function normalizeMovie(movie: Movie): NormalizedMovie {
  return {
    title: safeString(movie.Title),
    year: parseYear(movie.Year),
    rated: safeString(movie.Rated),
    released: safeString(movie.Released),
    runtime: parseRuntime(movie.Runtime),
    genres: parseCommaSeparated(movie.Genre),
    directors: parseCommaSeparated(movie.Director),
    writers: parseCommaSeparated(movie.Writer),
    actors: parseCommaSeparated(movie.Actors),
    original: movie,
  };
}

/**
 * Normalizes multiple movies
 */
export function normalizeMovies(movies: Movie[]): NormalizedMovie[] {
  return movies.map(normalizeMovie);
}

/**
 * Safely extracts and trims a string value
 * Returns empty string for null/undefined
 */
export function safeString(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value).trim();
}

/**
 * Parses year from string to number
 * Handles formats like "1999", "1999–2000", "N/A"
 *
 * @param yearStr - Year string from API
 * @returns Year as number or null if invalid
 */
export function parseYear(yearStr: string): number | null {
  if (!yearStr || yearStr === "N/A") {
    return null;
  }

  // Extract first 4-digit year (handles ranges like "1999-2000")
  const match = yearStr.match(/\d{4}/);
  if (!match) {
    return null;
  }

  const year = parseInt(match[0], 10);

  // Validate reasonable year range
  if (year < 1800 || year > 2100) {
    return null;
  }

  return year;
}

/**
 * Parses runtime string to minutes
 * Handles formats like "136 min", "2h 16min", "N/A"
 *
 * @param runtimeStr - Runtime string from API
 * @returns Runtime in minutes or null if invalid
 */
export function parseRuntime(runtimeStr: string): number | null {
  if (!runtimeStr || runtimeStr === "N/A") {
    return null;
  }

  // Match patterns like "136 min" or "2h 16min"
  const minutesMatch = runtimeStr.match(/(\d+)\s*min/i);
  const hoursMatch = runtimeStr.match(/(\d+)\s*h/i);

  let totalMinutes = 0;

  if (hoursMatch) {
    totalMinutes += parseInt(hoursMatch[1], 10) * 60;
  }

  if (minutesMatch) {
    totalMinutes += parseInt(minutesMatch[1], 10);
  }

  return totalMinutes > 0 ? totalMinutes : null;
}

/**
 * Parses comma-separated string into array of trimmed values
 * Filters out empty strings
 *
 * @param value - Comma-separated string
 * @returns Array of trimmed non-empty strings
 */
export function parseCommaSeparated(value: string): string[] {
  if (!value || value === "N/A") {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

/**
 * Gets director name normalized for comparison
 * (lowercase, trimmed, no extra spaces)
 *
 * @param director - Director name
 * @returns Normalized director name
 */
export function normalizeDirectorName(director: string): string {
  return safeString(director)
    .toLowerCase()
    .replace(/\s+/g, " "); // Replace multiple spaces with single space
}

/**
 * Gets genre name normalized for comparison
 *
 * @param genre - Genre name
 * @returns Normalized genre name
 */
export function normalizeGenreName(genre: string): string {
  return safeString(genre)
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/**
 * Checks if a movie matches a search query (case-insensitive)
 *
 * @param movie - Movie to search
 * @param query - Search query
 * @returns True if movie matches query
 */
export function movieMatchesQuery(movie: Movie, query: string): boolean {
  if (!query) {
    return true;
  }

  const normalizedQuery = query.toLowerCase().trim();
  const searchableText = [
    movie.Title,
    movie.Director,
    movie.Actors,
    movie.Genre,
  ]
    .join(" ")
    .toLowerCase();

  return searchableText.includes(normalizedQuery);
}

/**
 * Gets unique directors from a list of movies
 * Normalized and deduplicated
 *
 * @param movies - Array of movies
 * @returns Array of unique director names
 */
export function getUniqueDirectors(movies: Movie[]): string[] {
  const directorsMap = new Map<string, string>();

  movies.forEach((movie) => {
    const directors = parseCommaSeparated(movie.Director);
    directors.forEach((director) => {
      const normalized = normalizeDirectorName(director);
      if (normalized && !directorsMap.has(normalized)) {
        directorsMap.set(normalized, director.trim());
      }
    });
  });

  return Array.from(directorsMap.values()).sort();
}

/**
 * Gets unique genres from a list of movies
 * Normalized and deduplicated
 *
 * @param movies - Array of movies
 * @returns Array of unique genre names
 */
export function getUniqueGenres(movies: Movie[]): string[] {
  const genresMap = new Map<string, string>();

  movies.forEach((movie) => {
    const genres = parseCommaSeparated(movie.Genre);
    genres.forEach((genre) => {
      const normalized = normalizeGenreName(genre);
      if (normalized && !genresMap.has(normalized)) {
        genresMap.set(normalized, genre.trim());
      }
    });
  });

  return Array.from(genresMap.values()).sort();
}

/**
 * Gets year range from a list of movies
 *
 * @param movies - Array of movies
 * @returns Object with min and max years, or null if no valid years
 */
export function getYearRange(
  movies: Movie[]
): { min: number; max: number } | null {
  const years = movies
    .map((movie) => parseYear(movie.Year))
    .filter((year): year is number => year !== null);

  if (years.length === 0) {
    return null;
  }

  return {
    min: Math.min(...years),
    max: Math.max(...years),
  };
}
