"use client";

import { useState, useCallback, lazy, Suspense } from "react";
import Link from "next/link";
import { MoviesFilters } from "@/features/movies/components";
import { useMoviesSearch, useFilterOptions } from "@/features/movies/hooks";
import type { MoviesSearchFilters } from "@/features/movies/hooks";
import type { NormalizedMovie } from "@/core/lib";

// Lazy load heavy components for better performance
const MoviesTable = lazy(() => import("@/features/movies/components/MoviesTable").then(m => ({ default: m.MoviesTable })));
const MovieDetailsModal = lazy(() => import("@/features/movies/components/MovieDetailsModal").then(m => ({ default: m.MovieDetailsModal })));

/**
 * Movies Explorer Page
 * Provides searchable, filterable movie explorer with pagination
 */
export default function MoviesPage() {
  const [filters, setFilters] = useState<MoviesSearchFilters>({});
  const [page, setPage] = useState(1);
  const [selectedMovie, setSelectedMovie] = useState<NormalizedMovie | null>(
    null
  );
  const [filtersExpanded, setFiltersExpanded] = useState(true);

  // Fetch filter options (genres and directors)
  const { directors, genres } = useFilterOptions();

  // Call hook with a defensive fallback to avoid runtime errors if the hook
  // unexpectedly returns undefined during tests or in edge cases.
  const _hookResult = useMoviesSearch(filters, page) ?? {
    movies: [] as unknown as NormalizedMovie[],
    loading: false,
    error: null,
    totalPages: 0,
    currentPage: page,
  };

  const { movies, loading, error, totalPages, currentPage } = _hookResult;

  // Reset to page 1 when filters change
  const handleFiltersChange = useCallback((newFilters: MoviesSearchFilters) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/30 to-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <Link
              href="/"
              className="group flex items-center justify-center w-10 h-10 rounded-lg bg-white border border-gray-200 hover:border-gray-900 hover:bg-gray-900 transition-all duration-200 shadow-sm hover:shadow-md"
              aria-label="Back to home"
            >
              <svg
                className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </Link>
            <h1 className="text-4xl font-bold text-gray-900">
              Explore Movies
            </h1>
          </div>
          <p className="text-gray-600 ml-13">
            Search and filter through our movie collection
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div
            className="bg-gradient-to-r from-red-50 to-red-100/50 border border-red-200 rounded-xl p-6 mb-6 shadow-md animate-scale-in"
            role="alert"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                  <svg
                    className="h-6 w-6 text-white"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-red-900 mb-1">
                  Error loading movies
                </h3>
                <p className="text-sm text-red-700">
                  {error.message || "An unexpected error occurred"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="space-y-6 animate-slide-up">
          {/* Filters Section - Collapsible */}
          <div className="bg-white rounded-2xl shadow-lg overflow-visible border border-gray-100">
            <button
              onClick={() => setFiltersExpanded(!filtersExpanded)}
              className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gradient-to-r hover:from-primary-50/50 hover:to-transparent transition-all duration-200"
              aria-expanded={filtersExpanded}
              aria-controls="filters-content"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-primary-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                </div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Filters
                  </h2>
                  {!filtersExpanded && Object.keys(filters).length > 0 && (
                    <span className="px-2.5 py-1 text-xs font-semibold bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full shadow-sm">
                      {Object.values(filters).filter(v => v !== undefined && v !== '' && (Array.isArray(v) ? v.length > 0 : true)).length}
                    </span>
                  )}
                </div>
              </div>
              <svg
                className={`w-5 h-5 text-primary-600 transition-transform duration-200 ${
                  filtersExpanded ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {filtersExpanded && (
              <div id="filters-content" className="px-6 pb-6 pt-4 border-t border-gray-100 bg-gradient-to-b from-gray-50/50 to-transparent">
                <MoviesFilters
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  availableGenres={genres}
                  availableDirectors={directors}
                  realtimeFiltering={true}
                  debounceMs={300}
                />
              </div>
            )}
          </div>

          {/* Results Section */}
          <div>
            {!loading && !error && movies.length === 0 && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center animate-scale-in">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-4">
                  <svg
                    className="h-10 w-10 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No movies found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your filters to see more results
                </p>
              </div>
            )}

            {(loading || movies.length > 0) && (
              <Suspense fallback={
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-100 rounded-lg w-3/4"></div>
                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-100 rounded-lg"></div>
                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-100 rounded-lg w-5/6"></div>
                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-100 rounded-lg w-2/3"></div>
                  </div>
                </div>
              }>
                <MoviesTable
                  movies={movies}
                  loading={loading}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  onMovieClick={setSelectedMovie}
                />
              </Suspense>
            )}
          </div>
        </div>

        {/* Movie Details Modal */}
        <Suspense fallback={null}>
          <MovieDetailsModal
            movie={selectedMovie}
            onClose={() => setSelectedMovie(null)}
          />
        </Suspense>
      </div>
    </main>
  );
}
