import {
  AuctionData,
  ExtraFee,
  OceanFee,
  UserPricingConfig,
  DefaultPricingConfig,
} from "./drizzle/types";

export const auctionData: AuctionData[] = [];

/**
 * Get active CSV data from API or fallback to static data
 */
export const getActiveCsvData = async (): Promise<AuctionData[]> => {
  try {
    const response = await fetch("/api/csv-data");
    if (response.ok) {
      const data = await response.json();
      // If API returns valid data, use it
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (error) {
    console.error("Error fetching active CSV data:", error);
  }

  // Fallback to static data
  console.log("Using fallback auction data");
  return fallbackAuctionData;
};

/**
 * Convert style data to JSON format for fee calculation
 */
export const styleToJson = (style: string): any[] => {
  switch (style.toLowerCase()) {
    case "a":
      return a_styleData.map((item) => ({
        minPrice: parseFloat(
          item.range.split("-")[0].replace(/[^0-9.-]+/g, "")
        ),
        maxPrice:
          item.range.split("-")[1] === "$100000.00"
            ? "%"
            : parseFloat(item.range.split("-")[1].replace(/[^0-9.-]+/g, "")),
        fee: typeof item.fee === "string" ? item.fee : item.fee,
      }));
    case "c":
      return c_styleData.map((item) => ({
        minPrice: parseFloat(
          item.range.split("-")[0].replace(/[^0-9.-]+/g, "")
        ),
        maxPrice:
          item.range.split("-")[1] === "$100000.00"
            ? "%"
            : parseFloat(item.range.split("-")[1].replace(/[^0-9.-]+/g, "")),
        fee: typeof item.fee === "string" ? item.fee : item.fee,
      }));
    default:
      return a_styleData.map((item) => ({
        minPrice: parseFloat(
          item.range.split("-")[0].replace(/[^0-9.-]+/g, "")
        ),
        maxPrice:
          item.range.split("-")[1] === "$100000.00"
            ? "%"
            : parseFloat(item.range.split("-")[1].replace(/[^0-9.-]+/g, "")),
        fee: typeof item.fee === "string" ? item.fee : item.fee,
      }));
  }
};

/**
 * Get user-specific pricing configuration via API
 */
export const getUserPricingConfig = async (
  userId: string
): Promise<UserPricingConfig | null> => {
  try {
    const response = await fetch(`/api/pricing/user/${userId}`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    // Fallback to direct DB query when on the server
    if (typeof window === "undefined") {
      try {
        const { db } = await import("./drizzle/db");
        const { userPricingConfig } = await import("./drizzle/schema");
        const { and, eq } = await import("drizzle-orm");

        if (!db) {
          console.error(
            "Database connection not available for user pricing config"
          );
          return null;
        }

        const rows = await db
          .select()
          .from(userPricingConfig)
          .where(
            and(
              eq(userPricingConfig.userId, userId),
              eq(userPricingConfig.isActive, true)
            )
          )
          .limit(1);
        return (rows?.[0] as unknown as UserPricingConfig) || null;
      } catch (dbErr) {
        console.error("DB fallback failed for user pricing config:", dbErr);
        return null;
      }
    } else {
      console.error("Error fetching user pricing config:", error);
    }
  }
  return null;
};

/**
 * Get default pricing configuration via API
 */
export const getDefaultPricingConfig =
  async (): Promise<DefaultPricingConfig | null> => {
    try {
      const response = await fetch("/api/pricing/default");
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      // Fallback to direct DB query when on the server
      if (typeof window === "undefined") {
        try {
          const { db } = await import("./drizzle/db");
          const { defaultPricingConfig } = await import("./drizzle/schema");
          const { eq } = await import("drizzle-orm");

          if (!db) {
            console.error(
              "Database connection not available for default pricing config"
            );
            return null;
          }

          const rows = await db
            .select()
            .from(defaultPricingConfig)
            .where(eq(defaultPricingConfig.isActive, true))
            .limit(1);
          return (rows?.[0] as unknown as DefaultPricingConfig) || null;
        } catch (dbErr) {
          console.error(
            "DB fallback failed for default pricing config:",
            dbErr
          );
          return null;
        }
      } else {
        console.error("Error fetching default pricing config:", error);
      }
    }
    return null;
  };

/**
 * Fetch active ocean rates from API (DB-backed)
 */
export const getActiveOceanRates = async (): Promise<OceanFee[]> => {
  try {
    const response = await fetch("/api/pricing/ocean-rates");
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) {
        return data as OceanFee[];
      }
    }
  } catch (error) {
    console.error("Error fetching active ocean rates:", error);
  }
  return [];
};

/**
 * Debug function to help troubleshoot pricing issues
 */
export const debugPricingConfig = async (userId?: string) => {
  const userPricing = userId ? await getUserPricingConfig(userId) : null;
  const defaultPricing = await getDefaultPricingConfig();

  console.log("Debug Pricing Config:", {
    userId,
    userPricing,
    defaultPricing,
  });

  return { userPricing, defaultPricing };
};

export function parseVirtualBidData(): any[] {
  return originalVirtualBidData.map((item) => ({
    minPrice: parseFloat(item.range.split("-")[0].replace(/[^0-9.-]+/g, "")),
    maxPrice:
      item.range.split("-")[1] === "$100000.00"
        ? "%"
        : parseFloat(item.range.split("-")[1].replace(/[^0-9.-]+/g, "")),
    fee: item.fee,
  }));
}

// Initialize auctionData after csvToJson is defined
export const getAuctionData = async (): Promise<AuctionData[]> => {
  try {
    // Use the proper async function to get active CSV data
    const data = await getActiveCsvData();

    // Ensure we return a valid array
    if (!Array.isArray(data)) {
      console.error("getAuctionData: getActiveCsvData did not return an array");
      return [];
    }

    // Filter out invalid entries
    const validData = data.filter(
      (item) =>
        item &&
        typeof item === "object" &&
        item.auctionLocation &&
        item.auction &&
        item.port
    );

    if (validData.length === 0) {
      console.warn(
        "getAuctionData: No valid auction data found, returning empty array"
      );
      return [];
    }

    return validData;
  } catch (error) {
    console.error("Error getting auction data:", error);
    return [];
  }
};

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

  // Use user pricing only if active, otherwise fall back to default
  const pricing =
    userPricing && (userPricing as any).isActive ? userPricing : defaultPricing;

  // Get active CSV data
  const csvData = await getActiveCsvData();

  // Calculate ground fee with user adjustment
  const baseGroundFee =
    csvData.find(
      (data) =>
        data.auction === auctionName && data.auctionLocation === auctionLoc
    )?.rate || 0;

  const groundFeeAdjustment = pricing?.groundFeeAdjustment || 0;
  const adjustedGroundFee = baseGroundFee + groundFeeAdjustment;

  console.log("Ground fee calculation:", {
    auctionName,
    auctionLoc,
    csvDataLength: csvData.length,
    baseGroundFee,
    groundFeeAdjustment,
    adjustedGroundFee,
  });

  // Calculate ocean fee with user/default adjustment
  // Normalize the port shorthand for matching
  const normalizedPort = (portName || "").toString().trim().toUpperCase();
  let oceanFee = 0;

  // First try to find rate in user/default pricing ocean rates
  if (pricing?.oceanRates && pricing.oceanRates.length > 0) {
    const matched = pricing.oceanRates.find(
      (rate: any) =>
        (rate.shorthand || "").toString().trim().toUpperCase() ===
        normalizedPort
    );
    if (matched) oceanFee = matched.rate;
  }

  // Fallback to DB-backed ocean rates
  if (oceanFee === 0) {
    const activeOceanRates = await getActiveOceanRates();
    const matchedDb = activeOceanRates.find(
      (rate) =>
        (rate.shorthand || "").toString().trim().toUpperCase() ===
        normalizedPort
    );
    if (matchedDb) oceanFee = matchedDb.rate;
  }

  // Final fallback to hardcoded constants
  if (oceanFee === 0) {
    const matchedHardcoded = oceanShippingRates.find(
      (rate) =>
        (rate.shorthand || "").toString().trim().toUpperCase() ===
        normalizedPort
    );
    oceanFee = matchedHardcoded?.rate || 0;
  }

  // Calculate extra fees with user adjustments
  const extraFeesTotal = additionalFeeTypes.reduce((total, feeType) => {
    let feeRate = 0;

    switch (feeType) {
      case "EV/Hybrid":
        feeRate =
          pricing?.hybridSurcharge ||
          extraFees.find((f) => f.type === "EV/Hybrid")?.rate ||
          0;
        break;
      case "Pickup":
        feeRate =
          pricing?.pickupSurcharge ||
          extraFees.find((f) => f.type === "Pickup")?.rate ||
          0;
        break;
      case "Service":
        feeRate =
          pricing?.serviceFee ||
          extraFees.find((f) => f.type === "Service")?.rate ||
          0;
        break;
      default:
        feeRate = extraFees.find((f) => f.type === feeType)?.rate || 0;
    }

    return total + feeRate;
  }, 0);

  return adjustedGroundFee + oceanFee + extraFeesTotal;
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

  // Use user pricing only if active, otherwise fall back to default
  const pricing =
    userPricing && (userPricing as any).isActive ? userPricing : defaultPricing;

  // Calculate purchase fees
  const auctionFee = calculateFee(styleData, purchaseFee);
  const gateFee = 79;
  const titleFee = 20;
  const environmentalFee = 10;
  const virtualBidFee = calculateFee(virtualBidData, purchaseFee);

  const totalPurchaseFee =
    purchaseFee +
    auctionFee +
    gateFee +
    titleFee +
    environmentalFee +
    virtualBidFee;

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
  const baseGroundFee =
    csvData.find(
      (data) =>
        data.auction === auction && data.auctionLocation === auctionLocation
    )?.rate || 0;

  const groundFeeAdjustment = pricing?.groundFeeAdjustment || 0;
  const adjustedGroundFee = baseGroundFee + groundFeeAdjustment;

  // Calculate ocean fee with user/default adjustment
  const normalizedPort = (port || "").toString().trim().toUpperCase();
  let oceanFee = 0;

  if (pricing?.oceanRates && pricing.oceanRates.length > 0) {
    const matched = pricing.oceanRates.find(
      (rate: any) =>
        (rate.shorthand || "").toString().trim().toUpperCase() ===
        normalizedPort
    );
    if (matched) oceanFee = matched.rate;
  }

  if (oceanFee === 0) {
    const activeOceanRates = await getActiveOceanRates();
    const matchedDb = activeOceanRates.find(
      (rate) =>
        (rate.shorthand || "").toString().trim().toUpperCase() ===
        normalizedPort
    );
    if (matchedDb) oceanFee = matchedDb.rate;
  }

  if (oceanFee === 0) {
    const matchedHardcoded = oceanShippingRates.find(
      (rate) =>
        (rate.shorthand || "").toString().trim().toUpperCase() ===
        normalizedPort
    );
    oceanFee = matchedHardcoded?.rate || 0;
  }

  return {
    totalFee: totalFee,
    shippingFee: shippingFee,
    auctionFee: auctionFee,
    gateFee: gateFee,
    titleFee: titleFee,
    environmentalFee: environmentalFee,
    virtualBidFee: virtualBidFee,
    groundFee: adjustedGroundFee,
    oceanFee: oceanFee,
    groundFeeAdjustment: groundFeeAdjustment,
    baseGroundFee: baseGroundFee,
    baseOceanFee: oceanFee,
  };
};

