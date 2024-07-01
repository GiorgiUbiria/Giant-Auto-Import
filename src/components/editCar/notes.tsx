"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import { toast } from "sonner";
import Spinner from "../spinner";
import { createNote } from "@/lib/actions/actions.notes";
import { CarData } from "@/lib/interfaces";
import { NotesTable } from "./notes-table";
import { columns } from "./notes-table-columns";
import { warn } from "console";

const formSchema = z.object({
  note: z.string(),
});

export type FormValues = z.infer<typeof formSchema>;

export default function Notes({
  car,
  userId,
}: {
  car: CarData;
  userId: string;
}) {
  console.log(car.note);
  const [loading, setTransitioning] = React.useTransition();
  const { pending } = useFormStatus();
  const { handleSubmit, register, formState } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    console.log("Submitting form data:", data);
    setTransitioning(async () => {
      const res = await createNote(userId, car.car.id, data.note);
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
    <div className="flex flex-col">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 mb-6 md:grid-cols-2">
          <div>
            <label
              htmlFor="note"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Note 
            </label>
            <input
              type="text"
              placeholder="note text..."
              id="transactionAmount"
              {...register("note")}
              className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-gray-900 rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            />
            <ErrorMessage
              errors={formState.errors}
              name="note"
              render={({ message }) => (
                <p className="text-red-500 text-sm">{message}</p>
              )}
            />
          </div>
        </div>
        <div className="grid gap-6 mb-6 md:grid-cols1-1">
          <button
            disabled={pending}
            type="submit"
            className="w-full py-2.5 px-5 me-2 mb-2 text-sm font-medium text-black focus:outline-none bg-gray-300 rounded-lg border border-gray-200 hover:bg-gray-900-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-900-800 dark:text-gray-900 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-900-700"
          >
            {pending ? <Spinner /> : "Create Note"}
          </button>
        </div>
      </form>

      <div>
        <h3 className="text-xl font-bold mb-4">All Notes</h3>
        <div>
          {car.note && car.note.length > 0 ? (
            <NotesTable columns={columns} data={car.note} />
          ) : (
            <p>No notes...</p>
          )}
        </div>
      </div>
    </div>
  );
}
