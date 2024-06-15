"use client";

import * as React from "react";
import { CarData } from "@/lib/interfaces";
import { useFormState, useFormStatus } from "react-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { formSchema } from "./formSchema";
import { toast } from "sonner";
import { ErrorMessage } from "@hookform/error-message";
import countries from "../../../public/countries.json";
import { EditCarPayload, editCarInDb } from "@/lib/actions/actions.editCar";

const initialState = {
  error: null,
  success: null,
};

export type FormValues = z.infer<typeof formSchema>;

function formatDateToInputValue(date: Date | null): string {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function EditForm({ car }: { car: CarData }) {
  console.log(car);
  const [loading, setTransitioning] = React.useTransition();
  const [state, formAction] = useFormState(editCarInDb, initialState);
  const { pending } = useFormStatus();
  const { handleSubmit, register, formState } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vin: car.car.vin!,
      fined: car.parking_details?.fined === "true" ? true : false,
      make: car.specifications?.make!,
      model: car.specifications?.model!,
      trim: car.specifications?.trim!,
      manufacturer: car.specifications?.manufacturer!,
      bodyType: car.specifications?.bodyType!,
      country: car.specifications?.country!,
      engineType: car.specifications?.engineType!,
      titleNumber: car.specifications?.titleNumber!,
      titleState: car.specifications?.titleState!,
      color: car.specifications?.color!,
      shipping: car.car?.shipping!,
      originPort: car.car?.originPort!,
      destinationPort: car.car?.destinationPort!,
      auction: car.car?.auction!,
      status: car.parking_details?.status!,
      year: car.specifications?.year!,
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    console.log("Submitting form data:", data);
    setTransitioning(async () => {
      const payload: EditCarPayload = { id: car.car.id, values: data };
      const res = await editCarInDb(state, payload);
      if (res.error !== null) {
        toast.error(res.error);
        console.error(res.error);
      } else {
        toast.success(res.success);
        console.log(res.success);
      }
    });
  };

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
        defaultValue={car.specifications?.fuelType!}
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
          setValueAs: (v) => (v === "true" ? true : false),
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
          setValueAs: (v) => (v === "true" ? true : false),
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
        defaultValue={car.price?.totalAmount}
        {...register("price", {
          valueAsNumber: true,
        })}
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
        defaultValue={car.price_currency?.id}
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
      <input
        type="date"
        id="departureDate"
        defaultValue={formatDateToInputValue(car.car?.departureDate)}
        {...register("departureDate", {
          valueAsDate: true,
        })}
      />
      <ErrorMessage
        errors={formState.errors}
        name="departureDate"
        render={({ message }) => <p>{message}</p>}
      />
      <input
        type="date"
        id="arrivalDate"
        defaultValue={formatDateToInputValue(car.car?.arrivalDate)}
        {...register("arrivalDate", {
          valueAsDate: true,
        })}
      />
      <ErrorMessage
        errors={formState.errors}
        name="arrivalDate"
        render={({ message }) => <p>{message}</p>}
      />
      <button disabled={pending} type="submit">
        {loading ? "Loading..." : "Submit"}
      </button>
    </form>
  );
}
