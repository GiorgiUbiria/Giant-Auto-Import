"use client";

import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { addCarToDb } from "@/lib/actions/actions.addCar";
import { formSchema } from "./formSchema";
import { toast } from "sonner";
import { ErrorMessage } from "@hookform/error-message";
import countries from "../../../public/countries.json";

const initialState = {
  error: null,
  success: null,
};

type FormValues = z.infer<typeof formSchema>;

export default function AddForm() {
  const [loading, setTransitioning] = React.useTransition();
  const [state, formAction] = useFormState(addCarToDb, initialState);
  const { pending } = useFormStatus();
  const { handleSubmit, register, formState } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vin: "",
      fined: false,
      price: "0",
      priceCurrency: "1",
      make: "",
      model: "",
      trim: "",
      manufacturer: "",
      bodyType: "",
      country: "",
      engineType: "",
      titleNumber: "",
      titleState: "",
      color: "",
      fuelType: "",
      shipping: "",
      originPort: "",
      destinationPort: "",
      auction: "",
      status: "",
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    console.log("Submitting form data:", data); // Debug log
    setTransitioning(async () => {
      const res = await addCarToDb(state, data);
      if (res.error !== null) {
        toast.error(res.error);
        console.error(res.error);
      } else {
        toast.success(res.success);
        console.log(res.success);
      }
    });
  };

  // Log validation errors to the console
  React.useEffect(() => {
    if (Object.keys(formState.errors).length > 0) {
      console.error("Validation errors:", formState.errors);
    }
  }, [formState.errors]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        type="text"
        placeholder="vin"
        id="vin"
        {...register("vin")}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      />
      <ErrorMessage
        errors={formState.errors}
        name="vin"
        render={({ message }) => <p>{message}</p>}
      />
      <input
        type="number"
        placeholder="year"
        id="year"
        {...register("year")}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      />
      <ErrorMessage
        errors={formState.errors}
        name="year"
        render={({ message }) => <p>{message}</p>}
      />
      <input
        type="text"
        placeholder="make"
        id="make"
        {...register("make")}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      />
      <ErrorMessage
        errors={formState.errors}
        name="make"
        render={({ message }) => <p>{message}</p>}
      />
      <input
        type="text"
        placeholder="model"
        id="model"
        {...register("model")}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      />
      <ErrorMessage
        errors={formState.errors}
        name="model"
        render={({ message }) => <p>{message}</p>}
      />
      <input
        type="text"
        placeholder="manufacturer"
        id="manufacturer"
        {...register("manufacturer")}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      />
      <ErrorMessage
        errors={formState.errors}
        name="manufacturer"
        render={({ message }) => <p>{message}</p>}
      />
      <select
        id="country"
        {...register("country")}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      >
        {countries.map((country: { name: string; code: string }) => (
          <option key={country.code} value={country.name}>
            {country.name}
          </option>
        ))}
      </select>
      <ErrorMessage
        errors={formState.errors}
        name="country"
        render={({ message }) => <p>{message}</p>}
      />
      <select
        id="status"
        {...register("status")}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      >
        <option value="Pending">Pending</option>
        <option value="OnHand">On Hand</option>
        <option value="Loaded">Loaded</option>
        <option value="InTransit">In Transit</option>
        <option value="Fault">Fault</option>
      </select>
      <ErrorMessage
        errors={formState.errors}
        name="status"
        render={({ message }) => <p>{message}</p>}
      />
      <select
        id="fuelType"
        {...register("fuelType")}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      >
        <option value="Gasoline">Gasoline</option>
        <option value="Diesel">Diesel</option>
        <option value="Electric">Electric</option>
        <option value="Hybrid">Hybrid</option>
        <option value="Other">Other</option>
      </select>
      <ErrorMessage
        errors={formState.errors}
        name="fuelType"
        render={({ message }) => <p>{message}</p>}
      />
      <input
        type="text"
        placeholder="engineType"
        id="engineType"
        {...register("engineType")}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      />
      <ErrorMessage
        errors={formState.errors}
        name="engineType"
        render={({ message }) => <p>{message}</p>}
      />
      <input
        type="text"
        placeholder="titleNumber"
        id="titleNumber"
        {...register("titleNumber")}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      />
      <ErrorMessage
        errors={formState.errors}
        name="titleNumber"
        render={({ message }) => <p>{message}</p>}
      />
      <input
        type="text"
        placeholder="titleState"
        id="titleState"
        {...register("titleState")}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      />
      <ErrorMessage
        errors={formState.errors}
        name="titleState"
        render={({ message }) => <p>{message}</p>}
      />
      <input
        type="text"
        placeholder="color"
        id="color"
        {...register("color")}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      />
      <ErrorMessage
        errors={formState.errors}
        name="color"
        render={({ message }) => <p>{message}</p>}
      />
      <input
        type="text"
        placeholder="bodyType"
        id="bodyType"
        {...register("bodyType")}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      />
      <ErrorMessage
        errors={formState.errors}
        name="bodyType"
        render={({ message }) => <p>{message}</p>}
      />
      <input
        type="text"
        placeholder="trim"
        id="trim"
        {...register("trim")}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      />
      <ErrorMessage
        errors={formState.errors}
        name="trim"
        render={({ message }) => <p>{message}</p>}
      />
      <input
        type="text"
        placeholder="destinationPort"
        id="destinationPort"
        {...register("destinationPort")}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      />
      <ErrorMessage
        errors={formState.errors}
        name="destinationPort"
        render={({ message }) => <p>{message}</p>}
      />
      <input
        type="text"
        placeholder="originPort"
        id="originPort"
        {...register("originPort")}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      />
      <ErrorMessage
        errors={formState.errors}
        name="originPort"
        render={({ message }) => <p>{message}</p>}
      />
      <input
        type="text"
        placeholder="auction"
        id="auction"
        {...register("auction")}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      />
      <ErrorMessage
        errors={formState.errors}
        name="auction"
        render={({ message }) => <p>{message}</p>}
      />
      <input
        type="text"
        placeholder="shipping"
        id="shipping"
        {...register("shipping")}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      />
      <ErrorMessage
        errors={formState.errors}
        name="shipping"
        render={({ message }) => <p>{message}</p>}
      />
      <select
        id="fined"
        {...register("fined", {
          setValueAs: v => v === "true" ? true : false,
        })}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      >
        <option value="true">Yes</option>
        <option value="false">No</option>
      </select>
      <ErrorMessage
        errors={formState.errors}
        name="fined"
        render={({ message }) => <p>{message}</p>}
      />
      <select
        id="arrived"
        {...register("arrived", {
          setValueAs: v => v === "true" ? true : false,
        })}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      >
        <option value="true">Yes</option>
        <option value="false">No</option>
      </select>
      <ErrorMessage
        errors={formState.errors}
        name="arrived"
        render={({ message }) => <p>{message}</p>}
      />
      <input
        type="number"
        placeholder="price"
        id="price"
        {...register("price")}
      />
      <ErrorMessage
        errors={formState.errors}
        name="price"
        render={({ message }) => <p>{message}</p>}
      />
      <select
        id="priceCurrency"
        {...register("priceCurrency")}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      >
        <option value="1">GEL</option>
        <option value="2">USD</option>
        <option value="3">EUR</option>
      </select>
      <ErrorMessage
        errors={formState.errors}
        name="priceCurrency"
        render={({ message }) => <p>{message}</p>}
      />
      <input type="date" id="departureDate" {...register("departureDate", {
        valueAsDate: true
      })} />
      <ErrorMessage
        errors={formState.errors}
        name="departureDate"
        render={({ message }) => <p>{message}</p>}
      />
      <input type="date" id="arrivalDate" {...register("arrivalDate", {
        valueAsDate: true
      })} />
      <ErrorMessage
        errors={formState.errors}
        name="arrivalDate"
        render={({ message }) => <p>{message}</p>}
      />
      <input type="date" id="parkingDateString" {...register("parkingDateString", {
        valueAsDate: true
      })} />
      <ErrorMessage
        errors={formState.errors}
        name="parkingDateString"
        render={({ message }) => <p>{message}</p>}
      />
      <button disabled={pending} type="submit">
        Submit
      </button>
    </form>
  );
}
