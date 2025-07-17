import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/drizzle/db';
import { images } from '@/lib/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vin = searchParams.get('vin');
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '12', 10);
    const publicUrl = process.env.NEXT_PUBLIC_BUCKET_URL || '';
    const noPagination = pageSize === 0;

    if (!vin) {
      return NextResponse.json({ error: 'VIN parameter required' }, { status: 400 });
    }

    // Build where clause
    const allowedTypes = ["AUCTION", "WAREHOUSE", "DELIVERED", "PICK_UP"];
    let whereClause;
    if (type && allowedTypes.includes(type)) {
      whereClause = and(
        eq(images.carVin, vin),
        eq(images.imageType, type as "AUCTION" | "WAREHOUSE" | "DELIVERED" | "PICK_UP")
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
      });
    } else {
      imageKeys = await db.query.images.findMany({
        where: whereClause,
        limit: pageSize,
        offset: (page - 1) * pageSize,
      });
    }

    // Add URLs to the response without checking thumbnails
    const imagesWithUrls = imageKeys.map(img => ({
      ...img,
      url: `${publicUrl}/${img.imageKey}`,
    }));

    return NextResponse.json({
      success: true,
      images: imagesWithUrls,
      count,
      page,
      pageSize,
      message: 'Image data fetched successfully'
    });

  } catch (error) {
    console.error('API Route: Error fetching images:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 