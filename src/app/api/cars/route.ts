import { NextResponse } from "next/server";
import { db } from "@/lib/drizzle/db";
import { cars } from "@/lib/drizzle/schema";
import { desc, asc, eq, sql, and, like } from "drizzle-orm";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

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
function buildWhereClause(vin?: string, vinLot?: string, ownerId?: string) {
  const conditions = [];

  // Handle VIN filtering (either from vin or vinLot parameter)
  const vinFilter = vin || vinLot;
  if (vinFilter) {
    conditions.push(like(cars.vin, `%${vinFilter}%`));
  }

  // Handle owner filtering
  if (ownerId) {
    conditions.push(eq(cars.ownerId, ownerId));
  }

  if (conditions.length === 0) {
    return undefined;
  } else if (conditions.length === 1) {
    return conditions[0];
  } else {
    return and(...conditions);
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") ?? 1);
    const pageSize = Number(searchParams.get("pageSize") ?? 20);
    const sortByParam = searchParams.get("sortBy") ?? "purchaseDate";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? asc : desc;
    const vin = searchParams.get("vin") || undefined;
    const vinLot = searchParams.get("vinLot") || undefined; // Add support for vinLot filter
    const ownerId = searchParams.get("ownerId") || undefined;
    const includeDetails = searchParams.get("includeDetails") === "true";

    // Validate sortBy
    const sortBy: SortKey = (
      sortByParam in sortColumnMap ? sortByParam : "purchaseDate"
    ) as SortKey;
    const sortColumn = sortColumnMap[sortBy];

    const whereClause = buildWhereClause(vin, vinLot, ownerId);

    // Fetch paginated data with optimized query
    const [data, countResult] = await Promise.all([
      db.query.cars.findMany({
        where: whereClause,
        orderBy: sortOrder(sortColumn),
        limit: pageSize,
        offset: (page - 1) * pageSize,
      }),
      db
        .select({ count: sql<number>`cast(count(${cars.id}) as integer)` })
        .from(cars)
        .where(whereClause),
    ]);

    const count = countResult[0]?.count ?? 0;

    // If includeDetails is true, fetch payment and invoice data for each car
    let carsWithDetails = data;
    if (includeDetails) {
      carsWithDetails = await Promise.all(
        data.map(async (car) => {
          // Import the payment and invoice actions here to avoid circular dependencies
          let getPaymentHistoryAction, checkInvoiceExistsAction;
          try {
            const paymentModule = await import("@/lib/actions/paymentActions");
            const invoiceModule = await import("@/lib/actions/invoiceActions");
            getPaymentHistoryAction = paymentModule.getPaymentHistoryAction;
            checkInvoiceExistsAction = invoiceModule.checkInvoiceExistsAction;

            if (!getPaymentHistoryAction || !checkInvoiceExistsAction) {
              throw new Error(
                "Required functions not found in imported modules"
              );
            }
          } catch (importError) {
            console.error(
              "Failed to import payment/invoice actions:",
              importError
            );
            // Return car without details if imports fail
            return {
              ...car,
              paymentHistory: [],
              invoiceStatus: {
                purchaseInvoice: false,
                shippingInvoice: false,
                totalInvoice: false,
              },
            };
          }

          try {
            // Get payment history for this car
            const paymentHistory = await getPaymentHistoryAction({
              carVin: car.vin,
            });

            // Check invoice status for all types
            const [purchaseInvoice, shippingInvoice, totalInvoice] =
              await Promise.all([
                checkInvoiceExistsAction({
                  carVin: car.vin,
                  invoiceType: "PURCHASE",
                }),
                checkInvoiceExistsAction({
                  carVin: car.vin,
                  invoiceType: "SHIPPING",
                }),
                checkInvoiceExistsAction({
                  carVin: car.vin,
                  invoiceType: "TOTAL",
                }),
              ]);

            return {
              ...car,
              paymentHistory: paymentHistory?.[0] || [],
              hasInvoice: {
                PURCHASE: purchaseInvoice?.[0]?.exists || false,
                SHIPPING: shippingInvoice?.[0]?.exists || false,
                TOTAL: totalInvoice?.[0]?.exists || false,
              },
            };
          } catch (error) {
            console.error(`Error fetching details for car ${car.vin}:`, error);
            return {
              ...car,
              paymentHistory: [],
              hasInvoice: {
                PURCHASE: false,
                SHIPPING: false,
                TOTAL: false,
              },
            };
          }
        })
      );
    }

    // Create response without caching headers to allow React Query to manage caching
    return NextResponse.json({
      cars: carsWithDetails,
      count,
      page,
      pageSize,
      totalPages: Math.ceil(count / pageSize),
    });
  } catch (error) {
    console.error("Error in cars API:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch cars",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
