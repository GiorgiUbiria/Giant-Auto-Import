"use server";

import { eq } from "drizzle-orm";
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

    try {
      const keys = await db
        .select({
          imageKey: images.imageKey,
          imageType: images.imageType,
        })
        .from(images)
        .where(eq(images.carVin, vin));

      return keys.length ? keys : [];
    } catch (error) {
      console.error("Error fetching images:", error);
      throw new Error("Failed to fetch images");
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
    const isMain = await db
      .select({
        imageKey: images.imageKey,
      })
      .from(images)
      .where(eq(images.priority, true));

    if (isMain.length === 0) {
      await db
        .update(images)
        .set({
          priority: true,
        })
        .where(eq(images.imageKey, imageKey));
    } else {
      await db.transaction(async (tx) => {
        await tx
          .update(images)
          .set({ priority: null })
          .where(eq(images.imageKey, isMain[0].imageKey!));
        await tx
          .update(images)
          .set({ priority: true })
          .where(eq(images.imageKey, imageKey));
      });
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
