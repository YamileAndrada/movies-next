"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { MoviesSearchFilters } from "../hooks";

/**
 * Props for MoviesFilters component
 */
export interface MoviesFiltersProps {
  /** Current filter values */
  filters: MoviesSearchFilters;
  /** Callback when filters change */
  onFiltersChange: (filters: MoviesSearchFilters) => void;
  /** Available genres for multi-select (extracted from loaded data) */
  availableGenres?: string[];
  /** Available directors for autocomplete (extracted from loaded data) */
  availableDirectors?: string[];
  /** Whether to apply filters in real-time (debounced) or require submit button */
  realtimeFiltering?: boolean;
  /** Debounce delay in ms for realtime filtering */
  debounceMs?: number;
}

/**
 * Filters component for movies search
 * Provides inputs for title, year range, genres, and director filtering
 */
export function MoviesFilters({
  filters,
  onFiltersChange,
  availableGenres = [],
  availableDirectors = [],
  realtimeFiltering = true,
  debounceMs = 300,
}: MoviesFiltersProps) {
  // Local state for form inputs
  const [title, setTitle] = useState(filters.title || "");
  const [yearFrom, setYearFrom] = useState(
    filters.yearFrom?.toString() || ""
  );
  const [yearTo, setYearTo] = useState(filters.yearTo?.toString() || "");
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    filters.genres || []
  );
  const [directorSearch, setDirectorSearch] = useState(filters.director || "");
  const [showDirectorSuggestions, setShowDirectorSuggestions] = useState(false);

  // Debounced filter application for realtime filtering
  useEffect(() => {
    if (!realtimeFiltering) return;

    const timeoutId = setTimeout(() => {
      applyFilters();
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [title, yearFrom, yearTo, selectedGenres, directorSearch, realtimeFiltering, debounceMs]);

  // Filter director suggestions based on search input
  const directorSuggestions = useMemo(() => {
    if (!directorSearch.trim()) return [];

    const searchLower = directorSearch.toLowerCase();
    return availableDirectors
      .filter((director) => director.toLowerCase().includes(searchLower))
      .slice(0, 10); // Limit to 10 suggestions
  }, [directorSearch, availableDirectors]);

  const applyFilters = useCallback(() => {
    const newFilters: MoviesSearchFilters = {
      title: title.trim() || undefined,
      yearFrom: yearFrom ? parseInt(yearFrom, 10) : undefined,
      yearTo: yearTo ? parseInt(yearTo, 10) : undefined,
      genres: selectedGenres.length > 0 ? selectedGenres : undefined,
      director: directorSearch.trim() || undefined,
    };

    onFiltersChange(newFilters);
  }, [title, yearFrom, yearTo, selectedGenres, directorSearch, onFiltersChange]);

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre)
        ? prev.filter((g) => g !== genre)
        : [...prev, genre]
    );
  };

  const handleDirectorSelect = (director: string) => {
    setDirectorSearch(director);
    setShowDirectorSuggestions(false);
  };

  const handleClearFilters = () => {
    setTitle("");
    setYearFrom("");
    setYearTo("");
    setSelectedGenres([]);
    setDirectorSearch("");
    onFiltersChange({});
  };

  const hasActiveFilters =
    title || yearFrom || yearTo || selectedGenres.length > 0 || directorSearch;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Filters</h2>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="text-sm text-blue-600 hover:text-blue-700 focus:outline-none focus:underline"
            aria-label="Clear all filters"
          >
            Clear all
          </button>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!realtimeFiltering) {
            applyFilters();
          }
        }}
        className="space-y-4"
      >
        {/* Title Filter */}
        <div>
          <label
            htmlFor="title-filter"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Title
          </label>
          <input
            id="title-filter"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Search by title..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-describedby="title-help"
          />
          <p id="title-help" className="mt-1 text-xs text-gray-500">
            Case-insensitive partial match
          </p>
        </div>

        {/* Year Range Filters */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="year-from"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Year From
            </label>
            <input
              id="year-from"
              type="number"
              value={yearFrom}
              onChange={(e) => setYearFrom(e.target.value)}
              placeholder="1900"
              min="1800"
              max="2100"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="year-to"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Year To
            </label>
            <input
              id="year-to"
              type="number"
              value={yearTo}
              onChange={(e) => setYearTo(e.target.value)}
              placeholder="2024"
              min="1800"
              max="2100"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Genre Multi-Select */}
        {availableGenres.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Genres
            </label>
            <div
              className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3 space-y-2"
              role="group"
              aria-label="Genre filters"
            >
              {availableGenres.map((genre) => (
                <label
                  key={genre}
                  className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded"
                >
                  <input
                    type="checkbox"
                    checked={selectedGenres.includes(genre)}
                    onChange={() => handleGenreToggle(genre)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    aria-label={`Filter by ${genre}`}
                  />
                  <span className="ml-2 text-sm text-gray-700">{genre}</span>
                </label>
              ))}
            </div>
            {selectedGenres.length > 0 && (
              <p className="mt-1 text-xs text-gray-500">
                {selectedGenres.length} genre{selectedGenres.length === 1 ? "" : "s"} selected
              </p>
            )}
          </div>
        )}

        {/* Director Autocomplete */}
        {availableDirectors.length > 0 && (
          <div className="relative">
            <label
              htmlFor="director-filter"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Director
            </label>
            <input
              id="director-filter"
              type="text"
              value={directorSearch}
              onChange={(e) => {
                setDirectorSearch(e.target.value);
                setShowDirectorSuggestions(true);
              }}
              onFocus={() => setShowDirectorSuggestions(true)}
              onBlur={() => {
                // Delay to allow click on suggestion
                setTimeout(() => setShowDirectorSuggestions(false), 200);
              }}
              placeholder="Search by director..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-describedby="director-help"
              aria-autocomplete="list"
              aria-controls="director-suggestions"
              aria-expanded={showDirectorSuggestions && directorSuggestions.length > 0}
            />
            <p id="director-help" className="mt-1 text-xs text-gray-500">
              Start typing to see suggestions
            </p>

            {/* Autocomplete Suggestions */}
            {showDirectorSuggestions && directorSuggestions.length > 0 && (
              <ul
                id="director-suggestions"
                role="listbox"
                className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto"
              >
                {directorSuggestions.map((director) => (
                  <li
                    key={director}
                    role="option"
                    aria-selected={directorSearch === director}
                    onClick={() => handleDirectorSelect(director)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleDirectorSelect(director);
                      }
                    }}
                    tabIndex={0}
                    className="px-3 py-2 cursor-pointer hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                  >
                    {director}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Apply Button (only shown if not realtime filtering) */}
        {!realtimeFiltering && (
          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Apply Filters
          </button>
        )}
      </form>
    </div>
  );
}
