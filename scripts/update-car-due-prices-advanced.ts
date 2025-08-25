#!/usr/bin/env tsx

/**
 * Advanced script to update due prices for all cars based on their fee prices
 * This version also considers custom pricing configurations for each user
 * 
 * This script:
 * 1. Fetches all cars from the database
 * 2. Gets custom pricing configurations for each car's owner
 * 3. Calculates new due amounts using the calculateDueAmounts utility with custom pricing
 * 4. Updates each car with the calculated due amounts
 * 5. Provides detailed progress reporting and error handling
 */

import "dotenv/config";
import { db } from "../src/lib/drizzle/db";
import { cars, userPricingConfig, defaultPricingConfig } from "../src/lib/drizzle/schema";
import { calculateDueAmounts } from "../src/lib/calculator-utils";
import { eq, and } from "drizzle-orm";

interface CarData {
  vin: string;
  ownerId: string | null;
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

interface CustomPricing {
  groundFeeAdjustment: number;
  pickupSurcharge: number;
  serviceFee: number;
  hybridSurcharge: number;
}

async function getCustomPricing(userId: string | null): Promise<CustomPricing | null> {
  if (!userId) {
    // Try to get default pricing
    const defaultPricing = await db.query.defaultPricingConfig.findFirst({
      where: eq(defaultPricingConfig.isActive, true),
    });
    
    if (defaultPricing) {
      return {
        groundFeeAdjustment: defaultPricing.groundFeeAdjustment || 0,
        pickupSurcharge: defaultPricing.pickupSurcharge || 0,
        serviceFee: defaultPricing.serviceFee || 0,
        hybridSurcharge: defaultPricing.hybridSurcharge || 0,
      };
    }
    return null;
  }

  // Get user-specific pricing
  const userPricing = await db.query.userPricingConfig.findFirst({
    where: and(
      eq(userPricingConfig.userId, userId),
      eq(userPricingConfig.isActive, true)
    ),
  });

  if (userPricing) {
    return {
      groundFeeAdjustment: userPricing.groundFeeAdjustment || 0,
      pickupSurcharge: userPricing.pickupSurcharge || 0,
      serviceFee: userPricing.serviceFee || 0,
      hybridSurcharge: userPricing.hybridSurcharge || 0,
    };
  }

  // Fallback to default pricing
  const defaultPricing = await db.query.defaultPricingConfig.findFirst({
    where: eq(defaultPricingConfig.isActive, true),
  });
  
  if (defaultPricing) {
    return {
      groundFeeAdjustment: defaultPricing.groundFeeAdjustment || 0,
      pickupSurcharge: defaultPricing.pickupSurcharge || 0,
      serviceFee: defaultPricing.serviceFee || 0,
      hybridSurcharge: defaultPricing.hybridSurcharge || 0,
    };
  }

  return null;
}

async function updateCarDuePricesAdvanced() {
  console.log("🚗 Starting advanced car due prices update...\n");

  try {
    // Fetch all cars from the database
    console.log("📊 Fetching all cars from database...");
    const allCars = await db.query.cars.findMany({
      columns: {
        vin: true,
        ownerId: true,
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
    let customPricingCount = 0;
    const errors: Array<{ vin: string; error: string }> = [];

    // Process each car
    for (let i = 0; i < allCars.length; i++) {
      const car = allCars[i];
      const progress = ((i + 1) / allCars.length * 100).toFixed(1);
      
      console.log(`[${progress}%] Processing car ${i + 1}/${allCars.length}: ${car.vin}`);

      try {
        // Get custom pricing for this car's owner
        const customPricing = await getCustomPricing(car.ownerId);
        if (customPricing) {
          customPricingCount++;
          console.log(`  📋 Using custom pricing for user ${car.ownerId}`);
        }

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
          customPricing || undefined,
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

        if (customPricing) {
          console.log(`  💰 Custom pricing applied: Ground +${customPricing.groundFeeAdjustment}, Pickup +${customPricing.pickupSurcharge}, Service +${customPricing.serviceFee}, Hybrid +${customPricing.hybridSurcharge}`);
        }

      } catch (error) {
        errorCount++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push({ vin: car.vin, error: errorMessage });
        console.log(`  ❌ Error: ${errorMessage}`);
      }

      console.log(""); // Empty line for readability
    }

    // Summary
    console.log("=".repeat(80));
    console.log("📋 ADVANCED UPDATE SUMMARY");
    console.log("=".repeat(80));
    console.log(`Total cars processed: ${allCars.length}`);
    console.log(`Successfully updated: ${updatedCount}`);
    console.log(`Cars with custom pricing: ${customPricingCount}`);
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
      
      if (customPricingCount > 0) {
        console.log(`\n💰 Custom pricing was applied to ${customPricingCount} cars based on user configurations.`);
      }
    }

  } catch (error) {
    console.error("💥 Fatal error during update:", error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  updateCarDuePricesAdvanced()
    .then(() => {
      console.log("\n🎉 Advanced script completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Advanced script failed:", error);
      process.exit(1);
    });
}
