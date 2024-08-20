import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { csvData, a_styleData, c_styleData, virtualBidData } from "../../public/csvData";
import { AuctionData, ExtraFee, OceanFee } from "./drizzle/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
};

export interface ActionResult {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}

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

export const auctionData: AuctionData[] = csvToJson();

export function parseVirtualBidData(): any[] {
  const rows = virtualBidData.trim().split("\n").slice(1);
  const jsonData: any[] = [];

  for (const row of rows) {
    const [range, fee] = row.split(",");
    const [minRange, maxRange] = range.split("-");

    const obj = {
      minPrice: parseFloat(minRange.replace(/[^0-9.-]+/g, "")),
      maxPrice: parseFloat(maxRange.replace(/[^0-9.-]+/g, "")),
      fee: parseFloat(fee),
    };

    jsonData.push(obj);
  }

  return jsonData;
}

export function styleToJson(style: string): any[] {
  const data = style === "a" ? a_styleData : c_styleData;
  const rows = data.trim().split("\n");

  const jsonData: any[] = [];

  for (let i = 1; i < rows.length; i++) {
    const values = rows[i].split(",");
    const [minRange, maxRange] = values[0].split("-");
    const fee = values[1];

    const obj = {
      minPrice: parseFloat(minRange.replace(/[^0-9.-]+/g, "")),
      maxPrice: maxRange.includes("%") ? maxRange : parseFloat(maxRange.replace(/[^0-9.-]+/g, "")),
      fee: fee.includes("%") ? fee.trim() : parseFloat(fee),
    };

    jsonData.push(obj);
  }

  return jsonData;
}

export function csvToJson(): any[] {
  const rows = csvData.trim().split('\n');
  const jsonData: any[] = [];

  for (let i = 1; i < rows.length; i++) {
    let values = rows[i].split(',').map((value, index) => {
      if (value.startsWith('"') && value.endsWith('"')) {
        return value.substring(1, value.length - 1);
      }
      return value;
    });

    const obj: any = {};
    obj.auction = values[0] === "Copart" ? "Copart" : "IAAI";
    obj.auctionLocation = values[1];

    obj.port = values[5].trim().slice(0, values[5].length - 2);

    obj.zip = values[3];
    obj.rate = parseInt(values[6].replace(/\$/g, ''), 10);

    jsonData.push(obj);
  }

  return jsonData;
}
