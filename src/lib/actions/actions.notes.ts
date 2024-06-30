"use server";

import { ActionResult } from "../form";

export async function getAllNotes(userId: string): Promise<ActionResult> {
  try {
    return { success: "Transaction deleted successfully", error: null };
  } catch (error) {
    return { error: "Error deleting transaction" };
  }
}

export async function getNotes(userId: string, carId: string) {
  try {
    return { success: "Transaction deleted successfully", error: null };
  } catch (error) {
    return { error: "Error deleting transaction" };
  }
}

export async function getNote(userId: string, noteId: string) {
  try {
    return { success: "Transaction deleted successfully", error: null };
  } catch (error) {
    return { error: "Error deleting transaction" };
  }
}

export async function createNote(userId: string, carId: string, note: string) {
  try {
    return { success: "Transaction deleted successfully", error: null };
  } catch (error) {
    return { error: "Error deleting transaction" };
  }
}

export async function updateNote(userId: string, noteId: string, note: string) {
  try {
    return { success: "Transaction deleted successfully", error: null };
  } catch (error) {
    return { error: "Error deleting transaction" };
  }
}

export async function deleteNote(userId: string, noteId: string) {
  try {
    return { success: "Transaction deleted successfully", error: null };
  } catch (error) {
    return { error: "Error deleting transaction" };
  }
}
