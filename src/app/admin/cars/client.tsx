"use client";

import { DataTable } from "@/components/data-table";
import { getCarsAction } from "@/lib/actions/carActions";
import { useServerActionQuery } from "@/lib/hooks/server-action-hooks";
import { Loader2 } from "lucide-react";
import { columns } from "./columns";

export const Client = () => {
  const { isLoading, data, error } = useServerActionQuery(getCarsAction, {
    input: undefined,
    queryKey: ["getCars"],
  });

  const LoadingState = () => {
    return (
      <div className="w-full h-[400px] flex justify-center items-center">
        <Loader2 className="animate-spin text-center" />
      </div>
    );
  };

  const ErrorState = () => {
    return (
      <div className="w-full h-[400px] flex justify-center items-center">
        <p>Error loading car data. Please try again later.</p>
        <p>{error?.message}</p>
      </div>
    );
  };

  return (
    <div className="py-10 text-primary">
      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState />
      ) : data && data.length > 0 ? (
        <DataTable columns={columns} data={data} filterKey="vin" />
      ) : (
        <p>No cars found.</p>
      )}
    </div>
  );
};
