import { testR2Connection } from "@/lib/actions/bucketActions";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const isConnected = await testR2Connection();
    
    return NextResponse.json({
      success: isConnected,
      message: isConnected ? 'R2 connection successful' : 'R2 connection failed',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('R2 test error:', error);
    return NextResponse.json({
      success: false,
      message: 'R2 test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
} 