import { z } from "zod";
import countryList from "../../../public/countries.json";
import { colors } from "../../../public/colors";

export const formSchema = z.object({
  vin: z
    .string({ message: "VIN code must be a string" })
    .length(17, {
      message:
        "VIN code must be exactly 17 characters long",
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
    })
    .nullish(),
  model: z
    .string({ message: "Model must be a string" })
    .min(2, { message: "Model must be at least 2 characters long" })
    .max(50, {
      message: "Model must be at most 50 characters long",
    })
    .nullish(),
  trim: z
    .string({ message: "Trim must be a string" })
    .min(1, { message: "Trim must be at least 1 characters long" })
    .max(15, {
      message: "Trim must be at most 15 characters long",
    })
    .nullish(),
  manufacturer: z
    .string({ message: "Manufacturer must be a string" })
    .min(3, { message: "Manufacturer must be at least 3 characters long" })
    .max(50, {
      message: "Manufacturer must be at most 50 characters long",
    })
    .nullish(),
  bodyType: z
    .string({ message: "Body Type must be a string" })
    .min(3, { message: "Body Type must be at least 3 characters long" })
    .max(50, {
      message: "Body Type must be at most 50 characters long",
    })
    .nullish(),
  country: z
    .string({ message: "Country must be a string" })
    .refine((value) => countryList.some((country) => country.name === value), {
      message: "Country must be a real country.",
    })
    .nullish(),
  engineType: z
    .string({ message: "Engine Type must be a string" })
    .min(3, { message: "Engine Type must be at least 3 characters long" })
    .max(50, {
      message: "Engine Type must be at most 50 characters long",
    })
    .nullish(),
  titleNumber: z
    .string({ message: "Title Number must be a string" })
    .min(2, { message: "Title Number must be at least 2 characters long" })
    .max(50, {
      message: "Title Number must be at most 50 characters long",
    })
    .nullish(),
  titleState: z
    .string({ message: "Title State must be a string" })
    .min(2, { message: "Title State must be at least 2 characters long" })
    .max(50, {
      message: "Title State must be between 3 and 50 characters long.",
    })
    .nullish(),
  color: z
    .string({ message: "Color must be a string" })
    .refine((value) => colors.some((color) => color.name === value), {
      message: "Color must be a real color.",
    })
    .nullish(),
  fuelType: z
    .string({ message: "Fuel Type must be a string" })
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
    )
    .nullish(),
  fined: z.boolean({ message: "Fined must be a boolean" }).nullish(),
  arrived: z.boolean({ message: "Arrived must be a boolean" }).nullish(),
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
    .string({ message: "Origin Port must be a string" })
    .min(2, { message: "Origin Port must be at least 2 characters long" })
    .max(50, {
      message: "Origin Port must be at most 50 characters long",
    })
    .nullish(),
  destinationPort: z
    .string({ message: "Destination Port must be a string" })
    .min(2, { message: "Destination Port must be at least 2 characters long" })
    .max(50, {
      message: "Destination Port must be at most 50 characters long",
    })
    .nullish(),
  departureDate: z.date({ message: "Departure Date must be a date" }).nullish(),
  arrivalDate: z.date({ message: "Arrival Date must be a date" }).nullish(),
  auction: z
    .string({ message: "Auction must be a string" })
    .min(2, { message: "Auction must be at least 2 characters long" })
    .max(50, {
      message: "Auction must be at most 50 characters long",
    })
    .nullish(),
  shipping: z
    .string({ message: "Shipping must be a string" })
    .min(2, { message: "Shipping must be at least 2 characters long" })
    .max(50, {
      message: "Shipping must be at most 50 characters long",
    })
    .nullish(),
  price: z
    .number({ message: "Price must be a number" })
    .min(0, { message: "Price must be at least 0" })
    .max(150000, { message: "Price must be at most 150000" })
    .nullish(),
  priceCurrency: z.enum(["1", "2", "3"], {
    message: "Price Currency must be between 1 and 3.",
  }),
});
