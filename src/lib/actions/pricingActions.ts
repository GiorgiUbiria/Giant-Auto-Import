"use server";

import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "../drizzle/db";
import {
  userPricingConfig,
  defaultPricingConfig,
  csvDataVersions,
  oceanShippingRates,
  insertUserPricingConfigSchema,
  selectUserPricingConfigSchema,
  insertDefaultPricingConfigSchema,
  selectDefaultPricingConfigSchema,
  insertCsvDataVersionSchema,
  selectCsvDataVersionSchema,
  insertOceanShippingRatesSchema,
  selectOceanShippingRatesSchema,
} from "../drizzle/schema";
import { isAdminProcedure, authedProcedure } from "./authProcedures";
import { createServerAction } from "zsa";
import { parseCsvToJson, validateCsvFormat } from "../csv-utils";
import { calculateCarFeesWithUserPricing } from "../calculator-utils";
import { cars } from "../drizzle/schema";

// Schema for ocean rate
const OceanRateSchema = z.object({
  state: z.string(),
  shorthand: z.string(),
  rate: z.number().min(0),
});

// Schema for updating user pricing
const UpdateUserPricingSchema = z.object({
  userId: z.string(),
  oceanRates: z.array(OceanRateSchema),
  groundFeeAdjustment: z.number(),
  pickupSurcharge: z.number().min(0),
  serviceFee: z.number().min(0),
  hybridSurcharge: z.number().min(0),
  // Allow toggling whether custom pricing is active for this user
  isActive: z.boolean().optional(),
});

// Schema for updating default pricing
const UpdateDefaultPricingSchema = z.object({
  oceanRates: z.array(OceanRateSchema),
  groundFeeAdjustment: z.number(),
  pickupSurcharge: z.number().min(0),
  serviceFee: z.number().min(0),
  hybridSurcharge: z.number().min(0),
});

// Schema for managing ocean shipping rates
const OceanRateInputSchema = z.object({
  state: z.string(),
  shorthand: z.string(),
  rate: z.number().min(0),
});

// Schema for uploading CSV data
const UploadCsvSchema = z.object({
  versionName: z.string().min(1),
  csvContent: z.string().min(1),
  description: z.string().optional(),
});

/**
 * Get all active ocean shipping rates
 */
export const getOceanShippingRatesAction = isAdminProcedure
  .createServerAction()
  .output(
    z.object({
      success: z.boolean(),
      data: z.array(selectOceanShippingRatesSchema),
      message: z.string().optional(),
    })
  )
  .handler(async () => {
    try {
      const rates = await db
        .select()
        .from(oceanShippingRates)
        .where(eq(oceanShippingRates.isActive, true))
        .orderBy(oceanShippingRates.state);

      return {
        success: true,
        data: rates,
        message: "Ocean shipping rates fetched successfully",
      };
    } catch (error) {
      console.error("Error fetching ocean shipping rates:", error);
      return {
        success: false,
        data: [],
        message: "Failed to fetch ocean shipping rates",
      };
    }
  });

/**
 * Add new ocean shipping rate
 */
export const addOceanShippingRateAction = isAdminProcedure
  .createServerAction()
  .input(OceanRateInputSchema)
  .output(
    z.object({
      success: z.boolean(),
      message: z.string(),
    })
  )
  .handler(async ({ input }) => {
    try {
      await db.insert(oceanShippingRates).values({
        state: input.state,
        shorthand: input.shorthand,
        rate: input.rate,
      });

      revalidatePath("/admin/pricing");

      return {
        success: true,
        message: "Ocean shipping rate added successfully",
      };
    } catch (error) {
      console.error("Error adding ocean shipping rate:", error);
      return {
        success: false,
        message: "Failed to add ocean shipping rate",
      };
    }
  });

/**
 * Update ocean shipping rate
 */
