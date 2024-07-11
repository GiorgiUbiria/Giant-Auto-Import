import { z } from "zod";
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
  containerNumber: z.string().optional(),
  bookingNumber: z.string().optional(),
  trackingLink: z.string().optional(),
  lotNumber: z.string().optional(),
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
  make: z.string({ message: "Make must be a string" }).optional(),
  model: z.string({ message: "Model must be a string" }).optional(),
  bodyType: z
    .enum(["SEDAN", "PICKUP", "SUV", "CROSSOVER"], {
      message:
        "Body type must be one of the following options: SEDAN, PICKUP, SUV, CROSSOVER.",
    })
    .optional(),
  color: z
    .string({ message: "Color must be a string" })
    .refine((value) => colors.some((color) => color.name === value), {
      message: "Color must be a real color.",
    })
    .optional(),
  fuelType: z
    .enum(["GASOLINE", "DIESEL", "ELECTRIC", "HYBRID", "OTHER"], {
      message:
        "Fuel Type must be one of the following options: GASOLINE, DIESEL, ELECTRIC, HYBRID, OTHER.",
    })
    .optional(),
  status: z
    .string({ message: "Status must be a string" })
    .refine(
      (value) =>
        ["Pending", "OnHand", "Loaded", "InTransit", "Fault"].includes(value),
      {
        message:
          "Status must be one of the following options: Pending, OnHand, Loaded, InTransit, Fault.",
      },
    )
    .optional(),
  originPort: z.string({ message: "Origin port must be a string" }).optional(),
  destinationPort: z
    .string({ message: "Destination port must be a string" })
    .optional(),
  departureDate: z
    .date({ message: "Departure date must be a date" })
    .nullish()
    .optional(),
  arrivalDate: z.date({ message: "Arrival date must be a date" }).nullish().optional(),
  auction: z.string().optional(),
  price: z.number({ message: "Price must be a number" }).optional(),
  auctionFee: z.number({ message: "Auction fee must be a number" }).optional(),
  auction_images: z
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
  pick_up_images: z
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
  warehouse_images: z
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
  delivery_images: z
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
