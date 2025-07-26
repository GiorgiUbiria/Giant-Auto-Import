"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"

function ReactQueryProvider({ children }: React.PropsWithChildren) {
  const [client] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Reduce unnecessary refetches
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
        retry: 1, // Reduce retry attempts
        refetchOnWindowFocus: false, // Prevent refetch on window focus
        refetchOnReconnect: true, // Only refetch on reconnect
      },
      mutations: {
        retry: 1, // Reduce mutation retries
      },
    },
  }))

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

export default ReactQueryProvider
