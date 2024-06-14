import { z } from "zod";
import countryList from "../../../public/countries.json";

export const formSchema = z.object({
  vin: z
    .string()
    .length(17, {
      message:
        "VIN code must be exactly 17 characters long and of correct format.",
    })
    .regex(/^[A-HJ-NPR-Z0-9]{17}$/),
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
  make: z.string().min(3).max(50, {
    message: "Make must be between 3 and 50 characters long.",
  }),
  model: z.string().min(3).max(50, {
    message: "Model must be between 3 and 50 characters long.",
  }),
  trim: z.string().min(2).max(30, {
    message: "Trim must be between 2 and 30 characters long.",
  }),
  manufacturer: z.string().min(5).max(50, {
    message: "Manufacturer must be between 5 and 50 characters long.",
  }),
  bodyType: z.string().min(3).max(50, {
    message: "Body Type must be between 3 and 50 characters long.",
  }),
  country: z
    .string()
    .refine((value) => countryList.some((country) => country.name === value), {
      message: "Country must be a real country.",
    }),
  engineType: z.string().min(3).max(50, {
    message: "Engine Type must be between 3 and 50 characters long.",
  }),
  titleNumber: z.string().min(3).max(50, {
    message: "Title Number must be between 3 and 50 characters long.",
  }),
  titleState: z.string().min(3).max(50, {
    message: "Title State must be between 3 and 50 characters long.",
  }),
  color: z.string().min(3).max(50, {
    message: "Color must be between 3 and 50 characters long.",
  }),
  fuelType: z
    .string()
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
  fined: z.boolean(),
  arrived: z.boolean(),
  status: z
    .string()
    .refine(
      (value) =>
        ["Pending", "OnHand", "Loaded", "InTransit", "Fault"].includes(value),
      {
        message:
          "Status must be one of the following options: Pending, OnHand, Loaded, InTransit, Fault.",
      },
    ),
  originPort: z.string().min(3).max(50, {
    message: "Origin Port must be between 3 and 50 characters long.",
  }),
  destinationPort: z.string().min(3).max(50, {
    message: "Destination Port must be between 3 and 50 characters long.",
  }),
  parkingDateString: z.date(),
  departureDate: z.date(),
  arrivalDate: z.date(),
  auction: z.string().min(3).max(50, {
    message: "Auction must be between 3 and 50 characters long.",
  }),
  shipping: z.string().min(3).max(50, {
    message: "Shipping must be between 3 and 50 characters long.",
  }),
  price: z.string().refine(
    (val) => {
      const numberValue = parseFloat(val);
      return (
        !Number.isNaN(numberValue) && numberValue >= 0 && numberValue <= 150000
      );
    },
    {
      message: "Price must be a number between 0 and 150000.",
    },
  ),
  priceCurrency: z.enum(["1", "2", "3"], {
    message: "Price Currency must be between 1 and 3.",
  }),
});
