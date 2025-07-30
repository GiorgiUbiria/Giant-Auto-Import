import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";

// Force dynamic rendering since this route uses cookies
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const authResult = await getAuth();

    if (authResult.user && authResult.session) {
      return NextResponse.json({
        user: authResult.user,
        session: authResult.session,
        authenticated: true
      });
    } else {
      return NextResponse.json({
        user: null,
        session: null,
        authenticated: false
      });
    }
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json({
      user: null,
      session: null,
      authenticated: false,
      error: "Authentication check failed"
    }, { status: 500 });
  }
} 