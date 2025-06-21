import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/drizzle/db';
import { cars } from '@/lib/drizzle/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vin = searchParams.get('vin');

    if (!vin) {
      return NextResponse.json({ error: 'VIN parameter required' }, { status: 400 });
    }

    console.log('API Route: Testing car fetch for VIN:', vin);

    // Test database connection
    console.log('API Route: Testing database connection...');
    
    const [carQuery] = await db
      .select()
      .from(cars)
      .where(eq(cars.vin, vin));

    console.log('API Route: Query completed', { found: !!carQuery, vin: carQuery?.vin });

    if (!carQuery) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      car: carQuery,
      message: 'Car data fetched successfully'
    });

  } catch (error) {
    console.error('API Route: Error fetching car:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 