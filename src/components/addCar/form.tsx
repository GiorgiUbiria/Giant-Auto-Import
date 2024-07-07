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
import { handleUploadImages } from "@/lib/actions/bucketActions";
import Spinner from "../spinner";
import { colors } from "../../../public/colors";
import { useRouter } from "next/navigation";

const initialState = {
  error: null,
  success: null,
};

type FormValues = z.infer<typeof formSchema>;

export default function AddForm() {
  const router = useRouter();
  const [loading, setTransitioning] = React.useTransition();
  const [state, formAction] = useFormState(addCarToDb, initialState);
  const { pending } = useFormStatus();
  const { handleSubmit, register, formState, getValues } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vin: "",
      price: 0,
      make: "",
      model: "",
      fuelType: "GASOLINE",
      bodyType: "SUV",
      originPort: "",
      destinationPort: "",
      auction: "",
      status: "Pending",
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    console.log("Submitting form data:", data);
    const {
      auction_images,
      delivery_images,
      warehouse_images,
      pick_up_images,
      ...formDataWithoutImages
    } = data;
    const processAndUploadImages = async (
      images: FileList | undefined,
      type: string,
      vin: string,
    ) => {
      if (!images || images.length === 0) return;

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
        type,
        vin,
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
    };

    setTransitioning(async () => {
      const res = await addCarToDb(state, formDataWithoutImages);
      if (res.error !== null) {
        toast.error(res.error);
        console.error(res.error);
      } else {
        const vin = getValues("vin");

        await processAndUploadImages(delivery_images, "DELIVERY", vin);
        await processAndUploadImages(pick_up_images, "PICK_UP", vin);
        await processAndUploadImages(warehouse_images, "WAREHOUSE", vin);
        await processAndUploadImages(auction_images, "AUCTION", vin);

        toast.success(res.success);

        router.push("/admin");
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
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="p-4 bg-gray-600 rounded-md"
    >
      <div className="grid gap-6 mb-6 md:grid-cols-2">
        <div>
          <label
            htmlFor="vin"
            className="block mb-2 text-sm font-medium text-white dark:text-white"
          >
            VIN *
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
            className="block mb-2 text-sm font-medium text-white dark:text-white"
          >
            Year *
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
            className="block mb-2 text-sm font-medium text-white dark:text-white"
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
            className="block mb-2 text-sm font-medium text-white dark:text-white"
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
      </div>
      <div className="grid gap-6 mb-6 md:grid-cols-2">
        <div>
          <label
            htmlFor="status"
            className="block mb-2 text-sm font-medium text-white dark:text-white"
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
            className="block mb-2 text-sm font-medium text-white dark:text-white"
          >
            Fuel Type
          </label>
          <select
            id="fuelType"
            {...register("fuelType")}
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
      </div>
      <div className="grid gap-6 mb-6 md:grid-cols-2">
        <div>
          <label
            htmlFor="bodyType"
            className="block mb-2 text-sm font-medium text-white dark:text-white"
          >
            Body Type
          </label>
          <select
            id="bodyType"
            {...register("bodyType")}
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
            htmlFor="trackingLink"
            className="block mb-2 text-sm font-medium text-white dark:text-white"
          >
            Tracking Link
          </label>
          <input
            type="text"
            placeholder="trackingLink"
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
      </div>
      <div className="grid gap-6 mb-6 md:grid-cols-2">
        <div>
          <label
            htmlFor="destinationPort"
            className="block mb-2 text-sm font-medium text-white dark:text-white"
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
            className="block mb-2 text-sm font-medium text-white dark:text-white"
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
      <div className="grid gap-6 mb-6 md:grid-cols-2">
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
        <div>
          <label
            htmlFor="auction_text"
            className="block mb-2 text-sm font-medium text-white dark:text-white"
          >
            Auction
          </label>
          <input
            type="text"
            placeholder="auction"
            id="auction_text"
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
      <div className="grid gap-6 mb-6 md:grid-cols-3">
        <div>
          <label
            htmlFor="containerNumber"
            className="block mb-2 text-sm font-medium text-white dark:text-white"
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
            className="block mb-2 text-sm font-medium text-white dark:text-white"
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
        <div>
          <label
            htmlFor="price"
            className="block mb-2 text-sm font-medium text-white dark:text-white"
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
      <div className="grid gap-6 mb-6 md:grid-cols-2">
        <div>
          <label
            htmlFor="departureDate"
            className="block mb-2 text-sm font-medium text-white dark:text-white"
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
            className="block mb-2 text-sm font-medium text-white dark:text-white"
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
      <div className="grid gap-6 mb-6 md:grid-cols-4">
        <div>
          <label
            htmlFor="auction_images"
            className="block mb-2 text-sm font-medium text-white dark:text-white"
          >
            Auction Photos
          </label>
          <input
            type="file"
            id="auction_images"
            multiple
            {...register("auction_images", {
              setValueAs: (v) => Array.from(v),
            })}
            className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-gray-300 dark:bg-gray-900 rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
          />
          <ErrorMessage
            errors={formState.errors}
            name="auction_images"
            render={({ message }) => (
              <p className="text-red-500 text-sm">{message}</p>
            )}
          />
        </div>
        <div>
          <label
            htmlFor="warehouse_images"
            className="block mb-2 text-sm font-medium text-white dark:text-white"
          >
            Warehouse Photos
          </label>
          <input
            type="file"
            id="warehouse_images"
            multiple
            {...register("warehouse_images", {
              setValueAs: (v) => Array.from(v),
            })}
            className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-gray-300 dark:bg-gray-900 rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
          />
          <ErrorMessage
            errors={formState.errors}
            name="warehouse_images"
            render={({ message }) => (
              <p className="text-red-500 text-sm">{message}</p>
            )}
          />
        </div>
        <div>
          <label
            htmlFor="pick_up_images"
            className="block mb-2 text-sm font-medium text-white dark:text-white"
          >
            Pick Up Photos
          </label>
          <input
            type="file"
            id="pick_up_images"
            multiple
            {...register("pick_up_images", {
              setValueAs: (v) => Array.from(v),
            })}
            className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-gray-300 dark:bg-gray-900 rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
          />
          <ErrorMessage
            errors={formState.errors}
            name="pick_up_images"
            render={({ message }) => (
              <p className="text-red-500 text-sm">{message}</p>
            )}
          />
        </div>
        <div>
          <label
            htmlFor="delivery_images"
            className="block mb-2 text-sm font-medium text-white dark:text-white"
          >
            Delivery Photos
          </label>
          <input
            type="file"
            id="delivery_images"
            multiple
            {...register("delivery_images", {
              setValueAs: (v) => Array.from(v),
            })}
            className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-gray-300 dark:bg-gray-900 rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
          />
          <ErrorMessage
            errors={formState.errors}
            name="delivery_images"
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
          {pending ? <Spinner /> : "Add Car"}
        </button>
      </div>
    </form>
  );
}
