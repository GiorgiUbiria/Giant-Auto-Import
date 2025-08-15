import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/drizzle/db";
import { payments, users, cars, paymentCars } from "@/lib/drizzle/schema";
import { eq } from "drizzle-orm";
import { getAuth } from "@/lib/auth";
import { InvoiceGenerator } from "@/lib/invoice-generator";

export async function GET(
    request: NextRequest,
    { params }: { params: { paymentId: string } }
) {
    try {
        const authResult = await getAuth();
        if (!authResult?.user || authResult.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const paymentId = parseInt(params.paymentId);
        if (isNaN(paymentId)) {
            return NextResponse.json({ error: "Invalid payment ID" }, { status: 400 });
        }

        // Fetch payment with customer data
        const paymentData = await db
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
                customer: {
                    id: users.id,
                    fullName: users.fullName,
                    email: users.email,
                    phone: users.phone,
                },
            })
            .from(payments)
            .innerJoin(users, eq(payments.customerId, users.id))
            .where(eq(payments.id, paymentId))
            .limit(1);

        if (paymentData.length === 0) {
            return NextResponse.json({ error: "Payment not found" }, { status: 404 });
        }

        const payment = paymentData[0];

        // Fetch associated cars
        const paymentCarsData = await db
            .select({
                carId: paymentCars.carId,
                amount: paymentCars.amount,
                car: {
                    id: cars.id,
                    vin: cars.vin,
                    year: cars.year,
                    make: cars.make,
                    model: cars.model,
                },
            })
            .from(paymentCars)
            .innerJoin(cars, eq(paymentCars.carId, cars.id))
            .where(eq(paymentCars.paymentId, paymentId));

        // Generate invoice data
        const invoiceData = {
            payment: payment as any,
            customer: payment.customer,
            cars: paymentCarsData.map(pc => pc.car),
            invoiceType: payment.invoiceType || "TOTAL",
        };

        const template = InvoiceGenerator.generateInvoiceData(invoiceData);
        const html = InvoiceGenerator.generateInvoiceHTML(template);

        // Return HTML invoice
        return new NextResponse(html, {
            headers: {
                "Content-Type": "text/html",
                "Content-Disposition": `inline; filename="invoice-${payment.id}.html"`,
            },
        });
    } catch (error) {
        console.error("Error generating invoice:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: { paymentId: string } }
) {
    try {
        const authResult = await getAuth();
        if (!authResult?.user || authResult.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const paymentId = parseInt(params.paymentId);
        if (isNaN(paymentId)) {
            return NextResponse.json({ error: "Invalid payment ID" }, { status: 400 });
        }

        const body = await request.json();
        const { invoiceType } = body;

        if (!invoiceType || !["SHIPPING", "PURCHASE", "TOTAL"].includes(invoiceType)) {
            return NextResponse.json({ error: "Invalid invoice type" }, { status: 400 });
        }

        // Update payment with invoice information
        await db
            .update(payments)
            .set({
                invoiceGenerated: true,
                invoiceType,
                updatedAt: new Date(),
            })
            .where(eq(payments.id, paymentId));

        return NextResponse.json({
            message: "Invoice generated successfully",
            paymentId,
            invoiceType,
        });
    } catch (error) {
        console.error("Error updating payment invoice:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
