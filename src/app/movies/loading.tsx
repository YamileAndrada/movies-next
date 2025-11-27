/**
 * Loading state for Movies page
 * Shows skeleton UI while page is loading
 */
export default function MoviesLoading() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-10 bg-gray-200 rounded w-64 mb-2 animate-pulse" />
          <div className="h-6 bg-gray-200 rounded w-96 animate-pulse" />
        </div>

        {/* Filters Skeleton */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="h-7 bg-gray-200 rounded w-24 mb-4 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
                <div className="h-10 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <th key={i} className="px-4 py-3">
                      <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
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
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden p-4 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow border border-gray-200 p-4"
              >
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-32 mb-2 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-40 animate-pulse" />
              </div>
            ))}
          </div>

          {/* Pagination Skeleton */}
          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="h-5 bg-gray-200 rounded w-24 animate-pulse" />
              <div className="flex gap-2">
                <div className="h-10 bg-gray-200 rounded w-24 animate-pulse" />
                <div className="h-10 bg-gray-200 rounded w-24 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
