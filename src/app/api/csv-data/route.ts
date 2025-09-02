import { NextResponse } from "next/server";
import { db } from "@/lib/drizzle/db";
import { csvDataVersions } from "@/lib/drizzle/schema";
import { eq } from "drizzle-orm";

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [activeVersion] = await db
      .select()
      .from(csvDataVersions)
      .where(eq(csvDataVersions.isActive, true))
      .limit(1);

    if (activeVersion) {
      return NextResponse.json(JSON.parse(activeVersion.csvData));
    }

    // Return empty array if no active version
    return NextResponse.json([]);
  } catch (error) {
    console.error("Error fetching CSV data:", error);
    return NextResponse.json({ error: "Failed to fetch CSV data" }, { status: 500 });
  }
} 