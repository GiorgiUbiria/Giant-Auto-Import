"use server";

import { db } from "../drizzle/db";
import {
  carTable,
  priceTable,
  transactionTable,
  userTable,
} from "../drizzle/schema";
import { ActionResult } from "../form";
import { eq } from "drizzle-orm";
import { Transaction } from "../interfaces";
import axios from "axios";
import { revalidatePath } from "next/cache";

const exchangeRateApiKey = process.env.EXCHANGE_RATE_API_KEY!;

type NewTransaction = typeof transactionTable.$inferInsert;

const insertTransaction = async (transaction: NewTransaction) => {
  return db
    .insert(transactionTable)
    .values(transaction)
    .returning({ transactionId: transactionTable.id });
};

export async function getTransactions(carId: number): Promise<ActionResult> {
  try {
    const transactions = (await db
      .select()
      .from(transactionTable)
      .where(eq(transactionTable.carId, carId))) as Transaction[];

    if (transactions.length === 0) {
      return { error: null, data: new Array<Transaction>() };
    }

    return {
      success: "Transactions retrieved successfully",
      error: null,
      data: transactions,
    };
  } catch (error) {
    return { error: "Error retrieving transactions" };
  }
}

export async function getTransaction(
  transactionId: number,
): Promise<ActionResult> {
  try {
    const transaction = await db
      .select()
      .from(transactionTable)
      .where(eq(transactionTable.id, transactionId))
      .limit(1);

    if (transaction.length === 0) {
      return { error: null, data: null };
    }

    const singleTransaction = transaction[0] as Transaction;

    return {
      success: "Transaction retrieved successfully",
      error: null,
      data: singleTransaction,
    };
  } catch (error) {
    return { error: "Error retrieving transaction" };
  }
}

export async function addTransaction(
  carId: number,
  userId: string,
  priceId: number,
  amount: number,
  priceCurrencyId: number,
): Promise<ActionResult> {
  console.log(carId, userId, priceId, amount, priceCurrencyId);
  try {
    const carExists = await db
      .select()
      .from(carTable)
      .where(eq(carTable.id, carId))
      .limit(1);

    if (carExists.length === 0) {
      return { error: "Car does not exist", data: null };
    }

    const userExists = await db
      .select()
      .from(userTable)
      .where(eq(userTable.id, userId))
      .limit(1);

    if (userExists.length === 0) {
      return { error: "User does not exist", data: null };
    }

    const priceExists = await db
      .select()
      .from(priceTable)
      .where(eq(priceTable.id, priceId))
      .limit(1);

    if (priceExists.length === 0) {
      return { error: "Price does not exist", data: null };
    }

    const price = priceExists[0];

    let finalAmount = amount;
    if (price.currencyId !== priceCurrencyId) {
      try {
        finalAmount = await convertCurrency(
          amount,
          priceCurrencyId,
          price.currencyId!,
        );
      } catch (conversionError) {
        return { error: "Currency conversion failed", data: null };
      }
    }

    if (price.amountLeft! < finalAmount) {
      return { error: "Going over the amount left", data: null };
    }

    const transactionId = await insertTransaction({
      carId,
      userId,
      amount,
      priceId,
      currencyId: priceCurrencyId,
      paymentDate: new Date(),
    });

    if (transactionId === null || transactionId === undefined) {
      return { error: "Error adding transaction", data: null };
    }

    const updatedPriceId: { priceId: number }[] = await db
      .update(priceTable)
      .set({ amountLeft: price.amountLeft! - finalAmount })
      .where(eq(priceTable.id, priceId))
      .returning({ priceId: priceTable.id });

    if (updatedPriceId.length === 0) {
      return { error: "Error updating price", data: null };
    }

    revalidatePath("/admin/edit");

    return {
      success: "Transaction added successfully",
      error: null,
      data: null,
    };
  } catch (error: any) {
    return { error: error.message, data: null };
  }
}

async function convertCurrency(
  amount: number,
  fromCurrencyId: number,
  toCurrencyId: number,
): Promise<number> {
  const currencyMap: { [key: number]: string } = {
    1: "GEL",
    2: "USD",
    3: "EUR",
  };

  const fromCurrency = currencyMap[fromCurrencyId];
  const toCurrency = currencyMap[toCurrencyId];

  if (!fromCurrency || !toCurrency) {
    throw new Error("Unsupported currency ID");
  }

  const url = `https://v6.exchangerate-api.com/v6/${exchangeRateApiKey}/pair/${fromCurrency}/${toCurrency}`;

  try {
    const response = await axios.get(url);
    const conversionRate = response.data.conversion_rate;

    return amount * conversionRate;
  } catch (error) {
    throw new Error("Error fetching conversion rate");
  }
}

export async function deleteTransaction(
  carId: number,
  transactionId: number,
): Promise<ActionResult> {
  try {
    const transactionExists = await db
      .select()
      .from(transactionTable)
      .where(eq(transactionTable.id, transactionId))
      .limit(1);

    if (transactionExists.length === 0) {
      return { error: "Transaction does not exist", data: null };
    }

    const transaction = transactionExists[0];

    if (transaction.carId !== carId) {
      return { error: "Car ID does not match the transaction", data: null };
    }

    const priceExists = await db
      .select()
      .from(priceTable)
      .where(eq(priceTable.id, transaction.priceId!))
      .limit(1);

    if (priceExists.length === 0) {
      return { error: "Price record does not exist", data: null };
    }

    const price = priceExists[0];

    let rollbackAmount = transaction.amount;
    if (transaction.currencyId !== price.currencyId) {
      try {
        rollbackAmount = await convertCurrency(
          transaction.amount!,
          transaction.currencyId!,
          price.currencyId!,
        );
      } catch (conversionError) {
        return { error: "Currency conversion failed", data: null };
      }
    }

    const updatedPriceId: { priceId: number }[] = await db
      .update(priceTable)
      .set({ amountLeft: price.amountLeft! + rollbackAmount! })
      .where(eq(priceTable.id, price.id))
      .returning({ priceId: priceTable.id });

    if (updatedPriceId.length === 0) {
      return { error: "Error updating price", data: null };
    }

    const deletedTransactionId = await db
      .delete(transactionTable)
      .where(eq(transactionTable.id, transactionId))
      .returning({ transactionId: transactionTable.id });

    if (deletedTransactionId.length === 0) {
      return { error: "Error deleting transaction", data: null };
    }

    return {
      success: "Transaction deleted successfully",
      error: null,
      data: null,
    };
  } catch (error) {
    return { error: "Error deleting transaction", data: null };
  }
}
