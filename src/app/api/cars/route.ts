import { getAuth } from "@/lib/auth";
import { calculateCarFeesWithUserPricing } from "@/lib/calculator-utils";
import { getDb } from "@/lib/drizzle/db";
import { cars, insertCarSchema } from "@/lib/drizzle/schema";
import { desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Extended schema to include image fields
const CarWithImagesSchema = insertCarSchema.extend({
  auction_images: z.array(z.any()).optional(),
  pick_up_images: z.array(z.any()).optional(),
  warehouse_images: z.array(z.any()).optional(),
  delivery_images: z.array(z.any()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const { user } = await getAuth();
    if (!user || (user as any).role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const includeDetails = searchParams.get("includeDetails") === "true";

    const db = getDb();
    if (!db) {
      return NextResponse.json(
        { success: false, message: "Database connection not available" },
        { status: 500 }
      );
    }

    // Calculate offset for pagination
    const offset = (page - 1) * pageSize;

    // Get total count
    const totalCountResult = await db.select({ count: sql<number>`count(*)` }).from(cars);
    const totalCount = totalCountResult[0]?.count || 0;

    // Get cars with pagination
    const carsData = await db
      .select()
      .from(cars)
      .orderBy(desc(cars.purchaseDate))
      .limit(pageSize)
      .offset(offset);

    // If includeDetails is true, fetch additional data
    let carsWithDetails = carsData;
    if (includeDetails) {
      // You can add additional data fetching here if needed
      // For now, just return the cars data
      carsWithDetails = carsData;
    }

    return NextResponse.json({
      success: true,
      cars: carsWithDetails,
      count: totalCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    });
  } catch (error) {
    console.error("API: Error fetching cars:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch cars" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const { user } = await getAuth();
    if (!user || (user as any).role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    const formData = await request.formData();

    // Extract car data
    const carData = {
      vin: formData.get("vin") as string,
      year: parseInt(formData.get("year") as string),
      make: formData.get("make") as string,
      model: formData.get("model") as string,
      auction: formData.get("auction") as string,
      originPort: formData.get("originPort") as string,
      keys: formData.get("keys") as string,
      auctionLocation: formData.get("auctionLocation") as string,
      title: formData.get("title") as string,
      shippingStatus: formData.get("shippingStatus") as string,
      bodyType: formData.get("bodyType") as string,
      fuelType: formData.get("fuelType") as string,
      bookingNumber: formData.get("bookingNumber") as string,
      containerNumber: formData.get("containerNumber") as string,
      lotNumber: formData.get("lotNumber") as string,
      trackingLink: formData.get("trackingLink") as string,
      purchaseFee: parseFloat(formData.get("purchaseFee") as string),
      departureDate: formData.get("departureDate")
        ? new Date(formData.get("departureDate") as string)
        : null,
      arrivalDate: formData.get("arrivalDate")
        ? new Date(formData.get("arrivalDate") as string)
        : null,
      purchaseDate: formData.get("purchaseDate")
        ? new Date(formData.get("purchaseDate") as string)
        : new Date(),
      ownerId: (formData.get("ownerId") as string) || null,
      insurance: formData.get("insurance") as string,
    };

    // Validate required fields
    if (!carData.vin || !carData.auction || !carData.originPort) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: VIN, auction, or origin port" },
        { status: 400 }
      );
    }

    // Handle empty ownerId
    if (carData.ownerId === "" || carData.ownerId === "none") {
      carData.ownerId = null;
    }

    console.log("API: Calculating fees for car:", { vin: carData.vin, auction: carData.auction });

    // Calculate fees
    const calculation = await calculateCarFeesWithUserPricing(
      carData.auction,
      carData.auctionLocation!,
      carData.originPort,
      carData.bodyType,
      carData.fuelType,
      carData.purchaseFee,
      carData.insurance as "YES" | "NO",
      carData.ownerId || undefined
    );

    const db = getDb();
    if (!db) {
      return NextResponse.json(
        { success: false, message: "Database connection not available" },
        { status: 500 }
      );
    }

    // Insert car into database
    const result = await db.transaction(async (tx) => {
      const carInsertData = {
        ...carData,
        ...calculation,
        id: undefined, // Let database generate ID
        auction: carData.auction as "Copart" | "IAAI",
        keys: carData.keys as "YES" | "NO" | "UNKNOWN",
        insurance: carData.insurance as "YES" | "NO",
        originPort: carData.originPort as "NJ" | "TX" | "GA" | "CA",
        bodyType: carData.bodyType as "SEDAN" | "ATV" | "SUV" | "PICKUP" | "BIKE",
        fuelType: carData.fuelType as "GASOLINE" | "HYBRID_ELECTRIC",
        title: carData.title as "YES" | "NO" | "PENDING",
        shippingStatus: carData.shippingStatus as
          | "AUCTION"
          | "INNER_TRANSIT"
          | "WAREHOUSE"
          | "LOADED"
          | "SAILING"
          | "DELIVERED",
      };

      const [insertedCar] = await tx
        .insert(cars)
        .values(carInsertData)
        .returning({ vin: cars.vin });
      return insertedCar.vin;
    });

    console.log("API: Car added successfully", { vin: result });

    // Handle image uploads
    const imageTypes = ["auction_images", "pick_up_images", "warehouse_images", "delivery_images"];
    const uploadedImages = [];

    console.log("API: Starting image upload process");

    for (const imageType of imageTypes) {
      const files = formData.getAll(`${imageType}[]`) as File[];
      console.log(`API: Found ${files.length} files for ${imageType}`);

      for (const file of files) {
        if (file && file.size > 0) {
          try {
            console.log(`API: Processing ${file.name} (${file.size} bytes) for ${imageType}`);

            // Convert file to buffer
            const buffer = await file.arrayBuffer();
            const imageData = {
              vin: result,
              buffer: Array.from(new Uint8Array(buffer)),
              size: file.size,
              name: file.name,
              type: imageType.replace("_images", "").toUpperCase() as
                | "AUCTION"
                | "WAREHOUSE"
                | "DELIVERED"
                | "PICK_UP",
            };

            console.log(`API: Uploading to /api/images/${result}`, {
              type: imageData.type,
              size: imageData.size,
              name: imageData.name,
            });

            // Upload to image API
            const imageResponse = await fetch(`${request.nextUrl.origin}/api/images/${result}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ images: [imageData] }),
            });

            const imageResult = await imageResponse.json();
            console.log(`API: Image upload response:`, imageResult);

            if (imageResponse.ok) {
              uploadedImages.push({ type: imageType, name: file.name, success: true });
              console.log(`API: Successfully uploaded ${file.name} (${imageType})`);
            } else {
              console.error(`API: Failed to upload ${file.name} (${imageType}):`, imageResult);
              uploadedImages.push({ type: imageType, name: file.name, success: false });
            }
          } catch (error) {
            console.error(`API: Error uploading ${file.name} (${imageType}):`, error);
            uploadedImages.push({ type: imageType, name: file.name, success: false });
          }
        } else {
          console.log(`API: Skipping empty file ${file.name} for ${imageType}`);
        }
      }
    }

    console.log(
      `API: Image upload completed. Success: ${uploadedImages.filter((img) => img.success).length}, Failed: ${uploadedImages.filter((img) => !img.success).length}`
    );

    // Revalidate relevant paths
    revalidatePath("/admin/cars");
    revalidatePath("/dashboard");

    return NextResponse.json({
      success: true,
      message: `Car with VIN code ${result} was added successfully`,
      data: {
        vin: result,
        uploadedImages: uploadedImages.filter((img) => img.success).length,
        failedImages: uploadedImages.filter((img) => !img.success).length,
      },
    });
  } catch (error) {
    console.error("API: Car creation error:", error);

    let errorMessage = "An error occurred while adding the car";

    if (error instanceof Error) {
      const errorStr = error.message;

      if (errorStr.includes("SQLITE_CONSTRAINT")) {
        if (errorStr.includes("FOREIGN KEY constraint failed")) {
          if (errorStr.includes("owner_id")) {
            errorMessage =
              "Invalid owner ID provided. Please select a valid user or leave owner field empty.";
          } else {
            errorMessage =
              "Database constraint violation. Please check all required fields and relationships.";
          }
        } else if (errorStr.includes("UNIQUE constraint failed")) {
          if (errorStr.includes("vin")) {
            errorMessage = "A car with this VIN already exists in the database.";
          } else {
            errorMessage = "Duplicate entry detected. Please check for duplicate values.";
          }
        } else if (errorStr.includes("NOT NULL constraint failed")) {
          errorMessage = "Required field is missing. Please fill in all required fields.";
        }
      } else if (errorStr.includes("Validation error")) {
        errorMessage = "Invalid data provided. Please check all field values.";
      }
    }

    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}
