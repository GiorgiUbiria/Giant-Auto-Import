"use server";

import { ActionResult } from "../form";

export async function getTransactions(carId: string): Promise<ActionResult> {
  try {
    return { success: "Transactions retrieved successfully", error: null };
  } catch (error) {
    return { error: "Error retrieving transactions" };
  }
}

export async function getTransaction(carId: string, transactionId: string): Promise<ActionResult> {
  try {
    return { success: "Transaction retrieved successfully", error: null };
  } catch (error) {
    return { error: "Error retrieving transaction" };
  }
}

export async function addTransaction(carId: string, userId: string): Promise<ActionResult> {
  try {
    return { success: "Transaction added successfully", error: null };
  } catch (error) {
    return { error: "Error adding transaction" };
  }
}

export async function updateTransaction(carId: string, transactionId: string, userId: string): Promise<ActionResult> {
  try {
    return { success: "Transaction updated successfully", error: null };
  } catch (error) {
    return { error: "Error updating transaction" };
  }
}

export async function deleteTransaction(carId: string, transactionId: string): Promise<ActionResult> {
  try {
    return { success: "Transaction deleted successfully", error: null };
  } catch (error) {
    return { error: "Error deleting transaction" };
  }
}
