import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/drizzle/db';
import { images } from '@/lib/drizzle/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vin = searchParams.get('vin');

    if (!vin) {
      return NextResponse.json({ error: 'VIN parameter required' }, { status: 400 });
    }

    console.log('API Route: Testing image fetch for VIN:', vin);

    // Test database connection for images
    console.log('API Route: Testing image database connection...');
    
    const imageKeys = await db
      .select({
        imageKey: images.imageKey,
        imageType: images.imageType,
      })
      .from(images)
      .where(eq(images.carVin, vin));

    console.log('API Route: Image query completed', { count: imageKeys.length, vin });

    return NextResponse.json({ 
      success: true, 
      images: imageKeys,
      count: imageKeys.length,
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