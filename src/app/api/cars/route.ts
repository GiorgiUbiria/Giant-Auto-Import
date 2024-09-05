import { NextResponse } from "next/server";
import { db } from "@/lib/drizzle/db";
import { cars } from "@/lib/drizzle/schema";
import { desc } from "drizzle-orm";

export const config = {
  runtime: "edge",
};

export async function GET() {
  try {
    const query = await db.query.cars.findMany({
      orderBy: desc(cars.purchaseDate),
      limit: 50,
    });

    return NextResponse.json(query || []);
  } catch (error) {
    console.error("Error fetching cars:", error);
    return NextResponse.json(
      { error: "Failed to fetch cars" },
      { status: 500 }
    );
  }
}
