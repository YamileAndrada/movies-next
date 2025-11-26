/**
 * Loading component for Directors page
 * Displays while the page is being loaded
 */
export default function DirectorsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl mx-auto p-6">
          {/* Header skeleton */}
          <div className="mb-8">
            <div className="h-10 w-64 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-6 w-96 bg-gray-200 rounded animate-pulse" />
          </div>

          {/* Form skeleton */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="h-5 w-40 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-12 w-full bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="flex items-end">
                <div className="h-12 w-32 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>

          <span className="sr-only">Loading directors page...</span>
        </div>
      </div>
    </div>
  );
}