export const updateOceanShippingRateAction = isAdminProcedure
  .createServerAction()
  .input(z.object({
    id: z.number(),
    state: z.string(),
    shorthand: z.string(),
    rate: z.number().min(0),
  }))
  .output(
    z.object({
      success: z.boolean(),
      message: z.string(),
    })
  )
  .handler(async ({ input }) => {
    try {
      await db
        .update(oceanShippingRates)
        .set({
          state: input.state,
          shorthand: input.shorthand,
          rate: input.rate,
          updatedAt: new Date(),
        })
        .where(eq(oceanShippingRates.id, input.id));

      revalidatePath("/admin/pricing");

      return {
        success: true,
        message: "Ocean shipping rate updated successfully",
      };
    } catch (error) {
      console.error("Error updating ocean shipping rate:", error);
      return {
        success: false,
        message: "Failed to update ocean shipping rate",
      };
    }
  });

/**
 * Delete ocean shipping rate
 */
export const deleteOceanShippingRateAction = isAdminProcedure
  .createServerAction()
  .input(z.object({ id: z.number() }))
  .output(
    z.object({
      success: z.boolean(),
      message: z.string(),
    })
  )
  .handler(async ({ input }) => {
    try {
      await db
        .delete(oceanShippingRates)
        .where(eq(oceanShippingRates.id, input.id));

      revalidatePath("/admin/pricing");

      return {
        success: true,
        message: "Ocean shipping rate deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting ocean shipping rate:", error);
      return {
        success: false,
        message: "Failed to delete ocean shipping rate",
      };
    }
  });

/**
 * Get user pricing configuration
 */
export const getUserPricingAction = isAdminProcedure
  .createServerAction()
  .input(z.object({ userId: z.string() }))
  .output(
    z.object({
      success: z.boolean(),
      data: selectUserPricingConfigSchema.nullable(),
      message: z.string().optional(),
    })
  )
  .handler(async ({ input }) => {
    try {
      const [config] = await db
        .select()
        .from(userPricingConfig)
        .where(and(eq(userPricingConfig.userId, input.userId), eq(userPricingConfig.isActive, true)))
        .limit(1);

      return {
        success: true,
        data: config || null,
        message: config ? "User pricing configuration found" : "No user pricing configuration found",
      };
    } catch (error) {
      console.error("Error fetching user pricing:", error);
      return {
        success: false,
        data: null,
        message: "Failed to fetch user pricing configuration",
      };
    }
  });

/**
 * Update or create user pricing configuration
 */
export const updateUserPricingAction = isAdminProcedure
  .createServerAction()
  .input(UpdateUserPricingSchema)
  .output(
    z.object({
      success: z.boolean(),
      message: z.string(),
    })
  )
  .handler(async ({ input, ctx }) => {
    try {
      // Check if user pricing config already exists
      const [existingConfig] = await db
        .select()
        .from(userPricingConfig)
        .where(eq(userPricingConfig.userId, input.userId))
        .limit(1);

      if (existingConfig) {
        // Update existing config
        await db
          .update(userPricingConfig)
          .set({
            oceanRates: input.oceanRates,
            groundFeeAdjustment: input.groundFeeAdjustment,
            pickupSurcharge: input.pickupSurcharge,
            serviceFee: input.serviceFee,
            hybridSurcharge: input.hybridSurcharge,
            ...(typeof input.isActive === 'boolean' ? { isActive: input.isActive } : {}),
            updatedAt: new Date(),
          })
          .where(eq(userPricingConfig.id, existingConfig.id));
      } else {
        // Create new config
        await db.insert(userPricingConfig).values({
          userId: input.userId,
          oceanRates: input.oceanRates,
          groundFeeAdjustment: input.groundFeeAdjustment,
          pickupSurcharge: input.pickupSurcharge,
          serviceFee: input.serviceFee,
          hybridSurcharge: input.hybridSurcharge,
          ...(typeof input.isActive === 'boolean' ? { isActive: input.isActive } : {}),
        });
      }

      revalidatePath(`/admin/users/${input.userId}`);
      revalidatePath("/admin/pricing");

      return {
        success: true,
        message: "User pricing configuration updated successfully",
      };
    } catch (error) {
      console.error("Error updating user pricing:", error);
      return {
        success: false,
        message: "Failed to update user pricing configuration",
      };
    }
  });

