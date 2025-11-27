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
  removeAccents,
  normalizeDirectorName,
  normalizeGenreName,
  movieMatchesQuery,
  getUniqueDirectors,
  getUniqueGenres,
  getYearRange,
  type NormalizedMovie,
} from "./movieMapper";
