import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    console.log("Auth check: Starting authentication check");
    
    const { user, session } = await getAuth();
    
    console.log("Auth check: Authentication result", { 
      hasUser: !!user, 
      hasSession: !!session,
      userRole: (user as any)?.role 
    });
    
    if (!user) {
      console.log("Auth check: No authenticated user found");
      return NextResponse.json({ 
        error: 'Not authenticated',
        authenticated: false 
      }, { status: 401 });
    }

    console.log("Auth check: User authenticated successfully", { 
      userId: user.id, 
      role: (user as any)?.role 
    });

    return NextResponse.json({ 
      authenticated: true,
      user: {
        id: user.id,
        email: (user as any)?.email,
        role: (user as any)?.role,
        fullName: (user as any)?.fullName
      }
    });
  } catch (error) {
    console.error('Auth check: Error during authentication check:', error);
    return NextResponse.json({ 
      error: 'Authentication check failed',
      authenticated: false,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}