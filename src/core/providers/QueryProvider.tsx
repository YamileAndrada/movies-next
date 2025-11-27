"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

/**
 * React Query Provider
 * Provides query client with caching, deduplication, and background refetch
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Cache time: how long unused data stays in cache
            gcTime: 1000 * 60 * 5, // 5 minutes
            // Stale time: how long data is considered fresh
            staleTime: 1000 * 60, // 1 minute
            // Retry failed requests
            retry: 1,
            // Refetch on window focus
            refetchOnWindowFocus: false,
            // Refetch on mount if data is stale
            refetchOnMount: true,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
