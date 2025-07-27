import { csvData, a_styleData, c_styleData, virtualBidData } from "../../public/csvData";
import { AuctionData, ExtraFee, OceanFee, UserPricingConfig, DefaultPricingConfig } from "./drizzle/types";
import { db } from "./drizzle/db";
import { defaultPricingConfig, userPricingConfig, csvDataVersions } from "./drizzle/schema";
import { eq, and } from "drizzle-orm";

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

/**
 * Get active CSV data from database or fallback to static data
 */
export const getActiveCsvData = async (): Promise<AuctionData[]> => {
  try {
    const [activeVersion] = await db
      .select()
      .from(csvDataVersions)
      .where(eq(csvDataVersions.isActive, true))
      .limit(1);

    if (activeVersion) {
      return JSON.parse(activeVersion.csvData) as AuctionData[];
    }
  } catch (error) {
    console.error("Error fetching active CSV data:", error);
  }

  // Fallback to static data
  return auctionData;
};

/**
 * Get user-specific pricing configuration
 */
export const getUserPricingConfig = async (userId: string): Promise<UserPricingConfig | null> => {
  try {
    const [config] = await db
      .select()
      .from(userPricingConfig)
      .where(and(eq(userPricingConfig.userId, userId), eq(userPricingConfig.isActive, true)))
      .limit(1);

    return config || null;
  } catch (error) {
    console.error("Error fetching user pricing config:", error);
    return null;
  }
};

/**
 * Get default pricing configuration
 */
export const getDefaultPricingConfig = async (): Promise<DefaultPricingConfig | null> => {
  try {
    const [config] = await db
      .select()
      .from(defaultPricingConfig)
      .where(eq(defaultPricingConfig.isActive, true))
      .limit(1);

    return config || null;
  } catch (error) {
    console.error("Error fetching default pricing config:", error);
    return null;
  }
};

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

export const calculateFee = (feeData: any[], value: number): number => {
  for (const entry of feeData) {
    if (
      value >= entry.minPrice &&
      (entry.maxPrice === "%" || value <= entry.maxPrice)
    ) {
      if (typeof entry.fee === "string" && entry.fee.includes("%")) {
        const percentage = parseFloat(entry.fee) / 100;
        return value * percentage;
      } else {
        return entry.fee;
      }
    }
  }
  return 0;
};

/**
 * Calculate total purchase fee with user-based pricing support
 */
export const calculateTotalPurchaseFee = async (
  purchasePrice: number, 
  styleData: any[], 
  virtualBidData: any[], 
  insurance: boolean,
  userId?: string
): Promise<number> => {
  const auctionFee = calculateFee(styleData, purchasePrice);
  const virtualBidFee = calculateFee(virtualBidData, purchasePrice);
  const fixedFees = 79 + 20 + 10;
  
  if (insurance) {
    return purchasePrice * 1.015 + auctionFee + virtualBidFee + fixedFees;
  } else {
    return purchasePrice + auctionFee + virtualBidFee + fixedFees;
  }
};

/**
 * Calculate shipping fee with user-based pricing support
 */
export const calculateShippingFee = async (
  auctionLoc: string,
  auctionName: string,
  portName: string,
  additionalFeeTypes: string[],
  userId?: string
): Promise<number> => {
  // Get user or default pricing configuration
  const userPricing = userId ? await getUserPricingConfig(userId) : null;
  const defaultPricing = await getDefaultPricingConfig();
  const pricing = userPricing || defaultPricing;

  // Get active CSV data
  const csvData = await getActiveCsvData();
  
  // Calculate ground fee with user adjustment
  const baseGroundFee = csvData.find(
    (data) => data.auction === auctionName && data.auctionLocation === auctionLoc
  )?.rate || 0;
  
  const groundFeeAdjustment = pricing?.groundFeeAdjustment || 0;
  const adjustedGroundFee = baseGroundFee + groundFeeAdjustment;

  // Calculate ocean fee with user adjustment
  const baseOceanFee = oceanShippingRates.find((rate) => rate.shorthand === portName)?.rate || 0;
  const userOceanFee = pricing?.oceanFee || baseOceanFee;

  // Calculate extra fees with user adjustments
  const extraFeesTotal = additionalFeeTypes.reduce((total, feeType) => {
    let feeRate = 0;
    
    switch (feeType) {
      case "EV/Hybrid":
        feeRate = pricing?.hybridSurcharge || extraFees.find(f => f.type === "EV/Hybrid")?.rate || 0;
        break;
      case "Pickup":
        feeRate = pricing?.pickupSurcharge || extraFees.find(f => f.type === "Pickup")?.rate || 0;
        break;
      case "Service":
        feeRate = pricing?.serviceFee || extraFees.find(f => f.type === "Service")?.rate || 0;
        break;
      default:
        feeRate = extraFees.find(f => f.type === feeType)?.rate || 0;
    }
    
    return total + feeRate;
  }, 0);

  return adjustedGroundFee + userOceanFee + extraFeesTotal;
};

/**
 * Calculate all car fees with user-based pricing support
 */
export const calculateCarFeesWithUserPricing = async (
  auction: string,
  auctionLocation: string,
  port: string,
  body: string,
  fuel: string,
  purchaseFee: number,
  insurance: "YES" | "NO",
  userId?: string
) => {
  const styleData = styleToJson("a");
  const virtualBidData = parseVirtualBidData();
  
  // Get user or default pricing configuration
  const userPricing = userId ? await getUserPricingConfig(userId) : null;
  const defaultPricing = await getDefaultPricingConfig();
  const pricing = userPricing || defaultPricing;

  // Calculate purchase fees
  const auctionFee = calculateFee(styleData, purchaseFee);
  const gateFee = 79;
  const titleFee = 20;
  const environmentalFee = 10;
  const virtualBidFee = calculateFee(virtualBidData, purchaseFee);

  const totalPurchaseFee = purchaseFee + auctionFee + gateFee + titleFee + environmentalFee + virtualBidFee;

  // Calculate shipping fees with user pricing
  const additionalFees: string[] = [];
  if (body === "PICKUP") additionalFees.push("Pickup");
  if (fuel === "HYBRID_ELECTRIC") additionalFees.push("EV/Hybrid");

  const shippingFee = await calculateShippingFee(
    auctionLocation,
    auction,
    port,
    additionalFees,
    userId
  );

  let totalFee = totalPurchaseFee + shippingFee;

  if (insurance === "YES") {
    totalFee = totalFee + (totalFee * 1.5) / 100;
  }

  // Get individual fee breakdown
  const csvData = await getActiveCsvData();
  const baseGroundFee = csvData.find(
    (data) => data.auction === auction && data.auctionLocation === auctionLocation
  )?.rate || 0;
  
  const groundFeeAdjustment = pricing?.groundFeeAdjustment || 0;
  const adjustedGroundFee = baseGroundFee + groundFeeAdjustment;
  
  const baseOceanFee = oceanShippingRates.find((rate) => rate.shorthand === port)?.rate || 0;
  const userOceanFee = pricing?.oceanFee || baseOceanFee;

  return {
    totalFee: totalFee,
    shippingFee: shippingFee,
    auctionFee: auctionFee,
    gateFee: gateFee,
    titleFee: titleFee,
    environmentalFee: environmentalFee,
    virtualBidFee: virtualBidFee,
    groundFee: adjustedGroundFee,
    oceanFee: userOceanFee,
    groundFeeAdjustment: groundFeeAdjustment,
    baseGroundFee: baseGroundFee,
    baseOceanFee: baseOceanFee,
  };
}; 