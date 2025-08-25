import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { db } from "@/lib/drizzle/db";
import { customerNotes, users } from "@/lib/drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { insertCustomerNoteSchema } from "@/lib/drizzle/schema";

// GET - Fetch notes for a customer
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const customerId = searchParams.get("customerId");
        const importantOnly = searchParams.get("importantOnly") === "true";

        if (!customerId) {
            return NextResponse.json(
                { error: "Customer ID is required" },
                { status: 400 }
            );
        }

        const notes = await db
            .select({
                id: customerNotes.id,
                note: customerNotes.note,
                isImportant: customerNotes.isImportant,
                hasAttachments: customerNotes.hasAttachments,
                createdAt: customerNotes.createdAt,
                updatedAt: customerNotes.updatedAt,
                adminName: users.fullName,
            })
            .from(customerNotes)
            .innerJoin(users, eq(customerNotes.adminId, users.id))
            .where(
                importantOnly
                    ? and(eq(customerNotes.customerId, customerId), eq(customerNotes.isImportant, true))
                    : eq(customerNotes.customerId, customerId)
            )
            .orderBy(desc(customerNotes.createdAt));

        return NextResponse.json({ notes });
    } catch (error) {
        console.error("Error fetching customer notes:", error);
        return NextResponse.json(
            { error: "Failed to fetch customer notes" },
            { status: 500 }
        );
    }
}

// POST - Create a new note
export async function POST(request: NextRequest) {
    try {
        const auth = await getAuth();
        if (!auth.user || auth.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const validatedData = insertCustomerNoteSchema.parse({
            ...body,
            adminId: auth.user.id,
        });

        const [newNote] = await db
            .insert(customerNotes)
            .values(validatedData)
            .returning({
                id: customerNotes.id,
                note: customerNotes.note,
                isImportant: customerNotes.isImportant,
                hasAttachments: customerNotes.hasAttachments,
                createdAt: customerNotes.createdAt,
                updatedAt: customerNotes.updatedAt,
                adminName: users.fullName,
            });

        return NextResponse.json({ note: newNote }, { status: 201 });
    } catch (error) {
        console.error("Error creating customer note:", error);
        return NextResponse.json(
            { error: "Failed to create customer note" },
            { status: 500 }
        );
    }
}

// PUT - Update a note
export async function PUT(request: NextRequest) {
    try {
        const auth = await getAuth();
        if (!auth.user || auth.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { id, note, isImportant } = body;

        if (!id) {
            return NextResponse.json(
                { error: "Note ID is required" },
                { status: 400 }
            );
        }

        const [updatedNote] = await db
            .update(customerNotes)
            .set({
                note,
                isImportant,
                updatedAt: new Date(),
            })
            .where(eq(customerNotes.id, id))
            .returning({
                id: customerNotes.id,
                note: customerNotes.note,
                isImportant: customerNotes.isImportant,
                hasAttachments: customerNotes.hasAttachments,
                createdAt: customerNotes.createdAt,
                updatedAt: customerNotes.updatedAt,
                adminName: users.fullName,
            });

        if (!updatedNote) {
            return NextResponse.json(
                { error: "Note not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ note: updatedNote });
    } catch (error) {
        console.error("Error updating customer note:", error);
        return NextResponse.json(
            { error: "Failed to update customer note" },
            { status: 500 }
        );
    }
}

// DELETE - Delete a note
export async function DELETE(request: NextRequest) {
    try {
        const auth = await getAuth();
        if (!auth.user || auth.user.role !== "ADMIN") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { error: "Note ID is required" },
                { status: 400 }
            );
        }

        const [deletedNote] = await db
            .delete(customerNotes)
            .where(eq(customerNotes.id, parseInt(id)))
            .returning();

        if (!deletedNote) {
            return NextResponse.json(
                { error: "Note not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: "Note deleted successfully" });
    } catch (error) {
        console.error("Error deleting customer note:", error);
        return NextResponse.json(
            { error: "Failed to delete customer note" },
            { status: 500 }
        );
    }
} 