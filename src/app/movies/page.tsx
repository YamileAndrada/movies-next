"use client";

import { useState, useCallback } from "react";
import {
  MoviesFilters,
  MoviesTable,
  MovieDetailsModal,
} from "@/features/movies/components";
import { useMoviesSearch, useFilterOptions } from "@/features/movies/hooks";
import type { MoviesSearchFilters } from "@/features/movies/hooks";
import type { NormalizedMovie } from "@/core/lib";

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
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Explore Movies
          </h1>
          <p className="text-gray-600">
            Search and filter through our movie collection
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div
            className="bg-red-50 border-l-4 border-red-500 p-4 mb-6"
            role="alert"
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
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
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error loading movies
                </h3>
                <p className="mt-1 text-sm text-red-700">
                  {error.message || "An unexpected error occurred"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="space-y-6">
          {/* Filters Section - Collapsible */}
          <div className="bg-white rounded-lg shadow-sm overflow-visible">
            <button
              onClick={() => setFiltersExpanded(!filtersExpanded)}
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              aria-expanded={filtersExpanded}
              aria-controls="filters-content"
            >
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-gray-600"
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
                <h2 className="text-xl font-semibold text-gray-900">
                  Filters
                </h2>
                {!filtersExpanded && Object.keys(filters).length > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    {Object.values(filters).filter(v => v !== undefined && v !== '' && (Array.isArray(v) ? v.length > 0 : true)).length} active
                  </span>
                )}
              </div>
              <svg
                className={`w-5 h-5 text-gray-500 transition-transform ${
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
              <div id="filters-content" className="px-6 pb-6 border-t border-gray-100">
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
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
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
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  No movies found
                </h3>
                <p className="mt-2 text-gray-500">
                  Try adjusting your filters to see more results
                </p>
              </div>
            )}

            {(loading || movies.length > 0) && (
              <MoviesTable
                movies={movies}
                loading={loading}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setPage}
                onMovieClick={setSelectedMovie}
              />
            )}
          </div>
        </div>

        {/* Movie Details Modal */}
        <MovieDetailsModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
        />
      </div>
    </main>
  );
}
