"use server";

import { and, eq } from "drizzle-orm";
import { noteTable } from "../drizzle/schema";
import { ActionResult } from "../form";
import { db } from "../drizzle/db";

type newNote = typeof noteTable.$inferInsert;
type selectNote = typeof noteTable.$inferSelect;

const insertNote = async (note: newNote) => {
  return db.insert(noteTable).values(note).returning({ noteId: noteTable.id });
};

export async function getAllNotes(userId: string): Promise<ActionResult> {
  try {
    const notes = (await db
      .select()
      .from(noteTable)
      .where(eq(noteTable.userId, userId))) as selectNote[];

    if (notes.length === 0) {
      return { error: "No notes found" };
    }

    return {
      success: "Notes retrieved successfully",
      error: null,
      data: notes,
    };
  } catch (error) {
    return { error: "Error deleting transaction" };
  }
}

export async function getNotes(userId: string, carId: number) {
  try {
    const notes = (await db
      .select()
      .from(noteTable)
      .where(
        and(eq(noteTable.userId, userId), eq(noteTable.carId, carId)),
      )) as selectNote[];

    if (notes.length === 0) {
      return { error: "No notes found" };
    }

    return {
      success: "Notes retrieved successfully",
      error: null,
      data: notes,
    };
  } catch (error) {
    return { error: "Error deleting transaction" };
  }
}

export async function getNote(userId: string, noteId: number) {
  try {
    const note = (await db
      .select()
      .from(noteTable)
      .where(
        and(eq(noteTable.userId, userId), eq(noteTable.id, noteId)),
      )) as selectNote[];

    if (note.length === 0) {
      return { error: "No note found" };
    }

    return {
      success: "Note retrieved successfully",
      error: null,
      data: note[0],
    };
  } catch (error) {
    return { error: "Error deleting transaction" };
  }
}

export async function createNote(userId: string, carId: number, note: string) {
  try {
    const newNote: newNote = {
      userId,
      carId,
      note,
      createdAt: new Date(),
    };

    const noteId = await insertNote(newNote);

    if (noteId === null) {
      return { error: "Error creating note" };
    }

    return {
      success: "Note created successfully",
      error: null,
    };
  } catch (error) {
    return { error: "Error deleting transaction" };
  }
}

export async function updateNote(noteId: number, note: string) {
  try {
    const updatedNoteId = await db
      .update(noteTable)
      .set({ note: note })
      .where(eq(noteTable.id, noteId))
      .returning({ noteId: noteTable.id });

    if (updatedNoteId === null || updatedNoteId === undefined) {
      return { error: "Error updating note" };
    }

    return {
      success: "Note updated successfully",
      error: null,
    };
  } catch (error) {
    return { error: "Error deleting transaction" };
  }
}

export async function deleteNote(noteId: number) {
  try {
    const deletedNoteId = await db
      .delete(noteTable)
      .where(eq(noteTable.id, noteId));

    if (deletedNoteId === null || deletedNoteId === undefined) {
      return { error: "Error deleting note" };
    }

    return { success: "Note deleted successfully", error: null };
  } catch (error) {
    return { error: "Error deleting transaction" };
  }
}
