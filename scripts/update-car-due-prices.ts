#!/usr/bin/env tsx

/**
 * Script to update due prices for all cars based on their fee prices
 * 
 * This script:
 * 1. Fetches all cars from the database
 * 2. Calculates new due amounts using the calculateDueAmounts utility
 * 3. Updates each car with the calculated due amounts
 * 4. Provides progress reporting and error handling
 */

import "dotenv/config";
import { db } from "../src/lib/drizzle/db";
import { cars } from "../src/lib/drizzle/schema";
import { calculateDueAmounts } from "../src/lib/calculator-utils";
import { eq } from "drizzle-orm";

interface CarData {
  vin: string;
  purchaseFee: number | null;
  auctionFee: number | null;
  gateFee: number | null;
  titleFee: number | null;
  environmentalFee: number | null;
  virtualBidFee: number | null;
  shippingFee: number | null;
  groundFee: number | null;
  oceanFee: number | null;
  totalFee: number | null;
  fuelType: string | null;
}

async function updateCarDuePrices() {
  console.log("🚗 Starting car due prices update...\n");

  try {
    // Fetch all cars from the database
    console.log("📊 Fetching all cars from database...");
    const allCars = await db.query.cars.findMany({
      columns: {
        vin: true,
        purchaseFee: true,
        auctionFee: true,
        gateFee: true,
        titleFee: true,
        environmentalFee: true,
        virtualBidFee: true,
        shippingFee: true,
        groundFee: true,
        oceanFee: true,
        totalFee: true,
        fuelType: true,
      },
    });

    console.log(`✅ Found ${allCars.length} cars to process\n`);

    if (allCars.length === 0) {
      console.log("No cars found in database. Exiting.");
      return;
    }

    let updatedCount = 0;
    let errorCount = 0;
    const errors: Array<{ vin: string; error: string }> = [];

    // Process each car
    for (let i = 0; i < allCars.length; i++) {
      const car = allCars[i];
      const progress = ((i + 1) / allCars.length * 100).toFixed(1);

      console.log(`[${progress}%] Processing car ${i + 1}/${allCars.length}: ${car.vin}`);

      try {
        // Calculate new due amounts
        const { purchaseDue, shippingDue, totalDue } = calculateDueAmounts(
          {
            purchaseFee: car.purchaseFee || 0,
            auctionFee: car.auctionFee || 0,
            gateFee: car.gateFee || 0,
            titleFee: car.titleFee || 0,
            environmentalFee: car.environmentalFee || 0,
            virtualBidFee: car.virtualBidFee || 0,
            shippingFee: car.shippingFee || 0,
            groundFee: car.groundFee || 0,
            oceanFee: car.oceanFee || 0,
            totalFee: car.totalFee || 0,
          },
          undefined, // No custom pricing for now
          car.fuelType || undefined
        );

        // Update the car in the database
        await db.update(cars)
          .set({
            purchaseDue,
            shippingDue,
            totalDue,
            paidAmount: 0, // Reset paid amount to 0 for existing cars
          })
          .where(eq(cars.vin, car.vin));

        updatedCount++;
        console.log(`  ✅ Updated: Purchase Due: $${purchaseDue}, Shipping Due: $${shippingDue}, Total Due: $${totalDue}`);

      } catch (error) {
        errorCount++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push({ vin: car.vin, error: errorMessage });
        console.log(`  ❌ Error: ${errorMessage}`);
      }

      console.log(""); // Empty line for readability
    }

    // Summary
    console.log("=".repeat(60));
    console.log("📋 UPDATE SUMMARY");
    console.log("=".repeat(60));
    console.log(`Total cars processed: ${allCars.length}`);
    console.log(`Successfully updated: ${updatedCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log(`Success rate: ${((updatedCount / allCars.length) * 100).toFixed(1)}%`);

    if (errors.length > 0) {
      console.log("\n❌ ERRORS ENCOUNTERED:");
      errors.forEach(({ vin, error }) => {
        console.log(`  ${vin}: ${error}`);
      });
    }

    if (updatedCount > 0) {
      console.log("\n✅ Due prices have been updated successfully!");
      console.log("Note: All cars now have paidAmount set to 0. You may want to review and adjust this manually if needed.");
    }

  } catch (error) {
    console.error("💥 Fatal error during update:", error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  updateCarDuePrices()
    .then(() => {
      console.log("\n🎉 Script completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Script failed:", error);
      process.exit(1);
    });
}
