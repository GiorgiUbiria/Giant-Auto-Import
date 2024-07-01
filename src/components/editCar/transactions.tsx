"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import { toast } from "sonner";
import { addTransaction } from "@/lib/actions/actions.transactions";
import { CarData } from "@/lib/interfaces";
import Spinner from "../spinner";

const formSchema = z.object({
  transactionAmount: z
    .number({ message: "Transaction amount should be a number" })
    .min(1, { message: "Transaction amount should be greater than 0" }),
  priceCurrency: z.enum(["1", "2", "3"], {
    message: "Price Currency must be between 1 and 3.",
  }),
});

export type FormValues = z.infer<typeof formSchema>;

export default function Transactions({
  car,
  userId,
}: {
  car: CarData;
  userId: string;
}) {
  const [loading, setTransitioning] = React.useTransition();
  const { pending } = useFormStatus();
  const { handleSubmit, register, formState } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      priceCurrency: "1",
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    console.log("Submitting form data:", data);
    setTransitioning(async () => {
      const res = await addTransaction(
        car.car.id,
        userId,
        car.price?.priceId!,
        data.transactionAmount,
        Number(data.priceCurrency),
      );
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
              htmlFor="price"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Price
            </label>
            <input
              type="number"
              placeholder="transaction amount"
              id="transactionAmount"
              {...register("transactionAmount", {
                valueAsNumber: true,
              })}
              className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-gray-900 rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            />
            <ErrorMessage
              errors={formState.errors}
              name="transactionAmount"
              render={({ message }) => (
                <p className="text-red-500 text-sm">{message}</p>
              )}
            />
          </div>
          <div>
            <label
              htmlFor="priceCurrency"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Currency
            </label>
            <select
              id="priceCurrency"
              {...register("priceCurrency")}
              defaultValue={car.price_currency?.id}
              className="bg-gray-900 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 pb-2.5 pt-4 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
              <option value="1">GEL</option>
              <option value="2">USD</option>
              <option value="3">EUR</option>
            </select>
            <ErrorMessage
              errors={formState.errors}
              name="priceCurrency"
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
            {pending ? <Spinner /> : "Add Transaction"}
          </button>
        </div>
      </form>

      <div className="flex justify-end">All transactions</div>
    </div>
  );
}