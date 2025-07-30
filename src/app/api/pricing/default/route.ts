import { NextResponse } from "next/server";
import { db } from "@/lib/drizzle/db";
import { defaultPricingConfig } from "@/lib/drizzle/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const [config] = await db
      .select()
      .from(defaultPricingConfig)
      .where(eq(defaultPricingConfig.isActive, true))
      .limit(1);

    if (config) {
      return NextResponse.json(config);
    }

    return NextResponse.json(null);
  } catch (error) {
    console.error("Error fetching default pricing config:", error);

    // Return a more specific error for build-time issues
    if (error instanceof Error && error.message.includes("build")) {
      return NextResponse.json({ error: "Database not available during build" }, { status: 503 });
    }

    return NextResponse.json({ error: "Failed to fetch default pricing config" }, { status: 500 });
  }
} 