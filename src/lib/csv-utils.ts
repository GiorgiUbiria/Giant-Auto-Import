import { AuctionData } from "./drizzle/types";

/**
 * Parse CSV content to match the structure in csvData.ts
 * @param csvContent - Raw CSV content as string
 * @returns Array of AuctionData objects
 */
export const parseCsvToJson = (csvContent: string): AuctionData[] => {
  const rows = csvContent.trim().split('\n');
  const jsonData: AuctionData[] = [];

  // Skip header row
  for (let i = 1; i < rows.length; i++) {
    let values = rows[i].split(',').map((value, index) => {
      if (value.startsWith('"') && value.endsWith('"')) {
        return value.substring(1, value.length - 1);
      }
      return value;
    });

    // Ensure we have at least 6 columns
    if (values.length < 6) {
      continue; // Skip malformed rows
    }

    const obj: AuctionData = {
      auction: values[0] === "Copart" ? "Copart" : "IAAI",
      auctionLocation: values[1],
      port: values[5].trim().slice(0, values[5].length - 2),
      zip: values[3],
      rate: parseInt(values[6].replace(/\$/g, ''), 10) || 0,
    };

    jsonData.push(obj);
  }

  return jsonData;
};

/**
 * Validate that CSV matches expected format
 * @param csvContent - Raw CSV content as string
 * @returns boolean indicating if CSV is valid
 */
export const validateCsvFormat = (csvContent: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const rows = csvContent.trim().split('\n');

  if (rows.length < 2) {
    errors.push("CSV must have at least a header row and one data row");
    return { isValid: false, errors };
  }

  // Check header
  const header = rows[0].toLowerCase();
  const expectedHeaders = ['auction', 'auction name', 'location', 'zip', 'port', 'rate'];
  const actualHeaders = header.split(',').map(h => h.trim().replace(/"/g, ''));

  for (const expected of expectedHeaders) {
    if (!actualHeaders.some(actual => actual.includes(expected))) {
      errors.push(`Missing required header: ${expected}`);
    }
  }

  // Check data rows
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const values = row.split(',');

    if (values.length < 6) {
      errors.push(`Row ${i + 1}: Insufficient columns (expected 6, got ${values.length})`);
      continue;
    }

    // Validate auction type
    const auction = values[0].replace(/"/g, '');
    if (!['copart', 'iaai'].includes(auction.toLowerCase())) {
      errors.push(`Row ${i + 1}: Invalid auction type "${auction}" (must be Copart or IAAI)`);
    }

    // Validate rate format
    const rateStr = values[6]?.replace(/"/g, '').replace(/\$/g, '');
    const rate = parseInt(rateStr, 10);
    if (isNaN(rate) || rate < 0) {
      errors.push(`Row ${i + 1}: Invalid rate "${rateStr}" (must be a positive number)`);
    }
  }

  return { isValid: errors.length === 0, errors };
};

/**
 * Generate a template CSV file for users to download
 * @returns CSV template string
 */
export const generateCsvTemplate = (): string => {
  return `Auction,Auction Name,Location,Zip,Port,Rate
Copart,AK - Anchorage,Anchorage,99501,"Los Angeles, CA",$2320
Copart,AL - Birmingham,Hueytown,35023,"Savannah, GA",$445
Copart,AL - Dothan,Newton,36352,"Savannah, GA",$445
IAA,Abilene,Abilene,79601,"Houston, TX",$333
IAA,ACE - Carson,Gardena,90248,"Houston, TX","$1320"
IAA,ACE - Perris,Perris,92571,"Houston, TX","$1320"`;
};

/**
 * Convert AuctionData array back to CSV format
 * @param data - Array of AuctionData objects
 * @returns CSV string
 */
export const auctionDataToCsv = (data: AuctionData[]): string => {
  const header = 'Auction,Auction Name,Location,Zip,Port,Rate\n';
  const rows = data.map(item => 
    `${item.auction},"${item.auctionLocation}","${item.auctionLocation}",${item.zip},"${item.port}",$${item.rate}`
  ).join('\n');
  
  return header + rows;
};

/**
 * Get unique auction locations from CSV data
 * @param data - Array of AuctionData objects
 * @returns Array of unique auction locations
 */
export const getUniqueAuctionLocations = (data: AuctionData[]): string[] => {
  return Array.from(new Set(data.map(item => item.auctionLocation)));
};

/**
 * Get unique ports from CSV data
 * @param data - Array of AuctionData objects
 * @returns Array of unique ports
 */
export const getUniquePorts = (data: AuctionData[]): string[] => {
  return Array.from(new Set(data.map(item => item.port)));
};

/**
 * Filter CSV data by auction type
 * @param data - Array of AuctionData objects
 * @param auction - Auction type to filter by
 * @returns Filtered array of AuctionData objects
 */
export const filterByAuction = (data: AuctionData[], auction: string): AuctionData[] => {
  return data.filter(item => item.auction === auction);
};

/**
 * Get ground fee for specific auction and location
 * @param data - Array of AuctionData objects
 * @param auction - Auction type
 * @param location - Auction location
 * @returns Ground fee rate or 0 if not found
 */
export const getGroundFee = (data: AuctionData[], auction: string, location: string): number => {
  const match = data.find(item => 
    item.auction === auction && item.auctionLocation === location
  );
  return match?.rate || 0;
}; 