const a_styleData = [
  { range: "$0-$99.99", fee: 1 },
  { range: "$100.00-199.99", fee: 25 },
  { range: "$200.00-$299.99", fee: 60 },
  { range: "$300.00-$349.99", fee: 80 },
  { range: "$350.00-$399.99", fee: 90 },
  { range: "$400.00-$449.99", fee: 120 },
  { range: "$450.00-$499.99", fee: 130 },
  { range: "$500.00-$549.99", fee: 140 },
  { range: "$550.00-$599.99", fee: 150 },
  { range: "$600.00-$699.99", fee: 165 },
  { range: "$700.00-$799.99", fee: 185 },
  { range: "$800.00-$899.99", fee: 200 },
  { range: "$900.00-$999.99", fee: 215 },
  { range: "$1000.00-$1199.99", fee: 230 },
  { range: "$1200.00-$1299.99", fee: 255 },
  { range: "$1300.00-$1399.99", fee: 275 },
  { range: "$1400.00-$1499.99", fee: 280 },
  { range: "$1500.00-$1599.99", fee: 290 },
  { range: "$1600.00-$1699.99", fee: 305 },
  { range: "$1700.00-$1799.99", fee: 315 },
  { range: "$1800.00-$1999.99", fee: 325 },
  { range: "$2000.00-$2399.99", fee: 355 },
  { range: "$2400.00-$2499.99", fee: 380 },
  { range: "$2500.00-$2999.99", fee: 400 },
  { range: "$3000.00-$3499.99", fee: 450 },
  { range: "$3500.00-$3999.99", fee: 500 },
  { range: "$4000.00-$4499.99", fee: 600 },
  { range: "$4500.00-$4999.99", fee: 625 },
  { range: "$5000.00-$5999.99", fee: 650 },
  { range: "$6000.00-$6999.99", fee: 675 },
  { range: "$7000.00-$7999.99", fee: 700 },
  { range: "$8000.00-$9999.99", fee: 725 },
  { range: "$10000.00-$11499.99", fee: 750 },
  { range: "$11500.00-$11999.99", fee: 760 },
  { range: "$12000.00-$12499.99", fee: 775 },
  { range: "$12500.00-$14999.99", fee: 790 },
  { range: "$15000.00-$100000.00", fee: "6%" },
];

