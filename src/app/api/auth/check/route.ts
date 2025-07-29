import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { user } = await getAuth();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    return NextResponse.json({ 
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName
      }
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ error: 'Authentication check failed' }, { status: 500 });
  }
}