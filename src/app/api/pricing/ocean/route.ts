import { NextResponse } from "next/server";
import { db } from "@/lib/drizzle/db";
import { oceanShippingRates } from "@/lib/drizzle/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rates = await db
      .select()
      .from(oceanShippingRates)
      .where(eq(oceanShippingRates.isActive, true));
    return NextResponse.json({ data: rates });
  } catch (error) {
    console.error("/api/pricing/ocean GET error:", error);
    return NextResponse.json(
      { data: [], error: "Failed to fetch ocean rates" },
      { status: 500 }
    );
  }
}