const c_styleData = [
  { range: "$0-$49.99", fee: 25 },
  { range: "$50.00-$99.99", fee: 45 },
  { range: "$100.00-199.99", fee: 80 },
  { range: "$200.00-$299.99", fee: 130 },
  { range: "$300.00-$349.99", fee: 132.5 },
  { range: "$350.00-$399.99", fee: 135 },
  { range: "$400.00-$449.99", fee: 170 },
  { range: "$450.00-$499.99", fee: 180 },
  { range: "$500.00-$549.99", fee: 200 },
  { range: "$550.00-$599.99", fee: 205 },
  { range: "$600.00-$699.99", fee: 235 },
  { range: "$700.00-$799.99", fee: 260 },
  { range: "$800.00-$899.99", fee: 280 },
  { range: "$900.00-$999.99", fee: 305 },
  { range: "$1000.00-$1199.99", fee: 355 },
  { range: "$1200.00-$1299.99", fee: 380 },
  { range: "$1300.00-$1399.99", fee: 400 },
  { range: "$1400.00-$1499.99", fee: 410 },
  { range: "$1500.00-$1599.99", fee: 420 },
  { range: "$1600.00-$1699.99", fee: 440 },
  { range: "$1700.00-$1799.99", fee: 450 },
  { range: "$1800.00-$1999.99", fee: 465 },
  { range: "$2000.00-$2399.99", fee: 500 },
  { range: "$2400.00-$2499.99", fee: 525 },
  { range: "$2500.00-$2999.99", fee: 550 },
  { range: "$3000.00-$3499.99", fee: 650 },
  { range: "$3500.00-$3999.99", fee: 700 },
  { range: "$4000.00-$4499.99", fee: 725 },
  { range: "$4500.00-$4999.99", fee: 750 },
  { range: "$5000.00-$5999.99", fee: 775 },
  { range: "$6000.00-$6999.99", fee: 800 },
  { range: "$7000.00-$7999.99", fee: 825 },
  { range: "$8000.00-$9999.99", fee: 850 },
  { range: "$10000.00-$14999.99", fee: 900 },
  { range: "$15000.00-$100000.00", fee: "7.5%" },
];

export const originalVirtualBidData = [
  { range: "$0-$99.99", fee: 0 },
  { range: "$100.00-$499.99", fee: 49 },
  { range: "$500.00-$999.99", fee: 59 },
  { range: "$1000.00-$1499.99", fee: 79 },
  { range: "$1500.00-$1999.99", fee: 89 },
  { range: "$2000.00-$3999.99", fee: 99 },
  { range: "$4000.00-$5999.99", fee: 109 },
  { range: "$6000.00-$7999.99", fee: 139 },
  { range: "$8000.00-$100000.00", fee: 149 },
];

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

