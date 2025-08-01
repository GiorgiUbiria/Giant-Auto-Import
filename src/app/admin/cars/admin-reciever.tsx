"use client";

import { Input } from "@/components/ui/input";
import { assignRecieverAction } from "@/lib/actions/carActions";
import { useServerActionMutation } from "@/lib/hooks/server-action-hooks";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const AdminReciever = ({
  reciever,
  vin,
  translations,
}: {
  reciever: string | null;
  vin: string;
  translations: {
    noReceiver: string;
    assignSuccess: string;
    assignError: string;
  };
}) => {
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [newReciever, setNewReciever] = useState(reciever || "");

  const { isPending, mutate } = useServerActionMutation(assignRecieverAction, {
    onError: (error) => {
      const errorMessage = error?.data || translations.assignError;
      toast.error(errorMessage);
    },
    onSuccess: async ({ data }) => {
      const successMessage = data?.message || translations.assignSuccess;
      toast.success(successMessage);

      // Invalidate all getCars queries to ensure UI updates
      await queryClient.invalidateQueries({
        queryKey: ["getCars"],
        exact: false, // This will invalidate all queries that start with ["getCars"]
        refetchType: "active",
      });

      // Force refetch to ensure immediate UI update
      await queryClient.refetchQueries({
        queryKey: ["getCars"],
        exact: false,
        type: "active",
      });

      setIsEditing(false);
    },
  });

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      mutate({ reciever: newReciever.trim() === "" ? null : newReciever, vin });
    }
  };

  const handleBlur = () => {
    mutate({ reciever: newReciever.trim() === "" ? null : newReciever, vin });
    setIsEditing(false);
  };

  return (
    <div className="py-10 text-primary">
      {isPending ? (
        <div className="w-full h-full grid place-items-center">
          <Loader2 className="animate-spin text-center" />
        </div>
      ) : isEditing ? (
        <Input
          type="text"
          value={newReciever}
          onChange={(e) => setNewReciever(e.target.value)}
          onKeyDown={handleKeyPress}
          onBlur={handleBlur}
          autoFocus
        />
      ) : (
        <p
          onClick={() => setIsEditing(true)}
          className="cursor-pointer hover:underline"
        >
          {reciever || translations.noReceiver}
        </p>
      )}
    </div>
  );
};
