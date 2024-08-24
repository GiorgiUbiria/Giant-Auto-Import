"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { createServerAction } from "zsa";
import { db } from "../drizzle/db";
import { images } from "../drizzle/schema";
import { isAdminProcedure } from "./authProcedures";
import { deleteObjectFromBucket, fetchImageForDisplay, fetchImagesForDisplay, cleanUpBucketForVin } from "./bucketActions";

export const getImagesAction = createServerAction()
  .input(z.object({
    vin: z.string(),
  }))
  .output(z.array(z.object({
    carVin: z.string(),
    imageType: z.enum(["WAREHOUSE", "PICK_UP", "DELIVERED", "AUCTION"]),
    priority: z.boolean().nullable(),
    imageKey: z.string(),
    url: z.string(),
  })))
  .handler(async ({ input }) => {
    const { vin } = input;

    try {
      const query = await fetchImagesForDisplay(vin);

      return query.length ? query : [];
    } catch (error) {
      console.error("Error fetching images:", error);
      throw new Error("Failed to fetch images");
    }
  });

export const getImageKeys = createServerAction()
  .input(z.object({
    vin: z.string(),
  }))
  .output(z.array(z.object({
    imageKey: z.string(),
    imageType: z.enum(["WAREHOUSE", "PICK_UP", "DELIVERED", "AUCTION"]),
  })))
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
  .input(z.object({
    vin: z.string(),
  }))
  .output(z.object({
    carVin: z.string(),
    imageType: z.enum(["WAREHOUSE", "PICK_UP", "DELIVERED", "AUCTION"]),
    priority: z.boolean().nullable(),
    imageKey: z.string(),
    url: z.string(),
  }).nullable())
  .handler(async ({ input }) => {
    const { vin } = input;
    try {
      const query = await fetchImageForDisplay(vin);

      return query;
    } catch (error) {
      console.error("Error fetching image:", error);
      throw new Error("Failed to fetch image");
    }
  });

export const deleteImageAction = isAdminProcedure
  .createServerAction()
  .input(z.object({
    imageKey: z.string()
  }))
  .handler(async ({ input }) => {
    const { imageKey } = input;
    await deleteObjectFromBucket(imageKey);
    await db.delete(images).where(eq(images.imageKey, imageKey));
  });

export const makeImageMainAction = isAdminProcedure
  .createServerAction()
  .input(z.object({
    imageKey: z.string(),
  }))
  .handler(async ({ input }) => {
    const { imageKey } = input;
    const isMain = await db
      .select({
        imageKey: images.imageKey
      })
      .from(images)
      .where(eq(images.priority, true))

    if (isMain.length === 0) {
      await db
        .update(images)
        .set({
          priority: true,
        })
        .where(eq(images.imageKey, imageKey))
    } else {
      await db
        .transaction(async (tx) => {
          await tx.update(images).set({ priority: null }).where(eq(images.imageKey, isMain[0].imageKey!));
          await tx.update(images).set({ priority: true }).where(eq(images.imageKey, imageKey));
        })
    }
  });

export const removeAllImagesAction = isAdminProcedure
  .createServerAction()
  .input(z.object({
    vin: z.string(),
  }))
  .output(z.object({
    success: z.boolean(),
    message: z.string(),
  }))
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