/**
 * Get default pricing configuration
 */
export const getDefaultPricingAction = isAdminProcedure
  .createServerAction()
  .output(
    z.object({
      success: z.boolean(),
      data: selectDefaultPricingConfigSchema.nullable(),
      message: z.string().optional(),
    })
  )
  .handler(async () => {
    try {
      const [config] = await db
        .select()
        .from(defaultPricingConfig)
        .where(eq(defaultPricingConfig.isActive, true))
        .limit(1);

      return {
        success: true,
        data: config || null,
        message: config ? "Default pricing configuration found" : "No default pricing configuration found",
      };
    } catch (error) {
      console.error("Error fetching default pricing:", error);
      return {
        success: false,
        data: null,
        message: "Failed to fetch default pricing configuration",
      };
    }
  });

/**
 * Update default pricing configuration
 */
export const updateDefaultPricingAction = isAdminProcedure
  .createServerAction()
  .input(UpdateDefaultPricingSchema)
  .output(
    z.object({
      success: z.boolean(),
      message: z.string(),
    })
  )
  .handler(async ({ input }) => {
    try {
      // Check if default pricing config already exists
      const [existingConfig] = await db
        .select()
        .from(defaultPricingConfig)
        .where(eq(defaultPricingConfig.isActive, true))
        .limit(1);

      if (existingConfig) {
        // Update existing config
        await db
          .update(defaultPricingConfig)
          .set({
            oceanRates: input.oceanRates,
            groundFeeAdjustment: input.groundFeeAdjustment,
            pickupSurcharge: input.pickupSurcharge,
            serviceFee: input.serviceFee,
            hybridSurcharge: input.hybridSurcharge,
            updatedAt: new Date(),
          })
          .where(eq(defaultPricingConfig.id, existingConfig.id));
      } else {
        // Create new config
        await db.insert(defaultPricingConfig).values({
          oceanRates: input.oceanRates,
          groundFeeAdjustment: input.groundFeeAdjustment,
          pickupSurcharge: input.pickupSurcharge,
          serviceFee: input.serviceFee,
          hybridSurcharge: input.hybridSurcharge,
        });
      }

      revalidatePath("/admin/pricing");

      return {
        success: true,
        message: "Default pricing configuration updated successfully",
      };
    } catch (error) {
      console.error("Error updating default pricing:", error);
      return {
        success: false,
        message: "Failed to update default pricing configuration",
      };
    }
  });

/**
 * Upload CSV data version
 */
export const uploadCsvAction = isAdminProcedure
  .createServerAction()
  .input(UploadCsvSchema)
  .output(
    z.object({
      success: z.boolean(),
      message: z.string(),
      errors: z.array(z.string()).optional(),
    })
  )
  .handler(async ({ input, ctx }) => {
    try {
      // Validate CSV format
      const validation = validateCsvFormat(input.csvContent);
      if (!validation.isValid) {
        return {
          success: false,
          message: "CSV format validation failed",
          errors: validation.errors,
        };
      }

      // Parse CSV to JSON
      const csvData = parseCsvToJson(input.csvContent);
      const csvJsonString = JSON.stringify(csvData);

      // Deactivate all existing active versions
      await db
        .update(csvDataVersions)
        .set({ isActive: false })
        .where(eq(csvDataVersions.isActive, true));

      // Insert new version
      await db.insert(csvDataVersions).values({
        versionName: input.versionName,
        csvData: csvJsonString,
        isActive: true,
        uploadedBy: ctx.user.id,
        description: input.description,
      });

      revalidatePath("/admin/csv-management");

      return {
        success: true,
        message: "CSV data uploaded and activated successfully. Note: You may need to recalculate fees for existing cars manually.",
      };
    } catch (error) {
      console.error("Error uploading CSV:", error);
      return {
        success: false,
        message: "Failed to upload CSV data",
      };
    }
  });

