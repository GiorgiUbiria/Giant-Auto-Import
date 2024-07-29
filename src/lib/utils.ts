import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { ExtraFee, OceanFee } from "./drizzle/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
};

export const oceanShippingRates: OceanFee[] = [
  { state: "Los Angeles, CA", shorthand: "CA", rate: 1675 },
  { state: "Houston, TX", shorthand: "TX", rate: 1075 },
  { state: "New Jersey, NJ", shorthand: "NJ", rate: 1100 },
  { state: "Savannah, GA", shorthand: "GA", rate: 1025 },
];

export const extraFees: ExtraFee[] = [
  { type: "EV/Hybrid", rate: 150 },
  { type: "Pickup", rate: 300 },
  { type: "Service", rate: 100 },
];
