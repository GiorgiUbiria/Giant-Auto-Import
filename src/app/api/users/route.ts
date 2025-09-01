import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/drizzle/db";
import { users } from "@/lib/drizzle/schema";
import { getAuth } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const authResult = await getAuth();
    if (!authResult?.user || authResult.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
      .orderBy(users.fullName);

    return NextResponse.json({
      users: usersData,
      count: usersData.length,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
