"use client";

import { DataTable } from "@/components/data-table";
import { getCarsForUserAction } from "@/lib/actions/carActions";
import { useServerActionQuery } from "@/lib/hooks/server-action-hooks";
import { Loader2 } from "lucide-react";
import { columns } from "./columns";

export const Client = ({ userId }: { userId: string }) => {
  const { isLoading, data } = useServerActionQuery(getCarsForUserAction, {
    input: {
      id: userId,
    },
    queryKey: ["getCarsForUser", userId],
  });

  const LoadingState = () => {
    return (
      <div className="w-full h-full grid place-items-center">
        <Loader2 className="animate-spin text-center" />
      </div>
    );
  };

  return (
    <div className="py-10 text-primary">
      {isLoading ? (
        <LoadingState />
      ) : (
        <DataTable columns={columns} data={data!} />
      )}
    </div>
  );
};