/**
 * Get CSV data versions
 */
export const getCsvVersionsAction = isAdminProcedure
  .createServerAction()
  .output(
    z.object({
      success: z.boolean(),
      data: z.array(selectCsvDataVersionSchema),
      message: z.string().optional(),
    })
  )
  .handler(async () => {
    try {
      const versions = await db
        .select()
        .from(csvDataVersions)
        .orderBy(csvDataVersions.uploadedAt);

      return {
        success: true,
        data: versions,
        message: "CSV versions fetched successfully",
      };
    } catch (error) {
      console.error("Error fetching CSV versions:", error);
      return {
        success: false,
        data: [],
        message: "Failed to fetch CSV versions",
      };
    }
  });

/**
 * Activate specific CSV version
 */
export const activateCsvVersionAction = isAdminProcedure
  .createServerAction()
  .input(z.object({ versionId: z.number() }))
  .output(
    z.object({
      success: z.boolean(),
      message: z.string(),
    })
  )
  .handler(async ({ input }) => {
    try {
      // Deactivate all existing active versions
      await db
        .update(csvDataVersions)
        .set({ isActive: false })
        .where(eq(csvDataVersions.isActive, true));

      // Activate the specified version
      await db
        .update(csvDataVersions)
        .set({ isActive: true })
        .where(eq(csvDataVersions.id, input.versionId));

      revalidatePath("/admin/csv-management");

      return {
        success: true,
        message: "CSV version activated successfully",
      };
    } catch (error) {
      console.error("Error activating CSV version:", error);
      return {
        success: false,
        message: "Failed to activate CSV version",
      };
    }
  });

/**
 * Delete CSV version
 */
export const deleteCsvVersionAction = isAdminProcedure
  .createServerAction()
  .input(z.object({ versionId: z.number() }))
  .output(
    z.object({
      success: z.boolean(),
      message: z.string(),
    })
  )
  .handler(async ({ input }) => {
    try {
      // Check if this is the active version
      const [version] = await db
        .select()
        .from(csvDataVersions)
        .where(eq(csvDataVersions.id, input.versionId))
        .limit(1);

      if (!version) {
        return {
          success: false,
          message: "CSV version not found",
        };
      }

      if (version.isActive) {
        return {
          success: false,
          message: "Cannot delete active CSV version. Please activate another version first.",
        };
      }

      // Delete the version
      await db
        .delete(csvDataVersions)
        .where(eq(csvDataVersions.id, input.versionId));

      revalidatePath("/admin/csv-management");

      return {
        success: true,
        message: "CSV version deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting CSV version:", error);
      return {
        success: false,
        message: "Failed to delete CSV version",
      };
    }
  });

/**
 * Recalculate fees for all cars based on updated CSV data
 */
export const recalculateAllCarFeesAction = isAdminProcedure
  .createServerAction()
  .output(
    z.object({
      success: z.boolean(),
      message: z.string(),
      updatedCount: z.number(),
    })
  )
  .handler(async () => {
    try {
      // Get all cars
      const allCars = await db.select().from(cars);
      let updatedCount = 0;

      for (const car of allCars) {
        try {
          // Recalculate fees for each car
          const calculation = await calculateCarFeesWithUserPricing(
            car.auction,
            car.auctionLocation || "",
            car.originPort,
            car.bodyType,
            car.fuelType,
            car.purchaseFee,
            car.insurance,
            car.ownerId || undefined
          );

          // Update car with new fees
          await db
            .update(cars)
            .set({
              totalFee: calculation.totalFee,
              shippingFee: calculation.shippingFee,
              groundFee: calculation.groundFee,
              oceanFee: calculation.oceanFee,
            })
            .where(eq(cars.id, car.id));

          updatedCount++;
        } catch (error) {
          console.error(`Failed to recalculate fees for car ${car.vin}:`, error);
          // Continue with other cars even if one fails
        }
      }

      revalidatePath("/admin/cars");
      revalidatePath("/dashboard");

      return {
        success: true,
        message: `Successfully recalculated fees for ${updatedCount} cars`,
        updatedCount,
      };
    } catch (error) {
      console.error("Error recalculating car fees:", error);
      return {
        success: false,
        message: "Failed to recalculate car fees",
        updatedCount: 0,
      };
    }
  });

