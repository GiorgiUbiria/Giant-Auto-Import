"use client";

import { deleteCarFromDb } from "@/lib/actions/actions.deleteCar";
import { Button } from "../ui/button";
import { toast } from "sonner";
import React from "react";

export default function DeleteButton({ carId }: { carId: number }) {
  const [loading, setTransitioning] = React.useTransition();
  const deleteAction = async () => {
    setTransitioning(async () => {
      const res = await deleteCarFromDb(carId);
      if (res.error !== null) {
        toast.error(res.error);
        console.error(res.error);
      } else {
        toast.success(res.success);
        console.log(res.success);
      }
    });
  };
  return (
    <Button onClick={deleteAction} disabled={loading}>
      Remove Car
    </Button>
  );
}
