import { NextResponse } from "next/server";
import { db } from "@/lib/drizzle/db";
import { oceanShippingRates } from "@/lib/drizzle/schema";
import { eq } from "drizzle-orm";

export async function GET() {
    try {
        const rates = await db
            .select()
            .from(oceanShippingRates)
            .where(eq(oceanShippingRates.isActive, true));

        return NextResponse.json(rates);
    } catch (error) {
        console.error("Error fetching ocean rates:", error);
        return NextResponse.json({ error: "Failed to fetch ocean rates" }, { status: 500 });
    }
}


