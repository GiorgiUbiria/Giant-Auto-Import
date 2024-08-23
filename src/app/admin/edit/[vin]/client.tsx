"use client";

import { EditCarForm } from "@/components/edit-car-form";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/tabLinks";
import { getCarAction } from "@/lib/actions/carActions";
import { useServerActionQuery } from "@/lib/hooks/server-action-hooks";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { EditImages } from "./edit-images";

export const Client = ({ vin }: { vin: string }) => {
  const { isLoading, data } = useServerActionQuery(getCarAction, {
    input: {
      vin: vin,
    },
    queryKey: ["getCar", vin],
  });

  const LoadingState = () => {
    return (
      <div className="w-full h-full grid place-items-center">
        <Loader2 className="animate-spin text-center" />
      </div>
    );
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mt-8">
      <h1 className="text-2xl sm:text-3xl text-primary my-4 text-center break-words">
        Edit Car with VIN - <Link href={`/car/${vin}`}>{vin}</Link>
      </h1>
      {isLoading ? (
        <LoadingState />
      ) : (
        <Tabs
          defaultValue="form"
          searchParam="type"
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 gap-2">
            <TabsTrigger value="form">Form</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
          </TabsList>
          <TabsContent value="form">
            <EditCarForm car={data!} />
          </TabsContent>
          <TabsContent value="images">
            <EditImages vin={vin} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};
