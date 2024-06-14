"use client";

import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { addCarToDb } from "@/lib/actions/actions.addCar";
import { formSchema2 } from "./formSchema2";

const initialState = {
  error: null,
  success: null,
};

type FormValues = z.infer<typeof formSchema2>;

export default function AddForm() {
  const [loading, setTransitioning] = React.useTransition();
  const [state, formAction] = useFormState(addCarToDb, initialState);
  const { pending } = useFormStatus();
  const methods = useForm<FormValues>({
    resolver: zodResolver(formSchema2),
    defaultValues: {
      vin: "",
      departureDate: new Date(),
      fined: false,
      price: "0",
      priceCurrency: "GEL",
    },
  });

  const onSubmit = methods.handleSubmit((data) => {
    setTransitioning(async () => {
      const res = await addCarToDb(state, data);
      if (res.error !== null) {
        console.error(res.error);
      } else {
        console.log(res.success);
      }
    });
  });

  return (
    <form onSubmit={onSubmit}>
      <input
        type="text"
        placeholder="vin"
        id="vin"
        {...methods.register("vin")}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      />
      <input
        type="date"
        id="departureDate"
        {...methods.register("departureDate")}
      />
      <input
        type="checkbox"
        id="fined"
        {...methods.register("fined")}
      />
      <input
        type="number"
        placeholder="price"
        id="price"
        {...methods.register("price")}
      />
      <select
        id="priceCurrency"
        {...methods.register("priceCurrency")}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      >
        <option value="GEL">GEL</option>
        <option value="USD">USD</option>
        <option value="EUR">EUR</option>
      </select>
      <button disabled={pending} type="submit">Submit</button>
    </form>
  );
}
