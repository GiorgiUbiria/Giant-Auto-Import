"use client";

import { DataTable } from "@/components/data-table";
import { getCarsForUserAction } from "@/lib/actions/carActions";
import { useServerActionQuery } from "@/lib/hooks/server-action-hooks";
import { AlertCircle, Loader2 } from "lucide-react";
import { columns } from "./columns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";

const LoadingState = () => (
  <div className="w-full h-[50vh] grid place-items-center">
    <div className="flex flex-col items-center gap-2">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground">Loading your cars...</p>
    </div>
  </div>
);

const ErrorState = ({ refetch }: { refetch: () => void }) => (
      <div className="py-10 px-4 max-w-2xl mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="flex flex-col gap-4">
            <p>Failed to load your cars. Please try again.</p>
            <Button
              variant="outline"
              onClick={() => refetch()}
              className="w-fit"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );

const EmptyState = () => (
      <div className="py-10 px-4 max-w-2xl mx-auto">
        <Alert>
          <AlertTitle>No cars found</AlertTitle>
          <AlertDescription>
            You haven&apos;t added any cars yet. Start by adding your first car.
          </AlertDescription>
        </Alert>
      </div>
    );

export const Client = ({ userId }: { userId: string }) => {
  const { isLoading, data, error, refetch } = useServerActionQuery(getCarsForUserAction, {
    input: {
      id: userId,
    },
    queryKey: ["getCarsForUser", userId],
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  if (error) {
    return <ErrorState refetch={refetch} />;
  }

  return (
    <Suspense fallback={<LoadingState />}>
      {isLoading ? (
        <LoadingState />
      ) : !data?.length ? (
        <EmptyState />
      ) : (
        <DataTable columns={columns} data={data} filterKey="vin" />
      )}
    </Suspense>
  );
};
