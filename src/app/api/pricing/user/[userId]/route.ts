import { NextResponse } from "next/server";
import { db } from "@/lib/drizzle/db";
import { userPricingConfig } from "@/lib/drizzle/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const [config] = await db
      .select()
      .from(userPricingConfig)
      .where(and(eq(userPricingConfig.userId, params.userId), eq(userPricingConfig.isActive, true)))
      .limit(1);

    if (config) {
      return NextResponse.json(config);
    }

    return NextResponse.json(null);
  } catch (error) {
    console.error("Error fetching user pricing config:", error);
    return NextResponse.json({ error: "Failed to fetch user pricing config" }, { status: 500 });
  }
} 