import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/drizzle/db";
import { users } from "@/lib/drizzle/schema";
import { getAuth } from "@/lib/auth";
import { eq, ne } from "drizzle-orm";
import { revalidateTag, revalidatePath } from "next/cache";
import { insertUserSchema, selectUserSchema } from "@/lib/drizzle/schema";
import { Argon2id } from "oslo/password";
import { generateId } from "lucia";
import { z } from "zod";

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
      .where(ne(users.role, "ADMIN")) // Exclude admin users, include all others
      .orderBy(users.role, users.fullName)
      .limit(1000); // Add reasonable limit to prevent large data loads

    return NextResponse.json(
      {
        users: usersData,
        count: usersData.length,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
          "Cache-Tag": "users-list",
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

export async function POST(request: NextRequest) {
  try {
    const authResult = await getAuth();
    if (!authResult?.user || authResult.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate input data
    const validationResult = insertUserSchema
      .omit({ id: true })
      .safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input data", details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { email, password, fullName, phone, role } = validationResult.data;

    // Check if user already exists
    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password with Argon2id
    const hashedPassword = await new Argon2id().hash(password);

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        id: generateId(15),
        email: email.toLowerCase(),
        password: hashedPassword,
        passwordText: password, // Store plain text as required by your schema
        fullName,
        phone,
        role,
      })
      .returning({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
      });

    // Revalidate cache tags and paths
    revalidateTag("users-list");
    revalidatePath("/admin/users");

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully",
        user: newUser,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

const UpdateUserSchema = z.object({
  id: z.string(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  fullName: z.string().optional(),
  role: z
    .enum([
      "CUSTOMER_DEALER",
      "CUSTOMER_SINGULAR",
      "MODERATOR",
      "ACCOUNTANT",
      "ADMIN",
    ])
    .optional(),
  passwordText: z.string().optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    const authResult = await getAuth();
    if (!authResult?.user || authResult.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate input data
    const validationResult = UpdateUserSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input data", details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { id, email, passwordText, fullName, phone, role } =
      validationResult.data;

    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if email is already taken by another user
    if (email) {
      const emailCheck = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email.toLowerCase()))
        .limit(1);

      if (emailCheck.length > 0 && emailCheck[0].id !== id) {
        return NextResponse.json(
          { error: "Email is already taken by another user" },
          { status: 409 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (email) updateData.email = email.toLowerCase();
    if (fullName !== undefined) updateData.fullName = fullName;
    if (phone !== undefined) updateData.phone = phone;
    if (role !== undefined) updateData.role = role;

    // Handle password update
    if (passwordText) {
      updateData.password = await new Argon2id().hash(passwordText);
      updateData.passwordText = passwordText;
    }

    // Update user
    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
      });

    // Revalidate cache tags and paths
    revalidateTag("users-list");
    revalidateTag(`user-${id}`);
    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${id}`);

    return NextResponse.json(
      {
        success: true,
        message: "User updated successfully",
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
