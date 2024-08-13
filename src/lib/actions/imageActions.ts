"use server";

import { db } from "../drizzle/db";
import { images } from "../drizzle/schema";
import { ActionResult } from "@/lib/utils";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { deleteObjectFromBucket, fetchImageForDisplay, fetchImagesForDisplay } from "./bucketActions";
import { createServerAction } from "zsa";
import { z } from "zod";

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

export async function deleteImage(imageKey: string): Promise<ActionResult> {
  try {
    await deleteObjectFromBucket(imageKey);
    await db.delete(images).where(eq(images.imageKey, imageKey));

    revalidatePath("/admin/edit");

    return {
      success: true,
      message: "Image deleted successfully"
    };
  } catch (error) {
    console.error("Error deleting image:", error);
    return {
      success: false,
      error: "Error deleting image",
    };
  }
}

export async function makeMain(key: string, vin: string) {
  console.log("Making main", key, vin)
  try {
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
        .where(eq(images.imageKey, key))
    } else {
      await db
        .transaction(async (tx) => {
          await tx.update(images).set({ priority: null }).where(eq(images.imageKey, isMain[0].imageKey!));
          await tx.update(images).set({ priority: true }).where(eq(images.imageKey, key));
        })
    }

  } catch (error) {
    console.error(error)
  } finally {
    revalidatePath("/admin/edit")
    revalidatePath("/car/" + vin)
  }
}
