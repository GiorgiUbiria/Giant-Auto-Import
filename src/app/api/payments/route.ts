import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/drizzle/db";
import { payments, paymentCars, cars, users } from "@/lib/drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { getAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const authResult = await getAuth();
    if (!authResult?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");

    // If no customerId provided, only admin can access all payments
    if (!customerId) {
      if (authResult.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    } else {
      // Check if user is admin or the customer themselves
      if (authResult.user.role !== "ADMIN" && authResult.user.id !== customerId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // Fetch payments with related data
    const baseQuery = db
      .select({
        id: payments.id,
        customerId: payments.customerId,
        paymentDate: payments.paymentDate,
        description: payments.description,
        note: payments.note,
        amount: payments.amount,
        checkNumber: payments.checkNumber,
        paymentType: payments.paymentType,
        paymentStatus: payments.paymentStatus,
        invoiceGenerated: payments.invoiceGenerated,
        invoiceType: payments.invoiceType,
        createdAt: payments.createdAt,
        updatedAt: payments.updatedAt,
        customer: {
          id: users.id,
          fullName: users.fullName,
          email: users.email,
          balance: users.balance,
        },
      })
      .from(payments)
      .innerJoin(users, eq(payments.customerId, users.id));

    const paymentsData = customerId 
      ? await baseQuery.where(eq(payments.customerId, customerId)).orderBy(desc(payments.paymentDate))
      : await baseQuery.orderBy(desc(payments.paymentDate));

    // Fetch payment cars for each payment
    const paymentsWithCars = await Promise.all(
      paymentsData.map(async (payment) => {
        const paymentCarsData = await db
          .select({
            id: paymentCars.id,
            carId: paymentCars.carId,
            amount: paymentCars.amount,
            car: {
              vin: cars.vin,
              year: cars.year,
              make: cars.make,
              model: cars.model,
            },
          })
          .from(paymentCars)
          .innerJoin(cars, eq(paymentCars.carId, cars.id))
          .where(eq(paymentCars.paymentId, payment.id));

        return {
          ...payment,
          paymentCars: paymentCarsData,
        };
      })
    );

    return NextResponse.json({
      payments: paymentsWithCars,
      count: paymentsWithCars.length,
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
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
    const {
      customerId,
      paymentDate,
      description,
      note,
      amount,
      checkNumber,
      paymentType,
      paymentStatus = "ACTIVE",
      invoiceType,
      carAllocations = [], // Array of { carId, amount }
    } = body;

    // Validate required fields
    if (!customerId || !description || !amount || !paymentType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Insert payment
    const [newPayment] = await db
      .insert(payments)
      .values({
        customerId,
        paymentDate: new Date(paymentDate),
        description,
        note,
        amount,
        checkNumber,
        paymentType,
        paymentStatus,
        invoiceType,
        invoiceGenerated: false,
      })
      .returning();

    // Insert car allocations if provided
    if (carAllocations.length > 0) {
      await db.insert(paymentCars).values(
        carAllocations.map((allocation: any) => ({
          paymentId: newPayment.id,
          carId: allocation.carId,
          amount: allocation.amount,
        }))
      );
    }

    // Generate invoice if invoiceType is specified
    if (invoiceType && newPayment.id) {
      // TODO: Implement invoice generation
      await db
        .update(payments)
        .set({ invoiceGenerated: true })
        .where(eq(payments.id, newPayment.id));
    }

    return NextResponse.json({
      payment: newPayment,
      message: "Payment created successfully",
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
