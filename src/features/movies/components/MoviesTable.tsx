"use client";

import { useMemo, useCallback, memo } from "react";
import { Button } from "@/core/ui";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import type { NormalizedMovie } from "@/core/lib";

/**
 * Props for MoviesTable component
 */
export interface MoviesTableProps {
  /** Movies to display */
  movies: NormalizedMovie[];
  /** Loading state */
  loading?: boolean;
  /** Current page number (1-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Callback when movie row is clicked */
  onMovieClick?: (movie: NormalizedMovie) => void;
}

export const MoviesTable = memo(MoviesTableComponent);

/**
 * Loading skeleton for table rows
 */
function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="border-b border-gray-200">
          <td className="px-4 py-3">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
          </td>
          <td className="px-4 py-3">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
          </td>
          <td className="px-4 py-3">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
          </td>
          <td className="px-4 py-3">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
          </td>
        </tr>
      ))}
    </>
  );
}

/**
 * Loading skeleton for mobile cards
 */
function CardsSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-lg shadow p-4 border border-gray-200"
        >
          <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4 mb-2" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-24 mb-2" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-32 mb-2" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-40" />
        </div>
      ))}
    </>
  );
}

/**
 * Movies table component with TanStack Table
 * Displays movies in a responsive table/cards layout with pagination
 */
function MoviesTableComponent({
  movies,
  loading = false,
  currentPage,
  totalPages,
  onPageChange,
  onMovieClick,
}: MoviesTableProps) {
  // Define table columns
  const columns = useMemo<ColumnDef<NormalizedMovie>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Title",
        cell: (info) => (
          <span className="font-medium text-gray-900">
            {info.getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: "year",
        header: "Year",
        cell: (info) => {
          const year = info.getValue() as number | null;
          return (
            <span className="text-gray-700">{year ?? "N/A"}</span>
          );
        },
      },
      {
        accessorKey: "genres",
        header: "Genre",
        cell: (info) => {
          const genres = info.getValue() as string[];
          return (
            <span className="text-gray-700">
              {genres.length > 0 ? genres.slice(0, 2).join(", ") : "N/A"}
              {genres.length > 2 && (
                <span className="text-gray-500 text-sm ml-1">
                  +{genres.length - 2}
                </span>
              )}
            </span>
          );
        },
      },
      {
        accessorKey: "directors",
        header: "Director",
        cell: (info) => {
          const directors = info.getValue() as string[];
          return (
            <span className="text-gray-700">
              {directors.length > 0 ? directors[0] : "N/A"}
              {directors.length > 1 && (
                <span className="text-gray-500 text-sm ml-1">
                  +{directors.length - 1}
                </span>
              )}
            </span>
          );
        },
      },
    ],
    []
  );

  // Create table instance
  const table = useReactTable({
    data: movies,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages,
  });

  const handleRowClick = useCallback((movie: NormalizedMovie) => {
    if (onMovieClick) {
      onMovieClick(movie);
    }
  }, [onMovieClick]);

  const handlePrevPage = useCallback(() => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  }, [currentPage, onPageChange]);

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  }, [currentPage, totalPages, onPageChange]);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <TableSkeleton />
            ) : movies.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  No movies found
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => handleRowClick(row.original)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleRowClick(row.original);
                    }
                  }}
                  aria-label={`View details for ${row.original.title}`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 whitespace-nowrap">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards View */}
      <div className="md:hidden">
        {loading ? (
          <div className="p-4 space-y-4">
            <CardsSkeleton />
          </div>
        ) : movies.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No movies found</div>
        ) : (
          <div className="p-4 space-y-4">
            {movies.map((movie, idx) => {
              const movieKey = `${movie.title}-${movie.year ?? "na"}-${idx}`;
              return (
              <div
                key={movieKey}
                onClick={() => handleRowClick(movie)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleRowClick(movie);
                  }
                }}
                role="button"
                tabIndex={0}
                className="bg-white rounded-lg shadow border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
                aria-label={`View details for ${movie.title}`}
              >
                <h3 className="font-semibold text-gray-900 mb-2">
                  {movie.title}
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <span className="font-medium">Year:</span>{" "}
                    {movie.year ?? "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Genre:</span>{" "}
                    {movie.genres.length > 0
                      ? movie.genres.slice(0, 2).join(", ")
                      : "N/A"}
                    {movie.genres.length > 2 && (
                      <span className="text-gray-500 ml-1">
                        +{movie.genres.length - 2}
                      </span>
                    )}
                  </p>
                  <p>
                    <span className="font-medium">Director:</span>{" "}
                    {movie.directors.length > 0 ? movie.directors[0] : "N/A"}
                    {movie.directors.length > 1 && (
                      <span className="text-gray-500 ml-1">
                        +{movie.directors.length - 1}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && movies.length > 0 && (
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page <span className="font-medium">{currentPage}</span> of{" "}
              <span className="font-medium">{totalPages}</span>
            </div>
            <div className="flex gap-2">
              <div className="flex gap-2">
                <Button
                  onClick={handlePrevPage}
                  disabled={currentPage <= 1}
                  variant="secondary"
                  aria-label="Previous page"
                >
                  Previous
                </Button>
                <Button
                  onClick={handleNextPage}
                  disabled={currentPage >= totalPages}
                  variant="secondary"
                  aria-label="Next page"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
