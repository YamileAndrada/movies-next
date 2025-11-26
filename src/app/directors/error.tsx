"use client";

import { useEffect } from "react";

/**
 * Error Boundary for Directors page
 * Catches and displays errors that occur in the directors feature
 */
export default function DirectorsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console in development
    console.error("Directors page error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center gap-3 mb-4">
          <svg
            className="w-8 h-8 text-red-600 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900">
            Something went wrong
          </h2>
        </div>

        <p className="text-gray-600 mb-2">
          An error occurred while loading the directors page.
        </p>

        {error.message && (
          <div className="mb-6 p-3 bg-gray-50 rounded border border-gray-200">
            <p className="text-sm text-gray-700 font-mono">{error.message}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={reset}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Try again
          </button>
          <a
            href="/"
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors text-center"
          >
            Go home
          </a>
        </div>

        {error.digest && (
          <p className="mt-4 text-xs text-gray-500 text-center">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