export const fallbackAuctionData: AuctionData[] = [
  {
    auction: "Copart",
    auctionLocation: "AK - Anchorage",
    port: "CA",
    rate: 2320,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "AL - Birmingham",
    port: "GA",
    rate: 445,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "AL - Dothan",
    port: "GA",
    rate: 445,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "AL - Mobile",
    port: "GA",
    rate: 395,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "AL - Mobile South",
    port: "GA",
    rate: 345,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "AL - Montgomery",
    port: "GA",
    rate: 295,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "AL - Tanner",
    port: "GA",
    rate: 395,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "AR - Fayetteville",
    port: "TX",
    rate: 383,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "AR - Little Rock",
    port: "TX",
    rate: 450,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "AZ - Phoenix",
    port: "CA",
    rate: 320,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "AZ - Tucson",
    port: "CA",
    rate: 370,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "CA - Adelanto",
    port: "CA",
    rate: 245,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "CA - Antelope",
    port: "CA",
    rate: 370,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "CA - Bakersfield",
    port: "CA",
    rate: 270,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "CA - Fresno",
    port: "CA",
    rate: 295,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "CA - Hayward",
    port: "CA",
    rate: 370,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "CA - Long Beach",
    port: "CA",
    rate: 160,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "CA - Los Angeles",
    port: "CA",
    rate: 320,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "CA - Martinez",
    port: "CA",
    rate: 370,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "CA - Mentone",
    port: "CA",
    rate: 345,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "CA - Rancho Cucamonga",
    port: "CA",
    rate: 210,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "CA - Redding",
    port: "CA",
    rate: 545,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "CA - Sacramento",
    port: "CA",
    rate: 370,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "CA - San Bernardino",
    port: "CA",
    rate: 220,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "CA - San Diego",
    port: "CA",
    rate: 245,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "CA - San Jose",
    port: "CA",
    rate: 370,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "CA - Sun Valley",
    port: "CA",
    rate: 195,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "CA - Vallejo",
    port: "CA",
    rate: 395,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "CA - Van Nuys",
    port: "CA",
    rate: 200,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "CO - Colorado Springs",
    port: "TX",
    rate: 733,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "CO - Denver",
    port: "TX",
    rate: 683,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "CO - Denver Central",
    port: "TX",
    rate: 633,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "CO - Denver South",
    port: "TX",
    rate: 733,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "CT - Hartford",
    port: "NJ",
    rate: 320,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "CT - Hartford Springfield",
    port: "NJ",
    rate: 320,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "DC - Washington DC",
    port: "NJ",
    rate: 570,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "DE - Seaford",
    port: "NJ",
    rate: 320,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "FL - Ft. Pierce",
    port: "GA",
    rate: 295,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "FL - Jacksonville North",
    port: "GA",
    rate: 245,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "FL - Miami Central",
    port: "GA",
    rate: 320,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "FL - Miami North",
    port: "GA",
    rate: 320,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "FL - Miami South",
    port: "GA",
    rate: 320,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "FL - Ocala",
    port: "GA",
    rate: 345,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "FL - Orlando North",
    port: "GA",
    rate: 345,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "FL - Orlando South",
    port: "GA",
    rate: 345,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "FL - Punta Gorda",
    port: "GA",
    rate: 345,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "FL - Punta Gorda South",
    port: "GA",
    rate: 511,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "FL - Tallahassee",
    port: "GA",
    rate: 477,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "FL - Tampa South",
    port: "GA",
    rate: 395,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "FL - West Palm Beach",
    port: "GA",
    rate: 345,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "GA - Atlanta East",
    port: "GA",
    rate: 445,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "GA - Atlanta North",
    port: "GA",
    rate: 345,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "GA - Atlanta South",
    port: "GA",
    rate: 445,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "GA - Atlanta West",
    port: "GA",
    rate: 445,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "GA - Cartersville",
    port: "GA",
    rate: 445,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "GA - Fairburn",
    port: "GA",
    rate: 545,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "GA - Macon",
    port: "GA",
    rate: 495,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "GA - Savannah",
    port: "GA",
    rate: 140,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "GA - Tifton",
    port: "GA",
    rate: 445,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "HI - Honolulu",
    port: "CA",
    rate: 3620,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "IA - Davenport",
    port: "NJ",
    rate: 770,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "IA - Des Moines",
    port: "NJ",
    rate: 770,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "ID - Boise",
    port: "CA",
    rate: 770,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "IL - Chicago North",
    port: "NJ",
    rate: 670,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "IL - Chicago South",
    port: "NJ",
    rate: 670,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "IL - Peoria",
    port: "NJ",
    rate: 670,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "IL - Southern Illinois",
    port: "NJ",
    rate: 770,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "IL - Wheeling",
    port: "NJ",
    rate: 670,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "IN - Cicero",
    port: "NJ",
    rate: 620,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "IN - Dyer",
    port: "NJ",
    rate: 545,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "IN - Fort Wayne",
    port: "NJ",
    rate: 520,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "IN - Hartford City",
    port: "NJ",
    rate: 620,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "IN - Indianapolis",
    port: "NJ",
    rate: 520,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "KS - Kansas City East",
    port: "TX",
    rate: 845,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "KS - Wichita",
    port: "TX",
    rate: 500,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "KY - Earlington",
    port: "GA",
    rate: 570,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "KY - Lexington East",
    port: "NJ",
    rate: 520,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "KY - Lexington West",
    port: "NJ",
    rate: 520,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "KY - Louisville",
    port: "GA",
    rate: 829,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "KY - Walton",
    port: "NJ",
    rate: 520,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "LA - Baton Rouge",
    port: "TX",
    rate: 333,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "LA - New Orleans",
    port: "TX",
    rate: 333,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "LA - Shreveport",
    port: "TX",
    rate: 333,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "MA - Freetown",
    port: "NJ",
    rate: 520,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "MA - North Boston",
    port: "NJ",
    rate: 320,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "MA - South Boston",
    port: "NJ",
    rate: 320,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "MA - West Warren",
    port: "NJ",
    rate: 320,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "MD - Baltimore",
    port: "NJ",
    rate: 320,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "MD - Baltimore East",
    port: "NJ",
    rate: 420,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "ME - Lyman",
    port: "NJ",
    rate: 570,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "ME - Windham",
    port: "NJ",
    rate: 500,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "MI - Detroit",
    port: "NJ",
    rate: 620,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "MI - Flint",
    port: "NJ",
    rate: 570,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "MI - Ionia",
    port: "NJ",
    rate: 570,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "MI - Kincheloe",
    port: "NJ",
    rate: 895,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "MI - Lansing",
    port: "NJ",
    rate: 570,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "MN - Minneapolis",
    port: "NJ",
    rate: 670,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "MN - Minneapolis North",
    port: "NJ",
    rate: 670,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "MN - St. Cloud",
    port: "NJ",
    rate: 720,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "MO - Columbia",
    port: "GA",
    rate: 495,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "MO - Sikeston",
    port: "NJ",
    rate: 570,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "MO - Springfield",
    port: "TX",
    rate: 720,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "MO - St. Louis",
    port: "GA",
    rate: 695,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "MS - Jackson",
    port: "GA",
    rate: 445,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "MT - Billings",
    port: "CA",
    rate: 920,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "MT - Helena",
    port: "CA",
    rate: 820,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "NC - China Grove",
    port: "GA",
    rate: 495,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "NC - Concord",
    port: "GA",
    rate: 370,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "NC - Gastonia",
    port: "GA",
    rate: 500,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "NC - Lumberton",
    port: "GA",
    rate: 545,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "NC - Mebane",
    port: "GA",
    rate: 445,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "NC - Mocksville",
    port: "GA",
    rate: 545,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "NC - Raleigh",
    port: "GA",
    rate: 495,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "NC - Raleigh North",
    port: "GA",
    rate: 500,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "ND - Bismarck",
    port: "TX",
    rate: 1033,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "NE - Lincoln",
    port: "NJ",
    rate: 720,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "NH - Candia",
    port: "NJ",
    rate: 420,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "NJ - Glassboro East",
    port: "NJ",
    rate: 320,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "NJ - Glassboro West",
    port: "NJ",
    rate: 370,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "NJ - Somerville",
    port: "NJ",
    rate: 320,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "NJ - Trenton",
    port: "NJ",
    rate: 320,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "NM - Albuquerque",
    port: "CA",
    rate: 740,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "NV - Las Vegas",
    port: "CA",
    rate: 517,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "NV - Las Vegas West",
    port: "CA",
    rate: 400,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "NV - Reno",
    port: "CA",
    rate: 445,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "NY - Albany",
    port: "NJ",
    rate: 320,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "NY - Buffalo",
    port: "NJ",
    rate: 520,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "NY - Long Island",
    port: "NJ",
    rate: 320,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "NY - Newburgh",
    port: "NJ",
    rate: 320,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "NY - Rochester",
    port: "NJ",
    rate: 420,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "NY - Syracuse",
    port: "NJ",
    rate: 320,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "OH - Cleveland East",
    port: "NJ",
    rate: 470,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "OH - Cleveland West",
    port: "NJ",
    rate: 470,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "OH - Columbus",
    port: "NJ",
    rate: 470,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "OH - Dayton",
    port: "NJ",
    rate: 500,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "OK - Oklahoma City",
    port: "TX",
    rate: 383,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "OK - Tulsa",
    port: "TX",
    rate: 333,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "OR - Eugene",
    port: "CA",
    rate: 620,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "OR - Portland North",
    port: "CA",
    rate: 620,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "OR - Portland South",
    port: "CA",
    rate: 620,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "PA - Altoona",
    port: "NJ",
    rate: 420,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "PA - Chambersburg",
    port: "NJ",
    rate: 420,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "PA - Harrisburg",
    port: "NJ",
    rate: 320,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "PA - Philadelphia",
    port: "NJ",
    rate: 273,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "PA - Philadelphia East",
    port: "NJ",
    rate: 320,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "PA - Pittsburgh North",
    port: "NJ",
    rate: 470,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "PA - Pittsburgh South",
    port: "NJ",
    rate: 470,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "PA - Pittsburgh West",
    port: "NJ",
    rate: 420,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "PA - Scranton",
    port: "NJ",
    rate: 320,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "PA - York Haven",
    port: "NJ",
    rate: 320,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "RI - Exeter",
    port: "NJ",
    rate: 420,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "SC - Columbia",
    port: "GA",
    rate: 300,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "SC - North Charleston",
    port: "GA",
    rate: 545,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "SC - Spartanburg",
    port: "GA",
    rate: 425,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "TN - Knoxville",
    port: "GA",
    rate: 595,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "TN - Memphis",
    port: "GA",
    rate: 595,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "TN - Nashville",
    port: "GA",
    rate: 595,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "TX - Abilene",
    port: "TX",
    rate: 283,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "TX - Amarillo",
    port: "TX",
    rate: 500,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "TX - Andrews",
    port: "TX",
    rate: 336,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "TX - Austin",
    port: "TX",
    rate: 333,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "TX - Corpus Christi",
    port: "TX",
    rate: 333,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "TX - CrashedToys Dallas",
    port: "TX",
    rate: 333,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "TX - Dallas",
    port: "TX",
    rate: 333,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "TX - Dallas South",
    port: "TX",
    rate: 283,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "TX - El Paso",
    port: "TX",
    rate: 375,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "TX - Ft. Worth",
    port: "TX",
    rate: 283,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "TX - Houston",
    port: "TX",
    rate: 333,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "TX - Houston East",
    port: "TX",
    rate: 333,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "TX - Longview",
    port: "TX",
    rate: 333,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "TX - Lufkin",
    port: "TX",
    rate: 333,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "TX - McAllen",
    port: "TX",
    rate: 333,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "TX - San Antonio",
    port: "TX",
    rate: 333,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "TX - Waco",
    port: "TX",
    rate: 333,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "UT - Ogden",
    port: "CA",
    rate: 470,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "UT - Salt Lake City",
    port: "CA",
    rate: 470,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "VA - Danville",
    port: "NJ",
    rate: 495,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "VA - Fredericksburg",
    port: "NJ",
    rate: 523,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "VA - Hampton",
    port: "NJ",
    rate: 420,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "VA - Richmond",
    port: "NJ",
    rate: 445,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "VA - Richmond East",
    port: "NJ",
    rate: 445,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "VT - Rutland",
    port: "NJ",
    rate: 500,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "WA - Graham",
    port: "CA",
    rate: 670,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "WA - North Seattle",
    port: "CA",
    rate: 950,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "WA - Pasco",
    port: "CA",
    rate: 770,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "WA - Spokane",
    port: "CA",
    rate: 770,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "WI - Appleton",
    port: "NJ",
    rate: 670,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "WI - Madison South",
    port: "NJ",
    rate: 720,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "WI - Milwaukee",
    port: "NJ",
    rate: 720,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "WI - Milwaukee North",
    port: "NJ",
    rate: 770,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "WI - Milwaukee South",
    port: "NJ",
    rate: 700,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "WV - Charleston",
    port: "NJ",
    rate: 670,
    zip: "",
  },
  {
    auction: "Copart",
    auctionLocation: "WY - Casper",
    port: "TX",
    rate: 933,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Abilene",
    port: "TX",
    rate: 333,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "ACE - Carson",
    port: "TX",
    rate: 1320,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "ACE - Perris",
    port: "TX",
    rate: 1320,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Akron-Canton",
    port: "NJ",
    rate: 420,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Albany",
    port: "NJ",
    rate: 320,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Albuquerque",
    port: "TX",
    rate: 740,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Altoona",
    port: "NJ",
    rate: 420,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Amarillo",
    port: "TX",
    rate: 333,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Anaheim",
    port: "CA",
    rate: 370,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Anchorage",
    port: "CA",
    rate: 3370,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Appleton",
    port: "NJ",
    rate: 720,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Asheville",
    port: "GA",
    rate: 495,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Ashland",
    port: "NJ",
    rate: 570,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Atlanta",
    port: "GA",
    rate: 345,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Atlanta East",
    port: "GA",
    rate: 445,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Atlanta North",
    port: "GA",
    rate: 445,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Atlanta South",
    port: "GA",
    rate: 445,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Austin",
    port: "TX",
    rate: 333,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Avenel New Jersey",
    port: "NJ",
    rate: 320,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Baltimore",
    port: "NJ",
    rate: 320,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Baton Rouge",
    port: "TX",
    rate: 333,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Billings",
    port: "CA",
    rate: 920,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Birmingham",
    port: "GA",
    rate: 495,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Boise",
    port: "CA",
    rate: 670,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Boston - Shirley",
    port: "NJ",
    rate: 395,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Bowling Green",
    port: "GA",
    rate: 395,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Bridgeport",
    port: "NJ",
    rate: 320,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Buckhannon",
    port: "NJ",
    rate: 520,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Buffalo",
    port: "NJ",
    rate: 470,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Burlington",
    port: "NJ",
    rate: 420,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Casper",
    port: "TX",
    rate: 1033,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Central New Jersey",
    port: "NJ",
    rate: 320,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Charleston",
    port: "GA",
    rate: 445,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Charlotte",
    port: "GA",
    rate: 495,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Chattanooga",
    port: "GA",
    rate: 595,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Chicago-North",
    port: "NJ",
    rate: 520,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Chicago-South",
    port: "NJ",
    rate: 520,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Chicago-West",
    port: "NJ",
    rate: 470,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Cincinnati",
    port: "NJ",
    rate: 550,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Cincinnati-South",
    port: "NJ",
    rate: 520,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Clearwater",
    port: "GA",
    rate: 345,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Cleveland",
    port: "NJ",
    rate: 420,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Colorado Springs",
    port: "TX",
    rate: 720,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Colton",
    port: "TX",
    rate: 1320,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Columbia",
    port: "GA",
    rate: 445,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Columbus",
    port: "NJ",
    rate: 420,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Concord",
    port: "NJ",
    rate: 470,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Corpus Christi",
    port: "TX",
    rate: 333,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Culpeper",
    port: "NJ",
    rate: 420,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Dallas",
    port: "TX",
    rate: 333,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Dallas/Ft Worth",
    port: "TX",
    rate: 333,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Davenport",
    port: "NJ",
    rate: 620,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Dayton",
    port: "NJ",
    rate: 470,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Denver",
    port: "TX",
    rate: 533,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Denver East",
    port: "TX",
    rate: 683,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Des Moines",
    port: "NJ",
    rate: 620,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Detroit",
    port: "NJ",
    rate: 570,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Dothan",
    port: "GA",
    rate: 445,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Dream Rides",
    port: "NJ",
    rate: 850,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Dundalk",
    port: "NJ",
    rate: 320,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "East Bay",
    port: "CA",
    rate: 620,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "El Paso",
    port: "TX",
    rate: 333,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Englishtown",
    port: "NJ",
    rate: 320,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Erie",
    port: "NJ",
    rate: 520,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Eugene",
    port: "CA",
    rate: 620,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Fargo",
    port: "NJ",
    rate: 920,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Fayetteville",
    port: "TX",
    rate: 416,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Flint",
    port: "NJ",
    rate: 570,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Fontana",
    port: "CA",
    rate: 478,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Fort Myers",
    port: "GA",
    rate: 395,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Fort Pierce",
    port: "GA",
    rate: 345,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Fort Wayne",
    port: "NJ",
    rate: 520,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Fort Worth North",
    port: "TX",
    rate: 333,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Fredericksburg-South",
    port: "NJ",
    rate: 320,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Fremont",
    port: "CA",
    rate: 370,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Fresno",
    port: "CA",
    rate: 637,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Grand Rapids",
    port: "NJ",
    rate: 585,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Greensboro",
    port: "GA",
    rate: 375,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Greenville",
    port: "GA",
    rate: 445,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Grenada",
    port: "GA",
    rate: 500,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Gulf Coast",
    port: "GA",
    rate: 645,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Hartford",
    port: "NJ",
    rate: 320,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Hartford-South",
    port: "NJ",
    rate: 320,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "High Desert",
    port: "TX",
    rate: 1395,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Honolulu",
    port: "CA",
    rate: 3620,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Houston",
    port: "TX",
    rate: 333,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Houston South",
    port: "TX",
    rate: 333,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Houston-North",
    port: "TX",
    rate: 333,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Huntsville",
    port: "GA",
    rate: 505,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Indianapolis",
    port: "NJ",
    rate: 520,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Jackson",
    port: "GA",
    rate: 645,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Jacksonville",
    port: "GA",
    rate: 395,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Kansas City",
    port: "TX",
    rate: 845,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Kansas City East",
    port: "NJ",
    rate: 1200,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Knoxville",
    port: "GA",
    rate: 745,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Lafayette",
    port: "TX",
    rate: 333,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Las Vegas",
    port: "TX",
    rate: 1220,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Laurel",
    port: "NJ",
    rate: 320,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Lexington",
    port: "GA",
    rate: 545,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Lincoln",
    port: "NJ",
    rate: 520,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Little Rock",
    port: "TX",
    rate: 333,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Long Island",
    port: "NJ",
    rate: 320,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Longview",
    port: "TX",
    rate: 333,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Los Angeles",
    port: "CA",
    rate: 320,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Los Angeles South",
    port: "CA",
    rate: 160,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Louisville",
    port: "NJ",
    rate: 585,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Louisville North",
    port: "NJ",
    rate: 584,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Lubbock",
    port: "TX",
    rate: 370,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Macon",
    port: "GA",
    rate: 345,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Manchester",
    port: "NJ",
    rate: 385,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "McAllen",
    port: "TX",
    rate: 333,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Memphis",
    port: "GA",
    rate: 595,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Metro DC",
    port: "NJ",
    rate: 320,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Miami",
    port: "GA",
    rate: 345,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Miami-North",
    port: "GA",
    rate: 325,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Milwaukee",
    port: "NJ",
    rate: 720,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Minneapolis South",
    port: "NJ",
    rate: 700,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Minneapolis/St. Paul",
    port: "NJ",
    rate: 585,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Missoula",
    port: "TX",
    rate: 1198,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Nashville",
    port: "GA",
    rate: 645,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "New Castle",
    port: "NJ",
    rate: 320,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "New Orleans",
    port: "TX",
    rate: 333,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "New Orleans East",
    port: "TX",
    rate: 333,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Newburgh",
    port: "NJ",
    rate: 320,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "North Hollywood",
    port: "CA",
    rate: 237,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Northern Virginia",
    port: "NJ",
    rate: 320,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Oklahoma City",
    port: "TX",
    rate: 333,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Omaha",
    port: "TX",
    rate: 690,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Online Exclusive",
    port: "NJ",
    rate: 455,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Orlando",
    port: "GA",
    rate: 345,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Orlando-North",
    port: "GA",
    rate: 345,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Paducah",
    port: "NJ",
    rate: 520,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Pensacola",
    port: "GA",
    rate: 345,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Permian Basin",
    port: "TX",
    rate: 545,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Philadelphia",
    port: "NJ",
    rate: 320,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Phoenix",
    port: "CA",
    rate: 320,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Pittsburgh",
    port: "NJ",
    rate: 420,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Pittsburgh-North",
    port: "NJ",
    rate: 420,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Port Murray",
    port: "NJ",
    rate: 500,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Portage",
    port: "NJ",
    rate: 670,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Portland",
    port: "TX",
    rate: 1520,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Portland - Gorham",
    port: "NJ",
    rate: 1520,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Portland West",
    port: "TX",
    rate: 1595,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Providence",
    port: "NJ",
    rate: 370,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Pulaski",
    port: "NJ",
    rate: 470,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Raleigh",
    port: "GA",
    rate: 482,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "REC RIDES - Online-Exclusive",
    port: "NJ",
    rate: 850,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Reno",
    port: "TX",
    rate: 970,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Richmond",
    port: "GA",
    rate: 410,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Riverside",
    port: "CA",
    rate: 250,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Roanoke",
    port: "GA",
    rate: 495,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Rochester",
    port: "NJ",
    rate: 420,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Sacramento",
    port: "CA",
    rate: 370,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Salt Lake City",
    port: "CA",
    rate: 470,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "San Antonio-South",
    port: "TX",
    rate: 333,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "San Diego",
    port: "CA",
    rate: 245,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Savannah",
    port: "GA",
    rate: 375,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Sayreville",
    port: "NJ",
    rate: 320,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Scranton",
    port: "NJ",
    rate: 320,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Seattle",
    port: "TX",
    rate: 1620,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Shady Spring",
    port: "NJ",
    rate: 570,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Shreveport",
    port: "TX",
    rate: 333,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Sioux Falls",
    port: "NJ",
    rate: 870,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Southern New Jersey",
    port: "NJ",
    rate: 320,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Specialty Division",
    port: "NJ",
    rate: 850,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Spokane",
    port: "CA",
    rate: 770,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Springfield",
    port: "GA",
    rate: 715,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "St. Louis",
    port: "GA",
    rate: 575,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Staten Island",
    port: "NJ",
    rate: 250,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Suffolk",
    port: "NJ",
    rate: 470,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Syracuse",
    port: "NJ",
    rate: 360,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Tampa",
    port: "GA",
    rate: 345,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Tampa North",
    port: "GA",
    rate: 395,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Taunton",
    port: "NJ",
    rate: 320,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Templeton",
    port: "NJ",
    rate: 390,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Tidewater",
    port: "NJ",
    rate: 370,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Tifton",
    port: "GA",
    rate: 345,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Tucson",
    port: "CA",
    rate: 370,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Tulsa",
    port: "TX",
    rate: 500,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Virtual Lane A",
    port: "NJ",
    rate: 500,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Virtual Lane B",
    port: "NJ",
    rate: 475,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Virtual Lane C",
    port: "NJ",
    rate: 475,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "Wichita",
    port: "TX",
    rate: 500,
    zip: "",
  },
  {
    auction: "IAAI",
    auctionLocation: "York Springs",
    port: "NJ",
    rate: 320,
    zip: "",
  },
];

