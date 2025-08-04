"use server";

import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { createServerAction } from "zsa";
import { db } from "../drizzle/db";
import { images } from "../drizzle/schema";
import { isAdminProcedure } from "./authProcedures";
import {
  deleteObjectFromBucket,
  fetchImageForDisplay,
  fetchImagesForDisplay,
  cleanUpBucketForVin,
} from "./bucketActions";

export const getImagesAction = createServerAction()
  .input(
    z.object({
      vin: z.string(),
    })
  )
  .output(
    z.array(
      z.object({
        carVin: z.string(),
        imageType: z.enum(["WAREHOUSE", "PICK_UP", "DELIVERED", "AUCTION"]),
        priority: z.boolean().nullable(),
        imageKey: z.string(),
        url: z.string(),
      })
    )
  )
  .handler(async ({ input }) => {
    const { vin } = input;

    console.log("getImagesAction: Input received", { vin });

    try {
      console.log("getImagesAction: Fetching images for VIN", vin);
      const query = await fetchImagesForDisplay(vin);
      console.log("getImagesAction: Images fetch completed", { count: query.length, vin });
      return query.length ? query : [];
    } catch (error) {
      console.error("getImagesAction: Error fetching images", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        vin
      });
      return [];
    }
  });

export const getImageKeys = createServerAction()
  .input(
    z.object({
      vin: z.string(),
    })
  )
  .output(
    z.array(
      z.object({
        imageKey: z.string(),
        imageType: z.enum(["WAREHOUSE", "PICK_UP", "DELIVERED", "AUCTION"]),
      })
    )
  )
  .handler(async ({ input }) => {
    const { vin } = input;

    console.log("getImageKeys: Input received", { vin });

    try {
      console.log("getImageKeys: Fetching image keys for VIN", vin);
      const keys = await db
        .select({
          imageKey: images.imageKey,
          imageType: images.imageType,
        })
        .from(images)
        .where(eq(images.carVin, vin));

      console.log("getImageKeys: Query completed", { count: keys.length, vin });
      return keys.length ? keys : [];
    } catch (error) {
      console.error("getImageKeys: Error fetching image keys", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        vin
      });
      // Return empty array instead of throwing to prevent 500 errors
      return [];
    }
  });

export const getImageAction = createServerAction()
  .input(
    z.object({
      vin: z.string(),
    })
  )
  .output(
    z
      .object({
        carVin: z.string(),
        imageType: z.enum(["WAREHOUSE", "PICK_UP", "DELIVERED", "AUCTION"]),
        priority: z.boolean().nullable(),
        imageKey: z.string(),
        url: z.string(),
      })
      .nullable()
  )
  .handler(async ({ input }) => {
    const { vin } = input;

    console.log("getImageAction: Input received", { vin });

    if (!process.env.CLOUDFLARE_API_ENDPOINT ||
      !process.env.CLOUDFLARE_ACCESS_KEY_ID ||
      !process.env.CLOUDFLARE_SECRET_ACCESS_KEY ||
      !process.env.CLOUDFLARE_BUCKET_NAME) {
      console.error("getImageAction: Missing Cloudflare R2 environment variables", {
        endpoint: !!process.env.CLOUDFLARE_API_ENDPOINT,
        accessKey: !!process.env.CLOUDFLARE_ACCESS_KEY_ID,
        secretKey: !!process.env.CLOUDFLARE_SECRET_ACCESS_KEY,
        bucket: !!process.env.CLOUDFLARE_BUCKET_NAME
      });
      return null; // Return null instead of throwing
    }

    try {
      console.log("getImageAction: Fetching image for VIN", vin);
      const query = await fetchImageForDisplay(vin);
      console.log("getImageAction: Image fetch completed", { found: !!query, vin });
      return query;
    } catch (error) {
      console.error("getImageAction: Error fetching image", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        vin
      });
      return null;
    }
  });

export const deleteImageAction = isAdminProcedure
  .createServerAction()
  .input(
    z.object({
      imageKey: z.string(),
    })
  )
  .handler(async ({ input }) => {
    const { imageKey } = input;
    await deleteObjectFromBucket(imageKey);
    await db.delete(images).where(eq(images.imageKey, imageKey));
  });

export const makeImageMainAction = isAdminProcedure
  .createServerAction()
  .input(
    z.object({
      imageKey: z.string(),
    })
  )
  .handler(async ({ input }) => {
    const { imageKey } = input;

    try {
      console.log("makeImageMainAction: Starting priority update", { imageKey });

      // First, get the car VIN for this image to scope the priority update
      const imageInfo = await db
        .select({
          carVin: images.carVin,
          imageKey: images.imageKey,
        })
        .from(images)
        .where(eq(images.imageKey, imageKey));

      if (imageInfo.length === 0) {
        console.error("makeImageMainAction: Image not found", { imageKey });
        throw new Error("Image not found");
      }

      const carVin = imageInfo[0].carVin;
      console.log("makeImageMainAction: Found car VIN", { imageKey, carVin });

      // Use transaction to ensure atomicity
      await db.transaction(async (tx) => {
        // First, reset all priorities for this car to false
        await tx
          .update(images)
          .set({ priority: false })
          .where(eq(images.carVin, carVin));

        // Then set the selected image as priority
        await tx
          .update(images)
          .set({ priority: true })
          .where(eq(images.imageKey, imageKey));
      });

      console.log("makeImageMainAction: Priority update completed successfully", { imageKey, carVin });
    } catch (error) {
      console.error("makeImageMainAction: Error updating priority", {
        imageKey,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  });

export const removeAllImagesAction = isAdminProcedure
  .createServerAction()
  .input(
    z.object({
      vin: z.string(),
    })
  )
  .output(
    z.object({
      success: z.boolean(),
      message: z.string(),
    })
  )
  .handler(async ({ input }) => {
    const { vin } = input;

    try {
      await db.delete(images).where(eq(images.carVin, vin));

      await cleanUpBucketForVin(vin);

      return {
        success: true,
        message: `All images for VIN ${vin} have been removed successfully.`,
      };
    } catch (error) {
      console.error(`Error removing images for VIN ${vin}:`, error);
      return {
        success: false,
        message: `Failed to remove images for VIN ${vin}.`,
      };
    }
  });
