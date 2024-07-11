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
import { EditCarPayload, editCarInDb } from "@/lib/actions/actions.editCar";
import { colors } from "../../../public/colors";
import Spinner from "../spinner";
import { useRouter } from "next/navigation";
import { Separator } from "../ui/separator";

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
  const { handleSubmit, register, formState } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vin: car.car.vin!,
      make: car.specifications?.make!,
      fuelType: car.specifications?.fuelType!,
      bodyType: car.specifications?.bodyType!,
      trackingLink: car.parking_details?.trackingLink!,
      containerNumber: car.parking_details?.containerNumber!,
      bookingNumber: car.parking_details?.bookingNumber!,
      price: car.price?.totalAmount!,
      auctionFee: car.price?.auctionFee!,
      model: car.specifications?.model!,
      color: car.specifications?.color!,
      originPort: car.car?.originPort!,
      destinationPort: car.car?.destinationPort!,
      auction: car.car?.auction!,
      status: car.parking_details?.status!,
      year: car.specifications?.year!,
      departureDate: car.car?.departureDate!,
      arrivalDate: car.car?.arrivalDate!,
      lotNumber: car.parking_details?.lotNumber!,
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
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <h2 className="self-start text-2xl font-bold text-black dark:text-white">
            Specifications
          </h2>
          <Separator />
          <div className="grid gap-6 mb-6 md:grid-cols-2">
            <div>
              <label
                htmlFor="vin"
                className="block mb-2 text-sm font-medium text-black dark:text-white"
              >
                VIN
              </label>
              <input
                type="text"
                id="vin"
                className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-gray-300 dark:bg-gray-900 rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                {...register("vin")}
                placeholder="VIN Code..."
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
                className="block mb-2 text-sm font-medium text-black dark:text-white"
              >
                Year
              </label>
              <input
                type="number"
                placeholder="2000"
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
                className="block mb-2 text-sm font-medium text-black dark:text-white"
              >
                Make
              </label>
              <input
                type="text"
                placeholder="Make..."
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
                className="block mb-2 text-sm font-medium text-black dark:text-white"
              >
                Model
              </label>
              <input
                type="text"
                placeholder="Model..."
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
          </div>
          <div className="grid gap-6 mb-6 md:grid-cols-3">
            <div>
              <label
                htmlFor="fuelType"
                className="block mb-2 text-sm font-medium text-black dark:text-white"
              >
                Fuel Type
              </label>
              <select
                id="fuelType"
                {...register("fuelType")}
                defaultValue={car.specifications?.fuelType!}
                className="bg-gray-300 dark:bg-gray-900 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              >
                <option value="GASOLINE">Gasoline</option>
                <option value="DIESEL">Diesel</option>
                <option value="ELECTRIC">Electric</option>
                <option value="HYBRID">Hybrid</option>
                <option value="OTHER">Other</option>
              </select>
              <ErrorMessage
                errors={formState.errors}
                name="fuelType"
                render={({ message }) => (
                  <p className="text-red-500 text-sm">{message}</p>
                )}
              />
            </div>
            <div>
              <label
                htmlFor="bodyType"
                className="block mb-2 text-sm font-medium text-black dark:text-white"
              >
                Body Type
              </label>
              <select
                id="bodyType"
                {...register("bodyType")}
                defaultValue={car.specifications?.bodyType!}
                className="bg-gray-300 dark:bg-gray-900 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              >
                <option value="SEDAN">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="CROSSOVER">CrossOver</option>
                <option value="PICKUP">PickUp</option>
              </select>
              <ErrorMessage
                errors={formState.errors}
                name="bodyType"
                render={({ message }) => (
                  <p className="text-red-500 text-sm">{message}</p>
                )}
              />
            </div>
            <div>
              <label
                htmlFor="color"
                className="block mb-2 text-sm font-medium text-white dark:text-white"
              >
                Color
              </label>
              <select
                {...register("color")}
                id="color"
                className="bg-gray-300 dark:bg-gray-900 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              >
                {colors.map((color) => (
                  <option key={color.name} value={color.name}>
                    {color.name}
                  </option>
                ))}
              </select>
              <ErrorMessage
                errors={formState.errors}
                name="color"
                render={({ message }) => (
                  <p className="text-red-500 text-sm">{message}</p>
                )}
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <h2 className="self-start text-2xl font-bold text-black dark:text-white">
            Parking Details
          </h2>
          <Separator />
          <div className="grid gap-6 mb-6 md:grid-cols-3">
            <div>
              <label
                htmlFor="trackingLink"
                className="block mb-2 text-sm font-medium text-black dark:text-white"
              >
                Tracking Link
              </label>
              <input
                type="text"
                placeholder="Tracking Link..."
                id="trackingLink"
                {...register("trackingLink")}
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
                htmlFor="status"
                className="block mb-2 text-sm font-medium text-black dark:text-white"
              >
                Status
              </label>
              <select
                id="status"
                {...register("status")}
                defaultValue={car.parking_details?.status!}
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
                htmlFor="lotNumber"
                className="block mb-2 text-sm font-medium text-black dark:text-white"
              >
                Lot Number
              </label>
              <input
                type="text"
                placeholder="Lot Number..."
                id="lotNumber"
                {...register("lotNumber")}
                className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-gray-300 dark:bg-gray-900 rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              />
              <ErrorMessage
                errors={formState.errors}
                name="lotNumber"
                render={({ message }) => (
                  <p className="text-red-500 text-sm">{message}</p>
                )}
              />
            </div>
          </div>
          <div className="grid gap-6 mb-6 md:grid-cols-2">
            <div>
              <label
                htmlFor="containerNumber"
                className="block mb-2 text-sm font-medium text-black dark:text-white"
              >
                Container #
              </label>
              <input
                type="text"
                placeholder="container number"
                id="containerNumber"
                {...register("containerNumber")}
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
                htmlFor="bookingNumber"
                className="block mb-2 text-sm font-medium text-black dark:text-white"
              >
                Booking #
              </label>
              <input
                type="text"
                placeholder="booking number"
                id="bookingNumber"
                {...register("bookingNumber")}
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
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <h2 className="self-start text-2xl font-bold text-black dark:text-white">
            General Information
          </h2>
          <Separator />
          <div className="grid gap-6 mb-6 md:grid-cols-3">
            <div>
              <label
                htmlFor="destinationPort"
                className="block mb-2 text-sm font-medium text-black dark:text-white"
              >
                Destination Port
              </label>
              <input
                type="text"
                placeholder="Destination Port..."
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
                className="block mb-2 text-sm font-medium text-black dark:text-white"
              >
                Origin Port
              </label>
              <input
                type="text"
                placeholder="Port of Origin..."
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
            <div>
              <label
                htmlFor="auction"
                className="block mb-2 text-sm font-medium text-black dark:text-white"
              >
                Auction
              </label>
              <input
                type="text"
                placeholder="Auction..."
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
          </div>
          <div className="grid gap-6 mb-6 md:grid-cols-2">
            <div>
              <label
                htmlFor="departureDate"
                className="block mb-2 text-sm font-medium text-black dark:text-white"
              >
                Departure Date
              </label>
              <input
                type="date"
                id="departureDate"
                {...register("departureDate", {
                  valueAsDate: true,
                })}
                className="w-full py-2.5 px-5 rounded-lg border bg-gray-300 dark:bg-gray-900 border-gray-300 appearance-none dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
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
                className="block mb-2 text-sm font-medium text-black dark:text-white"
              >
                Arrival Date
              </label>
              <input
                type="date"
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
        </div>
        <div className="flex flex-col gap-4">
          <h2 className="self-start text-2xl font-bold text-black dark:text-white">
            Price Information
          </h2>
          <Separator />
          <div className="grid gap-6 mb-6 md:grid-cols-2">
            <div>
              <label
                htmlFor="price"
                className="block mb-2 text-sm font-medium text-black dark:text-white"
              >
                Total Price
              </label>
              <input
                type="number"
                placeholder="0000"
                id="price"
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
                htmlFor="auctionFee"
                className="block mb-2 text-sm font-medium text-black dark:text-white"
              >
                Auction Fee
              </label>
              <input
                type="number"
                placeholder="0000"
                id="auctionFee"
                {...register("auctionFee", {
                  valueAsNumber: true,
                })}
                className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-gray-300 dark:bg-gray-900 rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              />
              <ErrorMessage
                errors={formState.errors}
                name="auctionFee"
                render={({ message }) => (
                  <p className="text-red-500 text-sm">{message}</p>
                )}
              />
            </div>
          </div>
        </div>
        <div className="grid gap-6 mb-6 md:grid-cols1-1">
          <button
            disabled={loading}
            type="submit"
            className="w-full py-2.5 px-5 me-2 mb-2 text-md font-bold text-primary bg-secondary rounded-md hover:bg-secondary/20 flex justify-center"
          >
            {loading ? <Spinner /> : "Edit"}
          </button>
        </div>
      </div>
    </form>
  );
}
