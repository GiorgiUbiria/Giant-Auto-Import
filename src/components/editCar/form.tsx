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
import { colors } from "../../../public/colors";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Spinner from "../spinner";
import { useRouter } from "next/navigation";

const initialState = {
  error: null,
  success: undefined,
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
  const router = useRouter();
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
        router.refresh();
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
      <div className="grid gap-6 mb-6 md:grid-cols-2">
        <div>
          <label
            htmlFor="vin"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            VIN
          </label>
          <input
            type="text"
            id="vin"
            className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-gray-300 dark:bg-gray-900 rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            {...register("vin")}
            placeholder="vin"
          />
          <ErrorMessage
            errors={formState.errors}
            name="vin"
            render={({ message }) => (
              <p className="text-red-500 text-sm">{message}</p>
            )}
          />
        </div>
        <div>
          <label
            htmlFor="year"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Year
          </label>
          <input
            type="number"
            placeholder="year"
            id="year"
            {...register("year")}
            className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-gray-300 dark:bg-gray-900 rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
          />
          <ErrorMessage
            errors={formState.errors}
            name="year"
            render={({ message }) => (
              <p className="text-red-500 text-sm">{message}</p>
            )}
          />
        </div>
        <div>
          <label
            htmlFor="make"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Make
          </label>
          <input
            type="text"
            placeholder="make"
            id="make"
            {...register("make")}
            className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-gray-300 dark:bg-gray-900 rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
          />
          <ErrorMessage
            errors={formState.errors}
            name="make"
            render={({ message }) => (
              <p className="text-red-500 text-sm">{message}</p>
            )}
          />
        </div>
        <div>
          <label
            htmlFor="model"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Model
          </label>
          <input
            type="text"
            placeholder="model"
            id="model"
            {...register("model")}
            className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-gray-300 dark:bg-gray-900 rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
          />
          <ErrorMessage
            errors={formState.errors}
            name="model"
            render={({ message }) => (
              <p className="text-red-500 text-sm">{message}</p>
            )}
          />
        </div>
        <div>
          <label
            htmlFor="manufacturer"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Manufacturer
          </label>
          <input
            type="text"
            placeholder="manufacturer"
            id="manufacturer"
            {...register("manufacturer")}
            className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-gray-300 dark:bg-gray-900 rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
          />
          <ErrorMessage
            errors={formState.errors}
            name="manufacturer"
            render={({ message }) => (
              <p className="text-red-500 text-sm">{message}</p>
            )}
          />
        </div>
        <div>
          <label
            htmlFor="trim"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Trim
          </label>
          <input
            type="text"
            placeholder="trim"
            id="trim"
            {...register("trim")}
            className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-gray-300 dark:bg-gray-900 rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
          />
          <ErrorMessage
            errors={formState.errors}
            name="trim"
            render={({ message }) => (
              <p className="text-red-500 text-sm">{message}</p>
            )}
          />
        </div>
      </div>
      <div className="grid gap-6 mb-6 md:grid-cols-3">
        <div>
          <label
            htmlFor="country"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Country
          </label>
          <select
            id="country"
            {...register("country")}
            className="bg-gray-300 dark:bg-gray-900 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
            render={({ message }) => (
              <p className="text-red-500 text-sm">{message}</p>
            )}
          />
        </div>
        <div>
          <label
            htmlFor="status"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Status
          </label>
          <select
            id="status"
            {...register("status")}
            className="bg-gray-300 dark:bg-gray-900 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
            render={({ message }) => (
              <p className="text-red-500 text-sm">{message}</p>
            )}
          />
        </div>
        <div>
          <label
            htmlFor="fuelType"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Fuel Type
          </label>
          <select
            id="fuelType"
            {...register("fuelType")}
            className="bg-gray-300 dark:bg-gray-900 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
            render={({ message }) => (
              <p className="text-red-500 text-sm">{message}</p>
            )}
          />
        </div>
      </div>
      <div className="grid gap-6 mb-6 md:grid-cols-2">
        <div>
          <label
            htmlFor="engineType"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Engine Type
          </label>
          <input
            type="text"
            placeholder="engine type"
            id="engineType"
            {...register("engineType")}
            className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-gray-300 dark:bg-gray-900 rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
          />
          <ErrorMessage
            errors={formState.errors}
            name="engineType"
            render={({ message }) => (
              <p className="text-red-500 text-sm">{message}</p>
            )}
          />
        </div>
        <div>
          <label
            htmlFor="titleNumber"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Title Number
          </label>
          <input
            type="text"
            placeholder="title number"
            id="titleNumber"
            {...register("titleNumber")}
            className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-gray-300 dark:bg-gray-900 rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
          />
          <ErrorMessage
            errors={formState.errors}
            name="titleNumber"
            render={({ message }) => (
              <p className="text-red-500 text-sm">{message}</p>
            )}
          />
        </div>
        <div>
          <label
            htmlFor="titleState"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Title State
          </label>
          <input
            type="text"
            placeholder="title state"
            id="titleState"
            {...register("titleState")}
            className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-gray-300 dark:bg-gray-900 rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
          />
          <ErrorMessage
            errors={formState.errors}
            name="titleState"
            render={({ message }) => (
              <p className="text-red-500 text-sm">{message}</p>
            )}
          />
        </div>
        <div>
          <label
            htmlFor="bodyType"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Body Type
          </label>
          <input
            type="text"
            placeholder="body type"
            id="bodyType"
            {...register("bodyType")}
            className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-gray-300 dark:bg-gray-900 rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
          />
          <ErrorMessage
            errors={formState.errors}
            name="bodyType"
            render={({ message }) => (
              <p className="text-red-500 text-sm">{message}</p>
            )}
          />
        </div>
      </div>
      <div className="grid gap-6 mb-6 md:grid-cols-2">
        <div>
          <label
            htmlFor="destinationPort"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Destination Port
          </label>
          <input
            type="text"
            placeholder="destinationPort"
            id="destinationPort"
            {...register("destinationPort")}
            className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-gray-300 dark:bg-gray-900 rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
          />
          <ErrorMessage
            errors={formState.errors}
            name="destinationPort"
            render={({ message }) => (
              <p className="text-red-500 text-sm">{message}</p>
            )}
          />
        </div>
        <div>
          <label
            htmlFor="originPort"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Origin Port
          </label>
          <input
            type="text"
            placeholder="originPort"
            id="originPort"
            {...register("originPort")}
            className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-gray-300 dark:bg-gray-900 rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
          />
          <ErrorMessage
            errors={formState.errors}
            name="originPort"
            render={({ message }) => (
              <p className="text-red-500 text-sm">{message}</p>
            )}
          />
        </div>
      </div>
      <div className="grid gap-6 mb-6 md:grid-cols-3">
        <div>
          <label
            htmlFor="color"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Color
          </label>
          <Select {...register("color")}>
            <SelectTrigger className="w-full bg-gray-300 dark:bg-gray-900">
              <SelectValue placeholder="Select a color" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Colors</SelectLabel>
                {colors.map((color) => (
                  <SelectItem key={color.name} value={color.name}>
                    <div className="flex gap-2">
                      <div
                        className="w-6 h-6 rounded-full border-2 border-gray-600"
                        style={{ backgroundColor: color.hex }}
                      />
                      {color.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <ErrorMessage
            errors={formState.errors}
            name="color"
            render={({ message }) => (
              <p className="text-red-500 text-sm">{message}</p>
            )}
          />
        </div>
        <div>
          <label
            htmlFor="auction"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Auction
          </label>
          <input
            type="text"
            placeholder="auction"
            id="auction"
            {...register("auction")}
            className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-gray-300 dark:bg-gray-900 rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
          />
          <ErrorMessage
            errors={formState.errors}
            name="auction"
            render={({ message }) => (
              <p className="text-red-500 text-sm">{message}</p>
            )}
          />
        </div>
        <div>
          <label
            htmlFor="shipping"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Shipping
          </label>
          <input
            type="text"
            placeholder="shipping"
            id="shipping"
            {...register("shipping")}
            className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-gray-300 dark:bg-gray-900 rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
          />
          <ErrorMessage
            errors={formState.errors}
            name="shipping"
            render={({ message }) => (
              <p className="text-red-500 text-sm">{message}</p>
            )}
          />
        </div>
      </div>
      <div className="grid gap-6 mb-6 md:grid-cols-4">
        <div>
          <label
            htmlFor="fined"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Fined
          </label>
          <select
            id="fined"
            {...register("fined", {
              setValueAs: (v) => (v === "true" ? true : false),
            })}
            className="bg-gray-300 dark:bg-gray-900 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 pb-2.5 pt-4 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
          <ErrorMessage
            errors={formState.errors}
            name="fined"
            render={({ message }) => (
              <p className="text-red-500 text-sm">{message}</p>
            )}
          />
        </div>
        <div>
          <label
            htmlFor="arrived"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Arrived
          </label>
          <select
            id="arrived"
            {...register("arrived", {
              setValueAs: (v) => (v === "true" ? true : false),
            })}
            className="bg-gray-300 dark:bg-gray-900 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 pb-2.5 pt-4 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
          <ErrorMessage
            errors={formState.errors}
            name="arrived"
            render={({ message }) => (
              <p className="text-red-500 text-sm">{message}</p>
            )}
          />
        </div>
        <div>
          <label
            htmlFor="price"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Price
          </label>
          <input
            type="number"
            placeholder="price"
            id="price"
            defaultValue={car.price?.totalAmount}
            {...register("price", {
              valueAsNumber: true,
            })}
            className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-gray-300 dark:bg-gray-900 rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
          />
          <ErrorMessage
            errors={formState.errors}
            name="price"
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
            className="bg-gray-300 dark:bg-gray-900 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 pb-2.5 pt-4 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
      <div className="grid gap-6 mb-6 md:grid-cols-2">
        <div>
          <label
            htmlFor="departureDate"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Departure Date
          </label>
          <input
            type="date"
            id="departureDate"
            defaultValue={formatDateToInputValue(car.car?.departureDate)}
            {...register("departureDate", {
              valueAsDate: true,
            })}
            className="w-full py-2.5 px-5 rounded-lg border bg-gray-300 dark:bg-gray-900 border-gray-300 appearance-none dark:border-gray-900 dark:placeholder-gray-400 dark:text-white dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
          />
          <ErrorMessage
            errors={formState.errors}
            name="departureDate"
            render={({ message }) => (
              <p className="text-red-500 text-sm">{message}</p>
            )}
          />
        </div>
        <div>
          <label
            htmlFor="arrivalDate"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Arrival Date
          </label>
          <input
            type="date"
            defaultValue={formatDateToInputValue(car.car?.arrivalDate)}
            id="arrivalDate"
            {...register("arrivalDate", {
              valueAsDate: true,
            })}
            className="w-full py-2.5 px-5 rounded-lg border bg-gray-300 dark:bg-gray-900 border-gray-300 appearance-none dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
          />
          <ErrorMessage
            errors={formState.errors}
            name="arrivalDate"
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
          className="w-full py-2.5 px-5 me-2 mb-2 text-sm font-medium text-white focus:outline-none bg-gray-700 rounded-lg border border-gray-200 hover:bg-gray-300 dark:bg-gray-900-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-300 dark:bg-gray-900-800 dark:text-white dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-300 dark:bg-gray-900-700"
        >
          {pending ? <Spinner /> : "Submit"}
        </button>
      </div>
    </form>
  );
}
