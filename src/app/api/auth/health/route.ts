import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const startTime = Date.now();
        const authResult = await getAuth();
        const duration = Date.now() - startTime;

        return NextResponse.json({
            status: "healthy",
            authenticated: !!(authResult.user && authResult.session),
            responseTime: `${duration}ms`,
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV,
            user: authResult.user ? {
                id: authResult.user.id,
                role: authResult.user.role,
                email: authResult.user.email
            } : null
        });
    } catch (error) {
        console.error("Auth health check error:", error);

        return NextResponse.json({
            status: "unhealthy",
            error: error instanceof Error ? error.message : "Unknown error",
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV
        }, { status: 500 });
    }
}
