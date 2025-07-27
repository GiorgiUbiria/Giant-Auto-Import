"use server";

import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "../drizzle/db";
import {
  userPricingConfig,
  defaultPricingConfig,
  csvDataVersions,
  insertUserPricingConfigSchema,
  selectUserPricingConfigSchema,
  insertDefaultPricingConfigSchema,
  selectDefaultPricingConfigSchema,
  insertCsvDataVersionSchema,
  selectCsvDataVersionSchema,
} from "../drizzle/schema";
import { isAdminProcedure, authedProcedure } from "./authProcedures";
import { createServerAction } from "zsa";
import { parseCsvToJson, validateCsvFormat } from "../csv-utils";

// Schema for updating user pricing
const UpdateUserPricingSchema = z.object({
  userId: z.string(),
  oceanFee: z.number().min(0),
  groundFeeAdjustment: z.number(),
  pickupSurcharge: z.number().min(0),
  serviceFee: z.number().min(0),
  hybridSurcharge: z.number().min(0),
});

// Schema for updating default pricing
const UpdateDefaultPricingSchema = z.object({
  oceanFee: z.number().min(0),
  groundFeeAdjustment: z.number(),
  pickupSurcharge: z.number().min(0),
  serviceFee: z.number().min(0),
  hybridSurcharge: z.number().min(0),
});

// Schema for uploading CSV data
const UploadCsvSchema = z.object({
  versionName: z.string().min(1),
  csvContent: z.string().min(1),
  description: z.string().optional(),
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
            oceanFee: input.oceanFee,
            groundFeeAdjustment: input.groundFeeAdjustment,
            pickupSurcharge: input.pickupSurcharge,
            serviceFee: input.serviceFee,
            hybridSurcharge: input.hybridSurcharge,
            updatedAt: new Date(),
          })
          .where(eq(userPricingConfig.id, existingConfig.id));
      } else {
        // Create new config
        await db.insert(userPricingConfig).values({
          userId: input.userId,
          oceanFee: input.oceanFee,
          groundFeeAdjustment: input.groundFeeAdjustment,
          pickupSurcharge: input.pickupSurcharge,
          serviceFee: input.serviceFee,
          hybridSurcharge: input.hybridSurcharge,
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
            oceanFee: input.oceanFee,
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
          oceanFee: input.oceanFee,
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
        message: "CSV data uploaded and activated successfully",
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