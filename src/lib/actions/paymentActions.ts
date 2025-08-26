"use server";

import { z } from "zod";
import { createServerAction } from "zsa";
import { isAdminProcedure } from "./authProcedures";
import { db } from "../drizzle/db";
import { payments, cars, invoices, insertPaymentSchema, selectPaymentSchema } from "../drizzle/schema";
import { eq, and, desc, inArray } from "drizzle-orm";

// Add a new payment
export const addPaymentAction = isAdminProcedure
  .createServerAction()
  .input(
    z.object({
      carVin: z.string(),
      amount: z.number().positive(),
      paymentType: z.enum(["PURCHASE", "SHIPPING"]),
      description: z.string().optional(),
    })
  )
  .handler(async ({ input, ctx }) => {
    const { carVin, amount, paymentType, description } = input;
    const adminId = ctx.user.id;

    try {
      // Get the current car data
      const car = await db.query.cars.findFirst({
        where: eq(cars.vin, carVin),
      });

      if (!car) {
        throw new Error("Car not found");
      }

      // Validate payment amount
      let maxAmount: number;
      if (paymentType === "PURCHASE") {
        maxAmount = car.purchaseDue || 0;
      } else {
        maxAmount = car.shippingDue || 0;
      }

      if (amount > maxAmount) {
        throw new Error(`Payment amount cannot exceed ${paymentType.toLowerCase()} due amount`);
      }

      // Insert the payment record
      const [payment] = await db.insert(payments).values({
        carVin,
        adminId,
        amount,
        paymentType,
        description,
      }).returning();

      // Update the car's due amounts
      const updates: any = {};

      if (paymentType === "PURCHASE") {
        updates.purchaseDue = (car.purchaseDue || 0) - amount;
      } else {
        updates.shippingDue = (car.shippingDue || 0) - amount;
      }

      // Update total due and paid amount
      updates.totalDue = (car.totalDue || 0) - amount;
      updates.paidAmount = (car.paidAmount || 0) + amount;

      await db.update(cars)
        .set(updates)
        .where(eq(cars.vin, carVin));

      return { success: true, payment };
    } catch (error) {
      console.error("Error adding payment:", error);
      throw error;
    }
  });

// Get payment history for a car
export const getPaymentHistoryAction = createServerAction()
  .input(
    z.object({
      carVin: z.string(),
    })
  )
  .handler(async ({ input }) => {
    const { carVin } = input;

    try {
      const paymentHistory = await db.query.payments.findMany({
        where: eq(payments.carVin, carVin),
        orderBy: [desc(payments.createdAt)],
        with: {
          admin: {
            columns: {
              fullName: true,
            },
          },
        },
      });

      return paymentHistory;
    } catch (error) {
      console.error("Error fetching payment history:", error);
      throw error;
    }
  });

// Get payment summary for a car
export const getPaymentSummaryAction = createServerAction()
  .input(
    z.object({
      carVin: z.string(),
    })
  )
  .handler(async ({ input }) => {
    const { carVin } = input;

    try {
      const car = await db.query.cars.findFirst({
        where: eq(cars.vin, carVin),
        columns: {
          purchaseDue: true,
          shippingDue: true,
          totalDue: true,
          paidAmount: true,
        },
      });

      if (!car) {
        throw new Error("Car not found");
      }

      return {
        purchaseDue: car.purchaseDue || 0,
        shippingDue: car.shippingDue || 0,
        totalDue: car.totalDue || 0,
        paidAmount: car.paidAmount || 0,
      };
    } catch (error) {
      console.error("Error fetching payment summary:", error);
      throw error;
    }
  });

// Get all payments (admin only)
export const getAllPaymentsAction = isAdminProcedure
  .createServerAction()
  .input(
    z.object({
      limit: z.number().optional().default(50),
      offset: z.number().optional().default(0),
    })
  )
  .handler(async ({ input }) => {
    const { limit, offset } = input;

    try {
      const allPayments = await db.query.payments.findMany({
        limit,
        offset,
        orderBy: [desc(payments.createdAt)],
        with: {
          car: {
            columns: {
              vin: true,
              year: true,
              make: true,
              model: true,
            },
          },
          admin: {
            columns: {
              fullName: true,
            },
          },
        },
      });

      return allPayments;
    } catch (error) {
      console.error("Error fetching all payments:", error);
      throw error;
    }
  });

// Get payment history for a specific user
export const getUserPaymentHistoryAction = createServerAction()
  .input(
    z.object({
      userId: z.string(),
    })
  )
  .handler(async ({ input }) => {
    const { userId } = input;

    try {
      // First get all cars owned by the user
      const userCars = await db.query.cars.findMany({
        where: eq(cars.ownerId, userId),
        columns: {
          vin: true,
          year: true,
          make: true,
          model: true,
        },
      });

      if (userCars.length === 0) {
        return [];
      }

      // Get payments for all user's cars
      const carVins = userCars.map(car => car.vin);
      const userPayments = await db.query.payments.findMany({
        where: inArray(payments.carVin, carVins),
        orderBy: [desc(payments.createdAt)],
        with: {
          car: {
            columns: {
              vin: true,
              year: true,
              make: true,
              model: true,
            },
          },
        },
      });

      return userPayments;
    } catch (error) {
      console.error("Error fetching user payment history:", error);
      throw error;
    }
  });