// Calculate due amounts for a car based on fees and custom pricing
export const calculateDueAmounts = (
  baseFees: {
    purchaseFee: number;
    auctionFee?: number | null;
    gateFee?: number | null;
    titleFee?: number | null;
    environmentalFee?: number | null;
    virtualBidFee?: number | null;
    shippingFee?: number | null;
    groundFee?: number | null;
    oceanFee?: number | null;
    totalFee?: number | null;
  },
  customPricing?: {
    groundFeeAdjustment: number;
    pickupSurcharge: number;
    serviceFee: number;
    hybridSurcharge: number;
  },
  fuelType?: string
) => {
  // Calculate purchase due
  const purchaseDue =
    (baseFees.purchaseFee || 0) +
    (baseFees.auctionFee || 0) +
    (baseFees.gateFee || 0) +
    (baseFees.titleFee || 0) +
    (baseFees.environmentalFee || 0) +
    (baseFees.virtualBidFee || 0);

  // Calculate shipping due with custom pricing adjustments
  let shippingDue =
    (baseFees.shippingFee || 0) +
    (baseFees.groundFee || 0) +
    (baseFees.oceanFee || 0);

  if (customPricing) {
    shippingDue += customPricing.groundFeeAdjustment;
    shippingDue += customPricing.pickupSurcharge;
    shippingDue += customPricing.serviceFee;

    // Add hybrid surcharge if applicable
    if (fuelType === "HYBRID_ELECTRIC") {
      shippingDue += customPricing.hybridSurcharge;
    }
  }

  // Calculate total due
  const totalDue = purchaseDue + shippingDue;

  return {
    purchaseDue,
    shippingDue,
    totalDue,
  };
};

