import { z } from "zod";
import { colors } from "../../../public/colors";

export const formSchema = z.object({
  vin: z
    .string({ message: "VIN code must be a string" })
    .length(17, {
      message: "VIN code must be exactly 17 characters long",
    })
    .regex(/^[A-HJ-NPR-Z0-9]{17}$/, { message: "VIN code must be valid" })
    .optional(),
  year: z
    .string()
    .refine(
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
    )
    .optional(),
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
    .string({ message: "Fuel type must be a string" })
    .refine(
      (value) =>
        ["GASOLINE", "DIESEL", "ELECTRIC", "HYBRID", "OTHER"].includes(value),
      {
        message:
          "Fuel Type must be one of the following options: GASOLINE, DIESEL, ELECTRIC, HYBRID, OTHER.",
      },
    )
    .optional(),
  containerNumber: z.string().optional(),
  bookingNumber: z.string().optional(),
  trackingLink: z.string().optional(),
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
    .nullable()
    .optional(),
  arrivalDate: z
    .date({ message: "Arrival date must be a date" })
    .nullable()
    .optional(),
  auction: z.string({ message: "Auction must be a string" }).optional(),
  price: z.number({ message: "Price must be a number" }).optional(),
});
