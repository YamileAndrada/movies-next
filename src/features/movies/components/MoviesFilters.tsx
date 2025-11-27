"use client";

import { useState, useEffect, useCallback, useMemo, memo, useRef } from "react";
import { Input, Button, Select } from "@/core/ui";
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
 * Memoized to prevent unnecessary re-renders
 */
const MoviesFiltersComponent = ({
  filters,
  onFiltersChange,
  availableGenres = [],
  availableDirectors = [],
  realtimeFiltering = true,
  debounceMs = 300,
}: MoviesFiltersProps) => {
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
  const blurTimeoutRef = useRef<number | null>(null);

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

  // Debounced filter application for realtime filtering
  useEffect(() => {
    if (!realtimeFiltering) return;

    const timeoutId = setTimeout(() => {
      applyFilters();
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [applyFilters, realtimeFiltering, debounceMs]);

  // Cleanup any pending blur timeout on unmount to avoid side-effects after tests
  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  // Filter director suggestions based on search input
  const directorSuggestions = useMemo(() => {
    if (!directorSearch.trim()) return [];

    const searchLower = directorSearch.toLowerCase();
    return availableDirectors
      .filter((director) => director.toLowerCase().includes(searchLower))
      .slice(0, 10); // Limit to 10 suggestions
  }, [directorSearch, availableDirectors]);


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
    <div>
      {hasActiveFilters && (
        <div className="flex justify-end mb-4">
          <Button
            type="button"
            onClick={handleClearFilters}
            variant="ghost"
            className="text-sm"
            aria-label="Clear all filters"
          >
            Clear all
          </Button>
        </div>
      )}

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
          <Input
            id="title-filter"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Search by title..."
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
            <Input
              id="year-from"
              type="number"
              value={yearFrom}
              onChange={(e) => setYearFrom(e.target.value)}
              placeholder="1900"
              min={1800}
              max={2100}
            />
          </div>
          <div>
            <label
              htmlFor="year-to"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Year To
            </label>
            <Input
              id="year-to"
              type="number"
              value={yearTo}
              onChange={(e) => setYearTo(e.target.value)}
              placeholder="2024"
              min={1800}
              max={2100}
            />
          </div>
        </div>

        {/* Genre Multi-Select (replaced checkbox list with accessible native multi-select) */}
        {availableGenres.length > 0 && (
          <div role="group" aria-label="Genre filters">
            <Select
              label="Genres"
              multiple
              options={availableGenres.map((g) => ({ value: g, label: g }))}
              id="genres-select"
              value={selectedGenres}
              onChange={(e) => {
                const values = Array.from((e.target as HTMLSelectElement).selectedOptions).map(
                  (o) => o.value
                );
                setSelectedGenres(values);
              }}
              aria-describedby={selectedGenres.length > 0 ? undefined : "genres-help"}
            />
            {selectedGenres.length > 0 ? (
              <p className="mt-1 text-xs text-gray-500">
                {selectedGenres.length} genre{selectedGenres.length === 1 ? "" : "s"} selected
              </p>
            ) : (
              <p id="genres-help" className="mt-1 text-xs text-gray-500">
                Select one or more genres
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
            <Input
              id="director-filter"
              type="text"
              value={directorSearch}
              onChange={(e) => {
                setDirectorSearch(e.target.value);
                setShowDirectorSuggestions(true);
              }}
              onFocus={() => setShowDirectorSuggestions(true)}
              onBlur={() => {
                // Delay to allow click on suggestion — store timeout so we can clear on unmount
                if (blurTimeoutRef.current) {
                  clearTimeout(blurTimeoutRef.current);
                }
                blurTimeoutRef.current = window.setTimeout(() => setShowDirectorSuggestions(false), 200);
              }}
              placeholder="Search by director..."
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
                className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto"
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
          <Button type="submit" variant="primary" className="w-full">
            Apply Filters
          </Button>
        )}
      </form>
    </div>
  );
}

// Export memoized component to avoid re-renders when props are stable
export const MoviesFilters = memo(MoviesFiltersComponent);
