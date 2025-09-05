"use client";

import { Loader2, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FullPageLoading, InlineLoading } from '@/components/ui/loading-components';

export function LoadingState() {
  return (
    <div className="space-y-6">
      {/* Header Loading */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-64 bg-muted animate-pulse rounded"></div>
        <div className="h-6 w-20 bg-muted animate-pulse rounded"></div>
      </div>

      {/* Tabs Loading */}
      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 bg-muted animate-pulse rounded-md"></div>
        ))}
      </div>

      {/* Content Loading */}
      <div className="space-y-6">
        {/* Overview Cards Loading */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-32 bg-muted animate-pulse rounded"></div>
                <div className="h-4 w-4 bg-muted animate-pulse rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="flex items-center gap-2">
                      <div className="h-4 w-4 bg-muted animate-pulse rounded"></div>
                      <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions Loading */}
        <Card>
          <CardHeader>
            <div className="h-6 w-32 bg-muted animate-pulse rounded"></div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="h-5 w-5 bg-muted animate-pulse rounded"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
                    <div className="h-3 w-32 bg-muted animate-pulse rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function TabLoadingState() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 bg-muted animate-pulse rounded"></div>
        <div className="h-6 w-20 bg-muted animate-pulse rounded"></div>
      </div>

      <Card>
        <CardContent className="p-6">
          <InlineLoading message="Loading tab content..." size="md" />
        </CardContent>
      </Card>
    </div>
  );
}
