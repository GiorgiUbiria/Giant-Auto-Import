"use client";

import { Input } from "@/components/ui/input";
import { assignRecieverAction } from "@/lib/actions/carActions";
import { useServerActionMutation } from "@/lib/hooks/server-action-hooks";
import { useQueryClient } from "@tanstack/react-query";
import { Edit2, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export const Reciever = ({
  reciever,
  vin,
}: {
  reciever: string | null;
  vin: string;
}) => {
  const queryClient = useQueryClient();
  const [localReciever, setLocalReciever] = useState<string | null>(reciever);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(reciever || "");

  const { isPending, mutate } = useServerActionMutation(assignRecieverAction, {
    onError: (error) => {
      const errorMessage = error?.data || "Failed to assign reciever";
      toast.error(errorMessage);
      setIsEditing(false);
      setInputValue(localReciever || "");
    },
    onSuccess: async ({ data }) => {
      const successMessage = data?.message || "Reciever assigned successfully!";
      toast.success(successMessage);
      setLocalReciever(data?.reciever || localReciever);
      setIsEditing(false);

      await queryClient.invalidateQueries({
        queryKey: ["getCars"],
        refetchType: "active",
      });
    },
  });

  const handleSave = () => {
    if (inputValue.trim() && inputValue !== localReciever) {
      mutate({ reciever: inputValue.trim(), vin: vin });
    } else {
      setIsEditing(false);
      setInputValue(localReciever || "");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setInputValue(localReciever || "");
    }
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center h-full min-h-[40px]">
        <Loader2 className="animate-spin w-5 h-5 text-primary" />
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Enter reciever name"
          className="h-8"
          autoFocus
        />
        <Button
          size="sm"
          variant="ghost"
          onClick={handleSave}
          className="h-8 w-8 p-0"
          disabled={!inputValue.trim() || inputValue === localReciever}
        >
          <Save className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 min-h-[40px]">
      <span className="font-medium">
        {localReciever || <span className="text-muted-foreground">Not assigned</span>}
      </span>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setIsEditing(true)}
        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Edit2 className="h-4 w-4" />
      </Button>
    </div>
  );
};
