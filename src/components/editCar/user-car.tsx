"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import { toast } from "sonner";
import { CarData, User, UserWithCarsAndSpecs } from "@/lib/interfaces";
import Spinner from "../spinner";
import { DbUser, assignCarToUser } from "@/lib/actions/dbActions";
import Link from "next/link";

const formSchema = z.object({
  user: z.string(),
});

export type FormValues = z.infer<typeof formSchema>;

export default function UserCar({
  car,
  userId,
  users,
  carUser,
}: {
  car: CarData;
  userId: string;
  users: DbUser[] | undefined;
  carUser: UserWithCarsAndSpecs | undefined;
}) {
  const [loading, setTransitioning] = React.useTransition();
  const { pending } = useFormStatus();
  const { handleSubmit, register, formState } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    console.log("Submitting form data:", data);
    const res = await assignCarToUser(data.user, car.car.vin!);
    setTransitioning(async () => {
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
        <div className="grid gap-6 mb-6 md:grid-cols-1">
          <div>
            <label
              htmlFor="priceCurrency"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Users
            </label>
            <select
              id="user"
              {...register("user")}
              className="bg-gray-300 dark:bg-gray-900 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 pb-2.5 pt-4 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
              {users?.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
            <ErrorMessage
              errors={formState.errors}
              name="user"
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
            className="w-full py-2.5 px-5 me-2 mb-2 text-sm font-medium text-black focus:outline-none bg-gray-300 rounded-lg border border-gray-200 hover:bg-gray-300 dark:bg-gray-900-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-300 dark:bg-gray-900-800 dark:text-gray-900 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-300 dark:bg-gray-900-700"
          >
            {pending ? <Spinner /> : "Assign to the user"}
          </button>
        </div>
      </form>
      <div>
        <p> Car is currently assigned to the following user: </p>
        <Link href={`/admin/users/${userId}`}>{carUser?.user.name}</Link>
      </div>
    </div>
  );
}
