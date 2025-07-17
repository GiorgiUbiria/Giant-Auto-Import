import { NextResponse } from "next/server";
import { db } from "@/lib/drizzle/db";
import { cars } from "@/lib/drizzle/schema";
import { desc, asc, eq, sql, and, like } from "drizzle-orm";

export const runtime = "edge";

// Map allowed sort keys to columns
const sortColumnMap = {
  id: cars.id,
  ownerId: cars.ownerId,
  vin: cars.vin,
  year: cars.year,
  make: cars.make,
  model: cars.model,
  reciever: cars.reciever,
  lotNumber: cars.lotNumber,
  purchaseFee: cars.purchaseFee,
  auctionFee: cars.auctionFee,
  gateFee: cars.gateFee,
  titleFee: cars.titleFee,
  environmentalFee: cars.environmentalFee,
  virtualBidFee: cars.virtualBidFee,
  shippingFee: cars.shippingFee,
  groundFee: cars.groundFee,
  oceanFee: cars.oceanFee,
  totalFee: cars.totalFee,
  arrivalDate: cars.arrivalDate,
  departureDate: cars.departureDate,
  purchaseDate: cars.purchaseDate,
  auction: cars.auction,
  originPort: cars.originPort,
  keys: cars.keys,
  title: cars.title,
  insurance: cars.insurance,
  shippingStatus: cars.shippingStatus,
  bodyType: cars.bodyType,
  fuelType: cars.fuelType,
};

type SortKey = keyof typeof sortColumnMap;

// Updated: Use like for partial VIN filtering (case-insensitive for ASCII in SQLite)
function buildWhereClause(vin?: string, ownerId?: string) {
  if (vin && ownerId) {
    return and(
      like(cars.vin, `%${vin}%`),
      eq(cars.ownerId, ownerId)
    );
  } else if (vin) {
    return like(cars.vin, `%${vin}%`);
  } else if (ownerId) {
    return eq(cars.ownerId, ownerId);
  }
  return undefined;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") ?? 1);
    const pageSize = Number(searchParams.get("pageSize") ?? 20);
    const sortByParam = searchParams.get("sortBy") ?? "purchaseDate";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? asc : desc;
    const vin = searchParams.get("vin") || undefined;
    const ownerId = searchParams.get("ownerId") || undefined;

    // Validate sortBy
    const sortBy: SortKey = (sortByParam in sortColumnMap ? sortByParam : "purchaseDate") as SortKey;
    const sortColumn = sortColumnMap[sortBy];

    const whereClause = buildWhereClause(vin, ownerId);

    // Fetch paginated data
    const [data, countResult] = await Promise.all([
      db.query.cars.findMany({
        where: whereClause,
        orderBy: sortOrder(sortColumn),
        limit: pageSize,
        offset: (page - 1) * pageSize,
      }),
      db.select({ count: sql<number>`cast(count(${cars.id}) as integer)` })
        .from(cars)
        .where(whereClause),
    ]);

    const count = countResult[0]?.count ?? 0;
    return NextResponse.json({ cars: data, count });
  } catch (error) {
    console.error("Error fetching cars:", error);
    return NextResponse.json(
      { error: "Failed to fetch cars" },
      { status: 500 }
    );
  }
}