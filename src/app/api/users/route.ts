import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/drizzle/db";
import { users } from "@/lib/drizzle/schema";
import { getAuth } from "@/lib/auth";
import { eq } from "drizzle-orm";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const authResult = await getAuth();
    if (!authResult?.user || authResult.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Optimized query with limit and better indexing
    const usersData = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        phone: users.phone,
        role: users.role,
      })
      .from(users)
      .where(eq(users.role, "CUSTOMER_SINGULAR"))
      .orderBy(users.fullName)
      .limit(1000); // Add reasonable limit to prevent large data loads

    return NextResponse.json(
      {
        users: usersData,
        count: usersData.length,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
