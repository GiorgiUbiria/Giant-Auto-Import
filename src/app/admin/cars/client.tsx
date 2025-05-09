"use client";

import { DataTable } from "@/components/data-table";
import { Loader2 } from "lucide-react";
import { columns } from "./columns";
import { useQuery } from "@tanstack/react-query";

const fetchCars = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch("/api/cars", {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.details || 'Failed to fetch cars');
    }
    
    return response.json();
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out after 30 seconds');
    }
    throw error;
  }
};
export const Client = () => {
  const { isLoading, data, error } = useQuery({
    queryKey: ["getCars"],
    queryFn: fetchCars,
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
