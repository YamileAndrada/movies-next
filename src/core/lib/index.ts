/**
 * Core utilities and helpers
 * Central export point for shared library functions
 */

export {
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
  type NormalizedMovie,
} from "./movieMapper";