/**
 * Recalculate fees for cars assigned to a specific user
 */
export const recalculateUserCarFeesAction = isAdminProcedure
  .createServerAction()
  .input(z.object({ userId: z.string() }))
  .output(
    z.object({
      success: z.boolean(),
      message: z.string(),
      updatedCount: z.number(),
    })
  )
  .handler(async ({ input }) => {
    try {
      // Get cars assigned to the user
      const userCars = await db
        .select()
        .from(cars)
        .where(eq(cars.ownerId, input.userId));

      let updatedCount = 0;

      for (const car of userCars) {
        try {
          // Recalculate fees for each car
          const calculation = await calculateCarFeesWithUserPricing(
            car.auction,
            car.auctionLocation || "",
            car.originPort,
            car.bodyType,
            car.fuelType,
            car.purchaseFee,
            car.insurance,
            car.ownerId || undefined
          );

          // Update car with new fees
          await db
            .update(cars)
            .set({
              totalFee: calculation.totalFee,
              shippingFee: calculation.shippingFee,
              groundFee: calculation.groundFee,
              oceanFee: calculation.oceanFee,
            })
            .where(eq(cars.id, car.id));

          updatedCount++;
        } catch (error) {
          console.error(`Failed to recalculate fees for car ${car.vin}:`, error);
          // Continue with other cars even if one fails
        }
      }

      revalidatePath(`/admin/users/${input.userId}`);
      revalidatePath("/admin/cars");
      revalidatePath("/dashboard");

      return {
        success: true,
        message: `Successfully recalculated fees for ${updatedCount} cars assigned to user`,
        updatedCount,
      };
    } catch (error) {
      console.error("Error recalculating user car fees:", error);
      return {
        success: false,
        message: "Failed to recalculate user car fees",
        updatedCount: 0,
      };
    }
  });

/**
 * Seed initial ocean shipping rates
 */
export const seedOceanShippingRatesAction = isAdminProcedure
  .createServerAction()
  .output(
    z.object({
      success: z.boolean(),
      message: z.string(),
      seededCount: z.number(),
    })
  )
  .handler(async () => {
    try {
      // Check if rates already exist
      const existingRates = await db
        .select()
        .from(oceanShippingRates)
        .where(eq(oceanShippingRates.isActive, true));

      if (existingRates.length > 0) {
        return {
          success: true,
          message: "Ocean shipping rates already exist",
          seededCount: existingRates.length,
        };
      }

      // Seed initial rates
      const initialRates = [
        { state: "Los Angeles, CA", shorthand: "CA", rate: 1675 },
        { state: "Houston, TX", shorthand: "TX", rate: 1075 },
        { state: "New Jersey, NJ", shorthand: "NJ", rate: 1100 },
        { state: "Savannah, GA", shorthand: "GA", rate: 1025 },
      ];

      await db.insert(oceanShippingRates).values(initialRates);

      revalidatePath("/admin/pricing");

      return {
        success: true,
        message: "Ocean shipping rates seeded successfully",
        seededCount: initialRates.length,
      };
    } catch (error) {
      console.error("Error seeding ocean shipping rates:", error);
      return {
        success: false,
        message: "Failed to seed ocean shipping rates",
        seededCount: 0,
      };
    }
  }); 