// Update car due amounts when fees change
export const updateCarDueAmounts = async (
  carVin: string,
  newFees: {
    purchaseFee?: number;
    auctionFee?: number | null;
    gateFee?: number | null;
    titleFee?: number | null;
    environmentalFee?: number | null;
    virtualBidFee?: number | null;
    shippingFee?: number | null;
    groundFee?: number | null;
    oceanFee?: number | null;
    totalFee?: number | null;
  },
  customPricing?: {
    groundFeeAdjustment: number;
    pickupSurcharge: number;
    serviceFee: number;
    hybridSurcharge: number;
  },
  fuelType?: string
) => {
  // Import here to avoid circular dependencies
  const { db } = await import("./drizzle/db");
  const { cars } = await import("./drizzle/schema");
  const { eq } = await import("drizzle-orm");

  // Get current car data
  const currentCar = await db.query.cars.findFirst({
    where: eq(cars.vin, carVin),
  });

  if (!currentCar) {
    throw new Error("Car not found");
  }

  // Merge existing fees with new fees
  const mergedFees = {
    purchaseFee: newFees.purchaseFee ?? currentCar.purchaseFee,
    auctionFee: newFees.auctionFee ?? currentCar.auctionFee,
    gateFee: newFees.gateFee ?? currentCar.gateFee,
    titleFee: newFees.titleFee ?? currentCar.titleFee,
    environmentalFee: newFees.environmentalFee ?? currentCar.environmentalFee,
    virtualBidFee: newFees.virtualBidFee ?? currentCar.virtualBidFee,
    shippingFee: newFees.shippingFee ?? currentCar.shippingFee,
    groundFee: newFees.groundFee ?? currentCar.groundFee,
    oceanFee: newFees.oceanFee ?? currentCar.oceanFee,
    totalFee: newFees.totalFee ?? currentCar.totalFee,
  };

  // Calculate new due amounts
  const { purchaseDue, shippingDue, totalDue } = calculateDueAmounts(
    mergedFees,
    customPricing,
    fuelType || currentCar.fuelType
  );

  // Update the car with new due amounts
  await db
    .update(cars)
    .set({
      purchaseDue,
      shippingDue,
      totalDue,
      // Update the fee fields as well
      ...newFees,
    })
    .where(eq(cars.vin, carVin));

  return {
    purchaseDue,
    shippingDue,
    totalDue,
  };
};
