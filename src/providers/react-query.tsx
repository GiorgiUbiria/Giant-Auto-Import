"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"

function ReactQueryProvider({ children }: React.PropsWithChildren) {
  const [client] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Reduce stale time for better real-time updates
        staleTime: 2 * 60 * 1000, // 2 minutes (reduced from 5)
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
        retry: 1, // Reduce retry attempts
        refetchOnWindowFocus: false, // Prevent refetch on window focus
        refetchOnReconnect: true, // Only refetch on reconnect
        // Add refetch on mount to ensure fresh data
        refetchOnMount: true,
      },
      mutations: {
        retry: 1, // Reduce mutation retries
        // Add network mode for better error handling
        networkMode: 'online',
      },
    },
  }))

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

export default ReactQueryProvider
