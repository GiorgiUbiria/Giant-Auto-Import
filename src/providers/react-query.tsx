"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState, useEffect } from "react"

function ReactQueryProvider({ children }: React.PropsWithChildren) {
  const [client] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Increase stale time to reduce hydration issues and excessive refetching
        staleTime: 10 * 60 * 1000, // 10 minutes - increased from 5
        gcTime: 15 * 60 * 1000, // 15 minutes - increased from 10
        retry: (failureCount, error) => {
          // Don't retry on 401/403 errors
          if (error && typeof error === 'object' && 'status' in error) {
            const status = (error as any).status;
            if (status === 401 || status === 403) return false;
          }
          return failureCount < 1; // Reduced from 2 to 1
        },
        refetchOnWindowFocus: false,
        refetchOnReconnect: false, // Changed from true to false
        refetchOnMount: false, // Changed from true to false
        // Add network mode for better error handling
        networkMode: 'online',
        // Add suspense mode for better SSR
      },
      mutations: {
        retry: 1,
        networkMode: 'online',
      },
    },
  }))

  // Add hydration safety check
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Prevent hydration mismatch by not rendering until hydrated
  if (!isHydrated) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

export default ReactQueryProvider
