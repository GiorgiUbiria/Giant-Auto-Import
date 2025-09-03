import { NextResponse } from "next/server";
import { getDb } from "@/lib/drizzle/db";
import { images } from "@/lib/drizzle/schema";
import { eq, and } from "drizzle-orm";
import { sql } from "drizzle-orm";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { vin: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "12");
    const noPagination = pageSize === 0;

    const vin = params.vin;
    const db = getDb();
    const publicUrl = process.env.NEXT_PUBLIC_BUCKET_URL || "";

    // Check if database connection is available
    if (!db) {
      console.error("Database connection not available for images API");
      return NextResponse.json(
        { error: "Database connection not available" },
        { status: 503 }
      );
    }

    // Build where clause
    const allowedTypes = ["AUCTION", "WAREHOUSE", "DELIVERED", "PICK_UP"];
    let whereClause;
    if (type && allowedTypes.includes(type)) {
      whereClause = and(
        eq(images.carVin, vin),
        eq(
          images.imageType,
          type as "AUCTION" | "WAREHOUSE" | "DELIVERED" | "PICK_UP"
        )
      );
    } else {
      whereClause = eq(images.carVin, vin);
    }

    // Get total count for pagination
    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(images)
      .where(whereClause);
    const count = totalCount[0]?.count || 0;

    // Fetch images
    let imageKeys;
    if (noPagination) {
      imageKeys = await db.query.images.findMany({
        where: whereClause,
        orderBy: (images, { desc }) => [desc(images.priority), desc(images.id)],
      });
    } else {
      imageKeys = await db.query.images.findMany({
        where: whereClause,
        limit: pageSize,
        offset: (page - 1) * pageSize,
        orderBy: (images, { desc }) => [desc(images.priority), desc(images.id)],
      });
    }

    // Add URLs to the response
    const imagesWithUrls = imageKeys.map((img) => ({
      ...img,
      url: `${publicUrl}/${img.imageKey}`,
    }));

    return NextResponse.json({
      images: imagesWithUrls,
      count,
      totalPages: Math.ceil(count / pageSize),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching images:", error);
    return NextResponse.json(
      { error: "Failed to fetch images" },
      { status: 500 }
    );
  }
}
