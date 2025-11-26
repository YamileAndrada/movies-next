"use client";

import { useState, FormEvent } from "react";
import { useDirectorsAggregation } from "../hooks";

/**
 * Form component for directors threshold filtering
 * Allows users to input a threshold and displays directors with movie count > threshold
 */
export function DirectorsThresholdForm() {
  const [inputValue, setInputValue] = useState("");
  const [threshold, setThreshold] = useState<number | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Only fetch when threshold is set (after form submission)
  const { directors, loading, error } = useDirectorsAggregation(
    threshold ?? -1
  );

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValidationError(null);

    // Validate input
    const trimmedValue = inputValue.trim();

    if (trimmedValue === "") {
      setValidationError("Please enter a threshold value");
      return;
    }

    const numValue = Number(trimmedValue);

    if (!Number.isFinite(numValue)) {
      setValidationError("Please enter a valid number");
      return;
    }

    // Set threshold to trigger aggregation
    setThreshold(numValue);
    setHasSubmitted(true);
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError(null);
    }
  };

  // Determine if we should show results
  const shouldShowResults = hasSubmitted && threshold !== null;
  const hasResults = directors.length > 0;

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Directors by Threshold</h1>
        <p className="text-gray-600">
          Find directors who have directed more than a specified number of
          movies
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mb-8" noValidate>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label
              htmlFor="threshold-input"
              className="block text-sm font-medium mb-2"
            >
              Minimum Movie Count
            </label>
            <input
              id="threshold-input"
              type="number"
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationError
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300"
              }`}
              placeholder="Enter a number (e.g., 5)"
              aria-invalid={validationError ? "true" : "false"}
              aria-describedby={
                validationError ? "threshold-error" : "threshold-help"
              }
              disabled={loading}
            />
            {validationError ? (
              <p
                id="threshold-error"
                className="mt-2 text-sm text-red-600"
                role="alert"
              >
                {validationError}
              </p>
            ) : (
              <p id="threshold-help" className="mt-2 text-sm text-gray-500">
                Directors with more than this number of movies will be shown
              </p>
            )}
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              aria-label="Calculate directors"
            >
              {loading ? "Calculating..." : "Calculate"}
            </button>
          </div>
        </div>
      </form>

      {/* Results Section */}
      {shouldShowResults && (
        <div
          role="region"
          aria-live="polite"
          aria-label="Directors results"
          className="mt-8"
        >
          {/* Loading State */}
          {loading && <LoadingSkeleton />}

          {/* Error State */}
          {!loading && error && <ErrorMessage error={error.message} />}

          {/* Empty State */}
          {!loading && !error && !hasResults && (
            <EmptyState threshold={threshold} />
          )}

          {/* Success State */}
          {!loading && !error && hasResults && (
            <DirectorsList directors={directors} threshold={threshold} />
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Loading skeleton component
 */
function LoadingSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-label="Loading directors">
      <div className="h-8 bg-gray-200 rounded animate-pulse" />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="h-12 flex-1 bg-gray-200 rounded animate-pulse" />
            <div className="h-12 w-20 bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </div>
      <span className="sr-only">Loading directors...</span>
    </div>
  );
}

/**
 * Error message component
 */
function ErrorMessage({ error }: { error: string }) {
  return (
    <div
      className="p-6 bg-red-50 border border-red-200 rounded-lg"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-3">
        <svg
          className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div>
          <h3 className="font-semibold text-red-900 mb-1">Error</h3>
          <p className="text-red-700">{error}</p>
          <p className="text-sm text-red-600 mt-2">
            Please try again or adjust your threshold value.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Empty state component
 */
function EmptyState({ threshold }: { threshold: number }) {
  const message =
    threshold < 0
      ? "Please enter a non-negative threshold value."
      : `No directors found with more than ${threshold} movie${threshold === 1 ? "" : "s"}.`;

  return (
    <div
      className="p-8 bg-gray-50 border border-gray-200 rounded-lg text-center"
      role="status"
    >
      <svg
        className="w-16 h-16 mx-auto mb-4 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No Results Found
      </h3>
      <p className="text-gray-600 mb-4">{message}</p>
      <p className="text-sm text-gray-500">
        Try adjusting the threshold to find more directors.
      </p>
    </div>
  );
}

/**
 * Directors list component
 */
function DirectorsList({
  directors,
  threshold,
}: {
  directors: Array<{ name: string; count: number }>;
  threshold: number;
}) {
  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-semibold">
          Found {directors.length} director{directors.length === 1 ? "" : "s"}{" "}
          with more than {threshold} movie{threshold === 1 ? "" : "s"}
        </h2>
      </div>

      <div
        className="bg-white border border-gray-200 rounded-lg overflow-hidden"
        role="table"
        aria-label="Directors list"
      >
        {/* Table Header */}
        <div
          className="grid grid-cols-[1fr_auto] gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 font-semibold text-sm text-gray-700"
          role="row"
        >
          <div role="columnheader">Director Name</div>
          <div role="columnheader" className="text-right">
            Movie Count
          </div>
        </div>

        {/* Table Body */}
        <div role="rowgroup">
          {directors.map((director, index) => (
            <div
              key={`${director.name}-${director.count}`}
              className={`grid grid-cols-[1fr_auto] gap-4 px-6 py-4 hover:bg-gray-50 transition-colors ${
                index !== directors.length - 1 ? "border-b border-gray-200" : ""
              }`}
              role="row"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  // Could trigger modal or navigation here
                }
              }}
            >
              <div role="cell" className="font-medium text-gray-900">
                {director.name}
              </div>
              <div
                role="cell"
                className="text-right font-semibold text-blue-600"
              >
                {director.count}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
