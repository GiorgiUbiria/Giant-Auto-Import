import { z } from "zod";
import countryList from "../../../public/countries.json";
import { colors } from "../../../public/colors";

const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpg", "image/jpeg"];
const MAX_IMAGE_SIZE = 4;

const sizeInMB = (sizeInBytes: number, decimalsNum = 2) => {
  const result = sizeInBytes / (1024 * 1024);
  return +result.toFixed(decimalsNum);
};

export const formSchema = z.object({
  vin: z
    .string({ message: "VIN code must be a string" })
    .length(17, {
      message: "VIN code must be exactly 17 characters long",
    })
    .regex(/^[A-HJ-NPR-Z0-9]{17}$/, { message: "VIN code must be valid" }),
  year: z.string().refine(
    (val) => {
      const year = parseInt(val, 10);
      const currentYear = new Date().getFullYear();
      return (
        !Number.isNaN(year) &&
        val.length === 4 &&
        year >= 1900 &&
        year <= currentYear
      );
    },
    {
      message:
        "Year must be a four-digit number between 1900 and the current year",
    },
  ),
  make: z
    .string({ message: "Make must be a string" })
    .min(3, { message: "Make must be at least 3 characters long" })
    .max(50, {
      message: "Make must be at most 50 characters long",
    }),
  model: z
    .string({ message: "Model must be a string" })
    .min(2, { message: "Model must be at least 2 characters long" })
    .max(50, {
      message: "Model must be at most 50 characters long",
    }),
  trim: z
    .string({ message: "Trim must be a string" })
    .min(1, { message: "Trim must be at least 1 character long" })
    .max(15, {
      message: "Trim must be at most 15 characters long",
    }),
  manufacturer: z
    .string({ message: "Manufacturer must be a string" })
    .min(3, { message: "Manufacturer must be at least 3 characters long" })
    .max(50, {
      message: "Manufacturer must be at most 50 characters long",
    }),
  bodyType: z
    .string({ message: "Body type must be a string" })
    .min(3, { message: "Body type must be at least 3 characters long" })
    .max(50, {
      message: "Body type must be at most 50 characters long",
    }),
  country: z
    .string({ message: "Country must be a string" })
    .refine((value) => countryList.some((country) => country.name === value), {
      message: "Country must be a real country.",
    }),
  color: z
    .string({ message: "Color must be a string" })
    .refine((value) => colors.some((color) => color.name === value), {
      message: "Color must be a real color.",
    }),
  engineType: z
    .string({ message: "Engine type must be a string" })
    .min(3, { message: "Engine type must be at least 3 characters long" })
    .max(50, {
      message: "Engine type must be at most 50 characters long",
    }),
  titleNumber: z
    .string({ message: "Title number must be a string" })
    .min(2, { message: "Title number must be at least 2 characters long" })
    .max(50, {
      message: "Title number must be at most 50 characters long",
    }),
  titleState: z
    .string({ message: "Title state must be a string" })
    .min(2, { message: "Title state must be at least 2 characters long" })
    .max(50, {
      message: "Title state must be at most 50 characters long",
    }),
  fuelType: z
    .string({ message: "Fuel type must be a string" })
    .refine(
      (value) =>
        [
          "Gasoline",
          "Diesel",
          "Electric",
          "Hybrid",
          "Biodiesel",
          "LPG",
          "CNG",
          "Hybrid Electric",
          "Hybrid Gasoline",
          "Other",
        ].includes(value),
      {
        message:
          "Fuel Type must be one of the following options: Gasoline, Diesel, Electric, Hybrid, Biodiesel, LPG, CNG, Hybrid Electric, Hybrid Gasoline, Other.",
      },
    ),
  fined: z.boolean({ message: "Fined must be a boolean" }),
  arrived: z.boolean({ message: "Arrived must be a boolean" }),
  status: z
    .string({ message: "Status must be a string" })
    .refine(
      (value) =>
        ["Pending", "OnHand", "Loaded", "InTransit", "Fault"].includes(value),
      {
        message:
          "Status must be one of the following options: Pending, OnHand, Loaded, InTransit, Fault.",
      },
    ),
  originPort: z
    .string({ message: "Origin port must be a string" })
    .min(2, { message: "Origin port must be at least 2 characters long" })
    .max(50, {
      message: "Origin port must be at most 50 characters long",
    }),
  destinationPort: z
    .string({ message: "Destination port must be a string" })
    .min(2, { message: "Destination port must be at least 2 characters long" })
    .max(50, {
      message: "Destination port must be at most 50 characters long",
    }),
  departureDate: z.date({ message: "Departure date must be a date" }),
  arrivalDate: z.date({ message: "Arrival date must be a date" }),
  auction: z
    .string({ message: "Auction must be a string" })
    .min(2, { message: "Auction must be at least 2 characters long" })
    .max(50, {
      message: "Auction must be at most 50 characters long",
    }),
  shipping: z
    .string({ message: "Shipping must be a string" })
    .min(2, { message: "Shipping must be at least 2 characters long" })
    .max(50, {
      message: "Shipping must be at most 50 characters long",
    }),
  price: z
    .number({ message: "Price must be a number" })
    .min(0, { message: "Price must be at least 0" })
    .max(150000, { message: "Price must be at most 150000" }),
  priceCurrency: z.enum(["1", "2", "3"], {
    message: "Price Currency must be between 1 and 3.",
  }),
  arrived_images: z
    .custom<FileList>()
    .refine((files) => {
      return Array.from(files ?? []).every(
        (file) => sizeInMB(file.size) <= MAX_IMAGE_SIZE,
      );
    }, `The maximum image size is ${MAX_IMAGE_SIZE}MB`)
    .refine((files) => {
      return Array.from(files ?? []).every((file) =>
        ACCEPTED_IMAGE_TYPES.includes(file.type),
      );
    }, "File type is not supported")
    .optional(),
  container_images: z
    .custom<FileList>()
    .refine((files) => {
      return Array.from(files ?? []).every(
        (file) => sizeInMB(file.size) <= MAX_IMAGE_SIZE,
      );
    }, `The maximum image size is ${MAX_IMAGE_SIZE}MB`)
    .refine((files) => {
      return Array.from(files ?? []).every((file) =>
        ACCEPTED_IMAGE_TYPES.includes(file.type),
      );
    }, "File type is not supported")
    .optional(),
});
