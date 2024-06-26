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
import { handleUploadImages } from "@/lib/actions/bucketActions";
import Spinner from "../spinner";

const initialState = {
  error: null,
  success: null,
};

type FormValues = z.infer<typeof formSchema>;

export default function AddForm() {
  const [loading, setTransitioning] = React.useTransition();
  const [state, formAction] = useFormState(addCarToDb, initialState);
  const { pending } = useFormStatus();
  const { handleSubmit, register, formState, getValues } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vin: "",
      fined: false,
      price: 0,
      priceCurrency: "1",
      make: "",
      model: "",
      trim: "",
      manufacturer: "",
      bodyType: "",
      country: countries.find(
        (country: { name: string; code: string }) => country.name === "Germany",
      )?.name,
      engineType: "",
      titleNumber: "",
      titleState: "",
      color: "",
      fuelType: "Gasoline",
      shipping: "",
      originPort: "",
      destinationPort: "",
      auction: "",
      status: "Pending",
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    console.log("Submitting form data:", data);
    const { images, ...formDataWithoutImages } = data;
    setTransitioning(async () => {
      const res = await addCarToDb(state, formDataWithoutImages);
      if (res.error !== null) {
        toast.error(res.error);
        console.error(res.error);
      } else {
        if (images !== undefined && images.length > 0) {
          const fileData = await Promise.all(
            Array.from(images).map(async (file: File) => {
              const arrayBuffer = await file.arrayBuffer();
              return {
                buffer: new Uint8Array(arrayBuffer),
                size: file.size,
                type: file.type,
                name: file.name,
              };
            }),
          );

          const urls = await handleUploadImages(
            "Container",
            getValues("vin"),
            fileData.map((file) => file.size),
          );

          await Promise.all(
            urls.map((url: string, index: number) =>
              fetch(url, {
                method: "PUT",
                headers: {
                  "Content-Type": images[index].type,
                },
                body: fileData[index].buffer,
              }),
            ),
          );
        }

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
            className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-gray rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
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
            className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-gray rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
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
            className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-gray rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
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
            className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-gray rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
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
            className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-gray rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
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
            className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-gray rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
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
            className="bg-gray text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
            className="bg-gray text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
            className="bg-gray text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
            className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-gray rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
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
            className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-gray rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
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
            className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-gray rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
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
            className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-gray rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
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
            className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-gray rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
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
            className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-gray rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
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
          <input
            type="text"
            placeholder="color"
            id="color"
            {...register("color")}
            className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-gray rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
          />
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
            className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-gray rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
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
            className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-gray rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
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
            className="bg-gray text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 pb-2.5 pt-4 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
            className="bg-gray text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 pb-2.5 pt-4 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
            {...register("price", {
              valueAsNumber: true,
            })}
            className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-gray rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
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
            className="bg-gray text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 pb-2.5 pt-4 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
            {...register("departureDate", {
              valueAsDate: true,
            })}
            className="w-full py-2.5 px-5 rounded-lg border border-gray-300 appearance-none dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
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
            id="arrivalDate"
            {...register("arrivalDate", {
              valueAsDate: true,
            })}
            className="w-full py-2.5 px-5 rounded-lg border border-gray-300 appearance-none dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
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
      <div>
        <label
          htmlFor="images"
          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
        >
          Upload Images
        </label>
        <input
          type="file"
          id="images"
          multiple
          {...register("images", {
            setValueAs: (v) => Array.from(v),
          })}
          className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-gray rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
        />
        <ErrorMessage
          errors={formState.errors}
          name="model"
          render={({ message }) => (
            <p className="text-red-500 text-sm">{message}</p>
          )}
        />
      </div>
      <div className="grid gap-6 mb-6 md:grid-cols1-1">
        <button
          disabled={pending}
          type="submit"
          className="w-full py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
        >
          {pending ? <Spinner /> : "Submit"}
        </button>
      </div>
    </form>
  );
}
